module.exports = (sequelize, DataTypes) => {
  const SensorReading = sequelize.define("SensorReading", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sensor_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Sensors',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Water monitoring parameters
    water_level: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Water level in meters",
    },
    flow_velocity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Water flow velocity in m/s",
    },
    flow_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Flow rate in cubic meters per second",
    },
    water_temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Water temperature in Celsius",
    },
    turbidity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Water turbidity in NTU",
    },
    ph_level: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Water pH level",
    },
    dissolved_oxygen: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Dissolved oxygen in mg/L",
    },
    // Weather parameters
    rainfall: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Rainfall in millimeters",
    },
    air_temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Air temperature in Celsius",
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Relative humidity percentage",
    },
    wind_speed: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Wind speed in m/s",
    },
    wind_direction: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Wind direction (N, NE, E, SE, S, SW, W, NW)",
    },
    atmospheric_pressure: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Atmospheric pressure in hPa",
    },
    visibility: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Visibility in kilometers",
    },
    uv_index: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "UV index",
    },
    // System parameters
    battery_voltage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Battery voltage",
    },
    signal_strength: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Signal strength in dBm",
    },
    data_quality: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
      allowNull: false,
      defaultValue: 'good',
    },
    is_validated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether the reading has been validated",
    },
    validation_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes about data validation or anomalies",
    },
  }, {
    indexes: [
      {
        fields: ['sensor_id', 'timestamp']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['water_level']
      },
      {
        fields: ['rainfall']
      },
      {
        fields: ['data_quality']
      },
      {
        fields: ['is_validated']
      }
    ]
  });

  SensorReading.associate = function(models) {
    SensorReading.belongsTo(models.Sensor, {
      foreignKey: 'sensor_id',
      as: 'sensor'
    });
  };

  return SensorReading;
};