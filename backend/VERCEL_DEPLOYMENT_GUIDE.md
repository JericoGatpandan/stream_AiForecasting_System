# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **Cloud Database**: You'll need a cloud MySQL database (see options below)

## Database Setup (Required)

Since Vercel is serverless, you need a cloud database. Choose one:

### Option 1: PlanetScale (Recommended - MySQL Compatible)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get connection details from the dashboard

### Option 2: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a MySQL database
3. Get connection string from dashboard

### Option 3: AWS RDS
1. Create MySQL instance on AWS RDS
2. Configure security groups
3. Get connection details

## Deployment Steps

### 1. Install Vercel CLI and Login
```bash
# Install Vercel CLI
npm install -g vercel

# Login to your Vercel account
vercel login
```

### 2. Navigate to Backend Directory
```bash
cd C:\Users\jeric\Workspace\stream_AiForecasting_System\backend
```

### 3. Initial Deployment
```bash
# Run Vercel deployment
vercel

# Follow the prompts:
# ? Set up and deploy "backend"? Y
# ? Which scope? (Select your account)
# ? Link to existing project? N
# ? What's your project's name? ai-forecasting-backend
# ? In which directory is your code located? ./
```

### 4. Configure Environment Variables
After deployment, set environment variables in Vercel dashboard:

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to Settings > Environment Variables
3. Add these variables:

```
DB_HOST=your-database-host.com
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
NODE_ENV=production
PORT=3000
```

### 5. Deploy to Production
```bash
# Deploy to production
npm run deploy

# Or manually
vercel --prod
```

### 6. Update Frontend Configuration
Update your frontend to use the new Vercel backend URL:

```javascript
// In frontend/src/services/weatherService.js
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-vercel-app.vercel.app' 
  : 'http://localhost:5500';
```

## Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-vercel-app.vercel.app/health

# Weather data
curl https://your-vercel-app.vercel.app/weather/alerts

# Flood data
curl https://your-vercel-app.vercel.app/flood/

# Environmental data
curl https://your-vercel-app.vercel.app/environmental/abella
```

## Environment Variables Reference

Required environment variables for Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `mysql-db.planetscale.com` |
| `DB_USER` | Database username | `your-username` |
| `DB_PASSWORD` | Database password | `your-password` |
| `DB_NAME` | Database name | `forecasting_db` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Port (auto-set by Vercel) | `3000` |

## Troubleshooting

### Database Connection Issues
- Ensure your cloud database allows external connections
- Check SSL settings in config.js
- Verify credentials are correct
- Check database is running

### Deployment Fails
```bash
# Check Vercel logs
vercel logs

# Redeploy
vercel --prod --force
```

### CORS Issues
Your Express app is already configured with CORS. If issues persist:
- Check the allowed origins in your backend
- Ensure frontend is making requests to correct URL

### Function Timeouts
Vercel functions have a 10s timeout on hobby plan:
- Optimize database queries
- Consider upgrading to Pro plan for 60s timeout

## Performance Tips

1. **Database Connection Pooling**: Already configured in config.js
2. **Environment Variables**: Set in Vercel dashboard, not in code
3. **Logging**: Disabled in production for better performance
4. **SSL**: Configured for secure database connections

## Monitoring

Monitor your deployment:
1. **Vercel Dashboard**: View logs and analytics
2. **Function Logs**: `vercel logs --follow`
3. **Performance**: Monitor response times in dashboard

## Cost Considerations

- **Vercel Hobby**: Free for personal projects (10s function timeout)
- **Vercel Pro**: $20/month (60s function timeout, better performance)
- **Database**: PlanetScale free tier, Railway $5/month

## Next Steps After Deployment

1. **Custom Domain** (Optional): Add your domain in Vercel dashboard
2. **SSL Certificate**: Automatically provided by Vercel
3. **Environment Variables**: Set production values
4. **Database Migration**: Run any necessary migrations
5. **Testing**: Verify all endpoints work correctly

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review function logs: `vercel logs`
3. Test database connectivity separately
4. Verify environment variables are set correctly

Your backend will be available at: `https://your-project-name.vercel.app`