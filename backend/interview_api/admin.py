from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import InterviewSession, Prompt, SupportSession
from .profile_models import Profile


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = [
        'external_id',
        'company_display',
        'status_badge',
        'duration_seconds',
        'created_at',
        'expires_at',
        'copy_link',
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['external_id', 'token']
    
    def get_queryset(self, request):
        """Override to safely handle queryset"""
        try:
            qs = super().get_queryset(request)
            return qs.select_related('company')  # Optimize foreign key access
        except Exception as e:
            # Fallback to empty queryset if there's an error
            from .models import InterviewSession
            return InterviewSession.objects.none()
    readonly_fields = [
        'token',
        'created_at',
        'updated_at',
        'accessed_at',
        'completed_at',
        'interview_link',
        'temp_report_info',
        'webhook_status'
    ]
    
    fieldsets = (
        ('Session Bilgileri', {
            'fields': ('status', 'token', 'interview_link', 'external_id', 'company')
        }),
        ('ATS Entegrasyonu', {
            'fields': ('ats_data_endpoint', 'ats_webhook_url', 'ats_api_token'),
            'description': 'Zero-knowledge: Veriler ATS\'de tutulur, burada sadece endpoint\'ler saklanır.'
        }),
        ('Webhook Durumu', {
            'fields': ('webhook_status', 'webhook_retry_count', 'last_webhook_attempt', 'webhook_last_error'),
            'classes': ('collapse',)
        }),
        ('Geçici Rapor (Sadece webhook başarısız olursa)', {
            'fields': ('temp_report_info',),
            'classes': ('collapse',),
            'description': 'Rapor webhook başarısız olursa 24 saat şifrelenmiş olarak tutulur, sonra otomatik silinir.'
        }),
        ('Zaman Bilgileri', {
            'fields': ('created_at', 'updated_at', 'accessed_at', 'completed_at', 'expires_at', 'duration_seconds'),
            'classes': ('collapse',)
        }),
    )

    def company_display(self, obj):
        """Display company name safely"""
        if obj.company:
            return format_html(
                '<span style="font-weight: 500;">{}</span>',
                obj.company.company_name
            )
        return format_html('<span style="color: #9ca3af;">-</span>')
    company_display.short_description = 'Şirket'
    
    def status_badge(self, obj):
        """Display colored status badge"""
        try:
            colors = {
                'pending': '#fbbf24',
                'active': '#3b82f6',
                'completed': '#22c55e',
                'expired': '#ef4444',
            }
            color = colors.get(obj.status, '#6b7280') if obj.status else '#6b7280'
            status_display = obj.get_status_display() if obj.status else 'Bilinmiyor'
            return format_html(
                '<span style="background-color: {}; color: white; padding: 4px 12px; '
                'border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
                color,
                status_display
            )
        except Exception as e:
            return format_html('<span style="color: #ef4444;">Hata</span>')
    status_badge.short_description = 'Durum'

    def interview_link(self, obj):
        """Display interview link"""
        if obj.token:
            import os
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5175')
            link = f"{frontend_url}/interview/{obj.token}"
            return format_html(
                '<a href="{}" target="_blank" style="color: #3b82f6; text-decoration: underline;">{}</a>',
                link,
                link
            )
        return '-'
    interview_link.short_description = 'Mülakat Linki'

    def copy_link(self, obj):
        """Copy link button"""
        try:
            if obj.token:
                import os
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5175')
                link = f"{frontend_url}/interview/{obj.token}"
                # Check if accessible safely
                is_accessible = False
                try:
                    is_accessible = obj.is_accessible()
                except:
                    pass
                
                if is_accessible:
                    return format_html(
                        '<button onclick="navigator.clipboard.writeText(\'{}\'); '
                        'alert(\'Link kopyalandı!\');" '
                        'style="background: #3b82f6; color: white; padding: 4px 12px; '
                        'border-radius: 6px; border: none; cursor: pointer; font-size: 11px;">📋 Kopyala</button>',
                        link
                    )
                else:
                    return format_html(
                        '<span style="color: #9ca3af; font-size: 11px;">Süresi dolmuş</span>'
                    )
        except Exception as e:
            return format_html('<span style="color: #ef4444;">Hata</span>')
        return '-'
    copy_link.short_description = 'Link'

    def temp_report_info(self, obj):
        """Display temporary report info"""
        try:
            if obj.temp_report_encrypted:
                expires_str = 'Bilinmiyor'
                try:
                    if obj.temp_report_expires_at:
                        expires_str = obj.temp_report_expires_at.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    pass
                return format_html(
                    '<div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 12px; border-radius: 6px;">'
                    '<strong>⚠️ Geçici Rapor Mevcut</strong><br>'
                    'Süre: {}<br>'
                    'Durum: Webhook başarısız, retry bekleniyor'
                    '</div>',
                    expires_str
                )
            return 'Geçici rapor yok (normal: rapor ATS\'ye gönderildi)'
        except Exception as e:
            return format_html('<span style="color: #ef4444;">Hata: {}</span>', str(e))
    temp_report_info.short_description = 'Geçici Rapor'
    
    def webhook_status(self, obj):
        """Display webhook status"""
        try:
            if not obj.ats_webhook_url:
                return format_html('<span style="color: #6b7280;">Webhook yapılandırılmamış</span>')
            
            if obj.temp_report_encrypted:
                color = '#fbbf24'
                retry_count = getattr(obj, 'webhook_retry_count', 0) or 0
                status = f'Başarısız (Retry: {retry_count}/5)'
            elif obj.status == 'completed' and not obj.temp_report_encrypted:
                color = '#22c55e'
                status = 'Başarılı'
            else:
                color = '#6b7280'
                status = 'Beklemede'
            
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color, status
            )
        except Exception as e:
            return format_html('<span style="color: #ef4444;">Hata</span>')
    webhook_status.short_description = 'Webhook Durumu'

    def save_model(self, request, obj, form, change):
        """Override save to handle custom logic"""
        super().save_model(request, obj, form, change)

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }


@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'type',
        'version',
        'is_active_badge',
        'created_at',
        'updated_at',
    ]
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name', 'notes', 'system_prompt']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('type', 'name', 'version', 'is_active')
        }),
        ('Prompt İçeriği', {
            'fields': ('system_prompt', 'user_prompt_template'),
            'description': 'User prompt template\'de {{variable}} formatı kullanabilirsiniz'
        }),
        ('Metadata', {
            'fields': ('created_by', 'notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def is_active_badge(self, obj):
        """Display colored active status badge"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #22c55e; color: white; padding: 4px 12px; '
                'border-radius: 12px; font-size: 11px; font-weight: bold;">✓ Aktif</span>'
            )
        return format_html(
            '<span style="background-color: #6b7280; color: white; padding: 4px 12px; '
            'border-radius: 12px; font-size: 11px; font-weight: bold;">Pasif</span>'
        )
    is_active_badge.short_description = 'Durum'

    def save_model(self, request, obj, form, change):
        """Auto-increment version if system_prompt changed"""
        if change:
            old_obj = Prompt.objects.get(pk=obj.pk)
            if old_obj.system_prompt != obj.system_prompt:
                # Create new version instead of updating
                obj.pk = None
                obj.version = Prompt.objects.filter(type=obj.type).count() + 1
                obj.created_by = request.user.username if request.user.is_authenticated else 'admin'
        super().save_model(request, obj, form, change)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = [
        'logo_thumbnail',
        'full_name',
        'email',
        'company_name',
        'plan_badge',
        'quota_info',
        'is_active_badge',
        'session_count',
        'created_at',
    ]
    list_filter = ['plan', 'is_active', 'is_approved', 'created_at']
    search_fields = ['full_name', 'email', 'company_name']
    readonly_fields = [
        'api_key',
        'api_key_created_at',
        'api_key_last_used',
        'created_at',
        'updated_at',
        'last_login',
        'password_display',
        'credits_remaining'
    ]
    
    fieldsets = (
        ('Kullanıcı Bilgileri', {
            'fields': ('email', 'full_name')
        }),
        ('Şirket Bilgileri', {
            'fields': ('company_name', 'website', 'phone', 'logo')
        }),
        ('Güvenlik', {
            'fields': ('password_display', 'api_key', 'api_key_created_at', 'api_key_last_used'),
            'description': 'API key profil tarafından session oluşturmak için kullanılır.'
        }),
        ('Paket & Kredi', {
            'fields': ('plan', 'credits_total', 'credits_used', 'credits_remaining'),
            'description': 'Kredi Sistemi: 1 Kredi = 1 Mülakat. Aylık taahhüt yok, krediler bitene kadar kullanılır.'
        }),
        ('Durum', {
            'fields': ('is_active', 'is_approved')
        }),
        ('Zaman Bilgileri', {
            'fields': ('created_at', 'updated_at', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    def plan_badge(self, obj):
        """Display colored plan badge"""
        colors = {
            'free': '#6b7280',
            'starter': '#3b82f6',
            'growth': '#a855f7',
            'enterprise': '#fbbf24',
        }
        plan_names = {
            'free': 'FREE',
            'starter': 'STARTER',
            'growth': 'GROWTH',
            'enterprise': 'ENTERPRISE',
        }
        color = colors.get(obj.plan, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 12px; '
            'border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase;">{}</span>',
            color,
            plan_names.get(obj.plan, obj.plan.upper())
        )
    plan_badge.short_description = 'Paket'
    
    def quota_info(self, obj):
        """Display credits usage"""
        if obj.plan == 'enterprise':
            return format_html(
                '<span style="color: #fbbf24; font-weight: bold; font-size: 11px;">∞ SINIRSIZ</span>'
            )
        
        remaining = obj.credits_total - obj.credits_used
        percentage = (obj.credits_used / obj.credits_total * 100) if obj.credits_total > 0 else 0
        color = '#22c55e' if percentage < 80 else '#fbbf24' if percentage < 100 else '#ef4444'
        
        return format_html(
            '<div style="display: flex; align-items: center; gap: 8px;">'
            '<div style="background: #e5e7eb; border-radius: 8px; width: 80px; height: 12px; overflow: hidden;">'
            '<div style="background: {}; width: {}%; height: 100%;"></div>'
            '</div>'
            '<span style="font-size: 11px; color: {};">{}/{} (Kalan: {})</span>'
            '</div>',
            color, min(percentage, 100), color,
            obj.credits_used, obj.credits_total, remaining
        )
    quota_info.short_description = 'Kredi Kullanımı'
    
    def credits_remaining(self, obj):
        """Display remaining credits"""
        if obj.plan == 'enterprise':
            return format_html('<span style="color: #fbbf24; font-weight: bold;">Sınırsız</span>')
        remaining = obj.credits_total - obj.credits_used
        color = '#22c55e' if remaining > 0 else '#ef4444'
        return format_html(
            '<span style="color: {}; font-weight: bold; font-size: 14px;">{} Kredi</span>',
            color, remaining
        )
    credits_remaining.short_description = 'Kalan Kredi'
    
    def is_active_badge(self, obj):
        """Display active status badge"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #22c55e; color: white; padding: 4px 12px; '
                'border-radius: 12px; font-size: 11px; font-weight: bold;">✓ Aktif</span>'
            )
        return format_html(
            '<span style="background-color: #ef4444; color: white; padding: 4px 12px; '
            'border-radius: 12px; font-size: 11px; font-weight: bold;">✗ Pasif</span>'
        )
    is_active_badge.short_description = 'Durum'
    
    def session_count(self, obj):
        """Display total session count"""
        count = obj.sessions.count()
        return format_html(
            '<span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; '
            'border-radius: 6px; font-size: 11px; font-weight: bold;">{} session</span>',
            count
        )
    session_count.short_description = 'Toplam'
    
    def password_display(self, obj):
        """Display password info"""
        return format_html(
            '<span style="color: #6b7280;">Şifreler hashlenerek saklanır. '
            'Şifre değiştirmek için kullanıcıya yeni şifre belirlemesini söyleyin.</span>'
        )
    password_display.short_description = 'Şifre'
    
    def logo_thumbnail(self, obj):
        """Display logo thumbnail"""
        if obj.logo:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; border: 1px solid #e5e7eb;" />',
                obj.logo.url
            )
        return format_html('<span style="color: #9ca3af;">-</span>')
    logo_thumbnail.short_description = 'Logo'
    
    actions = ['regenerate_api_keys', 'add_credits_20', 'add_credits_100', 'reset_credits']
    
    def regenerate_api_keys(self, request, queryset):
        """Regenerate API keys for selected profiles"""
        for profile in queryset:
            profile.regenerate_api_key()
        self.message_user(request, f'{queryset.count()} profil\'in API key\'i yenilendi.')
    regenerate_api_keys.short_description = 'API Key Yenile'
    
    def add_credits_20(self, request, queryset):
        """Add 20 credits (Starter package)"""
        for profile in queryset:
            profile.add_credits(20)
        self.message_user(request, f'{queryset.count()} profil\'e 20 kredi eklendi.')
    add_credits_20.short_description = '20 Kredi Ekle (Starter)'
    
    def add_credits_100(self, request, queryset):
        """Add 100 credits (Growth package)"""
        for profile in queryset:
            profile.add_credits(100)
        self.message_user(request, f'{queryset.count()} profil\'e 100 kredi eklendi.')
    add_credits_100.short_description = '100 Kredi Ekle (Growth)'
    
    def reset_credits(self, request, queryset):
        """Reset credits usage (set credits_used to 0)"""
        for profile in queryset:
            profile.credits_used = 0
            profile.save()
        self.message_user(request, f'{queryset.count()} profil\'in kredi kullanımı sıfırlandı.')
    reset_credits.short_description = 'Kredi Kullanımını Sıfırla'


@admin.register(SupportSession)
class SupportSessionAdmin(admin.ModelAdmin):
    list_display = [
        'session_id_short',
        'closure_reason_badge',
        'has_demo_request_badge',
        'duration_display',
        'summary_preview',
        'started_at',
        'ended_at',
        'user_ip',
    ]
    list_filter = ['closure_reason', 'has_demo_request', 'is_completed', 'started_at']
    search_fields = ['session_id', 'user_ip', 'closure_details', 'summary']
    readonly_fields = [
        'session_id',
        'started_at',
        'ended_at',
        'duration_seconds',
        'duration_display',
        'summary',
        'transcript_display',
        'demo_request_display',
        'closure_reason',  # Closure reason readonly (frontend'den set ediliyor)
        'demo_request_data',  # Demo request data readonly (frontend'den set ediliyor)
    ]
    
    fieldsets = (
        ('Session Bilgileri', {
            'fields': ('session_id', 'started_at', 'ended_at', 'duration_seconds', 'is_completed')
        }),
        ('Görüşme Özeti', {
            'fields': ('summary',),
            'description': 'AI tarafından oluşturulan görüşme özeti'
        }),
        ('Kapanış Bilgileri', {
            'fields': ('closure_reason', 'closure_details'),
            'description': 'Closure reason frontend tarafından otomatik set edilir.'
        }),
        ('Transcript', {
            'fields': ('transcript_display',),
            'classes': ('collapse',)
        }),
        ('Demo Talebi', {
            'fields': ('has_demo_request', 'demo_request_data', 'demo_request_display'),
            'description': 'Demo request data frontend tarafından otomatik set edilir.'
        }),
        ('Kullanıcı Bilgileri', {
            'fields': ('user_ip', 'user_agent'),
            'classes': ('collapse',)
        }),
    )

    def session_id_short(self, obj):
        """Display short session ID"""
        return str(obj.session_id)[:8] + '...'
    session_id_short.short_description = 'Session ID'

    def closure_reason_badge(self, obj):
        """Display colored closure reason badge"""
        colors = {
            'manual': '#22c55e',
            'ai_requested': '#3b82f6',
            'network_error': '#fbbf24',
            'server_error': '#ef4444',
            'timeout': '#f97316',
            'unknown': '#6b7280',
        }
        color = colors.get(obj.closure_reason, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 12px; '
            'border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_closure_reason_display()
        )
    closure_reason_badge.short_description = 'Kapanış Nedeni'

    def has_demo_request_badge(self, obj):
        """Display demo request badge"""
        if obj.has_demo_request:
            return format_html(
                '<span style="background-color: #22c55e; color: white; padding: 4px 12px; '
                'border-radius: 12px; font-size: 11px; font-weight: bold;">✓ Demo Talebi</span>'
            )
        return format_html(
            '<span style="color: #6b7280; font-size: 11px;">-</span>'
        )
    has_demo_request_badge.short_description = 'Demo Talebi'

    def duration_display(self, obj):
        """Display duration in readable format"""
        if obj.duration_seconds:
            minutes = obj.duration_seconds // 60
            seconds = obj.duration_seconds % 60
            return f"{minutes}:{seconds:02d}"
        return "-"
    duration_display.short_description = 'Süre'

    def transcript_display(self, obj):
        """Display transcript in readable format"""
        if not obj.transcript:
            return "Transcript yok"
        
        html = '<div style="max-height: 400px; overflow-y: auto; background: #f9fafb; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px;">'
        for item in obj.transcript:
            role = item.get('role', 'Unknown')
            text = item.get('text', '')
            color = '#3b82f6' if role == 'Asistan' else '#22c55e'
            html += f'<div style="margin-bottom: 8px;"><strong style="color: {color};">{role}:</strong> {text}</div>'
        html += '</div>'
        return format_html(html)
    transcript_display.short_description = 'Transcript'

    def demo_request_display(self, obj):
        """Display demo request data"""
        if not obj.has_demo_request or not obj.demo_request_data:
            return "Demo talebi yok"
        
        data = obj.demo_request_data
        # Daha koyu arka plan rengi kullan (okunabilirlik için)
        html = '<div style="background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #374151; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;">'
        html += f'<div style="margin-bottom: 12px;"><strong style="color: #60a5fa;">Ad Soyad:</strong> <span style="color: #f9fafb;">{data.get("name", "-")}</span></div>'
        html += f'<div style="margin-bottom: 12px;"><strong style="color: #60a5fa;">Şirket:</strong> <span style="color: #f9fafb;">{data.get("company", "-")}</span></div>'
        html += f'<div style="margin-bottom: 12px;"><strong style="color: #60a5fa;">İletişim:</strong> <span style="color: #f9fafb;">{data.get("contact", "-")}</span></div>'
        html += f'<div><strong style="color: #60a5fa;">Uygun Zaman:</strong> <span style="color: #f9fafb;">{data.get("preferredTime", "-")}</span></div>'
        html += '</div>'
        return format_html(html)
    demo_request_display.short_description = 'Demo Talebi Detayları'
    
    def summary_preview(self, obj):
        """Display summary preview in list view"""
        if not obj.summary:
            return format_html('<span style="color: #6b7280; font-size: 11px;">Özet oluşturuluyor...</span>')
        
        # Show first 100 characters
        preview = obj.summary[:100] + ('...' if len(obj.summary) > 100 else '')
        return format_html(
            '<div style="max-width: 300px; font-size: 11px; line-height: 1.4; color: #374151;">{}</div>',
            preview
        )
    summary_preview.short_description = 'Görüşme Özeti'
