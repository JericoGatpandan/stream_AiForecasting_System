module.exports = (sequelize, DataTypes) => {
  const FloodCharacteristics = sequelize.define("FloodCharacteristics", {
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
    maximum_depth: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Maximum flood depth in meters'
    },
    maximum_depth_uncertainty: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Uncertainty in maximum depth (±)'
    },
    peak_velocity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Peak flood velocity in m/s'
    },
    peak_velocity_uncertainty: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Uncertainty in peak velocity (±)'
    },
    arrival_time: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Time to peak flood in hours'
    },
    arrival_time_uncertainty: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Uncertainty in arrival time (±)'
    },
    inundation_area: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Inundation area in km²'
    },
    inundation_area_uncertainty: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Uncertainty in inundation area (±)'
    },
    flood_risk_level: {
      type: DataTypes.ENUM('low', 'moderate', 'high', 'extreme'),
      allowNull: false,
      defaultValue: 'low',
    },
    model_version: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'v1.0',
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    expert_analysis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Expert analysis of flood characteristics'
    },
    recommended_actions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Recommended actions based on flood characteristics'
    }
  }, {
    tableName: 'flood_characteristics',
    timestamps: true,
    indexes: [
      {
        fields: ['location']
      },
      {
        fields: ['flood_risk_level']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return FloodCharacteristics;
};
