/**
 * Data utility functions for accessing sensor and barangay information
 */

/**
 * Fetches all available barangays
 * @returns {Promise<Array>} List of barangays
 */
export async function fetchBarangays() {
    try {
        const response = await fetch('/data/barangays.json');
        const data = await response.json();
        return data.barangays;
    } catch (error) {
        console.error('Error fetching barangays:', error);
        return [];
    }
}

/**
 * Fetches a specific barangay GeoJSON data
 * @param {string} barangayId - ID of the barangay
 * @returns {Promise<Object>} GeoJSON data
 */
export async function fetchBarangayGeoJSON(barangayId) {
    try {
        const response = await fetch(`/data/barangays/${barangayId}.geojson`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching GeoJSON for ${barangayId}:`, error);
        return null;
    }
}

/**
 * Fetches all sensor data
 * @returns {Promise<Array>} List of sensors with their latest readings
 */
export async function fetchSensors() {
    try {
        const response = await fetch('/data/sensors.json');
        const data = await response.json();
        return data.sensors;
    } catch (error) {
        console.error('Error fetching sensors:', error);
        return [];
    }
}

/**
 * Fetches sensors for a specific barangay
 * @param {string} barangayId - ID of the barangay
 * @returns {Promise<Array>} List of sensors in the specified barangay
 */
export async function fetchBarangaySensors(barangayId) {
    try {
        const allSensors = await fetchSensors();
        return allSensors.filter(sensor => sensor.barangay.toLowerCase() === barangayId.toLowerCase());
    } catch (error) {
        console.error(`Error fetching sensors for ${barangayId}:`, error);
        return [];
    }
}

/**
 * Converts sensor data to GeoJSON format for map display
 * @param {Array} sensors - Array of sensor objects
 * @param {string} layerKey - Layer key for determining color and radius
 * @returns {Object} GeoJSON FeatureCollection
 */
export function sensorsToGeoJSON(sensors, layerKey = 'temperature') {
    return {
        type: 'FeatureCollection',
        features: sensors.map((s) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
            properties: {
                id: s.id,
                name: s.name,
                barangay: s.barangay,
                status: s.status,
                ...s.readings,
                // These should be calculated by your existing functions
                // color: getColorByLayer(s.readings, layerKey),
                // radius: getRadiusByLayer(s.readings, layerKey)
            }
        }))
    };
}