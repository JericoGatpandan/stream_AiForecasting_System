module.exports = (sequelize, DataTypes) => {
    const EnvironmentalData = sequelize.define('EnvironmentalData', {
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
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        rainfall_mm: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        temperature_c: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        humidity_percent: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        wind_speed_ms: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    }, {
        tableName: 'environmental_data',
        underscored: true,
        indexes: [
            {
                fields: ['barangay_id', 'timestamp'],
            },
        ],
    });

    EnvironmentalData.associate = (models) => {
        EnvironmentalData.belongsTo(models.Barangay, {
            foreignKey: 'barangay_id',
            as: 'barangay',
        });
    };

    return EnvironmentalData;
};