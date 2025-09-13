const { FloodCharacteristics } = require('./models');
const moment = require('moment');

async function seedFloodData() {
  try {
    console.log('Starting flood characteristics data seeding...');

    // Clear existing flood data
    await FloodCharacteristics.destroy({ where: {} });

    const locations = [
      "Abella", "Bagumbayan Norte", "Bagumbayan Sur", "Balatas", "Calauag",
      "Cararayan", "Carolina", "Concepcion Grande", "Concepcion Pequena", "Dayangdang",
      "Del Rosario", "Dinaga", "Igualdad Interior", "Lerma", "Liboton",
      "Mabolo", "Pacol", "Panicuason", "Penafrancia", "Sabang",
      "San Felipe", "San Francisco", "San Isidro", "Santa Cruz", "Tabuco",
      "Tinago", "Triangulo"
    ];

    const barangayCoords = {
      "Abella": { lat: 13.6235, lng: 123.1934 },
      "Bagumbayan Norte": { lat: 13.6262, lng: 123.2001 },
      "Bagumbayan Sur": { lat: 13.6229, lng: 123.1995 },
      "Balatas": { lat: 13.6210, lng: 123.1812 },
      "Calauag": { lat: 13.6175, lng: 123.1857 },
      "Cararayan": { lat: 13.6408, lng: 123.1759 },
      "Carolina": { lat: 13.6150, lng: 123.1900 },
      "Concepcion Grande": { lat: 13.6144, lng: 123.2031 },
      "Concepcion Pequena": { lat: 13.6135, lng: 123.1984 },
      "Dayangdang": { lat: 13.6218, lng: 123.1910 },
      "Del Rosario": { lat: 13.6350, lng: 123.1973 },
      "Dinaga": { lat: 13.6213, lng: 123.1922 },
      "Igualdad Interior": { lat: 13.6219, lng: 123.1948 },
      "Lerma": { lat: 13.6200, lng: 123.1950 },
      "Liboton": { lat: 13.6201, lng: 123.1962 },
      "Mabolo": { lat: 13.6195, lng: 123.1991 },
      "Pacol": { lat: 13.6067, lng: 123.2203 },
      "Panicuason": { lat: 13.6042, lng: 123.2657 },
      "Penafrancia": { lat: 13.6187, lng: 123.1854 },
      "Sabang": { lat: 13.6224, lng: 123.1976 },
      "San Felipe": { lat: 13.6147, lng: 123.2082 },
      "San Francisco": { lat: 13.6210, lng: 123.1902 },
      "San Isidro": { lat: 13.6089, lng: 123.2275 },
      "Santa Cruz": { lat: 13.6180, lng: 123.1928 },
      "Tabuco": { lat: 13.6227, lng: 123.1956 },
      "Tinago": { lat: 13.6205, lng: 123.1899 },
      "Triangulo": { lat: 13.6198, lng: 123.1941 }
    };

    // Base flood characteristics from your model results
    const baseFloodData = {
      maximum_depth: 1.8,
      maximum_depth_uncertainty: 0.4,
      peak_velocity: 3.2,
      peak_velocity_uncertainty: 0.8,
      arrival_time: 2.1,
      arrival_time_uncertainty: 0.3,
      inundation_area: 12.5,
      inundation_area_uncertainty: 3.2
    };

    for (const location of locations) {
      const coords = barangayCoords[location] || { lat: 13.62, lng: 123.19 };
      
      // Add some variation to the base data for each location
      const variation = () => (Math.random() - 0.5) * 0.3; // ±15% variation
      
      const floodData = {
        location,
        latitude: coords.lat + variation() * 0.01,
        longitude: coords.lng + variation() * 0.01,
        maximum_depth: Math.max(0.5, baseFloodData.maximum_depth + variation()),
        maximum_depth_uncertainty: baseFloodData.maximum_depth_uncertainty + Math.random() * 0.1,
        peak_velocity: Math.max(0.5, baseFloodData.peak_velocity + variation()),
        peak_velocity_uncertainty: baseFloodData.peak_velocity_uncertainty + Math.random() * 0.1,
        arrival_time: Math.max(0.5, baseFloodData.arrival_time + variation()),
        arrival_time_uncertainty: baseFloodData.arrival_time_uncertainty + Math.random() * 0.1,
        inundation_area: Math.max(1.0, baseFloodData.inundation_area + variation() * 2),
        inundation_area_uncertainty: baseFloodData.inundation_area_uncertainty + Math.random() * 0.5,
        flood_risk_level: calculateRiskLevel(baseFloodData.maximum_depth + variation(), baseFloodData.peak_velocity + variation()),
        model_version: 'v1.0',
        last_updated: moment().subtract(Math.floor(Math.random() * 24), 'hours').toDate(),
        is_active: true,
        expert_analysis: generateExpertAnalysis(location, baseFloodData.maximum_depth + variation()),
        recommended_actions: generateRecommendedActions(baseFloodData.maximum_depth + variation(), baseFloodData.peak_velocity + variation())
      };

      await FloodCharacteristics.create(floodData);
    }

    console.log('Flood characteristics data seeding completed successfully!');
    console.log(`Created flood characteristics data for ${locations.length} locations`);

  } catch (error) {
    console.error('Error seeding flood characteristics data:', error);
  }
}

function calculateRiskLevel(depth, velocity) {
  if (depth > 2.0 || velocity > 3.5) return 'extreme';
  if (depth > 1.5 || velocity > 2.5) return 'high';
  if (depth > 1.0 || velocity > 1.5) return 'moderate';
  return 'low';
}

function generateExpertAnalysis(location, depth) {
  const analyses = [
    `Flood modeling for ${location} indicates moderate to high flood risk based on current hydrological conditions. The predicted maximum depth of ${depth.toFixed(1)}m suggests significant inundation potential.`,
    `Hydrological analysis for ${location} shows concerning flood characteristics. With a maximum depth of ${depth.toFixed(1)}m, this area is at elevated risk during heavy rainfall events.`,
    `Flood risk assessment for ${location} reveals substantial inundation potential. The predicted depth of ${depth.toFixed(1)}m indicates that this area requires immediate attention and preparedness measures.`,
    `Based on current flood modeling, ${location} shows significant flood vulnerability. The maximum depth of ${depth.toFixed(1)}m suggests that residents should be prepared for potential evacuation scenarios.`
  ];
  
  return analyses[Math.floor(Math.random() * analyses.length)];
}

function generateRecommendedActions(depth, velocity) {
  if (depth > 2.0 || velocity > 3.5) {
    return 'IMMEDIATE EVACUATION REQUIRED. Move to higher ground immediately. Avoid walking or driving through floodwaters. Contact emergency services.';
  } else if (depth > 1.5 || velocity > 2.5) {
    return 'HIGH ALERT: Prepare for evacuation. Secure important documents and valuables. Avoid unnecessary travel. Monitor water levels closely.';
  } else if (depth > 1.0 || velocity > 1.5) {
    return 'MODERATE ALERT: Stay informed about weather updates. Prepare emergency supplies. Avoid low-lying areas. Be ready to evacuate if conditions worsen.';
  } else {
    return 'LOW ALERT: Monitor weather conditions. Keep emergency supplies ready. Stay informed about local flood warnings.';
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedFloodData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Flood data seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedFloodData;
