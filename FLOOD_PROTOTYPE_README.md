# Enhanced Flood Characteristics Prototype

This enhanced prototype implements flood characteristics data management and display based on your model results with citizen-friendly features:

- **Maximum depth**: 1.8 meters (give or take 0.4 meters)
- **Peak velocity**: 3.2 meters per second (give or take 0.8 meters per second)
- **Arrival time**: 2h 6m (give or take 18 minutes)
- **Inundation area**: 12.5 square kilometers (give or take 3.2 square kilometers)

## 🚀 Quick Start

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

## 📊 Enhanced Features

### Backend
- **FloodCharacteristics Model**: Stores flood data with uncertainty values
- **REST API Routes**: Full CRUD operations for flood data
- **Risk Assessment**: Automatic risk level calculation
- **Data Seeding**: Populates all 27 barangays with realistic flood data
- **City-wide Data**: Aggregated views for entire Naga City

### Frontend
- **Flood Characteristics Component**: Displays flood data in citizen-friendly format
- **Countdown Timer**: Real-time arrival time countdown (e.g., "2h 6m")
- **Citizen-Friendly Notation**: No more confusing ± symbols
- **City-wide View**: General alerts, forecasts, and flood data for whole Naga City
- **Enhanced Map**: Focus on individual barangays with Naga City boundaries
- **Risk Visualization**: Color-coded risk levels and assessment
- **Expert Analysis**: Contextual information for each location
- **Recommended Actions**: Specific guidance based on flood risk

## 🗃️ Database Schema

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

## 🔗 API Endpoints

- `GET /flood/` - Get all flood characteristics
- `GET /flood/location/:location` - Get data for specific location
- `GET /flood/summary/:location` - Get formatted summary for frontend
- `GET /flood/risk/:riskLevel` - Get areas by risk level
- `GET /flood/high-risk` - Get high-risk areas
- `POST /flood/` - Create new flood data
- `PUT /flood/:id` - Update flood data
- `DELETE /flood/:id` - Delete flood data

## 🎯 Risk Assessment Logic

The system automatically calculates flood risk based on:

1. **Water Depth**: >2m (extreme), 1.5-2m (high), 1-1.5m (moderate), <1m (low)
2. **Water Velocity**: >3m/s (extreme), 2-3m/s (high), 1-2m/s (moderate), <1m/s (low)
3. **Inundation Area**: >10km² (high), 5-10km² (moderate), <5km² (low)

## 🎨 Frontend Integration

The flood characteristics component is integrated into the existing Home page without changing the design. It displays:

- **Flood Parameters**: Maximum depth, peak velocity, arrival time, inundation area
- **Uncertainty Values**: ± ranges for each parameter
- **Risk Assessment**: Visual risk score and contributing factors
- **Expert Analysis**: Contextual information about flood conditions
- **Recommended Actions**: Specific guidance based on risk level

## 🧪 Testing

Run the enhanced test script to verify all new features:

```bash
cd backend
node testEnhancedPrototype.js
```

This will:
1. Seed the database with flood data
2. Test all database queries
3. Verify API endpoint logic
4. Test countdown timer formatting
5. Test citizen-friendly notation
6. Test city-wide data aggregation
7. Display sample data for frontend testing

## 🎨 New UI Features

### Citizen-Friendly Display
- **Plain Language**: "1.8 meters (give or take 0.4 meters)" instead of "1.8 ± 0.4 m"
- **Countdown Timers**: "2h 6m" instead of "2.1 hours"
- **Clear Units**: "meters per second" instead of "m/s"
- **Square kilometers** instead of "km²"

### City-wide View
- **Overview Tab**: Key metrics for entire Naga City
- **Alerts Tab**: All active weather alerts
- **Flood Tab**: Risk assessment by area
- **Forecast Tab**: Weather data (placeholder)

### Enhanced Map
- **Barangay Focus**: Click to focus on specific areas
- **Naga City Boundaries**: Constrained to city limits using GeoJSON
- **Risk-based Colors**: Visual risk level indicators
- **Interactive Selection**: Dropdown to select any barangay
- **Real-time Data**: Live flood characteristics display

### Map Features
- **Boundary Constraints**: Map cannot pan outside Naga City
- **Barangay Selection**: Dropdown with risk levels
- **Focus Function**: Smooth zoom to selected area
- **Reset View**: Return to city-wide view
- **Popups**: Click areas for detailed information

## 📝 Notes

- Data is seeded with realistic variations around your model results
- All 27 barangays in Naga City are included
- Risk levels are automatically calculated based on flood parameters
- The frontend displays data in a citizen-friendly format
- Expert analysis and recommendations are generated based on risk levels
- Map is constrained to Naga City boundaries using the provided GeoJSON
- All sensors and data points stay within the city scope
