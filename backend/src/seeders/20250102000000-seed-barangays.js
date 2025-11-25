'use strict';

const path = require('path');
const fs = require('fs');

module.exports = {
    async up(queryInterface, Sequelize) {
        const filePath = path.resolve(__dirname, '..', 'data', 'barangays.json');
        const raw = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(raw);

        const rows = json.barangays.map((b) => ({
            // id is AUTO_INCREMENT, so we don't set it
            code: b.id,                // "abella" from JSON
            name: b.name,              // "Abella"
            latitude: b.center[1],     // lat
            longitude: b.center[0],    // lng
            boundary_geojson: null,    // you can later load from b.file if you want
            created_at: new Date(),
            updated_at: new Date(),
        }));

        await queryInterface.bulkInsert('barangays', rows, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('barangays', null, {});
    },
};