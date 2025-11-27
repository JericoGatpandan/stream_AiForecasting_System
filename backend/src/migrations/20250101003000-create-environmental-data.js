'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('environmental_data', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            barangay_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'barangays',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            timestamp: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            rainfall_mm: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            temperature_c: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            humidity_percent: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            wind_speed_ms: {
                type: Sequelize.FLOAT,
                allowNull: true,
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

        // OPTIONAL: keep a single-column index on timestamp only, with a different name
        await queryInterface.addIndex(
            'environmental_data',
            ['timestamp'],
            { name: 'environmental_data_timestamp' }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable('environmental_data');
    },
};