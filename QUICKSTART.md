# 🚀 Quick Start Guide

## 📋 What You Need
1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
2. This code repository

## ⚡ 3-Step Setup

### Step 1: Install Docker
Download and install Docker Desktop from the link above.

### Step 2: Get the Code
```bash
git clone <your-repository-url>
cd stream_AiForecasting_System
```

### Step 3: Deploy
**Windows:**
```powershell
.\deploy.ps1
```

**Mac/Linux:**
```bash
./deploy.sh
```

## Done!

Visit **http://localhost** in your browser!

- Frontend: http://localhost
- Backend API: http://localhost:5500
- Database: localhost:3306

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart application
docker-compose up -d
```

## Problems?
Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed troubleshooting.

---
**That's it! Your AI Forecasting System is ready!**