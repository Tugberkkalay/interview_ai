# Hetzner Sunucu - Hızlı Başlangıç

Bu dosya, Hetzner sunucunuza backend'i kurduktan sonra kullanacağınız yaygın komutları içerir.

## 📋 Temel Komutlar

### Service Yönetimi

```bash
# Service'i başlat
sudo systemctl start interview

# Service'i durdur
sudo systemctl stop interview

# Service'i yeniden başlat
sudo systemctl restart interview

# Service'i reload et (downtime olmadan)
sudo systemctl reload interview

# Service durumunu kontrol et
sudo systemctl status interview

# Service'i boot'ta otomatik başlat
sudo systemctl enable interview

# Service'i boot'tan kaldır
sudo systemctl disable interview
```

### Log İzleme

```bash
# Real-time log izleme
sudo journalctl -u interview -f

# Son 50 satır
sudo journalctl -u interview -n 50

# Son 100 satır (pager olmadan)
sudo journalctl -u interview -n 100 --no-pager

# Belirli bir tarihten sonraki loglar
sudo journalctl -u interview --since "2024-01-01"

# Son 1 saatin logları
sudo journalctl -u interview --since "1 hour ago"

# Gunicorn error log
sudo tail -f /var/log/interview/error.log

# Gunicorn access log
sudo tail -f /var/log/interview/access.log

# Nginx error log
sudo tail -f /var/log/nginx/interview_error.log

# Nginx access log
sudo tail -f /var/log/nginx/interview_access.log
```

### Deployment ve Güncelleme

```bash
# Kolay deployment (tek komut)
sudo /root/qtale/service/deploy.sh

# Manuel deployment
cd /root/qtale/service/interview
sudo git pull origin main
cd backend
uv sync
uv run python manage.py collectstatic --noinput
uv run python manage.py migrate
sudo systemctl restart interview

# Sadece kod değişikliği (static/migration yok)
cd /root/qtale/service/interview && sudo git pull && sudo systemctl restart interview
```

### Database İşlemleri

```bash
# Database'e bağlan
sudo -u postgres psql -d interview_db

# Migration oluştur
cd /root/qtale/service/interview/backend
uv run python manage.py makemigrations

# Migration uygula
uv run python manage.py migrate

# Migration durumunu kontrol et
uv run python manage.py showmigrations

# Database backup al
sudo /root/qtale/service/interview/scripts/backup.sh

# Database'i restore et
sudo /root/qtale/service/interview/scripts/restore.sh /root/backups/interview_db_20240101_030000.sql.gz

# Database boyutunu göster
sudo -u postgres psql -d interview_db -c "SELECT pg_size_pretty(pg_database_size('interview_db'));"

# Tüm tabloları listele
sudo -u postgres psql -d interview_db -c "\dt"
```

### Django Management Commands

```bash
cd /root/qtale/service/interview/backend

# Admin kullanıcısı oluştur
uv run python manage.py createsuperuser

# Default prompts oluştur
uv run python manage.py create_default_prompts

# Geçici verileri temizle
uv run python manage.py cleanup_temp_data

# Eski session'ları temizle
uv run python manage.py cleanup_legacy_sessions

# Webhook'ları yeniden dene
uv run python manage.py retry_webhooks

# Django shell
uv run python manage.py shell

# Database shell
uv run python manage.py dbshell
```

### Nginx İşlemleri

```bash
# Nginx'i test et (config kontrolü)
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx

# Nginx'i reload et (downtime olmadan)
sudo systemctl reload nginx

# Nginx durumu
sudo systemctl status nginx

# Nginx config'i düzenle
sudo nano /etc/nginx/sites-available/interview
```

### SSL Sertifikası

```bash
# SSL sertifikası al (ilk kurulum)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# SSL sertifikasını yenile
sudo certbot renew

# SSL yenilemeyi test et (dry-run)
sudo certbot renew --dry-run

# Sertifika bilgilerini göster
sudo certbot certificates
```

### Sistem Monitoring

```bash
# Health check çalıştır
sudo /root/qtale/service/interview/scripts/health-check.sh

# CPU ve Memory kullanımı
htop

# Disk kullanımı
df -h

# Interview service'in resource kullanımı
systemctl status interview

# Process listesi
ps aux | grep gunicorn

# Port kontrolü
sudo netstat -tulpn | grep 80
sudo netstat -tulpn | grep 443

# Aktif bağlantılar
sudo netstat -an | grep ESTABLISHED | wc -l
```

### Backup ve Restore

```bash
# Manuel backup al
sudo /root/qtale/service/interview/scripts/backup.sh

# Backup'ları listele
ls -lh /root/backups/

# Database restore et
sudo /root/qtale/service/interview/scripts/restore.sh <backup_file>

# Cron job'ları kontrol et
crontab -l

# Backup log'unu görüntüle
tail -f /var/log/interview/backup.log
```

### Güvenlik

```bash
# Firewall durumu
sudo ufw status

# Firewall'da port aç
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Fail2ban durumu (eğer kuruluysa)
sudo fail2ban-client status

# .env dosyası izinlerini kontrol et
ls -la /root/qtale/service/interview/backend/.env

# .env izinlerini kısıtla
sudo chmod 600 /root/qtale/service/interview/backend/.env
```

## 🔧 Sorun Giderme

### Service Başlamıyor

```bash
# Detaylı log kontrolü
sudo journalctl -u interview -n 100 --no-pager

# Socket dosyasını kontrol et
ls -la /root/qtale/service/interview/backend/interview.sock

# Socket dosyasını sil ve service'i restart et
sudo rm -f /root/qtale/service/interview/backend/interview.sock
sudo systemctl restart interview
```

### 502 Bad Gateway

```bash
# Service durumunu kontrol et
sudo systemctl status interview

# Nginx log'larını kontrol et
sudo tail -f /var/log/nginx/interview_error.log

# Socket dosyasını kontrol et
ls -la /root/qtale/service/interview/backend/interview.sock

# Service'i restart et
sudo systemctl restart interview
```

### Database Bağlantı Hatası

```bash
# PostgreSQL durumunu kontrol et
sudo systemctl status postgresql

# PostgreSQL'i restart et
sudo systemctl restart postgresql

# Database bağlantısını test et
sudo -u postgres psql -d interview_db

# .env dosyasındaki DATABASE_URL'i kontrol et
cat /root/qtale/service/interview/backend/.env | grep DATABASE_URL
```

### Static Files Yüklenmiyor

```bash
# Static files'ı yeniden topla
cd /root/qtale/service/interview/backend
uv run python manage.py collectstatic --noinput

# Static dizin izinlerini kontrol et
ls -la /root/qtale/service/interview/backend/staticfiles/

# Nginx'i restart et
sudo systemctl restart nginx
```

### Disk Doldu

```bash
# En çok yer kaplayan dosyaları bul
sudo du -ah /root/qtale/service/interview | sort -rh | head -20

# Log dosyalarını temizle
sudo journalctl --vacuum-time=7d
sudo truncate -s 0 /var/log/interview/*.log

# Eski backup'ları sil
find /root/backups -name "*.sql.gz" -mtime +7 -delete
```

## 📊 Kullanışlı Tek Satır Komutlar

```bash
# Service restart + log izleme
sudo systemctl restart interview && sudo journalctl -u interview -f

# Git pull + deployment
cd /root/qtale/service/interview && sudo git pull && sudo /root/qtale/service/deploy.sh

# Tüm servislerin durumu
sudo systemctl status interview nginx postgresql --no-pager

# Son 1 saatin error logları
sudo journalctl -u interview --since "1 hour ago" | grep -i error

# En son 10 HTTP request
sudo tail -10 /var/log/nginx/interview_access.log

# Database backup + boyut
sudo /root/qtale/service/interview/scripts/backup.sh && du -sh /root/backups/
```

## 🎯 Günlük Rutin Kontroller

```bash
# Günlük health check
sudo /root/qtale/service/interview/scripts/health-check.sh

# Service durumu
sudo systemctl status interview --no-pager

# Disk kullanımı
df -h /

# Son error'ları kontrol et
sudo journalctl -u interview --since "today" | grep -i error
```

## 📝 Notlar

- Tüm komutlar `/root/qtale/service/interview` dizini baz alınarak yazılmıştır
- Script'ler çalıştırılabilir hale getirilmelidir: `chmod +x script.sh`
- Log dosyaları düzenli olarak temizlenmelidir
- Database backup'ları düzenli olarak kontrol edilmelidir
- SSL sertifikaları otomatik yenilenir (certbot cron job)

---

**Son Güncelleme**: 2024
