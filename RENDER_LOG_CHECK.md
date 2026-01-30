# ======================================================
# RENDER BACKEND LOG KONTROLÜ
# ======================================================

Session Token: e99136f5-bc2a-4a8a-b0b1-91ba298610f9

## Render Dashboard'dan Log Kontrolü:

1. https://dashboard.render.com adresine git
2. 'interview-backend-zb9b' servisini seç
3. Sol menüden 'Logs' sekmesine tıkla
4. Sayfada Ctrl+F yapıp şunu ara: "e99136f5"

## Loglarda Aranacak Kelimeler:

### Başarılı İstek:
✓ "Fetching ATS data for session e99136f5"
✓ "Successfully fetched ATS data for session e99136f5"

### Hata Mesajları:
✗ "has no ATS endpoint or API token configured"
✗ "has localhost endpoint"
✗ "ATS fetch failed for session e99136f5"
✗ "Connection" / "ConnectionError"
✗ "Timeout" / "timeout"
✗ "401" / "Unauthorized"
✗ "404" / "Not Found"

## Örnek Log Çıktıları:

### Eğer Token Geçersizse:
```
ERROR: ATS fetch failed for session e99136f5: ATS returned status 401: Unauthorized
```

### Eğer Endpoint Erişilemiyorsa:
```
ERROR: ATS connection error for https://api.qtale.io/...: Connection refused
```

### Eğer Timeout Varsa:
```
ERROR: ATS request timeout for https://api.qtale.io/...
```

### Eğer Data Bulunamazsa:
```
ERROR: ATS returned status 404: Interview not found
```

## Hangi Hatayı Görüyorsun?
Loglarda gördüğün hata mesajını buraya yapıştır, tam çözümü bulalım!

======================================================


