"""
Gemini AI Service
Handles all Gemini API interactions
"""
import os
import json
import google.generativeai as genai
from django.conf import settings
from .models import Prompt


# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))


class GeminiService:
    """Service class for Gemini API operations"""
    
    @staticmethod
    def parse_cv(cv_text: str) -> dict:
        """
        Parse CV text using Gemini AI
        Returns structured JSON data
        """
        # Get active CV parser prompt
        prompt_obj = Prompt.get_active_prompt('cv_parser')
        
        if not prompt_obj:
            raise Exception(
                "CV parser prompt bulunamadı. Lütfen admin panelinden 'cv_parser' tipinde aktif bir prompt oluşturun."
            )
        
        system_prompt = prompt_obj.system_prompt
        
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash-exp',
            generation_config={
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        )
        
        try:
            response = model.generate_content([
                {"role": "user", "parts": [{"text": system_prompt}]},
                {"role": "user", "parts": [{"text": f"CV Metni:\n\n{cv_text}"}]}
            ])
            
            result = json.loads(response.text)
            return result
            
        except Exception as e:
            raise Exception(f"CV parsing hatası: {str(e)}")
    
    @staticmethod
    def get_interview_system_prompt(
        job_position: str,
        company_name: str,
        company_info: str,
        job_description: str,
        candidate_resume: dict,
        avatar_id: str = 'female'
    ) -> str:
        """
        Get interview system prompt from database
        Interpolate variables into template
        """
        prompt_obj = Prompt.get_active_prompt('interviewer_system')
        
        if not prompt_obj:
            raise Exception(
                "Interview system prompt bulunamadı. Lütfen admin panelinden 'interviewer_system' tipinde aktif bir prompt oluşturun."
            )
        
        # Determine interviewer name and role based on avatar
        if avatar_id == 'male':
            interviewer_name = 'Mert'
            interviewer_role = 'Teknik Lider'
            interviewer_personality = 'Profesyonel, teknik odaklı, analitik düşünen bir yaklaşım sergile.'
        else:  # female
            interviewer_name = 'Zeynep'
            interviewer_role = 'İK Uzmanı'
            interviewer_personality = 'Sıcak, samimi, aday odaklı bir yaklaşım sergile.'
        
        # Replace variables in template
        template = prompt_obj.system_prompt
        template = template.replace('{{job_position}}', job_position)
        template = template.replace('{{company_name}}', company_name)
        template = template.replace('{{company_info}}', company_info)
        template = template.replace('{{job_description}}', job_description)
        template = template.replace('{{candidate_resume}}', json.dumps(candidate_resume, ensure_ascii=False))
        template = template.replace('{{interviewer_name}}', interviewer_name)
        template = template.replace('{{interviewer_role}}', interviewer_role)
        template = template.replace('{{interviewer_personality}}', interviewer_personality)
        
        return template
    
    @staticmethod
    def generate_report(
        transcript: list,
        candidate_name: str,
        job_position: str
    ) -> dict:
        """
        Generate interview report using Gemini AI
        """
        prompt_obj = Prompt.get_active_prompt('report_generator')
        
        if not prompt_obj:
            raise Exception(
                "Report generator prompt bulunamadı. Lütfen admin panelinden 'report_generator' tipinde aktif bir prompt oluşturun."
            )
        
        system_prompt = prompt_obj.system_prompt
        
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash-exp',
            generation_config={
                "temperature": 0.3,
                "response_mime_type": "application/json"
            }
        )
        
        transcript_text = "\n".join([
            f"{item['role']}: {item['text']}" 
            for item in transcript
        ])
        
        try:
            response = model.generate_content([
                {"role": "user", "parts": [{"text": system_prompt}]},
                {"role": "user", "parts": [{"text": f"Aday: {candidate_name}\nPozisyon: {job_position}\n\nMülakat Transkripti:\n{transcript_text}"}]}
            ])
            
            result = json.loads(response.text)
            return result
            
        except Exception as e:
            raise Exception(f"Rapor oluşturma hatası: {str(e)}")

