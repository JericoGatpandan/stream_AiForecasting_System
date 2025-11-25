module.exports = (sequelize, DataTypes) => {
    const ModelRun = sequelize.define('ModelRun', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        model_name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        model_version: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        run_started_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        run_finished_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('success', 'failed', 'partial'),
            allowNull: false,
            defaultValue: 'success',
        },
        hyperparams: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        metrics: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'E.g. loss, accuracy, F1, etc.',
        },
    }, {
        tableName: 'model_runs',
        underscored: true,
    });

    ModelRun.associate = (models) => {
        ModelRun.hasMany(models.Prediction, {
            foreignKey: 'model_run_id',
            as: 'predictions',
        });
    };

    return ModelRun;
};