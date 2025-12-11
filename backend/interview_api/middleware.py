"""
Custom Middleware for API Key Authentication
"""
from django.http import JsonResponse
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from .profile_models import Profile


class DisableCSRFForAPI(MiddlewareMixin):
    """
    Disable CSRF for API endpoints
    """
    def process_request(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None


class APIKeyAuthenticationMiddleware:
    """
    Middleware to authenticate API requests using API key
    Only applies to /api/session/* endpoints
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Only check API key for session creation endpoints
        if request.path.startswith('/api/session/create'):
            # Get API key from Authorization header
            auth_header = request.headers.get('Authorization', '')
            
            if not auth_header.startswith('Bearer '):
                return JsonResponse({
                    'error': 'API key gerekli',
                    'detail': 'Authorization header: Bearer <api_key>'
                }, status=401)
            
            api_key = auth_header.replace('Bearer ', '').strip()
            
            # Validate API key
            try:
                profile = Profile.objects.get(api_key=api_key, is_active=True)
                
                # Check credits
                if not profile.has_quota_available():
                    return JsonResponse({
                        'error': 'Kredi yetersiz',
                        'detail': f'Kalan krediniz: {profile.credits_total - profile.credits_used} / {profile.credits_total}',
                        'credits_used': profile.credits_used,
                        'credits_total': profile.credits_total,
                        'plan': profile.plan
                    }, status=429)
                
                # Mark API key as used
                profile.mark_api_key_used()
                
                # Attach profile to request (keeping 'company' for backward compatibility)
                request.company = profile
                
            except Profile.DoesNotExist:
                return JsonResponse({
                    'error': 'Geçersiz API key',
                    'detail': 'API key bulunamadı veya devre dışı'
                }, status=401)
        
        response = self.get_response(request)
        return response

