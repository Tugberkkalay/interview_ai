#!/usr/bin/env python
"""
Reset admin password script
Usage: python reset_admin_password.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Try to find admin user
username = 'admin'
password = 'admin123'

try:
    # Try to get user by username
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        # Try to get by email
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            # Get first superuser
            superusers = User.objects.filter(is_superuser=True)
            if superusers.exists():
                user = superusers.first()
                print(f"Found superuser: {user.username} ({user.email})")
            else:
                print("No superuser found. Creating new admin user...")
                user = User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password=password
                )
                print(f"✅ Created new admin user: admin / {password}")
                sys.exit(0)
    
    # Reset password
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    
    print(f"✅ Password reset successful!")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Password: {password}")
    print(f"\nYou can now login at: http://localhost:8000/admin/")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

