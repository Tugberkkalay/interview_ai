#!/usr/bin/env python
"""
Quick script to reset admin password
Run with: python reset_admin.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Try to find or create admin user
username = 'admin'
password = 'admin123'

try:
    # Try username first
    try:
        user = User.objects.get(username=username)
        print(f"✅ Found user: {user.username}")
    except User.DoesNotExist:
        # Try email
        try:
            user = User.objects.get(email=f'{username}@example.com')
            print(f"✅ Found user by email: {user.email}")
        except User.DoesNotExist:
            # Get first superuser
            superusers = User.objects.filter(is_superuser=True)
            if superusers.exists():
                user = superusers.first()
                print(f"✅ Found superuser: {user.username} ({user.email})")
            else:
                # Create new admin
                user = User.objects.create_superuser(
                    username=username,
                    email=f'{username}@example.com',
                    password=password
                )
                print(f"✅ Created new admin user")
    
    # Reset password
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    
    print(f"\n🎉 Password reset successful!")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email if hasattr(user, 'email') else 'N/A'}")
    print(f"   Password: {password}")
    print(f"\n📍 Login at: http://localhost:8000/admin/")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

