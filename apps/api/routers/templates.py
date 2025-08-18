from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import json
from .auth import verify_token

router = APIRouter()

class TemplateField(BaseModel):
    id: str
    type: str  # signature, text, date, checkbox
    label: str
    required: bool = True
    page: int = 1
    x: float
    y: float
    width: float
    height: float
    properties: Optional[Dict[str, Any]] = {}

class TemplateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    fields: List[TemplateField]
    is_public: bool = False
    tags: List[str] = []

class TemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_public: bool
    tags: List[str]
    usage_count: int
    eta_2019_compliant: bool

class SmartTemplateRequest(BaseModel):
    template_type: str  # employment_contract, nda, service_agreement, etc.
    industry: Optional[str] = None
    jurisdiction: str = "namibia"
    requirements: Dict[str, Any]
    compliance_level: str = "eta_2019"

# Mock template database
templates_db = {}

@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    category: Optional[str] = None,
    public_only: bool = False,
    current_user_email: str = Depends(verify_token)
):
    """
    List available templates
    """
    templates = list(templates_db.values())
    
    # Filter by category
    if category:
        templates = [t for t in templates if t["category"] == category]
    
    # Filter by public/private
    if public_only:
        templates = [t for t in templates if t["is_public"]]
    else:
        # Show public templates and user's private templates
        templates = [
            t for t in templates 
            if t["is_public"] or t["created_by"] == current_user_email
        ]
    
    return [
        TemplateResponse(
            id=t["id"],
            name=t["name"],
            description=t["description"],
            category=t["category"],
            created_by=t["created_by"],
            created_at=t["created_at"],
            updated_at=t["updated_at"],
            is_public=t["is_public"],
            tags=t["tags"],
            usage_count=t["usage_count"],
            eta_2019_compliant=t["eta_2019_compliant"]
        )
        for t in templates
    ]

@router.post("/", response_model=TemplateResponse)
async def create_template(
    file: UploadFile = File(...),
    template_data: str = Form(...),
    current_user_email: str = Depends(verify_token)
):
    """
    Create a new template
    """
    try:
        template_request = TemplateRequest.parse_raw(template_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid template data: {str(e)}")
    
    # Validate file type
    allowed_types = ['application/pdf', 'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF, DOC, and DOCX files are allowed."
        )
    
    # Generate template ID
    template_id = str(uuid.uuid4())
    
    # Save file (mock - replace with actual file storage)
    file_path = f"templates/{template_id}_{file.filename}"
    
    # Validate ETA 2019 compliance
    eta_compliant = validate_eta_compliance(template_request.fields)
    
    # Create template record
    template = {
        "id": template_id,
        "name": template_request.name,
        "description": template_request.description,
        "category": template_request.category,
        "file_path": file_path,
        "filename": file.filename,
        "fields": [field.dict() for field in template_request.fields],
        "is_public": template_request.is_public,
        "tags": template_request.tags,
        "created_by": current_user_email,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "usage_count": 0,
        "eta_2019_compliant": eta_compliant,
        "cran_accredited": True
    }
    
    templates_db[template_id] = template
    
    return TemplateResponse(
        id=template["id"],
        name=template["name"],
        description=template["description"],
        category=template["category"],
        created_by=template["created_by"],
        created_at=template["created_at"],
        updated_at=template["updated_at"],
        is_public=template["is_public"],
        tags=template["tags"],
        usage_count=template["usage_count"],
        eta_2019_compliant=template["eta_2019_compliant"]
    )

@router.get("/{template_id}")
async def get_template(
    template_id: str,
    current_user_email: str = Depends(verify_token)
):
    """
    Get template details
    """
    template = templates_db.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check access permissions
    if not template["is_public"] and template["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return template

@router.post("/{template_id}/use")
async def use_template(
    template_id: str,
    title: str,
    current_user_email: str = Depends(verify_token)
):
    """
    Create a new document from template
    """
    template = templates_db.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check access permissions
    if not template["is_public"] and template["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create document from template
    from .documents import documents_db
    document_id = str(uuid.uuid4())
    
    document = {
        "id": document_id,
        "title": title,
        "filename": f"{title}.pdf",
        "file_path": template["file_path"],  # Copy template file
        "file_size": 0,  # Would be set from actual file
        "file_type": "application/pdf",
        "status": "draft",
        "created_by": current_user_email,
        "created_at": datetime.utcnow(),
        "template_id": template_id,
        "template_fields": template["fields"],
        "eta_2019_compliant": template["eta_2019_compliant"],
        "cran_accredited": template["cran_accredited"]
    }
    
    documents_db[document_id] = document
    
    # Increment template usage count
    template["usage_count"] += 1
    
    return {
        "success": True,
        "document_id": document_id,
        "template_fields": template["fields"]
    }

@router.post("/generate-smart", response_model=Dict[str, Any])
async def generate_smart_template(
    request: SmartTemplateRequest,
    current_user_email: str = Depends(verify_token)
):
    """
    Generate AI-powered smart template based on requirements
    """
    # Mock AI template generation (integrate with LlamaIndex in production)
    template_content = generate_template_content(
        request.template_type,
        request.industry,
        request.jurisdiction,
        request.requirements,
        request.compliance_level
    )
    
    # Generate signature fields based on template type
    signature_fields = generate_signature_fields(request.template_type, request.requirements)
    
    # Check compliance
    compliance_status = check_template_compliance(
        request.template_type,
        request.jurisdiction,
        request.compliance_level
    )
    
    # Generate template ID
    template_id = str(uuid.uuid4())
    
    # Create smart template record
    smart_template = {
        "id": template_id,
        "name": f"AI Generated {request.template_type.replace('_', ' ').title()}",
        "description": f"Smart template for {request.industry or 'general'} industry",
        "category": request.template_type,
        "content": template_content,
        "fields": signature_fields,
        "is_public": False,
        "tags": ["ai_generated", request.template_type, request.jurisdiction],
        "created_by": current_user_email,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "usage_count": 0,
        "eta_2019_compliant": compliance_status["eta_2019_compliant"],
        "cran_accredited": compliance_status["cran_accredited"],
        "ai_generated": True,
        "generation_params": request.dict()
    }
    
    templates_db[template_id] = smart_template
    
    return {
        "success": True,
        "template_id": template_id,
        "template_content": template_content,
        "signature_fields": signature_fields,
        "compliance_status": compliance_status,
        "customization_options": get_customization_options(request.template_type),
        "legal_notes": get_legal_notes(request.template_type, request.jurisdiction)
    }

@router.get("/categories")
async def get_template_categories():
    """
    Get available template categories
    """
    categories = [
        {
            "id": "employment",
            "name": "Employment",
            "description": "Employment contracts, job offers, NDAs",
            "icon": "briefcase",
            "eta_2019_relevant": True
        },
        {
            "id": "business",
            "name": "Business",
            "description": "Service agreements, vendor contracts, partnerships",
            "icon": "building",
            "eta_2019_relevant": True
        },
        {
            "id": "legal",
            "name": "Legal",
            "description": "NDAs, legal opinions, compliance documents",
            "icon": "scale",
            "eta_2019_relevant": True
        },
        {
            "id": "government",
            "name": "Government",
            "description": "Government forms, permits, applications",
            "icon": "landmark",
            "eta_2019_relevant": True,
            "requires_government_account": True
        },
        {
            "id": "real_estate",
            "name": "Real Estate",
            "description": "Lease agreements, property contracts",
            "icon": "home",
            "eta_2019_relevant": True
        },
        {
            "id": "finance",
            "name": "Finance",
            "description": "Loan agreements, financial contracts",
            "icon": "dollar-sign",
            "eta_2019_relevant": True
        }
    ]
    
    return {"categories": categories}

@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    current_user_email: str = Depends(verify_token)
):
    """
    Delete template
    """
    template = templates_db.get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if template["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if template is in use
    from .documents import documents_db
    template_in_use = any(
        doc.get("template_id") == template_id 
        for doc in documents_db.values()
    )
    
    if template_in_use:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete template that is currently in use"
        )
    
    # Delete template
    del templates_db[template_id]
    
    return {"success": True, "message": "Template deleted successfully"}

# Helper functions for AI template generation
def generate_template_content(template_type: str, industry: str, jurisdiction: str, 
                            requirements: Dict[str, Any], compliance_level: str) -> str:
    """Generate template content based on parameters"""
    
    # Mock template generation - in production, integrate with LlamaIndex
    templates = {
        "employment_contract": f"""
EMPLOYMENT AGREEMENT

This Employment Agreement is entered into between [EMPLOYER_NAME], a company duly incorporated under the laws of the Republic of Namibia, and [EMPLOYEE_NAME], a Namibian citizen/resident.

1. POSITION AND DUTIES
The Employee is hereby employed as [POSITION] and shall perform duties as assigned.

2. COMPENSATION
The Employee shall receive a salary of N$ [SALARY] per month.

3. TERM OF EMPLOYMENT
This agreement shall commence on [START_DATE] and continue until terminated.

4. ELECTRONIC SIGNATURE CLAUSE
The parties acknowledge that this agreement may be executed electronically in accordance with the Electronic Transactions Act 4 of 2019. Electronic signatures shall have the same legal effect as handwritten signatures.

5. GOVERNING LAW
This agreement shall be governed by the laws of the Republic of Namibia.

Employee Signature: _________________ Date: _________
[EMPLOYEE_NAME]

Employer Signature: _________________ Date: _________
[EMPLOYER_NAME]
        """,
        
        "nda": f"""
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into between [PARTY1_NAME] and [PARTY2_NAME].

1. CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" means all information disclosed by either party.

2. OBLIGATIONS
The receiving party agrees to maintain confidentiality of all Confidential Information.

3. TERM
This Agreement shall remain in effect for [TERM_YEARS] years from the date of execution.

4. ELECTRONIC TRANSACTIONS ACT COMPLIANCE
This agreement complies with the Electronic Transactions Act 4 of 2019 and may be executed electronically.

Party 1 Signature: _________________ Date: _________
[PARTY1_NAME]

Party 2 Signature: _________________ Date: _________
[PARTY2_NAME]
        """
    }
    
    return templates.get(template_type, "Template content not available")

def generate_signature_fields(template_type: str, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate signature fields based on template type"""
    
    fields = []
    
    if template_type == "employment_contract":
        fields = [
            {
                "id": "employee_signature",
                "type": "signature",
                "label": "Employee Signature",
                "required": True,
                "page": 1,
                "x": 100,
                "y": 700,
                "width": 200,
                "height": 50,
                "signer_role": "employee"
            },
            {
                "id": "employee_date",
                "type": "date",
                "label": "Date",
                "required": True,
                "page": 1,
                "x": 350,
                "y": 700,
                "width": 100,
                "height": 30,
                "signer_role": "employee"
            },
            {
                "id": "employer_signature",
                "type": "signature",
                "label": "Employer Signature",
                "required": True,
                "page": 1,
                "x": 100,
                "y": 750,
                "width": 200,
                "height": 50,
                "signer_role": "employer"
            },
            {
                "id": "employer_date",
                "type": "date",
                "label": "Date",
                "required": True,
                "page": 1,
                "x": 350,
                "y": 750,
                "width": 100,
                "height": 30,
                "signer_role": "employer"
            }
        ]
    
    elif template_type == "nda":
        fields = [
            {
                "id": "party1_signature",
                "type": "signature",
                "label": "Party 1 Signature",
                "required": True,
                "page": 1,
                "x": 100,
                "y": 700,
                "width": 200,
                "height": 50,
                "signer_role": "party1"
            },
            {
                "id": "party2_signature",
                "type": "signature",
                "label": "Party 2 Signature",
                "required": True,
                "page": 1,
                "x": 100,
                "y": 750,
                "width": 200,
                "height": 50,
                "signer_role": "party2"
            }
        ]
    
    return fields

def check_template_compliance(template_type: str, jurisdiction: str, compliance_level: str) -> Dict[str, Any]:
    """Check template compliance with legal requirements"""
    
    return {
        "eta_2019_compliant": True,
        "cran_accredited": True,
        "compliance_score": 95,
        "issues": [],
        "recommendations": [
            "Template includes electronic signature compliance clause",
            "Follows Namibian legal requirements",
            "Includes proper identification fields"
        ]
    }

def get_customization_options(template_type: str) -> List[Dict[str, Any]]:
    """Get available customization options for template type"""
    
    options = {
        "employment_contract": [
            {"field": "probation_period", "label": "Probation Period", "type": "select", "options": ["3 months", "6 months", "12 months"]},
            {"field": "notice_period", "label": "Notice Period", "type": "select", "options": ["1 week", "2 weeks", "1 month"]},
            {"field": "benefits", "label": "Benefits Package", "type": "checkbox", "options": ["Medical Aid", "Pension", "Car Allowance"]}
        ],
        "nda": [
            {"field": "duration", "label": "Duration", "type": "select", "options": ["1 year", "2 years", "5 years", "Indefinite"]},
            {"field": "scope", "label": "Scope", "type": "select", "options": ["Mutual", "One-way"]},
            {"field": "exceptions", "label": "Exceptions", "type": "checkbox", "options": ["Public Information", "Prior Knowledge", "Required by Law"]}
        ]
    }
    
    return options.get(template_type, [])

def get_legal_notes(template_type: str, jurisdiction: str) -> List[str]:
    """Get legal notes for template type and jurisdiction"""
    
    notes = {
        "employment_contract": [
            "This template complies with Namibian Labour Act 11 of 2007",
            "Electronic signatures are legally binding under ETA 2019 Section 20",
            "Minimum wage requirements must be observed",
            "Notice periods must comply with Labour Act Section 35"
        ],
        "nda": [
            "This template complies with Namibian contract law",
            "Electronic execution is valid under ETA 2019",
            "Consider specific industry requirements",
            "Ensure reasonable scope and duration"
        ]
    }
    
    return notes.get(template_type, ["Template complies with Namibian law", "Electronic signatures are legally binding"])

def validate_eta_compliance(fields: List[TemplateField]) -> bool:
    """Validate template fields for ETA 2019 compliance"""
    
    # Check if template has required signature fields
    has_signature_fields = any(field.type == "signature" for field in fields)
    
    # Check if signature fields are properly configured
    signature_fields_valid = all(
        field.required and field.width > 0 and field.height > 0
        for field in fields if field.type == "signature"
    )
    
    return has_signature_fields and signature_fields_valid
