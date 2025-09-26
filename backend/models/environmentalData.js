module.exports = (sequelize, DataTypes) => {
  const EnvironmentalData = sequelize.define("EnvironmentalData", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    barangay_id: {
      type: DataTypes.STRING,
      allowNull: true, // Keep nullable for backward compatibility
      references: {
        model: 'Barangays',
        key: 'id'
      }
    },
    barangay: {
      type: DataTypes.STRING,
      allowNull: true, // Keep for backward compatibility
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    rainfall_mm: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Rainfall in millimeters",
    },
    water_level_m: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Water level in meters",
    },
    flow_velocity_ms: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Flow velocity in meters per second",
    },
    wind_speed_mps: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Wind speed in meters per second",
    },
    wind_direction: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Wind direction",
    },
    temperature_c: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Temperature in Celsius",
    },
    humidity_percent: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Humidity percentage",
    },
    atmospheric_pressure: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Atmospheric pressure in hPa",
    },
    soil_moisture: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Soil moisture percentage",
    },
    data_source: {
      type: DataTypes.ENUM('sensor', 'weather_api', 'manual', 'estimated'),
      allowNull: false,
      defaultValue: 'sensor',
      comment: "Source of the data",
    },
    quality_flag: {
      type: DataTypes.ENUM('good', 'questionable', 'poor', 'estimated'),
      allowNull: false,
      defaultValue: 'good',
      comment: "Data quality indicator",
    },
  }, {
    indexes: [
      {
        fields: ['barangay_id']
      },
      {
        fields: ['barangay'] // Keep for backward compatibility
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['data_source']
      },
      {
        fields: ['quality_flag']
      }
    ]
  });

  EnvironmentalData.associate = function(models) {
    EnvironmentalData.belongsTo(models.Barangay, {
      foreignKey: 'barangay_id',
      as: 'barangay_info'
    });
  };

  return EnvironmentalData;
};
