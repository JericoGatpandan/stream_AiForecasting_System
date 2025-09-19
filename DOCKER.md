# Stream AI Forecasting System - Docker Guide

This guide will help you deploy the Stream AI Forecasting System using Docker, making it easy to run on any machine with Docker installed.

## Prerequisites

### Required Software

- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop)
- **Git**: [Download here](https://git-scm.com/downloads) (if cloning the repository)

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free space
- **OS**: Windows 10/11, macOS, or Linux

## Quick Start (Recommended)

### Option 1: One-Command Deploy

**For Windows (PowerShell):**

```powershell
.\deploy.ps1
```

**For macOS/Linux (Terminal):**

```bash
./deploy.sh
```

### Option 2: Manual Docker Commands

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <your-repository-url>
   cd stream_AiForecasting_System
   ```

2. **Build and start all services**:

   ```bash
   docker-compose up --build -d
   ```

3. **Wait for services to start** (about 30-60 seconds)

4. **Access the application**:
   - **Frontend**: <http://localhost>
   - **Backend API**: <http://localhost:5500>
   - **Database**: localhost:3306

## Application URLs

Once deployed, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | <http://localhost> | Main web application |
| **Backend API** | <http://localhost:5500> | REST API endpoints |
| **Database** | localhost:3306 | MySQL database |
| **Health Check** | <http://localhost:5500/health> | API health status |

## 🔧 Development Setup

If you want to develop locally without Docker:

1. **Install dependencies**:

   ```bash
   npm run install:all
   ```

2. **Set up database** (install MySQL locally)

3. **Update environment variables**:
   - Copy `backend/.env.example` to `backend/.env`
   - Update database credentials

4. **Run development servers**:

   ```bash
   npm run dev
   ```

## Docker Commands Reference

### Basic Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build -d

# View running containers
docker-compose ps
```

### Useful NPM Scripts

```bash
# Install all dependencies
npm run install:all

# Build frontend for production
npm run build

# Deploy with Docker
npm run docker:deploy

# View Docker logs
npm run docker:logs

# Stop Docker services
npm run docker:down
```

## 🔍 Troubleshooting

### Common Issues

#### 1. **Port Already in Use**

```bash
# Check what's using the port
netstat -ano | findstr :80
netstat -ano | findstr :5500

# Kill the process or change ports in docker-compose.yml
```

#### 2. **Docker Not Running**

- Make sure Docker Desktop is running
- Check Docker daemon status: `docker info`

#### 3. **Database Connection Failed**

```bash
# Check database logs
docker-compose logs database

# Restart database service
docker-compose restart database
```

#### 4. **Frontend Not Loading**

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

#### 5. **API Calls Failing**

- Check if backend is running: <http://localhost:5500/health>
- Verify API proxy configuration in nginx.conf
- Check backend logs: `docker-compose logs backend`

### Container Health Checks

```bash
# Check container health
docker-compose ps

# If a service is unhealthy, check logs
docker-compose logs [service-name]

# Restart unhealthy service
docker-compose restart [service-name]
```

## Network Configuration

### Default Ports

- **Frontend**: 80 (HTTP)
- **Backend**: 5500
- **Database**: 3306

### Changing Ports

Edit the `docker-compose.yml` file:

```yaml
ports:
  - "8080:80"  # Frontend on port 8080
  - "3001:5500" # Backend on port 3001
```

## Environment Variables

### Backend (.env)

```env
DB_HOST=database
DB_USER=appuser
DB_PASSWORD=password
DB_NAME=weather_app
PORT=5500
NODE_ENV=production
```

### Frontend (.env.production)

```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Stream AI Forecasting System
VITE_APP_VERSION=1.0.0
```

## Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Last 100 lines
docker-compose logs --tail=100
```

### Container Statistics

```bash
# View resource usage
docker stats

# View container info
docker inspect stream_ai_backend
```

## Production Deployment

For production deployment on a server:

1. **Update environment variables** for production
2. **Use proper domain names** instead of localhost
3. **Set up SSL/HTTPS** with a reverse proxy (nginx, Traefik)
4. **Configure database backup** and monitoring
5. **Set up log aggregation**

### Example Production docker-compose.yml

```yaml
# Add to your production environment
environment:
  - NODE_ENV=production
  - DB_HOST=your-db-host
  - DOMAIN=yourdomain.com
```

## Sharing with Team

To share with your groupmates:

1. **Share this repository** with them
2. **Ask them to install Docker Desktop**
3. **They can run the deploy script**:
   - Windows: `./deploy.ps1`
   - macOS/Linux: `./deploy.sh`

That's it! No complex setup required.

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Look at the application logs: `docker-compose logs`
3. Make sure Docker Desktop is running
4. Restart Docker services: `docker-compose restart`

## Next Steps

After deployment:

1. Test all application features
2. Check API endpoints work correctly
3. Verify database connections
4. Test the flood forecasting functionality
5. Share the localhost URL with your team for demo

---

**Happy Deploying!**
