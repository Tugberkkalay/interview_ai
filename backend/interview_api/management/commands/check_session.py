"""
Management command to check session details
Usage: python manage.py check_session <token>
"""
from django.core.management.base import BaseCommand
from interview_api.models import InterviewSession


class Command(BaseCommand):
    help = 'Check session details and configuration'

    def add_arguments(self, parser):
        parser.add_argument('token', type=str, help='Session token (UUID)')

    def handle(self, *args, **options):
        token = options['token']
        
        try:
            session = InterviewSession.objects.get(token=token)
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Session found: {token}\n'))
            
            # Basic info
            self.stdout.write(f'Status: {session.status}')
            self.stdout.write(f'Created: {session.created_at}')
            self.stdout.write(f'Expires: {session.expires_at}')
            self.stdout.write(f'Is Expired: {session.is_expired()}')
            
            # Company info
            if session.company:
                self.stdout.write(f'Company: {session.company.company_name} ({session.company.user.email})')
            else:
                self.stdout.write(self.style.WARNING('Company: None'))
            
            # ATS configuration
            self.stdout.write('\n--- ATS Configuration ---')
            self.stdout.write(f'External ID: {session.external_id or "Not set"}')
            
            if session.ats_data_endpoint:
                self.stdout.write(f'ATS Data Endpoint: {session.ats_data_endpoint}')
                
                # Check for localhost
                if 'localhost' in session.ats_data_endpoint or '127.0.0.1' in session.ats_data_endpoint:
                    self.stdout.write(self.style.ERROR('⚠️  ERROR: Endpoint is localhost! Production needs external URL'))
            else:
                self.stdout.write(self.style.ERROR('⚠️  ERROR: ATS Data Endpoint NOT SET'))
            
            if session.ats_webhook_url:
                self.stdout.write(f'ATS Webhook URL: {session.ats_webhook_url}')
            else:
                self.stdout.write(self.style.ERROR('⚠️  ERROR: ATS Webhook URL NOT SET'))
            
            if session.ats_api_token:
                token_preview = session.ats_api_token[:10] + '...' if len(session.ats_api_token) > 10 else session.ats_api_token
                self.stdout.write(f'ATS API Token: {token_preview} (length: {len(session.ats_api_token)})')
            else:
                self.stdout.write(self.style.ERROR('⚠️  ERROR: ATS API Token NOT SET'))
            
            # Recommendation
            self.stdout.write('\n--- Recommendation ---')
            if not session.ats_data_endpoint or not session.ats_api_token:
                self.stdout.write(self.style.ERROR(
                    'This session cannot work! Missing ATS endpoint or token.'
                ))
                self.stdout.write('This session was probably created manually without proper ATS config.')
                self.stdout.write('\nTo fix: Create session using POST /api/session/create/ with proper ATS config')
            elif 'localhost' in session.ats_data_endpoint or '127.0.0.1' in session.ats_data_endpoint:
                self.stdout.write(self.style.ERROR(
                    'This session uses localhost endpoint. Change to external URL!'
                ))
            else:
                self.stdout.write(self.style.SUCCESS('✓ Session configuration looks OK'))
                
        except InterviewSession.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Session not found: {token}'))

