module.exports = (sequelize, DataTypes) => {
  const Barangay = sequelize.define("Barangay", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    center_lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      comment: "Latitude coordinate of barangay center",
    },
    center_lng: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      comment: "Longitude coordinate of barangay center",
    },
    zoom_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    geojson_file: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Reference to GeoJSON boundary file",
    },
    population: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    area_km2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Area in square kilometers",
    },
    flood_risk_level: {
      type: DataTypes.ENUM('low', 'moderate', 'high', 'very_high'),
      allowNull: false,
      defaultValue: 'moderate',
    },
    watershed_zone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Watershed classification zone",
    },
  }, {
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['flood_risk_level']
      },
      {
        fields: ['watershed_zone']
      }
    ]
  });

  Barangay.associate = function(models) {
    Barangay.hasMany(models.Sensor, {
      foreignKey: 'barangay_id',
      as: 'sensors'
    });
    Barangay.hasMany(models.EnvironmentalData, {
      foreignKey: 'barangay_id',
      as: 'environmental_data'
    });
    Barangay.hasMany(models.FloodPrediction, {
      foreignKey: 'barangay_id',
      as: 'flood_predictions'
    });
  };

  return Barangay;
};