module.exports = (sequelize, DataTypes) => {
  const EnvironmentalData = sequelize.define("EnvironmentalData", {
    barangay: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    rainfall_mm: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    water_level_m: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    flow_velocity_ms: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    wind_speed_mps: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    wind_direction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    temperature_c: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    humidity_percent: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  return EnvironmentalData;
};
