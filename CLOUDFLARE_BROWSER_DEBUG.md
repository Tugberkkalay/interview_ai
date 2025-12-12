# Cloudflare Pages Browser Debug

## ✅ Yapılandırma Doğru

Görüntüden:
- ✅ Build command: `npm run build`
- ✅ Build output directory: `dist` (başında `/` yok - doğru!)
- ✅ Root directory: `frontend`
- ✅ Deploy başarılı

**Ancak site açılmıyor. Sorun yapılandırmada değil, başka bir yerde.**

---

## 🔍 Browser Debug - Adım Adım

### 1. Siteyi Açın

```
https://plena-interview.pages.dev/
```

### 2. Ne Görünüyor?

**Seçenek A: Blank Page (Boş Sayfa)**
- Beyaz veya siyah boş sayfa
- Hiçbir şey görünmüyor

**Seçenek B: Loading Kalıyor**
- Sayfa yüklenmeye başlıyor ama bitmiyor
- Sonra timeout oluyor

**Seçenek C: Hata Mesajı**
- ERR_CONNECTION_TIMED_OUT
- 404 Not Found
- Başka bir hata

### 3. Browser Console Kontrol (F12 → Console)

**Hangi hatalar var?**

**Olası hatalar:**

**A. JavaScript hatası:**
```
Uncaught ReferenceError: process is not defined
```
→ Environment variables eksik

**B. 404 hatası:**
```
GET https://plena-interview.pages.dev/assets/index-*.js 404 (Not Found)
```
→ Asset'ler yanlış konumda

**C. CORS hatası:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
→ Backend CORS ayarları eksik

**D. Module hatası:**
```
Failed to load module script
```
→ Build problemi

### 4. Network Tab Kontrol (F12 → Network)

**Refresh yapın (Cmd+R) ve kontrol edin:**

**A. index.html:**
- Durum: 200 OK mi? 404 mu?
- Boyut: ~1.37 kB olmalı

**B. index-*.js:**
- Durum: 200 OK mi? 404 mu?
- Boyut: ~679 kB olmalı

**C. style.css:**
- Durum: 200 OK mi? 404 mu?
- Boyut: ~98 kB olmalı

---

## 📊 Olası Senaryolar ve Çözümler

### Senaryo 1: `process is not defined` Hatası

**Neden:** Vite config'de `process.env.API_KEY` kullanılıyor ama Cloudflare'de tanımlı değil.

**Çözüm:**
Environment variables ekleyin:
```
VITE_GEMINI_API_KEY=your-api-key
```

### Senaryo 2: Asset'ler 404

**Neden:** Build output directory yanlış veya asset'ler farklı konumda.

**Çözüm:**
1. Build output directory: `dist` (doğru - zaten öyle)
2. Cache temizleyin ve yeniden deploy edin

### Senaryo 3: Blank Page, Console'da Hata Yok

**Neden:** React app hata veriyor ama catch ediliyor.

**Çözüm:**
Local'de test edin:
```bash
cd frontend
npm run build
npm run preview
```

Browser'da `http://localhost:4173` açın. Çalışıyor mu?

---

## 🎯 Hemen Yapın

1. **Browser'ı açın:** `https://plena-interview.pages.dev/`

2. **F12 → Console:**
   - Hangi hatalar var?
   - Screenshot alıp gösterin

3. **F12 → Network:**
   - `index.html` durumu? (200 OK olmalı)
   - `index-*.js` durumu? (200 OK olmalı)
   - Screenshot alıp gösterin

4. **Cache temizleyin:**
   - Cmd+Shift+R (Mac) veya Ctrl+Shift+R (Windows)
   - Tekrar test edin

Bu bilgilerle sorunu kesin olarak çözebilirim!

