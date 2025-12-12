from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
import os

from .models import InterviewSession, SupportSession
from .serializers import ReportSubmissionSerializer
from .gemini_service import GeminiService
from .ats_service import ATSService


@api_view(['GET'])
def get_interview_data(request, token):
    """
    GET /api/session/{token}/
    
    Proxy endpoint that fetches interview data from ATS endpoint
    and returns it to the frontend.
    """
    try:
        session = get_object_or_404(InterviewSession, token=token)
        
        # Check if session is expired
        if session.is_expired():
            return Response(
                {'error': 'Session expired'},
                status=status.HTTP_410_GONE
            )
        
        # Check if session is already completed
        if session.status == 'completed':
            return Response(
                {'error': 'Session already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark session as active
        if session.status == 'pending':
            session.status = 'active'
            session.started_at = timezone.now()
            session.save()
        
        # Check if ATS endpoint is configured and valid
        if not session.ats_data_endpoint or not session.ats_api_token:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Session {token} has no ATS endpoint or API token configured")
            return Response(
                {'error': "ATS endpoint veya API token yapılandırılmamış"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Check if endpoint is localhost (won't work in production)
        if 'localhost' in session.ats_data_endpoint or '127.0.0.1' in session.ats_data_endpoint:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Session {token} has localhost endpoint: {session.ats_data_endpoint}")
            return Response(
                {'error': "ATS endpoint localhost olarak ayarlanmış. Production'da external URL kullanılmalı."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Fetch data from ATS endpoint
        try:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Fetching ATS data for session {token} from {session.ats_data_endpoint}")
            
            ats_data = ATSService.fetch_interview_data(
                endpoint=session.ats_data_endpoint,
                api_token=session.ats_api_token
            )
            logger.info(f"Successfully fetched ATS data for session {token}")
            return Response(ats_data)
        except Exception as ats_error:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"ATS fetch failed for session {token}: {str(ats_error)}", exc_info=True)
            
            # Return user-friendly error message
            error_msg = str(ats_error)
            if 'Connection' in error_msg or 'timeout' in error_msg.lower() or 'ConnectionError' in error_msg:
                error_msg = "ATS'den veri alınamadı: Bağlantı hatası"
            elif '401' in error_msg or 'Unauthorized' in error_msg:
                error_msg = "ATS'den veri alınamadı: Yetkilendirme hatası"
            elif '404' in error_msg:
                error_msg = "ATS'den veri alınamadı: Session bulunamadı"
            elif "ATS'den veri alınamadı" not in error_msg:
                error_msg = f"ATS'den veri alınamadı: {error_msg}"
            
            return Response(
                {'error': error_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in get_interview_data for token {token}: {str(e)}", exc_info=True)
        
        return Response(
            {'error': f'Mülakat verileri alınamadı: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_session(request):
    """
    POST /api/session/create/
    
    ATS creates a new interview session (zero-knowledge mode)
    
    Body:
    {
        "external_session_id": "ATS-123",
        "ats_data_endpoint": "https://ats.com/api/interview/123",
        "ats_webhook_url": "https://ats.com/webhook/report",
        "ats_api_token": "secret-token",
        "expires_in_hours": 24
    }
    
    Returns:
    {
        "token": "uuid",
        "interview_link": "https://...",
        "expires_at": "..."
    }
    """
    required_fields = ['external_session_id', 'ats_data_endpoint', 'ats_webhook_url', 'ats_api_token']
    for field in required_fields:
        if field not in request.data:
            return Response(
                {'error': f'Eksik alan: {field}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Validate ATS endpoints (no localhost in production)
    is_production = os.getenv('IS_RENDER') or os.getenv('RENDER')
    ats_data_endpoint = request.data['ats_data_endpoint']
    ats_webhook_url = request.data['ats_webhook_url']
    
    if is_production:
        if 'localhost' in ats_data_endpoint or '127.0.0.1' in ats_data_endpoint:
            return Response(
                {'error': 'ATS data endpoint localhost olamaz. Production\'da external URL kullanılmalı.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if 'localhost' in ats_webhook_url or '127.0.0.1' in ats_webhook_url:
            return Response(
                {'error': 'ATS webhook URL localhost olamaz. Production\'da external URL kullanılmalı.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    from datetime import timedelta
    expires_in_hours = request.data.get('expires_in_hours', 24)
    
    # Get company from middleware (API key auth)
    company = getattr(request, 'company', None)
    
    # Create session (NO personal data stored!)
    session = InterviewSession.objects.create(
        company=company,  # Link to company for tracking
        external_id=request.data['external_session_id'],
        ats_data_endpoint=request.data['ats_data_endpoint'],
        ats_webhook_url=request.data['ats_webhook_url'],
        ats_api_token=request.data['ats_api_token'],
        status='pending',
        expires_at=timezone.now() + timedelta(hours=expires_in_hours),
        # NO candidate data, NO job data, NO resume!
    )
    
    # Increment company usage
    if company:
        company.increment_usage()
    
    # Generate interview link
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5175').rstrip('/')
    interview_link = f"{frontend_url}/interview/{session.token}"
    
    return Response(
        {
            'token': str(session.token),
            'interview_link': interview_link,
            'expires_at': session.expires_at.isoformat()
        },
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def parse_cv(request):
    """
    POST /api/parse-cv/
    
    Parse CV file and extract candidate information.
    
    Expected: multipart/form-data with 'file' field
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    file = request.FILES['file']
    
    try:
        result = GeminiService.parse_cv(file)
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'POST'])
def get_interview_prompt(request):
    """
    GET /api/interview/prompt/?position=...
    POST /api/interview/prompt/
    
    Get the interview system prompt for a given job position.
    POST body:
    {
        "jobPosition": "...",
        "companyName": "...",
        "companyInfo": "...",
        "jobDescription": "...",
        "candidateResume": {...},
        "avatarId": "male" | "female"
    }
    """
    if request.method == 'GET':
        # Legacy GET support
        job_position = request.query_params.get('position', '')
        
        if not job_position:
            return Response(
                {'error': 'Job position is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            prompt = GeminiService.get_interview_prompt(job_position)
            return Response({'prompt': prompt}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    else:  # POST
        # Get data from request body
        job_position = request.data.get('jobPosition', '')
        company_name = request.data.get('companyName', '')
        company_info = request.data.get('companyInfo', '')
        job_description = request.data.get('jobDescription', '')
        candidate_resume = request.data.get('candidateResume', {})
        avatar_id = request.data.get('avatarId', 'female')
        
        if not job_position:
            return Response(
                {'error': 'jobPosition is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            system_prompt = GeminiService.get_interview_system_prompt(
                job_position=job_position,
                company_name=company_name,
                company_info=company_info,
                job_description=job_description,
                candidate_resume=candidate_resume,
                avatar_id=avatar_id
            )
            return Response({'systemPrompt': system_prompt}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
def generate_report(request):
    """
    POST /api/interview/report/
    
    Generate interview report from transcript.
    
    Expected payload:
    {
        "transcript": [...],
        "candidate_name" or "candidateName": "...",
        "job_position" or "jobPosition": "...",
        "job_description" or "jobDescription": "...",
        "resume": {...}
    }
    """
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        transcript = request.data.get('transcript', [])
        # Support both camelCase and snake_case
        candidate_name = request.data.get('candidate_name') or request.data.get('candidateName', '')
        job_position = request.data.get('job_position') or request.data.get('jobPosition', '')
        job_description = request.data.get('job_description') or request.data.get('jobDescription', '')
        resume = request.data.get('resume', {})
        
        if not transcript:
            logger.error("generate_report: transcript is required")
            return Response(
                {'error': 'Transcript is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Generating report for candidate: {candidate_name}, position: {job_position}")
        
        report = GeminiService.generate_report(
            transcript=transcript,
            candidate_name=candidate_name,
            job_position=job_position,
            job_description=job_description,
            resume=resume
        )
        
        logger.info("Report generated successfully")
        return Response({'report': report}, status=status.HTTP_200_OK)
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error generating report: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Rapor oluşturulamadı: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def complete_interview(request, token):
    """
    POST /api/session/{token}/complete/
    
    Complete an interview session and send report to ATS webhook.
    
    Expected payload:
    {
        "report": {
            "candidateName": "...",
            "overallScore": 85,
            "categoryScores": {...},
            "summary": "...",
            "transcript": [...]
        }
    }
    """
    try:
        session = get_object_or_404(InterviewSession, token=token)
        
        # Validate request
        serializer = ReportSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report_data = serializer.validated_data['report']
        
        # Mark session as completed
        session.status = 'completed'
        session.completed_at = timezone.now()
        session.save()
        
        # Send report to ATS webhook
        webhook_success = ATSService.send_report_to_webhook(
            webhook_url=session.ats_webhook_url,
            api_token=session.ats_api_token,
            session_id=session.external_id,
            report_data=report_data,
            interview_token=str(session.token)
        )
        
        if not webhook_success:
            # Store report temporarily for retry
            session.temp_report_data = report_data
            session.save()
        
        return Response({
            'success': True,
            'webhook_sent': webhook_success
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def api_root(request):
    """
    GET /api/
    
    API root endpoint with available endpoints.
    """
    return Response({
        'message': 'AI Interview Platform API',
        'version': '1.0',
        'endpoints': {
            'health': '/api/health/',
            'docs': '/api/docs/',
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
            },
            'session': {
                'create': '/api/session/create/',
                'get': '/api/session/{token}/',
            }
        }
    })


@api_view(['GET'])
def health_check(request):
    """
    GET /api/health/
    
    Health check endpoint.
    """
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat()
    })


@api_view(['POST'])
def create_support_session(request):
    """
    POST /api/support/sessions/
    
    Create a support session record from landing page assistant.
    
    Expected payload:
    {
        "session_id": "uuid",
        "transcript": [{"role": "...", "text": "..."}],
        "has_demo_request": true/false,
        "demo_request_data": {...},
        "closure_reason": "manual|ai_requested|network_error|server_error|timeout|unknown",
        "closure_details": "...",
        "duration_seconds": 123,
        "user_ip": "...",
        "user_agent": "..."
    }
    """
    try:
        data = request.data
        
        # Get or create support session
        session_id = data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        support_session, created = SupportSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'transcript': data.get('transcript', []),
                'has_demo_request': data.get('has_demo_request', False),
                'demo_request_data': data.get('demo_request_data', {}),
                'closure_reason': data.get('closure_reason', 'unknown'),
                'closure_details': data.get('closure_details', ''),
                'duration_seconds': data.get('duration_seconds', 0),
                'user_ip': request.META.get('REMOTE_ADDR'),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'is_completed': True,
            }
        )
        
        if not created:
            # Update existing session
            support_session.transcript = data.get('transcript', support_session.transcript)
            support_session.has_demo_request = data.get('has_demo_request', support_session.has_demo_request)
            # Demo request data'yı güncelle (boş dict gelirse mevcut data'yı koru)
            new_demo_data = data.get('demo_request_data', {})
            if new_demo_data:  # Eğer yeni data varsa güncelle
                support_session.demo_request_data = new_demo_data
            support_session.closure_reason = data.get('closure_reason', support_session.closure_reason)
            support_session.closure_details = data.get('closure_details', support_session.closure_details)
            support_session.duration_seconds = data.get('duration_seconds', support_session.duration_seconds)
            support_session.is_completed = True
        
        # Her durumda mark_ended çağır (closure_reason ve ended_at set edilsin)
        support_session.mark_ended(
            reason=data.get('closure_reason', 'unknown'),
            details=data.get('closure_details', '')
        )
        
        # Generate summary asynchronously (don't block response)
        try:
            support_session.generate_summary()
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to generate summary for session {support_session.session_id}: {e}")
        
        return Response({
            'success': True,
            'session_id': str(support_session.session_id),
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def submit_demo_request(request):
    """
    POST /api/support/demo-request/
    
    Submit a demo request during an active session (session continues).
    
    Expected payload:
    {
        "session_id": "uuid",
        "demo_request_data": {
            "name": "...",
            "company": "...",
            "preferredTime": "...",
            "email": "...",
            "contact": "..."
        }
    }
    """
    try:
        data = request.data
        
        session_id = data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        demo_request_data = data.get('demo_request_data', {})
        if not demo_request_data:
            return Response(
                {'error': 'demo_request_data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create support session (session may still be active)
        support_session, created = SupportSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'transcript': [],
                'has_demo_request': True,
                'demo_request_data': demo_request_data,
                'user_ip': request.META.get('REMOTE_ADDR'),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'is_completed': False,  # Session devam ediyor
            }
        )
        
        if not created:
            # Update existing session with demo request
            support_session.has_demo_request = True
            support_session.demo_request_data = demo_request_data
            # Session devam ediyor, is_completed'i False bırak
            support_session.is_completed = False
            support_session.save()
        
        return Response({
            'success': True,
            'session_id': str(support_session.session_id),
            'message': 'Demo request submitted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
