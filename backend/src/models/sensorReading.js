module.exports = (sequelize, DataTypes) => {
    const SensorReading = sequelize.define('SensorReading', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        sensor_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'sensors',
                key: 'id',
            },
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        quality_flag: {
            type: DataTypes.ENUM('ok', 'missing', 'estimated', 'error'),
            allowNull: false,
            defaultValue: 'ok',
        },
    }, {
        tableName: 'sensor_readings',
        underscored: true,
        indexes: [
            {
                fields: ['sensor_id', 'timestamp'],
            },
        ],
    });

    SensorReading.associate = (models) => {
        SensorReading.belongsTo(models.Sensor, {
            foreignKey: 'sensor_id',
            as: 'sensor',
        });
    };

    return SensorReading;
};