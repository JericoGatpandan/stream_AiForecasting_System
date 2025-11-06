const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { FloodPrediction, Barangay, EnvironmentalData, SensorReading } = require('../models');
const { Op } = require('sequelize');

/**
 * Flood Predictions API Routes for Stream AI Forecasting System
 */

// Get all flood predictions with filtering
router.get('/', async (req, res) => {
  try {
    const {
      barangay_id,
      risk_level,
      model_version = '1.0.0-demo',
      forecast_active = 'true',
      limit = 20,
      offset = 0
    } = req.query;

    const whereClause = {};
    
    // Apply filters
    if (barangay_id) whereClause.barangay_id = barangay_id;
    if (risk_level) whereClause.risk_level = risk_level;
    if (model_version) whereClause.model_version = model_version;
    
    // Filter for active forecasts (future predictions)
    if (forecast_active === 'true') {
      whereClause.forecast_end = { [Op.gt]: new Date() };
    }

    const predictions = await FloodPrediction.findAndCountAll({
      where: whereClause,
      include: [{
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'name', 'center_lat', 'center_lng', 'flood_risk_level', 'watershed_zone', 'population']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['prediction_timestamp', 'DESC']]
    });

    // Calculate summary statistics
    const totalPredictions = predictions.count;
    const highRiskPredictions = predictions.rows.filter(p => 
      ['high', 'severe', 'extreme'].includes(p.risk_level)
    ).length;
    
    const averageConfidence = predictions.rows.length > 0 
      ? predictions.rows.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.rows.length
      : 0;

    res.json({
      predictions: predictions.rows,
      total: totalPredictions,
      summary: {
        high_risk_count: highRiskPredictions,
        average_confidence: parseFloat(averageConfidence.toFixed(3)),
        active_forecasts: predictions.rows.filter(p => p.forecast_end > new Date()).length
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: totalPredictions > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching flood predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions', details: error.message });
  }
});

// Get current predictions for all barangays (dashboard overview)
router.get('/current', async (req, res) => {
  try {
    const { risk_threshold = 'moderate' } = req.query;
    
    // Get latest prediction for each barangay
    const latestPredictions = await FloodPrediction.findAll({
      include: [{
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'name', 'center_lat', 'center_lng', 'flood_risk_level', 'watershed_zone', 'population', 'area_km2']
      }],
      where: {
        forecast_end: { [Op.gt]: new Date() }, // Only active forecasts
      },
      order: [
        ['barangay_id', 'ASC'],
        ['prediction_timestamp', 'DESC']
      ]
    });

    // Group by barangay and get the most recent prediction for each
    const currentPredictionsMap = new Map();
    latestPredictions.forEach(prediction => {
      const barangayId = prediction.barangay_id;
      if (!currentPredictionsMap.has(barangayId)) {
        currentPredictionsMap.set(barangayId, prediction);
      }
    });

    const currentPredictions = Array.from(currentPredictionsMap.values());
    
    // Filter by risk threshold if specified
    const riskOrder = ['low', 'moderate', 'high', 'severe', 'extreme'];
    const thresholdIndex = riskOrder.indexOf(risk_threshold);
    const filteredPredictions = thresholdIndex >= 0 
      ? currentPredictions.filter(p => riskOrder.indexOf(p.risk_level) >= thresholdIndex)
      : currentPredictions;

    // Calculate risk summary
    const riskSummary = {
      low: currentPredictions.filter(p => p.risk_level === 'low').length,
      moderate: currentPredictions.filter(p => p.risk_level === 'moderate').length,
      high: currentPredictions.filter(p => p.risk_level === 'high').length,
      severe: currentPredictions.filter(p => p.risk_level === 'severe').length,
      extreme: currentPredictions.filter(p => p.risk_level === 'extreme').length,
    };

    res.json({
      timestamp: new Date(),
      current_predictions: filteredPredictions,
      total_barangays: currentPredictions.length,
      risk_summary: riskSummary,
      highest_risk: Math.max(...Object.values(riskSummary)) > 0 
        ? Object.keys(riskSummary).find(key => riskSummary[key] === Math.max(...Object.values(riskSummary)))
        : 'low'
    });

  } catch (error) {
    console.error('Error fetching current predictions:', error);
    res.status(500).json({ error: 'Failed to fetch current predictions', details: error.message });
  }
});

// Get prediction for specific barangay with history
router.get('/barangay/:barangayId', async (req, res) => {
  try {
    const { barangayId } = req.params;
    const { 
      include_history = 'true', 
      history_days = 7,
      include_environmental_data = 'false' 
    } = req.query;

    // Verify barangay exists
    const barangay = await Barangay.findByPk(barangayId);
    if (!barangay) {
      return res.status(404).json({ error: 'Barangay not found' });
    }

    // Get current prediction
    const currentPrediction = await FloodPrediction.findOne({
      where: {
        barangay_id: barangayId,
        forecast_end: { [Op.gt]: new Date() }
      },
      order: [['prediction_timestamp', 'DESC']]
    });

    let historicalPredictions = [];
    if (include_history === 'true') {
      const historyStartDate = new Date();
      historyStartDate.setDate(historyStartDate.getDate() - parseInt(history_days));
      
      historicalPredictions = await FloodPrediction.findAll({
        where: {
          barangay_id: barangayId,
          prediction_timestamp: { [Op.gte]: historyStartDate }
        },
        order: [['prediction_timestamp', 'DESC']],
        limit: 50
      });
    }

    // Get recent environmental data if requested
    let environmentalData = null;
    if (include_environmental_data === 'true') {
      const recentDataStartTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      environmentalData = await EnvironmentalData.findAll({
        where: {
          barangay_id: barangayId,
          timestamp: { [Op.gte]: recentDataStartTime }
        },
        order: [['timestamp', 'DESC']],
        limit: 24, // Hourly data for last 24 hours
        attributes: ['timestamp', 'rainfall_mm', 'water_level_m', 'temperature_c', 'humidity_percent', 'quality_flag']
      });
    }

    res.json({
      barangay: barangay,
      current_prediction: currentPrediction,
      prediction_history: historicalPredictions,
      environmental_data: environmentalData,
      metadata: {
        history_days: include_history === 'true' ? parseInt(history_days) : 0,
        environmental_data_included: include_environmental_data === 'true',
        total_historical_predictions: historicalPredictions.length
      }
    });

  } catch (error) {
    console.error('Error fetching barangay predictions:', error);
    res.status(500).json({ error: 'Failed to fetch barangay predictions', details: error.message });
  }
});

// Generate new prediction (AI model endpoint - mock for MVP)
router.post('/generate', auth(true), requireRole(['admin']), async (req, res) => {
  try {
    const {
      barangay_id,
      forecast_hours = 24,
      model_version = '1.0.0-demo',
      force_refresh = false
    } = req.body;

    // Verify barangay exists
    const barangay = await Barangay.findByPk(barangay_id);
    if (!barangay) {
      return res.status(404).json({ error: 'Barangay not found' });
    }

    // Check if recent prediction exists (unless force_refresh is true)
    if (!force_refresh) {
      const recentPrediction = await FloodPrediction.findOne({
        where: {
          barangay_id,
          prediction_timestamp: { 
            [Op.gte]: new Date(Date.now() - 2 * 60 * 60 * 1000) // Within last 2 hours
          }
        },
        order: [['prediction_timestamp', 'DESC']]
      });

      if (recentPrediction && recentPrediction.forecast_end > new Date()) {
        return res.json({
          message: 'Recent prediction already exists',
          prediction: recentPrediction,
          generated: false
        });
      }
    }

    // Get recent environmental data for AI model input
    const recentEnvironmentalData = await EnvironmentalData.findAll({
      where: {
        barangay_id,
        timestamp: { [Op.gte]: new Date(Date.now() - 48 * 60 * 60 * 1000) } // Last 48 hours
      },
      order: [['timestamp', 'DESC']],
      limit: 48,
      attributes: ['timestamp', 'rainfall_mm', 'water_level_m', 'temperature_c', 'humidity_percent', 'atmospheric_pressure', 'soil_moisture']
    });

    // Mock AI model processing (replace with actual AI model call in production)
    const aiModelResult = await mockAIPredictionModel(barangay, recentEnvironmentalData, forecast_hours);

    // Create new prediction record
    const now = new Date();
    const forecastEnd = new Date(now.getTime() + parseInt(forecast_hours) * 60 * 60 * 1000);

    const newPrediction = await FloodPrediction.create({
      barangay_id,
      prediction_timestamp: now,
      forecast_start: now,
      forecast_end: forecastEnd,
      flood_probability: aiModelResult.probability,
      risk_level: aiModelResult.risk_level,
      predicted_water_level: aiModelResult.predicted_water_level,
      predicted_rainfall: aiModelResult.predicted_rainfall,
      affected_area_km2: aiModelResult.affected_area,
      population_at_risk: aiModelResult.population_at_risk,
      confidence_score: aiModelResult.confidence,
      model_version,
      input_features: aiModelResult.input_features,
      prediction_notes: `Generated via API for ${barangay.name} - ${forecast_hours}h forecast`,
      is_alert_sent: false,
      alert_level: aiModelResult.alert_level,
      validation_status: 'pending'
    });

    // Fetch the created prediction with barangay details
    const createdPrediction = await FloodPrediction.findByPk(newPrediction.id, {
      include: [{
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'name', 'flood_risk_level', 'watershed_zone']
      }]
    });

    res.status(201).json({
      message: 'Prediction generated successfully',
      prediction: createdPrediction,
      generated: true,
      model_info: {
        version: model_version,
        processing_time_ms: aiModelResult.processing_time,
        input_data_points: recentEnvironmentalData.length
      }
    });

  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: 'Failed to generate prediction', details: error.message });
  }
});

// Get prediction accuracy metrics (for AI model evaluation)
router.get('/accuracy', async (req, res) => {
  try {
    const {
      model_version = '1.0.0-demo',
      evaluation_period_days = 30,
      barangay_id
    } = req.query;

    const whereClause = { model_version };
    if (barangay_id) whereClause.barangay_id = barangay_id;
    
    // Get predictions from the evaluation period
    const evaluationStartDate = new Date();
    evaluationStartDate.setDate(evaluationStartDate.getDate() - parseInt(evaluation_period_days));
    
    whereClause.prediction_timestamp = { [Op.gte]: evaluationStartDate };
    whereClause.validation_status = { [Op.ne]: 'pending' }; // Only validated predictions

    const validatedPredictions = await FloodPrediction.findAll({
      where: whereClause,
      include: [{
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'name']
      }],
      order: [['prediction_timestamp', 'DESC']]
    });

    // Calculate accuracy metrics
    const totalPredictions = validatedPredictions.length;
    const accuratePredictions = validatedPredictions.filter(p => p.validation_status === 'validated').length;
    const falsePositives = validatedPredictions.filter(p => p.validation_status === 'false_positive').length;
    const falseNegatives = validatedPredictions.filter(p => p.validation_status === 'false_negative').length;

    const accuracy = totalPredictions > 0 ? accuratePredictions / totalPredictions : 0;
    const precision = (accuratePredictions + falsePositives) > 0 ? accuratePredictions / (accuratePredictions + falsePositives) : 0;
    const recall = (accuratePredictions + falseNegatives) > 0 ? accuratePredictions / (accuratePredictions + falseNegatives) : 0;

    // Calculate average confidence score
    const avgConfidence = totalPredictions > 0 
      ? validatedPredictions.reduce((sum, p) => sum + p.confidence_score, 0) / totalPredictions
      : 0;

    res.json({
      model_version,
      evaluation_period: {
        days: parseInt(evaluation_period_days),
        start_date: evaluationStartDate,
        end_date: new Date()
      },
      metrics: {
        total_predictions: totalPredictions,
        accurate_predictions: accuratePredictions,
        false_positives: falsePositives,
        false_negatives: falseNegatives,
        accuracy: parseFloat(accuracy.toFixed(3)),
        precision: parseFloat(precision.toFixed(3)),
        recall: parseFloat(recall.toFixed(3)),
        average_confidence: parseFloat(avgConfidence.toFixed(3))
      },
      barangay_filter: barangay_id || 'all'
    });

  } catch (error) {
    console.error('Error calculating prediction accuracy:', error);
    res.status(500).json({ error: 'Failed to calculate accuracy metrics', details: error.message });
  }
});

// Update prediction validation status (for model learning)
router.put('/:predictionId/validate', auth(true), requireRole(['admin']), async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { validation_status, actual_outcome, notes } = req.body;

    const allowedStatuses = ['validated', 'false_positive', 'false_negative'];
    if (!allowedStatuses.includes(validation_status)) {
      return res.status(400).json({ 
        error: 'Invalid validation status',
        allowed_values: allowedStatuses
      });
    }

    const updateData = { 
      validation_status,
      actual_outcome: actual_outcome || null
    };

    if (notes) {
      updateData.prediction_notes = notes;
    }

    const [updatedRows] = await FloodPrediction.update(updateData, {
      where: { id: predictionId }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    const updatedPrediction = await FloodPrediction.findByPk(predictionId, {
      include: [{
        model: Barangay,
        as: 'barangay',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      message: 'Prediction validation updated successfully',
      prediction: updatedPrediction
    });

  } catch (error) {
    console.error('Error updating prediction validation:', error);
    res.status(500).json({ error: 'Failed to update validation', details: error.message });
  }
});

/**
 * Mock AI Prediction Model for MVP Demonstration
 * In production, this would be replaced with actual AI/ML model calls
 */
async function mockAIPredictionModel(barangay, environmentalData, forecastHours) {
  const startTime = Date.now();
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Calculate recent trends from environmental data
  const recentRainfall = environmentalData
    .slice(0, 12) // Last 12 hours
    .reduce((sum, d) => sum + (d.rainfall_mm || 0), 0);
    
  const avgWaterLevel = environmentalData.length > 0
    ? environmentalData.reduce((sum, d) => sum + (d.water_level_m || 1.5), 0) / environmentalData.length
    : 1.5;

  // Base probability on barangay risk level and recent data
  const baseRiskProbabilities = {
    'low': 0.05,
    'moderate': 0.15,
    'high': 0.35,
    'very_high': 0.55
  };

  let floodProbability = baseRiskProbabilities[barangay.flood_risk_level] || 0.15;
  
  // Adjust based on recent rainfall
  if (recentRainfall > 20) floodProbability += 0.3;
  else if (recentRainfall > 10) floodProbability += 0.15;
  else if (recentRainfall > 5) floodProbability += 0.05;
  
  // Adjust based on water level
  if (avgWaterLevel > 2.5) floodProbability += 0.25;
  else if (avgWaterLevel > 2.0) floodProbability += 0.15;
  else if (avgWaterLevel > 1.8) floodProbability += 0.05;
  
  // Cap probability at 0.95
  floodProbability = Math.min(0.95, floodProbability);
  
  // Determine risk level
  let riskLevel = 'low';
  if (floodProbability > 0.7) riskLevel = 'extreme';
  else if (floodProbability > 0.5) riskLevel = 'severe';
  else if (floodProbability > 0.3) riskLevel = 'high';
  else if (floodProbability > 0.15) riskLevel = 'moderate';
  
  // Determine alert level
  let alertLevel = null;
  if (floodProbability > 0.7) alertLevel = 'emergency';
  else if (floodProbability > 0.4) alertLevel = 'warning';
  else if (floodProbability > 0.2) alertLevel = 'watch';
  
  const processingTime = Date.now() - startTime;
  
  return {
    probability: parseFloat(floodProbability.toFixed(3)),
    risk_level: riskLevel,
    predicted_water_level: Math.max(1.0, avgWaterLevel + (floodProbability * 2.0)),
    predicted_rainfall: recentRainfall * (0.8 + Math.random() * 0.4), // ±20% variation
    affected_area: parseFloat(((barangay.area_km2 || 2.5) * floodProbability * 0.6).toFixed(2)),
    population_at_risk: Math.floor((barangay.population || 5000) * floodProbability * 0.4),
    confidence: 0.65 + Math.random() * 0.25, // 65-90% confidence
    alert_level: alertLevel,
    processing_time: processingTime,
    input_features: {
      recent_rainfall_mm: recentRainfall,
      avg_water_level_m: avgWaterLevel,
      barangay_risk_level: barangay.flood_risk_level,
      data_points_used: environmentalData.length,
      forecast_hours: forecastHours
    }
  };
}

module.exports = router;