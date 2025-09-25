import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface BarangaySelectorProps {
    selectedBarangay: string;
    onBarangayChange: (barangay: string) => void;
    size?: 'small' | 'medium';
    variant?: 'outlined' | 'filled' | 'standard';
    whiteTheme?: boolean;
}

const BARANGAYS = [
    'Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas', 'Calauag',
    'Cararayan', 'Carolina', 'Concepcion Grande', 'Concepcion Pequeño',
    'Dayangdang', 'Del Rosario', 'Dinaga', 'Igualdad Interior', 'Lerma',
    'Liboton', 'Mabolo', 'Pacol', 'Panicuason', 'Peñafrancia', 'Sabang',
    'San Felipe', 'San Francisco (Pob.)', 'San Isidro', 'Santa Cruz',
    'Tabuco', 'Tinago', 'Triangulo'
];

const BarangaySelector: React.FC<BarangaySelectorProps> = ({
    selectedBarangay,
    onBarangayChange,
    size = 'medium',
    variant = 'outlined',
    whiteTheme = false
}) => {
    const handleChange = (event: { target: { value: string } }) => {
        onBarangayChange(event.target.value);
    };

    const whiteThemeStyles = whiteTheme ? {
        '& .MuiInputLabel-root': { 
            color: 'white',
            '&.Mui-focused': { color: 'white' }
        },
        '& .MuiOutlinedInput-root': { 
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': { 
                borderColor: 'rgba(255,255,255,0.3)' 
            },
            '&:hover .MuiOutlinedInput-notchedOutline': { 
                borderColor: 'rgba(255,255,255,0.5)' 
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white'
            }
        },
        '& .MuiSvgIcon-root': { 
            color: 'white' 
        }
    } : {};

    const chipStyles = whiteTheme ? {
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: 'white',
        borderColor: 'rgba(255,255,255,0.3)',
        '& .MuiChip-icon': {
            color: 'white'
        }
    } : {};

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedBarangay && (
                <Chip
                    icon={<LocationOnIcon />}
                    label={selectedBarangay}
                    color={whiteTheme ? 'default' : 'primary'}
                    variant="outlined"
                    size={size}
                    sx={chipStyles}
                />
            )}
            <FormControl variant={variant} size={size} sx={{ minWidth: 200, ...whiteThemeStyles }}>
                <InputLabel id="barangay-select-label">Select Barangay</InputLabel>
                <Select
                    labelId="barangay-select-label"
                    value={selectedBarangay}
                    onChange={handleChange}
                    label="Select Barangay"
                >
                    {BARANGAYS.map((barangay) => (
                        <MenuItem key={barangay} value={barangay}>
                            {barangay}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default BarangaySelector;