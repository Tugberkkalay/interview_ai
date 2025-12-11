"""
Profile and Authentication Models
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone
import secrets
import hashlib


class ProfileManager(BaseUserManager):
    """Manager for Profile model"""
    
    def create_profile(self, email, password, company_name, full_name, **extra_fields):
        if not email:
            raise ValueError('Email gereklidir')
        
        email = self.normalize_email(email)
        profile = self.model(email=email, company_name=company_name, full_name=full_name, **extra_fields)
        profile.set_password(password)
        profile.save(using=self._db)
        return profile


class Profile(AbstractBaseUser):
    """
    Profile model for multi-tenant SaaS
    Each profile gets their own API key and quota
    """
    PLAN_CHOICES = [
        ('free', 'Free (5 Kredi Hediye)'),
        ('starter', 'Starter (20 Kredi)'),
        ('growth', 'Growth (100 Kredi)'),
        ('enterprise', 'Enterprise (Sınırsız)'),
    ]
    
    # Authentication
    email = models.EmailField(unique=True, db_index=True)
    password = models.CharField(max_length=128)  # Handled by AbstractBaseUser
    
    # User Info
    full_name = models.CharField(max_length=200)
    
    # Company Info
    company_name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    logo = models.ImageField(
        upload_to='logos/',
        blank=True,
        null=True,
        help_text="Company logo image"
    )
    
    # API Access
    api_key = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        editable=False,
        help_text="API key for authentication"
    )
    api_key_created_at = models.DateTimeField(auto_now_add=True)
    api_key_last_used = models.DateTimeField(null=True, blank=True)
    
    # Subscription & Credits (Kredi Sistemi)
    plan = models.CharField(
        max_length=20,
        choices=PLAN_CHOICES,
        default='free',
        help_text="Paket tipi: free, starter, growth, enterprise"
    )
    credits_total = models.IntegerField(
        default=5,
        help_text="Toplam kredi sayısı (1 Kredi = 1 Mülakat)"
    )
    credits_used = models.IntegerField(
        default=0,
        help_text="Kullanılan kredi sayısı"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(
        default=True,
        help_text="Admin approval for new companies"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # For AbstractBaseUser
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['company_name', 'full_name']
    
    objects = ProfileManager()
    
    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.company_name}"
    
    def save(self, *args, **kwargs):
        # Generate API key if not exists
        if not self.api_key:
            self.api_key = self.generate_api_key()
        
        # Set credits based on plan (only if credits_total is default or 0)
        if self.credits_total == 5 and self.credits_used == 0:  # Default free plan
            plan_credits = {
                'free': 5,
                'starter': 20,
                'growth': 100,
                'enterprise': 999999  # Sınırsız
            }
            self.credits_total = plan_credits.get(self.plan, 5)
        
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_api_key():
        """Generate secure API key"""
        prefix = "sk_live_"
        random_part = secrets.token_urlsafe(32)
        return f"{prefix}{random_part}"
    
    def regenerate_api_key(self):
        """Regenerate API key (e.g., if compromised)"""
        self.api_key = self.generate_api_key()
        self.api_key_created_at = timezone.now()
        self.save()
        return self.api_key
    
    def has_quota_available(self):
        """Check if profile has available credits"""
        if self.plan == 'enterprise':
            return True  # Sınırsız
        return self.credits_used < self.credits_total
    
    def increment_usage(self):
        """Increment usage counter (use 1 credit)"""
        if self.plan != 'enterprise':
            self.credits_used += 1
            self.save()
    
    def add_credits(self, amount):
        """Add credits to profile (for purchasing packages)"""
        self.credits_total += amount
        self.save()
        return self.credits_total
    
    def reset_monthly_quota(self):
        """Legacy method - kept for backward compatibility, does nothing in credit system"""
        # Kredi sisteminde aylık reset yok, krediler bitene kadar kullanılır
        # Bu metod artık kullanılmıyor, sadece backward compatibility için var
        pass
    
    def mark_api_key_used(self):
        """Update last API key usage time"""
        self.api_key_last_used = timezone.now()
        self.save(update_fields=['api_key_last_used'])

