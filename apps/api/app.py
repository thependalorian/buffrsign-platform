from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from uuid import uuid4

app = FastAPI(title="BuffrSign API", version="0.1.0")

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/v1/ping")
def ping():
    return {"message": "pong"}

# --- Simple in-memory stores (placeholder) ---
_documents: Dict[str, dict] = {}
_signatures: Dict[str, dict] = {}
_templates: Dict[str, dict] = {}

# --- Schemas ---
class Recipient(BaseModel):
    email: str
    name: Optional[str] = None
    role: str = "signer"

class DocumentCreate(BaseModel):
    title: str
    file_url: Optional[str] = None
    recipients: List[Recipient] = []
    message: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None

class SignatureRequest(BaseModel):
    document_id: str
    recipients: List[Recipient]
    expires_in_days: Optional[int] = 7

class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    fields: Optional[List[dict]] = None

# --- Documents API ---
@app.post("/api/v1/documents")
def create_document(payload: DocumentCreate):
    doc_id = str(uuid4())
    data = {
        "id": doc_id,
        "title": payload.title,
        "file_url": payload.file_url,
        "recipients": [r.dict() for r in payload.recipients],
        "message": payload.message,
        "status": "draft",
    }
    _documents[doc_id] = data
    return {"success": True, "data": data}

@app.get("/api/v1/documents/{doc_id}")
def get_document(doc_id: str):
    doc = _documents.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "data": doc}

@app.put("/api/v1/documents/{doc_id}")
def update_document(doc_id: str, payload: DocumentUpdate):
    doc = _documents.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if payload.title is not None:
        doc["title"] = payload.title
    if payload.message is not None:
        doc["message"] = payload.message
    return {"success": True, "data": doc}

# --- Signatures API ---
@app.post("/api/v1/signatures")
def request_signature(payload: SignatureRequest):
    if payload.document_id not in _documents:
        raise HTTPException(status_code=404, detail="Document not found")
    sig_id = str(uuid4())
    data = {
        "id": sig_id,
        "document_id": payload.document_id,
        "recipients": [r.dict() for r in payload.recipients],
        "status": "requested",
        "expires_in_days": payload.expires_in_days,
    }
    _signatures[sig_id] = data
    # Mark document as sent
    _documents[payload.document_id]["status"] = "sent"
    return {"success": True, "data": data}

@app.get("/api/v1/signatures/{sig_id}")
def get_signature(sig_id: str):
    sig = _signatures.get(sig_id)
    if not sig:
        raise HTTPException(status_code=404, detail="Signature request not found")
    return {"success": True, "data": sig}

# --- Templates API ---
@app.get("/api/v1/templates")
def list_templates():
    return {"success": True, "data": list(_templates.values())}

@app.post("/api/v1/templates")
def create_template(payload: TemplateCreate):
    tpl_id = str(uuid4())
    data = {
        "id": tpl_id,
        "name": payload.name,
        "description": payload.description,
        "category": payload.category,
        "fields": payload.fields or [],
    }
    _templates[tpl_id] = data
    return {"success": True, "data": data}
