import json
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from interview_api.models import InterviewSession


class Command(BaseCommand):
    help = 'Create a sample interview session for testing'

    def handle(self, *args, **options):
        # Sample resume data
        sample_resume = {
            "name": "Ahmet",
            "surname": "Yılmaz",
            "email": "ahmet.yilmaz@example.com",
            "city": "İstanbul",
            "country": "Türkiye",
            "skills": [
                "React",
                "TypeScript",
                "Next.js",
                "TailwindCSS",
                "Node.js",
                "PostgreSQL"
            ],
            "education_summary": "Bilgisayar Mühendisliği - İstanbul Teknik Üniversitesi (2018)",
            "experience_summary": "6 yıllık frontend development deneyimi, modern web teknolojileri konusunda uzman",
            "work_experience_details": [
                {
                    "company": "Digital Agency Ltd.",
                    "position": "Senior Frontend Developer",
                    "is_ongoing": True,
                    "start_date": "2021-05",
                    "description": "React ve TypeScript ile kurumsal web uygulamaları geliştirme"
                },
                {
                    "company": "StartupCo",
                    "position": "Frontend Developer",
                    "is_ongoing": False,
                    "start_date": "2018-09",
                    "end_date": "2021-04",
                    "description": "E-ticaret platformu geliştirme"
                }
            ]
        }

        session = InterviewSession.objects.create(
            candidate_name="Ahmet Yılmaz",
            candidate_email="ahmet.yilmaz@example.com",
            job_position="Senior Frontend Developer",
            company_name="TechCorp A.Ş.",
            company_info="İnovatif, hızlı büyüyen, çalışan odaklı bir teknoloji şirketi. Remote-first kültür.",
            job_description="""
Aranan Nitelikler:
- React.js ve TypeScript konusunda uzman
- 5+ yıl frontend deneyimi
- UI/UX tasarım prensipleri bilgisi
- Agile/Scrum deneyimi
- İngilizce iletişim becerisi
- Problem çözme yeteneği
            """,
            candidate_resume=json.dumps(sample_resume, ensure_ascii=False, indent=2),
            avatar_id='female',
            status='pending',
            expires_at=timezone.now() + timedelta(days=7)
        )

        import os
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5175')
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Örnek mülakat session\'ı oluşturuldu!')
        )
        self.stdout.write(f'\n📋 Token: {session.token}')
        self.stdout.write(f'🔗 Link: {frontend_url}/interview#/{session.token}')
        self.stdout.write(f'\n')

