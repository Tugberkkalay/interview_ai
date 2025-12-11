"""
Profile Authentication and Dashboard Views
"""
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Count, Sum, Avg, Q
from django.db.models.functions import TruncDate

from .profile_models import Profile
from .profile_serializers import (
    ProfileRegistrationSerializer,
    ProfileLoginSerializer,
    ProfileSerializer,
    SessionStatsSerializer,
    DailyUsageSerializer
)
from .models import InterviewSession


# ===== AUTHENTICATION =====

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register new profile
    POST /api/auth/register/
    """
    serializer = ProfileRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        profile = serializer.save()
        
        # Auto login
        request.session['profile_id'] = profile.id
        profile.last_login = timezone.now()
        profile.save()
        
        return Response({
            'message': 'Kayıt başarılı!',
            'profile': ProfileSerializer(profile, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login
    POST /api/auth/login/
    """
    serializer = ProfileLoginSerializer(data=request.data)
    if serializer.is_valid():
        profile = serializer.validated_data['profile']
        
        # Set session
        request.session['profile_id'] = profile.id
        profile.last_login = timezone.now()
        profile.save()
        
        return Response({
            'message': 'Giriş başarılı!',
            'profile': ProfileSerializer(profile, context={'request': request}).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    """
    Logout
    POST /api/auth/logout/
    """
    request.session.flush()
    return Response({'message': 'Çıkış başarılı!'})


@api_view(['GET'])
def me(request):
    """
    Get current profile info
    GET /api/auth/me/
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
        return Response(ProfileSerializer(profile, context={'request': request}).data)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_profile(request):
    """
    Update profile information
    PUT/PATCH /api/auth/update/
    
    Can update: company_name, website, phone
    Logo should be uploaded separately via /api/auth/upload-logo/
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only allow updating specific fields
    allowed_fields = ['company_name', 'website', 'phone']
    data = {k: v for k, v in request.data.items() if k in allowed_fields}
    
    serializer = ProfileSerializer(profile, data=data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profil güncellendi!',
            'profile': serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_logo(request):
    """
    Upload company logo
    POST /api/auth/upload-logo/
    
    Body: multipart/form-data with 'logo' file field
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'logo' not in request.FILES:
        return Response({'error': 'Logo dosyası bulunamadı'}, status=status.HTTP_400_BAD_REQUEST)
    
    logo_file = request.FILES['logo']
    
    # Validate file type
    if not logo_file.content_type.startswith('image/'):
        return Response({'error': 'Sadece resim dosyaları yüklenebilir'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file size (max 5MB)
    if logo_file.size > 5 * 1024 * 1024:
        return Response({'error': 'Logo dosyası 5MB\'dan büyük olamaz'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save logo
    profile.logo = logo_file
    profile.save()
    
    serializer = ProfileSerializer(profile, context={'request': request})
    return Response({
        'message': 'Logo başarıyla yüklendi!',
        'profile': serializer.data
    })


@api_view(['POST'])
def regenerate_api_key(request):
    """
    Regenerate API key
    POST /api/auth/regenerate-key/
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
        new_key = profile.regenerate_api_key()
        
        return Response({
            'message': 'API key yenilendi!',
            'api_key': new_key
        })
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


# ===== DASHBOARD =====

@api_view(['GET'])
def dashboard_stats(request):
    """
    Get dashboard statistics
    GET /api/dashboard/stats/
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all sessions for this profile
    sessions = InterviewSession.objects.filter(company=profile)
    
    # Calculate stats
    total_sessions = sessions.count()
    completed_sessions = sessions.filter(status='completed').count()
    active_sessions = sessions.filter(status='active').count()
    
    # Duration stats
    duration_sum = sessions.filter(status='completed').aggregate(
        total=Sum('duration_seconds')
    )['total'] or 0
    total_duration_minutes = duration_sum // 60
    
    average_duration = sessions.filter(status='completed').aggregate(
        avg=Avg('duration_seconds')
    )['avg'] or 0
    average_duration_minutes = round(average_duration / 60, 1)
    
    # Time-based counts
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    sessions_today = sessions.filter(created_at__date=today).count()
    sessions_this_week = sessions.filter(created_at__date__gte=week_ago).count()
    sessions_this_month = sessions.filter(created_at__date__gte=month_ago).count()
    
    stats = {
        'total_sessions': total_sessions,
        'completed_sessions': completed_sessions,
        'active_sessions': active_sessions,
        'total_duration_minutes': total_duration_minutes,
        'average_duration_minutes': average_duration_minutes,
        'sessions_today': sessions_today,
        'sessions_this_week': sessions_this_week,
        'sessions_this_month': sessions_this_month,
    }
    
    serializer = SessionStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
def dashboard_usage_chart(request):
    """
    Get daily usage data for charts
    GET /api/dashboard/usage-chart/?period=week|month
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get period (default: week)
    period = request.GET.get('period', 'week')
    today = timezone.now().date()
    
    if period == 'month':
        start_date = today - timedelta(days=30)
    else:
        start_date = today - timedelta(days=7)
    
    # Aggregate by date
    usage_data = InterviewSession.objects.filter(
        company=profile,
        created_at__date__gte=start_date
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        count=Count('id'),
        total_duration_minutes=Sum('duration_seconds') / 60
    ).order_by('date')
    
    serializer = DailyUsageSerializer(usage_data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def dashboard_sessions(request):
    """
    Get list of sessions for this profile
    GET /api/dashboard/sessions/?limit=10
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get limit (default: 20)
    limit = int(request.GET.get('limit', 20))
    
    sessions = InterviewSession.objects.filter(company=profile).order_by('-created_at')[:limit]
    
    session_list = []
    for session in sessions:
        session_list.append({
            'token': str(session.token),
            'external_id': session.external_id,
            'status': session.status,
            'duration_seconds': session.duration_seconds,
            'duration_minutes': round(session.duration_seconds / 60, 1),
            'created_at': session.created_at,
            'completed_at': session.completed_at,
        })
    
    return Response({
        'count': len(session_list),
        'sessions': session_list
    })


@api_view(['GET'])
def dashboard_session_detail(request, token):
    """
    Get detailed information about a specific session
    GET /api/dashboard/sessions/{token}/
    """
    profile_id = request.session.get('profile_id')
    if not profile_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        profile = Profile.objects.get(id=profile_id, is_active=True)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        session = InterviewSession.objects.get(token=token, company=profile)
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Build interview link
    import os
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5175')
    interview_link = f"{frontend_url}/interview/{session.token}"
    
    # Mask sensitive ATS data
    ats_api_token_masked = session.ats_api_token[:10] + '...' if session.ats_api_token else None
    
    return Response({
        'token': str(session.token),
        'external_id': session.external_id,
        'status': session.status,
        'duration_seconds': session.duration_seconds,
        'duration_minutes': round(session.duration_seconds / 60, 1),
        'created_at': session.created_at,
        'updated_at': session.updated_at,
        'accessed_at': session.accessed_at,
        'completed_at': session.completed_at,
        'expires_at': session.expires_at,
        'is_expired': session.is_expired(),
        'is_accessible': session.is_accessible(),
        'interview_link': interview_link,
        'ats_data_endpoint': session.ats_data_endpoint,
        'ats_webhook_url': session.ats_webhook_url,
        'ats_api_token_masked': ats_api_token_masked,
        'webhook_retry_count': session.webhook_retry_count,
        'last_webhook_attempt': session.last_webhook_attempt,
        'webhook_last_error': session.webhook_last_error,
        'has_temp_report': bool(session.temp_report_encrypted),
        'temp_report_expires_at': session.temp_report_expires_at,
    })

