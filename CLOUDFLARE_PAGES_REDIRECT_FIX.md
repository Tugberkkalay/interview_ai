# Cloudflare Pages Redirect Sorunu - Çözüm

## ❌ Sorun

Cloudflare Pages dashboard'unda manuel redirect kuralı var:
```
/* → /index.html (200)
```

Bu kural `_middleware.js` ile çakışıyor ve "infinite loop" hatası veriyor.

## ✅ Çözüm

### Adım 1: Cloudflare Dashboard'dan Redirect Kuralını Kaldırın

1. Cloudflare Dashboard → Pages → Projeniz
2. **"Redirects"** sekmesine gidin
3. `/* → /index.html (200)` kuralını **SİLİN**
4. "Save" butonuna tıklayın

### Adım 2: _middleware.js Dosyasını Kontrol Edin

`frontend/functions/_middleware.js` dosyası şu şekilde olmalı:

```javascript
export function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // If it's a file request (has extension), serve it normally
  if (url.pathname.match(/\.[\w]+$/)) {
    return next();
  }
  
  // For all other routes, serve index.html (SPA routing)
  return next(new Request(new URL('/index.html', request.url), request));
}
```

### Adım 3: Deploy

1. Değişiklikleri commit edin ve push edin
2. Cloudflare Pages otomatik deploy edecek
3. Deploy tamamlandıktan sonra test edin

## 🔍 Neden Bu Sorun Oluşuyor?

1. **Manuel Redirect Kuralı**: Cloudflare Dashboard'dan eklenen redirect kuralı
2. **`_redirects` Dosyası**: Eğer hala varsa, build'e dahil oluyor
3. **`_middleware.js`**: Functions ile SPA routing yapıyor

**Çakışma**: Hem manuel redirect hem de `_middleware.js` çalışmaya çalışıyor → Infinite loop!

## ✅ Doğru Yapılandırma

**SADECE** `functions/_middleware.js` kullanın:
- ✅ `functions/_middleware.js` → SPA routing için
- ❌ Dashboard'dan manuel redirect → KALDIRIN
- ❌ `_redirects` dosyası → KALDIRIN (zaten sildik)

## 🎯 Kontrol Listesi

- [ ] Cloudflare Dashboard'dan redirect kuralı silindi
- [ ] `frontend/functions/_middleware.js` dosyası var
- [ ] `frontend/public/_redirects` dosyası yok (silindi)
- [ ] Değişiklikler commit edildi ve push edildi
- [ ] Deploy tamamlandı
- [ ] Site test edildi

## 🐛 Hala Çalışmıyorsa

1. **Browser Cache Temizleyin**: Ctrl+Shift+R (Windows) veya Cmd+Shift+R (Mac)
2. **Build Log'larını Kontrol Edin**: Cloudflare Dashboard → Deployments → Build logs
3. **Browser Console'u Kontrol Edin**: F12 → Console → Hataları kontrol edin
4. **Network Tab'ı Kontrol Edin**: F12 → Network → Asset'lerin yüklendiğini kontrol edin

