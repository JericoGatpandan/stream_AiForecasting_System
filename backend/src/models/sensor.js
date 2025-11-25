module.exports = (sequelize, DataTypes) => {
    const Sensor = sequelize.define('Sensor', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
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
        name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('water_level', 'rainfall', 'flow_rate', 'weather', 'other'),
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING(32),
            allowNull: false,
            comment: 'e.g. m, mm, m3/s',
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
            allowNull: false,
            defaultValue: 'active',
        },
    }, {
        tableName: 'sensors',
        underscored: true,
    });

    Sensor.associate = (models) => {
        Sensor.belongsTo(models.Barangay, {
            foreignKey: 'barangay_id',
            as: 'barangay',
        });

        Sensor.hasMany(models.SensorReading, {
            foreignKey: 'sensor_id',
            as: 'readings',
        });
    };

    return Sensor;
};