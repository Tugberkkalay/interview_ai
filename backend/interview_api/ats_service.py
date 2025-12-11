"""
ATS Integration Service
Handles communication with external ATS systems
"""
import requests
import logging
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class ATSService:
    """Service for ATS integration"""
    
    @staticmethod
    def fetch_interview_data(endpoint: str, api_token: str) -> dict:
        """
        Fetch interview data from ATS
        This data passes through us (proxy) but is NOT stored
        """
        try:
            response = requests.get(
                endpoint,
                headers={
                    'Authorization': f'Bearer {api_token}',
                    'Content-Type': 'application/json'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"ATS returned status {response.status_code}")
                
        except Exception as e:
            logger.error(f"ATS data fetch failed: {str(e)}")
            raise Exception(f"ATS'den veri alınamadı: {str(e)}")
    
    @staticmethod
    def send_report_to_webhook(
        webhook_url: str,
        api_token: str,
        session_id: str,
        report_data: dict,
        interview_token: str
    ) -> bool:
        """
        Send interview report to ATS webhook
        Returns True if successful
        """
        payload = {
            'session_id': session_id,
            'interview_token': interview_token,
            'completed_at': timezone.now().isoformat(),
            'report': report_data
        }
        
        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers={
                    'Authorization': f'Bearer {api_token}',
                    'Content-Type': 'application/json'
                },
                timeout=30
            )
            
            if response.status_code in [200, 201, 204]:
                logger.info(f"Report sent successfully to {webhook_url}")
                return True
            else:
                logger.error(f"Webhook failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Webhook request failed: {str(e)}")
            return False
    
    @staticmethod
    def retry_failed_webhooks():
        """
        Retry failed webhook deliveries
        Called by scheduled task (cron/celery)
        """
        from .models import InterviewSession
        
        # Find sessions with temp reports that need retry
        sessions_to_retry = InterviewSession.objects.filter(
            status='completed',
            webhook_retry_count__lt=5,  # Max 5 retries
            temp_report_expires_at__gt=timezone.now()
        ).exclude(
            temp_report_encrypted=''
        )
        
        for session in sessions_to_retry:
            # Get encrypted report
            report_data = session.get_temp_report()
            if not report_data:
                continue
            
            # Try to send
            success = ATSService.send_report_to_webhook(
                webhook_url=session.ats_webhook_url,
                api_token=session.ats_api_token,
                session_id=session.external_id,
                report_data=report_data,
                interview_token=str(session.token)
            )
            
            # Update session
            session.webhook_retry_count += 1
            session.last_webhook_attempt = timezone.now()
            
            if success:
                # Success! Clear temp data
                session.clear_temp_report()
                logger.info(f"Retry successful for session {session.token}")
            else:
                session.webhook_last_error = f"Retry {session.webhook_retry_count} failed"
                session.save()
                logger.warning(f"Retry {session.webhook_retry_count} failed for session {session.token}")
    
    @staticmethod
    def cleanup_expired_temp_data():
        """
        Delete expired temporary reports
        Called by scheduled task
        """
        from .models import InterviewSession
        
        expired_sessions = InterviewSession.objects.filter(
            temp_report_expires_at__lt=timezone.now(),
            temp_report_encrypted__isnull=False
        )
        
        count = expired_sessions.count()
        
        # Clear temp data
        for session in expired_sessions:
            session.clear_temp_report()
            logger.info(f"Cleared expired temp report for session {session.token}")
        
        return count

