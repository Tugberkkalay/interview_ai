# Render Deployment Guide

Bu dokümantasyon, AI Interview Platform'unu Render.com'a deploy etmek için adım adım rehberdir.

> **Not**: Bu proje `uv` package manager kullanmaktadır. Build komutları `uv` ile çalışacak şekilde yapılandırılmıştır.

## 📋 Ön Hazırlık

### Gereksinimler

- [ ] Render.com hesabı ([Kayıt ol](https://render.com/))
- [ ] GitHub repository (kodunuz GitHub'da olmalı)
- [ ] Gemini API Key (Google AI Studio'dan alın)

---

## 🚀 Adım Adım Deployment

### 1. Render Hesabı ve Repository Bağlama

1. [Render Dashboard](https://dashboard.render.com/) üzerinden giriş yapın
2. "New +" butonuna tıklayın
3. "Blueprint" seçeneğini seçin (veya manuel olarak "Web Service" + "PostgreSQL" oluşturun)
4. GitHub repository'nizi bağlayın
5. `render.yaml` dosyasını seçin (root dizinde)

**Alternatif: Manuel Oluşturma**

Eğer `render.yaml` kullanmak istemiyorsanız, aşağıdaki adımları takip edin.

---

### 2. PostgreSQL Database Oluşturma

1. Render Dashboard'da "New +" → "PostgreSQL"
2. Database ayarları:
   - **Name**: `interview-db`
   - **Database**: `interview_db`
   - **User**: `interview_user`
   - **Region**: Frankfurt (veya size yakın bir region)
   - **Plan**: Starter (veya Free tier - sınırlı)
3. "Create Database" butonuna tıklayın
4. Database oluşturulduktan sonra **"Connection String"** değerini kopyalayın (örnek: `postgresql://user:pass@host:5432/dbname`)

---

### 3. Web Service Oluşturma

1. Render Dashboard'da "New +" → "Web Service"
2. GitHub repository'nizi seçin
3. Service ayarları:

#### Basic Settings
- **Name**: `interview-backend`
- **Region**: Frankfurt (database ile aynı region)
- **Branch**: `main` (veya `master`)
- **Root Directory**: `backend` (önemli!)

#### Build & Deploy
- **Environment**: `Python 3`
- **Build Command**: 
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh && export PATH="$HOME/.cargo/bin:$PATH" && cd backend && uv sync && uv run python manage.py collectstatic --noinput
  ```
- **Start Command**: 
  ```bash
  export PATH="$HOME/.cargo/bin:$PATH" && cd backend && uv run gunicorn config.wsgi:application
  ```

#### Environment Variables

Aşağıdaki environment variables'ları ekleyin:

```bash
# Django Settings
PYTHON_VERSION=3.11.0
DEBUG=False
SECRET_KEY=<güçlü-bir-secret-key-oluşturun>
ALLOWED_HOSTS=interview-backend.onrender.com,<custom-domain-if-any>

# Database (PostgreSQL connection string)
DATABASE_URL=<database-connection-string>

# API Keys
GEMINI_API_KEY=<your-gemini-api-key>

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend.pages.dev,https://your-custom-domain.com

# Security
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
```

**Önemli Notlar:**
- `SECRET_KEY` için güçlü bir değer oluşturun:
  ```python
  import secrets
  secrets.token_urlsafe(50)
  ```
- `DATABASE_URL` otomatik olarak database service'inden alınabilir (Render'da "Link Resource" özelliği)
- `ALLOWED_HOSTS` ve `CORS_ALLOWED_ORIGINS` değerlerini frontend URL'inize göre güncelleyin

#### Advanced Settings (Opsiyonel)
- **Auto-Deploy**: `Yes` (her push'ta otomatik deploy)
- **Health Check Path**: `/api/health/` (eğer health check endpoint'iniz varsa)

4. "Create Web Service" butonuna tıklayın

---

### 4. Frontend Static Site Routing Yapılandırması (ÖNEMLİ!)

Render static site'lar için SPA (Single Page Application) routing'i çalıştırmak için **manuel yapılandırma** gereklidir:

1. Render Dashboard'da `interview-frontend` static site'ınızı açın
2. **"Settings"** sekmesine gidin
3. **"Redirects/Rewrites"** bölümünü bulun (veya "Custom Headers" altında olabilir)
4. Yeni bir **Rewrite** kuralı ekleyin:
   - **Source (Kaynak):** `/*`
   - **Destination (Hedef):** `/index.html`
   - **Action (Eylem):** `Rewrite` (Redirect değil!)
   - **Status Code:** `200`

Bu ayar, tüm route'ları `index.html`'e yönlendirerek React Router'ın client-side routing'ini çalıştırır.

**Alternatif:** Eğer Render Dashboard'da "Redirects/Rewrites" seçeneği yoksa:
- Render Support ile iletişime geçin veya
- Backend'den frontend'e proxy yapılandırması yapın (daha karmaşık)

**Not:** Bu yapılandırma olmadan direkt URL'lere erişim veya sayfa yenileme "Not Found" hatası verecektir.

---

### 5. Database Migration

Web service deploy olduktan sonra:

1. Render Dashboard'da service'inize gidin
2. "Shell" sekmesine tıklayın
3. Aşağıdaki komutları çalıştırın:

```bash
cd backend
export PATH="$HOME/.cargo/bin:$PATH"
uv run python manage.py migrate
uv run python manage.py createsuperuser  # Admin kullanıcısı oluşturmak için
```

**Alternatif: Render Shell üzerinden**

Render Dashboard → Service → "Shell" → Terminal açılır:

```bash
export PATH="$HOME/.cargo/bin:$PATH"
cd backend
uv run python manage.py migrate
uv run python manage.py createsuperuser
```

---

### 5. İlk Deploy ve Test

1. Deploy tamamlandığında, service URL'inizi alacaksınız: `https://interview-backend.onrender.com`
2. Health check endpoint'ini test edin:
   ```bash
   curl https://interview-backend.onrender.com/api/health/
   ```
3. Admin panel'e gidin: `https://interview-backend.onrender.com/admin/`
4. API documentation: `https://interview-backend.onrender.com/api/docs/`

---

## 🔧 render.yaml Kullanımı (Önerilen)

Eğer `render.yaml` dosyasını kullanıyorsanız:

1. Repository'nizi Render'a bağlayın
2. "New +" → "Blueprint"
3. Repository'yi seçin ve `render.yaml` dosyasını seçin
4. Environment variables'ları düzenleyin (özellikle `CORS_ALLOWED_ORIGINS` ve `ALLOWED_HOSTS`)
5. "Apply" butonuna tıklayın

Render otomatik olarak:
- Web service'i oluşturacak
- PostgreSQL database'i oluşturacak
- İkisini birbirine bağlayacak

---

## 📝 Environment Variables Detayları

### Zorunlu Variables

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `SECRET_KEY` | Django secret key | `django-insecure-...` (production'da güçlü olmalı) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `ALLOWED_HOSTS` | İzin verilen host'lar | `interview-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Frontend URL'leri | `https://your-frontend.pages.dev` |

### Opsiyonel Variables

| Variable | Açıklama | Varsayılan |
|----------|----------|------------|
| `DEBUG` | Debug modu | `False` |
| `PYTHON_VERSION` | Python versiyonu | `3.11.0` |
| `SESSION_COOKIE_SECURE` | Secure cookies | `True` |
| `CSRF_COOKIE_SECURE` | Secure CSRF cookies | `True` |
| `SECURE_SSL_REDIRECT` | HTTPS redirect | `True` |

---

## 🔐 Security Checklist

- [ ] `DEBUG=False` production'da
- [ ] Güçlü `SECRET_KEY` kullanılıyor
- [ ] `ALLOWED_HOSTS` doğru ayarlanmış
- [ ] `CORS_ALLOWED_ORIGINS` sadece gerekli origin'leri içeriyor
- [ ] `SESSION_COOKIE_SECURE=True`
- [ ] `CSRF_COOKIE_SECURE=True`
- [ ] Database connection string güvenli
- [ ] API keys environment variables'da (kodda değil)

---

## 🐛 Sorun Giderme

### Build Hatası

**Problem**: Build başarısız oluyor
**Çözüm**:
1. Build log'larını kontrol edin (Render Dashboard → Service → Logs)
2. `pyproject.toml` dosyasını kontrol edin (uv package manager kullanıyoruz)
3. Python version'ı kontrol edin (`PYTHON_VERSION=3.11.0`)
4. Root directory'nin `backend` olduğundan emin olun
5. `uv` kurulumunun başarılı olduğundan emin olun (build log'larında kontrol edin)

### Database Connection Hatası

**Problem**: Database'e bağlanamıyor
**Çözüm**:
1. `DATABASE_URL` environment variable'ını kontrol edin
2. Database'in aynı region'da olduğundan emin olun
3. Database'in çalıştığını kontrol edin (Render Dashboard → Database → Status)
4. Connection string formatını kontrol edin

### Static Files Hatası

**Problem**: CSS/JS dosyaları yüklenmiyor
**Çözüm**:
1. `collectstatic` komutunun build'de çalıştığından emin olun
2. WhiteNoise middleware'inin `settings.py`'de olduğunu kontrol edin
3. `STATIC_ROOT` ayarını kontrol edin

### CORS Hatası

**Problem**: Frontend backend'e istek atamıyor
**Çözüm**:
1. `CORS_ALLOWED_ORIGINS` environment variable'ını kontrol edin
2. Frontend URL'inin doğru olduğundan emin olun (HTTPS ile başlamalı)
3. `CORS_ALLOW_CREDENTIALS=True` olduğunu kontrol edin

### 502 Bad Gateway

**Problem**: Service çalışmıyor
**Çözüm**:
1. Service log'larını kontrol edin
2. `gunicorn` komutunun doğru olduğundan emin olun
3. Port'un doğru olduğundan emin olun (Render otomatik ayarlar)
4. Health check endpoint'ini test edin

---

## 📊 Monitoring ve Logs

### Logs Görüntüleme

1. Render Dashboard → Service → "Logs" sekmesi
2. Real-time log'ları görebilirsiniz
3. Log'ları filtreleyebilirsiniz (Error, Warning, Info)

### Metrics

Render Dashboard'da şu metrikleri görebilirsiniz:
- CPU kullanımı
- Memory kullanımı
- Request sayısı
- Response time

---

## 🔄 Auto-Deploy Ayarları

### GitHub Integration

1. Repository'yi Render'a bağladığınızda otomatik olarak webhook kurulur
2. Her push'ta otomatik deploy başlar
3. "Auto-Deploy" ayarını açık tutun

### Manual Deploy

1. Render Dashboard → Service → "Manual Deploy"
2. Branch seçin
3. "Deploy latest commit" butonuna tıklayın

---

## 💰 Maliyet

### Free Tier (Sınırlı)

- **Web Service**: 750 saat/ay (yaklaşık 31 gün)
- **Database**: 90 gün sonra silinir
- **Sleep**: 15 dakika inactivity sonrası uyku modu

### Starter Plan ($7/month)

- **Web Service**: 7/24 çalışır
- **Database**: Kalıcı
- **512 MB RAM**
- **0.5 CPU**

### Standard Plan ($25/month)

- **Web Service**: 7/24 çalışır
- **Database**: Kalıcı
- **2 GB RAM**
- **1 CPU**

**Öneri**: Başlangıç için Free tier yeterli, production için Starter plan önerilir.

---

## 🎯 Production Checklist

- [ ] Database migration'ları çalıştırıldı
- [ ] Admin kullanıcısı oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] CORS ayarları yapıldı
- [ ] Security settings aktif
- [ ] Health check endpoint çalışıyor
- [ ] Static files yükleniyor
- [ ] Frontend backend'e bağlanabiliyor
- [ ] SSL sertifikası aktif
- [ ] Custom domain eklendi (opsiyonel)

---

## 📚 Ek Kaynaklar

- [Render Documentation](https://render.com/docs)
- [Django on Render](https://render.com/docs/deploy-django)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)

---

## 🤝 Yardım

Sorun yaşarsanız:

1. Render Dashboard → Service → Logs'u kontrol edin
2. Build log'larını inceleyin
3. Environment variables'ları doğrulayın
4. [Render Community](https://community.render.com/) forumunu ziyaret edin
5. [Render Support](https://render.com/docs/support) ile iletişime geçin

---

## 🔄 Güncelleme ve Maintenance

### Code Update

1. GitHub'a push yapın
2. Render otomatik olarak deploy edecek
3. Log'ları kontrol edin

### Database Backup

1. Render Dashboard → Database → "Backups"
2. Manuel backup oluşturabilirsiniz
3. Otomatik backup'lar plan'a göre yapılır

### Scaling

1. Render Dashboard → Service → "Settings"
2. "Scaling" sekmesine gidin
3. Instance sayısını artırabilirsiniz (Standard plan ve üzeri)

---

**Başarılar! 🚀**

