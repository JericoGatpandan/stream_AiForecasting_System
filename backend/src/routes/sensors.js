const express = require('express');
const router = express.Router();
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
      // adapt sensor_type -> type in schema
      sensor_type,
      barangay_id,
      include_readings = 'false',
      limit = 50,
      offset = 0
    } = req.query;

    const whereClause = {};

    if (status) whereClause.status = status;
    if (sensor_type) whereClause.type = sensor_type;
    if (barangay_id) whereClause.barangay_id = barangay_id;

    const limitNum = Math.min(parseInt(limit, 10) || 50, 500);
    const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

    const includeOptions = [
      {
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'code', 'name', 'latitude', 'longitude']
      }
    ];

    if (include_readings === 'true') {
      includeOptions.push({
        model: SensorReading,
        as: 'readings',
        limit: 10,
        order: [['timestamp', 'DESC']],
        attributes: ['timestamp', 'value', 'quality_flag']
      });
    }

    const sensors = await Sensor.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      limit: limitNum,
      offset: offsetNum,
      order: [['name', 'ASC']]
    });

    res.json({
      sensors: sensors.rows,
      total: sensors.count,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        has_more: sensors.count > offsetNum + limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// Get sensor by ID with detailed information
router.get('/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { include_readings_hours = 24 } = req.query;

    const hours = parseInt(include_readings_hours, 10) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const sensor = await Sensor.findByPk(sensorId, {
      include: [
        {
          model: Barangay,
          as: 'barangay',
          attributes: ['id', 'code', 'name', 'latitude', 'longitude']
        },
        {
          model: SensorReading,
          as: 'readings',
          where: { timestamp: { [Op.gte]: since } },
          order: [['timestamp', 'DESC']],
          required: false,
          attributes: ['timestamp', 'value', 'quality_flag']
        }
      ]
    });

    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(sensor);
  } catch (error) {
    console.error('Error fetching sensor:', error);
    res.status(500).json({ error: 'Failed to fetch sensor' });
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
      aggregation = 'raw'
    } = req.query;

    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const whereClause = { sensor_id: sensorId };

    if (start_time || end_time) {
      whereClause.timestamp = {};
      if (start_time) whereClause.timestamp[Op.gte] = new Date(start_time);
      if (end_time) whereClause.timestamp[Op.lte] = new Date(end_time);
    }

    const limitNum = Math.min(parseInt(limit, 10) || 100, 1000);
    const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

    const readings = await SensorReading.findAndCountAll({
      where: whereClause,
      attributes: ['timestamp', 'value', 'quality_flag'],
      limit: limitNum,
      offset: offsetNum,
      order: [['timestamp', 'DESC']]
    });

    res.json({
      sensor_id: sensorId,
      readings: readings.rows,
      total: readings.count,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        has_more: readings.count > offsetNum + limitNum
      },
      aggregation
    });
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    res.status(500).json({ error: 'Failed to fetch sensor readings' });
  }
});

// Get latest readings for all active sensors (dashboard view)
router.get('/readings/latest', async (req, res) => {
  try {
    const { barangay_id, sensor_type } = req.query;

    const sensorWhereClause = { status: 'active' };
    if (barangay_id) sensorWhereClause.barangay_id = barangay_id;
    if (sensor_type) sensorWhereClause.type = sensor_type;

    const sensors = await Sensor.findAll({
      where: sensorWhereClause,
      include: [
        {
          model: Barangay,
          as: 'barangay',
          attributes: ['id', 'code', 'name', 'latitude', 'longitude']
        },
        {
          model: SensorReading,
          as: 'readings',
          limit: 1,
          order: [['timestamp', 'DESC']],
          attributes: ['timestamp', 'value', 'quality_flag']
        }
      ],
      order: [['name', 'ASC']]
    });

    const latestReadings = sensors.map(sensor => ({
      sensor_id: sensor.id,
      sensor_name: sensor.name,
      type: sensor.type,
      unit: sensor.unit,
      barangay: sensor.barangay,
      location: {
        latitude: sensor.latitude,
        longitude: sensor.longitude
      },
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
    res.status(500).json({ error: 'Failed to fetch latest readings' });
  }
});

// Get sensor statistics (aggregated data over value)
router.get('/:sensorId/statistics', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { period = '24h' } = req.query;

    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    const periodMap = {
      '1h': 1 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeRange = periodMap[period] || periodMap['24h'];
    const startTime = new Date(Date.now() - timeRange);

    const readings = await SensorReading.findAll({
      where: {
        sensor_id: sensorId,
        timestamp: { [Op.gte]: startTime }
      },
      attributes: ['timestamp', 'value'],
      order: [['timestamp', 'ASC']]
    });

    const values = readings
      .map(r => r.value)
      .filter(v => v !== null && v !== undefined && !Number.isNaN(v));

    const stats = values.length > 0 ? {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1]
    } : {
      count: 0,
      min: null,
      max: null,
      avg: null,
      latest: null
    };

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
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Update sensor basic fields
router.put('/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const updates = req.body || {};

    const allowedUpdates = ['status', 'name', 'type', 'unit', 'latitude', 'longitude', 'barangay_id'];
    const updateData = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

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
        attributes: ['id', 'code', 'name']
      }]
    });

    res.json({
      message: 'Sensor updated successfully',
      sensor: updatedSensor
    });
  } catch (error) {
    console.error('Error updating sensor:', error);
    res.status(500).json({ error: 'Failed to update sensor' });
  }
});

module.exports = router;