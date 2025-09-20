module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default_user',
    },
    type: {
      type: DataTypes.ENUM('weather_alert', 'trigger_alert', 'forecast_update', 'severe_weather'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    severity: {
      type: DataTypes.ENUM('info', 'warning', 'critical'),
      allowNull: false,
      defaultValue: 'info',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  return Notification;
};
