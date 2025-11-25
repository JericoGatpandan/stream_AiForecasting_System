const express = require("express");
const router = express.Router();
const { FloodCharacteristics } = require("../models");
const { Op } = require('sequelize');

// Get all flood characteristics
router.get("/", async (req, res) => {
  try {
    const { location, risk_level, active_only } = req.query;
    
    let whereClause = {};
    
    if (location) {
      whereClause.location = location;
    }
    
    if (risk_level) {
      whereClause.flood_risk_level = risk_level;
    }
    
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const floodData = await FloodCharacteristics.findAll({
      where: whereClause,
      order: [["last_updated", "DESC"]],
    });
    
    // If no data found, return sample data for development
    if (floodData.length === 0) {
      const locations = ['Pacol', 'Bagumbayan Norte', 'Abella', 'Sabang', 'Triangulo'];
      const sampleData = locations.map((loc, index) => ({
        id: index + 1,
        location: loc,
        latitude: 13.6218 + (Math.random() - 0.5) * 0.1,
        longitude: 123.1948 + (Math.random() - 0.5) * 0.1,
        maximum_depth: Math.random() * 3 + 0.5,
        maximum_depth_uncertainty: Math.random() * 0.5,
        peak_velocity: Math.random() * 2 + 0.5,
        peak_velocity_uncertainty: Math.random() * 0.3,
        arrival_time: Math.random() * 12 + 1,
        arrival_time_uncertainty: Math.random() * 2,
        inundation_area: Math.random() * 5 + 1,
        inundation_area_uncertainty: Math.random() * 1,
        flood_risk_level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        model_version: '1.0.0-dev',
        last_updated: new Date(),
        is_active: true,
        expert_analysis: `Sample flood analysis for ${loc}`,
        recommended_actions: `Monitor conditions and follow evacuation procedures if necessary for ${loc}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      return res.json(sampleData);
    }
    
    res.json(floodData);
  } catch (err) {
    console.error('Error fetching flood characteristics:', err);
    res.status(500).json({ error: "Failed to fetch flood characteristics data" });
  }
});

// Get flood characteristics by location
router.get("/location/:location", async (req, res) => {
  const { location } = req.params;
  try {
    const floodData = await FloodCharacteristics.findOne({
      where: { 
        location,
        is_active: true 
      },
      order: [["last_updated", "DESC"]],
    });
    
    if (!floodData) {
      // Return sample flood characteristics data for development
      const sampleData = {
        id: Math.floor(Math.random() * 1000),
        location: location,
        latitude: 13.6218 + (Math.random() - 0.5) * 0.1,
        longitude: 123.1948 + (Math.random() - 0.5) * 0.1,
        maximum_depth: Math.random() * 3 + 0.5,
        maximum_depth_uncertainty: Math.random() * 0.5,
        peak_velocity: Math.random() * 2 + 0.5,
        peak_velocity_uncertainty: Math.random() * 0.3,
        arrival_time: Math.random() * 12 + 1,
        arrival_time_uncertainty: Math.random() * 2,
        inundation_area: Math.random() * 5 + 1,
        inundation_area_uncertainty: Math.random() * 1,
        flood_risk_level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        model_version: '1.0.0-dev',
        last_updated: new Date(),
        is_active: true,
        expert_analysis: `Sample flood analysis for ${location}`,
        recommended_actions: `Monitor conditions and follow evacuation procedures if necessary for ${location}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return res.json(sampleData);
    }
    
    res.json(floodData);
  } catch (err) {
    console.error('Error fetching flood characteristics for location:', err);
    res.status(500).json({ error: "Failed to fetch flood characteristics for location" });
  }
});

// Get flood characteristics by risk level
router.get("/risk/:riskLevel", async (req, res) => {
  const { riskLevel } = req.params;
  try {
    const floodData = await FloodCharacteristics.findAll({
      where: { 
        flood_risk_level: riskLevel,
        is_active: true 
      },
      order: [["last_updated", "DESC"]],
    });
    
    res.json(floodData);
  } catch (err) {
    console.error('Error fetching flood characteristics by risk level:', err);
    res.status(500).json({ error: "Failed to fetch flood characteristics by risk level" });
  }
});

// Create new flood characteristics
router.post("/", async (req, res) => {
  try {
    const floodData = await FloodCharacteristics.create(req.body);
    res.status(201).json(floodData);
  } catch (err) {
    console.error('Error creating flood characteristics:', err);
    res.status(500).json({ error: "Failed to create flood characteristics" });
  }
});

// Update flood characteristics
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [updatedRows] = await FloodCharacteristics.update(
      { ...req.body, last_updated: new Date() },
      { where: { id } }
    );
    
    if (updatedRows === 0) {
      return res.status(404).json({ error: "Flood characteristics not found" });
    }
    
    const updatedData = await FloodCharacteristics.findByPk(id);
    res.json(updatedData);
  } catch (err) {
    console.error('Error updating flood characteristics:', err);
    res.status(500).json({ error: "Failed to update flood characteristics" });
  }
});

// Delete flood characteristics
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRows = await FloodCharacteristics.destroy({ where: { id } });
    
    if (deletedRows === 0) {
      return res.status(404).json({ error: "Flood characteristics not found" });
    }
    
    res.json({ message: "Flood characteristics deleted successfully" });
  } catch (err) {
    console.error('Error deleting flood characteristics:', err);
    res.status(500).json({ error: "Failed to delete flood characteristics" });
  }
});

// Get flood summary for dashboard
router.get("/summary/:location", async (req, res) => {
  const { location } = req.params;
  try {
    const floodData = await FloodCharacteristics.findOne({
      where: { 
        location,
        is_active: true 
      },
      order: [["last_updated", "DESC"]],
    });
    
    if (!floodData) {
      return res.json({ 
        hasData: false,
        message: "No flood characteristics data available for this location"
      });
    }
    
    // Calculate risk assessment
    const riskAssessment = calculateFloodRisk(floodData);
    
    res.json({
      hasData: true,
      location: floodData.location,
      maximumDepth: {
        value: floodData.maximum_depth,
        uncertainty: floodData.maximum_depth_uncertainty,
        unit: 'm'
      },
      peakVelocity: {
        value: floodData.peak_velocity,
        uncertainty: floodData.peak_velocity_uncertainty,
        unit: 'm/s'
      },
      arrivalTime: {
        value: floodData.arrival_time,
        uncertainty: floodData.arrival_time_uncertainty,
        unit: 'hours'
      },
      inundationArea: {
        value: floodData.inundation_area,
        uncertainty: floodData.inundation_area_uncertainty,
        unit: 'km²'
      },
      riskLevel: floodData.flood_risk_level,
      riskAssessment,
      lastUpdated: floodData.last_updated,
      expertAnalysis: floodData.expert_analysis,
      recommendedActions: floodData.recommended_actions
    });
  } catch (err) {
    console.error('Error fetching flood summary:', err);
    res.status(500).json({ error: "Failed to fetch flood summary" });
  }
});

// Get high-risk areas
router.get("/high-risk", async (req, res) => {
  try {
    const highRiskData = await FloodCharacteristics.findAll({
      where: { 
        flood_risk_level: { [Op.in]: ['high', 'extreme'] },
        is_active: true 
      },
      order: [["maximum_depth", "DESC"]],
    });
    
    res.json(highRiskData);
  } catch (err) {
    console.error('Error fetching high-risk areas:', err);
    res.status(500).json({ error: "Failed to fetch high-risk areas" });
  }
});

// Helper function to calculate flood risk assessment
function calculateFloodRisk(floodData) {
  const { maximum_depth, peak_velocity, inundation_area } = floodData;
  
  let riskScore = 0;
  let riskFactors = [];
  
  // Depth risk assessment
  if (maximum_depth > 2.0) {
    riskScore += 3;
    riskFactors.push('Very high water depth (>2m)');
  } else if (maximum_depth > 1.5) {
    riskScore += 2;
    riskFactors.push('High water depth (1.5-2m)');
  } else if (maximum_depth > 1.0) {
    riskScore += 1;
    riskFactors.push('Moderate water depth (1-1.5m)');
  }
  
  // Velocity risk assessment
  if (peak_velocity > 3.0) {
    riskScore += 3;
    riskFactors.push('Very high water velocity (>3m/s)');
  } else if (peak_velocity > 2.0) {
    riskScore += 2;
    riskFactors.push('High water velocity (2-3m/s)');
  } else if (peak_velocity > 1.0) {
    riskScore += 1;
    riskFactors.push('Moderate water velocity (1-2m/s)');
  }
  
  // Area risk assessment
  if (inundation_area > 10.0) {
    riskScore += 2;
    riskFactors.push('Large inundation area (>10km²)');
  } else if (inundation_area > 5.0) {
    riskScore += 1;
    riskFactors.push('Moderate inundation area (5-10km²)');
  }
  
  return {
    score: riskScore,
    factors: riskFactors,
    level: riskScore >= 6 ? 'extreme' : riskScore >= 4 ? 'high' : riskScore >= 2 ? 'moderate' : 'low'
  };
}

module.exports = router;
