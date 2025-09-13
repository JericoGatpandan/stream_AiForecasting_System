# Troubleshooting Guide

## Common Issues and Solutions

### 1. Frontend "Outdated Optimize Dep" Error

**Problem**: Vite shows "Outdated Optimize Dep" error
**Solution**: 
```bash
# Clear Vite cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### 2. Backend 500 Internal Server Error

**Problem**: Backend returns 500 errors
**Causes & Solutions**:

#### Database Connection Issues
1. **Check MySQL is running**:
   ```bash
   # Windows
   net start mysql
   
   # Or check services
   services.msc
   ```

2. **Create the database**:
   ```sql
   mysql -u root -p
   CREATE DATABASE weather_app;
   ```

3. **Update database credentials** in `backend/config/config.json`:
   ```json
   {
     "development": {
       "username": "root",
       "password": "your_password_here",
       "database": "weather_app",
       "host": "localhost",
       "dialect": "mysql"
     }
   }
   ```

#### Missing Dependencies
```bash
cd backend
npm install
```

#### Database Not Seeded
```bash
cd backend
node seedDatabase.js
```

### 3. Frontend Dependency Issues

**Problem**: npm install fails or has conflicts
**Solution**:
```bash
# Clear everything and reinstall
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

### 4. Port Already in Use

**Problem**: Port 3001 or 5173 already in use
**Solution**:
```bash
# Find and kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Find and kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### 5. Windows Permission Issues

**Problem**: npm install fails with permission errors
**Solution**:
1. Run Command Prompt as Administrator
2. Or use PowerShell with elevated privileges
3. Clear npm cache: `npm cache clean --force`

## Step-by-Step Setup (Windows)

### 1. Prerequisites
- Install Node.js (v16 or higher)
- Install MySQL (v8.0 or higher)
- Start MySQL service

### 2. Database Setup
```sql
mysql -u root -p
CREATE DATABASE weather_app;
exit
```

### 3. Quick Setup (Recommended)
```bash
# Run the Windows batch file
setup.bat
```

### 4. Manual Setup
```bash
# Backend
cd backend
npm install
# Update config/config.json with your database password
node seedDatabase.js
npm start

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

## Testing the Application

### 1. Test Backend
```bash
cd backend
node test-server.js
# Visit http://localhost:3001/test
```

### 2. Test Database Connection
```bash
cd backend
node -e "
const db = require('./models');
db.sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.error('Database connection failed:', err));
"
```

### 3. Test Frontend
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

## Common Error Messages

### "ECONNREFUSED"
- MySQL is not running
- Wrong database credentials
- Wrong host/port

### "ER_ACCESS_DENIED_ERROR"
- Wrong database username/password
- User doesn't have permission to access database

### "ER_BAD_DB_ERROR"
- Database doesn't exist
- Wrong database name in config

### "Module not found"
- Missing dependencies
- Run `npm install`

### "Outdated Optimize Dep"
- Vite cache issue
- Clear cache: `rm -rf node_modules/.vite`

## Getting Help

1. Check the console logs for specific error messages
2. Verify all prerequisites are installed
3. Ensure MySQL is running
4. Check database credentials
5. Try the test server first: `node backend/test-server.js`

## Quick Fixes

### Reset Everything
```bash
# Stop all processes
# Clear frontend
cd frontend
rm -rf node_modules package-lock.json

# Clear backend
cd ../backend
rm -rf node_modules package-lock.json

# Reinstall
npm install
cd ../frontend
npm install

# Restart
cd ../backend
npm start
# In new terminal: cd frontend && npm run dev
```
