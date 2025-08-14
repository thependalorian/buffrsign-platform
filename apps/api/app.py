from fastapi import FastAPI, HTTPException, Request, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from uuid import uuid4
from .ai_services.document_intelligence import analyze_document_stub, analyze_document
from .ai_services.template_generator import generate_smart_template_stub, generate_smart_template
from .ai_services.compliance_checker import analyze_compliance_stub, analyze_compliance

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
    # API Response Structure: { status: string, ts: ISO8601 }
    return {"status": "ok", "ts": __import__("datetime").datetime.utcnow().isoformat() + "Z"}


# Very simple in-memory rate limiter (per-IP) to protect public endpoints
_rate_store: dict[str, list[float]] = {}

def _rate_limited(ip: str, window_seconds: int = 60, max_requests: int = 60) -> bool:
    import time
    now = time.time()
    window_start = now - window_seconds
    history = _rate_store.setdefault(ip, [])
    # drop old
    _rate_store[ip] = [t for t in history if t >= window_start]
    if len(_rate_store[ip]) >= max_requests:
        return True
    _rate_store[ip].append(now)
    return False


@app.middleware("http")
async def basic_rate_limit(request: Request, call_next):
    client_ip = request.headers.get("x-forwarded-for", request.client.host)
    if _rate_limited(client_ip):
        return __import__("fastapi").responses.JSONResponse(
            status_code=429,
            content={"success": False, "error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}},
        )
    return await call_next(request)


def require_api_key(x_api_key: str | None = Header(default=None)):
    expected = __import__('os').environ.get('BUFFRSIGN_API_KEY')
    if not expected:
        return
    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.get("/api/v1/ping")
def ping():
    return {"message": "pong"}

# --- Simple in-memory stores (placeholder) ---
_documents: Dict[str, dict] = {}
_signatures: Dict[str, dict] = {}
_templates: Dict[str, dict] = {}
_audit: Dict[str, list[dict]] = {}

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

class SignatureComplete(BaseModel):
    method: str
    data: Optional[str] = None

# --- Documents API ---
@app.post("/api/v1/documents")
def create_document(payload: DocumentCreate, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
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
    _audit.setdefault(doc_id, []).append({
        "action": "document_created",
        "ts": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    })
    return {"success": True, "data": data}

@app.get("/api/v1/documents/{doc_id}")
def get_document(doc_id: str, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    doc = _documents.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "data": doc}

@app.get("/api/v1/documents")
def list_documents(x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    return {"success": True, "data": list(_documents.values())}

@app.put("/api/v1/documents/{doc_id}")
def update_document(doc_id: str, payload: DocumentUpdate, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
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
def request_signature(payload: SignatureRequest, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
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
    _audit.setdefault(payload.document_id, []).append({
        "action": "signature_requested",
        "ts": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    })
    return {"success": True, "data": data}

@app.get("/api/v1/signatures/{sig_id}")
def get_signature(sig_id: str, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    sig = _signatures.get(sig_id)
    if not sig:
        raise HTTPException(status_code=404, detail="Signature request not found")
    return {"success": True, "data": sig}

@app.post("/api/v1/signatures/{sig_id}/complete")
def complete_signature(sig_id: str, payload: SignatureComplete, request: Request, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    sig = _signatures.get(sig_id)
    if not sig:
        raise HTTPException(status_code=404, detail="Signature request not found")
    doc_id = sig["document_id"]
    event = {
        "action": "document_signed",
        "ts": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "details": {"method": payload.method},
        "ip": request.headers.get("x-forwarded-for", request.client.host),
    }
    sig.update({"status": "completed", "signature": {"method": payload.method, "data": payload.data, "ts": event["ts"]}})
    _documents[doc_id]["status"] = "completed"
    _audit.setdefault(doc_id, []).append(event)
    return {"success": True, "data": sig}

# --- Templates API ---
@app.get("/api/v1/templates")
def list_templates(x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    return {"success": True, "data": list(_templates.values())}

@app.post("/api/v1/templates")
def create_template(payload: TemplateCreate, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
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

# --- Audit trail ---
@app.get("/api/v1/documents/{doc_id}/audit-trail")
def audit_trail(doc_id: str, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    if doc_id not in _documents:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "data": {"document_id": doc_id, "events": _audit.get(doc_id, [])}}

@app.get("/api/v1/documents/{doc_id}/certificate")
def certificate(doc_id: str, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    doc = _documents.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    events = _audit.get(doc_id, [])
    created = next((e for e in events if e.get("action") == "document_created"), None)
    signed = [e for e in events if e.get("action") == "document_signed"]
    cert = {
        "document_id": doc_id,
        "title": doc.get("title"),
        "status": doc.get("status"),
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "eta_compliance": {"section_17": True, "section_20": True, "section_21": True, "section_25": True},
        "events": events,
        "summary": {"created_at": created.get("ts") if created else None, "signatures": len(signed)},
    }
    return {"success": True, "data": cert}

# --- AI-enhanced endpoints (stubs) ---
@app.post("/api/v1/documents/upload-with-analysis")
async def upload_with_analysis(document_type: Optional[str] = "contract", x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    # This stub assumes a pre-uploaded path for demo purposes.
    analysis = analyze_document_stub(file_path="/tmp/document.pdf", document_type=document_type or "contract")
    doc_id = str(uuid4())
    _documents[doc_id] = {"id": doc_id, "title": f"Analyzed {document_type}", "status": "draft"}
    return {"success": True, "data": {"document_id": doc_id, "ai_analysis": analysis}}

@app.post("/api/v1/templates/generate-smart")
async def generate_smart_template(payload: dict, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    result = generate_smart_template_stub(payload.get("template_type", "contract"), payload.get("requirements", {}))
    tpl_id = str(uuid4())
    _templates[tpl_id] = {"id": tpl_id, "name": f"Smart {payload.get('template_type','contract').title()}"}
    return {"success": True, "data": {"template_id": tpl_id, **result}}

@app.post("/api/v1/compliance/analyze")
async def compliance_analyze(payload: dict, x_api_key: str | None = Header(default=None)):
    require_api_key(x_api_key)
    out = analyze_compliance_stub(
        document_id=payload.get("document_id", "unknown"),
        frameworks=payload.get("compliance_frameworks", ["eta_2019"]),
        jurisdiction=payload.get("jurisdiction", "namibia"),
    )
    return {"success": True, "data": out}

# --- AI Integration (full) ---

@app.post("/api/v1/ai/documents/upload-with-ai-analysis")
async def ai_upload_with_analysis(
    file: UploadFile = File(...),
    document_type: str = Form("contract"),
    x_api_key: str | None = Header(default=None),
):
    """
    Upload a document and run AI analysis. Saves a temporary copy of the file, runs
    LlamaIndex-backed analysis when available, and persists the analysis alongside the
    in-memory document for later retrieval (e.g., AI insights endpoint).

    Response shape:
    {
      success: bool,
      document_id: str,
      ai_analysis: { document_summary, key_clauses, signature_fields, compliance_status, recommendations }
    }
    """
    require_api_key(x_api_key)
    import os, tempfile, shutil
    suffix = os.path.splitext(file.filename or "uploaded.pdf")[1] or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        temp_path = tmp.name
        content = await file.read()
        tmp.write(content)

    # Prefer real analysis; function falls back internally if LlamaIndex is unavailable
    analysis = analyze_document(file_path=temp_path, document_type=document_type or "contract")

    doc_id = str(uuid4())
    _documents[doc_id] = {
        "id": doc_id,
        "title": file.filename or f"Uploaded {document_type}",
        "status": "draft",
        "file_path": temp_path,
        "document_type": document_type,
        "ai_analysis": analysis,
    }
    _audit.setdefault(doc_id, []).append({
        "action": "document_ai_analyzed",
        "ts": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "details": {"filename": file.filename, "engine": analysis.get("engine")},
    })

    return {"success": True, "document_id": doc_id, "ai_analysis": analysis}


class TemplateGenerationRequest(BaseModel):
    template_type: str
    industry: Optional[str] = None
    jurisdiction: str = "namibia"
    requirements: Dict = {}


@app.post("/api/v1/ai/templates/generate-smart")
async def ai_generate_smart_template(payload: TemplateGenerationRequest, x_api_key: str | None = Header(default=None)):
    """
    Generate a smart legal template using AI (when available). Falls back to deterministic
    content if AI is disabled.
    """
    require_api_key(x_api_key)
    result = generate_smart_template(payload.template_type, dict(payload.requirements or {}))
    tpl_id = str(uuid4())
    _templates[tpl_id] = {
        "id": tpl_id,
        "name": f"AI {payload.template_type.replace('_',' ').title()}",
        "description": f"AI generated template for {payload.industry or 'general'}",
        "category": payload.template_type,
        "fields": result.get("signature_fields", []),
        "engine": result.get("engine"),
    }
    return {"success": True, "data": {"template_id": tpl_id, **result}}


class ComplianceAnalyzeRequest(BaseModel):
    document_id: Optional[str] = None
    frameworks: List[str] = ["eta_2019", "cran"]
    jurisdiction: str = "namibia"


@app.post("/api/v1/ai/compliance/analyze")
async def ai_compliance_analyze(payload: ComplianceAnalyzeRequest, x_api_key: str | None = Header(default=None)):
    """
    Perform compliance analysis against requested frameworks. Uses minimal internal
    guidance and returns structured results. Does not require stored content for now.
    """
    require_api_key(x_api_key)
    result = analyze_compliance(
        document_id=payload.document_id or "unknown",
        frameworks=payload.frameworks or ["eta_2019"],
        jurisdiction=payload.jurisdiction or "namibia",
    )
    return {"success": True, "data": result}


@app.get("/api/v1/ai/documents/{document_id}/ai-insights")
async def ai_get_insights(document_id: str, x_api_key: str | None = Header(default=None)):
    """Return previously stored AI analysis for a given document, if present."""
    require_api_key(x_api_key)
    doc = _documents.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    analysis = doc.get("ai_analysis")
    if not analysis:
        raise HTTPException(status_code=404, detail="AI analysis not found")
    return {"success": True, "document_id": document_id, "insights": analysis}
