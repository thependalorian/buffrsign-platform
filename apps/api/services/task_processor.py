import asyncio
import json
from datetime import datetime
from typing import Dict, Any, Optional
from .redis_service import redis_service
from .email_service import send_email
from .compliance_service import run_compliance_check

class TaskProcessor:
    def __init__(self):
        self.running = False
        self.processors = {
            'email_notifications': self.process_email_task,
            'compliance_checks': self.process_compliance_task,
            'document_processing': self.process_document_task,
            'audit_trail': self.process_audit_task,
            'cleanup': self.process_cleanup_task
        }
    
    async def start(self):
        """Start task processing"""
        self.running = True
        print(" BuffrSign Task Processor started")
        
        # Start processors for each queue
        tasks = []
        for queue_name in self.processors.keys():
            tasks.append(asyncio.create_task(self.process_queue(queue_name)))
        
        await asyncio.gather(*tasks)
    
    async def stop(self):
        """Stop task processing"""
        self.running = False
        print(" BuffrSign Task Processor stopped")
    
    async def process_queue(self, queue_name: str):
        """Process tasks from a specific queue"""
        while self.running:
            try:
                # Process tasks from Supabase queue
                task = await asyncio.get_event_loop().run_in_executor(
                    None, redis_service.get_next_background_task, queue_name
                )
                
                if task:
                    await self.process_task(queue_name, task)
                    # Mark task as completed
                    await asyncio.get_event_loop().run_in_executor(
                        None, redis_service.complete_background_task, task['id']
                    )
                else:
                    await asyncio.sleep(1)  # Prevent busy waiting
                
            except Exception as e:
                print(f"❌ Error processing queue {queue_name}: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    async def process_delayed_tasks(self, queue_name: str):
        """Move delayed tasks to immediate queue when ready"""
        delayed_key = redis_service._key(f"queue:{queue_name}:delayed")
        current_time = datetime.now().timestamp()
        
        # Get tasks ready for processing
        ready_tasks = redis_service.client.zrangebyscore(
            delayed_key, 0, current_time, withscores=True
        )
        
        for task_json, score in ready_tasks:
            # Move to immediate queue
            queue_key = redis_service._key(f"queue:{queue_name}")
            redis_service.client.lpush(queue_key, task_json)
            redis_service.client.zrem(delayed_key, task_json)
    
    async def process_task(self, queue_name: str, task: Dict[str, Any]):
        """Process individual task"""
        try:
            processor = self.processors.get(queue_name)
            if processor:
                await processor(task)
                print(f"✅ Processed task {task['id']} from queue {queue_name}")
            else:
                print(f"⚠️ No processor found for queue {queue_name}")
                
        except Exception as e:
            print(f"❌ Error processing task {task['id']}: {e}")
            # Could implement retry logic here
    
    async def process_email_task(self, task: Dict[str, Any]):
        """Process email notification tasks"""
        email_data = task['data']
        
        if email_data['type'] == 'signature_request':
            await self.send_signature_request_email(email_data)
        elif email_data['type'] == 'signature_reminder':
            await self.send_signature_reminder_email(email_data)
        elif email_data['type'] == 'document_completed':
            await self.send_completion_email(email_data)
        elif email_data['type'] == 'compliance_alert':
            await self.send_compliance_alert_email(email_data)
    
    async def send_signature_request_email(self, data: Dict[str, Any]):
        """Send signature request email"""
        template_data = {
            'recipient_name': data['recipient_name'],
            'document_title': data['document_title'],
            'sender_name': data['sender_name'],
            'signing_url': f"{data['base_url']}/sign/{data['signature_request_id']}?email={data['recipient_email']}",
            'expires_at': data['expires_at'],
            'message': data.get('message', ''),
            'eta_2019_compliant': True
        }
        
        await send_email(
            to=data['recipient_email'],
            subject=f"Signature Request: {data['document_title']}",
            template='signature_request',
            template_data=template_data
        )
        
        # Track email sent
        redis_service.cache_set(
            f"email_sent:{data['signature_request_id']}:{data['recipient_email']}",
            {'sent_at': datetime.now().isoformat()},
            ttl=86400 * 7  # 7 days
        )
    
    async def send_signature_reminder_email(self, data: Dict[str, Any]):
        """Send signature reminder email"""
        template_data = {
            'recipient_name': data['recipient_name'],
            'document_title': data['document_title'],
            'sender_name': data['sender_name'],
            'signing_url': f"{data['base_url']}/sign/{data['signature_request_id']}?email={data['recipient_email']}",
            'expires_at': data['expires_at'],
            'days_remaining': data['days_remaining']
        }
        
        await send_email(
            to=data['recipient_email'],
            subject=f"Reminder: Signature Required - {data['document_title']}",
            template='signature_reminder',
            template_data=template_data
        )
    
    async def process_compliance_task(self, task: Dict[str, Any]):
        """Process compliance checking tasks"""
        compliance_data = task['data']
        
        if compliance_data['type'] == 'eta_2019_check':
            result = await run_compliance_check(
                compliance_data['document_id'],
                ['eta_2019']
            )
            
            # Cache result
            redis_service.cache_compliance_result(
                compliance_data['document_id'],
                result,
                ttl=3600  # 1 hour
            )
            
            # Send notification if issues found
            if result['issues']:
                redis_service.send_notification(
                    compliance_data['user_id'],
                    {
                        'type': 'compliance_issues',
                        'title': 'Compliance Issues Found',
                        'message': f"Document {compliance_data['document_title']} has compliance issues",
                        'document_id': compliance_data['document_id'],
                        'issues_count': len(result['issues'])
                    }
                )
    
    async def process_document_task(self, task: Dict[str, Any]):
        """Process document-related tasks"""
        doc_data = task['data']
        
        if doc_data['type'] == 'ai_analysis':
            # Trigger AI document analysis
            await self.run_ai_analysis(doc_data)
        elif doc_data['type'] == 'pdf_processing':
            # Process PDF for signature fields
            await self.process_pdf_document(doc_data)
        elif doc_data['type'] == 'generate_thumbnail':
            # Generate document thumbnail
            await self.generate_document_thumbnail(doc_data)
    
    async def run_ai_analysis(self, data: Dict[str, Any]):
        """Run AI analysis on document"""
        # Mock AI analysis - integrate with LlamaIndex in production
        analysis_result = {
            'document_id': data['document_id'],
            'compliance_score': 95,
            'detected_fields': [
                {'type': 'signature', 'page': 1, 'x': 100, 'y': 700},
                {'type': 'date', 'page': 1, 'x': 300, 'y': 700}
            ],
            'key_clauses': [
                {'type': 'termination', 'content': 'Either party may terminate...'},
                {'type': 'confidentiality', 'content': 'All information shall remain...'}
            ],
            'recommendations': [
                'Consider adding electronic signature clause',
                'Review termination notice period'
            ]
        }
        
        # Cache analysis result
        redis_service.cache_set(
            f"ai_analysis:{data['document_id']}",
            analysis_result,
            ttl=86400  # 24 hours
        )
        
        # Notify user
        redis_service.send_notification(
            data['user_id'],
            {
                'type': 'ai_analysis_complete',
                'title': 'AI Analysis Complete',
                'message': f"AI analysis completed for {data['document_title']}",
                'document_id': data['document_id'],
                'compliance_score': analysis_result['compliance_score']
            }
        )
    
    async def process_audit_task(self, task: Dict[str, Any]):
        """Process audit trail tasks"""
        audit_data = task['data']
        
        # Store audit entry in database (mock)
        audit_entry = {
            'id': f"audit_{datetime.now().timestamp()}",
            'document_id': audit_data['document_id'],
            'action': audit_data['action'],
            'user': audit_data['user'],
            'timestamp': datetime.now().isoformat(),
            'ip_address': audit_data.get('ip_address'),
            'user_agent': audit_data.get('user_agent'),
            'details': audit_data.get('details', {})
        }
        
        # Cache recent audit entries
        audit_key = f"audit_trail:{audit_data['document_id']}"
        cached_entries = redis_service.cache_get(audit_key) or []
        cached_entries.insert(0, audit_entry)
        cached_entries = cached_entries[:100]  # Keep last 100 entries
        
        redis_service.cache_set(audit_key, cached_entries, ttl=86400)
    
    async def process_cleanup_task(self, task: Dict[str, Any]):
        """Process cleanup tasks"""
        cleanup_data = task['data']
        
        if cleanup_data['type'] == 'expired_documents':
            # Clean up expired documents
            await self.cleanup_expired_documents()
        elif cleanup_data['type'] == 'old_sessions':
            # Clean up old sessions
            await self.cleanup_old_sessions()
        elif cleanup_data['type'] == 'cache_cleanup':
            # Clean up old cache entries
            await self.cleanup_old_cache()
    
    async def cleanup_expired_documents(self):
        """Clean up expired documents and related data"""
        # This would integrate with actual database in production
        print(" Cleaning up expired documents...")
        
        # Clean up related Redis keys
        expired_keys = redis_service.client.keys(redis_service._key("document:*:expired"))
        if expired_keys:
            redis_service.client.delete(*expired_keys)

# Global task processor instance
task_processor = TaskProcessor()

# Helper function to add tasks
def add_background_task(queue: str, task_data: Dict[str, Any], delay: int = 0):
    """Add task to background processing queue"""
    scheduled_at = None
    if delay > 0:
        scheduled_at = datetime.now() + timedelta(seconds=delay)
    
    redis_service.add_background_task(queue, 'custom', task_data, scheduled_at=scheduled_at)
