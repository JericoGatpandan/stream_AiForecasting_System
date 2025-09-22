Based on your frontend setup and flood forecasting system requirements, here are my recommendations for your backend:

## 🚀 **Recommended Tech Stack**

### **Primary Language: Node.js with TypeScript**
```bash
# Why Node.js + TypeScript?
✅ Seamless integration with your React frontend
✅ Shared type definitions between frontend/backend
✅ Excellent ecosystem for weather APIs and geospatial data
✅ Strong async capabilities for real-time data processing
✅ Great ML/AI library support
```

### **Framework: Express.js with Prisma ORM**
```bash
npm init -y
npm install express cors helmet morgan compression
npm install @types/express @types/cors @types/node typescript ts-node nodemon
```

## 🛠 **Essential Backend Tools & Libraries**

### **1. Database & ORM (Prisma)**
```bash
# Prisma setup
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# Database drivers
npm install mysql2        # for MySQL
# OR
npm install pg @types/pg  # for PostgreSQL (recommended for geospatial)
```

### **2. Weather & Geospatial Data**
```bash
# Weather API integrations
npm install axios node-cron

# Geospatial processing (for your flood modeling)
npm install turf @types/turf        # Geospatial calculations
npm install proj4 @types/proj4      # Coordinate transformations
npm install gdal                    # Advanced geospatial processing
```

### **3. Real-time Features**
```bash
# WebSocket for real-time updates
npm install socket.io @types/socket.io

# Redis for caching weather data
npm install redis @types/redis
```

### **4. AI/ML Integration**
```bash
# TensorFlow.js for flood prediction models
npm install @tensorflow/tfjs-node

# Python integration (if needed for complex models)
npm install python-shell @types/python-shell
```

### **5. Essential Middleware & Security**
```bash
npm install dotenv bcryptjs jsonwebtoken
npm install express-rate-limit express-validator
npm install @types/bcryptjs @types/jsonwebtoken
```

## 📁 **Recommended Project Structure with Prisma**

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── controllers/
│   │   ├── weatherController.ts
│   │   ├── floodController.ts
│   │   ├── alertsController.ts
│   │   └── environmentalController.ts
│   ├── services/
│   │   ├── weatherService.ts      # External API integrations
│   │   ├── floodPredictionService.ts
│   │   ├── alertService.ts
│   │   └── cacheService.ts
│   ├── routes/
│   │   ├── weather.ts
│   │   ├── flood.ts
│   │   ├── alerts.ts
│   │   └── environmental.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   ├── geoUtils.ts           # Geospatial calculations
│   │   ├── weatherUtils.ts
│   │   ├── prisma.ts            # Prisma client instance
│   │   └── dateUtils.ts
│   ├── types/
│   │   ├── weather.ts
│   │   ├── flood.ts
│   │   └── api.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── constants.ts
│   └── app.ts
├── tests/
├── scripts/
│   ├── seedDatabase.ts
│   └── weatherDataSync.ts
├── package.json
├── tsconfig.json
├── .env.example
└── docker-compose.yml
```

## 🗄️ **Prisma Schema for Your Flood System**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}

model FloodCharacteristics {
  id                           String   @id @default(cuid())
  location                     String
  latitude                     Float
  longitude                    Float
  maximumDepth                 Float    @map("maximum_depth")
  maximumDepthUncertainty      Float    @map("maximum_depth_uncertainty")
  peakVelocity                 Float    @map("peak_velocity")
  peakVelocityUncertainty      Float    @map("peak_velocity_uncertainty")
  arrivalTime                  Float    @map("arrival_time")
  arrivalTimeUncertainty       Float    @map("arrival_time_uncertainty")
  inundationArea               Float    @map("inundation_area")
  inundationAreaUncertainty    Float    @map("inundation_area_uncertainty")
  floodRiskLevel              FloodRiskLevel @default(LOW) @map("flood_risk_level")
  modelVersion                String   @default("v1.0") @map("model_version")
  lastUpdated                 DateTime @default(now()) @map("last_updated")
  isActive                    Boolean  @default(true) @map("is_active")
  expertAnalysis              String?  @map("expert_analysis")
  recommendedActions          String?  @map("recommended_actions")
  createdAt                   DateTime @default(now()) @map("created_at")
  updatedAt                   DateTime @updatedAt @map("updated_at")

  @@map("flood_characteristics")
  @@index([location])
  @@index([floodRiskLevel])
  @@index([isActive])
}

model WeatherData {
  id              String   @id @default(cuid())
  location        String
  latitude        Float
  longitude       Float
  temperature     Float
  humidity        Float
  windSpeed       Float    @map("wind_speed")
  windDirection   String   @map("wind_direction")
  precipitation   Float
  pressure        Float
  visibility      Float
  uvIndex         Float    @map("uv_index")
  condition       String
  timestamp       DateTime @default(now())
  isActive        Boolean  @default(true) @map("is_active")
  
  @@map("weather_data")
  @@index([location])
  @@index([timestamp])
}

model WeatherAlert {
  id          String      @id @default(cuid())
  type        AlertType
  severity    Severity
  title       String
  description String
  location    String?
  latitude    Float?
  longitude   Float?
  startTime   DateTime    @map("start_time")
  endTime     DateTime    @map("end_time")
  isActive    Boolean     @default(true) @map("is_active")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  
  @@map("weather_alerts")
  @@index([location])
  @@index([isActive])
}

model Sensor {
  id        String   @id @default(cuid())
  name      String
  barangay  String
  latitude  Float
  longitude Float
  status    SensorStatus @default(ACTIVE)
  readings  Json     // Store sensor readings as JSON
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("sensors")
  @@index([barangay])
  @@index([status])
}

enum FloodRiskLevel {
  LOW
  MODERATE
  HIGH
  EXTREME
}

enum AlertType {
  WARNING
  WATCH
  ADVISORY
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  EXTREME
}

enum SensorStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
  ERROR
}
```

## 🔧 **Prisma Setup Commands**

```bash
# 1. Initialize Prisma
npx prisma init

# 2. Generate Prisma client after schema changes
npx prisma generate

# 3. Create and run migrations
npx prisma migrate dev --name init

# 4. Push schema changes to database (for prototyping)
npx prisma db push

# 5. View your data in Prisma Studio
npx prisma studio

# 6. Seed your database
npx prisma db seed
```

## 🌤 **Prisma Client Usage Examples**

```typescript
// src/utils/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// src/services/floodService.ts
import { prisma } from '../utils/prisma'

export class FloodService {
  async getAllFloodCharacteristics() {
    return await prisma.floodCharacteristics.findMany({
      where: { isActive: true },
      orderBy: { lastUpdated: 'desc' }
    })
  }

  async getFloodCharacteristicsByLocation(location: string) {
    return await prisma.floodCharacteristics.findMany({
      where: { 
        location: {
          contains: location,
          mode: 'insensitive'
        },
        isActive: true 
      }
    })
  }

  async createFloodCharacteristics(data: any) {
    return await prisma.floodCharacteristics.create({
      data
    })
  }

  async getFloodRiskByLevel(riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME') {
    return await prisma.floodCharacteristics.findMany({
      where: { 
        floodRiskLevel: riskLevel,
        isActive: true 
      }
    })
  }
}
```

## 🌤 **Weather Data Integration Options**

### **Free Weather APIs (for development)**
```bash
# OpenWeatherMap (Free tier: 1000 calls/day)
OPENWEATHER_API_KEY=your_api_key

# WeatherAPI (Free tier: 1M calls/month)
WEATHER_API_KEY=your_api_key

# AccuWeather (Limited free tier)
ACCUWEATHER_API_KEY=your_api_key
```

## 🐳 **Deployment & Infrastructure**

### **Option 1: Docker Setup with Prisma**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate
COPY dist ./dist
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
```

### **Docker Compose with Database**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/stream_ai_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgis/postgis:14-3.2
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=stream_ai_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 📊 **Database Recommendations**

### **For Flood Forecasting System**
```bash
# PostgreSQL with PostGIS (HIGHLY RECOMMENDED)
DATABASE_URL="postgresql://user:password@localhost:5432/stream_ai_db"

# Why PostgreSQL with Prisma?
✅ Excellent geospatial support (PostGIS)
✅ JSONB for flexible weather data storage
✅ Time-series data handling
✅ Advanced indexing for location queries
✅ Prisma has excellent PostgreSQL support
✅ Native JSON field types in Prisma
```

## 🚀 **Quick Start Commands**

```bash
# 1. Initialize backend project
mkdir stream-ai-backend && cd stream-ai-backend
npm init -y

# 2. Install core dependencies
npm install express typescript ts-node nodemon cors helmet morgan
npm install @types/express @types/node @types/cors

# 3. Install Prisma and database
npm install prisma @prisma/client
npm install pg @types/pg  # for PostgreSQL

# 4. Install additional tools
npm install redis axios turf @tensorflow/tfjs-node
npm install @types/redis @types/turf

# 5. Setup Prisma
npx prisma init
# Edit prisma/schema.prisma with the schema above
npx prisma generate
npx prisma migrate dev --name init

# 6. Setup project structure
mkdir -p src/{controllers,services,routes,middleware,utils,types,config}
```

## 🔧 **Environment Configuration**

```env
# .env file
NODE_ENV=development
PORT=3001

# Database (PostgreSQL recommended)
DATABASE_URL="postgresql://postgres:password@localhost:5432/stream_ai_db"

# Redis
REDIS_URL=redis://localhost:6379

# Weather APIs
OPENWEATHER_API_KEY=your_openweather_key
WEATHER_API_KEY=your_weather_api_key

# Mapbox (you're already using this)
MAPBOX_TOKEN=your_mapbox_token

# JWT & Security
JWT_SECRET=your_super_secret_key
BCRYPT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost:5173
```

## 📝 **Prisma Seed File**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed flood characteristics
  await prisma.floodCharacteristics.createMany({
    data: [
      {
        location: 'Naga City - Abella',
        latitude: 13.623196,
        longitude: 123.182617,
        maximumDepth: 2.5,
        maximumDepthUncertainty: 0.3,
        peakVelocity: 1.8,
        peakVelocityUncertainty: 0.2,
        arrivalTime: 2.5,
        arrivalTimeUncertainty: 0.5,
        inundationArea: 0.8,
        inundationAreaUncertainty: 0.1,
        floodRiskLevel: 'MODERATE',
        expertAnalysis: 'Moderate flood risk due to proximity to river',
        recommendedActions: 'Monitor water levels, prepare evacuation routes'
      }
      // Add more seed data...
    ]
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```json
// package.json - add seed script
{
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

This Prisma-based setup will give you a robust, type-safe backend with excellent developer experience and powerful database features for your AI forecasting system!

Would you like me to help you set up any specific part of this Prisma backend structure?

Similar code found with 1 license type