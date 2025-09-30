import React, { useMemo, useCallback } from 'react';
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


const BarangaySelector: React.FC<BarangaySelectorProps> = React.memo(({
    selectedBarangay,
    onBarangayChange,
    size = 'medium',
    variant = 'outlined',
    whiteTheme = false
}) => {
    const handleChange = useCallback((event: { target: { value: string } }) => {
        onBarangayChange(event.target.value);
    }, [onBarangayChange]);

    const whiteThemeStyles = useMemo(() => whiteTheme ? {
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
    } : {}, [whiteTheme]);

    const chipStyles = useMemo(() => whiteTheme ? {
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: 'white',
        borderColor: 'rgba(255,255,255,0.3)',
        '& .MuiChip-icon': {
            color: 'white'
        }
    } : {}, [whiteTheme]);

    const barangayItems = useMemo(() => 
        BARANGAYS.map((barangay) => (
            <MenuItem key={barangay} value={barangay}>
                {barangay}
            </MenuItem>
        )), []
    );

    return (
        <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            role="region"
            aria-label="Barangay selection"
        >
            {selectedBarangay && (
                <Chip
                    icon={<LocationOnIcon />}
                    label={selectedBarangay}
                    color={whiteTheme ? 'default' : 'primary'}
                    variant="outlined"
                    size={size}
                    sx={chipStyles}
                    aria-label={`Currently selected barangay: ${selectedBarangay}`}
                />
            )}
            <FormControl variant={variant} size={size} sx={{ minWidth: 200, ...whiteThemeStyles }}>
                <InputLabel 
                    id="barangay-select-label"
                    shrink={!!selectedBarangay}
                >
                    Select Barangay
                </InputLabel>
                <Select
                    labelId="barangay-select-label"
                    value={selectedBarangay}
                    onChange={handleChange}
                    label="Select Barangay"
                    aria-describedby="barangay-helper-text"
                    MenuProps={{
                        PaperProps: {
                            'aria-label': 'Barangay options'
                        }
                    }}
                >
                    {barangayItems}
                </Select>
            </FormControl>
        </Box>
    );
});

BarangaySelector.displayName = 'BarangaySelector';

export default BarangaySelector;
