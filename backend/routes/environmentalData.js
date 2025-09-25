const express = require("express");
const router = express.Router();
const { EnvironmentalData } = require("../models");

router.get("/:barangay", async (req, res) => {
  const { barangay } = req.params;
  try {
    const data = await EnvironmentalData.findAll({
      where: { barangay },
      order: [["timestamp", "ASC"]],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;
