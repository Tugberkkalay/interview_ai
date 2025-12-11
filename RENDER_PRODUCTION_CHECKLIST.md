# Render Production Checklist - Interview Endpoint

## ✅ Yapılan Düzeltmeler

1. **localhost:9000 Test Endpoint Kontrolü**: 
   - Artık sadece development ortamında çalışıyor
   - Production'da (Render'da) gerçek ATS endpoint'leri kullanılacak
   - ✅ Düzeltildi: `is_development` kontrolü eklendi

2. **Environment Variables**:
   - ✅ `FRONTEND_URL`: render.yaml'da ayarlanmış
   - ✅ `VITE_API_URL`: Frontend build'de kullanılacak
   - ✅ `CORS_ALLOWED_ORIGINS`: Frontend URL'i içermeli
   - ⚠️ `VITE_GEMINI_API_KEY`: Render Dashboard'da manuel eklenmeli

## 🔍 Render'da Çalışması İçin Kontrol Listesi

### 1. Environment Variables (Render Dashboard)

Backend Service için:
- [x] `GEMINI_API_KEY` - Gemini API key (Google AI Studio'dan)
- [x] `SECRET_KEY` - Django secret key (otomatik generate edilir)
- [x] `DATABASE_URL` - PostgreSQL connection string (otomatik)
- [x] `ALLOWED_HOSTS` - Backend URL (render.yaml'da var)
- [x] `CORS_ALLOWED_ORIGINS` - Frontend URL (render.yaml'da var)
- [x] `FRONTEND_URL` - Frontend URL (render.yaml'da var)

Frontend Service için:
- [x] `VITE_API_URL` - Backend API URL (render.yaml'da var)
- [ ] `VITE_GEMINI_API_KEY` - **MANUEL EKLENMELİ** (Backend'deki GEMINI_API_KEY ile aynı)

### 2. URL'leri Güncelleme

`render.yaml` dosyasındaki URL'leri gerçek Render URL'lerinizle değiştirin:

```yaml
# Backend URL'leri
ALLOWED_HOSTS: interview-backend-XXXXX.onrender.com  # Gerçek backend URL
CORS_ALLOWED_ORIGINS: https://interview-frontend-XXXXX.onrender.com  # Gerçek frontend URL
FRONTEND_URL: https://interview-frontend-XXXXX.onrender.com

# Frontend URL'leri
VITE_API_URL: https://interview-backend-XXXXX.onrender.com/api  # Gerçek backend URL
```

### 3. ATS Endpoint'leri

**ÖNEMLİ**: Production'da gerçek ATS endpoint'leri kullanılmalı!

Session oluştururken:
```bash
curl -X POST https://your-backend.onrender.com/api/session/create/ \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "external_session_id": "ATS-123",
    "ats_data_endpoint": "https://real-ats-system.com/api/interview/123",  # GERÇEK ATS ENDPOINT
    "ats_webhook_url": "https://real-ats-system.com/webhook/report",  # GERÇEK WEBHOOK URL
    "ats_api_token": "real-ats-token",
    "expires_in_hours": 24
  }'
```

**NOT**: `localhost:9000` test endpoint'i sadece local development'ta çalışır. Production'da gerçek ATS endpoint'leri kullanılmalı.

### 4. Frontend Build

Frontend build sırasında `VITE_API_URL` environment variable'ı kullanılır:
- Build time'da environment variable'lar inject edilir
- `import.meta.env.VITE_API_URL` ile erişilir
- ✅ render.yaml'da ayarlanmış

### 5. CORS Ayarları

Backend'de CORS ayarları:
- `CORS_ALLOWED_ORIGINS`: Frontend URL'leri içermeli
- `CORS_ALLOW_CREDENTIALS`: True olmalı (session cookies için)
- ✅ render.yaml'da ayarlanmış

### 6. Database Migrations

Build command'da otomatik çalışıyor:
```bash
uv run python manage.py migrate --noinput
```

### 7. Static Files

WhiteNoise middleware ile serve ediliyor:
- ✅ `collectstatic` build command'da çalışıyor
- ✅ `IS_RENDER` kontrolü ile WhiteNoise aktif

## 🚨 Potansiyel Sorunlar ve Çözümleri

### Sorun 1: ATS Endpoint'e Bağlanamıyor

**Neden**: Production'da `localhost:9000` test endpoint'i çalışmaz.

**Çözüm**: 
- Gerçek ATS endpoint URL'lerini kullanın
- ATS sisteminizin public endpoint'leri olmalı
- HTTPS kullanın

### Sorun 2: CORS Hatası

**Neden**: Frontend URL'i CORS_ALLOWED_ORIGINS'de yok.

**Çözüm**:
- `render.yaml`'daki `CORS_ALLOWED_ORIGINS` değerini güncelleyin
- Render Dashboard → Environment → `CORS_ALLOWED_ORIGINS` değerini kontrol edin

### Sorun 3: System Prompt Alınamıyor

**Neden**: `/api/interview/prompt/` endpoint'i POST metodunu desteklemiyor olabilir.

**Çözüm**: 
- ✅ Düzeltildi: Endpoint artık POST metodunu destekliyor
- Backend log'larını kontrol edin

### Sorun 4: Frontend API'ye Bağlanamıyor

**Neden**: `VITE_API_URL` yanlış veya build'de inject edilmemiş.

**Çözüm**:
- `render.yaml`'daki `VITE_API_URL` değerini kontrol edin
- Frontend build log'larını kontrol edin
- Browser console'da `import.meta.env.VITE_API_URL` değerini kontrol edin

### Sorun 5: Gemini API Key Hatası

**Neden**: `VITE_GEMINI_API_KEY` frontend'de eksik.

**Çözüm**:
- Render Dashboard → Frontend Service → Environment → `VITE_GEMINI_API_KEY` ekleyin
- Backend'deki `GEMINI_API_KEY` ile aynı değeri kullanın

## ✅ Test Checklist

Deploy sonrası test edin:

1. [ ] Backend health check: `https://your-backend.onrender.com/api/health/`
2. [ ] Frontend yükleniyor: `https://your-frontend.onrender.com`
3. [ ] API bağlantısı: Browser console'da API istekleri başarılı
4. [ ] Session oluşturma: API key ile yeni session oluşturulabiliyor
5. [ ] Interview sayfası: Interview link'i açılabiliyor
6. [ ] System prompt: Backend'den system prompt alınabiliyor
7. [ ] ATS endpoint: Gerçek ATS endpoint'ine bağlanılabiliyor (test endpoint değil!)

## 📝 Önemli Notlar

1. **Test Endpoint**: `localhost:9000` sadece local development'ta çalışır. Production'da gerçek ATS endpoint'leri kullanılmalı.

2. **Environment Variables**: `VITE_GEMINI_API_KEY` Render Dashboard'da manuel olarak eklenmeli.

3. **URL Güncelleme**: `render.yaml` dosyasındaki URL'leri gerçek Render URL'lerinizle değiştirin.

4. **HTTPS**: Production'da tüm endpoint'ler HTTPS kullanmalı.

5. **CORS**: Frontend URL'i mutlaka `CORS_ALLOWED_ORIGINS`'de olmalı.

## 🎯 Sonuç

Render'da interview endpoint'i çalışacak, ancak:

1. ✅ Environment variables doğru ayarlanmalı
2. ✅ URL'ler güncellenmeli
3. ✅ Gerçek ATS endpoint'leri kullanılmalı (localhost:9000 değil!)
4. ✅ `VITE_GEMINI_API_KEY` manuel eklenmeli

Bu adımları takip ederseniz, Render'da interview endpoint'i sorunsuz çalışacaktır.

