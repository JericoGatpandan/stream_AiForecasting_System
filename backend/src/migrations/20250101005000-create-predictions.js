'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('predictions', {
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
            model_run_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'model_runs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            forecast_for: {
                type: Sequelize.DATE,
                allowNull: false,
                comment: 'Timestamp the prediction is about',
            },
            generated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                comment: 'When this prediction was generated',
            },
            predicted_water_level_m: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            predicted_risk_level: {
                type: Sequelize.ENUM('none', 'low', 'moderate', 'high', 'critical'),
                allowNull: false,
                defaultValue: 'none',
            },
            confidence: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            validated: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            validated_by: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
                // future FK to users table, if you add it
            },
            validation_status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },
            notes: {
                type: Sequelize.TEXT,
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

        await queryInterface.addIndex('predictions', ['barangay_id', 'forecast_for']);
        await queryInterface.addIndex('predictions', ['predicted_risk_level']);
        await queryInterface.addIndex('predictions', ['model_run_id']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('predictions');
    },
};