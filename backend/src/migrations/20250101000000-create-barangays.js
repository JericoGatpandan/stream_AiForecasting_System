'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('barangays', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            code: {
                type: Sequelize.STRING(32),
                allowNull: false,
                unique: true,
                comment: 'LGU code or internal code',
            },
            name: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            latitude: {
                type: Sequelize.DECIMAL(10, 8),
                allowNull: false,
            },
            longitude: {
                type: Sequelize.DECIMAL(11, 8),
                allowNull: false,
            },
            boundary_geojson: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Optional GeoJSON boundary for Mapbox',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('barangays');
    },
};