require('dotenv').config();
const db = require('./models');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Seeding Script for Stream AI Forecasting System MVP
 * 
 * This script populates the database with:
 * - Barangay data from client/data/barangays.json
 * - Sensor installations
 * - Historical sensor readings
 * - Sample flood predictions for demonstration
 */

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding for MVP...');

    // Sync database models
    await db.sequelize.sync({ force: process.env.NODE_ENV !== 'production' });
    console.log('✅ Database synced successfully');

    // Seed barangays
    await seedBarangays();
    
    // Seed sensors
    await seedSensors();
    
    // Seed historical environmental data
    await seedEnvironmentalData();
    
    // Seed sensor readings
    await seedSensorReadings();
    
    // Seed flood predictions
    await seedFloodPredictions();

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

async function seedBarangays() {
  console.log('📍 Seeding barangays...');
  
  try {
    // Resolve barangay data JSON path with fallbacks
    const barangayCandidates = [
      process.env.BARANGAYS_JSON_PATH,
      path.join(__dirname, 'data/barangays.json'),
      path.join(process.cwd(), 'backend/data/barangays.json'),
      // path.join(__dirname, '../client/data/barangays.json'),
      // path.join(process.cwd(), 'client/data/barangays.json'),
      // path.join(process.cwd(), '../client/data/barangays.json')
    ].filter(Boolean);

    const barangayFilePath = barangayCandidates.find(p => fs.existsSync(p));
    if (!barangayFilePath) {
      throw new Error(`Barangay data file not found. Tried: \n- ${barangayCandidates.join('\n- ')}`);
    }

    const barangayData = JSON.parse(fs.readFileSync(barangayFilePath, 'utf8'));
    
    const barangaysToSeed = barangayData.barangays.map(barangay => ({
      id: barangay.id,
      name: barangay.name,
      center_lat: barangay.center[1], // latitude
      center_lng: barangay.center[0], // longitude
      zoom_level: barangay.zoom_level || 15,
      status: barangay.status || 'active',
      geojson_file: barangay.file,
      // Add watershed monitoring specific data
      flood_risk_level: getFloodRiskLevel(barangay.name),
      watershed_zone: getWatershedZone(barangay.name),
      population: getEstimatedPopulation(barangay.name),
      area_km2: getEstimatedArea(barangay.name)
    }));

    await db.Barangay.bulkCreate(barangaysToSeed);
    console.log(`✅ Successfully seeded ${barangaysToSeed.length} barangays`);
    
  } catch (error) {
    console.error('❌ Error seeding barangays:', error);
    throw error;
  }
}

async function seedSensors() {
  console.log('🔧 Seeding sensors...');
  
  try {
    // Try to read existing sensor data with fallbacks
    const sensorCandidates = [
      process.env.SENSORS_JSON_PATH,
      path.join(__dirname, 'data/sensors.json'),
      path.join(process.cwd(), 'backend/data/sensors.json'),
      // path.join(__dirname, '../client/data/sensors.json'),
      // path.join(process.cwd(), 'client/data/sensors.json'),
      // path.join(process.cwd(), '../client/data/sensors.json')
    ].filter(Boolean);

    let existingSensors = [];
    const sensorFilePath = sensorCandidates.find(p => fs.existsSync(p));
    if (sensorFilePath) {
      const sensorData = JSON.parse(fs.readFileSync(sensorFilePath, 'utf8'));
      existingSensors = sensorData.sensors || [];
    }
    
    // Get all barangays for sensor placement
    const barangays = await db.Barangay.findAll();
    
    const sensorsToSeed = [];
    
    // Add existing sensors from client data
    existingSensors.forEach(sensor => {
      const barangay = barangays.find(b => b.name.toLowerCase() === sensor.barangay.toLowerCase());
      if (barangay) {
        sensorsToSeed.push({
          id: sensor.id,
          name: sensor.name,
          barangay_id: barangay.id,
          sensor_type: 'multi_parameter',
          latitude: sensor.lat,
          longitude: sensor.lng,
          status: sensor.status || 'active',
          installation_date: new Date(),
          watershed_zone: getWatershedZone(sensor.barangay),
          river_section: getRiverSection(sensor.barangay),
          battery_level: 85 + Math.random() * 10, // 85-95%
          transmission_interval: 300 // 5 minutes
        });
      }
    });
    
    // Add additional sensors for barangays without existing sensors
    barangays.forEach((barangay, index) => {
      const existingSensor = sensorsToSeed.find(s => s.barangay_id === barangay.id);
      if (!existingSensor) {
        // Add a primary monitoring sensor
        sensorsToSeed.push({
          id: `${barangay.id}-01`,
          name: `${barangay.name} Primary Monitor`,
          barangay_id: barangay.id,
          sensor_type: 'multi_parameter',
          latitude: parseFloat(barangay.center_lat) + (Math.random() - 0.5) * 0.01,
          longitude: parseFloat(barangay.center_lng) + (Math.random() - 0.5) * 0.01,
          status: Math.random() > 0.1 ? 'active' : 'maintenance', // 90% active
          installation_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
          watershed_zone: getWatershedZone(barangay.name),
          river_section: getRiverSection(barangay.name),
          battery_level: 70 + Math.random() * 25, // 70-95%
          transmission_interval: 300
        });
        
        // Add additional sensors for high-risk areas
        if (barangay.flood_risk_level === 'high' || barangay.flood_risk_level === 'very_high') {
          sensorsToSeed.push({
            id: `${barangay.id}-02`,
            name: `${barangay.name} Secondary Monitor`,
            barangay_id: barangay.id,
            sensor_type: 'water_level',
            latitude: parseFloat(barangay.center_lat) + (Math.random() - 0.5) * 0.02,
            longitude: parseFloat(barangay.center_lng) + (Math.random() - 0.5) * 0.02,
            status: 'active',
            installation_date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date within last 6 months
            watershed_zone: getWatershedZone(barangay.name),
            river_section: getRiverSection(barangay.name),
            battery_level: 80 + Math.random() * 15, // 80-95%
            transmission_interval: 180 // 3 minutes for critical areas
          });
        }
      }
    });

    await db.Sensor.bulkCreate(sensorsToSeed);
    console.log(`✅ Successfully seeded ${sensorsToSeed.length} sensors`);
    
  } catch (error) {
    console.error('❌ Error seeding sensors:', error);
    throw error;
  }
}

async function seedSensorReadings() {
  console.log('📊 Seeding sensor readings...');
  
  try {
    const sensors = await db.Sensor.findAll({ where: { status: 'active' } });
    const readingsToSeed = [];
    
    // Generate readings for the last 24 hours
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    sensors.forEach(sensor => {
      // Generate readings every 5 minutes for the last 24 hours
      for (let time = new Date(startTime); time <= now; time.setMinutes(time.getMinutes() + 5)) {
        const reading = generateRealisticSensorReading(sensor, new Date(time));
        readingsToSeed.push(reading);
      }
    });

    // Insert readings in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < readingsToSeed.length; i += batchSize) {
      const batch = readingsToSeed.slice(i, i + batchSize);
      await db.SensorReading.bulkCreate(batch);
    }
    
    console.log(`✅ Successfully seeded ${readingsToSeed.length} sensor readings`);
    
  } catch (error) {
    console.error('❌ Error seeding sensor readings:', error);
    throw error;
  }
}

async function seedEnvironmentalData() {
  console.log('🌦️ Seeding environmental data...');
  
  try {
    const barangays = await db.Barangay.findAll();
    const environmentalData = [];
    
    // Generate data for the last 7 days
    const now = new Date();
    const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    barangays.forEach(barangay => {
      // Generate data every hour for the last 7 days
      for (let time = new Date(startTime); time <= now; time.setHours(time.getHours() + 1)) {
        environmentalData.push({
          barangay_id: barangay.id,
          barangay: barangay.name, // Keep for backward compatibility
          timestamp: new Date(time),
          rainfall_mm: generateRealisticRainfall(),
          water_level_m: generateRealisticWaterLevel(barangay.flood_risk_level),
          flow_velocity_ms: 0.5 + Math.random() * 2.5, // 0.5-3.0 m/s
          wind_speed_mps: 2 + Math.random() * 15, // 2-17 m/s
          wind_direction: getRandomWindDirection(),
          temperature_c: 24 + Math.random() * 8, // 24-32°C
          humidity_percent: 60 + Math.random() * 35, // 60-95%
          atmospheric_pressure: 1005 + Math.random() * 20, // 1005-1025 hPa
          soil_moisture: 30 + Math.random() * 50, // 30-80%
          data_source: 'sensor',
          quality_flag: Math.random() > 0.05 ? 'good' : 'questionable' // 95% good quality
        });
      }
    });

    // Insert in batches
    const batchSize = 500;
    for (let i = 0; i < environmentalData.length; i += batchSize) {
      const batch = environmentalData.slice(i, i + batchSize);
      await db.EnvironmentalData.bulkCreate(batch);
    }
    
    console.log(`✅ Successfully seeded ${environmentalData.length} environmental data points`);
    
  } catch (error) {
    console.error('❌ Error seeding environmental data:', error);
    throw error;
  }
}

async function seedFloodPredictions() {
  console.log('🌊 Seeding flood predictions...');
  
  try {
    const barangays = await db.Barangay.findAll();
    const predictions = [];
    
    const now = new Date();
    
    barangays.forEach(barangay => {
      // Create current prediction
      const currentPrediction = {
        barangay_id: barangay.id,
        prediction_timestamp: now,
        forecast_start: now,
        forecast_end: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
        flood_probability: getFloodProbability(barangay.flood_risk_level),
        risk_level: getPredictionRiskLevel(barangay.flood_risk_level),
        predicted_water_level: generatePredictedWaterLevel(barangay.flood_risk_level),
        predicted_rainfall: 5 + Math.random() * 20, // 5-25mm
        confidence_score: 0.7 + Math.random() * 0.25, // 0.7-0.95
        model_version: '1.0.0-demo',
        input_features: {
          historical_rainfall: 12.5,
          current_water_level: 1.8,
          soil_saturation: 0.65,
          weather_pattern: 'monsoon_approach'
        },
        prediction_notes: `Automated prediction for ${barangay.name} watershed monitoring zone`,
        is_alert_sent: false,
        validation_status: 'pending'
      };
      
      predictions.push(currentPrediction);
      
      // Create some historical predictions for demonstration
      for (let i = 1; i <= 5; i++) {
        const historicalTime = new Date(now.getTime() - i * 6 * 60 * 60 * 1000); // 6 hours intervals
        predictions.push({
          barangay_id: barangay.id,
          prediction_timestamp: historicalTime,
          forecast_start: historicalTime,
          forecast_end: new Date(historicalTime.getTime() + 12 * 60 * 60 * 1000),
          flood_probability: getFloodProbability(barangay.flood_risk_level),
          risk_level: getPredictionRiskLevel(barangay.flood_risk_level),
          predicted_water_level: generatePredictedWaterLevel(barangay.flood_risk_level),
          predicted_rainfall: Math.random() * 15,
          confidence_score: 0.6 + Math.random() * 0.3,
          model_version: '1.0.0-demo',
          input_features: {
            historical_rainfall: Math.random() * 20,
            current_water_level: 1 + Math.random() * 2,
            soil_saturation: 0.4 + Math.random() * 0.4
          },
          is_alert_sent: Math.random() > 0.7,
          validation_status: ['validated', 'pending', 'false_positive'][Math.floor(Math.random() * 3)]
        });
      }
    });

    await db.FloodPrediction.bulkCreate(predictions);
    console.log(`✅ Successfully seeded ${predictions.length} flood predictions`);
    
  } catch (error) {
    console.error('❌ Error seeding flood predictions:', error);
    throw error;
  }
}

// Helper functions
function getFloodRiskLevel(barangayName) {
  const highRiskAreas = ['Abella', 'Liboton', 'Sabang', 'Mabolo'];
  const moderateRiskAreas = ['Calauag', 'Dinaga', 'Santa Cruz', 'Tabuco'];
  
  if (highRiskAreas.some(area => barangayName.includes(area))) {
    return Math.random() > 0.5 ? 'high' : 'very_high';
  } else if (moderateRiskAreas.some(area => barangayName.includes(area))) {
    return 'moderate';
  } else {
    return Math.random() > 0.3 ? 'moderate' : 'low';
  }
}

function getWatershedZone(barangayName) {
  const zones = ['Naga River Basin', 'Bicol River Watershed', 'Coastal Plains', 'Upland Catchment'];
  return zones[Math.floor(Math.random() * zones.length)];
}

function getRiverSection(barangayName) {
  const sections = ['Upper reach', 'Middle reach', 'Lower reach', 'Confluence', 'Tributary'];
  return sections[Math.floor(Math.random() * sections.length)];
}

function getEstimatedPopulation(barangayName) {
  return Math.floor(1000 + Math.random() * 15000); // 1,000 - 16,000 people
}

function getEstimatedArea(barangayName) {
  return parseFloat((0.5 + Math.random() * 4.5).toFixed(2)); // 0.5 - 5.0 km²
}

function generateRealisticSensorReading(sensor, timestamp) {
  const baseWaterLevel = 1.5;
  const timeVariation = Math.sin(timestamp.getHours() / 24 * 2 * Math.PI) * 0.3; // Daily cycle
  
  return {
    sensor_id: sensor.id,
    timestamp: timestamp,
    water_level: Math.max(0, baseWaterLevel + timeVariation + (Math.random() - 0.5) * 0.5),
    flow_velocity: 0.8 + Math.random() * 1.5,
    flow_rate: 2.5 + Math.random() * 3.5,
    water_temperature: 25 + Math.random() * 5,
    turbidity: 10 + Math.random() * 40,
    ph_level: 6.5 + Math.random() * 1.5,
    dissolved_oxygen: 5 + Math.random() * 4,
    rainfall: Math.random() > 0.7 ? Math.random() * 5 : 0, // 30% chance of rain
    air_temperature: 26 + Math.random() * 6,
    humidity: 70 + Math.random() * 25,
    wind_speed: 3 + Math.random() * 10,
    wind_direction: getRandomWindDirection(),
    atmospheric_pressure: 1010 + Math.random() * 15,
    visibility: 10 + Math.random() * 15,
    uv_index: Math.max(0, 3 + Math.random() * 8),
    battery_voltage: 11.8 + Math.random() * 0.8,
    signal_strength: -60 + Math.random() * 20,
    data_quality: Math.random() > 0.05 ? 'good' : 'fair',
    is_validated: Math.random() > 0.2 // 80% validated
  };
}

function generateRealisticRainfall() {
  // Simulate tropical rainfall patterns
  if (Math.random() > 0.7) { // 30% chance of rain
    return parseFloat((Math.random() * 25).toFixed(1)); // 0-25mm
  }
  return 0;
}

function generateRealisticWaterLevel(riskLevel) {
  const baseLevels = {
    'low': 1.0,
    'moderate': 1.5,
    'high': 2.0,
    'very_high': 2.5
  };
  
  const baseLevel = baseLevels[riskLevel] || 1.5;
  return parseFloat((baseLevel + (Math.random() - 0.5) * 1.0).toFixed(2));
}

function getRandomWindDirection() {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function getFloodProbability(riskLevel) {
  const probabilities = {
    'low': 0.05 + Math.random() * 0.15,
    'moderate': 0.15 + Math.random() * 0.25,
    'high': 0.4 + Math.random() * 0.3,
    'very_high': 0.6 + Math.random() * 0.3
  };
  
  return parseFloat((probabilities[riskLevel] || 0.2).toFixed(3));
}

function getPredictionRiskLevel(barangayRiskLevel) {
  const riskMapping = {
    'low': Math.random() > 0.8 ? 'moderate' : 'low',
    'moderate': Math.random() > 0.6 ? 'high' : 'moderate',
    'high': Math.random() > 0.4 ? 'severe' : 'high',
    'very_high': Math.random() > 0.3 ? 'extreme' : 'severe'
  };
  
  return riskMapping[barangayRiskLevel] || 'moderate';
}

function generatePredictedWaterLevel(riskLevel) {
  const baseLevels = {
    'low': 1.2,
    'moderate': 1.8,
    'high': 2.5,
    'very_high': 3.2
  };
  
  const baseLevel = baseLevels[riskLevel] || 1.8;
  return parseFloat((baseLevel + (Math.random() - 0.5) * 1.0).toFixed(2));
}

// Export for module usage
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
} else {
  module.exports = { seedDatabase };
}