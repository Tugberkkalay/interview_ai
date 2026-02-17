# AI Interview Simulation System

Yapay zeka destekli mülakat simülasyon platformu. Google Gemini API kullanarak gerçek zamanlı ses ve görüntü analizi ile profesyonel mülakat deneyimi sunar.

## 🚀 Özellikler

### Standalone Mode (`/try`)
- **Konfigürasyon Ekranı**: İlan, şirket bilgileri ve CV yükleme
- **Canlı Mülakat**: AI uzman ile gerçek zamanlı görüntülü görüşme
- **Detaylı Rapor**: Performans analizi, kategori skorları ve öneriler

### Integrated Mode (`/interview/:token`)
- **ATS Entegrasyonu**: Token-bazlı veri çekme ve rapor gönderme
- **Backend API**: Django REST Framework ile veri yönetimi
- **Admin Panel**: Mülakat session'larını yönetme ve izleme

## 📁 Proje Yapısı

```
interview/                    # Root (sadece dokümantasyon)
├── README.md                 # Ana dokümantasyon
├── .gitignore                # Git ignore kuralları
│
├── frontend/                 # React + TypeScript + Vite
│   ├── .env                  # Frontend environment variables
│   ├── .env.example          # Environment variables şablonu
│   ├── src/
│   │   ├── components/       # UI bileşenleri
│   │   │   ├── InterviewConfiguration.tsx
│   │   │   ├── InterviewSession.tsx
│   │   │   └── InterviewReport.tsx
│   │   ├── pages/            # Sayfa componentleri
│   │   │   ├── LandingPage.tsx
│   │   │   ├── TryInterviewPage.tsx
│   │   │   └── IntegratedInterviewPage.tsx
│   │   ├── services/
│   │   │   └── api.ts        # Backend API servisleri
│   │   ├── types.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── backend/                  # Django + DRF + PostgreSQL
    ├── .env                  # Backend environment variables
    ├── .env.example          # Environment variables şablonu
    ├── interview_api/        # Ana Django app
    │   ├── models.py         # InterviewSession modeli
    │   ├── views.py          # API endpoints
    │   ├── serializers.py    # DRF serializers
    │   ├── admin.py          # Admin panel
    │   └── urls.py
    ├── config/               # Django ayarları
    │   ├── settings.py
    │   └── urls.py
    ├── requirements.txt
    ├── README.md             # Backend dokümantasyonu
    └── manage.py
```

## 🛠️ Kurulum

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5175` adresinde çalışacaktır.

### Backend

#### 1. PostgreSQL Kur ve Başlat
```bash
brew install postgresql@15
brew services start postgresql@15
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
createdb interview_db
```

#### 2. Django Kur
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. .env Dosyası Oluştur
`backend/.env` dosyası oluştur:
```env
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
DATABASE_URL=postgresql://localhost:5432/interview_db
```

#### 4. Migration ve Sample Data
```bash
python manage.py migrate
python manage.py create_sample_session
```

#### 5. Server Başlat
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
python manage.py runserver
```

Backend `http://localhost:8000` adresinde çalışacaktır.

## 🔑 Ortam Değişkenleri

### Frontend (.env kök dizinde)
```env
# Gemini API Key
API_KEY=your-gemini-api-key-here

# Backend API
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

### Backend (backend/.env)
```env
DEBUG=True
SECRET_KEY=your-django-secret-key
DATABASE_URL=postgresql://localhost:5432/interview_db
```

## 🌐 Rotalar

- **`/`** - Landing page (ana sayfa)
- **`/try`** - Standalone demo modu
- **`/interview/:token`** - Entegre plugin modu

## 📡 API Endpoints

### Health Check
```bash
GET /api/health/
```

### Mülakat Verilerini Çek
```bash
GET /api/session/{token}/
```

**Response:**
```json
{
  "candidateName": "Ahmet Yılmaz",
  "candidateEmail": "ahmet@example.com",
  "jobPosition": "Senior Frontend Developer",
  "companyName": "TechCorp A.Ş.",
  "companyInfo": "...",
  "jobDescription": "...",
  "candidateResume": "{...}",
  "avatarId": "female"
}
```

### Rapor Gönder
```bash
POST /api/session/{token}/complete/
Content-Type: application/json

{
  "report": {
    "candidateName": "Ahmet Yılmaz",
    "overallScore": 85,
    "categoryScores": {
      "technical": 90,
      "communication": 85,
      "problemSolving": 80,
      "motivation": 85,
      "cultural": 80
    },
    "summary": "...",
    "transcript": [...]
  }
}
```

## 🎯 Kullanım Senaryoları

### 1. Demo/Try Modu
1. `/try` adresine git
2. İlan bilgilerini gir
3. CV yükle
4. Mülakata başla
5. Raporu görüntüle

### 2. ATS Entegrasyonu
1. Backend'de yeni session oluştur:
   ```bash
   python manage.py create_sample_session
   ```
2. Oluşan token'lı linki adaya gönder
3. Aday `/interview/{token}` adresinden mülakata girer
4. Mülakat tamamlandığında rapor otomatik olarak backend'e kaydedilir
5. Admin panel'den raporu görüntüle

## 🔧 Admin Panel

```bash
python manage.py createsuperuser
```

`http://localhost:8000/admin/` adresinden:
- Yeni mülakat session'ları oluştur
- Mülakat linklerini kopyala
- Session durumlarını izle (pending, active, completed, expired)
- Raporları JSON formatında görüntüle
- Session'ların süresini yönet (varsayılan: 7 gün)

## 🚢 Deployment

### Hetzner Sunucu (Önerilen)

Backend'i kendi Hetzner sunucunuza deploy etmek için hazır dosyalar ve dokümantasyon:

```bash
# Hızlı başlangıç için
cat HETZNER_QUICKSTART.md

# Detaylı kurulum için
cat HETZNER_DEPLOYMENT.md

# Günlük komutlar için
cat HETZNER_COMMANDS.md
```

**Deployment Dosyaları:**
- 📖 `HETZNER_README.md` - Tüm dosyaların özeti
- ⚡ `HETZNER_QUICKSTART.md` - 12 adımda hızlı kurulum
- 📚 `HETZNER_DEPLOYMENT.md` - Detaylı rehber
- 💻 `HETZNER_COMMANDS.md` - Kullanışlı komutlar
- 🚀 `deploy.sh` - Otomatik deployment script
- ⚙️ `systemd/interview.service` - Systemd service dosyası
- 🌐 `nginx/interview.conf` - Nginx configuration
- 📁 `scripts/` - Backup, restore, health-check script'leri
- 🔐 `backend/env.template.hetzner` - Environment variables şablonu

**Tek komutla deployment:**
```bash
sudo /root/qtale/service/deploy.sh
```

### Render.com

Render'a deployment için:
- 📚 `RENDER_DEPLOYMENT.md` - Detaylı Render rehberi
- 📋 `render.yaml` - Otomatik deployment yapılandırması

### Cloudflare Pages (Frontend)

Frontend için Cloudflare Pages:
- 📚 `CLOUDFLARE_PAGES_FIX.md` - Cloudflare Pages kurulumu

## 🎨 Teknolojiler

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Google Gemini API** - AI mülakat
- **Recharts** - Grafik gösterimi

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API
- **django-cors-headers** - CORS yönetimi
- **PostgreSQL 15** - Veritabanı
- **psycopg2-binary** - PostgreSQL adapter
- **dj-database-url** - Database URL parser
- **python-dotenv** - Ortam değişkenleri

### Deployment
- **Systemd** - Service management
- **Gunicorn** - WSGI server
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL certificates
- **uv** - Python package manager

## 📝 Gemini API Kullanımı

### 1. CV Parsing
- **Model**: `gemini-2.5-flash`
- Yüklenen CV'yi parse eder ve yapılandırılmış JSON formatında döner

### 2. Canlı Mülakat
- **Model**: `gemini-2.5-flash-native-audio-preview-12-2025`
- Multimodal Live API ile gerçek zamanlı ses ve görüntü analizi
- Tool calling ile görüşmeyi sonlandırma ve bilgi tabanına erişim

### 3. Rapor Oluşturma
- Mülakat transkriptini ve performans verilerini analiz eder
- Detaylı kategori skorları ve öneriler sunar

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🐛 Sorun Giderme

### Frontend çalışmıyor
- `npm install` komutunu çalıştırdınız mı?
- `.env` dosyasında `API_KEY` tanımlı mı?
- Port 5175 kullanılabilir mi?

### Backend çalışmıyor
- Virtual environment aktif mi?
- `pip install -r requirements.txt` çalıştırıldı mı?
- Migration'lar yapıldı mı? (`python manage.py migrate`)
- Port 8000 kullanılabilir mi?

### API bağlantı hatası
- Backend çalışıyor mu? (`http://localhost:8000/api/health/` kontrol edin)
- CORS ayarları doğru mu?
- Frontend'de `VITE_API_URL` doğru mu?

## 🎓 Öğrenilen Teknolojiler

- React component architecture
- TypeScript type safety
- Real-time WebRTC streaming
- Google Gemini Multimodal Live API
- Django REST Framework
- Token-based authentication
- CORS configuration
- Admin panel customization
