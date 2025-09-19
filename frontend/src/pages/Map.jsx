
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Layers, Thermometer, Droplets, Wind, Eye, AlertTriangle, MapPin, Focus } from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { fetchBarangays, fetchBarangayGeoJSON, fetchSensors, sensorsToGeoJSON } from '../services/geoDataService';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map() {
  const [selectedLayer, setSelectedLayer] = useState('temperature');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoData, setGeoData] = useState(null);
  const [floodData, setFloodData] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(null); // object or null
  const [allBarangayGeoJSON, setAllBarangayGeoJSON] = useState(null); // merged boundaries
  const [panelsVisibility, setPanelsVisibility] = useState({ sensors: false, alerts: false, floods: false });
  const tokenMissing = !mapboxgl.accessToken;
  const [is3D, setIs3D] = useState(true);
  const [baseStyle, setBaseStyle] = useState('light'); // 'light' | 'satellite' | 'terrain' | 'dark'
  const [showBuildings, setShowBuildings] = useState(false);
  const [barangays, setBarangays] = useState([]);
  const [sensors, setSensors] = useState([]);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Load city boundary GeoJSON
  // useEffect(() => {
  //   fetch("/naga.geojson")
  //     .then((res) => res.json())
  //     .then((data) => setGeoData(data))
  //     .catch((err) => console.error("Error loading GeoJSON:", err));
  // }, []);

  // Load barangays & build merged boundaries once (optimized)
  useEffect(() => {
    const loadBarangaysOptimized = async () => {
      try {
        // Load barangay list and combined GeoJSON in parallel
        const [barangayList, combinedGeoJSON] = await Promise.allSettled([
          fetchBarangays(),
          fetch('/data/barangays-combined.geojson').then(r => r.json()).catch(() => null)
        ]);
        
        if (barangayList.status === 'fulfilled') {
          setBarangays(barangayList.value);
        }
        
        // If combined file exists, use it; otherwise fall back to individual loading
        if (combinedGeoJSON.status === 'fulfilled' && combinedGeoJSON.value) {
          console.log('Using combined barangay GeoJSON file');
          setAllBarangayGeoJSON(combinedGeoJSON.value);
        } else {
          console.log('Falling back to individual barangay GeoJSON loading');
          // Fallback to original method with better error handling
          const list = barangayList.status === 'fulfilled' ? barangayList.value : [];
          const merged = [];
          
          // Load only first 3 barangays initially, then load rest in background
          const priorityBarangays = list.slice(0, 3);
          const remainingBarangays = list.slice(3);
          
          // Load priority barangays first
          for (const b of priorityBarangays) {
            try {
              const gj = await fetchBarangayGeoJSON(b.id);
              if (gj?.features) {
                gj.features.forEach(f => merged.push({ ...f, properties: { ...(f.properties || {}), barangay_id: b.id, barangay_name: b.name } }));
              }
            } catch (e) {
              console.warn('GeoJSON missing for', b.id);
            }
          }
          
          // Set initial data to show map faster
          setAllBarangayGeoJSON({ type: 'FeatureCollection', features: merged });
          
          // Load remaining barangays in background
          setTimeout(async () => {
            for (const b of remainingBarangays) {
              try {
                const gj = await fetchBarangayGeoJSON(b.id);
                if (gj?.features) {
                  gj.features.forEach(f => merged.push({ ...f, properties: { ...(f.properties || {}), barangay_id: b.id, barangay_name: b.name } }));
                }
              } catch (e) {
                console.warn('GeoJSON missing for', b.id);
              }
            }
            // Update with complete data
            setAllBarangayGeoJSON({ type: 'FeatureCollection', features: merged });
          }, 1000);
        }
      } catch (e) {
        console.error('Error loading barangays', e);
      }
    };
    loadBarangaysOptimized();
  }, []);

  // Load sensors from JSON file
  useEffect(() => {
    const loadSensors = async () => {
      try {
        const sensorData = await fetchSensors();
        setSensors(sensorData);
      } catch (error) {
        console.error("Error loading sensors:", error);
      }
    };

    loadSensors();
  }, []);

  // Optimized data fetching with progressive loading
  useEffect(() => {
    const fetchAllDataOptimized = async () => {
      setLoading(true);
      
      // Set a maximum timeout for initial load
      const loadTimeout = setTimeout(() => {
        console.warn('Initial data load taking longer than expected');
        // Allow map to show with available data
        setLoading(false);
      }, 8000); // 8 second timeout
      
      try {
        // Fetch critical data first (sensors and basic map data)
        const criticalData = await Promise.allSettled([
          fetchSensors(),
          Promise.resolve([]) // placeholder for immediate barangays if needed
        ]);
        
        // Load map faster by showing it with available data
        if (criticalData[0].status === 'fulfilled') {
          setSensors(criticalData[0].value);
          // Show map with sensors first
          setTimeout(() => setLoading(false), 500);
        }
        
        // Then fetch secondary data in background
        const secondaryData = await Promise.allSettled([
          fetchWeatherData(false), // Don't show loading for secondary data
          fetchFloodData(false)
        ]);
        
        // Handle results
        [...criticalData, ...secondaryData].forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Data fetch error (source ${index}):`, result.reason);
          }
        });
        
        clearTimeout(loadTimeout);
        
      } catch (error) {
        console.error('Critical error in data fetching:', error);
        clearTimeout(loadTimeout);
        setLoading(false);
      }
    };

    fetchAllDataOptimized();

    // Set up periodic refresh for real-time data (reduced frequency)
    const refreshInterval = setInterval(() => {
      // Silently refresh data without showing loading indicator
      fetchWeatherData(false);
      fetchFloodData(false);
    }, 600000); // Refresh every 10 minutes instead of 5

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchFloodData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Add cache-busting parameter and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`http://localhost:5500/flood/?_=${Date.now()}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setFloodData(data);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Flood data request timed out');
      } else {
        console.error('Error fetching flood data:', error);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchWeatherData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const alertsData = await weatherService.getWeatherAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getColorByLayer = (station, layer) => {
    switch (layer) {
      case 'temperature':
        if (station.temperature > 30) return 'red';
        if (station.temperature > 25) return 'orange';
        return 'green';
      case 'precipitation':
        if (station.rainfall > 10) return 'blue';
        if (station.rainfall > 5) return 'lightblue';
        return 'lightgreen';
      case 'wind':
        if (station.wind_speed > 15) return 'purple';
        if (station.wind_speed > 10) return 'yellow';
        return 'green';
      case 'humidity':
        if (station.humidity > 80) return 'darkblue';
        if (station.humidity > 60) return 'blue';
        return 'lightblue';
      case 'visibility':
        if (station.visibility < 5) return 'red';
        if (station.visibility < 10) return 'orange';
        return 'green';
      case 'uv':
        if (station.uv_index > 8) return 'red';
        if (station.uv_index > 6) return 'orange';
        return 'green';
      default:
        return 'blue';
    }
  };

  const getRadiusByLayer = (station, layer) => {
    switch (layer) {
      case 'temperature':
        return Math.max(200, station.temperature * 10);
      case 'precipitation':
        return Math.max(200, station.rainfall * 50);
      case 'wind':
        return Math.max(200, station.wind_speed * 20);
      case 'humidity':
        return Math.max(200, station.humidity * 5);
      case 'visibility':
        return Math.max(200, station.visibility * 30);
      case 'uv':
        return Math.max(200, station.uv_index * 30);
      default:
        return station.scope;
    }
  };

  const getLayerIcon = (layer) => {
    switch (layer) {
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'precipitation': return <Droplets className="w-4 h-4" />;
      case 'wind': return <Wind className="w-4 h-4" />;
      case 'visibility': return <Eye className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  // Calculate bounds from Naga City GeoJSON
  const getNagaBounds = () => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      return [[13.59, 123.16], [13.66, 123.23]]; // fallback bounds
    }

    const coordinates = geoData.features[0].geometry.coordinates[0];
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

    coordinates.forEach(coord => {
      const [lng, lat] = coord;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    return [[minLng, minLat], [maxLng, maxLat]];
  };

  const nagaBounds = getNagaBounds();

  const getStyleUrl = (styleKey) => {
    switch (styleKey) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      case 'terrain':
        return 'mapbox://styles/mapbox/outdoors-v12';
      case 'dark':
        return 'mapbox://styles/mapbox/dark-v11';
      case 'light':
      default:
        return 'mapbox://styles/mapbox/light-v11';
    }
  };

  const computeRadiusPx = (station, layerKey) => {
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    switch (layerKey) {
      case 'temperature': {
        const v = station.temperature; // 20-35
        return clamp(((v - 20) / (35 - 20)) * (14 - 6) + 6, 6, 14);
      }
      case 'precipitation': {
        const v = station.rainfall; // 0-20mm
        return clamp((v / 20) * (14 - 6) + 6, 6, 14);
      }
      case 'wind': {
        const v = station.wind_speed; // 0-20 m/s
        return clamp((v / 20) * (14 - 6) + 6, 6, 14);
      }
      case 'humidity': {
        const v = station.humidity; // 40-100%
        return clamp(((v - 40) / (100 - 40)) * (14 - 6) + 6, 6, 14);
      }
      case 'visibility': {
        const v = station.visibility; // 0-20 km
        return clamp((v / 20) * (14 - 6) + 6, 6, 14);
      }
      case 'uv': {
        const v = station.uv_index; // 0-11
        return clamp((v / 11) * (14 - 6) + 6, 6, 14);
      }
      default:
        return 8;
    }
  };

  const toStationsFeatureCollection = (layerKey) => ({
    type: 'FeatureCollection',
    features: sensors.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: {
        id: s.id,
        name: s.name,
        barangay: s.barangay,
        temperature: s.readings.temperature,
        rainfall: s.readings.rainfall,
        humidity: s.readings.humidity,
        wind_speed: s.readings.wind_speed,
        wind_direction: s.readings.wind_direction,
        visibility: s.readings.visibility,
        uv_index: s.readings.uv_index,
        water_level: s.readings.water_level,
        color: getColorByLayer(s.readings, layerKey),
        radius: computeRadiusPx(s.readings, layerKey)
      }
    }))
  });

  const toAlertsFeatureCollection = () => ({
    type: 'FeatureCollection',
    features: alerts.map((a) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [a.longitude, a.latitude] },
      properties: {
        title: a.title,
        description: a.description,
        alert_type: a.alert_type,
        severity: a.severity,
        location: a.location,
        start_time: a.start_time,
        end_time: a.end_time,
        color: a.severity === 'extreme' ? '#dc2626' : a.severity === 'severe' ? '#ea580c' : a.severity === 'moderate' ? '#d97706' : '#16a34a'
      }
    }))
  });

  const toFloodDataFeatureCollection = () => ({
    type: 'FeatureCollection',
    features: floodData.map((f) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [f.longitude, f.latitude] },
      properties: {
        name: f.location,
        maximum_depth: f.maximum_depth,
        peak_velocity: f.peak_velocity,
        arrival_time: f.arrival_time,
        inundation_area: f.inundation_area,
        flood_risk_level: f.flood_risk_level,
        color: f.flood_risk_level === 'extreme' ? '#dc2626' :
          f.flood_risk_level === 'high' ? '#ea580c' :
            f.flood_risk_level === 'moderate' ? '#d97706' : '#16a34a',
        radius: f.flood_risk_level === 'extreme' ? 12 :
          f.flood_risk_level === 'high' ? 10 :
            f.flood_risk_level === 'moderate' ? 8 : 6
      }
    }))
  });

  const focusOnBarangay = async (barangayId) => {
    if (!mapRef.current) return;
    if (!barangayId) return;
    if (barangayId === 'ALL') {
      resetView();
      if (mapRef.current.getLayer('selected-barangay')) mapRef.current.removeLayer('selected-barangay');
      if (mapRef.current.getLayer('selected-barangay-outline')) mapRef.current.removeLayer('selected-barangay-outline');
      if (mapRef.current.getSource('selected-barangay')) mapRef.current.removeSource('selected-barangay');
      setSelectedBarangay(null);
      return;
    }

    // Set a loading state if needed for long operations
    const loadingTimeout = setTimeout(() => {
      // Show loading indicator or toast message for long operations
      console.log('Barangay focus taking longer than expected...');
    }, 2000);

    try {
  // Find the barangay in our list
  const barangay = barangays.find(b => b.id === barangayId);

      if (!barangay) {
        // Fall back to the old method if we can't find the barangay in our new structure
        const floodDataBarangay = floodData.find(f => f.location === barangayId);
        if (floodDataBarangay && mapRef.current) {
          // Check if coordinates are valid
          if (!floodDataBarangay.longitude || !floodDataBarangay.latitude) {
            console.error('Invalid coordinates for barangay:', barangayId);
            clearTimeout(loadingTimeout);
            return;
          }

          // Animate to the barangay location
          mapRef.current.flyTo({
            center: [floodDataBarangay.longitude, floodDataBarangay.latitude],
            zoom: 15,
            duration: 1200,
            essential: true // This animation is considered essential for the user experience
          });

          setSelectedBarangay(floodDataBarangay);
        } else {
          console.warn(`Barangay not found: ${barangayId}`);
        }
        clearTimeout(loadingTimeout);
        return;
      }

      // Load the barangay GeoJSON data
      const barangayData = await fetchBarangayGeoJSON(barangayId);

      // Add barangay data to the map if it exists
      if (mapRef.current && barangayData) {
        try {
          // Clean up existing layers and sources to prevent memory leaks
          if (mapRef.current.getLayer('selected-barangay')) mapRef.current.removeLayer('selected-barangay');
          if (mapRef.current.getLayer('selected-barangay-outline')) mapRef.current.removeLayer('selected-barangay-outline');
          if (mapRef.current.getSource('selected-barangay')) mapRef.current.removeSource('selected-barangay');

          // Ensure style is loaded before adding sources and layers
          const addBarangayLayers = () => {
            // Add the new barangay data
            mapRef.current.addSource('selected-barangay', {
              type: 'geojson',
              data: barangayData
            });

            // Add a layer to display the barangay
            mapRef.current.addLayer({
              id: 'selected-barangay',
              type: 'fill',
              source: 'selected-barangay',
              paint: {
                'fill-color': '#0080ff',
                'fill-opacity': 0.2,
                'fill-outline-color': '#0080ff'
              }
            });

            // Add outline layer for better visibility
            mapRef.current.addLayer({
              id: 'selected-barangay-outline',
              type: 'line',
              source: 'selected-barangay',
              paint: {
                'line-color': '#0080ff',
                'line-width': 2
              }
            });
          };

          if (mapRef.current.isStyleLoaded()) {
            addBarangayLayers();
          } else {
            mapRef.current.once('styledata', addBarangayLayers);
          }

          // Check if center coordinates are valid
          if (!barangay.center || !Array.isArray(barangay.center) || barangay.center.length !== 2) {
            console.error('Invalid center coordinates for barangay:', barangayId);
            // Try to calculate center from GeoJSON if available
            if (barangayData && barangayData.features && barangayData.features.length > 0) {
              // Get bounds of the feature and use center
              const bounds = new mapboxgl.LngLatBounds();
              const coordinates = barangayData.features[0].geometry.coordinates[0];
              coordinates.forEach(coord => bounds.extend(coord));

              // Fly to calculated center
              mapRef.current.fitBounds(bounds, {
                padding: 50,
                duration: 1500
              });
            }
          } else {
            // Fly to the barangay using provided center
            mapRef.current.flyTo({
              center: barangay.center,
              zoom: barangay.zoom_level || 15,
              duration: 1500,
              essential: true
            });
          }

          // Update selected barangay state
          setSelectedBarangay(barangay);
        } catch (mapError) {
          console.error('Map operation error:', mapError);
        }
      } else {
        console.warn(`No GeoJSON data found for barangay: ${barangayId}`);
      }
    } catch (error) {
      console.error(`Error focusing on barangay ${barangayId}:`, error);
    } finally {
      clearTimeout(loadingTimeout);
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.fitBounds(nagaBounds, { padding: 50 });
      setSelectedBarangay(null);
    }
  };

  // Show all barangay boundaries when none selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !allBarangayGeoJSON) return;
    
    const updateBarangayBoundaries = () => {
      // Remove single selection layers if present
      if (!selectedBarangay) {
        if (!map.getSource('all-barangays')) {
          map.addSource('all-barangays', { type: 'geojson', data: allBarangayGeoJSON });
        } else {
          map.getSource('all-barangays').setData(allBarangayGeoJSON);
        }
        if (!map.getLayer('all-barangays-fill')) {
          map.addLayer({
            id: 'all-barangays-fill',
            type: 'fill',
            source: 'all-barangays',
            paint: { 'fill-color': '#1d4ed8', 'fill-opacity': 0.05 }
          });
        }
        if (!map.getLayer('all-barangays-line')) {
          map.addLayer({
            id: 'all-barangays-line',
            type: 'line',
            source: 'all-barangays',
            paint: { 'line-color': '#1d4ed8', 'line-width': 1 }
          });
        }
      } else {
        // Hide all boundaries layers when a single barangay is selected
        if (map.getLayer('all-barangays-fill')) map.setLayoutProperty('all-barangays-fill', 'visibility', 'none');
        if (map.getLayer('all-barangays-line')) map.setLayoutProperty('all-barangays-line', 'visibility', 'none');
      }
      if (!selectedBarangay && map.getLayer('all-barangays-fill')) {
        map.setLayoutProperty('all-barangays-fill', 'visibility', 'visible');
      }
      if (!selectedBarangay && map.getLayer('all-barangays-line')) {
        map.setLayoutProperty('all-barangays-line', 'visibility', 'visible');
      }
    };

    if (map.isStyleLoaded()) {
      updateBarangayBoundaries();
    } else {
      map.once('styledata', updateBarangayBoundaries);
    }
  }, [allBarangayGeoJSON, selectedBarangay]);

  // Initialize Mapbox map once
  useEffect(() => {
    if (tokenMissing) {
      console.error('Mapbox token missing. Set VITE_MAPBOX_TOKEN in your .env.');
      setLoading(false);
      return;
    }
    if (mapRef.current || !mapContainerRef.current) return;

    // Initialize map with optimized settings for better performance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: getStyleUrl(baseStyle),
      center: [123.19, 13.62],
      zoom: 12,
      pitch: is3D ? 60 : 0,
      bearing: 0,
      antialias: true,
      maxBounds: nagaBounds,
      minZoom: 10,
      maxZoom: 18,
      // Performance optimizations
      renderWorldCopies: false, // Don't render multiple world copies
      optimizeForTerrain: is3D,
      preserveDrawingBuffer: false, // Better performance for screenshots not needed
      // Improved caching strategy
      transformRequest: (url, resourceType) => {
        if (resourceType === 'Source' && url.startsWith('http')) {
          // Enable caching for data sources
          return {
            url,
            headers: { 'Cache-Control': 'max-age=300' } // 5 minute cache
          };
        }
        return { url };
      }
    });

    mapRef.current = map;

    // Enable/Improve interactions & add controls
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.keyboard.enable();
    map.touchZoomRotate.enable();
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'metric' }));
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }));

    // Handle errors gracefully
    map.on('error', (e) => {
      console.error('Mapbox GL Error:', e && e.error ? e.error : e);
    });

    // Set a timeout to detect if map fails to load in reasonable time
    const mapLoadTimeout = setTimeout(() => {
      if (!mapLoaded) {
        console.warn('Map load timeout - forcing reload');
        if (mapRef.current) {
          mapRef.current.remove();
        }
        // Force reset map on next render cycle
        mapRef.current = null;
        setLoading(false);
      }
    }, 10000);

    const attachSourcesAndLayers = () => {
      // Check if style is loaded before adding sources
      if (!map.isStyleLoaded()) {
        console.warn('Trying to add sources before style is loaded');
        return;
      }
      
      // 3D terrain on demand
      if (is3D) {
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });
        }
        try { map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 }); } catch (_) { }
        if (!map.getLayer('sky')) {
          map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun-intensity': 15
            }
          });
        }
      } else {
        try { map.setTerrain(null); } catch (_) { }
        if (map.getLayer('sky')) {
          try { map.removeLayer('sky'); } catch (_) { }
        }
      }

      // 3D Buildings layer
      if (showBuildings && is3D) {
        try {
          if (!map.getLayer('3d-buildings')) {
            // Find the first symbol layer in the map style
            let firstSymbolId;
            const layers = map.getStyle().layers;
            for (const layer of layers) {
              if (layer.type === 'symbol') {
                firstSymbolId = layer.id;
                break;
              }
            }

            // Add 3D buildings
            map.addLayer({
              'id': '3d-buildings',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 14,
              'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate', ['linear'], ['zoom'],
                  15, 0,
                  16, ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate', ['linear'], ['zoom'],
                  15, 0,
                  16, ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.7
              }
            }, firstSymbolId);
          }
        } catch (err) {
          console.warn('Could not add 3D buildings layer:', err);
        }
      } else if (!showBuildings && map.getLayer('3d-buildings')) {
        try {
          map.removeLayer('3d-buildings');
        } catch (_) { }
      }

      try {
        // GeoJSON boundary
        if (geoData) {
          if (!map.getSource('naga')) {
            map.addSource('naga', { type: 'geojson', data: geoData });
          } else {
            map.getSource('naga').setData(geoData);
          }
          if (!map.getLayer('naga-fill')) {
            map.addLayer({
              id: 'naga-fill',
              type: 'fill',
              source: 'naga',
              paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.1 }
            });
          }
          if (!map.getLayer('naga-line')) {
            map.addLayer({
              id: 'naga-line',
              type: 'line',
              source: 'naga',
              paint: { 'line-color': '#2563eb', 'line-width': 2 }
            });
          }
        }

        // Stations (compact style)
        const stationData = toStationsFeatureCollection(selectedLayer);
        if (!map.getSource('stations')) {
          map.addSource('stations', { type: 'geojson', data: stationData });
        } else {
          map.getSource('stations').setData(stationData);
        }
        if (!map.getLayer('stations-halo')) {
          map.addLayer({
            id: 'stations-halo',
            type: 'circle',
            source: 'stations',
            paint: {
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.18,
              'circle-radius': ['+', ['get', 'radius'], 4]
            }
          });
        }
        if (!map.getLayer('stations-core')) {
          map.addLayer({
            id: 'stations-core',
            type: 'circle',
            source: 'stations',
            paint: {
              'circle-color': ['get', 'color'],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 3,
              'circle-radius': ['get', 'radius'],
              'circle-opacity': 0.9
            }
          });
        }

        // Alerts
        const alertData = toAlertsFeatureCollection();
        if (!map.getSource('alerts')) {
          map.addSource('alerts', { type: 'geojson', data: alertData });
        } else {
          map.getSource('alerts').setData(alertData);
        }
        if (!map.getLayer('alerts-circle')) {
          map.addLayer({
            id: 'alerts-circle',
            type: 'circle',
            source: 'alerts',
            paint: {
              'circle-color': ['get', 'color'],
              'circle-stroke-color': ['get', 'color'],
              'circle-stroke-width': 3,
              'circle-radius': 10,
              'circle-opacity': 0.8
            }
          });
        }

        // Flood Data
        const floodDataGeoJSON = toFloodDataFeatureCollection();
        if (!map.getSource('flood-data')) {
          map.addSource('flood-data', { type: 'geojson', data: floodDataGeoJSON });
        } else {
          map.getSource('flood-data').setData(floodDataGeoJSON);
        }
        if (!map.getLayer('flood-data-halo')) {
          map.addLayer({
            id: 'flood-data-halo',
            type: 'circle',
            source: 'flood-data',
            paint: {
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.2,
              'circle-radius': ['+', ['get', 'radius'], 6]
            }
          });
        }
        if (!map.getLayer('flood-data-core')) {
          map.addLayer({
            id: 'flood-data-core',
            type: 'circle',
            source: 'flood-data',
            paint: {
              'circle-color': ['get', 'color'],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
              'circle-radius': ['get', 'radius'],
              'circle-opacity': 0.9
            }
          });
        }
      } catch (error) {
        console.error('Error adding sources and layers:', error);
      }

      // Hover cursors
      map.on('mouseenter', 'stations-core', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'stations-core', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'alerts-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'alerts-circle', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'flood-data-core', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'flood-data-core', () => { map.getCanvas().style.cursor = ''; });

      // Popups (click)
      map.on('click', 'stations-core', (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties;
        const html = `
          <div class="min-w-[200px]">
            <h3 class="font-bold text-lg mb-2 text-gray-800">${p.name}</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="flex items-center">Temp: ${Number(p.temperature).toFixed(1)}°C</div>
              <div class="flex items-center">Rain: ${Number(p.rainfall).toFixed(1)} mm</div>
              <div class="flex items-center">Wind: ${Number(p.wind_speed).toFixed(1)} m/s</div>
              <div class="flex items-center">Visibility: ${Number(p.visibility).toFixed(1)} km</div>
            </div>
            <div class="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-600">
              <div>Humidity: ${p.humidity}%</div>
              <div>UV Index: ${p.uv_index}</div>
              <div>Wind Dir: ${p.wind_direction}</div>
              <div>Water Level: ${p.water_level} m</div>
            </div>
          </div>`;
        new mapboxgl.Popup({ closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });

      map.on('click', 'alerts-circle', (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties;
        const html = `
          <div class="min-w-[250px]">
            <div class="flex items-center mb-2">
              <h3 class="font-bold text-red-600">${p.title}</h3>
            </div>
            <p class="text-sm text-gray-700 mb-2">${p.description}</p>
            <div class="text-xs text-gray-500">
              <div><strong>Type:</strong> ${String(p.alert_type).replace('_', ' ')}</div>
              <div><strong>Severity:</strong> ${p.severity}</div>
              <div><strong>Location:</strong> ${p.location}</div>
              <div><strong>Valid:</strong> ${new Date(p.start_time).toLocaleString()} - ${new Date(p.end_time).toLocaleString()}</div>
            </div>
          </div>`;
        new mapboxgl.Popup({ closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });

      map.on('click', 'flood-data-core', (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties;
        const html = `
          <div class="min-w-[250px]">
            <div class="flex items-center mb-2">
              <h3 class="font-bold text-gray-800">${p.name}</h3>
              <span class="ml-2 px-2 py-1 text-xs rounded-full ${p.flood_risk_level === 'extreme' ? 'bg-red-100 text-red-600' :
            p.flood_risk_level === 'high' ? 'bg-orange-100 text-orange-600' :
              p.flood_risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
          }">
                ${p.flood_risk_level.toUpperCase()}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="flex items-center">Depth: ${Number(p.maximum_depth).toFixed(1)}m</div>
              <div class="flex items-center">Velocity: ${Number(p.peak_velocity).toFixed(1)} m/s</div>
              <div class="flex items-center">Arrival: ${Math.floor(p.arrival_time * 60)} min</div>
              <div class="flex items-center">Area: ${Number(p.inundation_area).toFixed(1)} km²</div>
            </div>
            <div class="mt-3 pt-2 border-t border-gray-200">
              <button 
                onclick="window.focusOnBarangay('${p.name}')"
                class="w-full bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
              >
                Focus on this area
              </button>
            </div>
          </div>`;
        new mapboxgl.Popup({ closeButton: true })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });
    };

    map.on('load', () => {
      console.log('Map loaded');
      map.resize();
      // Wait a bit to ensure style is fully loaded
      setTimeout(() => {
        if (map.isStyleLoaded()) {
          attachSourcesAndLayers();
        }
      }, 100);
      setMapLoaded(true);
      setLoading(false);
      clearTimeout(mapLoadTimeout);
    });

    // Reattach after style changes
    map.on('style.load', () => {
      console.log('Map style loaded');
      // Wait a bit to ensure style is fully loaded
      setTimeout(() => {
        if (map.isStyleLoaded()) {
          attachSourcesAndLayers();
        }
      }, 100);
    });

    // Ensure the map reacts to size changes
    const onWindowResize = () => {
      if (mapRef.current) {
        try { mapRef.current.resize(); } catch (_) { /* noop */ }
      }
    };

    // Handle browser visibility changes (e.g., when tab is hidden)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mapRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Force resize in case map container was initially hidden
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 500);

    return () => {
      clearTimeout(mapLoadTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [geoData]);

  // Update sources when data or selected layer changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      const stationSource = map.getSource('stations');
      if (stationSource) stationSource.setData(toStationsFeatureCollection(selectedLayer));

      const alertSource = map.getSource('alerts');
      if (alertSource) alertSource.setData(toAlertsFeatureCollection());

      const floodSource = map.getSource('flood-data');
      if (floodSource) floodSource.setData(toFloodDataFeatureCollection());

      if (geoData && map.getSource('naga')) {
        map.getSource('naga').setData(geoData);
      }
    } else {
      map.once('load', () => {
        if (map.getSource('stations')) map.getSource('stations').setData(toStationsFeatureCollection(selectedLayer));
        if (map.getSource('alerts')) map.getSource('alerts').setData(toAlertsFeatureCollection());
        if (map.getSource('flood-data')) map.getSource('flood-data').setData(toFloodDataFeatureCollection());
        if (geoData && map.getSource('naga')) map.getSource('naga').setData(geoData);
      });
    }
  }, [alerts, selectedLayer, geoData, floodData]);

  // React to base style, 2D/3D toggle, or buildings toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Preserve current view settings
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = is3D ? 60 : 0;

    // Change map style
    map.setStyle(getStyleUrl(baseStyle));

    // Restore view and update 3D settings after style loads
    map.once('style.load', () => {
      try {
        // Restore position
        map.jumpTo({ center, zoom, bearing, pitch });

        // Handle 3D settings - ensure style is loaded
        if (map.isStyleLoaded()) {
          if (is3D) {
            // Add terrain if 3D is enabled
            if (!map.getSource('mapbox-dem')) {
              map.addSource('mapbox-dem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14
              });
            }
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

            // Add sky layer
            if (!map.getLayer('sky')) {
              map.addLayer({
                id: 'sky',
                type: 'sky',
                paint: {
                  'sky-type': 'atmosphere',
                  'sky-atmosphere-sun-intensity': 15
                }
              });
            }

            // Add 3D buildings if enabled
            if (showBuildings) {
              try {
                // Find the first symbol layer
                const layers = map.getStyle().layers;
                let firstSymbolId;
                for (const layer of layers) {
                  if (layer.type === 'symbol') {
                    firstSymbolId = layer.id;
                    break;
                  }
                }

                if (!map.getLayer('3d-buildings')) {
                  map.addLayer({
                    'id': '3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 14,
                    'paint': {
                      'fill-extrusion-color': baseStyle === 'dark' ? '#444' : '#aaa',
                      'fill-extrusion-height': [
                        'interpolate', ['linear'], ['zoom'],
                        15, 0,
                        16, ['get', 'height']
                      ],
                      'fill-extrusion-base': [
                        'interpolate', ['linear'], ['zoom'],
                        15, 0,
                        16, ['get', 'min_height']
                      ],
                      'fill-extrusion-opacity': 0.7
                    }
                  }, firstSymbolId);
                }
              } catch (err) {
                console.warn('Could not add 3D buildings layer:', err);
              }
            }
          } else {
            // Remove 3D elements if 2D mode
            map.setTerrain(null);
            if (map.getLayer('sky')) {
              map.removeLayer('sky');
            }
            if (map.getLayer('3d-buildings')) {
              map.removeLayer('3d-buildings');
            }
          }
        }
      } catch (error) {
        console.error('Error updating map style:', error);
      }
    });
  }, [baseStyle, is3D, showBuildings]);

  // Function to retry loading the map in case of issues
  const retryMapLoad = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    setLoading(true);
    setMapLoaded(false);

    // Force remount of the map component
    setTimeout(() => {
      const container = mapContainerRef.current;
      if (container) {
        const map = new mapboxgl.Map({
          container,
          style: getStyleUrl(baseStyle),
          center: [123.19, 13.62],
          zoom: 12,
          pitch: is3D ? 60 : 0,
          bearing: 0,
          antialias: true,
          maxBounds: nagaBounds,
          minZoom: 10,
        });

        mapRef.current = map;

        map.on('load', () => {
          console.log('Map reloaded successfully');
          setMapLoaded(true);
          setLoading(false);
        });
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-700 mb-2">Loading map data...</div>
        <div className="text-sm text-gray-500 text-center max-w-md">
          <div>• Loading Mapbox tiles</div>
          <div>• Fetching sensor data</div>
          <div>• Loading barangay boundaries</div>
          <div>• Connecting to weather services</div>
        </div>
        {/* Add retry button if loading takes too long */}
        {!mapLoaded && (
          <button
            onClick={retryMapLoad}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry Loading Map
          </button>
        )}
        <div className="mt-4 text-xs text-gray-400">
          If loading takes too long, check your internet connection and Mapbox token.
        </div>
      </div>
    );
  }

  if (tokenMissing) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-red-800 mb-2">Map Cannot Load</div>
          <div className="text-sm text-gray-600 mb-4">
            Missing Mapbox token. Please set <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_MAPBOX_TOKEN</code> in your .env.local file and restart the dev server.
          </div>
          <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
            <strong>Troubleshooting:</strong> Check that your .env.local file exists and contains a valid Mapbox token.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Layer Controls */}
      <div className="bg-white shadow-lg p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Interactive Weather Map</h2>
          <div className="flex space-x-2">
            {/* Barangay Selection */}
            <select
              value={selectedBarangay ? (selectedBarangay.id || selectedBarangay.location) : 'ALL'}
              onChange={(e) => focusOnBarangay(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
            >
              <option value="ALL">All Barangays</option>
              {barangays.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              {floodData.length > 0 && <option disabled>────────── Flood Data ──────────</option>}
              {floodData.map(f => (
                <option key={`flood-${f.location}`} value={f.location}>{f.location} ({f.flood_risk_level})</option>
              ))}
            </select>

            <button
              onClick={resetView}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              title="Reset to city view"
            >
              <Focus className="w-4 h-4 mr-1" />
              Reset View
            </button>
            <select
              value={baseStyle}
              onChange={(e) => setBaseStyle(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>

            <button
              onClick={() => setIs3D((v) => !v)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${is3D ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title="Toggle 2D / 3D"
            >
              {is3D ? '3D On' : '2D Mode'}
            </button>

            {is3D && (
              <button
                onClick={() => setShowBuildings((v) => !v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showBuildings ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title="Toggle 3D Buildings"
              >
                {showBuildings ? 'Buildings On' : 'Buildings Off'}
              </button>
            )}
            {['temperature', 'precipitation', 'wind', 'humidity', 'visibility', 'uv'].map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLayer === layer
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {getLayerIcon(layer)}
                <span className="ml-2 capitalize">{layer}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Barangay Info */}
      {selectedBarangay && selectedBarangay.name && (
        <div className="bg-blue-50 border-b p-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedBarangay.name || selectedBarangay.location}
              </h3>
              {selectedBarangay.flood_risk_level && (
                <span className={`ml-3 px-2 py-1 text-xs rounded-full ${selectedBarangay.flood_risk_level === 'extreme' ? 'bg-red-100 text-red-600' :
                  selectedBarangay.flood_risk_level === 'high' ? 'bg-orange-100 text-orange-600' :
                    selectedBarangay.flood_risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                  }`}>
                  {selectedBarangay.flood_risk_level.toUpperCase()} RISK
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedBarangay(null)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {selectedBarangay.maximum_depth !== undefined ? (
            // Display flood data if available
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
              <div>
                <span className="text-gray-600">Max Depth:</span>
                <span className="ml-1 font-medium">{selectedBarangay.maximum_depth.toFixed(1)} meters</span>
              </div>
              <div>
                <span className="text-gray-600">Peak Velocity:</span>
                <span className="ml-1 font-medium">{selectedBarangay.peak_velocity.toFixed(1)} m/s</span>
              </div>
              <div>
                <span className="text-gray-600">Arrival Time:</span>
                <span className="ml-1 font-medium">{Math.floor(selectedBarangay.arrival_time * 60)} minutes</span>
              </div>
              <div>
                <span className="text-gray-600">Inundation Area:</span>
                <span className="ml-1 font-medium">{selectedBarangay.inundation_area.toFixed(1)} km²</span>
              </div>
            </div>
          ) : (
            // Display barangay information if it's from the new data structure
            <div className="mt-3 text-sm">
              {selectedBarangay.status && (
                <div className="mt-1">
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-1 font-medium ${selectedBarangay.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedBarangay.status}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1">
        <div ref={mapContainerRef} className="rounded-lg" style={{ height: "100%", width: "100%", minHeight: "500px" }} />
      </div>

      {/* Legend */}
      <div className="bg-white shadow-lg p-4 border-t">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <span className="text-sm font-medium text-gray-700 mr-4">Current Layer:</span>
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
              {getLayerIcon(selectedLayer)}
              <span className="ml-2 capitalize">{selectedLayer}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <button
              onClick={() => setPanelsVisibility(p => ({ ...p, sensors: !p.sensors }))}
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center transition-colors"
              title="View sensor details"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse-slow"></div>
              <span className="font-medium">{sensors.length}</span>
              <span className="ml-1">sensors</span>
            </button>

            <button
              onClick={() => alerts.length > 0 && setPanelsVisibility(p => ({ ...p, alerts: !p.alerts }))}
              className={`px-3 py-1 ${alerts.length > 0 ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'bg-gray-50 text-gray-500'} rounded-lg flex items-center transition-colors`}
              title={alerts.length > 0 ? 'View alert details' : 'No active alerts'}
              disabled={alerts.length === 0}
            >
              {alerts.length > 0 && <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>}
              <span className="font-medium">{alerts.length}</span>
              <span className="ml-1">active alerts</span>
            </button>

            <button
              onClick={() => floodData.length > 0 && setPanelsVisibility(p => ({ ...p, floods: !p.floods }))}
              className={`px-3 py-1 ${floodData.length > 0 ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-500'} rounded-lg flex items-center transition-colors`}
              title={floodData.length > 0 ? 'View flood area details' : 'No flood areas'}
              disabled={floodData.length === 0}
            >
              {floodData.length > 0 && <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse-slow"></div>}
              <span className="font-medium">{floodData.length}</span>
              <span className="ml-1">flood areas</span>
            </button>
          </div>
        </div>

        {/* Expandable details panels */}
        <div id="sensor-details" className={`mt-4 border-t pt-3 text-sm ${panelsVisibility.sensors ? '' : 'hidden'}`}>
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-700 mb-2">Sensor Overview</h4>
            <button onClick={() => setPanelsVisibility(p => ({ ...p, sensors: false }))} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-gray-600">Avg. Temperature</div>
              <div className="font-medium">
                {sensors.length > 0 ?
                  (sensors.reduce((sum, s) => sum + s.readings.temperature, 0) / sensors.length).toFixed(1) + '°C'
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-gray-600">Avg. Rainfall</div>
              <div className="font-medium">
                {sensors.length > 0 ?
                  (sensors.reduce((sum, s) => sum + s.readings.rainfall, 0) / sensors.length).toFixed(1) + ' mm'
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-gray-600">Avg. Humidity</div>
              <div className="font-medium">
                {sensors.length > 0 ?
                  (sensors.reduce((sum, s) => sum + s.readings.humidity, 0) / sensors.length).toFixed(0) + '%'
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-gray-600">Avg. Wind Speed</div>
              <div className="font-medium">
                {sensors.length > 0 ?
                  (sensors.reduce((sum, s) => sum + s.readings.wind_speed, 0) / sensors.length).toFixed(1) + ' m/s'
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div id="alert-details" className={`mt-4 border-t pt-3 text-sm ${panelsVisibility.alerts ? '' : 'hidden'}`}>
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-700 mb-2">Active Alerts</h4>
            <button onClick={() => setPanelsVisibility(p => ({ ...p, alerts: false }))} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
          </div>
          {alerts.length === 0 ? (
            <div className="text-gray-500">No active alerts</div>
          ) : (
            <div className="max-h-32 overflow-y-auto">
              {alerts.map((alert, index) => (
                <div key={index} className={`mb-2 p-2 rounded ${alert.severity === 'extreme' ? 'bg-red-50' :
                    alert.severity === 'severe' ? 'bg-orange-50' :
                      alert.severity === 'moderate' ? 'bg-yellow-50' :
                        'bg-green-50'
                  }`}>
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-xs text-gray-600">{alert.location} • {new Date(alert.start_time).toLocaleTimeString()}</div>
                </div>
              )).slice(0, 3)}
              {alerts.length > 3 && (
                <div className="text-blue-600 text-xs mt-1 text-center cursor-pointer hover:underline">
                  + {alerts.length - 3} more alerts
                </div>
              )}
            </div>
          )}
        </div>

        <div id="flood-details" className={`mt-4 border-t pt-3 text-sm ${panelsVisibility.floods ? '' : 'hidden'}`}>
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-700 mb-2">Flood Risk Areas</h4>
            <button onClick={() => setPanelsVisibility(p => ({ ...p, floods: false }))} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
          </div>
          {floodData.length === 0 ? (
            <div className="text-gray-500">No flood risk areas</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {floodData.map((area, index) => (
                <div key={index}
                  className={`p-2 rounded cursor-pointer hover:bg-opacity-80 ${area.flood_risk_level === 'extreme' ? 'bg-red-50' :
                      area.flood_risk_level === 'high' ? 'bg-orange-50' :
                        area.flood_risk_level === 'moderate' ? 'bg-yellow-50' :
                          'bg-green-50'
                    }`}
                  onClick={() => focusOnBarangay(area.location)}
                >
                  <div className="font-medium">{area.location}</div>
                  <div className="text-xs text-gray-600">
                    {area.flood_risk_level.toUpperCase()} • {area.maximum_depth.toFixed(1)}m
                  </div>
                </div>
              )).slice(0, 8)}
              {floodData.length > 8 && (
                <div className="text-blue-600 text-xs mt-1 text-center col-span-full cursor-pointer hover:underline">
                  + {floodData.length - 8} more areas
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Map;