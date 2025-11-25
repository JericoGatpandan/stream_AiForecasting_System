import { useEffect, useRef } from 'react';
import { getFloodRiskColor } from '../data/floodSimulationData';
import type { FloodTimeFrame } from '../data/floodSimulationData';

// Mapbox Map type definition
interface MapboxMap {
    getLayer: (layerId: string) => any;
    setPaintProperty: (layerId: string, property: string, value: any) => void;
}

// Mapbox expression type
type MapboxExpression = (string | number | boolean | any[])[];

export interface FloodSimulationProps {
    map: MapboxMap | null;
    isActive: boolean;
    currentTimeFrame: FloodTimeFrame | null;
}

// Simple sample data for demonstration
const getSampleFloodData = (timeIndex: number) => {
    const barangays = [
        'abella', 'bagumbayannorte', 'bagumbayansur', 'balatas', 'calauag',
        'carolina', 'cararayan', 'concepciongrande', 'concepcionpequeño',
        'dayangdang', 'delrosario', 'dinaga', 'igualdadinterior', 'lerma',
        'liboton', 'mabolo', 'pacol', 'panicuason', 'peñafrancia', 'sabang',
        'sanfelipe', 'sanfrancisco', 'sanisidro', 'santacruz', 'tabuco', 'tinago', 'triangulo'
    ];
    
    // Create a wave of flood risk that spreads over time
    const floodData: { [key: string]: number } = {};
    
    barangays.forEach((barangay, index) => {
        // Create a wave effect where flood risk spreads from certain origins
        const waveCenter = Math.sin((timeIndex + index) * 0.3) * 0.5 + 0.5;
        const risk = Math.min(0.9, Math.max(0.1, waveCenter));
        floodData[barangay] = risk;
    });
    
    // Make some specific barangays have higher risk (flood-prone areas)
    const highRiskAreas = ['pacol', 'sabang', 'carolina', 'triangulo'];
    highRiskAreas.forEach(barangay => {
        if (floodData[barangay] !== undefined) {
            floodData[barangay] = Math.min(0.95, floodData[barangay] + 0.3 + Math.sin(timeIndex * 0.5) * 0.2);
        }
    });
    
    return floodData;
};

const FloodSimulation: React.FC<FloodSimulationProps> = ({
    map,
    isActive,
    currentTimeFrame
}) => {
    const timeIndexRef = useRef(0);

    // Update existing barangay layers with flood risk colors
    useEffect(() => {
        if (!map || !isActive) return;
        
        // Increment time index when the time frame changes
        if (currentTimeFrame) {
            timeIndexRef.current += 1;
        }
        
        const sampleData = getSampleFloodData(timeIndexRef.current);
        console.log('FloodSimulation: Applying flood colors', { timeIndex: timeIndexRef.current, isActive });
        
        try {
            // Check if existing barangay layers exist
            const barangayFillLayer = 'barangay-fills';
            const barangayBorderLayer = 'barangay-boundaries';
            
            if (map.getLayer(barangayFillLayer)) {
                // Create flood risk color expression
                const colorExpression: MapboxExpression = ['case'];
                
                Object.entries(sampleData).forEach(([barangayId, risk]) => {
                    const color = getFloodRiskColor(risk);
                    colorExpression.push(['==', ['get', 'barangay_id'], barangayId]);
                    colorExpression.push(color);
                });
                
                // Default color
                colorExpression.push('#4264fb');
                
                // Update the fill color
                map.setPaintProperty(barangayFillLayer, 'fill-color', colorExpression);
                map.setPaintProperty(barangayFillLayer, 'fill-opacity', isActive ? 0.6 : 0.1);
                
                console.log('Applied flood colors to barangay fills');
            }
            
            if (map.getLayer(barangayBorderLayer)) {
                // Also update border colors for high-risk areas
                const borderColorExpression: MapboxExpression = ['case'];
                const borderWidthExpression: MapboxExpression = ['case'];
                
                Object.entries(sampleData).forEach(([barangayId, risk]) => {
                    if (risk > 0.5) { // High risk areas get different borders
                        const color = getFloodRiskColor(risk);
                        borderColorExpression.push(['==', ['get', 'barangay_id'], barangayId]);
                        borderColorExpression.push(color);
                        
                        borderWidthExpression.push(['==', ['get', 'barangay_id'], barangayId]);
                        borderWidthExpression.push(3);
                    }
                });
                
                // Default values
                borderColorExpression.push('#4264fb');
                borderWidthExpression.push(2);
                
                map.setPaintProperty(barangayBorderLayer, 'line-color', borderColorExpression);
                map.setPaintProperty(barangayBorderLayer, 'line-width', borderWidthExpression);
                
                console.log('Applied flood colors to barangay borders');
            }
            
        } catch (error) {
            console.warn('FloodSimulation: Error updating flood colors:', error);
        }
        
        return () => {
            // Reset colors when simulation is disabled
            if (!isActive && map) {
                try {
                    if (map.getLayer('barangay-fills')) {
                        map.setPaintProperty('barangay-fills', 'fill-color', '#4264fb');
                        map.setPaintProperty('barangay-fills', 'fill-opacity', 0.1);
                    }
                    if (map.getLayer('barangay-boundaries')) {
                        map.setPaintProperty('barangay-boundaries', 'line-color', '#4264fb');
                        map.setPaintProperty('barangay-boundaries', 'line-width', 2);
                    }
                } catch (error) {
                    console.warn('FloodSimulation: Error resetting colors:', error);
                }
            }
        };
    }, [map, isActive, currentTimeFrame]);


    return null; // This component doesn't render any React elements
};

export default FloodSimulation;