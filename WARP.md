# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Start Commands

### Development Setup
```bash
# Backend setup
cd backend
npm install
# Update .env file with your database credentials first
node seedDatabase.js
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Common Development Commands
```bash
# Start backend server (with auto-reload)
cd backend
npm start                    # Uses nodemon for auto-restart

# Start frontend development server
cd frontend
npm run dev                  # Vite dev server on port 5173

# Build frontend for production  
cd frontend
npm run build

# Lint frontend code
cd frontend
npm run lint

# Seed/reset database with sample data
cd backend
node seedDatabase.js

# Test backend server connectivity
cd backend
node -e "
const db = require('./models');
db.sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.error('Database connection failed:', err));
"
```

### Database Operations
```bash
# Start MySQL service (Windows)
net start mysql

# Connect to MySQL CLI
mysql -u root -p

# Create database
CREATE DATABASE weather_app;
```

## Architecture Overview

### Technology Stack
- **Backend**: Node.js + Express.js + Sequelize ORM + MySQL
- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Maps**: React Leaflet + Mapbox GL
- **Charts**: Recharts + Chart.js
- **External APIs**: OpenWeather API

### Project Structure
```
stream_AiForecasting_System/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Database configuration
│   ├── data/               # CSV seed data files  
│   ├── models/             # Sequelize database models
│   ├── routes/             # API route handlers
│   ├── index.js            # Main server entry point (port 5500)
│   └── seed*.js            # Database seeding scripts
└── frontend/               # React SPA client
    ├── src/
    │   ├── components/     # Reusable React components
    │   ├── pages/          # Main page components (routing)
    │   └── services/       # API communication layer
    └── vite.config.js      # Frontend build configuration (port 5173)
```

### Data Architecture
The application uses a MySQL database with the following core models:
- **EnvironmentalData**: Historical environmental monitoring data
- **WeatherForecast**: 7-day forecasts with expert analysis
- **WeatherAlert**: Active weather warnings and alerts  
- **UserLocation**: User-managed locations and preferences
- **WeatherTrigger**: Custom weather condition monitoring
- **Notification**: System notifications and alerts
- **FloodCharacteristics**: Flood-related data for barangays

### API Architecture  
The backend exposes REST APIs organized by domain:
- `/weather/*` - Weather forecasts, alerts, locations, triggers, notifications
- `/environmental/:barangay` - Environmental monitoring data
- `/barangays/*` - Barangay location data
- `/flood/*` - Flood characteristics data

The frontend uses a service layer (`services/weatherService.js`) that abstracts API calls with proper error handling and timeout configuration.

### Frontend Architecture
- **Sidebar Navigation**: Collapsible sidebar with route-based navigation
- **Page Components**: Each major feature is a separate page component
- **Service Layer**: Centralized API communication with axios
- **Toast Notifications**: User feedback via react-toastify
- **Responsive Design**: Tailwind CSS for mobile-first responsive layouts

## Key Development Patterns

### Database Patterns
- All database operations use Sequelize ORM
- Models are auto-loaded in `models/index.js`
- Database connection is initialized on server startup with `{ force: true }` (recreates tables)
- Environment variables are used for database credentials via `config/config.js`

### API Patterns  
- Routes are organized by domain in separate files
- All routes use Express middleware for CORS and JSON parsing
- Error responses should be consistent JSON format
- Frontend service layer handles all API communication

### Frontend Patterns
- React Router for client-side routing
- Page components in `src/pages/` directory
- Reusable components in `src/components/` directory  
- Tailwind CSS for styling with mobile-first approach
- Lucide React for consistent iconography

## Environment Configuration

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root  
DB_PASSWORD=your_password
DB_NAME=weather_app
OPENWEATHER_API_KEY=your_api_key
PORT=5500
NODE_ENV=development
```

### Frontend (.env.local)
Frontend uses Vite's environment variable system. API calls are proxied through Vite dev server or use direct localhost URLs.

## Testing & Quality

### Current State
- No formal test suite currently exists
- ESLint configuration present for frontend code quality
- Error handling implemented in service layer
- Database connection health check available

### Running Quality Checks
```bash
# Lint frontend code
cd frontend
npm run lint

# Test database connectivity
cd backend
node -e "
const db = require('./models');
db.sequelize.authenticate()
  .then(() => console.log('✓ Database connected'))
  .catch(err => console.error('✗ Database failed:', err));
"

# Test API server health
curl http://localhost:5500/health
```

## Database Seeding

The application includes several seeding scripts:
- `seedDatabase.js` - Main seeding script (runs all others)  
- `seedEnvironmentalData.js` - Environmental monitoring data
- `seedFloodData.js` - Flood characteristics data

Always run seeding after schema changes or fresh database setup.

## Common Issues & Solutions

### Database Connection Issues
1. Ensure MySQL is running: `net start mysql`
2. Create database: `mysql -u root -p` then `CREATE DATABASE weather_app;`
3. Update credentials in `backend/.env`
4. Test connection with health check command above

### Frontend Build Issues
1. Clear Vite cache: `rm -rf frontend/node_modules/.vite`
2. Reinstall dependencies: `cd frontend && npm install`
3. Check for port conflicts on 5173

### API Proxy Issues
- Development: Frontend proxies `/api` to `http://backend:5500` 
- Production: Frontend expects API at `/api` endpoint
- Update `vite.config.js` proxy settings if backend URL changes

## Important Notes

- Backend server runs on port 5500 (configurable via PORT env var)
- Frontend dev server runs on port 5173
- Database schema is recreated on every server restart (`force: true`)
- All API responses should be JSON format
- Frontend uses React 18 with modern hook patterns
- Tailwind CSS is configured with custom themes
- Maps require external API keys (OpenWeather, Mapbox)