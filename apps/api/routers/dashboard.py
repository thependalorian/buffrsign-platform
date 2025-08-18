from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .auth import verify_token

router = APIRouter()

class DashboardStats(BaseModel):
    total_documents: int
    pending_signatures: int
    completed_this_month: int
    compliance_score: int

class ActivityItem(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: datetime
    user: str
    document_id: Optional[str] = None

class QuickAction(BaseModel):
    id: str
    label: str
    description: str
    icon: str
    url: str
    enabled: bool

class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_activity: List[ActivityItem]
    quick_actions: List[QuickAction]
    compliance_status: Dict[str, Any]
    notifications: List[Dict[str, Any]]

@router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(current_user_email: str = Depends(verify_token)):
    """
    Get comprehensive dashboard overview for user
    """
    # Get user's documents
    from .documents import documents_db
    from .signatures import signatures_db
    
    user_documents = [
        doc for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    # Calculate stats
    total_documents = len(user_documents)
    
    # Count pending signatures
    pending_signatures = 0
    for sig_request in signatures_db.values():
        if any(doc["id"] == sig_request["document_id"] for doc in user_documents):
            if sig_request["status"] == "pending":
                pending_signatures += sig_request["total_signatures"] - sig_request["completed_signatures"]
    
    # Count completed this month
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    completed_this_month = sum(
        1 for doc in user_documents
        if doc["status"] == "completed" and 
        doc.get("completed_at", datetime.min) >= current_month_start
    )
    
    # Calculate compliance score (mock)
    compliance_score = calculate_user_compliance_score(user_documents)
    
    stats = DashboardStats(
        total_documents=total_documents,
        pending_signatures=pending_signatures,
        completed_this_month=completed_this_month,
        compliance_score=compliance_score
    )
    
    # Get recent activity
    recent_activity = get_recent_activity(current_user_email, limit=10)
    
    # Get quick actions based on user account type
    quick_actions = get_quick_actions(current_user_email)
    
    # Get compliance status
    compliance_status = get_compliance_status(user_documents)
    
    # Get notifications
    notifications = get_user_notifications(current_user_email)
    
    return DashboardResponse(
        stats=stats,
        recent_activity=recent_activity,
        quick_actions=quick_actions,
        compliance_status=compliance_status,
        notifications=notifications
    )

@router.get("/stats/monthly")
async def get_monthly_stats(
    months: int = 6,
    current_user_email: str = Depends(verify_token)
):
    """
    Get monthly statistics for charts and analytics
    """
    from .documents import documents_db
    
    user_documents = [
        doc for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    # Generate monthly data for the last N months
    monthly_data = []
    current_date = datetime.utcnow()
    
    for i in range(months):
        month_start = current_date.replace(day=1) - timedelta(days=i*30)
        month_end = month_start + timedelta(days=30)
        
        # Count documents created in this month
        documents_created = sum(
            1 for doc in user_documents
            if month_start <= doc["created_at"] < month_end
        )
        
        # Count documents completed in this month
        documents_completed = sum(
            1 for doc in user_documents
            if doc["status"] == "completed" and
            doc.get("completed_at", datetime.min) >= month_start and
            doc.get("completed_at", datetime.min) < month_end
        )
        
        monthly_data.append({
            "month": month_start.strftime("%Y-%m"),
            "month_name": month_start.strftime("%B %Y"),
            "documents_created": documents_created,
            "documents_completed": documents_completed,
            "completion_rate": (documents_completed / documents_created * 100) if documents_created > 0 else 0
        })
    
    # Reverse to show oldest to newest
    monthly_data.reverse()
    
    return {
        "monthly_stats": monthly_data,
        "summary": {
            "total_created": sum(month["documents_created"] for month in monthly_data),
            "total_completed": sum(month["documents_completed"] for month in monthly_data),
            "average_completion_rate": sum(month["completion_rate"] for month in monthly_data) / len(monthly_data)
        }
    }

@router.get("/stats/document-types")
async def get_document_type_stats(current_user_email: str = Depends(verify_token)):
    """
    Get statistics by document type
    """
    from .documents import documents_db
    
    user_documents = [
        doc for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    # Count by document type
    type_counts = {}
    for doc in user_documents:
        doc_type = doc.get("document_type", "other")
        if doc_type not in type_counts:
            type_counts[doc_type] = {
                "total": 0,
                "completed": 0,
                "pending": 0,
                "draft": 0
            }
        
        type_counts[doc_type]["total"] += 1
        type_counts[doc_type][doc["status"]] += 1
    
    # Convert to list format for charts
    document_types = []
    for doc_type, counts in type_counts.items():
        document_types.append({
            "type": doc_type,
            "label": doc_type.replace("_", " ").title(),
            "total": counts["total"],
            "completed": counts["completed"],
            "pending": counts["pending"],
            "draft": counts["draft"],
            "completion_rate": (counts["completed"] / counts["total"] * 100) if counts["total"] > 0 else 0
        })
    
    # Sort by total count
    document_types.sort(key=lambda x: x["total"], reverse=True)
    
    return {"document_types": document_types}

@router.get("/activity")
async def get_activity_feed(
    limit: int = 20,
    offset: int = 0,
    current_user_email: str = Depends(verify_token)
):
    """
    Get detailed activity feed for user
    """
    activities = get_recent_activity(current_user_email, limit=limit, offset=offset)
    
    return {
        "activities": activities,
        "total": len(activities),
        "page": (offset // limit) + 1,
        "per_page": limit
    }

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 10,
    current_user_email: str = Depends(verify_token)
):
    """
    Get user notifications
    """
    notifications = get_user_notifications(current_user_email, unread_only=unread_only, limit=limit)
    
    return {
        "notifications": notifications,
        "unread_count": sum(1 for n in notifications if not n.get("read", False))
    }

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user_email: str = Depends(verify_token)
):
    """
    Mark notification as read
    """
    # Mock implementation - in production, update notification in database
    return {"success": True, "message": "Notification marked as read"}

@router.get("/compliance-summary")
async def get_compliance_summary(current_user_email: str = Depends(verify_token)):
    """
    Get detailed compliance summary for dashboard
    """
    from .documents import documents_db
    
    user_documents = [
        doc for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    if not user_documents:
        return {
            "overall_score": 0,
            "eta_2019": {"score": 0, "compliant_documents": 0, "total_documents": 0},
            "cran": {"score": 0, "accredited": True},
            "recommendations": ["Upload documents to see compliance status"]
        }
    
    # Calculate ETA 2019 compliance
    eta_compliant_docs = sum(1 for doc in user_documents if doc.get("eta_2019_compliant", False))
    eta_score = (eta_compliant_docs / len(user_documents)) * 100
    
    # Mock CRAN compliance
    cran_score = 98  # Mock score
    
    # Overall score
    overall_score = (eta_score + cran_score) / 2
    
    # Generate recommendations
    recommendations = []
    if eta_score < 100:
        recommendations.append("Review documents for ETA 2019 compliance")
    if len(user_documents) < 5:
        recommendations.append("Upload more documents to improve compliance tracking")
    if not any(doc.get("signature_request_id") for doc in user_documents):
        recommendations.append("Start using electronic signatures to demonstrate compliance")
    
    return {
        "overall_score": round(overall_score, 1),
        "eta_2019": {
            "score": round(eta_score, 1),
            "compliant_documents": eta_compliant_docs,
            "total_documents": len(user_documents),
            "sections": {
                "section_17": {"compliant": True, "description": "Legal recognition of data messages"},
                "section_20": {"compliant": True, "description": "Electronic signature requirements"},
                "section_21": {"compliant": True, "description": "Original information integrity"},
                "chapter_4": {"compliant": True, "description": "Consumer protection"}
            }
        },
        "cran": {
            "score": cran_score,
            "accredited": True,
            "certificate_id": "CRAN-ACC-2024-001",
            "valid_until": "2025-12-31"
        },
        "recommendations": recommendations,
        "last_updated": datetime.utcnow()
    }

# Helper functions
def calculate_user_compliance_score(documents: List[Dict[str, Any]]) -> int:
    """Calculate overall compliance score for user's documents"""
    if not documents:
        return 0
    
    compliant_docs = sum(1 for doc in documents if doc.get("eta_2019_compliant", False))
    return int((compliant_docs / len(documents)) * 100)

def get_recent_activity(user_email: str, limit: int = 10, offset: int = 0) -> List[ActivityItem]:
    """Get recent activity for user"""
    from .compliance import audit_trail_db
    from .documents import documents_db
    
    # Get user's documents
    user_document_ids = [
        doc["id"] for doc in documents_db.values()
        if doc["created_by"] == user_email
    ]
    
    # Get audit trail entries for user's documents
    activities = []
    for entry in audit_trail_db.values():
        if entry["document_id"] in user_document_ids or entry["user"] == user_email:
            # Get document title
            document = documents_db.get(entry["document_id"])
            document_title = document["title"] if document else "Unknown Document"
            
            activity = ActivityItem(
                id=entry["id"],
                type=entry["action"],
                title=get_activity_title(entry["action"]),
                description=f"{document_title} - {get_activity_description(entry['action'])}",
                timestamp=entry["timestamp"],
                user=entry["user"],
                document_id=entry["document_id"]
            )
            activities.append(activity)
    
    # Sort by timestamp (newest first)
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    
    # Apply pagination
    return activities[offset:offset + limit]

def get_activity_title(action: str) -> str:
    """Get human-readable title for activity action"""
    titles = {
        "document_uploaded": "Document Uploaded",
        "document_signed": "Document Signed",
        "signature_request_sent": "Signature Request Sent",
        "compliance_check_performed": "Compliance Check",
        "document_completed": "Document Completed",
        "document_deleted": "Document Deleted"
    }
    return titles.get(action, action.replace("_", " ").title())

def get_activity_description(action: str) -> str:
    """Get description for activity action"""
    descriptions = {
        "document_uploaded": "New document uploaded to BuffrSign",
        "document_signed": "Document signed electronically",
        "signature_request_sent": "Signature request sent to recipients",
        "compliance_check_performed": "ETA 2019 compliance check completed",
        "document_completed": "All signatures completed",
        "document_deleted": "Document removed from system"
    }
    return descriptions.get(action, "Activity performed")

def get_quick_actions(user_email: str) -> List[QuickAction]:
    """Get quick actions based on user account type"""
    from .auth import users_db
    
    user = users_db.get(user_email, {})
    account_type = user.get("account_type", "individual")
    
    base_actions = [
        QuickAction(
            id="upload_document",
            label="Upload Document",
            description="Upload a new document for signing",
            icon="upload",
            url="/documents/upload",
            enabled=True
        ),
        QuickAction(
            id="create_template",
            label="Create Template",
            description="Create a reusable document template",
            icon="template",
            url="/templates/create",
            enabled=True
        ),
        QuickAction(
            id="view_compliance",
            label="Check Compliance",
            description="Review ETA 2019 compliance status",
            icon="shield",
            url="/compliance",
            enabled=True
        )
    ]
    
    # Add account-type specific actions
    if account_type in ["business", "enterprise", "government"]:
        base_actions.extend([
            QuickAction(
                id="manage_team",
                label="Manage Team",
                description="Add and manage team members",
                icon="users",
                url="/team",
                enabled=True
            ),
            QuickAction(
                id="view_analytics",
                label="View Analytics",
                description="See detailed usage analytics",
                icon="bar-chart",
                url="/analytics",
                enabled=True
            )
        ])
    
    if account_type == "government":
        base_actions.append(
            QuickAction(
                id="government_forms",
                label="Government Forms",
                description="Access government form templates",
                icon="landmark",
                url="/templates?category=government",
                enabled=True
            )
        )
    
    return base_actions

def get_compliance_status(documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Get compliance status summary"""
    if not documents:
        return {
            "eta_2019_compliant": True,
            "cran_accredited": True,
            "issues": [],
            "score": 0
        }
    
    compliant_docs = sum(1 for doc in documents if doc.get("eta_2019_compliant", False))
    score = (compliant_docs / len(documents)) * 100
    
    issues = []
    if score < 100:
        non_compliant_count = len(documents) - compliant_docs
        issues.append(f"{non_compliant_count} document(s) need compliance review")
    
    return {
        "eta_2019_compliant": score == 100,
        "cran_accredited": True,  # Mock - always true for now
        "issues": issues,
        "score": round(score, 1),
        "compliant_documents": compliant_docs,
        "total_documents": len(documents)
    }

def get_user_notifications(user_email: str, unread_only: bool = False, limit: int = 10) -> List[Dict[str, Any]]:
    """Get user notifications"""
    # Mock notifications - in production, fetch from database
    notifications = [
        {
            "id": "notif_1",
            "type": "signature_request",
            "title": "New Signature Request",
            "message": "John Doe has requested your signature on Employment Contract",
            "timestamp": datetime.utcnow() - timedelta(hours=2),
            "read": False,
            "action_url": "/signatures/pending",
            "priority": "high"
        },
        {
            "id": "notif_2",
            "type": "document_completed",
            "title": "Document Completed",
            "message": "Service Agreement has been fully signed",
            "timestamp": datetime.utcnow() - timedelta(days=1),
            "read": True,
            "action_url": "/documents/completed",
            "priority": "medium"
        },
        {
            "id": "notif_3",
            "type": "compliance_alert",
            "title": "Compliance Review Required",
            "message": "2 documents need ETA 2019 compliance review",
            "timestamp": datetime.utcnow() - timedelta(days=2),
            "read": False,
            "action_url": "/compliance",
            "priority": "medium"
        },
        {
            "id": "notif_4",
            "type": "system_update",
            "title": "New Features Available",
            "message": "AI document analysis is now available for your account",
            "timestamp": datetime.utcnow() - timedelta(days=3),
            "read": True,
            "action_url": "/features/ai",
            "priority": "low"
        },
        {
            "id": "notif_5",
            "type": "expiry_warning",
            "title": "Document Expiring Soon",
            "message": "NDA Agreement will expire in 2 days",
            "timestamp": datetime.utcnow() - timedelta(days=5),
            "read": False,
            "action_url": "/documents/expiring",
            "priority": "high"
        }
    ]
    
    # Filter by read status if requested
    if unread_only:
        notifications = [n for n in notifications if not n["read"]]
    
    # Sort by timestamp (newest first)
    notifications.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Apply limit
    return notifications[:limit]

@router.get("/widgets/signature-requests")
async def get_signature_requests_widget(current_user_email: str = Depends(verify_token)):
    """Get signature requests widget data"""
    from .signatures import signatures_db
    from .documents import documents_db
    
    # Get signature requests where user is a recipient
    user_signature_requests = []
    for sig_request in signatures_db.values():
        for recipient in sig_request["recipients"]:
            if recipient["email"] == current_user_email and recipient["status"] == "pending":
                # Get document info
                document = documents_db.get(sig_request["document_id"])
                user_signature_requests.append({
                    "signature_request_id": sig_request["id"],
                    "document_title": document["title"] if document else "Unknown Document",
                    "sender": sig_request["created_by"],
                    "expires_at": sig_request["expires_at"],
                    "message": sig_request.get("message"),
                    "urgent": (sig_request["expires_at"] - datetime.utcnow()).days <= 1
                })
    
    # Sort by expiry date (most urgent first)
    user_signature_requests.sort(key=lambda x: x["expires_at"])
    
    return {
        "pending_requests": user_signature_requests[:5],  # Show top 5
        "total_pending": len(user_signature_requests),
        "urgent_count": sum(1 for req in user_signature_requests if req["urgent"])
    }

@router.get("/widgets/recent-documents")
async def get_recent_documents_widget(
    limit: int = 5,
    current_user_email: str = Depends(verify_token)
):
    """Get recent documents widget data"""
    from .documents import documents_db
    
    user_documents = [
        doc for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    # Sort by creation date (newest first)
    user_documents.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Format for widget
    recent_docs = []
    for doc in user_documents[:limit]:
        recent_docs.append({
            "id": doc["id"],
            "title": doc["title"],
            "status": doc["status"],
            "created_at": doc["created_at"],
            "file_type": doc["file_type"],
            "eta_2019_compliant": doc.get("eta_2019_compliant", False)
        })
    
    return {
        "recent_documents": recent_docs,
        "total_documents": len(user_documents)
    }

@router.get("/widgets/compliance-score")
async def get_compliance_score_widget(current_user_email: str = Depends(verify_token)):
    """Get compliance score widget data"""
    from .documents import documents_db
    
    user_documents = [
        doc for doc in documents_db.values()
        if doc["created_by"] == current_user_email
    ]
    
    if not user_documents:
        return {
            "overall_score": 0,
            "eta_2019_score": 0,
            "cran_score": 0,
            "trend": "neutral",
            "last_check": None
        }
    
    # Calculate scores
    eta_compliant = sum(1 for doc in user_documents if doc.get("eta_2019_compliant", False))
    eta_score = (eta_compliant / len(user_documents)) * 100
    cran_score = 98  # Mock CRAN score
    overall_score = (eta_score + cran_score) / 2
    
    # Mock trend calculation
    trend = "improving" if overall_score > 85 else "declining" if overall_score < 70 else "stable"
    
    return {
        "overall_score": round(overall_score, 1),
        "eta_2019_score": round(eta_score, 1),
        "cran_score": cran_score,
        "trend": trend,
        "last_check": datetime.utcnow() - timedelta(hours=6),
        "compliant_documents": eta_compliant,
        "total_documents": len(user_documents)
    }

@router.get("/export/dashboard-report")
async def export_dashboard_report(
    format: str = "pdf",  # pdf, excel, json
    current_user_email: str = Depends(verify_token)
):
    """Export comprehensive dashboard report"""
    
    # Get all dashboard data
    overview = await get_dashboard_overview(current_user_email)
    monthly_stats = await get_monthly_stats(12, current_user_email)  # 12 months
    document_types = await get_document_type_stats(current_user_email)
    compliance_summary = await get_compliance_summary(current_user_email)
    
    report_data = {
        "report_id": f"dashboard_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        "generated_at": datetime.utcnow(),
        "user_email": current_user_email,
        "overview": overview.dict(),
        "monthly_statistics": monthly_stats,
        "document_type_analysis": document_types,
        "compliance_summary": compliance_summary,
        "report_period": {
            "start_date": datetime.utcnow() - timedelta(days=365),
            "end_date": datetime.utcnow()
        }
    }
    
    if format == "json":
        return report_data
    else:
        # In production, generate actual PDF/Excel report
        return {
            "report_data": report_data,
            "download_url": f"/api/v1/dashboard/reports/{report_data['report_id']}.{format}",
            "format": format,
            "expires_at": datetime.utcnow() + timedelta(hours=24)
        }

@router.get("/health-check")
async def dashboard_health_check():
    """Health check endpoint for dashboard services"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "documents": "operational",
            "signatures": "operational", 
            "compliance": "operational",
            "notifications": "operational"
        },
        "eta_2019_compliant": True,
        "cran_accredited": True
    }
