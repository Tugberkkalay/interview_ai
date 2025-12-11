# Production API Örnekleri

Bu dosya production ortamında mülakat oluşturmak için kullanabileceğiniz API request örneklerini içerir.

## 🔑 API Key Alma

1. https://interview-frontend-zqga.onrender.com/dashboard/settings adresine gidin
2. Login yapın
3. "API Key" bölümünden API key'inizi kopyalayın
4. Format: `sk_live_...`

---

## 📝 Mülakat Oluşturma (Create Interview Session)

**Endpoint:** `POST https://interview-backend-zb9b.onrender.com/api/session/create/`

**Authentication:** Bearer Token (API Key)

**Request Body:**
```json
{
  "external_session_id": "ATS-12345",
  "ats_data_endpoint": "https://your-ats.com/api/interview-data/12345",
  "ats_webhook_url": "https://your-ats.com/api/webhook/receive-report",
  "ats_api_token": "your-ats-api-token",
  "expires_in_hours": 24
}
```

### 📌 Alan Açıklamaları

| Alan | Amaç | Format | Önem |
|------|------|--------|------|
| `external_session_id` | ATS sistemindeki session ID'si (referans için) | Herhangi bir string (max 200 karakter) | ⭐ Düşük - Sadece referans, format önemli değil |
| `ats_data_endpoint` | ATS'den mülakat verilerini çekmek için URL | Geçerli HTTPS URL | ⭐⭐⭐⭐⭐ Çok önemli - Mülakat başladığında bu URL'e istek atılır |
| `ats_webhook_url` | Mülakat raporunu göndermek için URL | Geçerli HTTPS URL | ⭐⭐⭐⭐⭐ Çok önemli - Rapor bu URL'e gönderilir |
| `ats_api_token` | ATS API authentication token | String | ⭐⭐⭐⭐⭐ Çok önemli - ATS endpoint'lerine erişim için |
| `expires_in_hours` | Mülakat linkinin geçerlilik süresi (saat) | Integer (varsayılan: 24) | ⭐⭐ Orta - Opsiyonel |

**Önemli Notlar:**

1. **`external_session_id`** (Bizde: `external_id`)
   - **Amaç:** ATS sisteminizdeki session ID'si (referans için)
   - **Format:** Herhangi bir string (max 200 karakter)
   - **Örnekler:** 
     - `"ATS-12345"`
     - `"SESSION-2025-001"`
     - `"12345"`
     - `"interview_abc123"`
   - **Önem:** ⭐ Düşük - Sadece referans ve webhook'a gönderme için kullanılır
   - **Kullanım:** Webhook'a gönderilirken `session_id` olarak kullanılır

2. **`ats_data_endpoint`** (Bizde: `ats_data_endpoint`)
   - **Amaç:** ATS'den mülakat verilerini çekmek için URL
   - **Format:** Geçerli HTTPS URL (mutlaka HTTPS olmalı)
   - **Örnekler:**
     - `"https://your-ats.com/api/interview-data/12345"`
     - `"https://api.your-ats.com/v1/sessions/12345/data"`
   - **Önem:** ⭐⭐⭐⭐⭐ Çok önemli - Mülakat başladığında backend bu URL'e GET isteği atar
   - **Kullanım:** Aday mülakat linkine tıkladığında backend bu endpoint'e istek atar ve mülakat verilerini alır
   - **Not:** URL formatı tamamen sizin belirlediğiniz şekilde olabilir, sadece geçerli bir HTTPS URL olması yeterli

**Response (Success 201):**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "interview_link": "https://interview-frontend-zqga.onrender.com/interview/550e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2025-12-12T10:00:00Z"
}
```

---

## 📋 Örnek Request'ler

### 1. cURL

```bash
curl -X POST https://interview-backend-zb9b.onrender.com/api/session/create/ \
  -H "Authorization: Bearer sk_live_YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "external_session_id": "ATS-12345",
    "ats_data_endpoint": "https://your-ats.com/api/interview-data/12345",
    "ats_webhook_url": "https://your-ats.com/api/webhook/receive-report",
    "ats_api_token": "your-ats-api-token",
    "expires_in_hours": 24
  }'
```

### 2. JavaScript / Node.js

```javascript
const API_KEY = 'sk_live_YOUR_API_KEY_HERE';
const API_URL = 'https://interview-backend-zb9b.onrender.com/api';

async function createInterviewSession() {
  try {
    const response = await fetch(`${API_URL}/session/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_session_id: 'ATS-12345',
        ats_data_endpoint: 'https://your-ats.com/api/interview-data/12345',
        ats_webhook_url: 'https://your-ats.com/api/webhook/receive-report',
        ats_api_token: 'your-ats-api-token',
        expires_in_hours: 24
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();
    console.log('Interview Link:', data.interview_link);
    console.log('Token:', data.token);
    console.log('Expires At:', data.expires_at);
    
    return data;
  } catch (error) {
    console.error('Error creating interview session:', error);
    throw error;
  }
}

// Kullanım
createInterviewSession()
  .then(data => {
    console.log('Success! Interview link:', data.interview_link);
  })
  .catch(error => {
    console.error('Failed:', error);
  });
```

### 3. Python (requests)

```python
import requests
import json

API_KEY = 'sk_live_YOUR_API_KEY_HERE'
API_URL = 'https://interview-backend-zb9b.onrender.com/api'

def create_interview_session():
    url = f'{API_URL}/session/create/'
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    data = {
        'external_session_id': 'ATS-12345',
        'ats_data_endpoint': 'https://your-ats.com/api/interview-data/12345',
        'ats_webhook_url': 'https://your-ats.com/api/webhook/receive-report',
        'ats_api_token': 'your-ats-api-token',
        'expires_in_hours': 24
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        print(f"Interview Link: {result['interview_link']}")
        print(f"Token: {result['token']}")
        print(f"Expires At: {result['expires_at']}")
        
        return result
    except requests.exceptions.HTTPError as e:
        error_data = e.response.json() if e.response else {}
        print(f"Error: {error_data.get('error', str(e))}")
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise

# Kullanım
if __name__ == '__main__':
    try:
        session = create_interview_session()
        print(f"\n✅ Mülakat oluşturuldu!")
        print(f"🔗 Link: {session['interview_link']}")
    except Exception as e:
        print(f"\n❌ Hata: {e}")
```

### 4. Python (httpx - async)

```python
import httpx
import asyncio

API_KEY = 'sk_live_YOUR_API_KEY_HERE'
API_URL = 'https://interview-backend-zb9b.onrender.com/api'

async def create_interview_session():
    url = f'{API_URL}/session/create/'
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    data = {
        'external_session_id': 'ATS-12345',
        'ats_data_endpoint': 'https://your-ats.com/api/interview-data/12345',
        'ats_webhook_url': 'https://your-ats.com/api/webhook/receive-report',
        'ats_api_token': 'your-ats-api-token',
        'expires_in_hours': 24
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            print(f"Interview Link: {result['interview_link']}")
            return result
        except httpx.HTTPStatusError as e:
            error_data = e.response.json() if e.response else {}
            print(f"Error: {error_data.get('error', str(e))}")
            raise

# Kullanım
asyncio.run(create_interview_session())
```

### 5. PHP

```php
<?php

$apiKey = 'sk_live_YOUR_API_KEY_HERE';
$apiUrl = 'https://interview-backend-zb9b.onrender.com/api';

$data = [
    'external_session_id' => 'ATS-12345',
    'ats_data_endpoint' => 'https://your-ats.com/api/interview-data/12345',
    'ats_webhook_url' => 'https://your-ats.com/api/webhook/receive-report',
    'ats_api_token' => 'your-ats-api-token',
    'expires_in_hours' => 24
];

$ch = curl_init($apiUrl . '/session/create/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 201) {
    $result = json_decode($response, true);
    echo "Interview Link: " . $result['interview_link'] . "\n";
    echo "Token: " . $result['token'] . "\n";
} else {
    $error = json_decode($response, true);
    echo "Error: " . ($error['error'] ?? 'Unknown error') . "\n";
}
?>
```

### 6. Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func createInterviewSession() error {
    apiKey := "sk_live_YOUR_API_KEY_HERE"
    apiURL := "https://interview-backend-zb9b.onrender.com/api/session/create/"
    
    data := map[string]interface{}{
        "external_session_id": "ATS-12345",
        "ats_data_endpoint":   "https://your-ats.com/api/interview-data/12345",
        "ats_webhook_url":      "https://your-ats.com/api/webhook/receive-report",
        "ats_api_token":        "your-ats-api-token",
        "expires_in_hours":     24,
    }
    
    jsonData, err := json.Marshal(data)
    if err != nil {
        return err
    }
    
    req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
    if err != nil {
        return err
    }
    
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return err
    }
    
    if resp.StatusCode == 201 {
        var result map[string]interface{}
        json.Unmarshal(body, &result)
        fmt.Printf("Interview Link: %v\n", result["interview_link"])
        fmt.Printf("Token: %v\n", result["token"])
        return nil
    } else {
        var errorData map[string]interface{}
        json.Unmarshal(body, &errorData)
        return fmt.Errorf("error: %v", errorData["error"])
    }
}

func main() {
    if err := createInterviewSession(); err != nil {
        fmt.Printf("Error: %v\n", err)
    }
}
```

---

## 🔍 ATS Data Endpoint Formatı

### `ats_data_endpoint` Nasıl Çalışır?

1. **Aday mülakat linkine tıklar:** `https://interview-frontend-zqga.onrender.com/interview/{token}`
2. **Frontend backend'e istek atar:** `GET /api/session/{token}/`
3. **Backend `ats_data_endpoint`'e istek atar:**
   ```bash
   GET {ats_data_endpoint}
   Headers: Authorization: Bearer {ats_api_token}
   ```
4. **ATS mülakat verilerini döner**
5. **Backend verileri frontend'e iletir**

### Endpoint Formatı

**GET** `{ats_data_endpoint}`

**Headers:**
```
Authorization: Bearer {ats_api_token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "candidateName": "Ahmet Yılmaz",
  "candidateEmail": "ahmet@example.com",
  "jobPosition": "Senior Frontend Developer",
  "companyName": "TechCorp A.Ş.",
  "companyInfo": "İnovatif teknoloji şirketi...",
  "jobDescription": "Aranan nitelikler...",
  "candidateResume": "JSON stringified resume data",
  "avatarId": "female",
  "companyLogo": "https://...",
  "companyKnowledge": [
    {
      "category": "work_culture",
      "keywords": ["kültür", "ortam"],
      "content": "Çalışma kültürü bilgisi..."
    }
  ]
}
```

**Örnek Endpoint Formatları:**
- ✅ `https://your-ats.com/api/interview-data/12345`
- ✅ `https://your-ats.com/api/sessions/12345/data`
- ✅ `https://api.your-ats.com/v1/interviews/12345`
- ❌ `http://your-ats.com/...` (HTTPS olmalı)
- ❌ `your-ats.com/...` (Protocol olmalı)

**Önemli:** 
- URL formatı tamamen sizin belirlediğiniz şekilde olabilir
- Sadece geçerli bir HTTPS URL olması yeterli
- Backend bu URL'e GET isteği atacak ve JSON response bekleyecek

---

## 📤 Webhook Formatı

Mülakat tamamlandığında ATS'nize gönderilecek webhook formatı:

**POST** `{ats_webhook_url}`

**Headers:**
```
Authorization: Bearer {ats_api_token}
Content-Type: application/json
```

**Body:**
```json
{
  "external_session_id": "ATS-12345",
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "report": {
    "overall_score": 85,
    "technical_skills": 90,
    "communication": 80,
    "cultural_fit": 85,
    "strengths": ["React expertise", "Problem solving"],
    "weaknesses": ["Limited backend experience"],
    "recommendation": "hire",
    "summary": "Strong candidate with excellent frontend skills..."
  },
  "duration_seconds": 1800,
  "completed_at": "2025-12-11T10:30:00Z"
}
```

---

## ⚠️ Hata Kodları

| Status Code | Açıklama |
|------------|----------|
| 201 | Başarılı - Mülakat oluşturuldu |
| 400 | Geçersiz request (eksik alanlar) |
| 401 | Geçersiz API key |
| 429 | Kredi yetersiz |
| 500 | Sunucu hatası |

**Örnek Hata Response:**
```json
{
  "error": "Kredi yetersiz",
  "detail": "Kalan krediniz: 0 / 20",
  "credits_used": 20,
  "credits_total": 20,
  "plan": "starter"
}
```

---

## 🔐 Güvenlik Notları

1. **API Key'i güvenli tutun** - Git'e commit etmeyin
2. **HTTPS kullanın** - Production'da mutlaka HTTPS
3. **API Key'i düzenli olarak yenileyin** - Settings sayfasından
4. **Rate limiting** - Çok fazla istek göndermeyin

---

## 📚 Diğer Endpoint'ler

### Health Check
```bash
curl https://interview-backend-zb9b.onrender.com/api/health/
```

### API Dokümantasyonu
- Swagger UI: https://interview-backend-zb9b.onrender.com/api/docs/
- ReDoc: https://interview-backend-zb9b.onrender.com/api/redoc/

---

**Production URL'ler:**
- Backend: `https://interview-backend-zb9b.onrender.com/api`
- Frontend: `https://interview-frontend-zqga.onrender.com`

