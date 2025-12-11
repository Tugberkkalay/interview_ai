# Django Backend for AI Interview System

## PostgreSQL Setup

### 1. Install PostgreSQL (macOS)
```bash
brew install postgresql@15
brew services start postgresql@15
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

### 2. Create Database
```bash
createdb interview_db
```

### 3. Create .env File
Create `backend/.env` file:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://localhost:5432/interview_db
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

## Django Setup

### Install uv (if not already installed)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
```

### Setup and Run

1. Install dependencies:
```bash
cd backend
uv sync
```

2. Run migrations:
```bash
uv run python manage.py migrate
```

3. Create sample interview session:
```bash
uv run python manage.py create_sample_session
```

4. Create superuser (optional):
```bash
uv run python manage.py createsuperuser
```

5. Run server:
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
uv run python manage.py runserver
```

**Note:** All Django commands should be run with `uv run` prefix, e.g.:
- `uv run python manage.py migrate`
- `uv run python manage.py createsuperuser`
- `uv run python manage.py runserver`

## Project Structure

```
backend/
├── interview_api/          # Main Django app
│   ├── models.py          # InterviewSession model
│   ├── views.py           # API endpoints
│   ├── serializers.py     # DRF serializers
│   └── urls.py            # API routes
├── config/                 # Django settings
│   ├── settings.py
│   └── urls.py
└── manage.py
```

## API Endpoints

### GET /api/session/{token}/
Fetch interview data for a given token.

**Response:**
```json
{
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "jobPosition": "Frontend Developer",
  "companyName": "Tech Corp",
  "companyInfo": "...",
  "jobDescription": "...",
  "candidateResume": "...",
  "avatarId": "female"
}
```

### POST /api/session/{token}/complete/
Submit interview report.

**Request:**
```json
{
  "report": {
    "candidateName": "...",
    "overallScore": 85,
    "categoryScores": {...},
    ...
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Report submitted successfully"
}
```

## Environment Variables

Create a `.env` file in the backend directory:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Admin Panel

Access Django admin at `http://localhost:8000/admin/`
- View all interview sessions
- Generate new tokens
- Review submitted reports

