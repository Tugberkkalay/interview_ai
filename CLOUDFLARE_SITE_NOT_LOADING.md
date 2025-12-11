# Cloudflare Pages Site Açılmıyor - Sorun Giderme

## 🔍 Tespit Edilen Sorunlar

### 1. Build Output Directory ⚠️

Görüntüden görünen:
- Build output directory: `/dist` (başında `/` var)
- **Sorun**: Cloudflare Pages'de başında `/` olmamalı

**Çözüm:**
Cloudflare Dashboard → Settings → Builds & deployments:
- ❌ Build output directory: `/dist`
- ✅ Build output directory: `dist` (başında `/` olmadan)

### 2. `_middleware.js` Dosyası

Functions yüklendi ama çalışmıyor olabilir. Dosya güncellendi.

### 3. Browser Cache

Eski cache'den dolayı site açılmıyor olabilir.

## ✅ Adım Adım Çözüm

### Adım 1: Build Output Directory Düzelt

1. Cloudflare Dashboard → Pages → Projeniz
2. Settings → Builds & deployments
3. Build output directory: `dist` (başında `/` olmadan)
4. Save

### Adım 2: `_middleware.js` Güncelle

Dosya güncellendi. Commit edin:
```bash
git add frontend/functions/_middleware.js
git commit -m "Fix Cloudflare Pages middleware for SPA routing"
git push
```

### Adım 3: Cache Temizle

1. **Browser Cache:**
   - Chrome/Edge: Ctrl+Shift+Delete (Windows) veya Cmd+Shift+Delete (Mac)
   - Hard refresh: Ctrl+Shift+R (Windows) veya Cmd+Shift+R (Mac)

2. **Cloudflare Cache:**
   - Cloudflare Dashboard → Caching → Purge Everything
   - Veya Pages → Projeniz → Settings → Clear build cache

### Adım 4: Browser Console Kontrol

1. Siteyi açın: `https://plena-interview.pages.dev`
2. F12 → Console
3. Hataları kontrol edin:
   - JavaScript hataları var mı?
   - 404 hatası var mı?
   - CORS hatası var mı?

### Adım 5: Network Tab Kontrol

1. F12 → Network
2. Sayfayı yenileyin
3. Kontrol edin:
   - `index.html` yüklendi mi? (200 OK olmalı)
   - `index-*.js` yüklendi mi? (200 OK olmalı)
   - `style.css` yüklendi mi? (200 OK olmalı)
   - 404 hatası var mı?

## 🐛 Yaygın Hatalar

### Hata 1: Blank Page (Boş Sayfa)

**Neden:**
- JavaScript hatası
- Asset'ler yüklenmiyor
- `_middleware.js` çalışmıyor

**Çözüm:**
1. Browser console'u kontrol edin
2. Network tab'da asset'lerin yüklendiğini kontrol edin
3. Build output directory'yi `dist` olarak düzeltin

### Hata 2: 404 Not Found

**Neden:**
- `_middleware.js` çalışmıyor
- Route'lar index.html'e yönlendirilmiyor

**Çözüm:**
1. `_middleware.js` dosyasının deploy edildiğini kontrol edin
2. Functions sekmesinde göründüğünü kontrol edin
3. Build output directory'yi düzeltin

### Hata 3: CORS Error

**Neden:**
- Backend CORS ayarlarında frontend URL'i yok

**Çözüm:**
Backend'de (Render) `CORS_ALLOWED_ORIGINS` environment variable'ına ekleyin:
```
https://plena-interview.pages.dev
```

## 🎯 Hızlı Test

1. **Direct URL Test:**
   ```
   https://plena-interview.pages.dev/
   https://plena-interview.pages.dev/interview/test-123
   ```

2. **Browser Console:**
   - F12 → Console → Hataları kontrol edin

3. **Network Tab:**
   - F12 → Network → Asset'lerin yüklendiğini kontrol edin

## 📝 Kontrol Listesi

- [ ] Build output directory: `dist` (başında `/` yok)
- [ ] `_middleware.js` dosyası commit edildi ve push edildi
- [ ] Browser cache temizlendi
- [ ] Cloudflare cache temizlendi
- [ ] Browser console'da hata yok
- [ ] Network tab'da asset'ler yükleniyor
- [ ] Backend CORS ayarlarında frontend URL var

## 🔧 En Olası Sorun

**Build output directory `/dist` yerine `dist` olmalı!**

Bu en yaygın sorundur. Dashboard'dan düzeltin ve yeniden deploy edin.

