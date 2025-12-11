from django.core.management.base import BaseCommand
from interview_api.ats_service import ATSService


class Command(BaseCommand):
    help = 'Clean up expired temporary reports'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🧹 Cleaning up expired temporary data...'))
        
        count = ATSService.cleanup_expired_temp_data()
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Cleaned up {count} expired temporary reports')
        )

