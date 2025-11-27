'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sensors', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
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
            name: {
                type: Sequelize.STRING(191),
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM('water_level', 'rainfall', 'flow_rate', 'weather', 'other'),
                allowNull: false,
            },
            unit: {
                type: Sequelize.STRING(32),
                allowNull: false,
                comment: 'e.g. m, mm, m3/s',
            },
            latitude: {
                type: Sequelize.DECIMAL(10, 8),
                allowNull: false,
            },
            longitude: {
                type: Sequelize.DECIMAL(11, 8),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
                allowNull: false,
                defaultValue: 'active',
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

        await queryInterface.addIndex('sensors', ['barangay_id']);
        await queryInterface.addIndex('sensors', ['type']);
        await queryInterface.addIndex('sensors', ['status']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('sensors');
    },
};