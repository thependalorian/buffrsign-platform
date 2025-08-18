"""
BuffrSign Workflow Orchestration

Main workflow orchestration system that coordinates multiple agents
for comprehensive document processing and signature workflows.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
import logging
import asyncio

from ..agents.document_agent import BuffrSignDocumentAgent
from ..agents.compliance_agent import ETAComplianceAgent, CRANAccreditationAgent
from ..agents.workflow_agent import SignatureWorkflowAgent
from ..agents.government_agent import GovernmentIntegrationAgent

logger = logging.getLogger(__name__)


class BuffrSignWorkflow:
    """
    Main BuffrSign workflow orchestration system.
    
    Coordinates multiple agents to provide comprehensive document processing,
    compliance checking, and signature workflow management.
    """
    
    def __init__(self, workflow_id: str, config: Optional[Dict[str, Any]] = None):
        self.workflow_id = workflow_id
        self.config = config or {}
        self.status = "initialized"
        self.created_at = datetime.utcnow()
        self.steps: List[Dict[str, Any]] = []
        self.results: Dict[str, Any] = {}
        
        # Initialize agents
        self.document_agent = BuffrSignDocumentAgent(f"{workflow_id}_document")
        self.eta_compliance_agent = ETAComplianceAgent(f"{workflow_id}_eta")
        self.cran_agent = CRANAccreditationAgent(f"{workflow_id}_cran")
        self.workflow_agent = SignatureWorkflowAgent(f"{workflow_id}_workflow")
        self.government_agent = GovernmentIntegrationAgent(f"{workflow_id}_government")
        
        # Agent registry
        self.agents = {
            "document": self.document_agent,
            "eta_compliance": self.eta_compliance_agent,
            "cran_accreditation": self.cran_agent,
            "signature_workflow": self.workflow_agent,
            "government_integration": self.government_agent
        }
    
    async def execute_comprehensive_workflow(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute comprehensive BuffrSign workflow.
        
        This workflow coordinates all agents to provide end-to-end
        document processing, compliance checking, and signature management.
        """
        self.status = "executing"
        self.steps = []
        
        try:
            logger.info(f"Starting comprehensive workflow {self.workflow_id}")
            
            # Step 1: Document Analysis
            step1_result = await self._execute_document_analysis(input_data)
            self.steps.append({
                "step_id": 1,
                "name": "document_analysis",
                "status": "completed",
                "result": step1_result,
                "timestamp": datetime.utcnow()
            })
            
            # Step 2: ETA Compliance Check
            step2_result = await self._execute_eta_compliance_check(input_data, step1_result)
            self.steps.append({
                "step_id": 2,
                "name": "eta_compliance_check",
                "status": "completed",
                "result": step2_result,
                "timestamp": datetime.utcnow()
            })
            
            # Step 3: CRAN Accreditation Check
            step3_result = await self._execute_cran_accreditation_check(input_data)
            self.steps.append({
                "step_id": 3,
                "name": "cran_accreditation_check",
                "status": "completed",
                "result": step3_result,
                "timestamp": datetime.utcnow()
            })
            
            # Step 4: Government Integration (if applicable)
            if input_data.get("government_integration_required", False):
                step4_result = await self._execute_government_integration(input_data)
                self.steps.append({
                    "step_id": 4,
                    "name": "government_integration",
                    "status": "completed",
                    "result": step4_result,
                    "timestamp": datetime.utcnow()
                })
            
            # Step 5: Signature Workflow Orchestration
            step5_result = await self._execute_signature_workflow(input_data, {
                "document_analysis": step1_result,
                "eta_compliance": step2_result,
                "cran_accreditation": step3_result
            })
            self.steps.append({
                "step_id": 5,
                "name": "signature_workflow",
                "status": "completed",
                "result": step5_result,
                "timestamp": datetime.utcnow()
            })
            
            # Compile final results
            final_result = await self._compile_workflow_results()
            
            self.status = "completed"
            self.results = final_result
            
            logger.info(f"Comprehensive workflow {self.workflow_id} completed successfully")
            
            return final_result
            
        except Exception as e:
            self.status = "failed"
            logger.error(f"Comprehensive workflow {self.workflow_id} failed: {e}")
            raise
    
    async def _execute_document_analysis(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute document analysis using document agent"""
        logger.info(f"Executing document analysis for workflow {self.workflow_id}")
        
        document_data = {
            "document_path": input_data.get("document_path"),
            "document_type": input_data.get("document_type", "contract"),
            "analysis_level": input_data.get("analysis_level", "comprehensive")
        }
        
        return await self.document_agent.process(document_data)
    
    async def _execute_eta_compliance_check(self, input_data: Dict[str, Any], 
                                          document_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Execute ETA compliance check using compliance agent"""
        logger.info(f"Executing ETA compliance check for workflow {self.workflow_id}")
        
        compliance_data = {
            "document_path": input_data.get("document_path"),
            "document_content": input_data.get("document_content", ""),
            "document_type": input_data.get("document_type", "contract"),
            "document_analysis": document_analysis
        }
        
        return await self.eta_compliance_agent.process(compliance_data)
    
    async def _execute_cran_accreditation_check(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute CRAN accreditation check using CRAN agent"""
        logger.info(f"Executing CRAN accreditation check for workflow {self.workflow_id}")
        
        cran_data = {
            "platform_config": input_data.get("platform_config", {}),
            "security_measures": input_data.get("security_measures", {})
        }
        
        return await self.cran_agent.process(cran_data)
    
    async def _execute_government_integration(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute government integration using government agent"""
        logger.info(f"Executing government integration for workflow {self.workflow_id}")
        
        government_data = {
            "integration_type": input_data.get("government_integration_type", "id_verification"),
            "document_type": input_data.get("document_type", "government_document"),
            "user_data": input_data.get("user_data", {}),
            "government_system": input_data.get("government_system", "mha")
        }
        
        return await self.government_agent.process(government_data)
    
    async def _execute_signature_workflow(self, input_data: Dict[str, Any], 
                                        previous_results: Dict[str, Any]) -> Dict[str, Any]:
        """Execute signature workflow using workflow agent"""
        logger.info(f"Executing signature workflow for workflow {self.workflow_id}")
        
        workflow_data = {
            "workflow_type": input_data.get("workflow_type", "simple"),
            "document_id": input_data.get("document_id"),
            "recipients": input_data.get("recipients", []),
            "workflow_config": input_data.get("workflow_config", {}),
            "previous_results": previous_results
        }
        
        return await self.workflow_agent.process(workflow_data)
    
    async def _compile_workflow_results(self) -> Dict[str, Any]:
        """Compile final workflow results from all steps"""
        logger.info(f"Compiling workflow results for {self.workflow_id}")
        
        # Extract results from each step
        step_results = {}
        for step in self.steps:
            step_results[step["name"]] = step["result"]
        
        # Calculate overall workflow metrics
        total_steps = len(self.steps)
        completed_steps = len([s for s in self.steps if s["status"] == "completed"])
        success_rate = (completed_steps / total_steps) * 100 if total_steps > 0 else 0
        
        # Generate workflow insights
        insights = await self._generate_workflow_insights(step_results)
        
        # Compile final result
        final_result = {
            "workflow_id": self.workflow_id,
            "status": self.status,
            "success_rate": success_rate,
            "total_steps": total_steps,
            "completed_steps": completed_steps,
            "step_results": step_results,
            "insights": insights,
            "recommendations": await self._generate_workflow_recommendations(step_results),
            "timestamp": datetime.utcnow(),
            "execution_time": (datetime.utcnow() - self.created_at).total_seconds()
        }
        
        return final_result
    
    async def _generate_workflow_insights(self, step_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights from workflow execution"""
        insights = {
            "overall_performance": "excellent",
            "compliance_status": "compliant",
            "efficiency_score": 95,
            "optimization_opportunities": [],
            "risk_assessment": "low"
        }
        
        # Analyze document analysis results
        if "document_analysis" in step_results:
            doc_analysis = step_results["document_analysis"]
            if doc_analysis.get("key_clauses"):
                insights["document_complexity"] = "high"
            else:
                insights["document_complexity"] = "low"
        
        # Analyze compliance results
        if "eta_compliance_check" in step_results:
            eta_compliance = step_results["eta_compliance_check"]
            compliance_score = eta_compliance.get("compliance_score", 0)
            if compliance_score >= 80:
                insights["compliance_status"] = "compliant"
            elif compliance_score >= 60:
                insights["compliance_status"] = "needs_review"
            else:
                insights["compliance_status"] = "non_compliant"
        
        # Analyze CRAN accreditation results
        if "cran_accreditation_check" in step_results:
            cran_accreditation = step_results["cran_accreditation_check"]
            readiness_score = cran_accreditation.get("readiness_score", 0)
            if readiness_score >= 85:
                insights["accreditation_readiness"] = "ready"
            else:
                insights["accreditation_readiness"] = "needs_work"
        
        # Analyze signature workflow results
        if "signature_workflow" in step_results:
            signature_workflow = step_results["signature_workflow"]
            if signature_workflow.get("status") == "completed":
                insights["workflow_efficiency"] = "high"
            else:
                insights["workflow_efficiency"] = "needs_improvement"
        
        return insights
    
    async def _generate_workflow_recommendations(self, step_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on workflow results"""
        recommendations = []
        
        # Document analysis recommendations
        if "document_analysis" in step_results:
            doc_analysis = step_results["document_analysis"]
            if doc_analysis.get("recommendations"):
                recommendations.extend(doc_analysis["recommendations"])
        
        # Compliance recommendations
        if "eta_compliance_check" in step_results:
            eta_compliance = step_results["eta_compliance_check"]
            if eta_compliance.get("recommendations"):
                recommendations.extend(eta_compliance["recommendations"])
        
        # CRAN accreditation recommendations
        if "cran_accreditation_check" in step_results:
            cran_accreditation = step_results["cran_accreditation_check"]
            if cran_accreditation.get("accreditation_plan", {}).get("immediate_actions"):
                recommendations.extend(cran_accreditation["accreditation_plan"]["immediate_actions"])
        
        # Government integration recommendations
        if "government_integration" in step_results:
            government_integration = step_results["government_integration"]
            if government_integration.get("result", {}).get("recommendations"):
                recommendations.extend(government_integration["result"]["recommendations"])
        
        # Signature workflow recommendations
        if "signature_workflow" in step_results:
            signature_workflow = step_results["signature_workflow"]
            if signature_workflow.get("optimization_suggestions"):
                recommendations.extend(signature_workflow["optimization_suggestions"])
        
        # General recommendations
        recommendations.extend([
            "Implement automated workflow monitoring",
            "Establish regular compliance audits",
            "Maintain up-to-date knowledge bases",
            "Provide comprehensive user training",
            "Monitor and optimize performance metrics"
        ])
        
        return list(set(recommendations))  # Remove duplicates
    
    def get_workflow_status(self) -> Dict[str, Any]:
        """Get current workflow status"""
        return {
            "workflow_id": self.workflow_id,
            "status": self.status,
            "created_at": self.created_at,
            "total_steps": len(self.steps),
            "completed_steps": len([s for s in self.steps if s["status"] == "completed"]),
            "agent_status": {
                agent_name: agent.get_status() for agent_name, agent in self.agents.items()
            }
        }
    
    def get_agent_events(self, agent_name: str) -> List[Any]:
        """Get events from a specific agent"""
        if agent_name in self.agents:
            return self.agents[agent_name].get_events()
        return []
    
    async def cancel_workflow(self) -> Dict[str, Any]:
        """Cancel the current workflow"""
        self.status = "cancelled"
        
        # Cancel all agent operations
        for agent_name, agent in self.agents.items():
            agent.update_state("cancelled", "workflow_cancelled")
        
        return {
            "workflow_id": self.workflow_id,
            "status": "cancelled",
            "message": "Workflow cancelled successfully",
            "timestamp": datetime.utcnow()
        }
