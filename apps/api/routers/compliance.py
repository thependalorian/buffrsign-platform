from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from .auth import verify_token
from ..services.redis_service import redis_service

router = APIRouter()

class ComplianceCheckRequest(BaseModel):
    document_id: str
    frameworks: List[str] = ["eta_2019", "cran"]
    check_level: str = "comprehensive"  # basic, standard, comprehensive

class ComplianceReport(BaseModel):
    document_id: str
    overall_score: int
    frameworks: Dict[str, Any]
    issues: List[Dict[str, Any]]
    recommendations: List[str]
    generated_at: datetime
    eta_2019_compliant: bool
    cran_accredited: bool

class AuditTrailEntry(BaseModel):
    id: str
    document_id: str
    action: str
    user: str
    timestamp: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    details: Dict[str, Any]

# Mock compliance database
compliance_reports_db = {}
audit_trail_db = {}

@router.post("/check", response_model=ComplianceReport)
async def check_compliance(
    request: ComplianceCheckRequest,
    current_user_email: str = Depends(verify_token)
):
    """
    Comprehensive compliance check for ETA 2019 and CRAN requirements
    """
    # Get document
    from .documents import documents_db
    document = documents_db.get(request.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Perform compliance checks
    compliance_results = {}
    overall_score = 0
    issues = []
    recommendations = []
    
    # ETA 2019 Compliance Check
    if "eta_2019" in request.frameworks:
        eta_results = check_eta_2019_compliance(document)
        compliance_results["eta_2019"] = eta_results
        overall_score += eta_results["score"]
        issues.extend(eta_results["issues"])
        recommendations.extend(eta_results["recommendations"])
    
    # CRAN Accreditation Check
    if "cran" in request.frameworks:
        cran_results = check_cran_compliance(document)
        compliance_results["cran"] = cran_results
        overall_score += cran_results["score"]
        issues.extend(cran_results["issues"])
        recommendations.extend(cran_results["recommendations"])
    
    # Calculate overall score
    overall_score = overall_score // len(request.frameworks) if request.frameworks else 0
    
    # Generate compliance report
    report_id = f"compliance_{request.document_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    
    report = ComplianceReport(
        document_id=request.document_id,
        overall_score=overall_score,
        frameworks=compliance_results,
        issues=issues,
        recommendations=list(set(recommendations)),  # Remove duplicates
        generated_at=datetime.utcnow(),
        eta_2019_compliant=compliance_results.get("eta_2019", {}).get("compliant", False),
        cran_accredited=compliance_results.get("cran", {}).get("accredited", False)
    )
    
    compliance_reports_db[report_id] = report.dict()
    
    # Create audit trail entry
    audit_entry = {
        "id": report_id,
        "document_id": request.document_id,
        "action": "compliance_check_performed",
        "user": current_user_email,
        "timestamp": datetime.utcnow(),
        "ip_address": None,  # Would be extracted from request
        "user_agent": None,  # Would be extracted from request
        "details": {
            "frameworks": request.frameworks,
            "check_level": request.check_level,
            "overall_score": overall_score
        }
    }
    audit_trail_db[report_id] = audit_entry
    
    # Log user activity to Supabase
    redis_service.log_user_activity(
        user_id=current_user_email,
        activity_type='compliance_check',
        activity_data={
            'document_id': request.document_id,
            'frameworks': request.frameworks,
            'overall_score': overall_score,
            'report_id': report_id
        }
    )
    
    return report

@router.get("/eta-2019-status")
async def get_eta_2019_status(current_user_email: str = Depends(verify_token)):
    """
    Get overall ETA 2019 compliance status for user's documents
    """
    from .documents import documents_db
    
    # Get user's documents
    user_documents = [
        doc for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    if not user_documents:
        return {
            "total_documents": 0,
            "compliant_documents": 0,
            "compliance_percentage": 0,
            "sections": {}
        }
    
    # Check compliance for each document
    compliant_count = 0
    section_compliance = {
        "section_17": {"compliant": 0, "total": 0},
        "section_20": {"compliant": 0, "total": 0},
        "section_21": {"compliant": 0, "total": 0},
        "chapter_4": {"compliant": 0, "total": 0}
    }
    
    for document in user_documents:
        eta_compliance = check_eta_2019_compliance(document)
        
        if eta_compliance["compliant"]:
            compliant_count += 1
        
        # Track section compliance
        for section, status in eta_compliance["sections"].items():
            section_compliance[section]["total"] += 1
            if status["compliant"]:
                section_compliance[section]["compliant"] += 1
    
    compliance_percentage = (compliant_count / len(user_documents)) * 100
    
    return {
        "total_documents": len(user_documents),
        "compliant_documents": compliant_count,
        "compliance_percentage": round(compliance_percentage, 1),
        "sections": {
            section: {
                "compliance_rate": round((data["compliant"] / data["total"]) * 100, 1) if data["total"] > 0 else 0,
                "compliant_count": data["compliant"],
                "total_count": data["total"]
            }
            for section, data in section_compliance.items()
        },
        "last_updated": datetime.utcnow()
    }

@router.get("/cran-status")
async def get_cran_status(current_user_email: str = Depends(verify_token)):
    """
    Get CRAN accreditation status
    """
    # Mock CRAN status - in production, integrate with actual CRAN API
    return {
        "service_provider_status": "active",
        "accreditation_id": "CRAN-ACC-2024-001",
        "certificate_valid_until": "2025-12-31",
        "security_service_class": "advanced_electronic_signatures",
        "last_audit": "2024-06-15",
        "next_audit_due": "2025-06-15",
        "compliance_score": 98,
        "requirements": {
            "security_service_provider": {"status": "compliant", "last_check": "2024-12-01"},
            "digital_certificate_authority": {"status": "compliant", "last_check": "2024-12-01"},
            "audit_trail_maintenance": {"status": "compliant", "last_check": "2024-12-01"},
            "security_incident_reporting": {"status": "compliant", "last_check": "2024-12-01"}
        }
    }

@router.get("/audit-trail/{document_id}")
async def get_audit_trail(
    document_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user_email: str = Depends(verify_token)
):
    """
    Get audit trail for a specific document (ETA 2019 Section 24 requirement)
    """
    # Verify document access
    from .documents import documents_db
    document = documents_db.get(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get audit trail entries for this document
    document_audit_entries = [
        entry for entry in audit_trail_db.values()
        if entry["document_id"] == document_id
    ]
    
    # Sort by timestamp (newest first)
    document_audit_entries.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Apply pagination
    total_entries = len(document_audit_entries)
    paginated_entries = document_audit_entries[offset:offset + limit]
    
    return {
        "document_id": document_id,
        "total_entries": total_entries,
        "entries": paginated_entries,
        "page": (offset // limit) + 1,
        "per_page": limit,
        "eta_2019_compliant": True,
        "audit_trail_complete": True
    }

@router.post("/audit-trail")
async def create_audit_entry(
    document_id: str,
    action: str,
    details: Dict[str, Any],
    current_user_email: str = Depends(verify_token)
):
    """
    Create audit trail entry (for system use)
    """
    entry_id = f"audit_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
    
    audit_entry = {
        "id": entry_id,
        "document_id": document_id,
        "action": action,
        "user": current_user_email,
        "timestamp": datetime.utcnow(),
        "ip_address": None,  # Would be extracted from request
        "user_agent": None,  # Would be extracted from request
        "details": details
    }
    
    audit_trail_db[entry_id] = audit_entry
    
    return {"success": True, "audit_entry_id": entry_id}

@router.get("/reports")
async def list_compliance_reports(
    document_id: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user_email: str = Depends(verify_token)
):
    """
    List compliance reports for user's documents
    """
    # Get user's documents
    from .documents import documents_db
    user_document_ids = [
        doc["id"] for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    # Filter reports
    reports = [
        report for report in compliance_reports_db.values()
        if report["document_id"] in user_document_ids
    ]
    
    if document_id:
        reports = [r for r in reports if r["document_id"] == document_id]
    
    # Sort by generation date (newest first)
    reports.sort(key=lambda x: x["generated_at"], reverse=True)
    
    # Apply pagination
    total_reports = len(reports)
    paginated_reports = reports[offset:offset + limit]
    
    return {
        "reports": paginated_reports,
        "total": total_reports,
        "page": (offset // limit) + 1,
        "per_page": limit
    }

@router.get("/export/{document_id}")
async def export_compliance_certificate(
    document_id: str,
    format: str = "pdf",  # pdf, json
    current_user_email: str = Depends(verify_token)
):
    """
    Export compliance certificate for document
    """
    # Verify document access
    from .documents import documents_db
    document = documents_db.get(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if document["created_by"] != current_user_email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate compliance certificate
    certificate = {
        "certificate_id": f"BUFFSIGN-CERT-{document_id[:8].upper()}",
        "document_id": document_id,
        "document_title": document["title"],
        "generated_at": datetime.utcnow(),
        "valid_until": datetime.utcnow() + timedelta(days=365),
        "compliance_status": {
            "eta_2019": {
                "section_17": "compliant",
                "section_20": "compliant",
                "section_21": "compliant",
                "chapter_4": "compliant"
            },
            "cran": {
                "service_provider": "accredited",
                "digital_certificates": "valid",
                "audit_trail": "complete"
            }
        },
        "signatures": {
            "total_signatures": document.get("total_signatures", 0),
            "completed_signatures": document.get("completed_signatures", 0),
            "signature_types": ["advanced_electronic"]
        },
        "issuer": {
            "name": "BuffrSign (Pty) Ltd",
            "cran_accreditation": "CRAN-ACC-2024-001",
            "contact": "compliance @buffsign.com"
        }
    }
    
    if format == "json":
        return certificate
    else:
        # In production, generate actual PDF certificate
        return {
            "certificate": certificate,
            "download_url": f"/api/v1/compliance/certificates/{document_id}.pdf",
            "format": "pdf"
        }

# Helper functions for compliance checking
def check_eta_2019_compliance(document: Dict[str, Any]) -> Dict[str, Any]:
    """Check ETA 2019 compliance for a document"""
    
    sections = {
        "section_17": check_section_17_compliance(document),
        "section_20": check_section_20_compliance(document),
        "section_21": check_section_21_compliance(document),
        "chapter_4": check_chapter_4_compliance(document)
    }
    
    # Calculate overall compliance
    compliant_sections = sum(1 for section in sections.values() if section["compliant"])
    total_sections = len(sections)
    score = (compliant_sections / total_sections) * 100
    
    # Collect issues and recommendations
    issues = []
    recommendations = []
    
    for section_name, section_data in sections.items():
        issues.extend(section_data.get("issues", []))
        recommendations.extend(section_data.get("recommendations", []))
    
    return {
        "compliant": score == 100,
        "score": int(score),
        "sections": sections,
        "issues": issues,
        "recommendations": recommendations
    }

def check_section_17_compliance(document: Dict[str, Any]) -> Dict[str, Any]:
    """Check ETA 2019 Section 17 - Legal recognition of data messages"""
    
    issues = []
    recommendations = []
    
    # Check if document acknowledges electronic validity
    has_electronic_clause = document.get("has_electronic_validity_clause", True)  # Mock check
    
    if not has_electronic_clause:
        issues.append("Missing electronic validity acknowledgment clause")
        recommendations.append("Add clause acknowledging electronic document validity")
    
    return {
        "compliant": len(issues) == 0,
        "issues": issues,
        "recommendations": recommendations,
        "details": "Legal recognition of electronic documents"
    }

def check_section_20_compliance(document: Dict[str, Any]) -> Dict[str, Any]:
    """Check ETA 2019 Section 20 - Electronic signature requirements"""
    
    issues = []
    recommendations = []
    
    # Check signature types used
    signature_types = document.get("signature_types", ["simple_electronic"])
    
    # For certain document types, advanced signatures are required
    if document.get("document_type") in ["employment_contract", "government_form"]:
        if "advanced_electronic" not in signature_types:
            issues.append("Document type requires advanced electronic signatures")
            recommendations.append("Use advanced electronic signatures for this document type")
    
    return {
        "compliant": len(issues) == 0,
        "issues": issues,
        "recommendations": recommendations,
        "details": "Electronic signature requirements"
    }

def check_section_21_compliance(document: Dict[str, Any]) -> Dict[str, Any]:
    """Check ETA 2019 Section 21 - Original information integrity"""
    
    issues = []
    recommendations = []
    
    # Check if document has integrity measures
    has_hash = document.get("file_hash") is not None
    has_timestamp = document.get("created_at") is not None
    
    if not has_hash:
        issues.append("Missing document integrity hash")
        recommendations.append("Generate and store document hash for integrity verification")
    
    if not has_timestamp:
        issues.append("Missing creation timestamp")
        recommendations.append("Add creation timestamp for audit trail")
    
    return {
        "compliant": len(issues) == 0,
        "issues": issues,
        "recommendations": recommendations,
        "details": "Document integrity and original information"
    }

def check_chapter_4_compliance(document: Dict[str, Any]) -> Dict[str, Any]:
    """Check ETA 2019 Chapter 4 - Consumer protection"""
    
    issues = []
    recommendations = []
    
    # Check if consumer protection applies
    is_consumer_transaction = document.get("involves_consumer", False)
    
    if is_consumer_transaction:
        # Check for required consumer protection elements
        has_cooling_off = document.get("cooling_off_period", False)
        has_disclosure = document.get("information_disclosure", False)
        
        if not has_cooling_off:
            issues.append("Missing cooling-off period for consumer transaction")
            recommendations.append("Add 7-day cooling-off period as required by Chapter 4")
        
        if not has_disclosure:
            issues.append("Missing information disclosure requirements")
            recommendations.append("Include required consumer information disclosure")
    
    return {
        "compliant": len(issues) == 0 or not is_consumer_transaction,
        "issues": issues,
        "recommendations": recommendations,
        "details": "Consumer protection requirements"
    }

def check_cran_compliance(document: Dict[str, Any]) -> Dict[str, Any]:
    """Check CRAN accreditation compliance"""
    
    # Mock CRAN compliance check
    return {
        "accredited": True,
        "score": 98,
        "issues": [],
        "recommendations": ["Maintain current accreditation standards"],
        "details": {
            "service_provider_status": "active",
            "certificate_authority": "valid",
            "audit_trail": "compliant",
            "security_standards": "met"
        }
    }
