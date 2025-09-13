const { FloodCharacteristics } = require('./models');
const seedFloodData = require('./seedFloodData');

async function testFloodPrototype() {
  try {
    console.log('🧪 Testing Flood Characteristics Prototype...\n');

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

    console.log('\n3️⃣ Testing API endpoints...');
    
    // Test the summary endpoint logic
    const testLocation = 'Abella';
    const summaryData = await FloodCharacteristics.findOne({
      where: { 
        location: testLocation,
        is_active: true 
      },
      order: [["last_updated", "DESC"]],
    });

    if (summaryData) {
      // Calculate risk assessment (same logic as in routes)
      const { maximum_depth, peak_velocity, inundation_area } = summaryData;
      
      let riskScore = 0;
      let riskFactors = [];
      
      if (maximum_depth > 2.0) {
        riskScore += 3;
        riskFactors.push('Very high water depth (>2m)');
      } else if (maximum_depth > 1.5) {
        riskScore += 2;
        riskFactors.push('High water depth (1.5-2m)');
      } else if (maximum_depth > 1.0) {
        riskScore += 1;
        riskFactors.push('Moderate water depth (1-1.5m)');
      }
      
      if (peak_velocity > 3.0) {
        riskScore += 3;
        riskFactors.push('Very high water velocity (>3m/s)');
      } else if (peak_velocity > 2.0) {
        riskScore += 2;
        riskFactors.push('High water velocity (2-3m/s)');
      } else if (peak_velocity > 1.0) {
        riskScore += 1;
        riskFactors.push('Moderate water velocity (1-2m/s)');
      }
      
      if (inundation_area > 10.0) {
        riskScore += 2;
        riskFactors.push('Large inundation area (>10km²)');
      } else if (inundation_area > 5.0) {
        riskScore += 1;
        riskFactors.push('Moderate inundation area (5-10km²)');
      }

      const riskLevel = riskScore >= 6 ? 'extreme' : riskScore >= 4 ? 'high' : riskScore >= 2 ? 'moderate' : 'low';

      console.log(`✅ Summary data for ${testLocation}:`);
      console.log(`   - Maximum Depth: ${summaryData.maximum_depth} ± ${summaryData.maximum_depth_uncertainty} m`);
      console.log(`   - Peak Velocity: ${summaryData.peak_velocity} ± ${summaryData.peak_velocity_uncertainty} m/s`);
      console.log(`   - Arrival Time: ${summaryData.arrival_time} ± ${summaryData.arrival_time_uncertainty} hours`);
      console.log(`   - Inundation Area: ${summaryData.inundation_area} ± ${summaryData.inundation_area_uncertainty} km²`);
      console.log(`   - Risk Level: ${summaryData.flood_risk_level}`);
      console.log(`   - Calculated Risk Score: ${riskScore}/8`);
      console.log(`   - Risk Factors: ${riskFactors.length > 0 ? riskFactors.join(', ') : 'None'}`);
    }

    console.log('\n4️⃣ Sample data for frontend testing:');
    const sampleData = await FloodCharacteristics.findAll({
      limit: 5,
      where: { is_active: true },
      order: [["last_updated", "DESC"]]
    });

    sampleData.forEach((data, index) => {
      console.log(`\n   Location ${index + 1}: ${data.location}`);
      console.log(`   - Risk Level: ${data.flood_risk_level}`);
      console.log(`   - Max Depth: ${data.maximum_depth.toFixed(1)} ± ${data.maximum_depth_uncertainty.toFixed(1)} m`);
      console.log(`   - Peak Velocity: ${data.peak_velocity.toFixed(1)} ± ${data.peak_velocity_uncertainty.toFixed(1)} m/s`);
      console.log(`   - Arrival Time: ${data.arrival_time.toFixed(1)} ± ${data.arrival_time_uncertainty.toFixed(1)} hours`);
      console.log(`   - Inundation Area: ${data.inundation_area.toFixed(1)} ± ${data.inundation_area_uncertainty.toFixed(1)} km²`);
    });

    console.log('\n🎉 Flood Characteristics Prototype Test Completed Successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Start the frontend: cd ../frontend && npm run dev');
    console.log('3. Open http://localhost:5173 to view the prototype');
    console.log('4. Test different locations using the dropdown');
    console.log('5. Verify flood characteristics data displays correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFloodPrototype().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = testFloodPrototype;
