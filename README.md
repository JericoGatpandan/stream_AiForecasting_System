# Stream AI Forecasting System

## Website Link: <https://stream-ai-forecasting-system-1huwz63js.vercel.app/>

- I deploy this using vercel.com

## Backend Link: <https://streamaiforecastingsystem-production.up.railway.app/>

- I deploy this using railway.com

## Overview

The Stream AI Forecasting System is designed for real-time watershed monitoring and flood prediction, focusing on river and stream systems. This MVP demonstrates the core capabilities of sensor data collection, environmental monitoring, and AI-powered flood forecasting for effective disaster preparedness.

## System Architecture

```
Frontend (React + TypeScript)
    ↕ HTTP/REST API
Backend (Node.js + Express)
    ↕ Sequelize ORM
Database (MySQL)
```

### Technology Stack

**Backend:**

- Node.js + Express.js
- MySQL database with Sequelize ORM
- RESTful API architecture
- Docker support for deployment

**Frontend:**

- React 19 with TypeScript
- Material-UI components
- Redux Toolkit for state management
- Mapbox GL for geographic visualization
- Recharts for data visualization

## Installation

### Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stream_AiForecasting_System
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**

   ```bash
   cd ../client
   npm install
   ```

4. **Database Configuration**

   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Initialize Database and Seed Data**

   ```bash
   # Start your MySQL server first
   node seedMVP.js
   ```

6. **Start Development Servers**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd client
   npm run dev
   ```

Access the application at `http://localhost:5173` (frontend) with API at `http://localhost:5500` (backend).

## API Documentation

### Base URL

```
Development: http://localhost:5500
```

### Core Endpoints

#### Barangays

```http
GET /barangays                    # List all barangays
GET /barangays/:id               # Get specific barangay data
```

#### Sensors

```http
GET /sensors                     # List all sensors with filtering
GET /sensors/:id                 # Get specific sensor details
GET /sensors/:id/readings        # Get sensor readings (time-filtered)
GET /sensors/readings/latest     # Get latest readings from all sensors
GET /sensors/:id/statistics      # Get aggregated sensor statistics
PUT /sensors/:id                 # Update sensor configuration
```

#### Environmental Data

```http
GET /environmental               # Get environmental data
GET /environmental/:barangay     # Get barangay-specific data
```

#### Flood Predictions

```http
GET /predictions                 # List predictions with filtering
GET /predictions/current         # Current predictions for all barangays
GET /predictions/barangay/:id    # Barangay-specific predictions
POST /predictions/generate       # Generate new AI prediction
GET /predictions/accuracy        # Model accuracy metrics
PUT /predictions/:id/validate    # Update prediction validation
```

## Database Seeding

The `seedMVP.js` script populates the database with comprehensive sample data:

- **24 Barangays** from client/data/barangays.json
- **30+ Sensors** strategically placed across barangays
- **24 hours** of sensor readings (5-minute intervals)
- **7 days** of environmental data (hourly)
- **Current and historical** flood predictions

### Running the Seeder

```bash
cd backend
node seedMVP.js
```

**⚠️ Warning**: This will reset your database. Use `{ force: false }` in the script for production.

## Configuration

### Environment Variables

**Backend (.env)**

```env
NODE_ENV=development
PORT=5500

# Database
DB_HOST=localhost
DB_USER=stream
DB_PASSWORD=password
DB_NAME=weather_app

# Logging
LOG_LEVEL=debug
```

**Frontend (via Vite)**

```env
VITE_API_BASE_URL=http://localhost:5500
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### Database Configuration

Edit `backend/config/config.js` for database connection settings across environments.

## Testing

### API Testing

```bash
# Test health endpoint
curl http://localhost:5500/health

# Get all sensors
curl http://localhost:5500/sensors

# Get current predictions
curl http://localhost:5500/predictions/current
```

### Database Testing

```bash
# Verify seeded data
mysql -u stream -p weather_app
SELECT COUNT(*) FROM Barangays;
SELECT COUNT(*) FROM Sensors;
SELECT COUNT(*) FROM SensorReadings;
```

## Contributing

### Development Workflow

1. Create feature branches from `main`
2. Follow existing code structure and conventions
3. Add appropriate error handling and logging
4. Update API documentation for new endpoints
5. Test thoroughly before submitting PRs

### Code Standards

- **Backend**: ESLint configuration with Node.js best practices
- **Frontend**: TypeScript strict mode with React best practices
- **Database**: Consistent naming conventions and proper indexing
- **API**: RESTful design patterns and comprehensive error handling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENCE) file for details.
