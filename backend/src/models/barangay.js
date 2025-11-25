module.exports = (sequelize, DataTypes) => {
    const Barangay = sequelize.define('Barangay', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
            comment: 'LGU code or internal code',
        },
        name: {
            type: DataTypes.STRING(191),
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
        },
        boundary_geojson: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Optional GeoJSON boundary for Mapbox',
        },
    }, {
        tableName: 'barangays',
        underscored: true,
    });

    Barangay.associate = (models) => {
        Barangay.hasMany(models.Sensor, {
            foreignKey: 'barangay_id',
            as: 'sensors',
        });

        Barangay.hasMany(models.EnvironmentalData, {
            foreignKey: 'barangay_id',
            as: 'environmentalData',
        });

        Barangay.hasMany(models.Prediction, {
            foreignKey: 'barangay_id',
            as: 'predictions',
        });
    };

    return Barangay;
};