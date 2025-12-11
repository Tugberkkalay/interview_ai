from django.core.management.base import BaseCommand
from interview_api.ats_service import ATSService


class Command(BaseCommand):
    help = 'Retry failed webhook deliveries'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🔄 Retrying failed webhooks...'))
        
        ATSService.retry_failed_webhooks()
        
        self.stdout.write(self.style.SUCCESS('✅ Webhook retry completed'))

