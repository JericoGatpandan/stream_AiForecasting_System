# Stream AI Forecasting System

A comprehensive watershed and river monitoring system with AI-powered flood prediction capabilities for MVP demonstration.

## 🌊 Overview

The Stream AI Forecasting System is designed for real-time watershed monitoring and flood prediction, focusing on river and stream systems. This MVP demonstrates the core capabilities of sensor data collection, environmental monitoring, and AI-powered flood forecasting for effective disaster preparedness.

### Key Features

- **Real-time Sensor Monitoring**: Multi-parameter sensors for water level, rainfall, flow velocity, and weather data
- **Watershed Management**: Geographic-based monitoring with barangay-level granularity
- **AI Flood Prediction**: Machine learning models for flood risk assessment and early warning
- **Dashboard Visualization**: Real-time data visualization and alert management
- **Extensible Architecture**: Ready for future AI model integration and deployment scaling

## 🏗️ System Architecture

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
- JWT authentication (ready for implementation)
- Docker support for deployment

**Frontend:**
- React 19 with TypeScript
- Material-UI components
- Redux Toolkit for state management
- Mapbox GL for geographic visualization
- Recharts for data visualization

## 🚀 Quick Start

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

## 📊 Database Schema

### Core Models

#### Barangays
- Geographic boundaries and administrative areas
- Flood risk classification and watershed zones
- Population and area metrics

#### Sensors
- Physical sensor installations
- Real-time status monitoring
- Battery and maintenance tracking

#### SensorReadings
- Time-series sensor data
- Water parameters, weather data, and system metrics
- Data quality indicators

#### FloodPredictions
- AI-generated flood forecasts
- Risk levels and confidence scores
- Model versioning and validation tracking

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:5500
```

### Authentication
Currently using open endpoints for MVP. Production deployment will include JWT authentication.

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

### API Response Format

```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response Format

```json
{
  "error": "Error description",
  "details": "Detailed error message",
  "status_code": 400
}
```

## 🌱 Database Seeding

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

## 🤖 AI Model Integration

### Current Implementation (MVP)

The system includes a mock AI prediction model (`mockAIPredictionModel`) that:
- Analyzes recent environmental data
- Considers barangay risk levels
- Generates realistic flood probabilities
- Provides confidence scores and risk classifications

### Future AI Integration

The architecture is designed for easy integration of real ML models:

```javascript
// Replace mockAIPredictionModel with:
const aiModelResult = await realAIModel.predict({
  environmental_data: recentData,
  barangay_profile: barangay,
  forecast_hours: 24
});
```

### Model Requirements

Future AI models should accept:
- **Environmental Data**: Rainfall, water levels, temperature, humidity
- **Geospatial Data**: Barangay coordinates, watershed zones
- **Historical Patterns**: Seasonal variations, flood history

And return:
- **Flood Probability**: 0.0 to 1.0
- **Risk Level**: low, moderate, high, severe, extreme
- **Confidence Score**: Model certainty
- **Predicted Parameters**: Water levels, rainfall amounts

## 🚢 Deployment

### Development Deployment

```bash
# Using existing Docker configuration
docker-compose up -d
```

### Production Deployment

1. **Environment Configuration**
   ```bash
   cp backend/.env.production.example backend/.env.production
   # Configure production database and settings
   ```

2. **Build Applications**
   ```bash
   cd client && npm run build
   cd ../backend && npm run build
   ```

3. **Database Migration**
   ```bash
   cd backend
   npx sequelize-cli db:migrate --env production
   ```

4. **Start Production Server**
   ```bash
   npm run start:prod
   ```

### Cloud Deployment Options

- **Vercel/Netlify**: Frontend static hosting
- **Railway/Heroku**: Backend API hosting  
- **PlanetScale/AWS RDS**: Production MySQL database
- **DigitalOcean**: Full-stack VPS deployment

## 🔧 Configuration

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

## 📈 Monitoring and Maintenance

### Health Check Endpoint

```http
GET /health
```

Returns system status, database connectivity, and uptime information.

### Logging

The system uses structured logging with configurable levels:
- `error`: Critical system errors
- `warn`: Warning conditions  
- `info`: General information
- `debug`: Detailed debugging information

### Performance Monitoring

- Database query optimization through Sequelize
- API response time monitoring
- Memory usage tracking
- Sensor data validation and quality flags

## 🧪 Testing

### API Testing

Use the provided Postman collection or test with curl:

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

## 🤝 Contributing

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

## 📋 MVP Demonstration Checklist

### Core Functionality
- [x] Real-time sensor data visualization
- [x] Barangay-based geographic organization
- [x] Environmental data trending
- [x] Flood prediction generation
- [x] Risk level classification
- [x] Historical data analysis

### API Completeness
- [x] CRUD operations for all major entities
- [x] Filtering and pagination support
- [x] Error handling and validation
- [x] Comprehensive endpoint coverage
- [x] Mock AI integration ready

### Data Quality
- [x] 24 barangays with realistic coordinates
- [x] Multi-parameter sensor installations
- [x] 24+ hours of realistic sensor readings
- [x] Environmental data with quality indicators
- [x] Diverse flood prediction scenarios

## 🔮 Future Enhancements

### Phase 2: AI Model Integration
- Real machine learning model deployment
- Historical flood data training
- Satellite imagery integration
- Weather API integration for forecasting

### Phase 3: Advanced Features
- Mobile application development
- SMS/Email alert system
- Community reporting features
- Advanced analytics dashboard

### Phase 4: Scale & Deploy
- Multi-region deployment
- Government agency integration
- Real-time sensor hardware deployment
- Public API for third-party integrations

## 📞 Support

For technical support and questions:

### Development Team
- **Backend Development**: Node.js/Express API and database design
- **Frontend Development**: React/TypeScript interface and visualization
- **AI/ML Integration**: Model architecture and prediction algorithms
- **DevOps**: Deployment and infrastructure management

### Documentation
- API documentation: `/docs` endpoint (Swagger UI ready)
- Database schema: `backend/models/` directory
- Frontend components: `client/src/components/` directory

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🚨 Important Notes for MVP Presentation

1. **Demo Data**: The system includes 24 hours of realistic sensor data and current flood predictions
2. **AI Simulation**: Current AI predictions are mock data but demonstrate real integration patterns
3. **Scalability**: Architecture supports easy scaling and real AI model integration
4. **Geographic Focus**: Uses real barangay coordinates for Naga City region
5. **Free Software**: All components use open-source technologies for cost-effective deployment

**Ready for Presentation**: The system is fully functional for demonstration with realistic data, comprehensive API coverage, and extensible architecture for future AI model integration.

---

*Generated for Stream AI Forecasting System MVP - River and Watershed Monitoring Focus*