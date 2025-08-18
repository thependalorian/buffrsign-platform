# scripts/maintain-knowledge-base.py
import os
import json
import yaml
from datetime import datetime, timedelta
from typing import List, Dict

class KnowledgeBaseMaintenance:
    def __init__(self):
        self.knowledge_base_path = "./backend/data/knowledge-base"
        self.legal_documents_path = "./backend/data/legal-documents"
    
    def check_document_currency(self) -> List[Dict]:
        """Check if legal documents are current and up-to-date"""
        outdated_documents = []
        
        # Check ETA 2019 amendments
        eta_last_updated = self._get_file_modified_date("legal-documents/namibia/eta-2019/eta-2019-full-text.md")
        if eta_last_updated < datetime.now() - timedelta(days=90):
            outdated_documents.append({
                "document": "ETA 2019",
                "last_updated": eta_last_updated,
                "recommendation": "Check for recent amendments or regulations"
            })
        
        return outdated_documents
    
    def validate_legal_references(self) -> List[Dict]:
        """Validate that legal references are accurate and current"""
        validation_results = []
        
        # Load legal dictionary
        with open(f"{self.knowledge_base_path}/legal-dictionary.json", 'r') as f:
            legal_dict = json.load(f)
        
        # Validate ETA 2019 references
        for term, definition in legal_dict.get("eta_2019_terms", {}).items():
            legal_ref = definition.get("legal_reference")
            if not self._validate_legal_reference(legal_ref):
                validation_results.append({
                    "term": term,
                    "reference": legal_ref,
                    "status": "invalid_or_outdated"
                })
        
        return validation_results
    
    def update_compliance_rules(self):
        """Update compliance rules based on latest legal developments"""
        # Check for new CRAN requirements
        # Update ETA 2019 interpretations
        # Refresh regional law changes
        pass
    
    def generate_knowledge_base_report(self) -> Dict:
        """Generate comprehensive knowledge base status report"""
        return {
            "last_updated": datetime.now().isoformat(),
            "document_count": self._count_documents(),
            "outdated_documents": self.check_document_currency(),
            "validation_issues": self.validate_legal_references(),
            "coverage_analysis": self._analyze_coverage(),
            "recommendations": self._generate_recommendations()
        }

# Automated knowledge base updates
def schedule_knowledge_base_updates():
    """Schedule regular knowledge base maintenance"""
    maintenance = KnowledgeBaseMaintenance()
    
    # Daily: Check for document updates
    # Weekly: Validate legal references  
    # Monthly: Generate comprehensive report
    # Quarterly: Review and update compliance rules
    
    report = maintenance.generate_knowledge_base_report()
    
    # Save report
    with open("./logs/knowledge-base-report.json", "w") as f:
        json.dump(report, f, indent=2)
