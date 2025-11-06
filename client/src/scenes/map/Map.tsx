import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
    Box, Paper, ToggleButton, ToggleButtonGroup, Tooltip, IconButton, styled,
    Typography, List, ListItem, ListItemButton, ListItemText, Collapse, Button
} from "@mui/material";
import AlertsPanel, { AlertsToggleButton } from './AlertsPanel';
import WeatherLayerControls from './WeatherLayerControls';
import WeatherDataDisplay from './WeatherDataDisplay';
import MapDataOverlay from '@/components/MapDataOverlay';
import TimeControl from '@/components/TimeControl';
import FloodSimulation from '@/components/FloodSimulation';
import { floodSimulationData, getSimulationTimeRange } from '@/data/floodSimulationData';
import type { WeatherLayerType } from './weatherData';
import { sampleSensors } from './weatherData';
import { ThreeDRotation, ViewComfy, LocationOn, ExpandLess, ExpandMore, LocationCity } from "@mui/icons-material";
import SatelliteIcon from '@mui/icons-material/Satellite';
import TerrainIcon from '@mui/icons-material/Terrain';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopCircleIcon from '@mui/icons-material/StopCircle';

// Token from .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Map style types
type MapStyle = 'satellite' | 'terrain' | 'dark' | 'light';

const MapControlPanel = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1,
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(5px)',
    borderRadius: theme.shape.borderRadius,
    maxWidth: '240px',
}));

// Styled component for dropdown is now replaced with inline styles

const getMapStyle = (type: MapStyle): string => {
    switch (type) {
        case 'satellite': return 'mapbox://styles/mapbox/satellite-streets-v12';
        case 'terrain': return 'mapbox://styles/mapbox/outdoors-v12';
        case 'dark': return 'mapbox://styles/mapbox/dark-v11';
        case 'light': return 'mapbox://styles/mapbox/light-v11';
        default: return 'mapbox://styles/mapbox/light-v11';
    }
};

// Interface for barangay data
interface Barangay {
    id: string;
    name: string;
    center: [number, number];
    zoomLevel: number;
}

export default function Map() {
    // Create a ref for the div
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const [mapStyle, setMapStyle] = useState<MapStyle>('light');
    const [is3D, setIs3D] = useState(false);
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [alertsPanelOpen, setAlertsPanelOpen] = useState(false);
    const [activeWeatherLayer, setActiveWeatherLayer] = useState<WeatherLayerType | null>(null);
    const clickPopupRef = useRef<mapboxgl.Popup | null>(null);

    // Flood simulation states
    const [isSimulationActive, setIsSimulationActive] = useState(false);
    const [isSimulationPlaying, setIsSimulationPlaying] = useState(false);
    const [currentSimulationTime, setCurrentSimulationTime] = useState(new Date());
    const [timeJumpMinutes, setTimeJumpMinutes] = useState(30);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Toggle alerts panel
    const toggleAlertsPanel = () => {
        setAlertsPanelOpen(prev => !prev);
    };

    // Handle weather layer change
    const handleWeatherLayerChange = (layer: WeatherLayerType | null) => {
        setActiveWeatherLayer(layer);
        // Future implementation: fetch weather layer data from backend and display overlay
        console.log(`Weather layer changed to: ${layer || 'none'}`);
    };

    // Handle sensor selection
    const handleSensorSelect = (sensorId: string, coordinates: [number, number]) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
                center: coordinates,
                zoom: 16,
                duration: 1500
            });
            // Future implementation: show sensor data popup or highlight sensor
            console.log(`Sensor selected: ${sensorId}`);
        }
    };

    // Simulation control functions
    const toggleSimulation = () => {
        setIsSimulationActive(prev => {
            if (!prev) {
                // Initialize simulation time to the start of the data range
                const timeRange = getSimulationTimeRange();
                setCurrentSimulationTime(timeRange.min);
            } else {
                // Stop simulation when deactivating
                setIsSimulationPlaying(false);
                if (simulationIntervalRef.current) {
                    clearInterval(simulationIntervalRef.current);
                    simulationIntervalRef.current = null;
                }
            }
            return !prev;
        });
    };

    const handleSimulationPlayPause = (playing: boolean) => {
        setIsSimulationPlaying(playing);
    };

    const handleSimulationTimeChange = (time: Date) => {
        setCurrentSimulationTime(time);
    };

    const handleTimeJumpChange = (minutes: number) => {
        setTimeJumpMinutes(minutes);
        // If minutes is 0 (Current), jump to current time
        if (minutes === 0) {
            setCurrentSimulationTime(new Date());
        } else {
            // Jump forward by the specified minutes
            const newTime = new Date(currentSimulationTime.getTime() + (minutes * 60 * 1000));
            const timeRange = getSimulationTimeRange();
            if (newTime <= timeRange.max) {
                setCurrentSimulationTime(newTime);
            } else {
                setCurrentSimulationTime(timeRange.max);
            }
        }
    };
    const addMapLayers = (map: mapboxgl.Map) => {
        // Add barangay boundaries source
        if (!map.getSource('barangays')) {
            map.addSource('barangays', {
                type: 'geojson',
                data: '/data/barangays-combined.geojson'
            });
        }

        // Add barangay boundaries layer
        if (!map.getLayer('barangay-boundaries')) {
            map.addLayer({
                id: 'barangay-boundaries',
                type: 'line',
                source: 'barangays',
                paint: {
                    'line-color': '#4264fb',
                    'line-width': 2
                }
            });
        }

        // Add barangay fill layer
        if (!map.getLayer('barangay-fills')) {
            map.addLayer({
                id: 'barangay-fills',
                type: 'fill',
                source: 'barangays',
                paint: {
                    'fill-color': '#4264fb',
                    'fill-opacity': 0.1,
                    'fill-outline-color': '#4264fb'
                }
            });
        }

        // Add highlighted barangay layer
        if (!map.getLayer('barangay-highlighted')) {
            map.addLayer({
                id: 'barangay-highlighted',
                type: 'fill',
                source: 'barangays',
                paint: {
                    'fill-color': '#12EFC8', // Bright turquoise color
                    'fill-opacity': 0.3,
                    'fill-outline-color': '#12EFC8'
                },
                filter: ['==', 'barangay_id', ''] // Initially empty filter
            });
        }

        // Add hover effect with tooltip
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'barangay-popup',
            maxWidth: '300px',
            offset: 15
        });

        map.on('mousemove', 'barangay-fills', (e) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                map.getCanvas().style.cursor = 'pointer';

                // Get coordinates for the popup
                const coordinates = e.lngLat;

                // Create popup content
                const barangayName = feature.properties?.barangay_name;
                const popupContent = `<div style="font-weight: bold;">${barangayName}</div>`;

                // Set popup content and position
                popup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
            }
        });

        map.on('mouseleave', 'barangay-fills', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        // Add click handler for barangay polygons
        map.on('click', 'barangay-fills', (e) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                const barangayName = feature.properties?.barangay_name;

                if (!barangayName) return;

                // Get coordinates for the popup
                const coordinates = e.lngLat;

                // Find sensor data for this barangay
                const barangaySensor = sampleSensors.find(s =>
                    s.barangay.toLowerCase() === barangayName.toLowerCase()
                );

                // Create popup content with loading state
                const popupContent = `
                    <div style="
                        padding: 12px;
                        min-width: 280px;
                        max-width: 320px;
                        font-family: 'Roboto', sans-serif;
                    ">
                        <h3 style="
                            margin: 0 0 12px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1976d2;
                            border-bottom: 2px solid #1976d2;
                            padding-bottom: 8px;
                        ">${barangayName}</h3>
                        
                        <div style="margin-bottom: 8px;">
                            <p style="
                                margin: 0 0 8px 0;
                                font-size: 11px;
                                color: #666;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                font-weight: 500;
                            ">Current Conditions</p>
                        </div>
                        
                        ${barangaySensor ? `
                            <div style="
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 10px;
                                margin-bottom: 12px;
                            ">
                                <div style="
                                    background-color: #e3f2fd;
                                    padding: 10px;
                                    border-radius: 6px;
                                    border-left: 3px solid #2196f3;
                                ">
                                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">💧 Water Level</div>
                                    <div style="font-size: 16px; font-weight: 600; color: #1976d2;">
                                        ${barangaySensor.readings.water_level?.toFixed(2) || 'N/A'} m
                                    </div>
                                </div>
                                
                                <div style="
                                    background-color: #e8f5e9;
                                    padding: 10px;
                                    border-radius: 6px;
                                    border-left: 3px solid #4caf50;
                                ">
                                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">🌧️ Rainfall</div>
                                    <div style="font-size: 16px; font-weight: 600; color: #388e3c;">
                                        ${barangaySensor.readings.rainfall?.toFixed(1) || 'N/A'} mm
                                    </div>
                                </div>
                                
                                <div style="
                                    background-color: #fff3e0;
                                    padding: 10px;
                                    border-radius: 6px;
                                    border-left: 3px solid #ff9800;
                                ">
                                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">🌡️ Temperature</div>
                                    <div style="font-size: 16px; font-weight: 600; color: #f57c00;">
                                        ${barangaySensor.readings.temperature?.toFixed(1) || 'N/A'}°C
                                    </div>
                                </div>
                                
                                <div style="
                                    background-color: #f3e5f5;
                                    padding: 10px;
                                    border-radius: 6px;
                                    border-left: 3px solid #9c27b0;
                                ">
                                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">💨 Humidity</div>
                                    <div style="font-size: 16px; font-weight: 600; color: #7b1fa2;">
                                        ${barangaySensor.readings.humidity || 'N/A'}%
                                    </div>
                                </div>
                            </div>
                            
                            <div style="
                                background-color: ${barangaySensor.status === 'warning' ? '#fff3e0' : '#e8f5e9'};
                                padding: 10px;
                                border-radius: 6px;
                                border-left: 3px solid ${barangaySensor.status === 'warning' ? '#ff9800' : '#4caf50'};
                                margin-bottom: 8px;
                            ">
                                <div style="font-size: 10px; color: #666; margin-bottom: 4px;">⚠️ Flood Risk Status</div>
                                <div style="
                                    font-size: 14px;
                                    font-weight: 600;
                                    color: ${barangaySensor.status === 'warning' ? '#f57c00' : '#388e3c'};
                                    text-transform: capitalize;
                                ">
                                    ${barangaySensor.status === 'warning' ? '⚠️ Warning Level' : '✅ Normal Level'}
                                </div>
                                ${barangaySensor.status === 'warning' ? `
                                    <div style="
                                        font-size: 11px;
                                        color: #666;
                                        margin-top: 6px;
                                        padding: 6px;
                                        background-color: rgba(255, 255, 255, 0.7);
                                        border-radius: 4px;
                                    ">
                                        Predicted water level may rise to <strong>${(barangaySensor.readings.water_level! + 0.5).toFixed(2)}m</strong> in next 6 hours.
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div style="
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 8px;
                                font-size: 11px;
                                color: #666;
                            ">
                                <div>🌬️ Wind: ${barangaySensor.readings.wind_speed?.toFixed(1) || 'N/A'} km/h ${barangaySensor.readings.wind_direction || ''}</div>
                                <div>👁️ Visibility: ${barangaySensor.readings.visibility?.toFixed(1) || 'N/A'} km</div>
                            </div>
                        ` : `
                            <div style="
                                padding: 20px;
                                text-align: center;
                                color: #999;
                                font-size: 13px;
                            ">
                                <p style="margin: 0;">No sensor data available for this barangay</p>
                            </div>
                        `}
                        
                        <div style="
                            margin-top: 12px;
                            padding-top: 10px;
                            border-top: 1px solid #e0e0e0;
                            font-size: 10px;
                            color: #999;
                            text-align: center;
                        ">
                            Click on barangay name above for detailed information
                        </div>
                    </div>
                `;

                // Remove existing popup if any
                if (clickPopupRef.current) {
                    clickPopupRef.current.remove();
                }

                // Create and show new popup
                const newPopup = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true,
                    maxWidth: '350px',
                    className: 'barangay-weather-popup',
                    offset: 15
                })
                    .setLngLat(coordinates)
                    .setHTML(popupContent)
                    .addTo(map);

                clickPopupRef.current = newPopup;

                // Clean up on popup close
                newPopup.on('close', () => {
                    clickPopupRef.current = null;
                });
            }
        });
    };

    // Handle map style change with proper handling for mapbox-gl
    const handleMapStyleChange = (style: MapStyle) => {
        setMapStyle(style);
        if (mapInstanceRef.current) {
            // Get the current camera position before changing styles
            const currentCenter = mapInstanceRef.current.getCenter();
            const currentZoom = mapInstanceRef.current.getZoom();
            const currentPitch = mapInstanceRef.current.getPitch();
            const currentBearing = mapInstanceRef.current.getBearing();

            // Set the new style
            mapInstanceRef.current.setStyle(getMapStyle(style));

            // When the style loads, restore the camera position
            mapInstanceRef.current.once('style.load', () => {
                // Restore camera position
                mapInstanceRef.current?.jumpTo({
                    center: currentCenter,
                    zoom: currentZoom,
                    pitch: currentPitch,
                    bearing: currentBearing
                });

                // Re-add sources and layers after style change
                addMapLayers(mapInstanceRef.current!);
            });
        }
    };

    // Simulation playback effect
    useEffect(() => {
        if (isSimulationPlaying && isSimulationActive) {
            const interval = 1000; // Fixed 1 second interval for smooth playback

            simulationIntervalRef.current = setInterval(() => {
                setCurrentSimulationTime(prevTime => {
                    const timeRange = getSimulationTimeRange();
                    // Advance by 15 minutes per tick (1 second real time = 15 minutes simulation time)
                    const newTime = new Date(prevTime.getTime() + (15 * 60 * 1000));

                    if (newTime >= timeRange.max) {
                        setIsSimulationPlaying(false);
                        return timeRange.max;
                    }

                    return newTime;
                });
            }, interval);
        } else {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
                simulationIntervalRef.current = null;
            }
        }

        return () => {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
            }
        };
    }, [isSimulationPlaying, isSimulationActive]);

    // Get current simulation data frame
    const getCurrentTimeFrame = () => {
        if (!isSimulationActive) return null;

        // Find the closest time frame to the current simulation time
        const targetTime = currentSimulationTime.getTime();
        let closestFrame = floodSimulationData[0];
        let minDiff = Math.abs(floodSimulationData[0].timestamp.getTime() - targetTime);

        for (const frame of floodSimulationData) {
            const diff = Math.abs(frame.timestamp.getTime() - targetTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestFrame = frame;
            }
        }

        return closestFrame;
    };

    // Load barangay data
    useEffect(() => {
        const loadBarangays = async () => {
            try {
                const response = await fetch('/data/barangays-combined.geojson');
                const data = await response.json();

                // Define proper type for GeoJSON feature
                interface BarangayFeature {
                    properties: {
                        barangay_id: string;
                        barangay_name: string;
                        barangay_center: [number, number];
                        barangay_zoom_level?: number;
                    }
                }

                const extractedBarangays = data.features
                    .filter((feature: BarangayFeature) =>
                        feature.properties.barangay_id &&
                        feature.properties.barangay_name &&
                        feature.properties.barangay_center
                    )
                    .map((feature: BarangayFeature) => ({
                        id: feature.properties.barangay_id,
                        name: feature.properties.barangay_name,
                        center: feature.properties.barangay_center,
                        zoomLevel: feature.properties.barangay_zoom_level || 15
                    }))
                    // Remove duplicates based on barangay_id
                    .filter((barangay: Barangay, index: number, self: Barangay[]) =>
                        index === self.findIndex((b) => b.id === barangay.id)
                    );

                setBarangays(extractedBarangays);
            } catch (error) {
                console.error("Error loading barangay data:", error);
            }
        };

        loadBarangays();
    }, []);

    // Handle 3D toggle
    const handleViewToggle = (is3DView: boolean) => {
        setIs3D(is3DView);
        if (mapInstanceRef.current) {
            // Set pitch and bearing for 3D effect
            mapInstanceRef.current.easeTo({
                pitch: is3DView ? 60 : 0,
                bearing: is3DView ? 30 : 0,
                duration: 1000
            });
        }
    };

    // Highlight selected barangay
    const highlightBarangay = (barangayId: string | null) => {
        if (!mapInstanceRef.current) return;

        // Reset previous filters
        mapInstanceRef.current.setFilter('barangay-highlighted', ['==', 'barangay_id', '']);

        if (barangayId) {
            // Set filter to highlight only the selected barangay
            mapInstanceRef.current.setFilter('barangay-highlighted', ['==', 'barangay_id', barangayId]);
        }
    };

    // Reset map to default view
    const resetMapView = () => {
        if (!mapInstanceRef.current) return;

        mapInstanceRef.current.flyTo({
            center: [123.2700, 13.6475], // Default center
            zoom: 12,
            pitch: is3D ? 60 : 0,
            bearing: is3D ? 30 : 0,
            duration: 1500
        });

        setSelectedBarangay(null);
        highlightBarangay(null);
    };

    // Fly to selected barangay
    const handleBarangaySelect = (barangayId: string) => {
        const barangay = barangays.find(b => b.id === barangayId);
        if (!barangay || !mapInstanceRef.current) return;

        setSelectedBarangay(barangayId);
        setDropdownOpen(false);

        mapInstanceRef.current.flyTo({
            center: barangay.center as [number, number],
            zoom: barangay.zoomLevel,
            duration: 2000,
            essential: true
        });

        // Highlight the selected barangay
        highlightBarangay(barangayId);
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    };

    // Add sensor markers to the map
    const addSensorMarkers = (map: mapboxgl.Map) => {
        // Import the sensor data - using dynamic import to ensure proper loading
        import('./weatherData').then((weatherData) => {
            const sampleSensors = weatherData.sampleSensors;
            // Create a reusable popup
            const popup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false,
                maxWidth: '300px',
                className: 'sensor-popup'
            });

            // Add markers for each sensor
            sampleSensors.forEach(sensor => {
                // Create HTML element for custom marker
                const el = document.createElement('div');
                el.className = 'sensor-marker';
                el.innerHTML = '<div class="sensor-marker-inner"></div>';

                // Set color based on status
                const statusColor = sensor.status === 'active' ? '#4CAF50' :
                    sensor.status === 'warning' ? '#FFC107' :
                        sensor.status === 'error' ? '#F44336' : '#9E9E9E';

                (el.querySelector('.sensor-marker-inner') as HTMLElement).style.backgroundColor = statusColor;

                // Create marker
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([sensor.lng, sensor.lat])
                    .addTo(map);

                // Add click listener
                marker.getElement().addEventListener('click', () => {
                    // Create popup content
                    const popupContent = `
                        <div class="sensor-popup-content">
                            <h3>${sensor.name}</h3>
                            <p>Status: ${sensor.status}</p>
                            <div class="sensor-data-grid">
                                <div class="sensor-data-item">
                                    <span>Temperature</span>
                                    <strong>${sensor.readings.temperature}°C</strong>
                                </div>
                                <div class="sensor-data-item">
                                    <span>Humidity</span>
                                    <strong>${sensor.readings.humidity}%</strong>
                                </div>
                                <div class="sensor-data-item">
                                    <span>Wind</span>
                                    <strong>${sensor.readings.wind_speed} km/h ${sensor.readings.wind_direction}</strong>
                                </div>
                                <div class="sensor-data-item">
                                    <span>Rainfall</span>
                                    <strong>${sensor.readings.rainfall} mm</strong>
                                </div>
                                <div class="sensor-data-item">
                                    <span>Water Level</span>
                                    <strong>${sensor.readings.water_level} m</strong>
                                </div>
                                <div class="sensor-data-item">
                                    <span>UV Index</span>
                                    <strong>${sensor.readings.uv_index}</strong>
                                </div>
                            </div>
                        </div>
                    `;

                    // Set popup content and position
                    popup.setLngLat([sensor.lng, sensor.lat])
                        .setHTML(popupContent)
                        .addTo(map);
                });
            });

            // Add CSS for markers and popup
            const style = document.createElement('style');
            style.innerHTML = `
                .sensor-marker {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                }
                .sensor-marker-inner {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 5px rgba(0,0,0,0.3);
                }
                .sensor-popup-content {
                    padding: 5px;
                }
                .sensor-popup-content h3 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                }
                .sensor-popup-content p {
                    margin: 0 0 8px 0;
                    font-size: 12px;
                    color: #666;
                }
                .sensor-data-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .sensor-data-item {
                    display: flex;
                    flex-direction: column;
                    background-color: #f5f5f5;
                    padding: 5px 8px;
                    border-radius: 4px;
                }
                .sensor-data-item span {
                    font-size: 10px;
                    color: #666;
                }
                .sensor-data-item strong {
                    font-size: 14px;
                    color: #333;
                }
                .barangay-weather-popup .mapboxgl-popup-content {
                    padding: 0;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }
                .barangay-weather-popup .mapboxgl-popup-close-button {
                    font-size: 20px;
                    padding: 8px;
                    color: #666;
                }
                .barangay-weather-popup .mapboxgl-popup-close-button:hover {
                    background-color: #f5f5f5;
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        });
    };

    useEffect(() => {
        if (!mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: getMapStyle(mapStyle),
            center: [123.2700, 13.6475], // [lng, lat]
            zoom: 12,
            pitch: is3D ? 60 : 0,
            bearing: is3D ? 30 : 0,
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');
        map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }), 'bottom-right');

        // Load GeoJSON data when map loads
        map.on('load', () => {
            // Add map layers using the extracted function
            addMapLayers(map);

            // Add sensor markers to the map
            addSensorMarkers(map);

            // If we have an active weather layer, we would apply it here
            if (activeWeatherLayer) {
                console.log(`Applying weather layer: ${activeWeatherLayer}`);
                // Future implementation: Add weather overlay to the map
            }
        });

        // Save map instance to ref for later access
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [mapStyle, is3D, activeWeatherLayer]);

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
                ref={mapContainer}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />

            {/* Barangay Selector */}
            <Box sx={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 1100
            }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={toggleDropdown}
                    startIcon={<LocationCity />}
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: 'text.primary',
                        backdropFilter: 'blur(5px)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                    }}
                >
                    {selectedBarangay ? barangays.find(b => b.id === selectedBarangay)?.name || 'Select Barangay' : 'Select Barangay'}
                    {dropdownOpen ? <ExpandLess /> : <ExpandMore />}
                </Button>

                <Collapse in={dropdownOpen} timeout="auto" unmountOnExit>
                    <Paper
                        elevation={3}
                        sx={{
                            mt: 0.5,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            width: '100%',
                        }}
                    >
                        <List component="nav" dense>
                            {barangays.map((barangay) => (
                                <ListItem key={barangay.id} disablePadding>
                                    <ListItemButton
                                        onClick={() => handleBarangaySelect(barangay.id)}
                                        selected={selectedBarangay === barangay.id}
                                        sx={{
                                            '&.Mui-selected': {
                                                backgroundColor: 'rgba(18, 239, 200, 0.15)',
                                                borderLeft: '4px solid #12EFC8',
                                            },
                                            '&.Mui-selected:hover': {
                                                backgroundColor: 'rgba(18, 239, 200, 0.25)',
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgba(66, 100, 251, 0.08)',
                                            }
                                        }}
                                    >
                                        <LocationOn
                                            fontSize="small"
                                            sx={{
                                                mr: 1,
                                                color: selectedBarangay === barangay.id ? '#12EFC8' : 'primary.main'
                                            }}
                                        />
                                        <ListItemText primary={barangay.name} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Collapse>
            </Box>

            {/* Selected Barangay Info Panel */}
            {selectedBarangay && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        top: '84px',
                        right: alertsPanelOpen ? '312px' : '80px',
                        zIndex: 1050,
                        p: 2,
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        maxWidth: '240px',
                        borderLeft: '4px solid #12EFC8',
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.12)'
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {barangays.find(b => b.id === selectedBarangay)?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        ID: {selectedBarangay}
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={resetMapView}
                        sx={{
                            bgcolor: '#12EFC8',
                            color: 'text.primary',
                            '&:hover': { bgcolor: '#0ED7B5' }
                        }}
                        fullWidth
                    >
                        Reset View
                    </Button>
                </Paper>
            )}

            {/* Alerts Panel and Toggle Button */}
            <AlertsPanel isOpen={alertsPanelOpen} onClose={() => setAlertsPanelOpen(false)} />
            <AlertsToggleButton onClick={toggleAlertsPanel} isPanelOpen={alertsPanelOpen} />

            {/* Weather Layer Controls - Positioned at the bottom for better accessibility */}
            <WeatherLayerControls onLayerChange={handleWeatherLayerChange} position="bottom" />

            {/* Weather Data Display - Lower left corner */}
            <WeatherDataDisplay onSensorSelect={handleSensorSelect} />

            {/* Environmental Data Overlay - Right side */}
            <MapDataOverlay selectedLocation={selectedBarangay ? barangays.find(b => b.id === selectedBarangay)?.name : undefined} />

            {/* Flood Simulation Component */}
            <FloodSimulation
                map={mapInstanceRef.current}
                isActive={isSimulationActive}
                currentTimeFrame={getCurrentTimeFrame()}
            />

            {/* Time Control - Bottom center */}
            {isSimulationActive && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1040
                    }}
                >
                    <TimeControl
                        isPlaying={isSimulationPlaying}
                        onPlayPause={handleSimulationPlayPause}
                        currentTime={currentSimulationTime}
                        onTimeChange={handleSimulationTimeChange}
                        minTime={getSimulationTimeRange().min}
                        maxTime={getSimulationTimeRange().max}
                        timeJumpMinutes={timeJumpMinutes}
                        onTimeJumpChange={handleTimeJumpChange}
                        disabled={false}
                    />
                </Box>
            )}

            {/* Map Controls Panel */}
            <MapControlPanel elevation={3} sx={{
                top: '76px',
                zIndex: 1030,
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.92)',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* 2D/3D Toggle */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Map View
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    value={is3D}
                    onChange={(_, value) => value !== null && handleViewToggle(value)}
                    size="small"
                >
                    <ToggleButton value={false}>
                        <Tooltip title="2D View">
                            <ViewComfy fontSize="small" />
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value={true}>
                        <Tooltip title="3D View">
                            <ThreeDRotation fontSize="small" />
                        </Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>

                {/* Flood Simulation Toggle */}
                <Button
                    size="small"
                    variant={isSimulationActive ? "contained" : "outlined"}
                    onClick={toggleSimulation}
                    startIcon={isSimulationActive ? <StopCircleIcon /> : <PlayCircleFilledIcon />}
                    sx={{
                        mt: 1,
                        textTransform: 'none',
                        backgroundColor: isSimulationActive ? 'primary.main' : 'transparent',
                        '&:hover': {
                            backgroundColor: isSimulationActive ? 'primary.dark' : 'primary.light'
                        }
                    }}
                    fullWidth
                >
                    {isSimulationActive ? 'Stop Simulation' : 'Flood Simulation'}
                </Button>

                {/* Reset View Button */}
                {selectedBarangay && (
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={resetMapView}
                        sx={{ mt: 1, textTransform: 'none' }}
                    >
                        Reset View
                    </Button>
                )}

                {/* Map Style Selectors */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
                    Map Style
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Satellite View">
                        <IconButton
                            size="small"
                            onClick={() => handleMapStyleChange('satellite')}
                            color={mapStyle === 'satellite' ? 'primary' : 'default'}
                        >
                            <SatelliteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Terrain View">
                        <IconButton
                            size="small"
                            onClick={() => handleMapStyleChange('terrain')}
                            color={mapStyle === 'terrain' ? 'primary' : 'default'}
                        >
                            <TerrainIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Dark View">
                        <IconButton
                            size="small"
                            onClick={() => handleMapStyleChange('dark')}
                            color={mapStyle === 'dark' ? 'primary' : 'default'}
                        >
                            <DarkModeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Light View">
                        <IconButton
                            size="small"
                            onClick={() => handleMapStyleChange('light')}
                            color={mapStyle === 'light' ? 'primary' : 'default'}
                        >
                            <LightModeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </MapControlPanel>
        </Box>
    );
}
