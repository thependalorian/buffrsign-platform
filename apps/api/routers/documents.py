from .services.redis_service import redis_service
from .services.task_processor import add_background_task

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    ai_analysis: bool = Form(False),
    current_user_email: str = Depends(verify_token)
):
    # Check cache for user's recent uploads to prevent duplicates
    file_hash = hashlib.md5(await file.read()).hexdigest()
    await file.seek(0)  # Reset file pointer
    
    duplicate_check = redis_service.cache_get(f"upload_hash:{current_user_email}:{file_hash}")
    if duplicate_check:
        raise HTTPException(
            status_code=400,
            detail="This file was recently uploaded. Please wait before uploading again."
        )
    
    # Existing upload logic...
    document_id = str(uuid.uuid4())
    file_path = f"uploads/{document_id}_{file.filename}"
    
    document = {
        "id": document_id,
        "title": title,
        "filename": file.filename,
        "file_path": file_path,
        "file_size": file.size,
        "file_type": file.content_type,
        "file_hash": file_hash,
        "status": "processing",
        "created_by": current_user_email,
        "created_at": datetime.utcnow(),
        "eta_2019_compliant": True,
        "cran_accredited": True,
        "ai_analysis_enabled": ai_analysis
    }
    
    documents_db[document_id] = document
    
    # Cache document for quick access
    redis_service.cache_set(f"document:{document_id}", document, ttl=3600)
    
    # Cache upload hash to prevent duplicates
    redis_service.cache_set(f"upload_hash:{current_user_email}:{file_hash}", document_id, ttl=300)
    
    # Set initial document status in Supabase
    redis_service.update_document_processing_status(
        document_id=document_id,
        processing_type='file_upload',
        status='processing',
        progress=25,
        metadata={'step': 'file_upload'}
    )
    
    # Add background tasks
    if ai_analysis:
        add_background_task('document_processing', {
            'type': 'ai_analysis',
            'document_id': document_id,
            'document_title': title,
            'user_id': current_user_email,
            'file_path': file_path
        })
    
    # Add PDF processing task
    add_background_task('document_processing', {
        'type': 'pdf_processing',
        'document_id': document_id,
        'file_path': file_path
    })
    
    # Add thumbnail generation task
    add_background_task('document_processing', {
        'type': 'generate_thumbnail',
        'document_id': document_id,
        'file_path': file_path
    }, delay=5)  # Delay 5 seconds
    
    # Add audit trail task
    add_background_task('audit_trail', {
        'document_id': document_id,
        'action': 'document_uploaded',
        'user': current_user_email,
        'details': {
            'filename': file.filename,
            'file_size': file.size,
            'ai_analysis': ai_analysis
        }
    })
    
    # Send real-time notification
    redis_service.send_notification(current_user_email, {
        'type': 'document_uploaded',
        'title': 'Document Uploaded',
        'message': f'Document "{title}" has been uploaded and is being processed',
        'document_id': document_id
    })
    
    # Log real-time event to Supabase
    redis_service.log_realtime_event(
        event_type='document_uploaded',
        user_id=current_user_email,
        document_id=document_id,
        event_data={'title': title, 'file_size': file.size},
        ip_address=request.client.host if hasattr(request, 'client') else None,
        user_agent=request.headers.get('User-Agent')
    )
    
    return DocumentResponse(
        id=document["id"],
        title=document["title"],
        status=document["status"],
        created_at=document["created_at"],
        file_size=document["file_size"],
        file_type=document["file_type"],
        eta_2019_compliant=document["eta_2019_compliant"],
        cran_accredited=document["cran_accredited"]
    )

@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    page: int = 1,
    per_page: int = 10,
    status: Optional[str] = None,
    current_user_email: str = Depends(verify_token)
):
    # Try to get from cache first
    cache_key = f"documents_list:{current_user_email}:{page}:{per_page}:{status or 'all'}"
    cached_result = redis_service.cache_get(cache_key)
    
    if cached_result:
        return DocumentListResponse(**cached_result)
    
    # Existing logic for fetching documents...
    user_documents = [
        doc for doc in documents_db.values() 
        if doc["created_by"] == current_user_email
    ]
    
    if status:
        user_documents = [doc for doc in user_documents if doc["status"] == status]
    
    # Pagination
    total = len(user_documents)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_docs = user_documents[start:end]
    
    documents = [
        DocumentResponse(
            id=doc["id"],
            title=doc["title"],
            status=doc["status"],
            created_at=doc["created_at"],
            file_size=doc["file_size"],
            file_type=doc["file_type"],
            eta_2019_compliant=doc["eta_2019_compliant"],
            cran_accredited=doc["cran_accredited"]
        )
        for doc in paginated_docs
    ]
    
    result = DocumentListResponse(
        documents=documents,
        total=total,
        page=page,
        per_page=per_page
    )
    
    # Cache result for 5 minutes
    redis_service.cache_set(cache_key, result.dict(), ttl=300)
    
    return result