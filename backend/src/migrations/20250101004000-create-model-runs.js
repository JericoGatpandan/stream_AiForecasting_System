'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('model_runs', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            model_name: {
                type: Sequelize.STRING(40),
                allowNull: false,
            },
            model_version: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },
            run_started_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            run_finished_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('success', 'failed', 'partial'),
                allowNull: false,
                defaultValue: 'success',
            },
            hyperparams: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            metrics: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'E.g. loss, accuracy, etc.',
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

        await queryInterface.addIndex('model_runs', ['model_name', 'model_version']);
        await queryInterface.addIndex('model_runs', ['status']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('model_runs');
    },
};