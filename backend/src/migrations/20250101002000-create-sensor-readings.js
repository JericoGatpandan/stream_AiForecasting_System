'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sensor_readings', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            sensor_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'sensors',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            timestamp: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            value: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            quality_flag: {
                type: Sequelize.ENUM('ok', 'missing', 'estimated', 'error'),
                allowNull: false,
                defaultValue: 'ok',
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

        await queryInterface.addIndex('sensor_readings', ['sensor_id', 'timestamp']);
        await queryInterface.addIndex('sensor_readings', ['timestamp']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('sensor_readings');
    },
};