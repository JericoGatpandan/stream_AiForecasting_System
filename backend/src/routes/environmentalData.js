const express = require("express");
const router = express.Router();
const { EnvironmentalData, Barangay } = require("../models");

// Get environmental data for a barangay by name (mapped to barangay_id)
router.get("/:barangayName", async (req, res) => {
  const { barangayName } = req.params;
  try {
    const barangay = await Barangay.findOne({ where: { name: barangayName } });
    if (!barangay) {
      return res.status(404).json({ error: "Barangay not found" });
    }

    const data = await EnvironmentalData.findAll({
      where: { barangay_id: barangay.id },
      order: [["timestamp", "ASC"]],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching environmental data:', err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;
