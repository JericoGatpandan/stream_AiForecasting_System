const express = require("express");
const router = express.Router();
const { EnvironmentalData } = require("../models");

// Get list of unique barangays
router.get("/", async (req, res) => {
    try {
        const barangays = await EnvironmentalData.findAll({
            attributes: ["barangay"],
            group: ["barangay"],
            order: [["barangay", "ASC"]],
        });
        res.json(barangays.map((b) => b.barangay));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch barangays" });
    }
});

// Get all data for a specific barangay
router.get("/:barangay", async (req, res) => {
    try {
        const { barangay } = req.params;
        const data = await EnvironmentalData.findAll({
            where: { barangay },
            order: [["timestamp", "ASC"]],
        });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = router;
