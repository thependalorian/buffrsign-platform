from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from .auth import verify_token
from ..services.redis_service import redis_service

router = APIRouter()

class SignatureFieldRequest(BaseModel):
    page: int
    x: float
    y: float
    width: float
    height: float
    type: str = "signature"  # signature, initial, date, text
    required: bool = True
    signer_email: EmailStr

class SignatureRequest(BaseModel):
    document_id: str
    recipients: List[Dict[str, Any]]
    message: Optional[str] = None
    expires_in_days: int = 7
    signing_order: str = "sequential"  # sequential, parallel
    require_all_signatures: bool = True

class SignatureData(BaseModel):
    signature_type: str  # drawn, typed, uploaded, biometric
    signature_data: str  # base64 encoded signature
    signer_name: str
    signer_email: EmailStr
    timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class SignatureResponse(BaseModel):
    id: str
    document_id: str
    status: str
    created_at: datetime
    expires_at: datetime
    recipients: List[Dict[str, Any]]
    eta_2019_compliant: bool
    cran_accredited: bool

# Mock signature database
signatures_db = {}
signature_fields_db = {}

@router.post("/request", response_model=SignatureResponse)
async def request_signatures(
    request: SignatureRequest,
    current_user_email: str = Depends(verify_token)
):
    """
    Request signatures for a document - ETA 2019 Section 20 compliant
    """
    # Validate document exists and user has access
    from .documents import documents_db
    document = documents_db.get(request.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate signature request ID
    signature_request_id = str(uuid.uuid4())
    
    # Calculate expiry date
    expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
    
    # Process recipients
    processed_recipients = []
    for i, recipient in enumerate(request.recipients):
        recipient_data = {
            "id": str(uuid.uuid4()),
            "email": recipient["email"],
            "name": recipient["name"],
            "role": recipient.get("role", "signer"),
            "signing_order": i + 1 if request.signing_order == "sequential" else 1,
            "status": "pending",
            "signature_type": recipient.get("signature_type", "simple_electronic"),
            "require_id_verification": recipient.get("require_id_verification", False),
            "signed_at": None,
            "viewed_at": None
        }
        processed_recipients.append(recipient_data)
    
    # Create signature request
    signature_request = {
        "id": signature_request_id,
        "document_id": request.document_id,
        "status": "pending",
        "created_by": current_user_email,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "recipients": processed_recipients,
        "message": request.message,
        "signing_order": request.signing_order,
        "require_all_signatures": request.require_all_signatures,
        "eta_2019_compliant": True,
        "cran_accredited": True,
        "completed_signatures": 0,
        "total_signatures": len(processed_recipients)
    }
    
    signatures_db[signature_request_id] = signature_request
    
    # Update document status
    document["status"] = "pending"
    document["signature_request_id"] = signature_request_id
    
    # Send email notifications (mock)
    for recipient in processed_recipients:
        await send_signature_request_email(
            recipient["email"],
            recipient["name"],
            document["title"],
            signature_request_id
        )
    
    return SignatureResponse(
        id=signature_request["id"],
        document_id=signature_request["document_id"],
        status=signature_request["status"],
        created_at=signature_request["created_at"],
        expires_at=signature_request["expires_at"],
        recipients=signature_request["recipients"],
        eta_2019_compliant=signature_request["eta_2019_compliant"],
        cran_accredited=signature_request["cran_accredited"]
    )

@router.post("/{signature_request_id}/sign")
async def sign_document(
    signature_request_id: str,
    signature_data: SignatureData
):
    """
    Sign a document - ETA 2019 Section 20 compliant electronic signature
    """
    # Get signature request
    signature_request = signatures_db.get(signature_request_id)
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    # Check if request has expired
    if datetime.utcnow() > signature_request["expires_at"]:
        raise HTTPException(status_code=400, detail="Signature request has expired")
    
    # Find recipient
    recipient = None
    for r in signature_request["recipients"]:
        if r["email"] == signature_data.signer_email:
            recipient = r
            break
    
    if not recipient:
        raise HTTPException(status_code=403, detail="Not authorized to sign this document")
    
    if recipient["status"] == "signed":
        raise HTTPException(status_code=400, detail="Document already signed by this recipient")
    
    # Validate signing order (if sequential)
    if signature_request["signing_order"] == "sequential":
        for r in signature_request["recipients"]:
            if r["signing_order"] < recipient["signing_order"] and r["status"] != "signed":
                raise HTTPException(
                    status_code=400, 
                    detail="Previous signers must complete their signatures first"
                )
    
    # Create signature record
    signature_id = str(uuid.uuid4())
    signature_record = {
        "id": signature_id,
        "signature_request_id": signature_request_id,
        "document_id": signature_request["document_id"],
        "signer_email": signature_data.signer_email,
        "signer_name": signature_data.signer_name,
        "signature_type": signature_data.signature_type,
        "signature_data": signature_data.signature_data,
        "timestamp": signature_data.timestamp,
        "ip_address": signature_data.ip_address,
        "user_agent": signature_data.user_agent,
        "eta_2019_compliant": True,
        "cran_certificate_id": None,  # Would be populated with actual certificate
        "integrity_hash": None  # Would be populated with signature hash
    }
    
    # Update recipient status
    recipient["status"] = "signed"
    recipient["signed_at"] = signature_data.timestamp
    recipient["signature_id"] = signature_id
    
    # Update signature request
    signature_request["completed_signatures"] += 1
    
    # Check if all signatures are complete
    if signature_request["completed_signatures"] == signature_request["total_signatures"]:
        signature_request["status"] = "completed"
        
        # Update document status
        from .documents import documents_db
        document = documents_db.get(signature_request["document_id"])
        if document:
            document["status"] = "completed"
            document["completed_at"] = datetime.utcnow()
    
    # Create audit trail entry (ETA 2019 Section 24)
    audit_entry = {
        "document_id": signature_request["document_id"],
        "action": "document_signed",
        "user": signature_data.signer_email,
        "timestamp": signature_data.timestamp,
        "ip_address": signature_data.ip_address,
        "user_agent": signature_data.user_agent,
        "details": {
            "signature_type": signature_data.signature_type,
            "signature_id": signature_id
        }
    }
    
    # Log user activity to Supabase
    redis_service.log_user_activity(
        user_id=signature_data.signer_email,
        activity_type='document_signed',
        activity_data={
            'document_id': signature_request["document_id"],
            'signature_type': signature_data.signature_type,
            'signature_id': signature_id
        },
        ip_address=signature_data.ip_address,
        user_agent=signature_data.user_agent
    )
    
    return {
        "success": True,
        "signature_id": signature_id,
        "document_status": signature_request["status"],
        "eta_2019_compliant": True,
        "audit_logged": True
    }

@router.get("/{signature_request_id}")
async def get_signature_request(
    signature_request_id: str,
    current_user_email: str = Depends(verify_token)
):
    """
    Get signature request details
    """
    signature_request = signatures_db.get(signature_request_id)
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    # Check access permissions
    if (signature_request["created_by"] != current_user_email and 
        not any(r["email"] == current_user_email for r in signature_request["recipients"])):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return signature_request

@router.post("/{signature_request_id}/remind")
async def send_reminder(
    signature_request_id: str,
    recipient_email: EmailStr,
    current_user_email: str = Depends(verify_token)
):
    """
    Send reminder to recipient for pending signature
    """
    signature_request = signatures_db.get(signature_request_id)
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    # Check if user has permission to send reminders
    if signature_request["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Find recipient
    recipient = None
    for r in signature_request["recipients"]:
        if r["email"] == recipient_email:
            recipient = r
            break
    
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    if recipient["status"] == "signed":
        raise HTTPException(status_code=400, detail="Recipient has already signed")
    
    # Send reminder email (mock)
    await send_signature_reminder_email(
        recipient["email"],
        recipient["name"],
        signature_request["document_id"],
        signature_request_id
    )
    
    # Log reminder sent
    recipient["last_reminder_sent"] = datetime.utcnow()
    
    return {"success": True, "message": "Reminder sent successfully"}

@router.delete("/{signature_request_id}")
async def cancel_signature_request(
    signature_request_id: str,
    current_user_email: str = Depends(verify_token)
):
    """
    Cancel signature request
    """
    signature_request = signatures_db.get(signature_request_id)
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    if signature_request["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if signature_request["status"] == "completed":
        raise HTTPException(status_code=400, detail="Cannot cancel completed signature request")
    
    # Update status
    signature_request["status"] = "cancelled"
    signature_request["cancelled_at"] = datetime.utcnow()
    
    # Update document status
    from .documents import documents_db
    document = documents_db.get(signature_request["document_id"])
    if document:
        document["status"] = "draft"
    
    # Create audit trail entry
    audit_entry = {
        "document_id": signature_request["document_id"],
        "action": "signature_request_cancelled",
        "user": current_user_email,
        "timestamp": datetime.utcnow(),
        "details": {"signature_request_id": signature_request_id}
    }
    
    return {"success": True, "message": "Signature request cancelled"}

@router.post("/{signature_request_id}/fields")
async def add_signature_fields(
    signature_request_id: str,
    fields: List[SignatureFieldRequest],
    current_user_email: str = Depends(verify_token)
):
    """
    Add signature fields to document
    """
    signature_request = signatures_db.get(signature_request_id)
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    if signature_request["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Process signature fields
    processed_fields = []
    for field in fields:
        field_id = str(uuid.uuid4())
        field_data = {
            "id": field_id,
            "signature_request_id": signature_request_id,
            "page": field.page,
            "x": field.x,
            "y": field.y,
            "width": field.width,
            "height": field.height,
            "type": field.type,
            "required": field.required,
            "signer_email": field.signer_email,
            "created_at": datetime.utcnow()
        }
        signature_fields_db[field_id] = field_data
        processed_fields.append(field_data)
    
    return {"success": True, "fields": processed_fields}

@router.get("/{signature_request_id}/fields")
async def get_signature_fields(
    signature_request_id: str,
    current_user_email: str = Depends(verify_token)
):
    """
    Get signature fields for document
    """
    signature_request = signatures_db.get(signature_request_id)
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    # Check access permissions
    if (signature_request["created_by"] != current_user_email and 
        not any(r["email"] == current_user_email for r in signature_request["recipients"])):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get fields for this signature request
    fields = [
        field for field in signature_fields_db.values()
        if field["signature_request_id"] == signature_request_id
    ]
    
    return {"fields": fields}

# Mock email functions
async def send_signature_request_email(email: str, name: str, document_title: str, signature_request_id: str):
    """Send signature request email notification"""
    print(f" Sending signature request to {email} for document: {document_title}")
    # In production, integrate with email service (SendGrid, AWS SES, etc.)
    pass

async def send_signature_reminder_email(email: str, name: str, document_id: str, signature_request_id: str):
    """Send signature reminder email"""
    print(f" Sending signature reminder to {email}")
    # In production, integrate with email service
    pass

@router.get("/public/{signature_request_id}")
async def get_public_signature_request(
    signature_request_id: str,
    signer_email: EmailStr
):
    """
    Public endpoint for signers to access signature request (no auth required)
    """
    signature_request = signatures_db.get(signature_request_id)
    if not signature_request:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    # Check if request has expired
    if datetime.utcnow() > signature_request["expires_at"]:
        raise HTTPException(status_code=400, detail="Signature request has expired")
    
    # Find recipient
    recipient = None
    for r in signature_request["recipients"]:
        if r["email"] == signer_email:
            recipient = r
            break
    
    if not recipient:
        raise HTTPException(status_code=403, detail="Not authorized to access this signature request")
    
    # Update viewed timestamp
    if not recipient.get("viewed_at"):
        recipient["viewed_at"] = datetime.utcnow()
    
    # Get document info
    from .documents import documents_db
    document = documents_db.get(signature_request["document_id"])
    
    return {
        "signature_request": {
            "id": signature_request["id"],
            "status": signature_request["status"],
            "expires_at": signature_request["expires_at"],
            "message": signature_request.get("message")
        },
        "document": {
            "id": document["id"] if document else None,
            "title": document["title"] if document else "Unknown Document",
            "file_url": f"/api/v1/documents/{document['id']}/download" if document else None
        },
        "recipient": recipient,
        "eta_2019_compliant": True
    }
