#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the barangays.json to get the list of barangay files
const barangaysFile = path.join(__dirname, 'data/barangays.json');
const outputFile = path.join(__dirname, 'data/barangays-combined.geojson');
const dataDir = path.join(__dirname, 'data/barangays');

async function combineBarangayGeoJSON() {
  try {
    console.log('🗺️  Combining barangay GeoJSON files...');
    
    // Read barangays list
    const barangaysData = JSON.parse(fs.readFileSync(barangaysFile, 'utf8'));
    const barangays = barangaysData.barangays;
    
    const combinedFeatures = [];
    let processedCount = 0;
    
    for (const barangay of barangays) {
      const geojsonPath = path.join(dataDir, `${barangay.id}.geojson`);
      
      try {
        if (fs.existsSync(geojsonPath)) {
          const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
          
          if (geojsonData.features && Array.isArray(geojsonData.features)) {
            // Add barangay metadata to each feature
            geojsonData.features.forEach(feature => {
              feature.properties = {
                ...(feature.properties || {}),
                barangay_id: barangay.id,
                barangay_name: barangay.name,
                barangay_status: barangay.status,
                barangay_center: barangay.center,
                barangay_zoom_level: barangay.zoom_level
              };
              combinedFeatures.push(feature);
            });
            
            processedCount++;
            console.log(`✅ Processed ${barangay.name} (${geojsonData.features.length} features)`);
          }
        } else {
          console.log(`⚠️  Missing GeoJSON file for ${barangay.name}: ${geojsonPath}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${barangay.name}:`, error.message);
      }
    }
    
    // Create combined GeoJSON
    const combinedGeoJSON = {
      type: 'FeatureCollection',
      metadata: {
        generated: new Date().toISOString(),
        source: 'AI Forecasting System - Barangay Boundaries',
        total_barangays: processedCount,
        total_features: combinedFeatures.length
      },
      features: combinedFeatures
    };
    
    // Write combined file
    fs.writeFileSync(outputFile, JSON.stringify(combinedGeoJSON, null, 2));
    
    console.log(`🎉 Successfully combined ${processedCount} barangays with ${combinedFeatures.length} features`);
    console.log(`📄 Output file: ${outputFile}`);
    console.log(`📊 File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
    
    // Calculate potential performance improvement
    const individualRequests = barangays.length;
    const savedRequests = individualRequests - 1;
    console.log(`⚡ Performance improvement: Reduced from ${individualRequests} HTTP requests to 1 request`);
    console.log(`🚀 Estimated load time reduction: ${savedRequests * 100}ms - ${savedRequests * 500}ms`);
    
  } catch (error) {
    console.error('❌ Error combining GeoJSON files:', error);
    process.exit(1);
  }
}

// Run the script
combineBarangayGeoJSON();
