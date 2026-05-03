# 🚀 Siparbox — Sunucu Kurulum Rehberi

Bu rehber, projeyi `siparbox.com` adresi üzerinden yayınlamak için gereken tüm adımları içerir.
Her adımı sırayla takip edin.

---

## ✅ Tamamlananlar

- [x] Domain satın alındı: **siparbox.com**
- [x] Cloudflare'de A kayıtları oluşturuldu → `178.104.170.133`
- [x] Proje dosyaları siparbox.com için güncellendi
- [x] Nginx HTTPS yapılandırması hazır

---

## ADIM 1 — Cloudflare SSL Ayarı (ÖNEMLİ)

Cloudflare paneline girin → **siparbox.com** → **SSL/TLS** sekmesi

SSL/TLS modunu **"Full"** olarak ayarlayın.
> ⚠️ "Flexible" yazmayın — sitede döngüsel yönlendirme hatası çıkar.
> "Full (Strict)" şimdilik kullanmayın — bunun için sunucuda da sertifika gerekir.

---

## ADIM 2 — GitHub'a Proje Yükle

Bilgisayarında PowerShell'i aç ve şu komutları çalıştır:

### 2.1 GitHub'da Repository oluştur
- https://github.com → **New repository** → isim: `siparbox-erp` → **Private** → **Create**

### 2.2 Projeyi GitHub'a gönder
```powershell
cd "C:\Users\User\Downloads\idurar-erp-crm-master\idurar-erp-crm-master"

git init
git add .
git commit -m "Siparbox ERP ilk kurulum"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/siparbox-erp.git
git push -u origin main
```

> ⚠️ `KULLANICI_ADIN` kısmını kendi GitHub kullanıcı adınla değiştir.

---

## ADIM 3 — Sunucu Kirala (Hetzner Cloud)

### 3.1 Hesap Oluştur
- https://www.hetzner.com/cloud → **Get started for free**

### 3.2 Sunucu Oluştur
1. **+ Create Server** tıkla
2. Ayarlar:
   - **Location:** Nuremberg (EU)
   - **Image:** Ubuntu 24.04
   - **Type:** Shared CPU → **CX22** (2 vCPU, 4GB RAM) → ~4$/ay
   - **SSH Key:** Aşağıda açıklanıyor
3. **Create & Buy Now** → **IP Adresin: `178.104.170.133`**

### 3.3 SSH Anahtarı Oluştur (Windows'ta)
```powershell
ssh-keygen -t ed25519 -C "siparbox-sunucu"
# Enter'a bas (dosya yolu varsayılan olsun)
# Şifre istemezse Enter'a bas

# Public anahtarı kopyala:
cat $HOME\.ssh\id_ed25519.pub
```
Çıkan metni Hetzner'deki "SSH Keys" bölümüne yapıştır.

---

## ADIM 4 — Sunucuya Bağlan ve Hazırla

### 4.1 SSH ile Bağlan
```powershell
ssh root@178.104.170.133
```

### 4.2 Sistem Güncelle
```bash
apt update && apt upgrade -y
```

### 4.3 Güvenlik Duvarı (UFW) Kur
```bash
apt install ufw -y
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable
ufw status
```

### 4.4 Docker Kur
```bash
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

---

## ADIM 5 — Projeyi Sunucuya Al

```bash
cd /opt
git clone https://github.com/KULLANICI_ADIN/siparbox-erp.git
cd siparbox-erp
```

---

## ADIM 6 — Ortam Değişkenlerini Ayarla

### 6.1 Backend .env oluştur
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

`.env` içeriği şöyle olmalı:
```env
DATABASE=mongodb://mongo:27017/siparbox-erp
JWT_SECRET=BURAYA_EN_AZ_32_KARAKTER_RASTGELE_YAZ
NODE_ENV=production
PUBLIC_SERVER_FILE=https://siparbox.com/
PORT=8888
```

> JWT_SECRET için güçlü bir değer üretmek için:
> ```bash
> openssl rand -base64 32
> ```

### 6.2 Frontend .env.production oluştur
```bash
cp frontend/.env.production.example frontend/.env.production
```
> ✅ Zaten `siparbox.com` değerleri ayarlıdır, değiştirmenize gerek yok.

---

## ADIM 7 — SSL Sertifikası Al (Certbot)

> Cloudflare DNS Proxy aktifse bu adımı **atlayabilirsiniz** (Cloudflare zaten HTTPS sağlar).
> Eğer Cloudflare SSL modunu "Full (Strict)" kullanmak istiyorsanız bu adımı yapın.

```bash
# Certbot kur
apt install certbot -y

# Nginx'i geçici durdur
docker compose stop nginx 2>/dev/null || true

# Sertifika al
certbot certonly --standalone -d siparbox.com -d www.siparbox.com

# Sertifika klasörü oluştur
mkdir -p /etc/letsencrypt/live/siparbox.com
```

---

## ADIM 8 — Docker ile Sistemi Başlat

```bash
cd /opt/siparbox-erp

# İlk kurulum (build eder, ~3-5 dakika sürer)
docker compose up -d --build

# Logları izle (başarılı başladığında Ctrl+C ile çık)
docker compose logs -f
```

Başarılı çıktı şöyle görünür:
```
siparbox-backend  | Express running → On PORT : 8888
siparbox-nginx    | ...started
```

### 8.1 Veritabanı İlk Kurulumu
```bash
docker compose exec backend node src/setup/setup.js
```

---

## ADIM 9 — Test Et

Tarayıcında aç: `https://siparbox.com`

İlk giriş:
- **E-posta:** `admin@SiparBox.com`
- **Şifre:** `admin123`

> ⚠️ İlk girişten sonra hemen şifrenizi değiştirin!

---

## Faydalı Komutlar

```bash
# Servislerin durumunu gör
docker compose ps

# Logları izle
docker compose logs -f

# Sistemi yeniden başlat
docker compose restart

# Sistemi durdur
docker compose down

# Güncelleme (yeni kod geldiğinde)
git pull
docker compose up -d --build
```

---

## Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| Siteye erişilemiyor | `docker compose ps` ile servislerin çalışıp çalışmadığını kontrol et |
| Backend başlamıyor | `docker compose logs backend` ile hata mesajını gör |
| Veritabanı bağlantı hatası | `.env` içinde `DATABASE=mongodb://mongo:27017/siparbox-erp` olduğundan emin ol |
| SSL hatası | Cloudflare SSL modunu "Full" yap (panelde SSL/TLS bölümü) |
| Build hatası | `docker compose down && docker compose up -d --build` ile yeniden dene |
| www çalışmıyor | Cloudflare'de `www` için de A kaydı oluşturulduğunu kontrol et |
