const { WeatherForecast, WeatherAlert, UserLocation, WeatherTrigger, Notification } = require('./models');
const moment = require('moment');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await WeatherForecast.destroy({ where: {} });
    await WeatherAlert.destroy({ where: {} });
    await UserLocation.destroy({ where: {} });
    await WeatherTrigger.destroy({ where: {} });
    await Notification.destroy({ where: {} });

    const locations = [
      "Abella",
      "Bagumbayan Norte",
      "Bagumbayan Sur",
      "Balatas",
      "Calauag",
      "Cararayan",
      "Concepcion Grande",
      "Concepcion Pequena",
      "Dayangdang",
      "Del Rosario",
      "Dinaga",
      "Igualdad Interior",
      "Liboton",
      "Mabolo",
      "Pacol",
      "Panicuason",
      "Penafrancia",
      "Sabang",
      "San Felipe",
      "San Francisco",
      "San Isidro",
      "San Jose",
      "Sta. Cruz",
      "Tabuco",
      "Tinago",
      "Triangulo"
    ];

    const barangayCoords = {
      "Abella": { lat: 13.6235, lng: 123.1934 },
      "Bagumbayan Norte": { lat: 13.6262, lng: 123.2001 },
      "Bagumbayan Sur": { lat: 13.6229, lng: 123.1995 },
      "Balatas": { lat: 13.6210, lng: 123.1812 },
      "Calauag": { lat: 13.6175, lng: 123.1857 },
      "Cararayan": { lat: 13.6408, lng: 123.1759 },
      "Concepcion Grande": { lat: 13.6144, lng: 123.2031 },
      "Concepcion Pequena": { lat: 13.6135, lng: 123.1984 },
      "Dayangdang": { lat: 13.6218, lng: 123.1910 },
      "Del Rosario": { lat: 13.6350, lng: 123.1973 },
      "Dinaga": { lat: 13.6213, lng: 123.1922 },
      "Igualdad Interior": { lat: 13.6219, lng: 123.1948 },
      "Liboton": { lat: 13.6201, lng: 123.1962 },
      "Mabolo": { lat: 13.6195, lng: 123.1991 },
      "Pacol": { lat: 13.6067, lng: 123.2203 },
      "Panicuason": { lat: 13.6042, lng: 123.2657 },
      "Penafrancia": { lat: 13.6187, lng: 123.1854 },
      "Sabang": { lat: 13.6224, lng: 123.1976 },
      "San Felipe": { lat: 13.6147, lng: 123.2082 },
      "San Francisco": { lat: 13.6210, lng: 123.1902 },
      "San Isidro": { lat: 13.6089, lng: 123.2275 },
      "San Jose": { lat: 13.6075, lng: 123.2120 },
      "Sta. Cruz": { lat: 13.6180, lng: 123.1928 },
      "Tabuco": { lat: 13.6227, lng: 123.1956 },
      "Tinago": { lat: 13.6205, lng: 123.1899 },
      "Triangulo": { lat: 13.6198, lng: 123.1941 }
    };


    const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Overcast'];

    for (const location of locations) {
      for (let i = 0; i < 7; i++) {
        const forecastDate = moment().add(i, 'days').toDate();
        const temperatureMin = Math.floor(Math.random() * 10) + 20;
        const temperatureMax = temperatureMin + Math.floor(Math.random() * 8) + 2;

        await WeatherForecast.create({
          location,
          latitude: 13.62 + (Math.random() - 0.5) * 0.1,
          longitude: 123.19 + (Math.random() - 0.5) * 0.1,
          forecast_date: forecastDate,
          temperature_min: temperatureMin,
          temperature_max: temperatureMax,
          humidity: Math.floor(Math.random() * 30) + 60,
          precipitation_probability: Math.floor(Math.random() * 100),
          precipitation_amount: Math.random() * 20,
          wind_speed: Math.random() * 20,
          wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
          visibility: Math.random() * 20 + 5,
          uv_index: Math.random() * 10,
          weather_condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
          expert_analysis: `Meteorological analysis for ${location}: Current atmospheric conditions show ${weatherConditions[Math.floor(Math.random() * weatherConditions.length)].toLowerCase()} patterns with moderate pressure systems influencing local weather. Wind patterns indicate ${['easterly', 'westerly', 'northerly', 'southerly'][Math.floor(Math.random() * 4)]} flow affecting temperature and precipitation distribution.`,
          severity_level: ['low', 'moderate', 'high', 'severe'][Math.floor(Math.random() * 4)]
        });
      }
    }

    // Seed Weather Alerts
    const alertTypes = ['severe_weather', 'flood_warning', 'storm_warning', 'heat_warning', 'cold_warning', 'wind_warning'];
    const severities = ['minor', 'moderate', 'severe', 'extreme'];

    for (let i = 0; i < 10; i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      await WeatherAlert.create({
        location,
        latitude: 13.62 + (Math.random() - 0.5) * 0.1,
        longitude: 123.19 + (Math.random() - 0.5) * 0.1,
        alert_type: alertType,
        severity,
        title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} ${alertType.replace('_', ' ')} Alert`,
        description: `A ${severity} ${alertType.replace('_', ' ')} has been issued for ${location}. Please take necessary precautions and stay informed about changing conditions.`,
        start_time: moment().subtract(Math.floor(Math.random() * 24), 'hours').toDate(),
        end_time: moment().add(Math.floor(Math.random() * 48) + 24, 'hours').toDate(),
        is_active: Math.random() > 0.3,
        industry_impact: {
          agriculture: severity === 'severe' || severity === 'extreme' ? 'High' : 'Low',
          transportation: severity === 'severe' || severity === 'extreme' ? 'High' : 'Moderate',
          construction: severity === 'severe' || severity === 'extreme' ? 'High' : 'Low'
        },
        recommended_actions: severity === 'severe' || severity === 'extreme'
          ? 'Avoid outdoor activities, secure loose objects, and prepare emergency supplies.'
          : 'Monitor weather updates and be prepared for changing conditions.'
      });
    }

    // Seed User Locations
    // Seed User Locations
    for (const location of locations) {
      const coords = barangayCoords[location] || { lat: 13.62, lng: 123.19 };

      await UserLocation.create({
        name: location,
        latitude: coords.lat,
        longitude: coords.lng,
        address: `${location}, Naga City, Philippines`,
        is_favorite: Math.random() > 0.5,
        notification_enabled: true,
        user_id: 'default_user'
      });
    }


    // Seed Weather Triggers
    const conditionTypes = ['temperature', 'precipitation', 'wind_speed', 'humidity', 'visibility', 'uv_index'];
    const operators = ['greater_than', 'less_than', 'equals', 'greater_equal', 'less_equal'];

    for (let i = 0; i < 8; i++) {
      const conditionType = conditionTypes[Math.floor(Math.random() * conditionTypes.length)];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      await WeatherTrigger.create({
        name: `${conditionType.charAt(0).toUpperCase() + conditionType.slice(1)} Alert for ${location}`,
        location,
        latitude: 13.62 + (Math.random() - 0.5) * 0.1,
        longitude: 123.19 + (Math.random() - 0.5) * 0.1,
        condition_type: conditionType,
        operator,
        threshold_value: Math.random() * 50,
        is_active: Math.random() > 0.2,
        notification_method: 'in_app',
        user_id: 'default_user',
        last_triggered: Math.random() > 0.7 ? moment().subtract(Math.floor(Math.random() * 7), 'days').toDate() : null
      });
    }

    // Seed Notifications
    const notificationTypes = ['weather_alert', 'trigger_alert', 'forecast_update', 'severe_weather'];
    const notificationSeverities = ['info', 'warning', 'critical'];

    for (let i = 0; i < 50; i++) { // increased count for variety across all barangays
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const severity = notificationSeverities[Math.floor(Math.random() * notificationSeverities.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      await Notification.create({
        user_id: 'default_user',
        type,
        title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} ${type.replace('_', ' ')}`,
        message: `Weather update for ${location}: ${type.replace('_', ' ')} detected. Please review the latest forecast and take appropriate action.`,
        location,
        severity,
        is_read: Math.random() > 0.6,
        sent_at: moment().subtract(Math.floor(Math.random() * 72), 'hours').toDate(),
        read_at: Math.random() > 0.6
          ? moment().subtract(Math.floor(Math.random() * 24), 'hours').toDate()
          : null,
        metadata: {
          alert_id: Math.floor(Math.random() * 10) + 1,
          trigger_id: Math.floor(Math.random() * 8) + 1
        }
      });
    }


    console.log('Database seeding completed successfully!');
    console.log(`Created:
    - ${await WeatherForecast.count()} weather forecasts
    - ${await WeatherAlert.count()} weather alerts
    - ${await UserLocation.count()} user locations
    - ${await WeatherTrigger.count()} weather triggers
    - ${await Notification.count()} notifications`);

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedDatabase;
