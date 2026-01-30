# Hetzner Deployment - Özet Kılavuz

## 📦 Hazırlık (Yerel Makinenizde)

Bu repository'yi commit edin ve Hetzner sunucunuzdan erişebileceğiniz bir git remote'a push edin.

```bash
git add .
git commit -m "Add Hetzner deployment configuration"
git push origin main
```

## 🚀 Hızlı Kurulum (Hetzner Sunucuda)

### 1. Sunucuya Bağlan

```bash
ssh root@your-server-ip
```

### 2. Temel Paketleri Kur

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip git nginx postgresql postgresql-contrib curl build-essential libpq-dev
```

### 3. Database Oluştur

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE interview_db;
CREATE USER interview_user WITH PASSWORD 'güçlü_şifre_buraya';
ALTER ROLE interview_user SET client_encoding TO 'utf8';
ALTER ROLE interview_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE interview_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE interview_db TO interview_user;
\q
```

### 4. uv Package Manager Kur

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### 5. Projeyi Clone Et

```bash
mkdir -p /root/qtale/service
cd /root/qtale/service
git clone https://github.com/your-username/interview.git
cd interview/backend
```

### 6. Environment Variables Ayarla

```bash
cp env.template.hetzner .env
nano .env
```

**Önemli**: Bu değerleri mutlaka değiştirin:
- `SECRET_KEY` - Güçlü bir key oluşturun
- `ALLOWED_HOSTS` - Domain'inizi ekleyin
- `DATABASE_URL` - Database şifrenizi yazın
- `GEMINI_API_KEY` - API key'inizi ekleyin
- `CORS_ALLOWED_ORIGINS` - Frontend URL'inizi ekleyin

### 7. Bağımlılıkları Yükle ve Migrate Et

```bash
cd /root/qtale/service/interview/backend
uv sync
uv run python manage.py collectstatic --noinput
uv run python manage.py migrate
uv run python manage.py create_default_prompts || true
uv run python manage.py createsuperuser
```

### 8. Systemd Service Kur

```bash
# Service dosyasını kopyala
sudo cp /root/qtale/service/interview/systemd/interview.service /etc/systemd/system/

# Log dizini oluştur
sudo mkdir -p /var/log/interview

# Service'i başlat
sudo systemctl daemon-reload
sudo systemctl start interview
sudo systemctl enable interview
sudo systemctl status interview
```

### 9. Nginx Ayarla

```bash
# Nginx config'i kopyala
sudo cp /root/qtale/service/interview/nginx/interview.conf /etc/nginx/sites-available/interview

# Domain'inizi düzenleyin
sudo nano /etc/nginx/sites-available/interview
# "your-domain.com" kısımlarını kendi domain'inizle değiştirin

# Config'i aktif et
sudo ln -s /etc/nginx/sites-available/interview /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Opsiyonel

# Nginx'i test et ve restart et
sudo nginx -t
sudo systemctl restart nginx
```

### 10. SSL Sertifikası Al

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 11. Firewall Ayarla

```bash
sudo apt install -y ufw
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

### 12. Cron Job'ları Kur

```bash
sudo /root/qtale/service/interview/scripts/setup-cron.sh
```

## ✅ Kurulum Tamamlandı!

Site artık çalışıyor olmalı: `https://your-domain.com`

### Kontrol Et

```bash
# Health check
sudo /root/qtale/service/interview/scripts/health-check.sh

# Service durumu
sudo systemctl status interview

# Logs
sudo journalctl -u interview -f
```

## 🔄 Güncellemeler

Kod güncellemesi için:

```bash
sudo /root/qtale/service/deploy.sh
```

## 📚 Daha Fazla Bilgi

- **Detaylı Rehber**: `HETZNER_DEPLOYMENT.md`
- **Komut Listesi**: `HETZNER_COMMANDS.md`
- **Script'ler**: `scripts/` klasörü

## 🆘 Sorun mu Yaşıyorsunuz?

```bash
# Log'ları kontrol et
sudo journalctl -u interview -n 100 --no-pager

# Service'i restart et
sudo systemctl restart interview

# Health check çalıştır
sudo /root/qtale/service/interview/scripts/health-check.sh
```

Detaylı sorun giderme için: `HETZNER_DEPLOYMENT.md` → "Sorun Giderme" bölümü

---

**İyi şanslar! 🚀**
