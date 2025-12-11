# Cloudflare Pages Sorun Giderme - plena-interview.pages.dev

## 🔍 Tespit Edilen Sorunlar

### 1. Build Output Directory Hatası ⚠️

**Sorun**: Cloudflare Pages'de "Build output directory" `/dist` olarak ayarlanmış.

**Çözüm**: `/dist` yerine `dist` olmalı (başında `/` olmamalı)

Cloudflare Dashboard → Settings → Builds & deployments:
- ❌ Build output directory: `/dist`
- ✅ Build output directory: `dist`

### 2. _redirects Dosyası Kontrolü

`_redirects` dosyası `frontend/public/` klasöründe olmalı ve build sırasında `dist/` klasörüne kopyalanmalı.

**Kontrol:**
1. Local'de build yapın: `cd frontend && npm run build`
2. `dist/` klasöründe `_redirects` dosyası var mı kontrol edin
3. Varsa, Cloudflare Pages'e push edin

### 3. Environment Variables

Görüntüden görünen:
- ✅ `VITE_API_URL` var: `https://interview-backend-zb9b.onrender.com/api`
- ❌ `VITE_GEMINI_API_KEY` görünmüyor (eklenmeli)

**Eklenmesi Gereken:**
```
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. CORS Sorunu Olabilir

Backend'de CORS ayarlarını kontrol edin:
- `CORS_ALLOWED_ORIGINS` içinde `https://plena-interview.pages.dev` olmalı

---

## ✅ Adım Adım Çözüm

### Adım 1: Build Output Directory Düzelt

Cloudflare Dashboard → Pages → Settings → Builds & deployments:
```
Build output directory: dist  (başında / olmadan)
```

### Adım 2: Environment Variables Ekle

Cloudflare Dashboard → Pages → Settings → Environment variables:
```
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Adım 3: Backend CORS Güncelle

Backend'de (Render) `CORS_ALLOWED_ORIGINS` environment variable'ına ekleyin:
```
https://plena-interview.pages.dev
```

### Adım 4: _redirects Dosyasını Kontrol Et

Local'de test edin:
```bash
cd frontend
npm run build
ls dist/_redirects  # Bu dosya olmalı
```

Eğer yoksa, `frontend/public/_redirects` dosyasını kontrol edin.

### Adım 5: Yeniden Deploy

1. Cloudflare Dashboard → Pages → Deployments
2. "Retry deployment" veya yeni bir commit push edin

---

## 🐛 Yaygın Hatalar ve Çözümleri

### Hata 1: "404 Not Found" - Route'lar çalışmıyor

**Neden**: `_redirects` dosyası build'e dahil olmamış veya yanlış konumda.

**Çözüm**:
1. `frontend/public/_redirects` dosyasının var olduğundan emin olun
2. Local build yapıp `dist/_redirects` dosyasının oluştuğunu kontrol edin
3. GitHub'a push edin ve yeniden deploy edin

### Hata 2: "API Error" - Backend'e bağlanamıyor

**Neden**: CORS hatası veya yanlış API URL.

**Çözüm**:
1. Browser console'da hata mesajını kontrol edin
2. Backend'de `CORS_ALLOWED_ORIGINS` içinde frontend URL'i olduğundan emin olun
3. `VITE_API_URL` environment variable'ının doğru olduğunu kontrol edin

### Hata 3: "Blank Page" - Sayfa yüklenmiyor

**Neden**: Build hatası veya JavaScript hatası.

**Çözüm**:
1. Cloudflare Dashboard → Pages → Deployments → Build logs'u kontrol edin
2. Browser console'da JavaScript hatalarını kontrol edin
3. Network tab'da asset'lerin yüklendiğini kontrol edin

### Hata 4: "System prompt fetch error"

**Neden**: `VITE_GEMINI_API_KEY` eksik veya backend endpoint'i çalışmıyor.

**Çözüm**:
1. `VITE_GEMINI_API_KEY` environment variable'ını ekleyin
2. Backend'in çalıştığını kontrol edin: `https://interview-backend-zb9b.onrender.com/api/health/`

---

## 🔍 Debug Checklist

- [ ] Build output directory: `dist` (başında / yok)
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] `_redirects` dosyası `frontend/public/` klasöründe
- [ ] `VITE_API_URL` environment variable var
- [ ] `VITE_GEMINI_API_KEY` environment variable var
- [ ] Backend CORS ayarlarında frontend URL var
- [ ] Build log'larında hata yok
- [ ] Browser console'da hata yok

---

## 📞 Hızlı Test

1. **Backend Health Check:**
   ```
   curl https://interview-backend-zb9b.onrender.com/api/health/
   ```

2. **Frontend URL Test:**
   ```
   https://plena-interview.pages.dev/
   ```

3. **Browser Console:**
   - F12 → Console
   - Hataları kontrol edin
   - Network tab'da API isteklerini kontrol edin

---

## 🎯 En Olası Sorun

**Build output directory** `/dist` yerine `dist` olmalı. Bu en yaygın sorundur!

Cloudflare Dashboard'da düzeltin ve yeniden deploy edin.

