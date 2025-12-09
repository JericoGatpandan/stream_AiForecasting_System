# Technical Documentation: Stream AI Forecasting System

## 1. Executive Summary

### 1.1 Project Overview

The Stream AI Forecasting System represents a comprehensive full-stack web application designed to provide real-time watershed monitoring and flood prediction capabilities. The system is specifically engineered to monitor river and stream systems, collect sensor data, analyze environmental conditions, and generate AI-powered flood forecasts for disaster preparedness and emergency response coordination.

The application serves as a critical infrastructure component for flood risk assessment and management, targeting governmental agencies, disaster response teams, and community stakeholders in flood-prone regions. The system demonstrates core capabilities including sensor data collection, environmental monitoring, predictive analytics, and geographic visualization of flood risk assessments.

### 1.2 Technology Stack Summary

The system implements a modern three-tier architecture comprising:

**Frontend Layer**: React 19 with TypeScript, Material-UI component library, Redux Toolkit for state management, Mapbox GL for geospatial visualization, Recharts for data analytics visualization, and Vite as the build tool.

**Backend Layer**: Node.js runtime with Express.js framework version 5.1.0, Sequelize ORM version 6.37.7 for database abstraction, RESTful API architecture, Helmet.js for security headers, Express Rate Limit for API protection, and comprehensive middleware stack.

**Database Layer**: MySQL 8.0 relational database management system with normalized schema design, comprehensive indexing strategy, and foreign key constraints for referential integrity.

**Containerization**: Docker Compose for orchestration of database services in development environments.

**Deployment Infrastructure**: Railway.app for backend hosting, Vercel for frontend deployment, and environment-specific configuration management.

## 2. System Architecture and Containerization

### 2.1 Directory Structure

The project follows a monorepo structure with clear separation of concerns:

```
stream_AiForecasting_System/
├── README.md
├── Database/
│   └── docker-compose.yml
├── backend/
│   ├── .env
│   ├── .env.development
│   ├── .env.production
│   ├── .gitignore
│   ├── .sequelizerc
│   ├── healthcheck.js
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/
│       │   ├── config.js
│       │   └── env.js
│       ├── controllers/
│       ├── data/
│       │   ├── barangays.json
│       │   ├── sensors.json
│       │   └── environment/
│       │       ├── Abella.csv
│       │       ├── Bagumbayan_Norte.csv
│       │       ├── Bagumbayan_Sur.csv
│       │       └── [27 CSV files total]
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── migrations/
│       │   ├── 20250101000000-create-barangays.js
│       │   ├── 20250101001000-create-sensors.js
│       │   ├── 20250101002000-create-sensor-readings.js
│       │   ├── 20250101003000-create-environmental-data.js
│       │   ├── 20250101004000-create-model-runs.js
│       │   └── 20250101005000-create-predictions.js
│       ├── models/
│       │   ├── index.js
│       │   ├── barangay.js
│       │   ├── environmentalData.js
│       │   ├── modelRun.js
│       │   ├── prediction.js
│       │   ├── sensor.js
│       │   └── sensorReading.js
│       ├── routes/
│       │   ├── barangays.js
│       │   ├── environmentalData.js
│       │   ├── floodCharacteristics.js
│       │   ├── predictions.js
│       │   └── sensors.js
│       ├── seeders/
│       │   ├── 20250102000000-seed-barangays.js
│       │   ├── 20250102001000-seed-sensors.js
│       │   └── 20250102002000-seed-environmental-data.js
│       └── utils/
│           └── logger.js
└── frontend/
    ├── .env.development
    ├── .env.production
    ├── .eslintrc.json
    ├── .gitignore
    ├── combine-geojson.js
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── README.md
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vercel.json
    ├── vite.config.ts
    ├── public/
    │   └── data/
    │       ├── barangays-combined.geojson
    │       ├── barangays.json
    │       ├── sensors.json
    │       └── barangays/
    │           └── [27 GeoJSON files]
    └── src/
        ├── App.tsx
        ├── expanded-theme.ts
        ├── index.css
        ├── main.tsx
        ├── theme.ts
        ├── vite-env.d.ts
        ├── components/
        │   ├── AlertBanner.tsx
        │   ├── BarangaySelector.tsx
        │   ├── DataCard.tsx
        │   ├── ErrorBoundary.tsx
        │   ├── FlexBetween.tsx
        │   ├── FloodRiskPanel.tsx
        │   ├── FloodSimulation.tsx
        │   ├── LoadingSkeleton.tsx
        │   ├── MapDataOverlay.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── RiskLegend.tsx
        │   ├── SensorDashboard.tsx
        │   ├── SensorDetailView.tsx
        │   ├── SensorReadingsChart.tsx
        │   └── TimeControl.tsx
        ├── contexts/
        │   ├── FloodMonitoringContext.tsx
        │   └── ThemeContext.tsx
        ├── data/
        │   ├── floodSimulationData.ts
        │   └── mockData.ts
        ├── design/
        │   ├── colors.ts
        │   └── tokens.ts
        ├── scenes/
        │   ├── alerts/
        │   │   └── Alerts.tsx
        │   ├── analytics/
        │   │   └── Analytics.tsx
        │   ├── auth/
        │   │   ├── Login.tsx
        │   │   └── Register.tsx
        │   ├── forecast/
        │   │   └── Forecast.tsx
        │   ├── home/
        │   │   └── Home.tsx
        │   ├── landing/
        │   │   └── Landing.tsx
        │   ├── map/
        │   │   ├── AlertsPanel.tsx
        │   │   ├── Map.tsx
        │   │   ├── weatherData.ts
        │   │   ├── WeatherDataDisplay.tsx
        │   │   └── WeatherLayerControls.tsx
        │   └── sidebar/
        │       └── index.tsx
        ├── state/
        │   ├── api.ts
        │   ├── store.ts
        │   └── types.ts
        └── utils/
            └── spacing.ts
```

### 2.2 High-Level Architecture

The system implements a containerized microservices architecture with clear separation between development and production environments.

#### 2.2.1 Docker Compose Configuration

The Docker Compose configuration defines the database service for local development:

**Service Definition:**
- Service Name: `db`
- Base Image: `mysql:latest`
- Container Name: `stream_db`

**Port Mapping:**
- Host Port: 3306
- Container Port: 3306
- Protocol: TCP

**Environment Variables:**
- `MYSQL_ROOT_PASSWORD`: password
- `MYSQL_DATABASE`: weather_app

**Volume Configuration:**
- Named Volume: `db_data`
- Mount Point: `/var/lib/mysql`
- Purpose: Persistent data storage across container lifecycle

**Network Configuration:**
The service operates on the default Docker Compose network, enabling DNS-based service discovery between containers when additional services are added to the composition.

#### 2.2.2 Application Architecture Pattern

The system follows the Model-View-Controller (MVC) architectural pattern with additional layers:

**Presentation Layer (Frontend):**
- Component-based UI architecture using React functional components
- Redux store for centralized state management
- RTK Query for API communication and caching
- Context providers for cross-cutting concerns (theme, monitoring)

**API Gateway Layer (Backend Routes):**
- RESTful endpoint definitions
- Request validation and sanitization
- Response formatting and error handling
- Rate limiting and security middleware

**Business Logic Layer (Backend Controllers/Services):**
- Data processing and transformation
- Business rule enforcement
- Integration with external services
- Algorithm execution for predictions

**Data Access Layer (ORM Models):**
- Sequelize model definitions
- Database abstraction
- Query optimization
- Relationship management

**Data Persistence Layer (Database):**
- MySQL relational database
- Normalized schema design
- Transaction management
- Index optimization

### 2.3 Component Interaction

The system components interact through well-defined interfaces and protocols:

#### 2.3.1 Frontend-to-Backend Communication

**Protocol:** HTTP/HTTPS over RESTful API
**Data Format:** JSON
**Authentication:** Token-based (infrastructure prepared for JWT implementation)

The frontend application, served from Vercel's CDN, initiates HTTP requests to the backend API hosted on Railway.app. The communication flow follows this pattern:

1. User interaction triggers action in React component
2. Redux Toolkit Query initiates API call through RTK Query hook
3. Request passes through fetchBaseQuery with configured base URL
4. Backend receives request at Express.js route handler
5. Request passes through middleware stack (CORS, rate limiting, security headers)
6. Route handler invokes appropriate controller logic
7. Controller interacts with Sequelize models to query database
8. Database returns result set to ORM
9. ORM transforms data to JavaScript objects
10. Controller formats response and returns to route handler
11. Response serialized as JSON and sent to frontend
12. RTK Query caches response and updates Redux store
13. React component re-renders with updated data

**Base URL Configuration:**
- Development: `http://localhost:5500`
- Production: `https://streamaiforecastingsystem-production.up.railway.app`

**CORS Policy:**
The backend implements origin-based CORS validation, accepting requests from configured frontend origins. Credentials are enabled to support future authentication requirements.

#### 2.3.2 Backend-to-Database Communication

**Protocol:** MySQL Wire Protocol
**ORM:** Sequelize version 6.37.7
**Connection Management:** Connection pooling with configurable limits

The backend establishes database connectivity through Sequelize ORM, which provides:

1. Connection pool management for optimal resource utilization
2. Automatic query generation from JavaScript method calls
3. Transaction support for atomic operations
4. Migration management for schema evolution
5. Relationship traversal through model associations

**Connection Configuration:**

Development environment connects using discrete credentials:
- Host: localhost
- Port: 3306
- Database: weather_app
- User: root
- Authentication: Password-based

Production environment supports two connection modes:
- Single connection URL (preferred for Railway MySQL)
- Discrete credential configuration (fallback)

**Database Operations Flow:**

1. Application invokes Sequelize model method
2. Sequelize generates SQL query based on method parameters
3. Query submitted to MySQL server through connection pool
4. MySQL executes query with appropriate isolation level
5. Result set returned to Sequelize
6. Sequelize transforms results to model instances
7. Model instances returned to application layer

## 3. Database Design and Data Model

### 3.1 Schema Overview

The database implements a normalized relational schema using MySQL 8.0 as the storage engine. The design follows Third Normal Form (3NF) principles to minimize data redundancy while maintaining query performance through strategic indexing.

**Database Engine:** MySQL 8.0
**Character Set:** utf8mb4 (default)
**Collation:** utf8mb4_unicode_ci
**Transaction Isolation:** READ COMMITTED (default)
**Storage Engine:** InnoDB (supports ACID transactions and foreign keys)

**Normalization Strategy:**
The schema eliminates transitive dependencies and partial dependencies, ensuring each non-key attribute depends solely on the primary key. Denormalization is applied selectively for JSON fields storing complex, non-relational data structures (hyperparameters, metrics, GeoJSON boundaries).

### 3.2 Entity-Relationship Description

The database schema consists of six primary entities with well-defined relationships:

#### 3.2.1 Barangays Entity

Represents geographic administrative units (barangays) within the monitored region. Each barangay serves as a spatial container for sensors, environmental data, and flood predictions.

**Key Attributes:**
- Unique identifier (auto-incrementing primary key)
- Administrative code (unique constraint)
- Geographic name
- Centroid coordinates (latitude, longitude)
- Optional GeoJSON boundary for precise geographic representation

**Relationships:**
- One barangay contains zero or many sensors (one-to-many)
- One barangay generates zero or many environmental data records (one-to-many)
- One barangay receives zero or many flood predictions (one-to-many)

#### 3.2.2 Sensors Entity

Represents physical monitoring devices deployed across barangays to collect real-time environmental measurements.

**Key Attributes:**
- Unique identifier
- Foreign key to parent barangay
- Sensor designation name
- Sensor type classification (water level, rainfall, flow rate, weather, other)
- Measurement unit
- Geographic coordinates
- Operational status (active, inactive, maintenance)

**Relationships:**
- Many sensors belong to one barangay (many-to-one)
- One sensor produces zero or many sensor readings (one-to-many)

**Referential Integrity:**
- Cascading updates on barangay modification
- Restricted deletion (prevents barangay deletion with associated sensors)

#### 3.2.3 Sensor Readings Entity

Stores time-series measurement data captured by deployed sensors.

**Key Attributes:**
- Unique identifier (BIGINT for high-volume time-series data)
- Foreign key to parent sensor
- Timestamp of measurement
- Numeric measurement value
- Quality flag enumeration (ok, missing, estimated, error)

**Relationships:**
- Many readings belong to one sensor (many-to-one)

**Referential Integrity:**
- Cascading updates and deletions with parent sensor

**Indexing Strategy:**
- Composite index on (sensor_id, timestamp) for efficient time-range queries
- Single index on timestamp for cross-sensor temporal analysis

#### 3.2.4 Environmental Data Entity

Captures comprehensive environmental conditions for each barangay at discrete time intervals.

**Key Attributes:**
- Unique identifier (BIGINT for scalability)
- Foreign key to barangay
- Timestamp of observation
- Rainfall measurement (millimeters)
- Temperature (Celsius)
- Humidity (percentage)
- Wind speed (meters per second)

**Relationships:**
- Many environmental records belong to one barangay (many-to-one)

**Referential Integrity:**
- Cascading updates on barangay modification
- Restricted deletion (preserves historical environmental data)

**Indexing Strategy:**
- Single index on timestamp for temporal queries

#### 3.2.5 Model Runs Entity

Tracks execution metadata for AI/ML forecasting model runs, enabling model versioning and performance tracking.

**Key Attributes:**
- Unique identifier
- Model name and version identifiers
- Execution start and completion timestamps
- Execution status enumeration (success, failed, partial)
- JSON-encoded hyperparameters
- JSON-encoded performance metrics

**Relationships:**
- One model run generates zero or many predictions (one-to-many)

**Indexing Strategy:**
- Composite index on (model_name, model_version)
- Single index on status for monitoring queries

#### 3.2.6 Predictions Entity

Stores flood forecast predictions generated by AI models for specific barangays and time horizons.

**Key Attributes:**
- Unique identifier (BIGINT for scalability)
- Foreign key to barangay
- Optional foreign key to model run
- Forecast target timestamp
- Prediction generation timestamp
- Predicted water level (meters)
- Risk level classification (none, low, moderate, high, critical)
- Confidence score
- Validation status and metadata
- Free-text notes

**Relationships:**
- Many predictions belong to one barangay (many-to-one)
- Many predictions optionally belong to one model run (many-to-one)

**Referential Integrity:**
- Cascading updates on barangay modification
- Restricted deletion for barangay (preserves prediction history)
- Set NULL on model run deletion (preserves predictions independent of run)

**Indexing Strategy:**
- Composite index on (barangay_id, forecast_for) for location-time queries
- Single index on predicted_risk_level for filtering by severity
- Single index on model_run_id for model performance analysis

### 3.3 Data Dictionary

#### Table: barangays

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INTEGER UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique barangay identifier |
| code | VARCHAR(32) | NOT NULL, UNIQUE | Administrative or LGU code |
| name | VARCHAR(40) | NOT NULL | Barangay name |
| latitude | DECIMAL(10,8) | NOT NULL | Centroid latitude coordinate |
| longitude | DECIMAL(11,8) | NOT NULL | Centroid longitude coordinate |
| boundary_geojson | JSON | NULL | GeoJSON polygon boundary |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

#### Table: sensors

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INTEGER UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique sensor identifier |
| barangay_id | INTEGER UNSIGNED | NOT NULL, FOREIGN KEY | Reference to parent barangay |
| name | VARCHAR(30) | NOT NULL | Sensor designation |
| type | ENUM | NOT NULL | Sensor type classification |
| unit | VARCHAR(32) | NOT NULL | Measurement unit |
| latitude | DECIMAL(10,8) | NOT NULL | Sensor latitude coordinate |
| longitude | DECIMAL(11,8) | NOT NULL | Sensor longitude coordinate |
| status | ENUM | NOT NULL, DEFAULT 'active' | Operational status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

**Indexes:** barangay_id, type, status

#### Table: sensor_readings

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique reading identifier |
| sensor_id | INTEGER UNSIGNED | NOT NULL, FOREIGN KEY | Reference to parent sensor |
| timestamp | DATETIME | NOT NULL | Measurement timestamp |
| value | FLOAT | NOT NULL | Measured value |
| quality_flag | ENUM | NOT NULL, DEFAULT 'ok' | Data quality indicator |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

**Indexes:** (sensor_id, timestamp), timestamp

#### Table: environmental_data

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique record identifier |
| barangay_id | INTEGER UNSIGNED | NOT NULL, FOREIGN KEY | Reference to barangay |
| timestamp | DATETIME | NOT NULL | Observation timestamp |
| rainfall_mm | FLOAT | NULL | Rainfall measurement |
| temperature_c | FLOAT | NULL | Temperature measurement |
| humidity_percent | FLOAT | NULL | Humidity percentage |
| wind_speed_ms | FLOAT | NULL | Wind speed measurement |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

**Indexes:** timestamp

#### Table: model_runs

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INTEGER UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique run identifier |
| model_name | VARCHAR(40) | NOT NULL | Model identifier |
| model_version | VARCHAR(30) | NOT NULL | Model version string |
| run_started_at | DATETIME | NOT NULL | Execution start time |
| run_finished_at | DATETIME | NULL | Execution completion time |
| status | ENUM | NOT NULL, DEFAULT 'success' | Execution outcome |
| hyperparams | JSON | NULL | Model hyperparameters |
| metrics | JSON | NULL | Performance metrics |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

**Indexes:** (model_name, model_version), status

#### Table: predictions

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique prediction identifier |
| barangay_id | INTEGER UNSIGNED | NOT NULL, FOREIGN KEY | Reference to barangay |
| model_run_id | INTEGER UNSIGNED | NULL, FOREIGN KEY | Reference to model run |
| forecast_for | DATETIME | NOT NULL | Target forecast timestamp |
| generated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Prediction generation time |
| predicted_water_level_m | FLOAT | NULL | Forecasted water level |
| predicted_risk_level | ENUM | NOT NULL, DEFAULT 'none' | Risk classification |
| confidence | FLOAT | NULL | Prediction confidence score |
| validated | BOOLEAN | NOT NULL, DEFAULT FALSE | Validation completion flag |
| validated_by | INTEGER UNSIGNED | NULL | Validator user reference |
| validation_status | ENUM | NOT NULL, DEFAULT 'pending' | Validation outcome |
| notes | TEXT | NULL | Additional context |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

**Indexes:** (barangay_id, forecast_for), predicted_risk_level, model_run_id

## 4. Backend Component Analysis

### 4.1 API Architecture

The backend implements a RESTful API architecture adhering to standard HTTP semantics and REST constraints. The API provides stateless communication between client and server with resource-oriented endpoint design.

**API Style:** REST (Representational State Transfer)
**Protocol:** HTTP/1.1 and HTTP/2
**Data Interchange Format:** JSON (application/json)
**API Version:** Implicit (no version prefix in current implementation)

#### 4.1.1 API Endpoint Catalog

**Barangays Resource Endpoints:**

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | /barangays | Retrieve list of all active barangays | Array of strings |
| GET | /barangays/:barangayName | Retrieve detailed information for specific barangay | Barangay object |

**Sensors Resource Endpoints:**

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | /sensors | Retrieve paginated list of sensors with optional filters | SensorsResponse object |
| GET | /sensors/:sensorId | Retrieve detailed sensor information with recent readings | Sensor object |
| GET | /sensors/:sensorId/readings | Retrieve time-series readings for specific sensor | ReadingsResponse object |

**Query Parameters for /sensors:**
- status: Filter by operational status (active, inactive, maintenance)
- sensor_type: Filter by sensor type classification
- barangay_id: Filter by parent barangay
- include_readings: Include recent readings (boolean)
- limit: Maximum results per page (default 50, max 500)
- offset: Pagination offset (default 0)

**Query Parameters for /sensors/:sensorId/readings:**
- start_time: ISO 8601 timestamp for range start
- end_time: ISO 8601 timestamp for range end
- limit: Maximum results (default 100, max 1000)
- offset: Pagination offset
- aggregation: Aggregation method (raw, hourly, daily)

**Environmental Data Resource Endpoints:**

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | /environmental/:barangayName | Retrieve environmental time-series data for barangay | Array of EnvironmentalData objects |

**Flood Characteristics Resource Endpoints:**

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | /flood | Retrieve all flood characteristics with optional filters | Array of FloodCharacteristics objects |
| GET | /flood/location/:location | Retrieve flood characteristics for specific location | FloodCharacteristics object |

**Query Parameters for /flood:**
- location: Filter by location name
- risk_level: Filter by risk classification
- active_only: Return only active predictions (boolean)

**Predictions Resource Endpoints:**

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | /predictions | Retrieve paginated flood predictions with filters | PredictionsResponse object |
| GET | /predictions/current | Retrieve current active predictions for all barangays | CurrentPredictionsResponse object |
| GET | /predictions/barangay/:barangayId | Retrieve prediction history for specific barangay | BarangayPredictionsResponse object |

**Query Parameters for /predictions:**
- barangay_id: Filter by barangay identifier
- risk_level: Filter by risk classification
- model_version: Filter by model version
- forecast_active: Show only future predictions (boolean)
- limit: Maximum results (default 20)
- offset: Pagination offset

**Query Parameters for /predictions/current:**
- risk_threshold: Minimum risk level to include

**Query Parameters for /predictions/barangay/:barangayId:**
- include_history: Include historical predictions (boolean)
- history_days: Number of days of history (default 7)
- include_environmental_data: Include correlated environmental data (boolean)

**System Health Endpoint:**

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | /health | Retrieve system health status and metrics | HealthResponse object |

### 4.2 Core Logic

The backend business logic is organized into route handlers and model associations. The following table describes the responsibilities of core components:

| Component | Type | Responsibilities |
|-----------|------|-----------------|
| src/index.js | Application Entry Point | Express application initialization, middleware configuration, route registration, database synchronization, server lifecycle management |
| src/config/env.js | Configuration Manager | Environment variable loading, configuration validation, environment-specific settings, database connection parameters |
| src/config/config.js | Sequelize Configuration | Database dialect configuration, connection pool settings, SSL options, environment-specific database credentials |
| src/models/index.js | ORM Initialization | Sequelize instance creation, model loading and registration, association establishment, connection string parsing |
| src/models/barangay.js | Barangay Model | Barangay entity definition, schema validation, relationship configuration with sensors, environmental data, and predictions |
| src/models/sensor.js | Sensor Model | Sensor entity definition, type enumeration, relationship configuration with barangay and readings |
| src/models/sensorReading.js | Sensor Reading Model | Time-series reading entity, quality flag enumeration, relationship with parent sensor |
| src/models/environmentalData.js | Environmental Data Model | Environmental observation entity, multi-parameter storage, relationship with barangay |
| src/models/modelRun.js | Model Run Model | ML model execution metadata, hyperparameter storage, metrics tracking, relationship with predictions |
| src/models/prediction.js | Prediction Model | Flood prediction entity, risk level classification, validation workflow, relationships with barangay and model run |
| src/routes/barangays.js | Barangay Route Handler | Barangay list retrieval, fallback to database if configuration unavailable, name-based lookup |
| src/routes/sensors.js | Sensor Route Handler | Sensor listing with filters, pagination implementation, detailed sensor retrieval, time-series reading queries |
| src/routes/environmentalData.js | Environmental Route Handler | Barangay name resolution, environmental time-series retrieval, chronological ordering |
| src/routes/floodCharacteristics.js | Flood Characteristics Handler | Flood data retrieval with filters, location-based queries, development sample data generation |
| src/routes/predictions.js | Predictions Route Handler | Prediction listing and filtering, current prediction aggregation, barangay-specific history, risk summary calculation |
| src/middleware/errorHandler.js | Error Handling Middleware | Centralized error processing, status code management, stack trace inclusion for development |
| src/utils/logger.js | Logging Utility | Structured logging implementation, log level configuration, development request logging |

#### 4.2.1 Key Business Logic Patterns

**Pagination Implementation:**
Route handlers implement limit-offset pagination with configurable maximum result sizes to prevent resource exhaustion. Response objects include pagination metadata indicating whether additional pages exist.

**Data Transformation:**
Backend routes perform data transformation between database representations and API contract formats, handling field name conversions and nested object construction.

**Fallback Mechanisms:**
Critical endpoints implement fallback strategies, attempting primary data sources before degrading gracefully to alternative sources or sample data.

**Aggregation Logic:**
Prediction endpoints implement aggregation logic to calculate summary statistics including risk distributions, average confidence scores, and active forecast counts.

**Temporal Filtering:**
Time-series endpoints support flexible temporal filtering through ISO 8601 timestamp parameters, enabling precise time-range queries.

## 5. Frontend Component Analysis

### 5.1 Structure

The frontend implements a component-based architecture using React 19 with TypeScript, following modern functional component patterns with hooks for state management and side effects.

**Component Hierarchy:**

```
App (Root)
├── CustomThemeProvider (Context)
│   └── FloodMonitoringProvider (Context)
│       ├── AppBar (Navigation)
│       │   ├── Logo & Title
│       │   └── Action Buttons (Alerts, Menu)
│       └── Main Content Area
│           └── Map (Primary Scene)
│               ├── MapControlPanel
│               │   ├── Style Toggles
│               │   ├── 3D Control
│               │   └── WeatherLayerControls
│               ├── FloatingTools
│               │   ├── Location Reset
│               │   ├── Bounds Fit
│               │   └── Timeline Toggle
│               ├── AlertsPanel (Conditional)
│               ├── FloodRiskPanel (Conditional)
│               ├── RiskLegend
│               ├── TimeControl (Conditional)
│               ├── FloodSimulation (Conditional)
│               └── WeatherDataDisplay (Conditional)
```

**Component Categories:**

**Scene Components:** High-level page components representing distinct application views (Map, Alerts, Analytics, Forecast, Home, Landing, Authentication scenes). Located in src/scenes/ directory.

**Feature Components:** Specialized components implementing specific functionality domains (FloodRiskPanel, FloodSimulation, SensorDashboard, TimeControl). Located in src/components/ directory.

**UI Components:** Reusable presentational components providing consistent interface elements (AlertBanner, DataCard, LoadingSkeleton, RiskLegend). Located in src/components/ directory.

**Context Providers:** React Context components managing cross-cutting state (FloodMonitoringContext, ThemeContext). Located in src/contexts/ directory.

**Utility Components:** Infrastructure components providing error boundaries and route protection (ErrorBoundary, ProtectedRoute). Located in src/components/ directory.

### 5.2 State Management

The application implements a hybrid state management strategy combining Redux Toolkit for server state and React Context for UI state.

#### 5.2.1 Redux Store Architecture

**Store Configuration:**
The Redux store is configured using Redux Toolkit's configureStore with RTK Query integration for API state management.

**Reducer Composition:**
- api.reducer: Manages server state, cache, and API request lifecycle

**Middleware Stack:**
- RTK Query middleware: Handles API request orchestration, caching, and invalidation
- Default middleware: Includes Redux Thunk for async actions, serializability checks, and immutability checks

**RTK Query API Definition:**
The api.ts file defines a comprehensive API slice using createApi with the following configuration:

- Base URL: Configurable via environment variable (VITE_BASE_URL)
- Base Query: fetchBaseQuery with JSON content-type headers
- Reducer Path: 'main'
- Tag Types: EnvironmentalData, FloodCharacteristics, FloodRiskAssessment, Sensor, SensorReading, Barangay

**Endpoint Definitions:**
The API slice defines typed query endpoints for all backend resources:

- getBarangays: Fetches barangay list
- getBarangayById: Fetches single barangay details
- getSensors: Fetches filtered sensor list with pagination
- getSensorById: Fetches detailed sensor with readings
- getSensorReadings: Fetches sensor time-series data
- getEnvironmentalData: Fetches environmental observations
- getFloodCharacteristics: Fetches flood analysis data
- getPredictions: Fetches flood predictions with filters
- getCurrentPredictions: Fetches active predictions summary

**Caching Strategy:**
RTK Query implements automatic request deduplication and cache management with tag-based invalidation. Cached data persists for the default duration unless explicitly invalidated through tag relationships.

**Data Transformation:**
API endpoints implement transformResponse functions to normalize backend data structures into frontend-compatible formats, handling field name conversions and type coercions.

#### 5.2.2 React Context State

**FloodMonitoringContext:**
Manages flood monitoring application state including:
- Selected location tracking
- Alert collection and management
- Report collection and management
- Location-based data aggregation
- Navigation coordination

The context provides methods for adding alerts and reports, retrieving location-specific data, and coordinating map navigation.

**ThemeContext:**
Manages application theme state (light/dark mode) with persistence to local storage and Material-UI theme provider integration.

#### 5.2.3 Local Component State

Components maintain local state using useState hooks for UI-specific concerns:
- Map style selection (satellite, terrain, dark, light)
- 3D visualization toggle
- Panel visibility flags
- Form input values
- Animation playback state
- Time simulation controls

### 5.3 Interface Analysis

The user interface implements a single-page application architecture with the map view as the primary interaction surface.

#### 5.3.1 Layout Architecture

**Application Shell:**
The application employs a full-viewport layout with the following structure:
- Fixed AppBar at top edge (60px height approximately)
- Full-height main content area below AppBar
- Overlaid panels and controls positioned absolutely within main area

**Responsive Design:**
The interface implements responsive breakpoints using Material-UI's breakpoint system, adjusting layout density and control positioning for mobile, tablet, and desktop viewports.

#### 5.3.2 Primary Interface Components

**Navigation Bar:**
The AppBar component provides persistent navigation with:
- Application branding (logo and title)
- Current view indicator
- Alert notification toggle
- Menu access button

**Map Visualization:**
The Map component serves as the primary interface, providing:
- Interactive Mapbox GL base map with style selection
- GeoJSON layer rendering for barangay boundaries
- Marker placement for sensor locations
- Popup information windows for point-of-interest details
- 3D terrain visualization capability
- Pitch and bearing controls for navigation

**Map Control Panel:**
Positioned in the upper-left quadrant, the control panel provides:
- Map style toggle buttons (satellite, terrain, dark, light)
- 3D visualization toggle
- Weather layer activation controls
- Visual hierarchy through Material-UI Paper elevation

**Floating Tool Panel:**
Positioned in the upper-right quadrant, floating tools include:
- Location reset button (return to default viewport)
- Fit bounds button (zoom to data extent)
- Timeline toggle (activate simulation mode)

**Alerts Panel:**
Sliding panel from the right edge displays:
- Active flood alerts with severity indicators
- Alert metadata (location, timestamp, type)
- Alert details and recommended actions
- Clickable alerts for map navigation

**Flood Risk Panel:**
Contextual panel displaying:
- Location-specific risk assessment
- Current risk level with color coding
- Risk factors breakdown
- Time-series risk trend
- Recommended actions

**Risk Legend:**
Persistent legend component showing:
- Risk level color mapping
- Severity scale from none to critical
- Compact visual reference

**Time Control:**
Simulation control panel providing:
- Timeline scrubber for temporal navigation
- Play/pause animation controls
- Time jump buttons (±30 minutes, ±1 hour, ±6 hours)
- Current simulation time display

**Weather Data Display:**
Active when weather layer is selected, displays:
- Current weather conditions
- Selected sensor data
- Real-time measurements
- Data quality indicators

#### 5.3.3 User Flow

**Primary User Journey:**

1. User accesses application landing page
2. Application loads default map view centered on monitored region
3. Barangay boundaries render as colored polygons indicating current risk levels
4. User interacts with map through panning, zooming, or clicking features
5. Clicking barangay feature displays popup with summary information
6. User activates flood risk panel to view detailed assessment
7. User toggles alerts panel to review active warnings
8. User selects specific alert to navigate map to affected location
9. User activates weather layer to view sensor overlay
10. User clicks sensor marker to view real-time readings
11. User activates timeline mode to view flood simulation
12. User controls simulation playback and temporal navigation
13. User exports or shares relevant data (feature prepared for future implementation)

**Interaction Patterns:**

The interface implements standard map interaction patterns:
- Click-and-drag for panning
- Scroll wheel for zoom
- Double-click for zoom-in
- Shift-drag for box zoom
- Right-click-drag for pitch and bearing adjustment (3D mode)
- Touch gestures for mobile interaction (pinch-zoom, two-finger rotation)

## 6. Algorithmic Logic

The system implements several algorithmic patterns for data processing, aggregation, and presentation.

### 6.1 Flood Risk Aggregation Algorithm

The prediction endpoints implement risk aggregation logic to compute summary statistics across multiple predictions:

**Algorithm Description:**
1. Retrieve all current predictions for specified scope (all barangays or filtered subset)
2. Filter predictions to active forecasts (forecast_for timestamp is in future)
3. Initialize risk level counters (low, moderate, high, severe, extreme)
4. Iterate through prediction set:
   - Extract predicted_risk_level for each prediction
   - Increment corresponding counter
5. Compute derived metrics:
   - Total prediction count
   - High-risk count (high, severe, extreme categories)
   - Average confidence score across all predictions
   - Active forecast count
6. Determine highest risk category based on maximum counter value
7. Construct response object with summary statistics

**Computational Complexity:** O(n) where n is the number of predictions in the result set

**Data Structure:** Hash map for risk level counting with O(1) insertion and lookup

### 6.2 Time-Series Data Retrieval Optimization

Sensor reading endpoints implement optimized time-range queries using database indexes:

**Algorithm Description:**
1. Parse start_time and end_time query parameters to Date objects
2. Construct WHERE clause with timestamp range constraint using Sequelize operators
3. Apply limit and offset for pagination
4. Execute query with composite index on (sensor_id, timestamp)
5. Database optimizer uses index scan rather than full table scan
6. Return ordered result set in descending chronological order

**Query Optimization Technique:** Index-organized table scan leveraging composite index

**Performance Characteristics:** O(log n + k) where n is total readings and k is result set size

### 6.3 GeoJSON Boundary Processing

The frontend implements GeoJSON processing for rendering barangay boundaries:

**Algorithm Description:**
1. Fetch combined GeoJSON file containing all barangay boundaries
2. Parse JSON structure into JavaScript object
3. Extract features array from FeatureCollection
4. Iterate through features to create Mapbox source
5. Add GeoJSON source to map instance
6. Add fill layer with data-driven styling based on risk_level property
7. Add line layer for boundary outlines
8. Implement hover and click event handlers using feature-state

**Rendering Optimization:** Mapbox GL performs client-side tessellation and WebGL rendering of polygon geometries

### 6.4 Pagination Pattern

Multiple endpoints implement offset-based pagination with the following algorithm:

**Algorithm Description:**
1. Parse limit and offset query parameters with validation
2. Apply maximum limit constraint (varies by endpoint: 50-1000)
3. Construct Sequelize query with limit and offset clauses
4. Execute count query in parallel to determine total records
5. Compute has_more flag: (total > offset + limit)
6. Return response object containing:
   - Data array with requested page
   - Total count
   - Pagination metadata (limit, offset, has_more)

**Advantages:** Stateless pagination, works with standard HTTP caching, simple implementation

**Limitations:** Performance degrades for large offset values, not suitable for real-time data with frequent inserts

### 6.5 Data Transformation Logic

The frontend API layer implements data transformation to normalize backend responses:

**Algorithm Description:**
1. Receive backend response with snake_case field names
2. Define field mapping object specifying transformations
3. Iterate through response object properties
4. For each property, check if mapping exists
5. If mapping exists, rename property to camelCase equivalent
6. Recursively process nested objects and arrays
7. Return transformed object conforming to frontend type definitions

**Pattern:** Object mapping pattern with recursive traversal

**Type Safety:** TypeScript type guards ensure transformation correctness

## 7. Security and Configuration

### 7.1 Security Measures

The application implements multiple security layers to protect against common web application vulnerabilities:

#### 7.1.1 HTTP Security Headers

The backend employs Helmet.js middleware (version 7.1.0) to set security-related HTTP headers:

**Implemented Headers:**
- Content-Security-Policy: Restricts resource loading to prevent XSS attacks
- X-DNS-Prefetch-Control: Controls browser DNS prefetching
- X-Frame-Options: Prevents clickjacking by controlling iframe embedding
- X-Content-Type-Options: Prevents MIME-type sniffing
- Strict-Transport-Security: Enforces HTTPS connections
- X-Permitted-Cross-Domain-Policies: Controls cross-domain policy files

**Custom Configuration:**
Cross-Origin Resource Policy is set to "cross-origin" to enable frontend-backend communication across different domains.

#### 7.1.2 Rate Limiting

The application implements rate limiting using express-rate-limit (version 7.4.0):

**Global Rate Limiter Configuration:**
- Window Duration: 15 minutes (900,000 milliseconds)
- Maximum Requests: 1000 requests per window per IP address
- Standard Headers: Enabled (RateLimit-* headers in response)
- Legacy Headers: Disabled (X-RateLimit-* headers omitted)

**Purpose:** Prevents denial-of-service attacks and API abuse

**Behavior:** Returns HTTP 429 (Too Many Requests) when limit exceeded

#### 7.1.3 CORS Policy

The backend implements origin-based CORS validation:

**Configuration:**
- Allowed Origins: Configurable via CLIENT_ORIGIN or FRONTEND_ORIGIN environment variable
- Credentials: Enabled (supports future cookie-based authentication)
- Methods: All standard HTTP methods allowed
- Headers: All requested headers allowed

**Validation Logic:**
1. Extract origin from request headers
2. If origin is undefined (same-origin request), allow
3. If origin matches configured allowed origin, allow
4. Otherwise, reject request

**Security Benefit:** Prevents unauthorized domains from accessing API resources

#### 7.1.4 Request Body Size Limiting

Express JSON parser configured with size limit:
- Maximum Body Size: 512 kilobytes
- Purpose: Prevents memory exhaustion from oversized payloads

#### 7.1.5 Input Validation

While explicit validation middleware is not extensively implemented in the current codebase, the system relies on:
- Sequelize model validation for data type enforcement
- Type coercion in query parameter processing
- SQL injection prevention through parameterized queries (Sequelize ORM)

#### 7.1.6 Error Handling Security

The error handler middleware implements environment-aware stack trace exposure:
- Development Environment: Full stack traces included in error responses
- Production Environment: Stack traces omitted, only error messages exposed

**Security Benefit:** Prevents information leakage that could aid attackers

#### 7.1.7 Database Security

**Connection Security:**
- SSL/TLS support for encrypted database connections (configurable via DB_SSL environment variable)
- Connection string parsing prevents credential exposure in code
- Separate credentials for development and production environments

**SQL Injection Prevention:**
All database queries are executed through Sequelize ORM, which automatically parameterizes queries and escapes user input.

### 7.2 Configuration Management

The application implements environment-based configuration with clear separation between development and production settings.

#### 7.2.1 Backend Environment Variables

**Development Environment (.env.development):**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=weather_app
PORT=5500
NODE_ENV=development
```

**Production Environment (.env.production):**
```
DB_HOST=${MySQL.MYSQLHOST}
DB_PORT=${MySQL.MYSQLPORT}
DB_NAME=${MySQL.MYSQLDATABASE}
DB_USER=${MySQL.MYSQLUSER}
DB_PASSWORD=${MySQL.MYSQLPASSWORD}
NODE_ENV=production
DB_SSL=false
LOG_LEVEL=info
```

**Configuration Variables:**

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| DB_HOST | Database server hostname | localhost | Yes (dev) |
| DB_PORT | Database server port | 3306 | No |
| DB_NAME | Database schema name | weather_app | Yes |
| DB_USER | Database authentication username | root | Yes (dev) |
| DB_PASSWORD | Database authentication password | - | Yes |
| DB_URL | Full database connection URL | - | No (Yes for Railway) |
| DB_SSL | Enable SSL for database connection | false | No |
| PORT | HTTP server listening port | 5500 | Yes |
| NODE_ENV | Execution environment | development | Yes |
| LOG_LEVEL | Logging verbosity | debug (dev), info (prod) | No |
| CLIENT_ORIGIN | Allowed CORS origin | http://localhost:5173 | No |

**Configuration Loading Strategy:**
1. Determine NODE_ENV from process environment
2. Attempt to load .env.${NODE_ENV} file
3. Fallback to .env file if environment-specific file not found
4. Parse environment variables using dotenv package
5. Validate required variables
6. Export configuration object

#### 7.2.2 Frontend Environment Variables

**Development Environment (.env.development):**
```
VITE_BASE_URL=http://localhost:5500
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEV_TOOLS=true
VITE_MAPBOX_ACCESS_TOKEN=<token>
```

**Production Environment (.env.production):**
```
VITE_BASE_URL=https://streamaiforecastingsystem-production.up.railway.app
VITE_API_TIMEOUT=15000
VITE_ENABLE_DEV_TOOLS=false
VITE_MAPBOX_ACCESS_TOKEN=<token>
```

**Configuration Variables:**

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| VITE_BASE_URL | Backend API base URL | http://localhost:5500 | Yes |
| VITE_API_TIMEOUT | Request timeout (milliseconds) | 10000 | No |
| VITE_ENABLE_DEV_TOOLS | Enable debug logging | false | No |
| VITE_MAPBOX_ACCESS_TOKEN | Mapbox GL API token | - | Yes |

**Build-Time Injection:**
Vite injects environment variables prefixed with VITE_ at build time, replacing import.meta.env references with literal values. This ensures configuration values are embedded in the production bundle.

#### 7.2.3 Database Configuration

Sequelize configuration is managed through src/config/config.js with environment-specific settings:

**Development Configuration:**
- Dialect: mysql
- Dialect Module: mysql2 (explicitly required)
- Discrete credentials (host, username, password, database)

**Production Configuration:**
- Preferred: Single connection URL (DB_URL environment variable)
- Fallback: Discrete credentials
- SSL support: Configurable via dialectOptions
- Connection pooling: Default Sequelize settings

**Configuration Selection:**
The models/index.js file implements intelligent configuration selection:
1. Check if use_env_variable is specified in config
2. If specified, read connection URL from corresponding environment variable
3. Create Sequelize instance with URL and minimal options
4. Otherwise, create Sequelize instance with discrete credentials

## 8. Setup and Installation

### 8.1 Prerequisites

The following software and services are required to deploy and operate the Stream AI Forecasting System:

**Required Software:**
- Node.js: Version 16.x or higher (LTS recommended)
- npm: Version 7.x or higher (bundled with Node.js)
- MySQL: Version 8.0 or higher
- Git: Version 2.x or higher for source control

**Optional Software:**
- Docker: Version 20.x or higher (for containerized database)
- Docker Compose: Version 2.x or higher (for orchestration)

**External Services:**
- Mapbox Account: Required for map visualization (free tier sufficient)
- Deployment Platform: Railway.app account for backend hosting (optional)
- Deployment Platform: Vercel account for frontend hosting (optional)

**System Requirements:**
- Operating System: Linux, macOS, or Windows with WSL2
- Memory: Minimum 4GB RAM (8GB recommended for development)
- Storage: Minimum 2GB available disk space
- Network: Internet connectivity for package installation and API access

### 8.2 Deployment Instructions

#### 8.2.1 Local Development Setup

**Step 1: Repository Acquisition**

Clone the repository from the source control system:

```bash
git clone https://github.com/JericoGatpandan/stream_AiForecasting_System.git
cd stream_AiForecasting_System
```

**Step 2: Database Initialization**

For Docker-based database deployment:

```bash
cd Database
docker-compose up -d
```

This command performs the following operations:
- Pulls the MySQL latest image from Docker Hub
- Creates a container named stream_db
- Exposes MySQL on port 3306
- Initializes database named weather_app
- Creates persistent volume for data storage

For native MySQL installation:

```bash
mysql -u root -p
CREATE DATABASE weather_app;
EXIT;
```

**Step 3: Backend Configuration**

Navigate to the backend directory and install dependencies:

```bash
cd ../backend
npm install
```

Create environment configuration file:

```bash
cp .env.development .env
```

Edit .env file with appropriate database credentials:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=weather_app
PORT=5500
NODE_ENV=development
```

**Step 4: Database Schema Migration**

Execute Sequelize migrations to create database schema:

```bash
npx sequelize-cli db:migrate
```

This command executes all migration files in chronological order, creating the following tables:
1. barangays
2. sensors
3. sensor_readings
4. environmental_data
5. model_runs
6. predictions

**Step 5: Database Seeding**

Populate database with initial data:

```bash
npx sequelize-cli db:seed:all
```

Alternatively, use custom seeding scripts:

```bash
npm run seed:mvp
npm run seed:flood
npm run seed:weather
```

Or execute all seeding operations:

```bash
npm run seed:all
```

**Step 6: Backend Server Startup**

Start the development server with automatic restart on file changes:

```bash
npm run dev
```

The server will listen on http://localhost:5500

Verify server health:

```bash
curl http://localhost:5500/health
```

Expected response:
```json
{
  "status": "ok",
  "env": "development",
  "uptime_seconds": 10,
  "timestamp": "2025-01-25T10:30:00.000Z",
  "db": "up",
  "version": "1.0.0"
}
```

**Step 7: Frontend Configuration**

Open a new terminal and navigate to frontend directory:

```bash
cd ../frontend
npm install
```

Create environment configuration file:

```bash
cp .env.development .env
```

Edit .env file with Mapbox access token:

```bash
VITE_BASE_URL=http://localhost:5500
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEV_TOOLS=true
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

To obtain Mapbox access token:
1. Create account at https://account.mapbox.com/
2. Navigate to Access Tokens section
3. Copy default public token or create new token
4. Paste token into .env file

**Step 8: Frontend Application Startup**

Start the development server:

```bash
npm run dev
```

The application will be accessible at http://localhost:5173

Vite will display the local and network URLs in the terminal.

**Step 9: Verification**

Access the application in a web browser:
- Navigate to http://localhost:5173
- Map should load with barangay boundaries
- Verify API connectivity by checking browser console for errors
- Test sensor data retrieval by clicking map features

#### 8.2.2 Production Deployment

**Backend Deployment (Railway.app):**

1. Create Railway account and new project
2. Connect GitHub repository
3. Configure environment variables in Railway dashboard:
   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (provided by Railway MySQL service)
   - NODE_ENV=production
   - LOG_LEVEL=info
   - CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
4. Add MySQL service to project
5. Link MySQL service to backend service
6. Railway automatically detects Node.js application and deploys
7. Execute database migrations via Railway CLI or deployment script
8. Verify deployment using provided Railway URL

**Frontend Deployment (Vercel):**

1. Create Vercel account and new project
2. Import GitHub repository
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
4. Configure environment variables in Vercel dashboard:
   - VITE_BASE_URL=https://your-backend.railway.app
   - VITE_API_TIMEOUT=15000
   - VITE_ENABLE_DEV_TOOLS=false
   - VITE_MAPBOX_ACCESS_TOKEN=your_token
5. Deploy application
6. Verify deployment using provided Vercel URL
7. Configure custom domain (optional)

**Post-Deployment Verification:**

1. Test health endpoint: https://your-backend.railway.app/health
2. Verify frontend loads: https://your-frontend.vercel.app
3. Check CORS configuration by testing API calls from frontend
4. Verify database connectivity and data retrieval
5. Test all major user flows
6. Monitor error logs in deployment platform dashboards

#### 8.2.3 Docker Compose Full Stack Deployment

For deployment using Docker Compose orchestration (requires additional Dockerfiles):

**Step 1: Create Backend Dockerfile**

Create backend/Dockerfile:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5500
CMD ["node", "src/index.js"]
```

**Step 2: Create Frontend Dockerfile**

Create frontend/Dockerfile:

```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Step 3: Create Comprehensive Docker Compose Configuration**

Update Database/docker-compose.yml:

```yaml
version: '3.8'

services:
  db:
    image: mysql:latest
    container_name: stream_db
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=weather_app
    volumes:
      - db_data:/var/lib/mysql
    networks:
      - stream_network

  backend:
    build: ../backend
    container_name: stream_backend
    ports:
      - "5500:5500"
    environment:
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=weather_app
      - PORT=5500
      - NODE_ENV=production
    depends_on:
      - db
    networks:
      - stream_network

  frontend:
    build: ../frontend
    container_name: stream_frontend
    ports:
      - "80:80"
    environment:
      - VITE_BASE_URL=http://localhost:5500
    depends_on:
      - backend
    networks:
      - stream_network

volumes:
  db_data:

networks:
  stream_network:
    driver: bridge
```

**Step 4: Deploy Full Stack**

```bash
cd Database
docker-compose up -d
```

This command orchestrates the following operations:
1. Creates isolated bridge network for inter-service communication
2. Builds backend image from Dockerfile
3. Builds frontend image from multi-stage Dockerfile
4. Starts database container
5. Starts backend container with database dependency
6. Starts frontend container with backend dependency
7. Exposes services on specified ports

**Step 5: Initialize Database Schema**

Execute migrations within backend container:

```bash
docker-compose exec backend npx sequelize-cli db:migrate
docker-compose exec backend npx sequelize-cli db:seed:all
```

**Step 6: Verify Deployment**

Access services:
- Frontend: http://localhost
- Backend API: http://localhost:5500
- Database: localhost:3306

**Container Management Commands:**

View container logs:
```bash
docker-compose logs -f [service_name]
```

Restart services:
```bash
docker-compose restart
```

Stop services:
```bash
docker-compose down
```

Stop services and remove volumes:
```bash
docker-compose down -v
```

## 9. Conclusion

### 9.1 System Integrity Assessment

The Stream AI Forecasting System demonstrates a comprehensive implementation of modern web application architecture principles with appropriate separation of concerns across frontend, backend, and database layers. The system exhibits the following strengths:

**Architectural Soundness:**
The three-tier architecture with clear boundaries between presentation, business logic, and data persistence layers enables independent scaling, maintenance, and evolution of each component. The RESTful API design provides a stable contract between frontend and backend, facilitating parallel development and potential future integration with additional clients.

**Data Model Robustness:**
The normalized relational database schema implements proper referential integrity constraints, strategic indexing for query performance, and appropriate use of enumeration types for controlled vocabularies. The migration-based schema evolution strategy enables versioned database changes with rollback capabilities.

**Technology Selection:**
The technology stack represents mature, well-supported frameworks and libraries with active communities and extensive documentation. React 19, Node.js with Express, and MySQL constitute proven technologies for enterprise-scale applications. The use of TypeScript in the frontend provides type safety and improved developer experience.

**Security Implementation:**
The application implements fundamental security measures including rate limiting, CORS validation, security headers via Helmet.js, and parameterized database queries through ORM abstraction. Environment-based configuration management prevents credential exposure in source control.

**Scalability Considerations:**
The stateless API design enables horizontal scaling of backend services. Database indexing strategies support efficient querying as data volume grows. The use of content delivery networks (Vercel) for frontend hosting ensures global availability with low latency.

### 9.2 Areas for Enhancement

**Authentication and Authorization:**
The current implementation lacks user authentication and role-based access control. Production deployment requires implementation of JWT-based authentication, user management, and permission-based endpoint protection.

**Input Validation:**
While database-level validation exists through Sequelize, explicit request validation middleware using libraries such as Joi (already installed) or express-validator would strengthen input sanitization and provide better error messages.

**API Versioning:**
The API lacks explicit versioning in endpoint paths. Implementing version prefixes (e.g., /api/v1/) would enable backward-compatible API evolution.

**Monitoring and Observability:**
Production deployment requires integration of application performance monitoring, error tracking (e.g., Sentry), and structured logging with log aggregation services.

**Automated Testing:**
The codebase would benefit from comprehensive unit tests, integration tests, and end-to-end tests using frameworks such as Jest, Supertest, and Cypress.

**Real-Time Capabilities:**
The current implementation relies on polling for data updates. WebSocket integration would enable real-time sensor data streaming and instant alert notifications.

**Machine Learning Integration:**
While the database schema supports model runs and predictions, actual machine learning model integration for flood forecasting remains to be implemented. This would involve training time-series forecasting models on historical sensor and environmental data.

### 9.3 Deployment Status

The system is currently deployed and operational at the following URLs:

**Production Frontend:** https://stream-ai-forecasting-system-otk4pgd72.vercel.app/

**Production Backend:** https://streamaiforecastingsystem-production.up.railway.app/

The deployment demonstrates successful integration of all system components with external hosting providers, validating the containerization and configuration strategies documented herein.

### 9.4 Final Remarks

This technical documentation provides a comprehensive analysis of the Stream AI Forecasting System architecture, implementation, and deployment procedures. The system represents a solid foundation for flood monitoring and prediction capabilities, with clear pathways for enhancement and production hardening. The formal documentation style employed herein ensures suitability for academic submission, technical review, and future system maintenance.

---

**Document Version:** 1.0  
**Date of Preparation:** December 9, 2025  
**System Version:** 1.0.0  
**Documentation Author:** Jerico Gatpandan | SCIS Development Team
