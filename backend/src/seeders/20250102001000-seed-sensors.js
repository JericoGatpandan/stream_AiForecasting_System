'use strict';

const path = require('path');
const fs = require('fs');

module.exports = {
    async up(queryInterface, Sequelize) {
        const barangayPath = path.resolve(__dirname, '..', 'data', 'barangays.json');
        const sensorsPath = path.resolve(__dirname, '..', 'data', 'sensors.json');

        const barangayRaw = fs.readFileSync(barangayPath, 'utf8');
        const sensorsRaw = fs.readFileSync(sensorsPath, 'utf8');

        const barangayJson = JSON.parse(barangayRaw);
        const sensorsJson = JSON.parse(sensorsRaw);

        // 1) Fetch barangays from DB to get numeric IDs
        const barangaysInDb = await queryInterface.sequelize.query(
            'SELECT id, code FROM barangays;',
            { type: Sequelize.QueryTypes.SELECT }
        );
        const codeToId = {};
        barangaysInDb.forEach((b) => {
            codeToId[b.code] = b.id; // e.g. "abella" -> 1
        });

        // 2) Map barangay name from JSON -> numeric id
        const barangayNameToId = {};
        barangayJson.barangays.forEach((b) => {
            const code = b.id; // "abella"
            const numericId = codeToId[code];
            if (numericId) {
                barangayNameToId[b.name.toLowerCase()] = numericId; // "abella" (name) -> 1
            }
        });

        // 3) Build sensor rows
        const rows = sensorsJson.sensors.map((s) => {
            const barangayId =
                barangayNameToId[s.barangay.toLowerCase()] || null;

            if (!barangayId) {
                console.warn(`No barangay id found for sensor in barangay "${s.barangay}"`);
            }

            // For now, treat all as water_level sensors in meters.
            // Adjust logic if you add more sensor types to sensors.json.
            return {
                // id is auto-increment, so we don't set it
                barangay_id: barangayId,
                name: s.name,
                type: 'water_level',  // must be one of: 'water_level','rainfall','flow_rate','weather','other'
                unit: 'm',            // required; 'm' for water level in meters
                latitude: s.lat,
                longitude: s.lng,
                status: s.status || 'active',
                created_at: new Date(),
                updated_at: new Date(),
            };
        });

        await queryInterface.bulkInsert('sensors', rows, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('sensors', null, {});
    },
};