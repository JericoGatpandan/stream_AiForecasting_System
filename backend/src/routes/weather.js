const express = require("express");
const router = express.Router();
const { WeatherForecast, WeatherAlert, UserLocation, WeatherTrigger, Notification } = require("../models");
const axios = require('axios');
const moment = require('moment');
const { Op } = require('sequelize');

// Weather Forecast Routes
router.get("/forecast/:location", async (req, res) => {
  const { location } = req.params;
  try {
    const forecasts = await WeatherForecast.findAll({
      where: { location },
      order: [["forecast_date", "ASC"]],
      limit: 7, // Next 7 days
    });
    res.json(forecasts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch forecast data" });
  }
});

router.get("/forecast/hourly/:location", async (req, res) => {
  const { location } = req.params;
  try {
    const forecasts = await WeatherForecast.findAll({
      where: { 
        location,
        forecast_date: {
          [Op.gte]: new Date(),
          [Op.lte]: moment().add(24, 'hours').toDate()
        }
      },
      order: [["forecast_date", "ASC"]],
    });
    res.json(forecasts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch hourly forecast data" });
  }
});

// Weather Alerts Routes
router.get("/alerts", async (req, res) => {
  try {
    const alerts = await WeatherAlert.findAll({
      where: { is_active: true },
      order: [["start_time", "ASC"]],
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather alerts" });
  }
});

router.get("/alerts/:location", async (req, res) => {
  const { location } = req.params;
  try {
    const alerts = await WeatherAlert.findAll({
      where: { 
        location,
        is_active: true 
      },
      order: [["start_time", "ASC"]],
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch location alerts" });
  }
});

// User Locations Routes
router.get("/locations", async (req, res) => {
  try {
    const locations = await UserLocation.findAll({
      order: [["is_favorite", "DESC"], ["name", "ASC"]],
    });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user locations" });
  }
});

router.post("/locations", async (req, res) => {
  try {
    const location = await UserLocation.create(req.body);
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: "Failed to create location" });
  }
});

router.put("/locations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const location = await UserLocation.update(req.body, {
      where: { id },
    });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: "Failed to update location" });
  }
});

router.delete("/locations/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await UserLocation.destroy({ where: { id } });
    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete location" });
  }
});

// Weather Triggers Routes
router.get("/triggers", async (req, res) => {
  try {
    const triggers = await WeatherTrigger.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
    });
    res.json(triggers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather triggers" });
  }
});

router.post("/triggers", async (req, res) => {
  try {
    const trigger = await WeatherTrigger.create(req.body);
    res.json(trigger);
  } catch (err) {
    res.status(500).json({ error: "Failed to create weather trigger" });
  }
});

router.put("/triggers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const trigger = await WeatherTrigger.update(req.body, {
      where: { id },
    });
    res.json(trigger);
  } catch (err) {
    res.status(500).json({ error: "Failed to update weather trigger" });
  }
});

router.delete("/triggers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await WeatherTrigger.destroy({ where: { id } });
    res.json({ message: "Weather trigger deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete weather trigger" });
  }
});

// Notifications Routes
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      order: [["sent_at", "DESC"]],
      limit: 50,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.put("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { id } }
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Expert Analysis Route
router.get("/analysis/:location", async (req, res) => {
  const { location } = req.params;
  try {
    const analysis = await WeatherForecast.findOne({
      where: { location },
      order: [["forecast_date", "DESC"]],
    });
    
    if (!analysis) {
      return res.json({ analysis: "No analysis available for this location." });
    }
    
    res.json({ analysis: analysis.expert_analysis });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expert analysis" });
  }
});

// Weather Summary Route
router.get("/summary/:location", async (req, res) => {
  const { location } = req.params;
  try {
    const currentForecast = await WeatherForecast.findOne({
      where: { 
        location,
        forecast_date: {
          [Op.gte]: new Date(),
        }
      },
      order: [["forecast_date", "ASC"]],
    });
    
    const alerts = await WeatherAlert.findAll({
      where: { 
        location,
        is_active: true 
      },
    });
    
    res.json({
      current: currentForecast,
      alerts: alerts,
      summary: {
        temperature_range: currentForecast ? `${currentForecast.temperature_min}°C - ${currentForecast.temperature_max}°C` : 'N/A',
        precipitation_chance: currentForecast ? `${currentForecast.precipitation_probability}%` : 'N/A',
        wind_conditions: currentForecast ? `${currentForecast.wind_speed} m/s ${currentForecast.wind_direction}` : 'N/A',
        active_alerts: alerts.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather summary" });
  }
});

module.exports = router;
