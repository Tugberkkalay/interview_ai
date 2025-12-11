# Cloudflare Pages ERR_CONNECTION_TIMED_OUT - Çözüm

## ❌ Sorun

Site yüklenmiyor, "ERR_CONNECTION_TIMED_OUT" hatası alınıyor.

**Neden:**
- `_middleware.js` dosyasında infinite loop veya hata
- Middleware request'i hiç döndürmüyor
- Yanlış rewrite/redirect mantığı

## ✅ Çözüm

### Adım 1: `_middleware.js` Dosyasını Düzelt

Dosya güncellendi. Yeni versiyon:
- Root path (`/`) için normal serve
- `index.html` için normal serve  
- Diğer route'lar için rewrite (redirect değil)

### Adım 2: Geçici Çözüm - Middleware'i Devre Dışı Bırak

Eğer hala çalışmıyorsa, middleware'i geçici olarak devre dışı bırakın:

**Seçenek 1: Dosyayı silin (geçici)**
```bash
git rm frontend/functions/_middleware.js
git commit -m "Temporarily disable middleware"
git push
```

**Seçenek 2: Basit middleware**
`frontend/functions/_middleware.js` dosyasını şu şekilde değiştirin:

```javascript
export async function onRequest(context) {
  return context.next();
}
```

Bu, middleware'i devre dışı bırakır ve tüm request'leri olduğu gibi geçirir.

### Adım 3: Cloudflare Dashboard'dan Redirect Kullan

Middleware çalışmıyorsa, Cloudflare Dashboard'dan redirect ekleyin:

1. Cloudflare Dashboard → Pages → Projeniz
2. Settings → Redirects
3. Yeni redirect ekleyin:
   - Source: `/*`
   - Destination: `/index.html`
   - Status: `200` (Rewrite, not redirect)

### Adım 4: Build Output Directory Kontrol

Build output directory'nin `dist` olduğundan emin olun (başında `/` olmadan).

## 🔍 Debug

### 1. Functions Log'larını Kontrol

Cloudflare Dashboard → Pages → Projeniz → Functions → Logs

Hata mesajlarını kontrol edin.

### 2. Browser Console

F12 → Console → Hataları kontrol edin

### 3. Network Tab

F12 → Network → Request'lerin durumunu kontrol edin

## 🎯 En Hızlı Çözüm

**Middleware'i geçici olarak devre dışı bırakın:**

```bash
# Dosyayı sil
git rm frontend/functions/_middleware.js
git commit -m "Disable middleware temporarily"
git push
```

Deploy sonrası site açılmalı. Sonra middleware'i düzeltip tekrar ekleyebilirsiniz.

## 📝 Alternatif: `_redirects` Dosyası Kullan

Eğer middleware çalışmıyorsa, `_redirects` dosyası kullanın:

`frontend/public/_redirects` dosyası oluşturun:
```
/*    /index.html   200
```

**Not:** Cloudflare Pages `_redirects` dosyasını destekler ama infinite loop uyarısı verebilir. Yine de çalışır.

