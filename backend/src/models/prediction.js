module.exports = (sequelize, DataTypes) => {
    const Prediction = sequelize.define('Prediction', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        barangay_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'barangays',
                key: 'id',
            },
        },
        model_run_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'model_runs',
                key: 'id',
            },
        },
        forecast_for: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Timestamp the prediction is about',
        },
        generated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'When this prediction was generated',
        },
        predicted_water_level_m: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        predicted_risk_level: {
            type: DataTypes.ENUM('none', 'low', 'moderate', 'high', 'critical'),
            allowNull: false,
            defaultValue: 'none',
        },
        confidence: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: { min: 0.0, max: 1.0 },
        },
        validated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        validated_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true, // future relation to User
        },
        validation_status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'predictions',
        underscored: true,
        indexes: [
            {
                fields: ['barangay_id', 'forecast_for'],
            },
        ],
    });

    Prediction.associate = (models) => {
        Prediction.belongsTo(models.Barangay, {
            foreignKey: 'barangay_id',
            as: 'barangay',
        });

        Prediction.belongsTo(models.ModelRun, {
            foreignKey: 'model_run_id',
            as: 'modelRun',
        });
    };

    return Prediction;
};