module.exports = (sequelize, DataTypes) => {
  const WeatherForecast = sequelize.define("WeatherForecast", {
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
    forecast_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    temperature_min: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    temperature_max: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    precipitation_probability: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    precipitation_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    wind_speed: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    wind_direction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    visibility: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    uv_index: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    weather_condition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expert_analysis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    severity_level: {
      type: DataTypes.ENUM('low', 'moderate', 'high', 'severe'),
      allowNull: false,
      defaultValue: 'low',
    },
  });

  return WeatherForecast;
};
