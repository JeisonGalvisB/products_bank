# Deployment Guide

## Table of Contents

1. [Docker Deployment (Recommended)](#docker-deployment)
2. [Manual Deployment](#manual-deployment)
3. [AWS Cloud Deployment](#aws-cloud-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Security Checklist](#security-checklist)

---

## Docker Deployment

### Prerequisites

- Docker 20.x or higher
- Docker Compose 2.x or higher

### Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd products-bank

# 2. Configure environment
cp .env.docker.example .env.docker

# Edit .env.docker with production values:
# - RECAPTCHA_SECRET_KEY
# - RECAPTCHA_SITE_KEY
# - JWT_SECRET (strong random string)

# 3. Start services
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Check status
docker-compose ps
```

### Services

- **MySQL**: Port 3306 (database)
- **Backend**: Port 5000 (API)
- **Frontend**: Port 80 (web application)

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# View logs
docker-compose logs -f [service-name]

# Clean everything (including volumes)
docker-compose down -v

# Run migrations in container
docker-compose exec backend npm run migrate

# Run seeders in container
docker-compose exec backend npm run seed
```

### Production Docker Configuration

Edit `docker-compose.yml` for production:

```yaml
services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}  # Use strong password
      MYSQL_DATABASE: products_bank
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql  # Persistent data

  backend:
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}  # Strong random key
      DB_PASSWORD: ${MYSQL_PASSWORD}
    restart: always

  frontend:
    restart: always
```

---

## Manual Deployment

### Prerequisites

- Node.js 20.x LTS
- MySQL 8.0
- Nginx (for frontend)
- PM2 (for backend process management)

### Backend Deployment

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Navigate to backend
cd backend

# 3. Install dependencies
npm ci --only=production

# 4. Configure environment
cp .env.example .env
# Edit .env with production values

# 5. Run migrations
npm run migrate

# 6. Run seeders
npm run seed

# 7. Start with PM2
pm2 start src/app.js --name products-bank-api

# 8. Save PM2 configuration
pm2 save

# 9. Setup PM2 to start on boot
pm2 startup
```

### Frontend Deployment

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm ci

# 3. Configure environment
cp .env.example .env
# Edit .env with production API URL

# 4. Build for production
npm run build

# 5. Deploy build folder to web server
# Copy contents of 'build/' to web server root
cp -r build/* /var/www/html/
```

### Nginx Configuration

Create `/etc/nginx/sites-available/products-bank`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/products-bank /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## AWS Cloud Deployment

### Architecture Overview

```
Internet → CloudFront (CDN) → S3 (Frontend)
                           ↓
                    Application Load Balancer
                           ↓
                    EC2 (Backend API)
                           ↓
                    RDS MySQL (Database)
```

### 1. Database Setup (RDS)

**Create RDS MySQL Instance:**

1. Go to AWS RDS Console
2. Create Database:
   - Engine: MySQL 8.0
   - Template: Production
   - Instance: db.t3.small (or larger)
   - Storage: 20 GB SSD (auto-scaling enabled)
   - Multi-AZ: Yes (for high availability)
3. Configure:
   - DB Name: `products_bank`
   - Username: `admin`
   - Password: Strong password
   - VPC Security Group: Allow port 3306 from backend security group
4. Enable automated backups (7-35 days retention)

**Connection String:**
```
mysql://admin:password@products-bank.xxxxx.region.rds.amazonaws.com:3306/products_bank
```

**Initial Setup:**
```bash
# Connect to RDS
mysql -h products-bank.xxxxx.region.rds.amazonaws.com -u admin -p

# Run migrations from local
DB_HOST=products-bank.xxxxx.region.rds.amazonaws.com npm run migrate
npm run seed
```

### 2. Backend Setup (EC2)

**Launch EC2 Instance:**

1. AMI: Amazon Linux 2 or Ubuntu 22.04
2. Instance Type: t3.small (minimum)
3. Configure:
   - VPC: Same as RDS
   - Security Group: Allow ports 22 (SSH), 5000 (API)
   - IAM Role: With CloudWatch logs permissions
4. Add storage: 20 GB SSD

**Setup Script:**

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2
npm install -g pm2

# Clone repository
git clone <repository-url>
cd products-bank/backend

# Install dependencies
npm ci --only=production

# Configure environment
cat > .env << EOL
NODE_ENV=production
PORT=5000
DB_HOST=products-bank.xxxxx.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=products_bank
DB_USER=admin
DB_PASSWORD=your_rds_password
JWT_SECRET=your_strong_jwt_secret
CORS_ORIGIN=https://yourdomain.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
EOL

# Start with PM2
pm2 start src/app.js --name products-bank-api
pm2 startup
pm2 save

# Configure CloudWatch logs (optional)
pm2 install pm2-cloudwatch
```

**Application Load Balancer (Optional):**

1. Create ALB in same VPC
2. Target: EC2 instance port 5000
3. Health check: /health endpoint
4. SSL/TLS: Upload certificate or use ACM

### 3. Frontend Setup (S3 + CloudFront)

**Create S3 Bucket:**

```bash
# 1. Create bucket
aws s3 mb s3://products-bank-frontend

# 2. Enable static website hosting
aws s3 website s3://products-bank-frontend --index-document index.html

# 3. Configure bucket policy (public read)
cat > bucket-policy.json << EOL
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::products-bank-frontend/*"
  }]
}
EOL

aws s3api put-bucket-policy --bucket products-bank-frontend --policy file://bucket-policy.json
```

**Build and Deploy Frontend:**

```bash
# 1. Build with production API URL
cd frontend
REACT_APP_API_URL=https://api.yourdomain.com/api npm run build

# 2. Upload to S3
aws s3 sync build/ s3://products-bank-frontend/ --delete

# 3. Invalidate CloudFront cache (after CloudFront setup)
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Create CloudFront Distribution:**

1. Go to CloudFront Console
2. Create Distribution:
   - Origin: S3 bucket (products-bank-frontend)
   - Viewer Protocol: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache Policy: CachingOptimized
   - SSL Certificate: Use ACM certificate
   - Default Root Object: index.html
3. Custom Error Pages:
   - 403 → /index.html (for SPA routing)
   - 404 → /index.html (for SPA routing)
4. Note CloudFront domain: `xxxxxx.cloudfront.net`

### 4. DNS Configuration (Route 53)

**Setup Custom Domain:**

1. Register domain or use existing
2. Create Hosted Zone
3. Add Records:
   - A Record: `yourdomain.com` → CloudFront distribution (Alias)
   - A Record: `api.yourdomain.com` → ALB or EC2 IP
4. Update nameservers at domain registrar

### 5. SSL/TLS Certificates (ACM)

**Request Certificates:**

1. Go to ACM Console (us-east-1 for CloudFront)
2. Request certificate:
   - Domain: `*.yourdomain.com`
   - Validation: DNS
3. Add CNAME records to Route 53
4. Wait for validation
5. Attach to CloudFront and ALB

### 6. Monitoring (CloudWatch)

**Setup Alarms:**

```bash
# CPU Utilization
aws cloudwatch put-metric-alarm \
  --alarm-name products-bank-high-cpu \
  --alarm-description "CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# RDS Storage
aws cloudwatch put-metric-alarm \
  --alarm-name products-bank-low-storage \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 2000000000 \
  --comparison-operator LessThanThreshold
```

---

## Environment Configuration

### Production Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
DB_HOST=<rds-endpoint or localhost>
DB_PORT=3306
DB_NAME=products_bank
DB_USER=<db-user>
DB_PASSWORD=<strong-password>
JWT_SECRET=<min-32-chars-random-string>
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com
RECAPTCHA_SECRET_KEY=<google-recaptcha-secret>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_RECAPTCHA_SITE_KEY=<google-recaptcha-site-key>
REACT_APP_ENV=production
```

---

## Security Checklist

### Pre-Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (min 32 characters)
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable application logging
- [ ] Configure firewall rules (security groups)
- [ ] Review and update dependencies
- [ ] Remove development dependencies in production

### Database Security

- [ ] Use strong database passwords
- [ ] Enable SSL for database connections
- [ ] Restrict database access to backend only
- [ ] Enable automated backups
- [ ] Set up read replicas (optional)
- [ ] Enable slow query logs

### Application Security

- [ ] Use environment variables for secrets
- [ ] Enable Helmet.js security headers
- [ ] Configure proper CORS policies
- [ ] Implement rate limiting
- [ ] Enable request logging
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Use PM2 cluster mode for backend
- [ ] Keep Node.js and dependencies updated

### AWS Security

- [ ] Use IAM roles instead of access keys
- [ ] Enable MFA for root account
- [ ] Restrict security group rules
- [ ] Enable VPC Flow Logs
- [ ] Enable CloudTrail
- [ ] Configure WAF rules (optional)
- [ ] Enable GuardDuty (optional)
- [ ] Set up CloudWatch alarms

### Monitoring

- [ ] Set up health check endpoints
- [ ] Configure log aggregation
- [ ] Set up error alerting
- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Track user activity logs
- [ ] Set up uptime monitoring

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check CloudWatch alarms

**Weekly:**
- Review database performance
- Check disk space usage
- Review security logs

**Monthly:**
- Update dependencies
- Review and rotate logs
- Test backup restoration
- Security audit

### Scaling Considerations

**Backend Scaling:**
- Use PM2 cluster mode
- Add more EC2 instances behind ALB
- Use Auto Scaling Groups

**Database Scaling:**
- Increase RDS instance size
- Add read replicas
- Enable connection pooling

**Frontend Scaling:**
- CloudFront automatically scales
- Optimize bundle size
- Enable code splitting

---

## Troubleshooting

### Common Issues

**Backend not connecting to database:**
```bash
# Check security group allows port 3306
# Verify RDS endpoint and credentials
# Test connection manually
mysql -h <rds-endpoint> -u admin -p
```

**Frontend can't reach API:**
```bash
# Check CORS configuration in backend
# Verify API URL in frontend .env
# Check security group allows port 5000
# Test API directly
curl https://api.yourdomain.com/api/health
```

**SSL Certificate issues:**
```bash
# Verify certificate is issued and attached
# Check domain points to correct resource
# Wait for DNS propagation (up to 48 hours)
```

---

## Cost Estimation (AWS)

**Minimum Setup:**
- RDS db.t3.small: ~$30/month
- EC2 t3.small: ~$15/month
- S3 + CloudFront: ~$5/month
- Data Transfer: ~$10/month
- **Total: ~$60/month**

**Production Setup:**
- RDS db.t3.medium (Multi-AZ): ~$120/month
- EC2 t3.medium (2 instances): ~$60/month
- ALB: ~$25/month
- S3 + CloudFront: ~$10/month
- Data Transfer: ~$30/month
- **Total: ~$245/month**

---

## Support

For deployment issues, check:
- Application logs: `pm2 logs` or CloudWatch
- Database logs: RDS console
- Network: Security groups and VPC configuration
- DNS: Route 53 and domain registrar