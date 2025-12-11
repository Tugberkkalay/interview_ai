# Cloudflare Pages ERR_CONNECTION_TIMED_OUT - Hızlı Çözüm

## ❌ Sorun

Site yüklenmiyor, "ERR_CONNECTION_TIMED_OUT" hatası alınıyor.

**Neden:** `_middleware.js` dosyasında infinite loop veya hata var.

## ✅ Hızlı Çözüm

### Adım 1: Middleware'i Devre Dışı Bırak

`_middleware.js` dosyası basit passthrough olarak güncellendi. Artık sadece request'leri geçiriyor.

### Adım 2: `_redirects` Dosyası Ekle

`frontend/public/_redirects` dosyası oluşturuldu. Bu, Cloudflare Pages'in native redirect sistemini kullanır.

### Adım 3: Commit ve Push

```bash
git add frontend/functions/_middleware.js frontend/public/_redirects
git commit -m "Fix: Disable middleware, use _redirects for SPA routing"
git push
```

### Adım 4: Deploy Sonrası

1. Cloudflare Pages otomatik deploy edecek
2. Site açılmalı
3. Eğer hala sorun varsa, `_middleware.js` dosyasını tamamen silin:

```bash
git rm frontend/functions/_middleware.js
git commit -m "Remove middleware completely"
git push
```

## 🎯 Neden Bu Çözüm?

1. **Middleware Infinite Loop:** `_middleware.js` dosyası request'leri doğru handle edemiyordu
2. **Timeout:** Request hiç döndürülmüyordu, timeout oluyordu
3. **`_redirects` Daha Güvenilir:** Cloudflare Pages'in native redirect sistemi daha stabil

## 📝 Sonraki Adımlar

Site çalıştıktan sonra:
1. `_redirects` dosyası çalışıyorsa, `_middleware.js` dosyasını silebilirsiniz
2. Veya `_middleware.js` dosyasını daha iyi bir versiyonla güncelleyebilirsiniz

## ✅ Kontrol

Deploy sonrası test edin:
- Ana sayfa: `https://plena-interview.pages.dev/`
- Interview: `https://plena-interview.pages.dev/interview/test-123`

Site açılmalı!

