# AI Interview Platform - SaaS Documentation

## 🎯 Overview

AI Interview Platform, yapay zeka destekli video mülakat platformudur. Bu doküman, **SaaS (Software as a Service)** modunda çalışan sistemin tüm özelliklerini açıklar.

---

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [Setup](#setup)
4. [Usage](#usage)
5. [API Documentation](#api-documentation)
6. [Admin Panel](#admin-panel)
7. [Cron Jobs](#cron-jobs)
8. [Deployment](#deployment)

---

## 🏗️ Architecture

### **Tech Stack**

**Backend:**
- Django 4.2 + DRF (REST API)
- PostgreSQL (Database)
- Google Gemini AI (Interview & CV Parsing)
- Python 3.9+

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- React Router (Routing)

### **System Design**

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (ATS)                       │
│  - Creates session via API key                     │
│  - Receives webhook with report                    │
└──────────────┬──────────────────────────────────────┘
               │
               │ HTTPS (API Key Auth)
               │
┌──────────────▼──────────────────────────────────────┐
│              BACKEND (Django)                       │
│  - API Key authentication                           │
│  - Session management                               │
│  - Quota enforcement                                │
│  - Zero-knowledge architecture                      │
│  - Webhook retry with encryption                    │
└──────────────┬──────────────────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────────────────┐
│           CANDIDATE (Browser)                       │
│  - Video interview via Gemini Live API              │
│  - Real-time AI interaction                         │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Features

### **1. Multi-Tenant SaaS**
- Company registration & login
- API key generation (automatic)
- Quota management (10/month free)
- Usage tracking & analytics

### **2. Dashboard**
- Session statistics
- Usage charts (7 days / 30 days)
- Quota monitoring
- Session history

### **3. API Integration**
- RESTful API for ATS integration
- API key authentication
- Webhook callbacks
- Rate limiting

### **4. Zero-Knowledge Architecture**
- No permanent storage of candidate data
- Proxy data from ATS
- Temporary encrypted report storage
- Auto-cleanup

### **5. Safety Net**
- Webhook retry mechanism (5 attempts)
- Encrypted temporary storage
- Automatic cleanup after 24h
- Detailed error logging

---

## 🚀 Setup

### **Prerequisites**

```bash
# System requirements
- Python 3.9+
- Node.js 18+
- PostgreSQL 15+
- npm or yarn
```

### **Backend Setup**

```bash
cd backend

# Install uv (package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate     # Windows

# Install dependencies
uv pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://localhost:5432/interview_db
GEMINI_API_KEY=your_gemini_api_key_here
ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
SECRET_KEY=your_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5175
EOF

# Create PostgreSQL database
createdb interview_db

# Run migrations
python manage.py migrate

# Create default prompts
python manage.py create_default_prompts

# Create admin user
python manage.py createsuperuser

# Run server
python manage.py runserver 0.0.0.0:8000
```

### **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### **Access URLs**

- **Frontend Dashboard:** http://localhost:5175/login
- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/

---

## 📖 Usage

### **1. Company Registration**

**Via Dashboard:**
```
1. Go to http://localhost:5175/register
2. Fill in company details
3. Submit form
4. Auto-login to dashboard
```

**Via API:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@example.com",
    "password": "securepass123",
    "company_name": "My Company Inc.",
    "website": "https://mycompany.com"
  }'
```

### **2. Get API Key**

**Via Dashboard:**
```
1. Login to dashboard
2. Go to Settings page
3. Copy API key
```

**Response:**
```json
{
  "api_key": "sk_live_abc123xyz...",
  "quota_monthly": 10,
  "quota_used_this_month": 0
}
```

### **3. Create Interview Session**

```bash
curl -X POST http://localhost:8000/api/session/create/ \
  -H "Authorization: Bearer sk_live_abc123xyz..." \
  -H "Content-Type: application/json" \
  -d '{
    "external_session_id": "ATS-12345",
    "ats_data_endpoint": "https://ats.example.com/api/interview/12345",
    "ats_webhook_url": "https://ats.example.com/webhook/report",
    "ats_api_token": "ats_secret_token",
    "expires_in_hours": 24
  }'
```

**Response:**
```json
{
  "token": "9eaa2e6c-0cb2-4ba1-810b-9276c369803d",
  "interview_link": "http://localhost:5175/interview/9eaa2e6c-0cb2-4ba1-810b-9276c369803d",
  "expires_at": "2025-12-11T14:50:22.009293+00:00",
  "status": "created"
}
```

### **4. Send Link to Candidate**

Adayı `interview_link` URL'sine yönlendirin. Aday:
1. Browser'da linki açar
2. Kamera/mikrofon izni verir
3. AI ile video mülakatı yapar
4. Mülakat otomatik olarak tamamlanır

### **5. Receive Webhook**

Mülakat tamamlandığında, sisteminize webhook gönderilir:

```json
POST https://ats.example.com/webhook/report
Authorization: Bearer ats_secret_token

{
  "session_id": "ATS-12345",
  "interview_token": "9eaa2e6c-0cb2-4ba1-810b-9276c369803d",
  "completed_at": "2025-12-10T15:30:00Z",
  "report": {
    "overallScore": 85,
    "recommendation": "Kesinlikle İşe Alınmalı",
    "technicalSkills": { ... },
    "softSkills": { ... },
    "detailedAnalysis": "...",
    "strengths": [...],
    "weaknesses": [...],
    "interviewTranscript": [...]
  }
}
```

---

## 🔌 API Documentation

### **Authentication**

**Login:**
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "password123"
}
```

**Register:**
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "password123",
  "company_name": "My Company"
}
```

**Logout:**
```http
POST /api/auth/logout/
```

**Get Current Company:**
```http
GET /api/auth/me/
Cookie: sessionid=...
```

**Regenerate API Key:**
```http
POST /api/auth/regenerate-key/
Cookie: sessionid=...
```

### **Dashboard**

**Get Stats:**
```http
GET /api/dashboard/stats/
Cookie: sessionid=...
```

**Get Usage Chart:**
```http
GET /api/dashboard/usage-chart/?period=week
Cookie: sessionid=...
```

**Get Sessions:**
```http
GET /api/dashboard/sessions/?limit=20
Cookie: sessionid=...
```

### **Session Management (API Key Auth)**

**Create Session:**
```http
POST /api/session/create/
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "external_session_id": "ATS-123",
  "ats_data_endpoint": "https://...",
  "ats_webhook_url": "https://...",
  "ats_api_token": "...",
  "expires_in_hours": 24
}
```

**Get Session Data (proxy):**
```http
GET /api/session/{token}/
```

**Complete Session:**
```http
POST /api/session/{token}/complete/
Content-Type: application/json

{
  "report": { ... }
}
```

---

## 👨‍💼 Admin Panel

### **Access**

```
URL: http://localhost:8000/admin/
Username: admin
Password: (created during setup)
```

### **Features**

1. **Company Management**
   - View/edit companies
   - Change plans (free/pro/enterprise)
   - Reset quotas manually
   - Regenerate API keys
   - Activate/deactivate companies

2. **Session Management**
   - View all sessions
   - Filter by status, company
   - View duration, timestamps
   - Inspect reports (if stored)

3. **Prompt Management**
   - Edit AI prompts
   - Version control
   - Activate/deactivate prompts
   - CV parser, interviewer, report generator

---

## ⏰ Cron Jobs

### **Setup**

```bash
cd backend
./setup_cron.sh
```

### **Manual Commands**

**Retry Failed Webhooks:**
```bash
python manage.py retry_webhooks
```

**Cleanup Expired Reports:**
```bash
python manage.py cleanup_temp_data
```

**Reset Monthly Quotas:**
```bash
python manage.py reset_quotas
```

### **Cron Schedule**

```cron
# Retry webhooks (every 5 minutes)
*/5 * * * * python manage.py retry_webhooks

# Cleanup (daily at 3 AM)
0 3 * * * python manage.py cleanup_temp_data

# Reset quotas (1st of month at 2 AM)
0 2 1 * * python manage.py reset_quotas
```

---

## 🚢 Deployment

### **Environment Variables (Production)**

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
GEMINI_API_KEY=your_production_key
ENCRYPTION_KEY=generated_key_here
SECRET_KEY=random_django_secret
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SESSION_COOKIE_SECURE=True
```

### **Database Migration**

```bash
# Backup production DB
pg_dump interview_db > backup.sql

# Run migrations
python manage.py migrate

# Verify
python manage.py check
```

### **Static Files**

```bash
python manage.py collectstatic --noinput
```

### **Frontend Build**

```bash
cd frontend
npm run build
# Deploy dist/ folder to CDN/hosting
```

### **Nginx Configuration**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/interview/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Admin
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

---

## 🔐 Security

### **Best Practices**

1. **API Keys:**
   - Never commit to git
   - Rotate regularly
   - Use separate keys for test/prod

2. **Database:**
   - Enable SSL connections
   - Regular backups
   - Limit access by IP

3. **HTTPS:**
   - Use SSL certificates (Let's Encrypt)
   - Enable HSTS headers
   - Set secure cookie flags

4. **Rate Limiting:**
   - API endpoints throttled
   - Login attempt limits
   - DDoS protection

---

## 📊 Monitoring

### **Logs**

```bash
# Application logs
tail -f /tmp/interview_webhooks.log
tail -f /tmp/interview_cleanup.log
tail -f /tmp/interview_quotas.log

# Django logs
python manage.py runserver > app.log 2>&1
```

### **Health Check**

```bash
curl http://localhost:8000/api/health/
```

### **Database Stats**

```sql
-- Company count
SELECT COUNT(*) FROM interview_api_company;

-- Sessions by status
SELECT status, COUNT(*) FROM interview_api_interviewsession GROUP BY status;

-- Quota usage
SELECT company_name, quota_used_this_month, quota_monthly 
FROM interview_api_company 
ORDER BY quota_used_this_month DESC;
```

---

## 🆘 Troubleshooting

### **Quota Exceeded**

```bash
# Manually reset quota for a company
python manage.py shell
>>> from interview_api.company_models import Company
>>> company = Company.objects.get(email='company@example.com')
>>> company.reset_monthly_quota()
```

### **Webhook Failures**

```bash
# Check failed webhooks
python manage.py shell
>>> from interview_api.models import InterviewSession
>>> failed = InterviewSession.objects.filter(temp_report_encrypted__isnull=False)
>>> for s in failed:
...     print(f"{s.token}: {s.webhook_last_error}")
```

### **API Key Issues**

```bash
# Regenerate API key via admin or shell
python manage.py shell
>>> from interview_api.company_models import Company
>>> company = Company.objects.get(email='company@example.com')
>>> new_key = company.regenerate_api_key()
>>> print(f"New API key: {new_key}")
```

---

## 📞 Support

**Documentation:** README_SAAS.md  
**Admin Panel:** http://localhost:8000/admin/  
**API Health:** http://localhost:8000/api/health/  

---

## 📝 License

Proprietary - All rights reserved

---

## 🎉 Quick Start Recap

```bash
# 1. Backend
cd backend
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
createdb interview_db
python manage.py migrate
python manage.py create_default_prompts
python manage.py createsuperuser
python manage.py runserver

# 2. Frontend
cd frontend
npm install
npm run dev

# 3. Access
# Dashboard: http://localhost:5175/login
# Admin: http://localhost:8000/admin/
```

**Test Credentials:**
```
Email: test@example.com
Password: testpass123
API Key: (check dashboard/settings)
```

🚀 **Ready to go!**

