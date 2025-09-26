module.exports = (sequelize, DataTypes) => {
  const FloodPrediction = sequelize.define("FloodPrediction", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    barangay_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Barangays',
        key: 'id'
      }
    },
    prediction_timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "When this prediction was generated",
    },
    forecast_start: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Start time of the forecast period",
    },
    forecast_end: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "End time of the forecast period",
    },
    flood_probability: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "Probability of flooding (0.0 to 1.0)",
      validate: {
        min: 0.0,
        max: 1.0
      }
    },
    risk_level: {
      type: DataTypes.ENUM('low', 'moderate', 'high', 'severe', 'extreme'),
      allowNull: false,
      comment: "Categorized flood risk level",
    },
    predicted_water_level: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Predicted maximum water level in meters",
    },
    predicted_rainfall: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Predicted rainfall amount in mm",
    },
    affected_area_km2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Estimated affected area in square kilometers",
    },
    population_at_risk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Estimated number of people at risk",
    },
    confidence_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      comment: "AI model confidence score (0.0 to 1.0)",
      validate: {
        min: 0.0,
        max: 1.0
      }
    },
    model_version: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1.0.0',
      comment: "Version of the AI model used",
    },
    input_features: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "JSON object containing input features used for prediction",
    },
    prediction_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional notes or warnings about the prediction",
    },
    is_alert_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether alert notifications have been sent",
    },
    alert_level: {
      type: DataTypes.ENUM('watch', 'warning', 'emergency'),
      allowNull: true,
      comment: "Alert level if alerts are warranted",
    },
    validation_status: {
      type: DataTypes.ENUM('pending', 'validated', 'false_positive', 'false_negative'),
      allowNull: false,
      defaultValue: 'pending',
      comment: "Post-event validation of prediction accuracy",
    },
    actual_outcome: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Actual flood outcomes for model validation",
    },
  }, {
    indexes: [
      {
        fields: ['barangay_id']
      },
      {
        fields: ['prediction_timestamp']
      },
      {
        fields: ['forecast_start', 'forecast_end']
      },
      {
        fields: ['risk_level']
      },
      {
        fields: ['flood_probability']
      },
      {
        fields: ['model_version']
      },
      {
        fields: ['validation_status']
      }
    ]
  });

  FloodPrediction.associate = function(models) {
    FloodPrediction.belongsTo(models.Barangay, {
      foreignKey: 'barangay_id',
      as: 'barangay'
    });
    // Ensure models.FloodAlert is properly defined as a Sequelize model before this association is made.
    // The error indicates that models.FloodAlert is not a subclass of Sequelize.Model.
    // Please check models/FloodAlert.js and models/index.js to ensure FloodAlert is correctly defined and loaded.
    // FloodPrediction.hasMany(models.FloodAlert, {
    //   foreignKey: 'prediction_id',
    //   as: 'alerts'
    // });
  };

  return FloodPrediction;
};