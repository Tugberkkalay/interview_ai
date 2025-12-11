# Cloudflare Pages Build Hatası - Çözüm

## ❌ Hata

```
npm error path /opt/buildhome/repo/package.json
npm error errno -2
npm error enoent Could not read package.json
```

**Neden**: Cloudflare Pages root directory'de `package.json` arıyor ama proje `frontend/` klasöründe.

## ✅ Çözüm

Cloudflare Pages dashboard'unda **Root directory** ayarını yapın:

### Adım 1: Cloudflare Dashboard'a Gidin

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
2. Projenizi seçin
3. **"Settings"** sekmesine gidin
4. **"Builds & deployments"** bölümünü bulun

### Adım 2: Root Directory Ayarlayın

**Root directory:** `frontend`

### Adım 3: Build Ayarlarını Kontrol Edin

**Build command:** `npm run build`

**Build output directory:** `dist`

**Node version:** `18` veya `20`

### Adım 4: Environment Variables

**Environment variables** bölümüne ekleyin:

```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Adım 5: Deploy

"Save" butonuna tıklayın ve yeniden deploy edin.

---

## 🔧 Alternatif: Otomatik Yapılandırma

Eğer dashboard'dan yapılandırmak istemiyorsanız, proje root'una bir yapılandırma dosyası ekleyebilirsiniz:

### Seçenek 1: `package.json` (Root)

Proje root'una (interview/) bir `package.json` ekleyin:

```json
{
  "name": "interview-platform",
  "scripts": {
    "build": "cd frontend && npm install && npm run build"
  }
}
```

**Ancak bu önerilmez** çünkü Cloudflare Pages root directory ayarını kullanmak daha temiz.

### Seçenek 2: Cloudflare Pages Yapılandırma Dosyası

Cloudflare Pages otomatik olarak `wrangler.json` veya `package.json` dosyalarını okur, ancak root directory ayarı için dashboard kullanılmalı.

---

## 📝 Doğru Yapılandırma Özeti

**Cloudflare Pages Dashboard → Settings → Builds & deployments:**

```
Root directory: frontend
Build command: npm run build
Build output directory: dist
Node version: 18
```

**Environment variables:**
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GEMINI_API_KEY=your-api-key
```

---

## ✅ Kontrol Listesi

- [ ] Root directory: `frontend` olarak ayarlandı
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`
- [ ] Node version: 18 veya 20
- [ ] Environment variables eklendi
- [ ] `_redirects` dosyası `frontend/public/` klasöründe var

Bu ayarları yaptıktan sonra build başarılı olacaktır!

