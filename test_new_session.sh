#!/bin/bash

# Test: Yeni session oluşturma (doğru ID ile)

API_URL="https://interview-backend-zb9b.onrender.com/api/session/create/"
API_KEY="YOUR_API_KEY"  # Dashboard'dan alın

# Doğru interview data ID'si ile oluşturun
curl -X POST "$API_URL" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "external_session_id": "TEST-NEW-SESSION",
    "ats_data_endpoint": "https://api.qtale.io/api/v1/recruiter/applications/public/interview-data/DOGRU_ID_BURAYA",
    "ats_webhook_url": "https://api.qtale.io/api/v1/recruiter/applications/public/interview-webhook/DOGRU_ID_BURAYA",
    "ats_api_token": "048e9c3e-3...",
    "expires_in_hours": 24
  }'

echo ""
echo "Sonuç:"
echo "- interview_link ile interview sayfasına gidin"
echo "- Eğer yine 404 alırsanız: api.qtale.io backend'inde o ID yok demektir"
echo "- Eğer çalışırsa: ID=8 geçersizdi, doğru ID ile session oluşturmalısınız"


