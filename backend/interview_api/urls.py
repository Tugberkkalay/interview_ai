from django.urls import path
from . import views
from . import profile_views

urlpatterns = [
    # Root endpoint
    path('', views.api_root, name='api_root'),
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # ===== AUTHENTICATION =====
    path('auth/register/', profile_views.register, name='register'),
    path('auth/login/', profile_views.login_view, name='login'),
    path('auth/logout/', profile_views.logout_view, name='logout'),
    path('auth/me/', profile_views.me, name='me'),
    path('auth/update/', profile_views.update_profile, name='update_profile'),
    path('auth/upload-logo/', profile_views.upload_logo, name='upload_logo'),
    path('auth/regenerate-key/', profile_views.regenerate_api_key, name='regenerate_key'),
    
    # ===== DASHBOARD =====
    path('dashboard/stats/', profile_views.dashboard_stats, name='dashboard_stats'),
    path('dashboard/usage-chart/', profile_views.dashboard_usage_chart, name='dashboard_usage_chart'),
    path('dashboard/sessions/', profile_views.dashboard_sessions, name='dashboard_sessions'),
    path('dashboard/sessions/<uuid:token>/', profile_views.dashboard_session_detail, name='dashboard_session_detail'),
    
    # ===== SESSION MANAGEMENT (ATS Integration - requires API key) =====
    path('session/create/', views.create_session, name='create_session'),
    path('session/<uuid:token>/', views.get_interview_data, name='get_interview_data'),
    path('session/<uuid:token>/complete/', views.complete_interview, name='complete_interview'),
    
    # ===== AI SERVICES =====
    path('parse-cv/', views.parse_cv, name='parse_cv'),
    path('interview/prompt/', views.get_interview_prompt, name='get_interview_prompt'),
    path('interview/report/', views.generate_report, name='generate_report'),
    
    # ===== SUPPORT SESSIONS =====
    path('support/sessions/', views.create_support_session, name='create_support_session'),
    path('support/demo-request/', views.submit_demo_request, name='submit_demo_request'),
]

