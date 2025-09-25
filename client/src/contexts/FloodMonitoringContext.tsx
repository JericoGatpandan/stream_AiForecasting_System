import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FloodAlert {
  id: string;
  location: string;
  type: 'warning' | 'watch' | 'advisory' | 'emergency';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  message: string;
  timestamp: string;
  coordinates?: [number, number];
  waterLevel?: number;
  riskLevel?: string;
  affectedAreas?: string[];
}

export interface FloodReport {
  id: string;
  location: string;
  reportType: 'sensor' | 'visual' | 'rainfall' | 'overflow';
  status: 'normal' | 'elevated' | 'critical';
  description: string;
  timestamp: string;
  coordinates?: [number, number];
  data?: {
    waterLevel?: number;
    flowRate?: number;
    rainfall?: number;
    temperature?: number;
  };
}

interface FloodMonitoringContextType {
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  alerts: FloodAlert[];
  reports: FloodReport[];
  addAlert: (alert: Omit<FloodAlert, 'id' | 'timestamp'>) => void;
  addReport: (report: Omit<FloodReport, 'id' | 'timestamp'>) => void;
  getLocationData: (location: string) => {
    alerts: FloodAlert[];
    reports: FloodReport[];
    riskLevel: string;
    waterLevel: number;
  };
  navigateToLocation: (location: string, coordinates?: [number, number]) => void;
}

const FloodMonitoringContext = createContext<FloodMonitoringContextType | undefined>(undefined);

// Sample data for demonstration
const sampleAlerts: FloodAlert[] = [
  {
    id: '1',
    location: 'Pacol',
    type: 'warning',
    severity: 'moderate',
    message: 'Water level rising due to upstream rainfall. Monitor closely for potential evacuation.',
    timestamp: '2025-01-25T13:30:00Z',
    coordinates: [123.2700, 13.6475],
    waterLevel: 2.3,
    riskLevel: 'moderate',
    affectedAreas: ['Residential Area A', 'School District']
  },
  {
    id: '2',
    location: 'Naga City Center',
    type: 'watch',
    severity: 'low',
    message: 'Current conditions favor possible flood development. Continue normal activities with weather awareness.',
    timestamp: '2025-01-25T12:15:00Z',
    coordinates: [123.1817, 13.6218],
    waterLevel: 1.8,
    riskLevel: 'low'
  },
  {
    id: '3',
    location: 'Triangulo',
    type: 'advisory',
    severity: 'low',
    message: 'Minor flooding possible in low-lying areas. Avoid unnecessary travel through flood-prone zones.',
    timestamp: '2025-01-25T11:45:00Z',
    coordinates: [123.1900, 13.6300],
    waterLevel: 1.5,
    riskLevel: 'low'
  }
];

const sampleReports: FloodReport[] = [
  {
    id: '1',
    location: 'Pacol',
    reportType: 'sensor',
    status: 'elevated',
    description: 'Sensor WS-001 reports water level at 2.3m, approaching warning threshold',
    timestamp: '2025-01-25T13:35:00Z',
    coordinates: [123.2700, 13.6475],
    data: {
      waterLevel: 2.3,
      flowRate: 3.2,
      rainfall: 15.4,
      temperature: 28
    }
  },
  {
    id: '2',
    location: 'Naga City Center',
    reportType: 'visual',
    status: 'normal',
    description: 'Visual inspection confirms normal water flow, no signs of backing or overflow',
    timestamp: '2025-01-25T13:20:00Z',
    coordinates: [123.1817, 13.6218],
    data: {
      waterLevel: 1.8,
      flowRate: 2.1
    }
  },
  {
    id: '3',
    location: 'Triangulo',
    reportType: 'rainfall',
    status: 'normal',
    description: 'Rainfall monitoring station reports 12mm in the last hour, within normal range',
    timestamp: '2025-01-25T13:10:00Z',
    coordinates: [123.1900, 13.6300],
    data: {
      rainfall: 12.0,
      waterLevel: 1.5
    }
  },
  {
    id: '4',
    location: 'Sabang',
    reportType: 'sensor',
    status: 'critical',
    description: 'Sensor malfunction detected at monitoring station SS-005, manual inspection required',
    timestamp: '2025-01-25T12:50:00Z',
    coordinates: [123.2100, 13.6500]
  }
];

export const FloodMonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<FloodAlert[]>(sampleAlerts);
  const [reports, setReports] = useState<FloodReport[]>(sampleReports);

  const setSelectedLocation = useCallback((location: string | null) => {
    setSelectedLocationState(location);
  }, []);

  const addAlert = useCallback((alert: Omit<FloodAlert, 'id' | 'timestamp'>) => {
    const newAlert: FloodAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const addReport = useCallback((report: Omit<FloodReport, 'id' | 'timestamp'>) => {
    const newReport: FloodReport = {
      ...report,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
  }, []);

  const getLocationData = useCallback((location: string) => {
    const locationAlerts = alerts.filter(alert => 
      alert.location.toLowerCase().includes(location.toLowerCase())
    );
    const locationReports = reports.filter(report => 
      report.location.toLowerCase().includes(location.toLowerCase())
    );
    
    // Calculate risk level based on alerts and reports
    const hasHighSeverity = locationAlerts.some(alert => alert.severity === 'high' || alert.severity === 'extreme');
    const hasElevatedReports = locationReports.some(report => report.status === 'elevated' || report.status === 'critical');
    
    let riskLevel = 'low';
    if (hasHighSeverity) riskLevel = 'high';
    else if (hasElevatedReports || locationAlerts.some(alert => alert.severity === 'moderate')) riskLevel = 'moderate';
    
    // Get latest water level from reports or alerts
    const latestWaterLevel = locationReports
      .filter(report => report.data?.waterLevel)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.data?.waterLevel ||
      locationAlerts[0]?.waterLevel || 1.5;

    return {
      alerts: locationAlerts,
      reports: locationReports,
      riskLevel,
      waterLevel: latestWaterLevel
    };
  }, [alerts, reports]);

  const navigateToLocation = useCallback((location: string, coordinates?: [number, number]) => {
    setSelectedLocation(location);
    // This would trigger map navigation - we'll implement this in the map component
    if (coordinates) {
      // Store coordinates for map component to use
      localStorage.setItem('mapTarget', JSON.stringify({ location, coordinates }));
      // Dispatch custom event to notify map component
      window.dispatchEvent(new CustomEvent('navigateToLocation', { 
        detail: { location, coordinates } 
      }));
    }
  }, [setSelectedLocation]);

  const value: FloodMonitoringContextType = {
    selectedLocation,
    setSelectedLocation,
    alerts,
    reports,
    addAlert,
    addReport,
    getLocationData,
    navigateToLocation
  };

  return (
    <FloodMonitoringContext.Provider value={value}>
      {children}
    </FloodMonitoringContext.Provider>
  );
};

export const useFloodMonitoring = (): FloodMonitoringContextType => {
  const context = useContext(FloodMonitoringContext);
  if (context === undefined) {
    throw new Error('useFloodMonitoring must be used within a FloodMonitoringProvider');
  }
  return context;
};