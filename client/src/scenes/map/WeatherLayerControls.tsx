import { useState } from 'react';
import {
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    Paper,
    styled
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import CloudIcon from '@mui/icons-material/Cloud';
import CompressIcon from '@mui/icons-material/Compress';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpacityIcon from '@mui/icons-material/Opacity'; // Using Opacity instead of WaterPercent

import type { WeatherLayerType, WeatherLayer } from './weatherData';
import { weatherLayers } from './weatherData';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(5px)',
    borderRadius: 24,
    '& .MuiToggleButtonGroup-grouped': {
        margin: theme.spacing(0.5),
        borderRadius: 20,
        border: 0,
        padding: theme.spacing(0.5, 1),
        '&.Mui-selected': {
            color: '#fff',
        },
    },
}));

const StyledToggleButton = styled(ToggleButton)<{ layercolor?: string }>(({ theme, layercolor }) => ({
    '&.Mui-selected': {
        backgroundColor: layercolor || theme.palette.primary.main,
        '&:hover': {
            backgroundColor: layercolor ? `${layercolor}dd` : theme.palette.primary.dark,
        },
    },
    width: 42,
    height: 42,
    minWidth: 'unset',
}));

// Map icon component based on string name
const getIconComponent = (iconName: string) => {
    switch (iconName) {
        case 'Thermostat': return <ThermostatIcon />;
        case 'WaterDrop': return <WaterDropIcon />;
        case 'Air': return <AirIcon />;
        case 'Cloud': return <CloudIcon />;
        case 'Compress': return <CompressIcon />;
        case 'WbSunny': return <WbSunnyIcon />;
        case 'Visibility': return <VisibilityIcon />;
        case 'WaterPercent': return <OpacityIcon />;
        default: return <ThermostatIcon />;
    }
};

interface WeatherLayerControlsProps {
    onLayerChange: (layer: WeatherLayerType | null) => void;
    position?: 'top' | 'bottom';
}

const WeatherLayerControls = ({ onLayerChange, position = 'top' }: WeatherLayerControlsProps) => {
    const [selectedLayer, setSelectedLayer] = useState<WeatherLayerType | null>(null);

    const handleLayerChange = (
        _: React.MouseEvent<HTMLElement>,
        newLayer: WeatherLayerType | null
    ) => {
        setSelectedLayer(newLayer);
        onLayerChange(newLayer);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                [position === 'top' ? 'top' : 'bottom']: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                padding: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                borderRadius: 6,
            }}
        >
            <StyledToggleButtonGroup
                value={selectedLayer}
                exclusive
                onChange={handleLayerChange}
                aria-label="weather layer"
                size="small"
            >
                {weatherLayers.map((layer: WeatherLayer) => (
                    <Tooltip key={layer.id} title={`${layer.name}${layer.unit ? ` (${layer.unit})` : ''}`}>
                        <StyledToggleButton
                            value={layer.id}
                            aria-label={layer.name}
                            layercolor={layer.color}
                        >
                            {getIconComponent(layer.icon)}
                        </StyledToggleButton>
                    </Tooltip>
                ))}
            </StyledToggleButtonGroup>
        </Paper>
    );
};

export default WeatherLayerControls;