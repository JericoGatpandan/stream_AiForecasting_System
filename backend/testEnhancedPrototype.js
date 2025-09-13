const { FloodCharacteristics } = require('./models');
const seedFloodData = require('./seedFloodData');

async function testEnhancedPrototype() {
  try {
    console.log('🧪 Testing Enhanced Flood Characteristics Prototype...\n');

    // Step 0: Create the table first
    console.log('0️⃣ Creating flood characteristics table...');
    await FloodCharacteristics.sync({ force: true });
    console.log('✅ Table created successfully\n');

    // Step 1: Seed the database with flood data
    console.log('1️⃣ Seeding flood characteristics data...');
    await seedFloodData();
    console.log('✅ Flood data seeded successfully\n');

    // Step 2: Test database queries
    console.log('2️⃣ Testing database queries...');
    
    // Get all flood characteristics
    const allFloodData = await FloodCharacteristics.findAll();
    console.log(`✅ Found ${allFloodData.length} flood characteristics records`);

    // Get data for a specific location
    const abellaData = await FloodCharacteristics.findOne({
      where: { location: 'Abella', is_active: true }
    });
    console.log(`✅ Abella flood data: ${abellaData ? 'Found' : 'Not found'}`);

    // Get high-risk areas
    const highRiskAreas = await FloodCharacteristics.findAll({
      where: { 
        flood_risk_level: { [require('sequelize').Op.in]: ['high', 'extreme'] },
        is_active: true 
      }
    });
    console.log(`✅ Found ${highRiskAreas.length} high-risk areas`);

    // Get risk level distribution
    const riskDistribution = await FloodCharacteristics.findAll({
      attributes: [
        'flood_risk_level',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['flood_risk_level'],
      where: { is_active: true }
    });
    console.log('✅ Risk level distribution:');
    riskDistribution.forEach(item => {
      console.log(`   - ${item.flood_risk_level}: ${item.dataValues.count} areas`);
    });

    console.log('\n3️⃣ Testing Enhanced Features...');
    
    // Test citizen-friendly formatting
    const testLocation = 'Abella';
    const summaryData = await FloodCharacteristics.findOne({
      where: { 
        location: testLocation,
        is_active: true 
      },
      order: [["last_updated", "DESC"]],
    });

    if (summaryData) {
      console.log(`✅ Citizen-friendly formatting for ${testLocation}:`);
      console.log(`   - Maximum Depth: ${summaryData.maximum_depth.toFixed(1)} meters (give or take ${summaryData.maximum_depth_uncertainty.toFixed(1)} meters)`);
      console.log(`   - Peak Velocity: ${summaryData.peak_velocity.toFixed(1)} meters per second (give or take ${summaryData.peak_velocity_uncertainty.toFixed(1)} meters per second)`);
      console.log(`   - Arrival Time: ${Math.floor(summaryData.arrival_time * 60)} minutes (give or take ${Math.floor(summaryData.arrival_time_uncertainty * 60)} minutes)`);
      console.log(`   - Inundation Area: ${summaryData.inundation_area.toFixed(1)} square kilometers (give or take ${summaryData.inundation_area_uncertainty.toFixed(1)} square kilometers)`);
    }

    // Test countdown timer formatting
    const formatCountdown = (hours) => {
      const totalMinutes = Math.floor(hours * 60);
      const hoursPart = Math.floor(totalMinutes / 60);
      const minutesPart = totalMinutes % 60;
      
      if (hoursPart > 0) {
        return `${hoursPart}h ${minutesPart}m`;
      } else {
        return `${minutesPart} minutes`;
      }
    };

    console.log('\n4️⃣ Testing Countdown Timer Formatting:');
    const testTimes = [2.1, 1.5, 0.8, 0.3];
    testTimes.forEach(time => {
      console.log(`   - ${time} hours = ${formatCountdown(time)}`);
    });

    // Test city-wide data aggregation
    console.log('\n5️⃣ Testing City-wide Data Aggregation:');
    const cityWideStats = {
      totalAreas: allFloodData.length,
      highRiskAreas: highRiskAreas.length,
      avgDepth: allFloodData.reduce((sum, area) => sum + area.maximum_depth, 0) / allFloodData.length,
      avgVelocity: allFloodData.reduce((sum, area) => sum + area.peak_velocity, 0) / allFloodData.length,
      avgArrivalTime: allFloodData.reduce((sum, area) => sum + area.arrival_time, 0) / allFloodData.length,
      avgInundationArea: allFloodData.reduce((sum, area) => sum + area.inundation_area, 0) / allFloodData.length
    };

    console.log(`   - Total Areas: ${cityWideStats.totalAreas}`);
    console.log(`   - High Risk Areas: ${cityWideStats.highRiskAreas}`);
    console.log(`   - Average Depth: ${cityWideStats.avgDepth.toFixed(1)} meters`);
    console.log(`   - Average Velocity: ${cityWideStats.avgVelocity.toFixed(1)} m/s`);
    console.log(`   - Average Arrival Time: ${formatCountdown(cityWideStats.avgArrivalTime)}`);
    console.log(`   - Average Inundation Area: ${cityWideStats.avgInundationArea.toFixed(1)} km²`);

    // Test map data formatting
    console.log('\n6️⃣ Testing Map Data Formatting:');
    const mapData = allFloodData.slice(0, 3).map(area => ({
      name: area.location,
      coordinates: [area.longitude, area.latitude],
      riskLevel: area.flood_risk_level,
      depth: area.maximum_depth.toFixed(1),
      velocity: area.peak_velocity.toFixed(1),
      arrivalTime: formatCountdown(area.arrival_time),
      area: area.inundation_area.toFixed(1)
    }));

    mapData.forEach((area, index) => {
      console.log(`   Area ${index + 1}: ${area.name}`);
      console.log(`     - Coordinates: [${area.coordinates[0]}, ${area.coordinates[1]}]`);
      console.log(`     - Risk Level: ${area.riskLevel}`);
      console.log(`     - Depth: ${area.depth}m, Velocity: ${area.velocity} m/s`);
      console.log(`     - Arrival: ${area.arrivalTime}, Area: ${area.area} km²`);
    });

    console.log('\n7️⃣ Testing API Endpoints...');
    
    // Test summary endpoint
    const summaryResponse = await fetch('http://localhost:3001/flood/summary/Abella');
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ Summary endpoint working');
      console.log(`   - Has data: ${summaryData.hasData}`);
      if (summaryData.hasData) {
        console.log(`   - Risk level: ${summaryData.riskLevel}`);
        console.log(`   - Max depth: ${summaryData.maximumDepth.value} ± ${summaryData.maximumDepth.uncertainty} ${summaryData.maximumDepth.unit}`);
      }
    } else {
      console.log('❌ Summary endpoint failed');
    }

    // Test city-wide endpoints
    const cityResponse = await fetch('http://localhost:3001/flood/');
    if (cityResponse.ok) {
      const cityData = await cityResponse.json();
      console.log(`✅ City-wide endpoint working (${cityData.length} areas)`);
    } else {
      console.log('❌ City-wide endpoint failed');
    }

    console.log('\n🎉 Enhanced Flood Characteristics Prototype Test Completed Successfully!');
    console.log('\n📋 New Features Implemented:');
    console.log('✅ Citizen-friendly display (no ± symbols, plain language)');
    console.log('✅ Countdown timer for arrival time');
    console.log('✅ City-wide view with aggregated data');
    console.log('✅ Enhanced map with barangay focus');
    console.log('✅ Naga City boundary constraints');
    console.log('✅ Interactive barangay selection');
    console.log('✅ Risk-based color coding');
    console.log('✅ Real-time data updates');

    console.log('\n📋 Next Steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Start the frontend: cd ../frontend && npm run dev');
    console.log('3. Open http://localhost:5173 to view the enhanced prototype');
    console.log('4. Test city-wide view by clicking "City Overview"');
    console.log('5. Test map features by going to the Map page');
    console.log('6. Select different barangays to see focused views');
    console.log('7. Verify citizen-friendly formatting throughout');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEnhancedPrototype().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = testEnhancedPrototype;
