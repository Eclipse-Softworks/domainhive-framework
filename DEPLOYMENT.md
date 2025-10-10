# Deployment Guide - Ship Your Hackathon Project

Quick deployment guides for popular platforms.

## 🚀 Quick Deploy Options

### Render (Recommended - Free Tier)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/examples/backend-server.js`
   - **Environment**: Node
6. Click "Create Web Service"

Done! Your backend is live.

**Environment Variables** (if needed):
```
NODE_ENV=production
SECRET_KEY=your-secret-key-here
```

### Railway (Also Free Tier)

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js and deploys
5. Get your URL from the dashboard

**For WebSocket support**, Railway automatically handles it!

### Heroku

1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add buildpack: `heroku buildpacks:set heroku/nodejs`
5. Deploy: `git push heroku main`

Create a `Procfile`:
```
web: node dist/examples/backend-server.js
```

**Note**: Heroku changed to paid-only plans in 2022, but still popular for production.

### Vercel (Serverless)

Good for REST APIs, but WebSocket requires persistent connections (not ideal).

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/examples/backend-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/examples/backend-server.js"
    }
  ]
}
```

Deploy:
```bash
npm install -g vercel
vercel
```

### DigitalOcean App Platform

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `node dist/examples/backend-server.js`
5. Deploy

## 🐳 Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose ports
EXPOSE 3000 8080 1883

# Start server
CMD ["node", "dist/examples/backend-server.js"]
```

Create `.dockerignore`:
```
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
```

Build and run:
```bash
docker build -t domainhive-backend .
docker run -p 3000:3000 -p 8080:8080 -p 1883:1883 domainhive-backend
```

## ☁️ Cloud Platforms Comparison

| Platform | Free Tier | WebSocket | Database | Best For |
|----------|-----------|-----------|----------|----------|
| Render | ✅ 750hrs/mo | ✅ | ✅ | Hackathons |
| Railway | ✅ $5 credit | ✅ | ✅ | Quick deploy |
| Heroku | ❌ (paid) | ✅ | ✅ | Production |
| Vercel | ✅ | ⚠️ Limited | ❌ | REST APIs |
| DigitalOcean | ✅ $200 credit | ✅ | ✅ | Production |

## 🔧 Environment Variables

Common environment variables you might need:

```bash
# Server
NODE_ENV=production
PORT=3000
WS_PORT=8080

# Security
SECRET_KEY=your-secret-key
CORS_ORIGIN=https://your-frontend.com

# Database (if using)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
MONGO_URI=mongodb://user:pass@host:27017/dbname
REDIS_URL=redis://user:pass@host:6379

# External Services (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📱 Connecting Your Frontend

After deployment, update your frontend to use the deployed URL:

```javascript
// Development
const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:8080';

// Production
const API_URL = 'https://your-app.render.com';
const WS_URL = 'wss://your-app.render.com'; // Note: wss for secure WebSocket
```

Use environment variables:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
```

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change default `SECRET_KEY` in AuthModule
- [ ] Update CORS origin to your frontend domain
- [ ] Enable HTTPS (most platforms do this automatically)
- [ ] Set up environment variables
- [ ] Remove or disable test users in production
- [ ] Enable rate limiting (already included!)
- [ ] Set up error logging
- [ ] Test all endpoints
- [ ] Test WebSocket connections with SSL (wss://)
- [ ] Set up a real database (PostgreSQL, MongoDB) instead of in-memory
- [ ] Consider Redis for caching in production

## 🚨 Common Issues

### WebSocket Not Connecting

**Problem**: WebSocket works locally but not in production

**Solution**: Use `wss://` instead of `ws://` for secure connections:
```javascript
const ws = new WebSocket('wss://your-app.com/ws');
```

### CORS Errors

**Problem**: Frontend can't connect to API

**Solution**: Update CORS configuration:
```javascript
const rest = new RESTModule({
  port: 3000,
  cors: {
    origin: 'https://your-frontend.com',
    credentials: true
  }
});
```

### Port Already in Use

**Problem**: Port 3000 or 8080 is taken

**Solution**: Use environment variables:
```javascript
const rest = new RESTModule({
  port: process.env.PORT || 3000
});

const ws = new WebSocketModule({
  port: process.env.WS_PORT || 8080
});
```

### Database Connection Timeout

**Problem**: Can't connect to PostgreSQL/MongoDB

**Solution**: Check connection string and firewall rules:
```javascript
const db = new DatabaseModule({
  type: 'postgresql',
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // For hosted databases
});
```

## 📊 Monitoring & Logs

Most platforms provide built-in logging. Access logs:

**Render**:
```bash
# View logs in dashboard or CLI
render logs -s your-service-name
```

**Railway**:
```bash
# Logs available in dashboard
railway logs
```

**Heroku**:
```bash
heroku logs --tail
```

## 🎯 Post-Hackathon: Going to Production

If your hackathon project needs to go to production:

1. **Add a real database**: Switch from in-memory to PostgreSQL/MongoDB
2. **Set up Redis**: For distributed caching
3. **Enable logging**: Use the LoggingModule for file-based logs
4. **Add monitoring**: Set up error tracking (Sentry, etc.)
5. **Scale horizontally**: Use load balancers for multiple instances
6. **Add CI/CD**: Automate testing and deployment
7. **Security audit**: Review all security configurations
8. **Backup strategy**: Set up database backups
9. **Domain & SSL**: Use custom domain with SSL certificate
10. **Documentation**: Document your API for other developers

## 🆘 Need Help?

- Check the [Usage Guide](./USAGE_GUIDE.md) for detailed documentation
- Review [Hackathon Guide](./HACKATHON_GUIDE.md) for patterns
- Open an issue on [GitHub](https://github.com/Eclipse-Softworks/domainhive-framework/issues)

## 🎉 Good Luck!

Your hackathon project is now deployed and ready to impress! 🚀
