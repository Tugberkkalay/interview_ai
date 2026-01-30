# 🗂️ Hetzner Deployment Dosyaları

Hetzner sunucunuza backend deployment için gerekli tüm dosyalar ve dokümantasyon.

## 📁 Dosya Yapısı

```
interview/
├── HETZNER_QUICKSTART.md          # ⚡ Hızlı başlangıç rehberi (buradan başlayın)
├── HETZNER_DEPLOYMENT.md          # 📖 Detaylı deployment rehberi
├── HETZNER_COMMANDS.md            # 💻 Kullanışlı komutlar listesi
├── deploy.sh                      # 🚀 Otomatik deployment script
├── backend/
│   └── env.template.hetzner       # 🔐 Environment variables şablonu
├── systemd/
│   └── interview.service          # ⚙️  Systemd service dosyası
├── nginx/
│   └── interview.conf             # 🌐 Nginx configuration
└── scripts/
    ├── backup.sh                  # 💾 Database backup script
    ├── restore.sh                 # 🔄 Database restore script
    ├── setup-cron.sh              # ⏰ Cron job kurulum script
    └── health-check.sh            # 🏥 Health check script
```

## 🚀 Hızlı Başlangıç

### 1️⃣ İlk Kurulum

Sunucunuza ilk kez kurulum yapıyorsanız:

```bash
# 1. Dokümantasyonu okuyun
cat HETZNER_QUICKSTART.md

# 2. Detaylı adımları takip edin
cat HETZNER_DEPLOYMENT.md
```

**Tahmini süre**: 30-45 dakika

### 2️⃣ Deployment

Kod güncellemesi yapmak için:

```bash
sudo /root/qtale/service/deploy.sh
```

### 3️⃣ Yararlı Komutlar

Günlük işlemler için:

```bash
# Komut listesini görün
cat HETZNER_COMMANDS.md

# Health check
sudo /root/qtale/service/interview/scripts/health-check.sh
```

## 📖 Dokümantasyon

### [HETZNER_QUICKSTART.md](HETZNER_QUICKSTART.md) ⚡

**Ne zaman kullanılır**: İlk kurulum için hızlı başlangıç

**İçerik**:
- Adım adım kurulum (12 adım)
- Temel komutlar
- Hızlı sorun giderme

**Okuma süresi**: 5 dakika  
**Kurulum süresi**: 30-45 dakika

---

### [HETZNER_DEPLOYMENT.md](HETZNER_DEPLOYMENT.md) 📖

**Ne zaman kullanılır**: Detaylı bilgi ve sorun giderme için

**İçerik**:
- Detaylı kurulum adımları
- Sistem gereksinimleri
- Güncelleme ve maintenance
- Kapsamlı sorun giderme
- Güvenlik önerileri
- Backup ve restore
- Monitoring
- Production checklist

**Okuma süresi**: 15-20 dakika

---

### [HETZNER_COMMANDS.md](HETZNER_COMMANDS.md) 💻

**Ne zaman kullanılır**: Günlük işlemler ve sorun giderme

**İçerik**:
- Temel komutlar (service, log, deployment)
- Database işlemleri
- Django management commands
- Nginx işlemleri
- SSL sertifikası
- Sistem monitoring
- Backup ve restore
- Güvenlik komutları
- Sorun giderme komutları
- Kullanışlı tek satır komutlar

**Kullanım**: Referans olarak yanınızda bulundurun

---

## 🗂️ Dosyalar

### Configuration Files

#### [systemd/interview.service](systemd/interview.service)

Systemd service dosyası - Django/Gunicorn için.

**Kurulum**:
```bash
sudo cp systemd/interview.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable interview
sudo systemctl start interview
```

---

#### [nginx/interview.conf](nginx/interview.conf)

Nginx reverse proxy configuration.

**Kurulum**:
```bash
sudo cp nginx/interview.conf /etc/nginx/sites-available/interview
sudo nano /etc/nginx/sites-available/interview  # Domain'i düzenle
sudo ln -s /etc/nginx/sites-available/interview /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

#### [backend/env.template.hetzner](backend/env.template.hetzner)

Environment variables şablonu.

**Kurulum**:
```bash
cp backend/env.template.hetzner backend/.env
nano backend/.env  # Değerleri düzenle
chmod 600 backend/.env  # İzinleri kısıtla
```

---

### Scripts

#### [deploy.sh](deploy.sh) 🚀

Otomatik deployment script - kod güncellemesi için.

**Kullanım**:
```bash
sudo /root/qtale/service/deploy.sh
```

**Ne yapar**:
- Git pull
- Dependency install (uv sync)
- Static files collect
- Database migration
- Service restart
- Status check

---

#### [scripts/backup.sh](scripts/backup.sh) 💾

Database backup script.

**Kullanım**:
```bash
sudo /root/qtale/service/interview/scripts/backup.sh
```

**Ne yapar**:
- PostgreSQL database dump
- Compression (gzip)
- 7 günden eski backup'ları siler
- Backup boyutunu gösterir

**Cron**: Her gün saat 03:00 (otomatik)

---

#### [scripts/restore.sh](scripts/restore.sh) 🔄

Database restore script.

**Kullanım**:
```bash
sudo /root/qtale/service/interview/scripts/restore.sh <backup_file>
```

**Ne yapar**:
- Safety backup oluşturur
- Database'i restore eder
- Migration'ları çalıştırır
- Service'i restart eder

**Dikkat**: Bu işlem mevcut database'i silecektir!

---

#### [scripts/setup-cron.sh](scripts/setup-cron.sh) ⏰

Cron job'ları otomatik kurar.

**Kullanım**:
```bash
sudo /root/qtale/service/interview/scripts/setup-cron.sh
```

**Ne kurar**:
- Daily backup (03:00)
- Daily cleanup (02:00)
- Monthly legacy cleanup
- Hourly webhook retry
- Daily SSL renewal check

---

#### [scripts/health-check.sh](scripts/health-check.sh) 🏥

Sistem health check script.

**Kullanım**:
```bash
sudo /root/qtale/service/interview/scripts/health-check.sh
```

**Ne kontrol eder**:
- Service status
- PostgreSQL status
- Nginx status
- Disk space
- Memory usage
- Log files
- Socket file
- SSL certificate
- Recent errors

---

## 🎯 Kullanım Senaryoları

### Yeni Sunucu Kurulumu

```bash
# 1. Dokümantasyonu oku
cat HETZNER_QUICKSTART.md

# 2. Adımları takip et
# ... (HETZNER_QUICKSTART.md'deki adımlar)

# 3. Health check
sudo /root/qtale/service/interview/scripts/health-check.sh
```

---

### Kod Güncellemesi

```bash
# Otomatik deployment
sudo /root/qtale/service/deploy.sh

# Manuel kontrol
sudo systemctl status interview
sudo journalctl -u interview -n 20
```

---

### Sorun Giderme

```bash
# 1. Health check
sudo /root/qtale/service/interview/scripts/health-check.sh

# 2. Log'ları kontrol et
sudo journalctl -u interview -f

# 3. Komut listesine bak
cat HETZNER_COMMANDS.md
```

---

### Backup ve Restore

```bash
# Backup al
sudo /root/qtale/service/interview/scripts/backup.sh

# Backup'ları listele
ls -lh /root/backups/

# Restore et
sudo /root/qtale/service/interview/scripts/restore.sh /root/backups/interview_db_20240101_030000.sql.gz
```

---

## 🔐 Güvenlik Kontrol Listesi

Deployment'tan sonra kontrol edin:

- [ ] `.env` dosyası izinleri kısıtlı (`chmod 600`)
- [ ] `DEBUG=False` production'da
- [ ] Güçlü `SECRET_KEY` kullanılıyor
- [ ] Güçlü database şifresi kullanılıyor
- [ ] `ALLOWED_HOSTS` doğru ayarlanmış
- [ ] `CORS_ALLOWED_ORIGINS` sadece gerekli origin'leri içeriyor
- [ ] SSL sertifikası kurulu ve aktif
- [ ] Firewall ayarlandı (sadece 80, 443, 22 portu açık)
- [ ] PostgreSQL sadece localhost'tan erişilebilir
- [ ] Backup sistemi çalışıyor
- [ ] Cron job'ları kurulu
- [ ] Log rotation aktif

---

## 📊 Monitoring

### Günlük Kontroller

```bash
# Health check (her gün)
sudo /root/qtale/service/interview/scripts/health-check.sh

# Disk kullanımı
df -h /

# Service durumu
sudo systemctl status interview --no-pager
```

### Log Monitoring

```bash
# Real-time logs
sudo journalctl -u interview -f

# Son error'lar
sudo journalctl -u interview --since "today" | grep -i error

# Nginx access log
sudo tail -f /var/log/nginx/interview_access.log
```

### Backup Kontrolü

```bash
# Son backup'ı kontrol et
ls -lth /root/backups/ | head -5

# Backup log
tail -20 /var/log/interview/backup.log
```

---

## 🆘 Yardım

### Log Dosyaları

```bash
# Application logs
sudo journalctl -u interview -n 100

# Nginx logs
sudo tail -100 /var/log/nginx/interview_error.log

# Backup logs
tail -50 /var/log/interview/backup.log
```

### Service Sorunları

```bash
# Service durumu
sudo systemctl status interview

# Service'i restart et
sudo systemctl restart interview

# Socket dosyasını kontrol et
ls -la /root/qtale/service/interview/backend/interview.sock
```

### Database Sorunları

```bash
# PostgreSQL durumu
sudo systemctl status postgresql

# Database bağlantısı test et
sudo -u postgres psql -d interview_db
```

---

## 📚 Ek Kaynaklar

- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📝 Notlar

- Tüm script'ler `/root/qtale/service/interview` dizini baz alınarak yazılmıştır
- Domain'inizi değiştirmeyi unutmayın (nginx config)
- `.env` dosyasındaki değerleri mutlaka güncelleyin
- İlk kurulumdan sonra `CREATE_ADMIN_USER` değişkenini false yapın
- Backup'lar varsayılan olarak 7 gün saklanır

---

## 🔄 Güncelleme Geçmişi

- **v1.0**: İlk sürüm (2024)
  - Systemd service
  - Nginx configuration
  - Deployment scripts
  - Backup/restore scripts
  - Cron job setup
  - Health check

---

**Başarılar! 🚀**

Sorularınız için: HETZNER_DEPLOYMENT.md → "Yardım" bölümü
