
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Layers, Thermometer, Droplets, Wind, Eye, AlertTriangle, MapPin, Focus } from 'lucide-react';
import { weatherService } from '../services/weatherService';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map() {
  const [selectedLayer, setSelectedLayer] = useState('temperature');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState(null);
  const [floodData, setFloodData] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const tokenMissing = !mapboxgl.accessToken;
  const [is3D, setIs3D] = useState(true);
  const [baseStyle, setBaseStyle] = useState('light'); // 'light' | 'satellite' | 'terrain'

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // const [barangays, setBarangays] = useState(null);
  // useEffect(() => {
  //   fetch("/barangays.geojson")
  //     .then((res) => res.json())
  //     .then((data) => setBarangays(data));
  // }, []);



  // Sample barangay weather stations with enhanced data
  // Sample barangay weather stations within Naga City
  // Sample barangay weather stations with enhanced data
  const stations = [
    {
      name: "Abella",
      lat: 13.623196284003441,  // sample approximate coords
      lng: 123.18261692770339,
      water_level: 2.18,
      rainfall: 1.2,
      temperature: 28.5,
      humidity: 75,
      wind_speed: 12.3,
      wind_direction: "NE",
      visibility: 15.2,
      uv_index: 6.8,
      scope: 800
    }
  ];








  useEffect(() => {
    fetch("/naga.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  useEffect(() => {
    fetchWeatherData();
    fetchFloodData();
  }, []);

  const fetchFloodData = async () => {
    try {
      const response = await fetch('http://localhost:5500/flood/');
      const data = await response.json();
      setFloodData(data);
    } catch (error) {
      console.error('Error fetching flood data:', error);
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const alertsData = await weatherService.getWeatherAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
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
    features: stations.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: {
        name: s.name,
        temperature: s.temperature,
        rainfall: s.rainfall,
        humidity: s.humidity,
        wind_speed: s.wind_speed,
        wind_direction: s.wind_direction,
        visibility: s.visibility,
        uv_index: s.uv_index,
        water_level: s.water_level,
        color: getColorByLayer(s, layerKey),
        radius: computeRadiusPx(s, layerKey)

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

  const focusOnBarangay = (barangayName) => {
    const barangay = floodData.find(f => f.location === barangayName);
    if (barangay && mapRef.current) {
      mapRef.current.flyTo({
        center: [barangay.longitude, barangay.latitude],
        zoom: 15,
        duration: 1000
      });
      setSelectedBarangay(barangay);
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.fitBounds(nagaBounds, { padding: 50 });
      setSelectedBarangay(null);
    }
  };

  // Initialize Mapbox map once
  useEffect(() => {
    if (tokenMissing) {
      console.error('Mapbox token missing. Set VITE_MAPBOX_TOKEN in your .env.');
      return;
    }
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: getStyleUrl(baseStyle),
      center: [123.19, 13.62],
      zoom: 12,
      pitch: is3D ? 60 : 0,
      bearing: 0,
      antialias: true,
      maxBounds: nagaBounds
    });

    mapRef.current = map;

    // Constrain to bounds
    // map.setMaxBounds([[123.16, 13.59], [123.23, 13.66]]);

    // Enable/Improve interactions & add controls
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.keyboard.enable();
    map.touchZoomRotate.enable();
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'metric' }));
    map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }));

    map.on('error', (e) => {
      console.error('Mapbox GL Error:', e && e.error ? e.error : e);
    });

    const attachSourcesAndLayers = () => {
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
      map.resize();
      attachSourcesAndLayers();
    });

    // Reattach after style changes
    map.on('style.load', () => {
      attachSourcesAndLayers();
    });

    const onWindowResize = () => {
      try { map.resize(); } catch (_) { /* noop */ }
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      map.remove();
      mapRef.current = null;
      window.removeEventListener('resize', onWindowResize);
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

  // React to base style or 2D/3D toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = 0;
    const pitch = is3D ? 60 : 0;
    map.setStyle(getStyleUrl(baseStyle));
    map.once('style.load', () => {
      try {
        map.jumpTo({ center, zoom, bearing, pitch });
      } catch (_) { }
    });
  }, [baseStyle, is3D]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tokenMissing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-2">Map cannot load</div>
          <div className="text-sm text-gray-600">Missing Mapbox token. Set <code>VITE_MAPBOX_TOKEN</code> in your .env and restart dev server.</div>
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
              value={selectedBarangay?.location || ''}
              onChange={(e) => e.target.value && focusOnBarangay(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
            >
              <option value="">Select Barangay</option>
              {floodData.map((barangay) => (
                <option key={barangay.location} value={barangay.location}>
                  {barangay.location} ({barangay.flood_risk_level})
                </option>
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
      {selectedBarangay && (
        <div className="bg-blue-50 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">{selectedBarangay.location}</h3>
              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${selectedBarangay.flood_risk_level === 'extreme' ? 'bg-red-100 text-red-600' :
                selectedBarangay.flood_risk_level === 'high' ? 'bg-orange-100 text-orange-600' :
                  selectedBarangay.flood_risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                }`}>
                {selectedBarangay.flood_risk_level.toUpperCase()} RISK
              </span>
            </div>
            <button
              onClick={() => setSelectedBarangay(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
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
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1">
        <div ref={mapContainerRef} className="rounded-lg" style={{ height: "100%", width: "100%", minHeight: "500px" }} />
      </div>

      {/* Legend */}
      <div className="bg-white shadow-lg p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-4">Current Layer:</span>
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
              {getLayerIcon(selectedLayer)}
              <span className="ml-2 capitalize">{selectedLayer}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {stations.length} stations • {alerts.length} active alerts • {floodData.length} flood areas
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;