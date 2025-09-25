module.exports = (sequelize, DataTypes) => {
  const WeatherTrigger = sequelize.define("WeatherTrigger", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
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
    condition_type: {
      type: DataTypes.ENUM('temperature', 'precipitation', 'wind_speed', 'humidity', 'visibility', 'uv_index'),
      allowNull: false,
    },
    operator: {
      type: DataTypes.ENUM('greater_than', 'less_than', 'equals', 'greater_equal', 'less_equal'),
      allowNull: false,
    },
    threshold_value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notification_method: {
      type: DataTypes.ENUM('email', 'sms', 'push', 'in_app'),
      allowNull: false,
      defaultValue: 'in_app',
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default_user',
    },
    last_triggered: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return WeatherTrigger;
};
