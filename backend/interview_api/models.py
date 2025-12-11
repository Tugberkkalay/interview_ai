from django.db import models
import uuid
from datetime import timedelta
from django.utils import timezone
from .profile_models import Profile


class InterviewSession(models.Model):
    """
    Model for storing interview session data and reports
    """
    STATUS_CHOICES = [
        ('pending', 'Beklemede'),
        ('active', 'Aktif'),
        ('completed', 'Tamamlandı'),
        ('expired', 'Süresi Dolmuş'),
    ]

    AVATAR_CHOICES = [
        ('female', 'Zeynep'),
        ('male', 'Mert'),
    ]

    # Unique token for the session
    token = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True
    )
    
    # Profile ownership (for multi-tenant SaaS)
    company = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='sessions',
        null=True,
        blank=True,
        help_text="Profile that owns this session"
    )

    # Session Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accessed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Usage tracking (for analytics)
    duration_seconds = models.IntegerField(
        default=0,
        help_text="Interview duration in seconds"
    )

    # Expiration
    expires_at = models.DateTimeField()

    # Metadata
    external_id = models.CharField(
        max_length=200,
        blank=True,
        help_text="External ATS ID for reference"
    )

    # ATS Integration (Zero-Knowledge Architecture)
    ats_data_endpoint = models.URLField(
        blank=True,
        help_text="ATS endpoint to fetch interview data"
    )
    ats_webhook_url = models.URLField(
        blank=True,
        help_text="ATS webhook URL to send report"
    )
    ats_api_token = models.CharField(
        max_length=500,
        blank=True,
        help_text="Encrypted ATS API token"
    )

    # Temporary Report Storage (Encrypted, Auto-Delete)
    temp_report_encrypted = models.TextField(
        blank=True,
        help_text="Temporary encrypted report (only if ATS webhook fails)"
    )
    temp_report_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Auto-delete encrypted report after this time"
    )
    
    # Retry Mechanism
    webhook_retry_count = models.IntegerField(
        default=0,
        help_text="Number of webhook delivery attempts"
    )
    last_webhook_attempt = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last webhook delivery attempt time"
    )
    webhook_last_error = models.TextField(
        blank=True,
        help_text="Last webhook error message"
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        if self.external_id:
            return f"Session {self.external_id} ({self.token})"
        return f"Session {self.token}"

    def save(self, *args, **kwargs):
        # Set expiration to 7 days from creation if not set
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_expired(self):
        """Check if the session has expired"""
        return timezone.now() > self.expires_at

    def is_accessible(self):
        """Check if the session can be accessed"""
        return (
            self.status in ['pending', 'active'] and
            not self.is_expired()
        )

    def mark_accessed(self):
        """Mark session as accessed"""
        if self.status == 'pending':
            self.status = 'active'
        self.accessed_at = timezone.now()
        self.save()

    def mark_completed(self):
        """Mark session as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()

    def store_temp_report(self, report_data):
        """
        Store report temporarily (encrypted) if webhook fails
        Auto-expires after 24 hours
        """
        from .encryption import encrypt_data
        
        self.temp_report_encrypted = encrypt_data(report_data)
        self.temp_report_expires_at = timezone.now() + timedelta(hours=24)
        self.save()

    def get_temp_report(self):
        """Decrypt and return temporary report"""
        if not self.temp_report_encrypted:
            return None
        
        from .encryption import decrypt_data
        return decrypt_data(self.temp_report_encrypted)

    def clear_temp_report(self):
        """Clear temporary report after successful webhook delivery"""
        self.temp_report_encrypted = ''
        self.temp_report_expires_at = None
        self.webhook_retry_count = 0
        self.webhook_last_error = ''
        self.save()

    def is_temp_report_expired(self):
        """Check if temporary report has expired"""
        if not self.temp_report_expires_at:
            return False
        return timezone.now() > self.temp_report_expires_at


class Prompt(models.Model):
    """
    Model for storing AI prompts that can be managed via admin panel
    """
    PROMPT_TYPES = [
        ('cv_parser', 'CV Parser'),
        ('interviewer_system', 'Interview System Prompt'),
        ('report_generator', 'Report Generator'),
    ]

    type = models.CharField(
        max_length=50,
        choices=PROMPT_TYPES,
        help_text="Type of prompt"
    )
    name = models.CharField(
        max_length=200,
        help_text="Descriptive name for this prompt"
    )
    system_prompt = models.TextField(
        help_text="System instructions for the AI"
    )
    user_prompt_template = models.TextField(
        blank=True,
        help_text="Template for user prompt (can use {{variables}})"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Only one prompt per type can be active"
    )
    version = models.IntegerField(
        default=1,
        help_text="Version number for tracking changes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(
        max_length=200,
        blank=True,
        help_text="Who created/updated this prompt"
    )
    notes = models.TextField(
        blank=True,
        help_text="Notes about this prompt version"
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type', 'is_active']),
        ]

    def __str__(self):
        return f"{self.get_type_display()} - {self.name} (v{self.version})"

    def save(self, *args, **kwargs):
        # If this is being set as active, deactivate others of the same type
        if self.is_active:
            Prompt.objects.filter(
                type=self.type,
                is_active=True
            ).exclude(id=self.id).update(is_active=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_active_prompt(cls, prompt_type):
        """Get the active prompt for a given type"""
        try:
            return cls.objects.get(type=prompt_type, is_active=True)
        except cls.DoesNotExist:
            return None


class SupportSession(models.Model):
    """
    Model for storing support/assistant chat sessions from landing page
    """
    CLOSURE_REASONS = [
        ('manual', 'Kullanıcı Manuel Kapattı'),
        ('ai_requested', 'AI Tarafından Kapatıldı'),
        ('network_error', 'Ağ Hatası'),
        ('server_error', 'Sunucu Hatası'),
        ('timeout', 'Zaman Aşımı'),
        ('unknown', 'Bilinmeyen'),
    ]

    # Session identifier
    session_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
        help_text="Unique session identifier"
    )
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(
        default=0,
        help_text="Session duration in seconds"
    )
    
    # Session data
    transcript = models.JSONField(
        default=list,
        help_text="Full conversation transcript"
    )
    summary = models.TextField(
        blank=True,
        help_text="AI-generated summary of the conversation"
    )
    
    # Demo request info
    has_demo_request = models.BooleanField(
        default=False,
        help_text="Whether a demo request was made during this session"
    )
    demo_request_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Demo request data if any"
    )
    
    # Closure info
    closure_reason = models.CharField(
        max_length=20,
        choices=CLOSURE_REASONS,
        default='unknown',
        help_text="How the session ended"
    )
    closure_details = models.TextField(
        blank=True,
        help_text="Additional details about session closure"
    )
    
    # User info (for analytics)
    user_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="User IP address"
    )
    user_agent = models.TextField(
        blank=True,
        help_text="User agent string"
    )
    
    # Status
    is_completed = models.BooleanField(
        default=False,
        help_text="Whether session completed successfully"
    )

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['started_at']),
            models.Index(fields=['has_demo_request']),
            models.Index(fields=['closure_reason']),
        ]

    def __str__(self):
        return f"Support Session {self.session_id} - {self.get_closure_reason_display()}"

    def mark_ended(self, reason='unknown', details=''):
        """Mark session as ended"""
        self.ended_at = timezone.now()
        self.closure_reason = reason
        self.closure_details = details
        
        if self.started_at:
            duration = (self.ended_at - self.started_at).total_seconds()
            self.duration_seconds = int(duration)
        
        self.is_completed = True
        self.save()
    
    def generate_summary(self):
        """Generate AI summary of the conversation"""
        if not self.transcript or len(self.transcript) == 0:
            self.summary = "Transcript boş, özet oluşturulamadı."
            self.save()
            return
        
        try:
            from .gemini_service import GeminiService
            import google.generativeai as genai
            import os
            
            # Format transcript
            transcript_text = "\n".join([
                f"{item.get('role', 'Unknown')}: {item.get('text', '')}"
                for item in self.transcript
            ])
            
            # Generate summary using Gemini
            genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            
            prompt = f"""Aşağıdaki bir müşteri destek görüşmesinin transcript'ini analiz et ve özet çıkar.

Özet şunları içermeli:
1. Görüşmenin genel konusu ve amacı
2. Müşterinin ana soruları/ilgi alanları
3. Asistanın verdiği önemli bilgiler
4. Demo talebi var mı? (varsa detayları)
5. Görüşmenin sonucu ve müşteri memnuniyeti hakkında değerlendirme
6. Öne çıkan noktalar ve aksiyonlar

Transcript:
{transcript_text}

Özeti Türkçe olarak, profesyonel ve objektif bir şekilde yaz. Maksimum 300 kelime."""

            response = model.generate_content(prompt)
            self.summary = response.text.strip()
            self.save()
        except Exception as e:
            self.summary = f"Özet oluşturulurken hata oluştu: {str(e)}"
            self.save()
