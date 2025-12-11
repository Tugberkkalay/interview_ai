# Cloudflare Deployment Guide

Bu dokümantasyon, AI Interview Platform'unu Cloudflare'e deploy etmek için adım adım rehberdir.

## 📋 Genel Bakış

### Cloudflare Uyumluluğu

✅ **Frontend (React + Vite)**: Cloudflare Pages'e **mükemmel uyum**
- Statik site hosting
- Otomatik CI/CD
- Global CDN
- Ücretsiz SSL sertifikası
- Hızlı build ve deploy

❌ **Backend (Django)**: Cloudflare Workers **uygun değil**
- Cloudflare Workers sadece JavaScript/TypeScript destekler
- Django Python framework'ü, tam bir uygulama sunucusu gerektirir
- PostgreSQL veritabanı bağlantıları için sürekli bağlantı gerekir

### Önerilen Mimari

**Seçenek 1: Hybrid Deployment (Önerilen)**
- **Frontend**: Cloudflare Pages
- **Backend**: Railway, Render, Fly.io veya benzeri Python destekleyen servis

**Seçenek 2: Full Cloudflare (Sınırlı)**
- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers ile basit proxy (Django'yu tam olarak çalıştıramaz)

---

## 🚀 Seçenek 1: Hybrid Deployment (Önerilen)

### Frontend: Cloudflare Pages

#### 1. Cloudflare Hesabı Oluşturma

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) üzerinden hesap oluşturun
2. "Pages" sekmesine gidin
3. "Create a project" butonuna tıklayın

#### 2. Git Repository Bağlama

1. GitHub, GitLab veya Bitbucket repository'nizi bağlayın
2. Repository'yi seçin
3. Branch'i seçin (genellikle `main` veya `master`)

#### 3. Build Ayarları

**Build configuration:**
```
Build command: npm run build
Build output directory: dist
Root directory: frontend
```

**Environment variables:**
```
VITE_API_URL=https://your-backend-url.com/api
VITE_USE_MOCK_API=false
```

**Node version:**
```
Node.js version: 18.x veya 20.x
```

#### 4. Build Script'i Güncelleme

`frontend/package.json` dosyasını kontrol edin:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

#### 5. Vite Config Güncelleme

`frontend/vite.config.ts` dosyasını production için güncelleyin:

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    },
  };
});
```

#### 6. Environment Variables

Cloudflare Pages dashboard'unda şu environment variables'ları ekleyin:

```
VITE_API_URL=https://your-backend-url.com/api
VITE_USE_MOCK_API=false
VITE_API_KEY=your-gemini-api-key (opsiyonel, backend'den de alınabilir)
```

#### 7. Deploy

1. "Save and Deploy" butonuna tıklayın
2. İlk build başlayacak (5-10 dakika sürebilir)
3. Deploy tamamlandığında URL alacaksınız: `https://your-project.pages.dev`

#### 8. Custom Domain (Opsiyonel)

1. "Custom domains" sekmesine gidin
2. Domain'inizi ekleyin
3. DNS kayıtlarını Cloudflare'e yönlendirin

---

### Backend: Railway/Render/Fly.io

Django backend'i için Cloudflare uygun olmadığından, alternatif hosting servisleri kullanılmalıdır.

#### Railway ile Deploy

**1. Railway Hesabı Oluşturma**
- [Railway.app](https://railway.app/) üzerinden hesap oluşturun
- GitHub ile bağlayın

**2. Yeni Proje Oluşturma**
- "New Project" → "Deploy from GitHub repo"
- Repository'nizi seçin

**3. Service Oluşturma**
- "New Service" → "GitHub Repo"
- `backend` klasörünü seçin

**4. Environment Variables**
```
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@host:port/dbname
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_HOSTS=your-backend-url.railway.app,your-custom-domain.com
```

**5. PostgreSQL Database**
- "New" → "Database" → "PostgreSQL"
- Otomatik olarak `DATABASE_URL` environment variable olarak eklenir

**6. Build Settings**
```
Start Command: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

**7. requirements.txt Güncelleme**
`backend/requirements.txt` dosyasına ekleyin:
```
gunicorn==21.2.0
whitenoise==6.6.0
```

**8. settings.py Production Ayarları**
`backend/config/settings.py` dosyasına ekleyin:

```python
import os
from pathlib import Path

# Production settings
if os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('RENDER'):
    DEBUG = False
    ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    # Static files
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Security
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    
    # CORS
    CORS_ALLOWED_ORIGINS = [
        "https://your-frontend-url.pages.dev",
        "https://your-custom-domain.com",
    ]
    
    CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
```

**9. Deploy**
- Railway otomatik olarak deploy edecek
- URL: `https://your-project.railway.app`

#### Render ile Deploy

**1. Render Hesabı**
- [Render.com](https://render.com/) üzerinden hesap oluşturun

**2. New Web Service**
- "New" → "Web Service"
- GitHub repository'nizi bağlayın

**3. Build Settings**
```
Build Command: cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput
Start Command: cd backend && gunicorn config.wsgi:application
```

**4. Environment Variables**
Railway ile aynı environment variables'ları ekleyin

**5. PostgreSQL Database**
- "New" → "PostgreSQL"
- Connection string'i environment variable olarak ekleyin

---

## 🔧 CORS ve Security Ayarları

### Backend CORS Ayarları

`backend/config/settings.py` dosyasında:

```python
# Production CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.pages.dev",
    "https://your-custom-domain.com",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
```

### Frontend API URL

`frontend/src/services/api.ts` dosyasında:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com/api';
```

---

## 📝 Deployment Checklist

### Frontend (Cloudflare Pages)
- [ ] Cloudflare hesabı oluşturuldu
- [ ] Git repository bağlandı
- [ ] Build ayarları yapılandırıldı
- [ ] Environment variables eklendi
- [ ] İlk deploy başarılı
- [ ] Custom domain eklendi (opsiyonel)
- [ ] SSL sertifikası aktif

### Backend (Railway/Render)
- [ ] Hosting servisi hesabı oluşturuldu
- [ ] PostgreSQL database oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] `gunicorn` requirements.txt'e eklendi
- [ ] Production settings yapılandırıldı
- [ ] CORS ayarları güncellendi
- [ ] Migration'lar çalıştırıldı
- [ ] Static files collect edildi
- [ ] Backend URL frontend'e eklendi

### Genel
- [ ] Frontend ve backend birbirine bağlandı
- [ ] API testleri yapıldı
- [ ] SSL sertifikaları kontrol edildi
- [ ] Error logging ayarlandı
- [ ] Monitoring kuruldu (opsiyonel)

---

## 🐛 Sorun Giderme

### Frontend Build Hatası

**Problem**: Build başarısız oluyor
**Çözüm**:
1. Node.js version'ı kontrol edin (18.x veya 20.x)
2. `package.json` dosyasındaki dependencies'i kontrol edin
3. Build log'larını inceleyin
4. Local'de `npm run build` komutunu test edin

### Backend Connection Hatası

**Problem**: Frontend backend'e bağlanamıyor
**Çözüm**:
1. Backend URL'in doğru olduğundan emin olun
2. CORS ayarlarını kontrol edin
3. Backend'in çalıştığını kontrol edin (`/api/health/` endpoint'i)
4. SSL sertifikalarını kontrol edin

### Database Connection Hatası

**Problem**: Backend database'e bağlanamıyor
**Çözüm**:
1. `DATABASE_URL` environment variable'ını kontrol edin
2. Database'in çalıştığını kontrol edin
3. Connection string formatını kontrol edin
4. Firewall ayarlarını kontrol edin

### Static Files Hatası

**Problem**: CSS/JS dosyaları yüklenmiyor
**Çözüm**:
1. `python manage.py collectstatic` komutunu çalıştırın
2. `STATIC_ROOT` ayarını kontrol edin
3. WhiteNoise middleware'inin eklendiğinden emin olun

---

## 🔐 Security Best Practices

### Production Checklist

1. **Secret Key**: Güçlü bir `SECRET_KEY` oluşturun
   ```python
   import secrets
   secrets.token_urlsafe(50)
   ```

2. **DEBUG**: Production'da `DEBUG=False` olmalı

3. **ALLOWED_HOSTS**: Sadece gerekli domain'leri ekleyin

4. **HTTPS**: Tüm trafik HTTPS üzerinden olmalı

5. **Environment Variables**: Hassas bilgileri environment variables'da saklayın

6. **Database**: Güçlü database şifreleri kullanın

7. **CORS**: Sadece gerekli origin'leri ekleyin

---

## 📊 Monitoring ve Logging

### Cloudflare Analytics

Cloudflare Pages dashboard'unda:
- Page views
- Bandwidth kullanımı
- Build history
- Error logs

### Backend Logging

Railway/Render dashboard'unda:
- Application logs
- Error tracking
- Performance metrics

### Önerilen Tools

- **Sentry**: Error tracking
- **Datadog**: Application monitoring
- **Logtail**: Log aggregation

---

## 💰 Maliyet Tahmini

### Cloudflare Pages
- **Ücretsiz**: 500 build/month, unlimited bandwidth
- **Pro ($20/month)**: 5,000 build/month, priority support

### Railway
- **Hobby ($5/month)**: $5 credit, pay-as-you-go
- **Pro ($20/month)**: $20 credit, better support

### Render
- **Free Tier**: Limited resources
- **Starter ($7/month)**: Basic web service
- **Standard ($25/month)**: Production-ready

---

## 🎯 Sonuç

Cloudflare Pages frontend için mükemmel bir seçimdir. Backend için Django'yu çalıştırabileceğiniz bir hosting servisi (Railway, Render, Fly.io) kullanmanız gerekmektedir.

**Önerilen Stack:**
- Frontend: Cloudflare Pages (Ücretsiz)
- Backend: Railway (Başlangıç için $5/month)
- Database: Railway PostgreSQL (Dahil)

Toplam maliyet: **~$5-10/month** (küçük ölçekli uygulamalar için)

---

## 📚 Ek Kaynaklar

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)

---

## 🤝 Yardım

Sorun yaşarsanız:
1. Build log'larını kontrol edin
2. Environment variables'ları doğrulayın
3. Local'de test edin
4. Documentation'ları inceleyin

