module.exports = (sequelize, DataTypes) => {
  const Sensor = sequelize.define("Sensor", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    barangay_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Barangays',
        key: 'id'
      }
    },
    sensor_type: {
      type: DataTypes.ENUM('water_level', 'rainfall', 'weather_station', 'flow_meter', 'multi_parameter'),
      allowNull: false,
      defaultValue: 'multi_parameter',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    altitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Elevation in meters above sea level",
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'error'),
      allowNull: false,
      defaultValue: 'active',
    },
    installation_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_maintenance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    calibration_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    battery_level: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Battery percentage (0-100)",
    },
    transmission_interval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 300,
      comment: "Data transmission interval in seconds",
    },
    watershed_zone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Specific watershed monitoring zone",
    },
    river_section: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "River or stream section being monitored",
    },
  }, {
    indexes: [
      {
        fields: ['barangay_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['sensor_type']
      },
      {
        fields: ['latitude', 'longitude']
      }
    ]
  });

  Sensor.associate = function(models) {
    Sensor.belongsTo(models.Barangay, {
      foreignKey: 'barangay_id',
      as: 'barangay'
    });
    Sensor.hasMany(models.SensorReading, {
      foreignKey: 'sensor_id',
      as: 'readings'
    });
  };

  return Sensor;
};