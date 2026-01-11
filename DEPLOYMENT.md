# Deployment Guide 🌐

Complete guide for deploying your College Attendance Management System to production.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] MongoDB database ready (Atlas recommended)
- [ ] OAuth credentials obtained (if using)
- [ ] Production domain purchased (optional)
- [ ] SSL certificate ready (for HTTPS)

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) ⭐ Recommended

#### Deploy Frontend to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd Frontend
vercel --prod
```

3. **Configure:**
- Environment: Production
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Deploy Backend to Railway

1. **Visit** [railway.app](https://railway.app)

2. **Create New Project:**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your Backend folder

3. **Add Environment Variables:**
```
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-production-secret
CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

4. **Deploy:**
- Railway auto-deploys on git push
- Get your backend URL: `https://your-app.railway.app`

5. **Update Frontend:**
- Update Vite proxy target to Railway URL
- Or set `VITE_API_URL` in Vercel

### Option 2: Heroku (Full Stack)

#### Backend Deployment

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login & Create App:**
```bash
heroku login
cd Backend
heroku create your-app-name-backend
```

3. **Set Environment Variables:**
```bash
heroku config:set MONGODB_URI=your-mongo-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set CLIENT_URL=https://your-frontend-url
```

4. **Deploy:**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### Frontend Deployment

1. **Create Frontend App:**
```bash
cd Frontend
heroku create your-app-name-frontend
```

2. **Add Buildpack:**
```bash
heroku buildpacks:set heroku/nodejs
```

3. **Update API URL:**
- Create `.env.production` in Frontend:
```
VITE_API_URL=https://your-backend.herokuapp.com
```

4. **Deploy:**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Option 3: AWS (Advanced)

#### Backend on AWS EC2

1. **Launch EC2 Instance:**
- Select Ubuntu Server
- t2.micro (free tier)
- Configure security group (port 80, 443, 5000)

2. **SSH into Instance:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Dependencies:**
```bash
sudo apt update
sudo apt install nodejs npm nginx
```

4. **Clone & Setup:**
```bash
git clone your-repo
cd Backend
npm install
```

5. **Configure PM2:**
```bash
npm install -g pm2
pm2 start index.js --name attendance-backend
pm2 startup
pm2 save
```

6. **Setup Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Frontend on AWS S3 + CloudFront

1. **Build Frontend:**
```bash
cd Frontend
npm run build
```

2. **Create S3 Bucket:**
- Enable static website hosting
- Upload `dist` folder contents

3. **Setup CloudFront:**
- Create distribution
- Point to S3 bucket
- Enable HTTPS

### Option 4: DigitalOcean (Docker)

1. **Create Dockerfile for Backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
```

2. **Create Dockerfile for Frontend:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

3. **Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./Backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    restart: always

  frontend:
    build: ./Frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

4. **Deploy to DigitalOcean:**
```bash
docker-compose up -d
```

## 🔒 Production Security Checklist

### Backend Security
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie options
- [ ] Implement rate limiting
- [ ] Add helmet.js for security headers
- [ ] Enable CORS only for your domain
- [ ] Use environment variables (never commit .env)
- [ ] Implement input sanitization
- [ ] Add request validation
- [ ] Set up monitoring & logging

### Frontend Security
- [ ] Sanitize user inputs
- [ ] Implement CSP headers
- [ ] Use HTTPS only
- [ ] Hide API keys
- [ ] Implement error boundaries
- [ ] Add security headers

### Database Security
- [ ] Use MongoDB Atlas (managed)
- [ ] Enable authentication
- [ ] Whitelist IP addresses
- [ ] Use strong passwords
- [ ] Enable encryption at rest
- [ ] Regular backups
- [ ] Monitor access logs

## 📊 MongoDB Atlas Setup

1. **Create Cluster:**
- Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Select region closest to your users

2. **Configure Access:**
- Database Access → Add user
- Network Access → Add IP (0.0.0.0/0 for development)

3. **Get Connection String:**
- Clusters → Connect → Connect your application
- Copy connection string
- Replace `<password>` with your password

4. **Update .env:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance?retryWrites=true&w=majority
```

## 🔧 Environment Variables for Production

### Backend (.env.production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-atlas-connection-string
JWT_SECRET=your-very-strong-secret-key-min-32-chars
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com

# OAuth (if using)
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
APPLE_CLIENT_ID=your-apple-id
APPLE_TEAM_ID=your-apple-team
APPLE_KEY_ID=your-apple-key
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.com
```

## 🎯 Post-Deployment Steps

1. **Test All Features:**
   - [ ] User registration
   - [ ] Login/Logout
   - [ ] Timetable creation
   - [ ] Attendance marking
   - [ ] Analytics viewing
   - [ ] Settings updates

2. **Monitor Performance:**
   - Set up error tracking (Sentry)
   - Monitor server uptime
   - Check database performance
   - Review API response times

3. **Setup Backups:**
   - Enable MongoDB Atlas auto-backups
   - Schedule regular database dumps
   - Store backups securely

4. **Domain & SSL:**
   - Point domain to your servers
   - Enable SSL/TLS certificates
   - Force HTTPS redirects

5. **Documentation:**
   - Update API documentation
   - Create user guide
   - Document deployment process

## 📈 Scaling Strategies

### When to Scale

Monitor these metrics:
- Response time > 1 second
- Database connections maxed out
- Memory usage > 80%
- CPU usage > 70%

### Scaling Options

1. **Vertical Scaling:**
   - Upgrade server instance
   - Increase database tier
   - Add more RAM/CPU

2. **Horizontal Scaling:**
   - Add load balancer
   - Deploy multiple backend instances
   - Use MongoDB replica sets
   - Implement caching (Redis)

3. **CDN Integration:**
   - Cloudflare
   - AWS CloudFront
   - Vercel Edge Network

## 🐛 Troubleshooting Production Issues

### Backend Not Starting
```bash
# Check logs
pm2 logs attendance-backend

# Restart service
pm2 restart attendance-backend

# Check environment variables
pm2 env 0
```

### Frontend Build Fails
```bash
# Clear cache
npm cache clean --force

# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Database Connection Issues
- Verify IP whitelist in MongoDB Atlas
- Check connection string format
- Verify database user permissions
- Test connection with MongoDB Compass

## 💰 Cost Estimates (Monthly)

### Free Tier Option
- Vercel (Frontend): Free
- Railway (Backend): $5
- MongoDB Atlas: Free (512MB)
- **Total: ~$5/month**

### Basic Production
- Vercel Pro: $20
- Railway Pro: $20
- MongoDB Atlas M10: $57
- Domain: $12/year
- **Total: ~$100/month**

### Enterprise
- AWS EC2: $50-200
- AWS RDS: $100+
- CloudFront: $50+
- Load Balancer: $20+
- **Total: $220+/month**

## ✅ Go-Live Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrated & backed up
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team notified
- [ ] Rollback plan ready

## 🆘 Support & Monitoring

### Recommended Tools
- **Monitoring:** Datadog, New Relic
- **Errors:** Sentry, Rollbar
- **Uptime:** UptimeRobot, Pingdom
- **Analytics:** Google Analytics, Mixpanel
- **Logs:** Loggly, Papertrail

---

**Your app is ready for production! 🎉**

Good luck with your deployment!
