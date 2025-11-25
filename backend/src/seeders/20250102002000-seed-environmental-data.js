'use strict';

const path = require('path');
const fs = require('fs');
const readline = require('readline');

function normalizeName(str) {
    if (!str) return '';

    let s = str.toLowerCase();
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    s = s.replace(/_/g, ' ');
    s = s.replace(/\s+/g, ' ');
    s = s.trim();
    return s;
}
module.exports = {
    async up(queryInterface, Sequelize) {
        const barangayFile = path.resolve(__dirname, '..', 'data', 'barangays.json');
        const envDir = path.resolve(__dirname, '..', 'data', 'environment'); // adjust if your path differs

        const barangayRaw = fs.readFileSync(barangayFile, 'utf8');
        const barangayJson = JSON.parse(barangayRaw);

        // 1) Load barangays from DB to get numeric ids
        const barangaysInDb = await queryInterface.sequelize.query(
            'SELECT id, code, name FROM barangays;',
            { type: Sequelize.QueryTypes.SELECT }
        );

        // Build lookup: normalized name -> id
        const nameToId = {};
        barangaysInDb.forEach((b) => {
            const normFromDb = normalizeName(b.name); // e.g. "san francisco"
            nameToId[normFromDb] = b.id;
        });

        barangayJson.barangays.forEach((b) => {
            const normFromJson = normalizeName(b.name);
            if (!nameToId[normFromJson]) {
                const match = barangaysInDb.find((dbB) => dbB.code === b.id);
                if (match) {
                    nameToId[normFromJson] = match.id;
                }
            }
        });


        // 2) Manual aliases for known mismatches
        const aliasToCanonical = {
            'concepcion pequeno': 'concepcion pequena',
            'san francisco (pob.)': 'san francisco',
        };

        Object.entries(aliasToCanonical).forEach(([aliasRaw, canonicalRaw]) => {
            const alias = normalizeName(aliasRaw);
            const canonical = normalizeName(canonicalRaw);
            const canonicalId = nameToId[canonical];
            if (canonicalId && !nameToId[alias]) {
                nameToId[alias] = canonicalId;
            }
        });

        // 3) Read all CSV files
        const files = fs.readdirSync(envDir).filter((f) => f.toLowerCase().endsWith('.csv'));

        const allRows = [];

        for (const file of files) {
            const fullPath = path.join(envDir, file);

            const stream = fs.createReadStream(fullPath);
            const rl = readline.createInterface({
                input: stream,
                crlfDelay: Infinity,
            });

            let isHeader = true;
            for await (const line of rl) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                if (!line.trim()) continue;

                const [
                    dateStr,
                    timeStr,
                    rainfallStr,
                    waterLevelStr,     // unused here
                    flowVelocityStr,   // unused here
                    windSpeedStr,
                    windDirection,     // unused here
                    tempStr,
                    humidityStr,
                    barangayName,
                ] = line.split(',');

                const normName = normalizeName(barangayName);
                const barangayId = nameToId[normName];

                if (!barangayId) {
                    console.warn(`No barangay ID found for name "${barangayName}" (normalized: "${normName}", file: ${file})`);
                    continue;
                }

                const timestamp = new Date(`${dateStr.trim()}T${timeStr.trim()}:00`);

                const row = {
                    barangay_id: barangayId,
                    timestamp,
                    rainfall_mm: rainfallStr ? parseFloat(rainfallStr) : null,
                    temperature_c: tempStr ? parseFloat(tempStr) : null,
                    humidity_percent: humidityStr ? parseFloat(humidityStr) : null,
                    wind_speed_ms: windSpeedStr ? parseFloat(windSpeedStr) : null,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                allRows.push(row);
            }
        }

        if (allRows.length > 0) {
            const batchSize = 1000;
            for (let i = 0; i < allRows.length; i += batchSize) {
                const chunk = allRows.slice(i, i + batchSize);
                await queryInterface.bulkInsert('environmental_data', chunk, {});
            }
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('environmental_data', null, {});
    },
};