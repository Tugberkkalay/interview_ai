# Hetzner Sunucu Deployment Rehberi

Bu rehber, AI Interview Platform backend'ini Hetzner sunucunuza deploy etmek için gerekli tüm adımları içerir.

## 📋 Önkoşullar

- Ubuntu/Debian tabanlı bir sunucu (Ubuntu 22.04 önerilir)
- Root veya sudo yetkisi
- Git kurulu
- Python 3.11 veya üzeri
- PostgreSQL
- Nginx
- Domain veya sunucu IP adresi

---

## 🚀 Deployment Adımları

### 1. Sunucuya Bağlanın

```bash
ssh root@your-server-ip
# veya
ssh user@your-server-ip
```

### 2. Sistem Güncellemeleri ve Gerekli Paketler

```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Gerekli paketleri yükle
sudo apt install -y python3 python3-pip python3-venv git nginx postgresql postgresql-contrib curl build-essential libpq-dev
```

### 3. PostgreSQL Database Oluşturma

```bash
# PostgreSQL kullanıcısına geç
sudo -u postgres psql

# Database ve kullanıcı oluştur
CREATE DATABASE interview_db;
CREATE USER interview_user WITH PASSWORD 'güçlü_şifreniz_buraya';
ALTER ROLE interview_user SET client_encoding TO 'utf8';
ALTER ROLE interview_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE interview_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE interview_db TO interview_user;
\q
```

### 4. uv Package Manager Kurulumu

```bash
# uv kurulumu
curl -LsSf https://astral.sh/uv/install.sh | sh

# Path'e ekle
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Kurulumu doğrula
uv --version
```

### 5. Proje Dizinini Oluştur ve Git'ten Clone

```bash
# Ana dizini oluştur
sudo mkdir -p /root/qtale/service
cd /root/qtale/service

# Git repository'yi clone et
sudo git clone https://github.com/your-username/interview.git
cd interview/backend

# Alternatif: Eğer zaten bir git repository'niz varsa
# git clone git@github.com:your-username/interview.git
```

### 6. Environment Variables Oluştur

```bash
# .env dosyası oluştur
sudo nano /root/qtale/service/interview/backend/.env
```

Aşağıdaki içeriği ekleyin:

```env
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-here-change-this
ALLOWED_HOSTS=your-domain.com,your-server-ip,localhost

# Database
DATABASE_URL=postgresql://interview_user:güçlü_şifreniz_buraya@localhost:5432/interview_db

# API Keys
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Settings
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Security
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True

# Production settings
RENDER=true
```

**Not**: `SECRET_KEY` oluşturmak için:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 7. Python Bağımlılıklarını Yükle

```bash
cd /root/qtale/service/interview/backend

# uv ile bağımlılıkları yükle
uv sync

# Static files'ı topla
uv run python manage.py collectstatic --noinput

# Database migration'ları çalıştır
uv run python manage.py migrate

# Default prompts oluştur (varsa)
uv run python manage.py create_default_prompts || true

# Admin kullanıcısı oluştur
uv run python manage.py createsuperuser
```

### 8. Systemd Service Oluştur

Gunicorn için systemd service dosyası oluşturun:

```bash
sudo nano /etc/systemd/system/interview.service
```

Aşağıdaki içeriği ekleyin:

```ini
[Unit]
Description=AI Interview Platform Backend
After=network.target postgresql.service

[Service]
Type=notify
User=root
Group=root
WorkingDirectory=/root/qtale/service/interview/backend
Environment="PATH=/root/.local/bin:/usr/local/bin:/usr/bin:/bin"

# Load environment variables from .env file
EnvironmentFile=/root/qtale/service/interview/backend/.env

# Gunicorn command
ExecStart=/root/.local/bin/uv run gunicorn \
    --workers 4 \
    --bind unix:/root/qtale/service/interview/backend/interview.sock \
    --timeout 120 \
    --access-logfile /var/log/interview/access.log \
    --error-logfile /var/log/interview/error.log \
    --log-level info \
    config.wsgi:application

ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Log dizinini oluşturun:

```bash
sudo mkdir -p /var/log/interview
sudo chown -R root:root /var/log/interview
```

### 9. Nginx Yapılandırması

Nginx config dosyası oluşturun:

```bash
sudo nano /etc/nginx/sites-available/interview
```

Aşağıdaki içeriği ekleyin:

```nginx
upstream interview_backend {
    server unix:/root/qtale/service/interview/backend/interview.sock fail_timeout=0;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Domain'inizi buraya yazın
    
    client_max_body_size 10M;
    
    # Logs
    access_log /var/log/nginx/interview_access.log;
    error_log /var/log/nginx/interview_error.log;
    
    # Static files
    location /static/ {
        alias /root/qtale/service/interview/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /root/qtale/service/interview/backend/media/;
        expires 30d;
    }
    
    # Proxy to Django
    location / {
        proxy_pass http://interview_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_buffering off;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

Nginx config'i aktif edin:

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/interview /etc/nginx/sites-enabled/

# Default site'ı kaldır (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx config'i test et
sudo nginx -t

# Nginx'i restart et
sudo systemctl restart nginx
```

### 10. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test et
sudo certbot renew --dry-run
```

Certbot otomatik olarak Nginx config'inizi güncelleyecek ve HTTPS için 443 portu açacaktır.

### 11. Service'leri Başlat

```bash
# Systemd daemon'u reload et
sudo systemctl daemon-reload

# Interview service'i başlat
sudo systemctl start interview

# Service durumunu kontrol et
sudo systemctl status interview

# Boot'ta otomatik başlat
sudo systemctl enable interview

# Nginx'i kontrol et
sudo systemctl status nginx
```

### 12. Firewall Ayarları

```bash
# UFW firewall'ı kur (eğer kurulu değilse)
sudo apt install -y ufw

# HTTP ve HTTPS portlarını aç
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH

# Firewall'ı aktif et
sudo ufw enable

# Durumu kontrol et
sudo ufw status
```

---

## 🔧 Güncelleme ve Maintenance

### Kod Güncellemesi

```bash
cd /root/qtale/service/interview

# Son değişiklikleri çek
sudo git pull origin main

# Bağımlılıkları güncelle
cd backend
uv sync

# Static files'ı güncelle
uv run python manage.py collectstatic --noinput

# Migration'ları çalıştır
uv run python manage.py migrate

# Service'i restart et
sudo systemctl restart interview
```

### Auto-deployment Script Oluştur

Kolay güncelleme için bir script oluşturun:

```bash
sudo nano /root/qtale/service/deploy.sh
```

Aşağıdaki içeriği ekleyin:

```bash
#!/bin/bash

# Deployment script for AI Interview Platform
set -e

echo "🚀 Starting deployment..."

cd /root/qtale/service/interview

# Git pull
echo "📥 Pulling latest changes..."
git pull origin main

cd backend

# Install dependencies
echo "📦 Installing dependencies..."
uv sync

# Collect static files
echo "📁 Collecting static files..."
uv run python manage.py collectstatic --noinput

# Run migrations
echo "🗄️  Running migrations..."
uv run python manage.py migrate

# Restart service
echo "🔄 Restarting service..."
sudo systemctl restart interview

echo "✅ Deployment completed successfully!"
echo "🔍 Check status: sudo systemctl status interview"
```

Script'i çalıştırılabilir yapın:

```bash
sudo chmod +x /root/qtale/service/deploy.sh
```

Kullanımı:

```bash
sudo /root/qtale/service/deploy.sh
```

### Cron Job ile Otomatik Temizlik

```bash
# Crontab'ı düzenle
sudo crontab -e

# Aşağıdaki satırları ekle
# Her gün saat 02:00'de geçici verileri temizle
0 2 * * * cd /root/qtale/service/interview/backend && /root/.local/bin/uv run python manage.py cleanup_temp_data >> /var/log/interview/cleanup.log 2>&1

# Her ay 1'inde eski session'ları temizle
0 3 1 * * cd /root/qtale/service/interview/backend && /root/.local/bin/uv run python manage.py cleanup_legacy_sessions >> /var/log/interview/cleanup.log 2>&1
```

---

## 🐛 Sorun Giderme

### Service Log'larını Görüntüleme

```bash
# Systemd service log'ları
sudo journalctl -u interview -f

# Gunicorn log'ları
sudo tail -f /var/log/interview/error.log
sudo tail -f /var/log/interview/access.log

# Nginx log'ları
sudo tail -f /var/log/nginx/interview_error.log
sudo tail -f /var/log/nginx/interview_access.log
```

### Service Çalışmıyor

```bash
# Service durumunu kontrol et
sudo systemctl status interview

# Service'i restart et
sudo systemctl restart interview

# Log'ları kontrol et
sudo journalctl -u interview -n 50 --no-pager
```

### Database Connection Hatası

```bash
# PostgreSQL durumunu kontrol et
sudo systemctl status postgresql

# Database bağlantısını test et
sudo -u postgres psql -d interview_db

# .env dosyasındaki DATABASE_URL'i kontrol et
cat /root/qtale/service/interview/backend/.env | grep DATABASE_URL
```

### Nginx Hatası

```bash
# Nginx config'i test et
sudo nginx -t

# Nginx'i restart et
sudo systemctl restart nginx

# Nginx durumunu kontrol et
sudo systemctl status nginx
```

### Static Files Yüklenmiyor

```bash
# Static files'ı yeniden topla
cd /root/qtale/service/interview/backend
uv run python manage.py collectstatic --noinput

# İzinleri kontrol et
sudo ls -la /root/qtale/service/interview/backend/staticfiles/

# Nginx'i restart et
sudo systemctl restart nginx
```

### 502 Bad Gateway

```bash
# Socket dosyasını kontrol et
sudo ls -la /root/qtale/service/interview/backend/interview.sock

# Service'in çalıştığından emin ol
sudo systemctl status interview

# Nginx error log'una bak
sudo tail -f /var/log/nginx/interview_error.log
```

---

## 🔐 Güvenlik Önerileri

1. **Firewall**: Sadece gerekli portları açın (80, 443, 22)
2. **SSH**: Key-based authentication kullanın, password authentication kapatın
3. **Fail2ban**: SSH ve Nginx için fail2ban kurun
4. **Database**: PostgreSQL'i sadece localhost'tan erişime açın
5. **Backup**: Düzenli database backup'ları alın
6. **Updates**: Sistem güncellemelerini düzenli yapın
7. **Environment Variables**: .env dosyasının izinlerini kısıtlayın

```bash
# .env dosyası izinlerini kısıtla
sudo chmod 600 /root/qtale/service/interview/backend/.env
```

---

## 📊 Monitoring

### System Resources

```bash
# CPU ve memory kullanımı
htop

# Disk kullanımı
df -h

# Service resource kullanımı
sudo systemctl status interview
```

### Application Logs

```bash
# Real-time log monitoring
sudo journalctl -u interview -f
```

### Database Size

```bash
sudo -u postgres psql -d interview_db -c "SELECT pg_size_pretty(pg_database_size('interview_db'));"
```

---

## 🔄 Backup ve Restore

### Database Backup

```bash
# Backup oluştur
sudo -u postgres pg_dump interview_db > /root/backups/interview_db_$(date +%Y%m%d_%H%M%S).sql

# Otomatik backup script
sudo mkdir -p /root/backups

# Backup script oluştur
sudo nano /root/backups/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="interview_db"

# Database backup
sudo -u postgres pg_dump $DB_NAME > $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql

# 7 günden eski backup'ları sil
find $BACKUP_DIR -name "${DB_NAME}_*.sql" -mtime +7 -delete

echo "Backup completed: ${DB_NAME}_${TIMESTAMP}.sql"
```

```bash
# Script'i çalıştırılabilir yap
sudo chmod +x /root/backups/backup.sh

# Cron job ekle (her gün saat 03:00)
sudo crontab -e
# Ekle: 0 3 * * * /root/backups/backup.sh >> /var/log/interview/backup.log 2>&1
```

### Database Restore

```bash
# Backup'tan geri yükle
sudo -u postgres psql interview_db < /root/backups/interview_db_20240101_030000.sql
```

---

## 📝 Hızlı Komutlar

```bash
# Service'i restart et
sudo systemctl restart interview

# Logs'u görüntüle
sudo journalctl -u interview -f

# Deployment script çalıştır
sudo /root/qtale/service/deploy.sh

# Nginx'i reload et
sudo systemctl reload nginx

# Database backup al
sudo /root/backups/backup.sh
```

---

## 🎯 Production Checklist

- [ ] PostgreSQL kurulu ve çalışıyor
- [ ] Database oluşturuldu
- [ ] uv package manager kurulu
- [ ] Git repository clone edildi
- [ ] .env dosyası oluşturuldu ve yapılandırıldı
- [ ] Python bağımlılıkları yüklendi
- [ ] Database migration'ları çalıştırıldı
- [ ] Static files toplandı
- [ ] Systemd service oluşturuldu ve çalışıyor
- [ ] Nginx yapılandırıldı
- [ ] SSL sertifikası kuruldu
- [ ] Firewall yapılandırıldı
- [ ] Backup sistemi kuruldu
- [ ] Log rotation aktif
- [ ] Monitoring kuruldu

---

## 🤝 Yardım

Sorun yaşarsanız:

1. Log dosyalarını kontrol edin
2. Service durumunu kontrol edin
3. Nginx ve Database'in çalıştığından emin olun
4. .env dosyasındaki ayarları doğrulayın

---

**Başarılar! 🚀**
