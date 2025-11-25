import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  styled,
} from "@mui/material";
import AlertsPanel from './AlertsPanel';
import WeatherLayerControls from './WeatherLayerControls';
import WeatherDataDisplay from './WeatherDataDisplay';
import TimeControl from '@/components/TimeControl';
import FloodSimulation from '@/components/FloodSimulation';
import { floodSimulationData, getSimulationTimeRange } from '@/data/floodSimulationData';
import type { WeatherLayerType } from './weatherData';
import { sampleSensors } from './weatherData';
import {
  ThreeDRotation,
} from "@mui/icons-material";
import SatelliteIcon from '@mui/icons-material/Satellite';
import TerrainIcon from '@mui/icons-material/Terrain';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TimelineIcon from '@mui/icons-material/Timeline';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import FloodRiskPanel from '@/components/FloodRiskPanel';
import RiskLegend from '@/components/RiskLegend';

// Token from .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

type MapStyle = 'satellite' | 'terrain' | 'dark' | 'light';

const MapControlPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 3,
  padding: theme.spacing(1.25),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.96)'
    : 'rgba(255, 255, 255, 0.96)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 10px 30px rgba(15,23,42,0.45)',
  border: `1px solid ${theme.palette.divider}`,
  minWidth: 230,
}));

const FloatingTools = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(10),
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const getMapStyle = (type: MapStyle): string => {
  switch (type) {
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

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const clickPopupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>('light');
  const [is3D, setIs3D] = useState(false);
  const [selectedBarangayName, setSelectedBarangayName] = useState<string | null>(null);
  const [alertsPanelOpen, setAlertsPanelOpen] = useState(false);
  const [activeWeatherLayer, setActiveWeatherLayer] = useState<WeatherLayerType | null>(null);

  // Flood simulation states (kept for now, can be hidden later if not needed)
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [isSimulationPlaying, setIsSimulationPlaying] = useState(false);
  const [currentSimulationTime, setCurrentSimulationTime] = useState(new Date());
  const [timeJumpMinutes, setTimeJumpMinutes] = useState(30);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleAlertsPanel = () => setAlertsPanelOpen((prev) => !prev);

  const handleWeatherLayerChange = (layer: WeatherLayerType | null) => {
    setActiveWeatherLayer(layer);
    // Future: fetch layer data from backend
  };

  const handleSensorSelect = (sensorId: string, coordinates: [number, number]) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({ center: coordinates, zoom: 16, duration: 1500 });
    // Future: show sensor popup using backend data
    // eslint-disable-next-line no-console
    console.log('Sensor selected:', sensorId);
  };

  const toggleSimulation = () => {
    setIsSimulationActive((prev) => {
      if (!prev) {
        const timeRange = getSimulationTimeRange();
        setCurrentSimulationTime(timeRange.min);
      } else {
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
    if (minutes === 0) {
      setCurrentSimulationTime(new Date());
    } else {
      const newTime = new Date(currentSimulationTime.getTime() + minutes * 60 * 1000);
      const timeRange = getSimulationTimeRange();
      setCurrentSimulationTime(newTime <= timeRange.max ? newTime : timeRange.max);
    }
  };

  const addMapLayers = (map: mapboxgl.Map) => {
    if (!map.getSource('barangays')) {
      map.addSource('barangays', {
        type: 'geojson',
        data: '/data/barangays-combined.geojson',
      });
    }

    if (!map.getLayer('barangay-boundaries')) {
      map.addLayer({
        id: 'barangay-boundaries',
        type: 'line',
        source: 'barangays',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.5,
        },
      });
    }

    if (!map.getLayer('barangay-fills')) {
      map.addLayer({
        id: 'barangay-fills',
        type: 'fill',
        source: 'barangays',
        paint: {
          'fill-color': '#0ea5e9',
          'fill-opacity': 0.12,
          'fill-outline-color': '#38bdf8',
        },
      });
    }

    if (!map.getLayer('barangay-highlighted')) {
      map.addLayer({
        id: 'barangay-highlighted',
        type: 'fill',
        source: 'barangays',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.35,
          'fill-outline-color': '#22c55e',
        },
        filter: ['==', 'barangay_name', ''],
      });
    }

    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'barangay-popup',
      maxWidth: '280px',
      offset: 12,
    });

    map.on('mousemove', 'barangay-fills', (e) => {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0];
      const barangayName = feature.properties?.barangay_name as string | undefined;
      if (!barangayName) return;

      map.getCanvas().style.cursor = 'pointer';
      const coordinates = e.lngLat;
      const popupContent = `<div style="font-weight: 600; font-size: 13px;">${barangayName}</div>`;
      hoverPopup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
    });

    map.on('mouseleave', 'barangay-fills', () => {
      map.getCanvas().style.cursor = '';
      hoverPopup.remove();
    });

    map.on('click', 'barangay-fills', (e) => {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0];
      const barangayName = feature.properties?.barangay_name as string | undefined;
      if (!barangayName) return;

      setSelectedBarangayName(barangayName);

      // Update highlight filter
      if (map.getLayer('barangay-highlighted')) {
        map.setFilter('barangay-highlighted', ['==', 'barangay_name', barangayName]);
      }

      const coordinates = e.lngLat;
      const barangaySensor = sampleSensors.find(
        (s) => s.barangay.toLowerCase() === barangayName.toLowerCase(),
      );

      const popupContent = `
        <div style="padding: 12px; min-width: 260px; max-width: 320px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
            ${barangayName}
          </h3>
          ${barangaySensor ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div style="background-color: #e0f2fe; padding: 8px; border-radius: 6px;">
                <div style="font-size: 10px; color: #0369a1; text-transform: uppercase; letter-spacing: 0.04em;">Water Level</div>
                <div style="font-size: 14px; font-weight: 600; color: #0f172a;">
                  ${barangaySensor.readings.water_level?.toFixed(2) ?? 'N/A'} m
                </div>
              </div>
              <div style="background-color: #dcfce7; padding: 8px; border-radius: 6px;">
                <div style="font-size: 10px; color: #15803d; text-transform: uppercase; letter-spacing: 0.04em;">Rainfall</div>
                <div style="font-size: 14px; font-weight: 600; color: #0f172a;">
                  ${barangaySensor.readings.rainfall?.toFixed(1) ?? 'N/A'} mm
                </div>
              </div>
            </div>
          ` : `
            <div style="padding: 12px; font-size: 12px; color: #6b7280;">No mock sensor data available.</div>
          `}
        </div>
      `;

      if (clickPopupRef.current) {
        clickPopupRef.current.remove();
      }
      const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
      clickPopupRef.current = popup;
    });
  };

  useEffect(() => {
    if (!mapContainer.current || mapInstanceRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(mapStyle),
      center: [123.1948, 13.6233],
      zoom: 12,
      pitch: is3D ? 45 : 0,
      antialias: true,
    });

    map.on('load', () => {
      addMapLayers(map);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setStyle(getMapStyle(mapStyle));
    mapInstanceRef.current.on('style.load', () => {
      addMapLayers(mapInstanceRef.current!);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setPitch(is3D ? 45 : 0);
  }, [is3D]);

  useEffect(() => {
    if (!isSimulationActive || !isSimulationPlaying) return;
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    const interval = setInterval(() => {
      setCurrentSimulationTime((prev) => {
        const next = new Date(prev.getTime() + timeJumpMinutes * 60 * 1000);
        const { max } = getSimulationTimeRange();
        return next <= max ? next : max;
      });
    }, 1000);
    simulationIntervalRef.current = interval;
    return () => {
      clearInterval(interval);
    };
  }, [isSimulationActive, isSimulationPlaying, timeJumpMinutes]);

  const recenterMap = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: [123.1948, 13.6233],
      zoom: 12,
      duration: 1000,
    });
  };

  const zoomToExtent = () => {
    if (!mapInstanceRef.current) return;
    // Fit to barangay source if available
    const map = mapInstanceRef.current;
    const source = map.getSource('barangays') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return recenterMap();
    // We can't read data back from the source easily here; fallback to a hardcoded bound
    map.fitBounds([
      [123.10, 13.55],
      [123.26, 13.69],
    ], { padding: 40, duration: 1000 });
  };

  const toggleSimulationAndPlay = () => {
    if (!isSimulationActive) {
      toggleSimulation();
      setIsSimulationPlaying(true);
    } else {
      toggleSimulation();
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box ref={mapContainer} sx={{ width: '100%', height: '100%' }} />

      <MapControlPanel>
        {/* Map style toggle row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <ToggleButtonGroup
            size="small"
            value={mapStyle}
            exclusive
            onChange={(_, value) => value && setMapStyle(value)}
          >
            {/* style buttons */}
            <Tooltip title="Light map">
              <ToggleButton value="light">
                <LightModeIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Dark map">
              <ToggleButton value="dark">
                <DarkModeIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Satellite">
              <ToggleButton value="satellite">
                <SatelliteIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Terrain">
              <ToggleButton value="terrain">
                <TerrainIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Tooltip title={is3D ? 'Disable 3D view' : 'Enable 3D view'}>
            <IconButton
              size="small"
              sx={{ ml: 1, bgcolor: 'rgba(15,23,42,0.85)', color: 'white', '&:hover': { bgcolor: 'rgba(15,23,42,1)' } }}
              onClick={() => setIs3D((prev) => !prev)}
            >
              <ThreeDRotation fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Alerts + weather layers row */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <WeatherLayerControls onLayerChange={handleWeatherLayerChange} />
        </Box>
      </MapControlPanel>

      <WeatherDataDisplay onSensorSelect={handleSensorSelect} />

      <TimeControl
        isPlaying={isSimulationPlaying}
        currentTime={currentSimulationTime}
        onPlayPause={handleSimulationPlayPause}
        onTimeChange={handleSimulationTimeChange}
        timeJumpMinutes={timeJumpMinutes}
        onTimeJumpChange={handleTimeJumpChange}
        disabled={!isSimulationActive}
      />

      <FloodSimulation
        map={mapInstanceRef.current}
        isActive={isSimulationActive}
        currentTimeFrame={null}
      />

      <FloodRiskPanel selectedBarangayName={selectedBarangayName} />

      <RiskLegend position="bottom-right" />

      <AlertsPanel isOpen={alertsPanelOpen} onClose={toggleAlertsPanel} />

      <FloatingTools>
        <Tooltip title="Center map">
          <IconButton size="small" sx={{ bgcolor: 'rgba(15,23,42,0.9)', color: 'white', '&:hover': { bgcolor: 'rgba(15,23,42,1)' } }} onClick={recenterMap}>
            <MyLocationIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={isSimulationActive ? 'Stop simulation' : 'Start simulation'}>
          <IconButton size="small" sx={{ bgcolor: 'rgba(15,23,42,0.9)', color: 'white', '&:hover': { bgcolor: 'rgba(15,23,42,1)' } }} onClick={toggleSimulationAndPlay}>
            <TimelineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom to city extent">
          <IconButton size="small" sx={{ bgcolor: 'rgba(15,23,42,0.9)', color: 'white', '&:hover': { bgcolor: 'rgba(15,23,42,1)' } }} onClick={zoomToExtent}>
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </FloatingTools>
    </Box>
  );
}
