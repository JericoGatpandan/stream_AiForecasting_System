const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { Sensor, Barangay, SensorReading } = require('../models');
const { Op } = require('sequelize');

/**
 * Sensors API Routes for Stream AI Forecasting System
 * Provides comprehensive sensor management and data retrieval
 */

// Get all sensors with optional filtering
router.get('/', async (req, res) => {
  try {
    const {
      status,
      sensor_type,
      barangay_id,
      watershed_zone,
      include_readings = 'false',
      limit = 50,
      offset = 0
    } = req.query;

    const whereClause = {};
    
    // Apply filters
    if (status) whereClause.status = status;
    if (sensor_type) whereClause.sensor_type = sensor_type;
    if (barangay_id) whereClause.barangay_id = barangay_id;
    if (watershed_zone) whereClause.watershed_zone = watershed_zone;

    const includeOptions = [
      {
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'name', 'center_lat', 'center_lng', 'flood_risk_level', 'watershed_zone']
      }
    ];

    // Include recent readings if requested
    if (include_readings === 'true') {
      includeOptions.push({
        model: SensorReading,
        as: 'readings',
        limit: 10,
        order: [['timestamp', 'DESC']],
        attributes: ['timestamp', 'water_level', 'rainfall', 'air_temperature', 'humidity', 'data_quality']
      });
    }

    const sensors = await Sensor.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      sensors: sensors.rows,
      total: sensors.count,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: sensors.count > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ error: 'Failed to fetch sensors', details: error.message });
  }
});

// Get sensor by ID with detailed information
router.get('/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { include_readings_hours = 24 } = req.query;

    const sensor = await Sensor.findByPk(sensorId, {
      include: [
        {
          model: Barangay,
          as: 'barangay',
          attributes: ['id', 'name', 'center_lat', 'center_lng', 'flood_risk_level', 'watershed_zone', 'area_km2', 'population']
        },
        {
          model: SensorReading,
          as: 'readings',
          where: {
            timestamp: {
              [Op.gte]: new Date(Date.now() - parseInt(include_readings_hours) * 60 * 60 * 1000)
            }
          },
          order: [['timestamp', 'DESC']],
          required: false
        }
      ]
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(sensor);

  } catch (error) {
    console.error('Error fetching sensor:', error);
    res.status(500).json({ error: 'Failed to fetch sensor', details: error.message });
  }
});

// Get sensor readings with time-based filtering
router.get('/:sensorId/readings', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const {
      start_time,
      end_time,
      limit = 100,
      offset = 0,
      aggregation = 'raw', // raw, hourly, daily
      parameters = 'all' // comma-separated list or 'all'
    } = req.query;

    // Verify sensor exists
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const whereClause = { sensor_id: sensorId };
    
    // Apply time filtering
    if (start_time || end_time) {
      whereClause.timestamp = {};
      if (start_time) whereClause.timestamp[Op.gte] = new Date(start_time);
      if (end_time) whereClause.timestamp[Op.lte] = new Date(end_time);
    }

    let attributes = ['timestamp', 'data_quality', 'is_validated'];
    
    // Add specific parameters or all
    if (parameters === 'all') {
      attributes.push(
        'water_level', 'flow_velocity', 'flow_rate', 'water_temperature', 'turbidity', 'ph_level',
        'dissolved_oxygen', 'rainfall', 'air_temperature', 'humidity', 'wind_speed', 'wind_direction',
        'atmospheric_pressure', 'visibility', 'uv_index', 'battery_voltage', 'signal_strength'
      );
    } else {
      const requestedParams = parameters.split(',').map(p => p.trim());
      attributes.push(...requestedParams);
    }

    const readings = await SensorReading.findAndCountAll({
      where: whereClause,
      attributes,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });

    res.json({
      sensor_id: sensorId,
      readings: readings.rows,
      total: readings.count,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: readings.count > parseInt(offset) + parseInt(limit)
      },
      aggregation,
      parameters: parameters === 'all' ? 'all' : parameters.split(',')
    });

  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    res.status(500).json({ error: 'Failed to fetch sensor readings', details: error.message });
  }
});

// Get latest readings for all active sensors (dashboard view)
router.get('/readings/latest', async (req, res) => {
  try {
    const { watershed_zone, barangay_id, sensor_type } = req.query;

    const sensorWhereClause = { status: 'active' };
    if (watershed_zone) sensorWhereClause.watershed_zone = watershed_zone;
    if (barangay_id) sensorWhereClause.barangay_id = barangay_id;
    if (sensor_type) sensorWhereClause.sensor_type = sensor_type;

    const sensors = await Sensor.findAll({
      where: sensorWhereClause,
      include: [
        {
          model: Barangay,
          as: 'barangay',
          attributes: ['id', 'name', 'flood_risk_level']
        },
        {
          model: SensorReading,
          as: 'readings',
          limit: 1,
          order: [['timestamp', 'DESC']],
          attributes: [
            'timestamp', 'water_level', 'rainfall', 'air_temperature', 'humidity',
            'wind_speed', 'wind_direction', 'data_quality', 'battery_voltage'
          ]
        }
      ],
      order: [['name', 'ASC']]
    });

    const latestReadings = sensors.map(sensor => ({
      sensor_id: sensor.id,
      sensor_name: sensor.name,
      sensor_type: sensor.sensor_type,
      barangay: sensor.barangay,
      location: {
        latitude: sensor.latitude,
        longitude: sensor.longitude
      },
      watershed_zone: sensor.watershed_zone,
      river_section: sensor.river_section,
      battery_level: sensor.battery_level,
      status: sensor.status,
      latest_reading: sensor.readings && sensor.readings.length > 0 ? sensor.readings[0] : null
    }));

    res.json({
      timestamp: new Date(),
      sensors: latestReadings,
      total_sensors: latestReadings.length
    });

  } catch (error) {
    console.error('Error fetching latest readings:', error);
    res.status(500).json({ error: 'Failed to fetch latest readings', details: error.message });
  }
});

// Get sensor statistics (aggregated data)
router.get('/:sensorId/statistics', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { 
      period = '24h', // 1h, 6h, 24h, 7d, 30d
      parameters = 'water_level,rainfall,air_temperature'
    } = req.query;

    // Verify sensor exists
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // Calculate time range based on period
    const periodMap = {
      '1h': 1 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeRange = periodMap[period] || periodMap['24h'];
    const startTime = new Date(Date.now() - timeRange);

    // Get readings for the specified period
    const readings = await SensorReading.findAll({
      where: {
        sensor_id: sensorId,
        timestamp: { [Op.gte]: startTime },
        is_validated: true
      },
      attributes: ['timestamp', ...parameters.split(',')],
      order: [['timestamp', 'ASC']]
    });

    // Calculate statistics for each parameter
    const stats = {};
    const paramList = parameters.split(',');

    paramList.forEach(param => {
      const values = readings
        .map(r => r[param])
        .filter(v => v !== null && v !== undefined && !isNaN(v));

      if (values.length > 0) {
        stats[param] = {
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          latest: values[values.length - 1]
        };
      } else {
        stats[param] = {
          count: 0,
          min: null,
          max: null,
          avg: null,
          latest: null
        };
      }
    });

    res.json({
      sensor_id: sensorId,
      period,
      time_range: {
        start: startTime,
        end: new Date()
      },
      statistics: stats,
      total_readings: readings.length
    });

  } catch (error) {
    console.error('Error calculating sensor statistics:', error);
    res.status(500).json({ error: 'Failed to calculate statistics', details: error.message });
  }
});

// Update sensor status or configuration
router.put('/:sensorId', auth(true), requireRole(['admin']), async (req, res) => {
  try {
    const { sensorId } = req.params;
    const updates = req.body;

    // Validate allowed updates
    const allowedUpdates = [
      'status', 'battery_level', 'transmission_interval', 
      'last_maintenance', 'calibration_date', 'watershed_zone', 'river_section'
    ];
    
    const updateData = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const [updatedRows] = await Sensor.update(updateData, {
      where: { id: sensorId }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const updatedSensor = await Sensor.findByPk(sensorId, {
      include: [{
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      message: 'Sensor updated successfully',
      sensor: updatedSensor
    });

  } catch (error) {
    console.error('Error updating sensor:', error);
    res.status(500).json({ error: 'Failed to update sensor', details: error.message });
  }
});

module.exports = router;