"""
Management command to clean up legacy mode sessions
Removes sessions that don't have ATS endpoints configured
"""
from django.core.management.base import BaseCommand
from interview_api.models import InterviewSession


class Command(BaseCommand):
    help = 'Clean up legacy mode sessions (sessions without ATS endpoints)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Find legacy sessions (no ATS endpoints)
        legacy_sessions = InterviewSession.objects.filter(
            ats_data_endpoint='',
            ats_webhook_url=''
        ) | InterviewSession.objects.filter(
            ats_data_endpoint__isnull=True,
            ats_webhook_url__isnull=True
        )
        
        count = legacy_sessions.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('✅ No legacy sessions found.'))
            return
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'🔍 DRY RUN: Would delete {count} legacy sessions:'
                )
            )
            for session in legacy_sessions[:10]:  # Show first 10
                self.stdout.write(f'  - {session.token} (created: {session.created_at})')
            if count > 10:
                self.stdout.write(f'  ... and {count - 10} more')
        else:
            self.stdout.write(
                self.style.WARNING(f'🗑️  Deleting {count} legacy sessions...')
            )
            
            deleted_count = legacy_sessions.delete()[0]
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Successfully deleted {deleted_count} legacy sessions!'
                )
            )

