"""
Custom Middleware for API Key Authentication
"""
from django.http import JsonResponse
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
import logging
from .profile_models import Profile

logger = logging.getLogger(__name__)


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
                    remaining_credits = max(0, profile.credits_total - profile.credits_used)
                    logger.warning(
                        f"Quota exceeded for profile {profile.id} ({profile.company_name}): "
                        f"used={profile.credits_used}, total={profile.credits_total}, plan={profile.plan}"
                    )
                    
                    response = JsonResponse({
                        'error': 'Kredi yetersiz - Quota exceeded',
                        'detail': f'Kalan krediniz: {remaining_credits} / {profile.credits_total}. '
                                 f'Yeni kredi satın almak için dashboard\'a giriş yapın.',
                        'credits_used': profile.credits_used,
                        'credits_total': profile.credits_total,
                        'credits_remaining': remaining_credits,
                        'plan': profile.plan,
                        'message': 'No credits available. Please purchase more credits to create new interview sessions.'
                    }, status=429)
                    
                    # Add Retry-After header to prevent immediate retries
                    # Suggest retry after 1 hour (3600 seconds) or when credits are added
                    response['Retry-After'] = '3600'
                    return response
                
                # Mark API key as used (only updates timestamp, doesn't consume credit)
                profile.mark_api_key_used()
                
                # Attach profile to request (keeping 'company' for backward compatibility)
                request.company = profile
                
                logger.debug(
                    f"API key validated for profile {profile.id} ({profile.company_name}): "
                    f"credits={profile.credits_used}/{profile.credits_total}, plan={profile.plan}"
                )
                
            except Profile.DoesNotExist:
                logger.warning(f"Invalid API key attempt: {api_key[:20]}...")
                return JsonResponse({
                    'error': 'Geçersiz API key',
                    'detail': 'API key bulunamadı veya devre dışı'
                }, status=401)
        
        response = self.get_response(request)
        return response

