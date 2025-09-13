# Enhanced Flood Characteristics Prototype

This enhanced prototype implements flood characteristics data management and display based on your model results with citizen-friendly features:

- **Maximum depth**: 1.8 meters (give or take 0.4 meters)
- **Peak velocity**: 3.2 meters per second (give or take 0.8 meters per second)
- **Arrival time**: 2h 6m (give or take 18 minutes)
- **Inundation area**: 12.5 square kilometers (give or take 3.2 square kilometers)

## Quick Start

### 1. Setup Backend
```bash
cd backend
npm install
node testEnhancedPrototype.js  # Test and seed data
npm start  # Start server on port 3001
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev  # Start on port 5173
```

### 3. View Prototype
Open http://localhost:5173 and select different locations from the dropdown to see flood characteristics.

## Database Schema

```sql
CREATE TABLE flood_characteristics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location VARCHAR(255) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  maximum_depth FLOAT NOT NULL,
  maximum_depth_uncertainty FLOAT NOT NULL,
  peak_velocity FLOAT NOT NULL,
  peak_velocity_uncertainty FLOAT NOT NULL,
  arrival_time FLOAT NOT NULL,
  arrival_time_uncertainty FLOAT NOT NULL,
  inundation_area FLOAT NOT NULL,
  inundation_area_uncertainty FLOAT NOT NULL,
  flood_risk_level ENUM('low', 'moderate', 'high', 'extreme'),
  model_version VARCHAR(50) DEFAULT 'v1.0',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  expert_analysis TEXT,
  recommended_actions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

- `GET /flood/` - Get all flood characteristics
- `GET /flood/location/:location` - Get data for specific location
- `GET /flood/summary/:location` - Get formatted summary for frontend
- `GET /flood/risk/:riskLevel` - Get areas by risk level
- `GET /flood/high-risk` - Get high-risk areas
- `POST /flood/` - Create new flood data
- `PUT /flood/:id` - Update flood data
- `DELETE /flood/:id` - Delete flood data

## Risk Assessment Logic

1. **Water Depth**: >2m (extreme), 1.5-2m (high), 1-1.5m (moderate), <1m (low)
2. **Water Velocity**: >3m/s (extreme), 2-3m/s (high), 1-2m/s (moderate), <1m/s (low)
3. **Inundation Area**: >10km² (high), 5-10km² (moderate), <5km² (low)

## Frontend Integration

- **Flood Parameters**: Maximum depth, peak velocity, arrival time, inundation area
- **Uncertainty Values**: ± ranges for each parameter
- **Risk Assessment**: Visual risk score and contributing factors
- **Expert Analysis**: Contextual information about flood conditions
- **Recommended Actions**: Specific guidance based on risk level

## Testing

```bash
cd backend
node testEnhancedPrototype.js
```

