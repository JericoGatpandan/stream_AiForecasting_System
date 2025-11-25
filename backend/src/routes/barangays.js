const express = require("express");
const router = express.Router();
const { Barangay } = require("../models");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Get list of all barangays from configuration file or DB fallback
router.get("/", async (req, res) => {
  try {
    // In Docker/production, try to fetch from frontend service first
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await axios.get('http://frontend/data/barangays.json', { timeout: 5000 });
        const barangayNames = response.data.barangays
          .filter(b => b.status === 'active')
          .map(b => b.name)
          .sort();
        return res.json(barangayNames);
      } catch (fetchError) {
        console.log('Could not fetch from frontend service, trying local file...', fetchError.message);
      }
    }

    const barangaysFilePath = path.join(__dirname, "../../frontend/public/data/barangays.json");

    if (fs.existsSync(barangaysFilePath)) {
      const barangaysData = JSON.parse(fs.readFileSync(barangaysFilePath, 'utf8'));
      const barangayNames = barangaysData.barangays
        .filter(b => b.status === 'active')
        .map(b => b.name)
        .sort();
      return res.json(barangayNames);
    }

    // Fallback: use Barangay table
    console.log('Using database fallback for barangays list');
    const barangays = await Barangay.findAll({
      attributes: ["name"],
      order: [["name", "ASC"]],
    });
    res.json(barangays.map(b => b.name));
  } catch (err) {
    console.error('Error fetching barangays:', err);
    res.status(500).json({ error: "Failed to fetch barangays" });
  }
});

// Get barangay details by name
router.get("/:barangayName", async (req, res) => {
  try {
    const { barangayName } = req.params;
    const barangay = await Barangay.findOne({ where: { name: barangayName } });
    if (!barangay) {
      return res.status(404).json({ error: "Barangay not found" });
    }
    res.json(barangay);
  } catch (err) {
    console.error('Error fetching barangay details:', err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;
