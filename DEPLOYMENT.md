# ThemeVN - Hướng dẫn triển khai (Deployment Guide)

## Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt tự động](#cài-đặt-tự-động)
3. [Cài đặt với Docker](#cài-đặt-với-docker)
4. [Cài đặt thủ công](#cài-đặt-thủ-công)
5. [Cấu hình email](#cấu-hình-email)
6. [SSL và bảo mật](#ssl-và-bảo-mật)
7. [Backup và phục hồi](#backup-và-phục-hồi)

---

## Yêu cầu hệ thống

### Phần cứng tối thiểu
- **CPU**: 1 vCPU
- **RAM**: 1 GB
- **Disk**: 20 GB SSD

### Phần cứng khuyến nghị
- **CPU**: 2+ vCPU
- **RAM**: 2+ GB
- **Disk**: 50+ GB SSD

### Phần mềm
- **OS**: Ubuntu 20.04/22.04, Debian 11/12, CentOS 8/9
- **Node.js**: 18.x hoặc 20.x
- **Database**: PostgreSQL 14+ hoặc MySQL 8+
- **Web Server**: Nginx

---

## Cài đặt tự động

### Bước 1: Download và chạy script

```bash
# Download script
wget https://raw.githubusercontent.com/your-repo/themevn/main/scripts/autoinstall.sh

# Cấp quyền thực thi
chmod +x autoinstall.sh

# Chạy với interactive mode
sudo ./autoinstall.sh

# Hoặc chạy với parameters
sudo ./autoinstall.sh \
  --db-type postgresql \
  --db-password "your_secure_password" \
  --domain themevn.com \
  --ssl
```

### Tham số có sẵn

| Tham số | Mô tả | Mặc định |
|---------|-------|----------|
| `--db-type` | postgresql hoặc mysql | postgresql |
| `--db-host` | Database host | localhost |
| `--db-port` | Database port | 5432/3306 |
| `--db-name` | Tên database | themevn |
| `--db-user` | Database user | themevn |
| `--db-password` | Mật khẩu database | (bắt buộc) |
| `--domain` | Tên miền | - |
| `--port` | Port ứng dụng | 3000 |
| `--install-dir` | Thư mục cài đặt | /var/www/themevn |
| `--ssl` | Bật SSL với Let's Encrypt | không |

---

## Cài đặt với Docker

### Bước 1: Clone repository

```bash
git clone https://github.com/your-repo/themevn.git
cd themevn
```

### Bước 2: Cấu hình môi trường

```bash
# Copy file cấu hình mẫu
cp scripts/.env.example .env

# Chỉnh sửa cấu hình
nano .env
```

### Bước 3: Khởi chạy với Docker Compose

```bash
# Build và khởi chạy
docker-compose -f scripts/docker-compose.yml up -d

# Xem logs
docker-compose -f scripts/docker-compose.yml logs -f

# Dừng services
docker-compose -f scripts/docker-compose.yml down
```

### Sử dụng MySQL thay PostgreSQL

Chỉnh sửa `scripts/docker-compose.yml`:
1. Comment service `db` (PostgreSQL)
2. Uncomment service `mysql`
3. Cập nhật `DATABASE_URL` trong `.env`

---

## Cài đặt thủ công

### Bước 1: Cài đặt Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài pnpm
npm install -g pnpm
```

### Bước 2: Cài đặt PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get install -y postgresql postgresql-contrib

# Tạo database và user
sudo -u postgres psql << EOF
CREATE USER themevn WITH PASSWORD 'your_password';
CREATE DATABASE themevn OWNER themevn;
GRANT ALL PRIVILEGES ON DATABASE themevn TO themevn;
EOF
```

### Bước 3: Cài đặt ứng dụng

```bash
# Clone repository
git clone https://github.com/your-repo/themevn.git /var/www/themevn
cd /var/www/themevn

# Cài dependencies
pnpm install

# Tạo file .env
cp scripts/.env.example .env
nano .env

# Build ứng dụng
pnpm build

# Chạy migrations
psql -U themevn -d themevn -f scripts/database/schema.sql
```

### Bước 4: Cấu hình systemd

```bash
# Tạo service file
sudo nano /etc/systemd/system/themevn.service
```

```ini
[Unit]
Description=ThemeVN Marketplace
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/themevn
ExecStart=/usr/bin/node /var/www/themevn/dist/server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable và start service
sudo systemctl daemon-reload
sudo systemctl enable themevn
sudo systemctl start themevn
```

### Bước 5: Cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/themevn
```

```nginx
server {
    listen 80;
    server_name themevn.com www.themevn.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/themevn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Cấu hình Email

### Resend (Khuyến nghị)

1. Đăng ký tại [resend.com](https://resend.com)
2. Thêm và verify domain tại [resend.com/domains](https://resend.com/domains)
3. Tạo API key tại [resend.com/api-keys](https://resend.com/api-keys)
4. Cập nhật `.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### Verify domain trong Resend

Thêm các DNS records sau vào domain của bạn:

| Type | Name | Value |
|------|------|-------|
| TXT | resend | resend-verification=xxxxx |
| MX | send | feedback-smtp.xx.amazonses.com |
| TXT | resend._domainkey | p=xxxxx |

---

## SSL và bảo mật

### Cài đặt SSL với Let's Encrypt

```bash
# Cài certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Tạo certificate
sudo certbot --nginx -d themevn.com -d www.themevn.com

# Auto-renew
sudo certbot renew --dry-run
```

### Bảo mật cơ bản

```bash
# Firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Fail2ban
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
```

---

## Backup và phục hồi

### Backup database

```bash
# PostgreSQL
pg_dump -U themevn -d themevn -F c -f backup_$(date +%Y%m%d).dump

# MySQL
mysqldump -u themevn -p themevn > backup_$(date +%Y%m%d).sql
```

### Backup uploads

```bash
tar -czf uploads_$(date +%Y%m%d).tar.gz /var/www/themevn/uploads
```

### Phục hồi

```bash
# PostgreSQL
pg_restore -U themevn -d themevn backup.dump

# MySQL
mysql -u themevn -p themevn < backup.sql
```

---

## Các lệnh hữu ích

```bash
# Xem logs
journalctl -u themevn -f

# Restart service
sudo systemctl restart themevn

# Check status
sudo systemctl status themevn

# Rebuild application
cd /var/www/themevn
pnpm build
sudo systemctl restart themevn
```

---

## Hỗ trợ

- **Documentation**: [docs.themevn.com](https://docs.themevn.com)
- **Email**: support@themevn.com
- **GitHub Issues**: [github.com/themevn/issues](https://github.com/themevn/issues)
