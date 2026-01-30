# 📤 ATS Webhook Rapor Formatı

Mülakat tamamlandığında ATS sisteminize gönderilen rapor formatı.

## 🔗 Webhook Endpoint

**POST** `{ats_webhook_url}` (Session oluştururken belirttiğiniz URL)

**Headers:**
```
Authorization: Bearer {ats_api_token}
Content-Type: application/json
```

**Timeout:** 30 saniye

**Başarılı Response Kodları:** 200, 201, 204

---

## 📋 Payload Formatı

### Ana Yapı

```json
{
  "session_id": "ATS-12345",
  "interview_token": "550e8400-e29b-41d4-a716-446655440000",
  "completed_at": "2025-12-31T13:27:18.123456+00:00",
  "report": {
    // Rapor detayları aşağıda
  }
}
```

### Alan Açıklamaları

| Alan | Tip | Açıklama |
|------|-----|----------|
| `session_id` | string | Session oluştururken gönderdiğiniz `external_session_id` |
| `interview_token` | string (UUID) | Interview session'ın unique token'ı |
| `completed_at` | string (ISO 8601) | Mülakatın tamamlandığı tarih/saat |
| `report` | object | Detaylı mülakat raporu (aşağıda) |

---

## 📊 Report Object Detayları

### Tam Format Örneği

```json
{
  "session_id": "ATS-12345",
  "interview_token": "550e8400-e29b-41d4-a716-446655440000",
  "completed_at": "2025-12-31T13:27:18.123456+00:00",
  "report": {
    "candidateName": "Ahmet Yılmaz",
    "overallScore": 85,
    "duration": "00:15:30",
    "categoryScores": {
      "technical": 90,
      "communication": 85,
      "problemSolving": 88,
      "culturalFit": 82,
      "confidence": 80
    },
    "visualAnalysis": {
      "attire": "Profesyonel kıyafet tercih etmiş",
      "environment": "Temiz ve düzenli bir ortam",
      "bodyLanguage": "Rahat ve özgüvenli duruş",
      "eyeContact": "İyi göz teması kuruyor"
    },
    "behavioralAnalysis": {
      "reactionSpeed": "Hızlı ve net cevaplar veriyor",
      "stressManagement": "Stres altında sakin kalabiliyor",
      "toneOfVoice": "Net ve anlaşılır konuşma"
    },
    "keyStrengths": [
      "Güçlü teknik bilgi",
      "İyi iletişim becerileri",
      "Problem çözme yaklaşımı"
    ],
    "areasForImprovement": [
      "DevOps deneyimi sınırlı",
      "Sistem tasarımı konusunda gelişim gerekebilir"
    ],
    "summary": "Aday teknik konularda çok güçlü. React ve JavaScript konusunda derin bilgiye sahip. İletişim becerileri iyi seviyede. DevOps ve sistem tasarımı konularında deneyim eksikliği var ancak öğrenmeye açık bir profil.",
    "hiringRecommendation": "Hire",
    "transcript": [
      {
        "role": "model",
        "text": "Merhaba, görüşmemize hoş geldiniz..."
      },
      {
        "role": "user",
        "text": "Merhaba, teşekkür ederim..."
      }
    ]
  }
}
```

---

## 📝 Report Alanları Detayı

### `candidateName` (string)
Adayın adı

### `overallScore` (number, 0-100)
Genel değerlendirme skoru

### `duration` (string)
Mülakat süresi (format: "HH:MM:SS")

### `categoryScores` (object)
Kategori bazlı skorlar (0-100 arası):
- `technical`: Teknik beceriler
- `communication`: İletişim becerileri
- `problemSolving`: Problem çözme
- `culturalFit`: Kültürel uyum
- `confidence`: Özgüven

### `visualAnalysis` (object)
Görsel analiz sonuçları:
- `attire`: Kıyafet değerlendirmesi
- `environment`: Ortam değerlendirmesi
- `bodyLanguage`: Beden dili
- `eyeContact`: Göz teması

### `behavioralAnalysis` (object)
Davranışsal analiz:
- `reactionSpeed`: Tepki hızı
- `stressManagement`: Stres yönetimi
- `toneOfVoice`: Ses tonu

### `keyStrengths` (array of strings)
Adayın güçlü yönleri

### `areasForImprovement` (array of strings)
Geliştirilmesi gereken alanlar

### `summary` (string)
Genel özet metni

### `hiringRecommendation` (string)
İşe alma önerisi:
- `"Strong Hire"`: Kesinlikle işe alınmalı
- `"Hire"`: İşe alınmalı
- `"Maybe"`: Belki
- `"No Hire"`: İşe alınmamalı

### `transcript` (array, optional)
Mülakat transkripti. Her item:
```json
{
  "role": "model" | "user",
  "text": "Konuşma metni"
}
```

---

## ⚠️ Önemli Notlar

1. **Retry Mekanizması:**
   - Webhook gönderimi başarısız olursa, rapor geçici olarak saklanır
   - Sistem otomatik olarak 5 kez tekrar dener
   - Her retry arasında bekleme süresi vardır

2. **Timeout:**
   - Webhook isteği 30 saniye içinde cevap vermelidir
   - Timeout olursa retry mekanizması devreye girer

3. **Response Beklentisi:**
   - 200, 201 veya 204 status code'u başarılı kabul edilir
   - Diğer status code'lar başarısız sayılır ve retry tetiklenir

4. **Data Privacy:**
   - Rapor sadece webhook'a gönderilir
   - Backend'de kalıcı olarak saklanmaz (sadece retry için geçici saklanır)
   - 24 saat sonra geçici veriler otomatik temizlenir

---

## 🧪 Test Etme

### Mock Server ile Test

Projede `mock_ats_server.py` dosyası var. Bunu kullanarak test edebilirsiniz:

```bash
# Mock server'ı başlat
python backend/mock_ats_server.py

# Session oluştururken webhook URL'i mock server'a yönlendir
{
  "ats_webhook_url": "http://localhost:5000/webhook/report"
}
```

### cURL ile Test

```bash
curl -X POST https://your-ats.com/webhook/report \
  -H "Authorization: Bearer your_ats_token" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "ATS-12345",
    "interview_token": "550e8400-e29b-41d4-a716-446655440000",
    "completed_at": "2025-12-31T13:27:18.123456+00:00",
    "report": {
      "candidateName": "Test User",
      "overallScore": 85,
      "hiringRecommendation": "Hire"
    }
  }'
```

---

## 🔍 Hata Durumları

### Webhook Başarısız Olursa

Eğer webhook gönderimi başarısız olursa:

1. **Response döner:**
```json
{
  "success": true,
  "webhook_sent": false
}
```

2. **Rapor geçici olarak saklanır**
3. **Otomatik retry başlar** (max 5 deneme)
4. **Loglarda hata kaydedilir**

### Log Kontrolü

Backend loglarında şu mesajları görebilirsiniz:

```
INFO: Report sent successfully to {webhook_url}
ERROR: Webhook failed with status {status_code}: {error_message}
WARNING: Retry {count} failed for session {token}
```

---

## 📚 İlgili Dokümantasyon

- `PRODUCTION_API_EXAMPLES.md` - API kullanım örnekleri
- `README_SAAS.md` - Genel sistem dokümantasyonu

