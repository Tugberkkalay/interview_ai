# _redirects Dosyası Açıklaması

## 🤔 Bu Dosya Neden Gerekli?

React Router gibi **client-side routing** kullandığınızda bir sorun oluşur:

### ❌ Sorun:

1. Kullanıcı `https://yoursite.com/interview/123` URL'ine direkt gider
2. Sunucu `/interview/123` adında bir dosya arar
3. Dosya bulunamaz → **404 Not Found** hatası!

### ✅ Çözüm:

`_redirects` dosyası Cloudflare Pages'e şunu söyler:
- "Tüm route'ları (`/*`) `index.html` dosyasına yönlendir"
- "200 (OK) status code döndür" (yani redirect değil, rewrite)

Bu sayede:
1. Kullanıcı `https://yoursite.com/interview/123` URL'ine gider
2. Sunucu `index.html` dosyasını döndürür
3. React Router devreye girer ve doğru sayfayı gösterir

## 📝 Dosya İçeriği

```
/*    /index.html   200
```

**Açıklama:**
- `/*` = Tüm route'lar (herhangi bir path)
- `/index.html` = Yönlendirilecek dosya
- `200` = HTTP status code (OK - başarılı)

## 🎯 Ne Zaman Gerekli?

- ✅ Cloudflare Pages kullanıyorsanız → **GEREKLİ**
- ✅ Netlify kullanıyorsanız → **GEREKLİ**
- ❌ Render Static Site → Manuel yapılandırma gerekli (farklı yöntem)
- ❌ Vercel → `vercel.json` dosyası gerekli (farklı yöntem)

## 🔍 Örnek Senaryolar

### Senaryo 1: Direkt URL Erişimi
```
Kullanıcı: https://yoursite.com/interview/123
Sunucu: _redirects dosyası sayesinde index.html döndürür
React Router: /interview/:token route'unu bulur ve IntegratedInterviewPage gösterir
✅ Çalışır!
```

### Senaryo 2: Sayfa Yenileme
```
Kullanıcı: https://yoursite.com/dashboard sayfasındayken F5'e basar
Sunucu: _redirects dosyası sayesinde index.html döndürür
React Router: /dashboard route'unu bulur ve DashboardPage gösterir
✅ Çalışır!
```

### Senaryo 3: Olmadan (Sorun)
```
Kullanıcı: https://yoursite.com/interview/123
Sunucu: /interview/123 dosyası yok
❌ 404 Not Found hatası!
```

## 📦 Build Sonrası

Bu dosya `frontend/public/` klasöründe olduğu için:
- Vite build sırasında `dist/` klasörüne kopyalanır
- Cloudflare Pages bu dosyayı otomatik olarak okur
- Tüm route'lar otomatik olarak `index.html`'e yönlendirilir

## ✅ Sonuç

Bu dosya olmadan:
- ❌ Direkt URL'lere erişim çalışmaz
- ❌ Sayfa yenileme çalışmaz
- ❌ Browser'ın back/forward butonları sorunlu olabilir

Bu dosya ile:
- ✅ Tüm route'lar çalışır
- ✅ Sayfa yenileme çalışır
- ✅ Browser navigation çalışır
- ✅ SEO-friendly URL'ler çalışır

