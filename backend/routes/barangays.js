const express = require("express");
const router = express.Router();
const { EnvironmentalData } = require("../models");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Get list of all barangays from configuration file
router.get("/", async (req, res) => {
    try {
        // In Docker environment, try to fetch from frontend service first
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
        
        // Try to read from local barangays.json configuration file
        const barangaysFilePath = path.join(__dirname, "../../frontend/public/data/barangays.json");
        
        if (fs.existsSync(barangaysFilePath)) {
            const barangaysData = JSON.parse(fs.readFileSync(barangaysFilePath, 'utf8'));
            const barangayNames = barangaysData.barangays
                .filter(b => b.status === 'active')
                .map(b => b.name)
                .sort();
            res.json(barangayNames);
        } else {
            // Fallback to database query if config file not found
            console.log('Using database fallback for barangays list');
            const barangays = await EnvironmentalData.findAll({
                attributes: ["barangay"],
                group: ["barangay"],
                order: [["barangay", "ASC"]],
            });
            res.json(barangays.map((b) => b.barangay));
        }
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
