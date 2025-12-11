from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Create admin user if it does not exist (safe to run multiple times)'

    def handle(self, *args, **options):
        # Only run if CREATE_ADMIN_USER environment variable is set to 'true'
        create_admin = os.getenv('CREATE_ADMIN_USER', 'true').lower() == 'true'
        
        if not create_admin:
            self.stdout.write(
                self.style.WARNING('CREATE_ADMIN_USER is not set to "true". Skipping admin user creation.')
            )
            return
        
        # Get credentials from environment or use defaults
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@example.com')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        
        # Check if admin user already exists
        if User.objects.filter(username=admin_username).exists():
            user = User.objects.get(username=admin_username)
            self.stdout.write(
                self.style.WARNING(f'Admin user "{admin_username}" already exists. Skipping creation.')
            )
            # Update password if it's different
            if not user.check_password(admin_password):
                user.set_password(admin_password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Updated password for admin user "{admin_username}"')
                )
        elif User.objects.filter(email=admin_email).exists():
            user = User.objects.get(email=admin_email)
            self.stdout.write(
                self.style.WARNING(f'User with email "{admin_email}" already exists. Making it admin.')
            )
            user.username = admin_username
            user.set_password(admin_password)
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'✅ Updated user "{admin_username}" to admin')
            )
        else:
            # Create new admin user
            user = User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Created admin user:\n'
                    f'   Username: {admin_username}\n'
                    f'   Email: {admin_email}\n'
                    f'   Password: {admin_password}'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Admin user is ready!\n'
                f'   Login at: /admin/\n'
                f'   Username: {admin_username}\n'
                f'   Password: {admin_password}'
            )
        )

