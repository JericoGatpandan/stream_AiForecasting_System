export interface FloodRiskPoint {
    lng: number;
    lat: number;
    risk: number; // 0-1 scale (0 = no risk, 1 = extreme risk)
    waterLevel: number; // in meters
    zone: string; // area identifier
}

export interface BarangayFloodRisk {
    barangayId: string;
    barangayName: string;
    risk: number; // 0-1 scale (0 = no risk, 1 = extreme risk)
    waterLevel: number; // in meters
    riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
    center: [number, number];
    isOriginPoint?: boolean; // for virus-like spread simulation
    infectionTime?: number; // time when this barangay was "infected" with flood risk
}

export interface FloodTimeFrame {
    timestamp: Date;
    riskData: FloodRiskPoint[]; // Keep for backward compatibility
    barangayRisks: BarangayFloodRisk[]; // New barangay-based data
    overallRisk: 'low' | 'moderate' | 'high' | 'extreme';
    precipitationMm: number;
    riverLevel: number;
}

// Generate flood simulation data for Naga City area with virus-like spread
export const generateFloodSimulationData = (): FloodTimeFrame[] => {
    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 6); // Start 6 hours ago
    
    const timeFrames: FloodTimeFrame[] = [];
    const totalFrames = 48; // 48 time steps (every 30 minutes for 24 hours)
    
    // Define all barangays with their properties
    const barangays = [
        { id: 'pacol', name: 'Pacol', center: [123.2700, 13.6475] as [number, number], baseRisk: 0.4, riverProximity: 1.0 },
        { id: 'triangulo', name: 'Triangulo', center: [123.1900, 13.6300] as [number, number], baseRisk: 0.2, riverProximity: 0.8 },
        { id: 'sabang', name: 'Sabang', center: [123.2100, 13.6500] as [number, number], baseRisk: 0.45, riverProximity: 0.9 },
        { id: 'carolina', name: 'Carolina', center: [123.2200, 13.6600] as [number, number], baseRisk: 0.35, riverProximity: 1.0 },
        { id: 'peñafrancia', name: 'Peñafrancia', center: [123.1650, 13.6350] as [number, number], baseRisk: 0.25, riverProximity: 0.6 },
        { id: 'bagumbayannorte', name: 'Bagumbayan Norte', center: [123.1750, 13.6500] as [number, number], baseRisk: 0.15, riverProximity: 0.4 },
        { id: 'bagumbayansur', name: 'Bagumbayan Sur', center: [123.1853, 13.6315] as [number, number], baseRisk: 0.18, riverProximity: 0.5 },
        { id: 'mabolo', name: 'Mabolo', center: [123.1821, 13.6125] as [number, number], baseRisk: 0.12, riverProximity: 0.3 },
        { id: 'abella', name: 'Abella', center: [123.1850, 13.6240] as [number, number], baseRisk: 0.1, riverProximity: 0.2 },
        { id: 'tinago', name: 'Tinago', center: [123.1914, 13.6244] as [number, number], baseRisk: 0.2, riverProximity: 0.4 },
        { id: 'sanfelipe', name: 'San Felipe', center: [123.2095, 13.6447] as [number, number], baseRisk: 0.3, riverProximity: 0.7 },
        { id: 'sanisidro', name: 'San Isidro', center: [123.2657, 13.6281] as [number, number], baseRisk: 0.22, riverProximity: 0.6 },
        { id: 'panicuason', name: 'Panicuason', center: [123.3286, 13.6611] as [number, number], baseRisk: 0.25, riverProximity: 0.8 },
        { id: 'balatas', name: 'Balatas', center: [123.19, 13.62] as [number, number], baseRisk: 0.15, riverProximity: 0.3 },
        { id: 'concepciongrande', name: 'Concepcion Grande', center: [123.19, 13.62] as [number, number], baseRisk: 0.18, riverProximity: 0.4 },
        { id: 'concepcionpequeña', name: 'Concepcion Pequeña', center: [123.19, 13.62] as [number, number], baseRisk: 0.16, riverProximity: 0.4 },
        { id: 'dayangdang', name: 'Dayangdang', center: [123.19, 13.62] as [number, number], baseRisk: 0.2, riverProximity: 0.5 },
        { id: 'igualdadinterior', name: 'Igualdad Interior', center: [123.19, 13.62] as [number, number], baseRisk: 0.14, riverProximity: 0.3 }
    ];
    
    // Origin points for flood spread (typically river-adjacent areas)
    const originPoints = ['pacol', 'sabang', 'carolina'];
    
    // Track infected barangays and their infection times
    const infectedBarangays = new Map<string, number>();
    
    // Calculate distances between barangays for spread simulation
    const calculateDistance = (center1: [number, number], center2: [number, number]): number => {
        const [lng1, lat1] = center1;
        const [lng2, lat2] = center2;
        return Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2));
    };
    
    for (let i = 0; i < totalFrames; i++) {
        const currentTime = new Date(baseTime.getTime() + (i * 30 * 60 * 1000)); // 30 minutes intervals
        
        // Create a rainfall pattern (simulating a storm passing through)
        const stormPeak = Math.floor(totalFrames / 3); // Peak at 1/3 of the timeline
        const stormIntensity = Math.exp(-Math.pow((i - stormPeak) / 8, 2)) * 0.8 + 0.2;
        const precipitation = Math.max(0, Math.sin((i / totalFrames) * Math.PI * 2) * 25 * stormIntensity + Math.random() * 10);
        
        // River level rises with rainfall (with some delay)
        const riverLevelDelay = 3; // 3 frames delay
        const delayedIntensity = i >= riverLevelDelay ? 
            Math.exp(-Math.pow(((i - riverLevelDelay) - stormPeak) / 10, 2)) * 0.7 + 0.3 : 0.3;
        const riverLevel = 1.2 + (delayedIntensity * 2.8) + (Math.random() * 0.3);
        
        // Initialize origin points at the beginning of storm
        if (i === Math.floor(stormPeak * 0.5)) {
            originPoints.forEach(origin => {
                infectedBarangays.set(origin, i);
            });
        }
        
        // Virus-like spread to neighboring barangays
        if (i > Math.floor(stormPeak * 0.5)) {
            const spreadRadius = 0.05; // Spread radius in degrees
            const spreadProbability = 0.3; // Base probability of spread per frame
            
            barangays.forEach(barangay => {
                if (!infectedBarangays.has(barangay.id)) {
                    // Check if this barangay is close to any infected barangay
                    for (const [infectedId, infectionTime] of infectedBarangays.entries()) {
                        const infectedBarangay = barangays.find(b => b.id === infectedId);
                        if (infectedBarangay) {
                            const distance = calculateDistance(barangay.center, infectedBarangay.center);
                            const timeSinceInfection = i - infectionTime;
                            
                            if (distance < spreadRadius && timeSinceInfection > 2) { // Wait 2 frames before spreading
                                const spreadChance = spreadProbability * (1 - distance / spreadRadius) * stormIntensity;
                                if (Math.random() < spreadChance) {
                                    infectedBarangays.set(barangay.id, i);
                                    break;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Generate barangay risk data
        const barangayRisks: BarangayFloodRisk[] = [];
        const riskData: FloodRiskPoint[] = []; // Keep for backward compatibility
        
        barangays.forEach(barangay => {
            const isInfected = infectedBarangays.has(barangay.id);
            const infectionTime = infectedBarangays.get(barangay.id);
            
            let riskLevel = barangay.baseRisk;
            
            if (isInfected && infectionTime !== undefined) {
                // Calculate risk based on infection time and storm intensity
                const timeSinceInfection = i - infectionTime;
                const infectionProgress = Math.min(timeSinceInfection / 10, 1); // Full infection after 10 frames
                
                // Base risk increases dramatically when infected
                riskLevel += 0.5 * infectionProgress;
                
                // Rainfall impact (more severe for infected areas)
                riskLevel += (precipitation / 30) * 0.6 * infectionProgress;
                
                // River level impact
                riskLevel += ((riverLevel - 1.2) / 4) * 0.7 * barangay.riverProximity * infectionProgress;
                
                // Storm intensity amplification
                riskLevel += stormIntensity * 0.3 * infectionProgress;
            } else {
                // Non-infected areas have minimal risk
                riskLevel += (precipitation / 80) * 0.2;
                riskLevel += ((riverLevel - 1.2) / 6) * 0.3 * barangay.riverProximity;
            }
            
            // Add some randomness for realism
            riskLevel += (Math.random() - 0.5) * 0.05;
            
            // Clamp between 0 and 1
            riskLevel = Math.max(0, Math.min(1, riskLevel));
            
            // Calculate water level based on risk
            const waterLevel = Math.max(0, riskLevel * 4 + (Math.random() * 0.3));
            
            // Determine risk category
            let riskCategory: 'low' | 'moderate' | 'high' | 'extreme';
            if (riskLevel < 0.25) riskCategory = 'low';
            else if (riskLevel < 0.5) riskCategory = 'moderate';
            else if (riskLevel < 0.75) riskCategory = 'high';
            else riskCategory = 'extreme';
            
            barangayRisks.push({
                barangayId: barangay.id,
                barangayName: barangay.name,
                risk: riskLevel,
                waterLevel,
                riskLevel: riskCategory,
                center: barangay.center,
                isOriginPoint: originPoints.includes(barangay.id),
                infectionTime: infectionTime
            });
            
            // Generate backward compatibility points
            const pointsPerZone = 6;
            const radius = 0.003;
            
            for (let j = 0; j < pointsPerZone; j++) {
                const angle = (j / pointsPerZone) * 2 * Math.PI;
                const distance = radius * (0.3 + Math.random() * 0.7);
                
                const lng = barangay.center[0] + Math.cos(angle) * distance;
                const lat = barangay.center[1] + Math.sin(angle) * distance;
                
                riskData.push({
                    lng,
                    lat,
                    risk: riskLevel,
                    waterLevel,
                    zone: barangay.name
                });
            }
        });
        
        // Calculate overall risk level from barangay data
        const avgRisk = barangayRisks.reduce((sum, barangay) => sum + barangay.risk, 0) / barangayRisks.length;
        let overallRisk: 'low' | 'moderate' | 'high' | 'extreme';
        
        if (avgRisk < 0.25) overallRisk = 'low';
        else if (avgRisk < 0.5) overallRisk = 'moderate';
        else if (avgRisk < 0.75) overallRisk = 'high';
        else overallRisk = 'extreme';
        
        timeFrames.push({
            timestamp: currentTime,
            riskData,
            barangayRisks,
            overallRisk,
            precipitationMm: Math.round(precipitation * 10) / 10,
            riverLevel: Math.round(riverLevel * 100) / 100
        });
    }
    
    return timeFrames;
};

// Color mapping for flood risk visualization
export const getFloodRiskColor = (risk: number): string => {
    if (risk < 0.1) return '#4CAF50'; // Green - Safe
    if (risk < 0.3) return '#8BC34A'; // Light green - Low risk
    if (risk < 0.5) return '#FFC107'; // Yellow - Moderate risk
    if (risk < 0.7) return '#FF9800'; // Orange - High risk
    if (risk < 0.8) return '#FF5722'; // Red-orange - Very high risk
    return '#F44336'; // Red - Extreme risk
};

// Get risk level text
export const getRiskLevelText = (risk: number): string => {
    if (risk < 0.1) return 'Safe';
    if (risk < 0.3) return 'Low Risk';
    if (risk < 0.5) return 'Moderate Risk';
    if (risk < 0.7) return 'High Risk';
    if (risk < 0.8) return 'Very High Risk';
    return 'Extreme Risk';
};

// Generate initial simulation data
export const floodSimulationData = generateFloodSimulationData();

// Get time range for the simulation
export const getSimulationTimeRange = () => {
    if (floodSimulationData.length === 0) return { min: new Date(), max: new Date() };
    
    const timestamps = floodSimulationData.map(frame => frame.timestamp);
    return {
        min: new Date(Math.min(...timestamps.map(t => t.getTime()))),
        max: new Date(Math.max(...timestamps.map(t => t.getTime())))
    };
};