module.exports = (sequelize, DataTypes) => {
  const WeatherAlert = sequelize.define("WeatherAlert", {
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    alert_type: {
      type: DataTypes.ENUM('severe_weather', 'flood_warning', 'storm_warning', 'heat_warning', 'cold_warning', 'wind_warning'),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('minor', 'moderate', 'severe', 'extreme'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    industry_impact: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    recommended_actions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return WeatherAlert;
};
