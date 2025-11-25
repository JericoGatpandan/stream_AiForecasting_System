import { Box, Paper, Typography, Stack } from '@mui/material';

interface RiskLegendProps {
  position?: 'bottom-left' | 'bottom-right';
}

const riskItems = [
  { label: 'Low risk', color: '#22c55e' },
  { label: 'Moderate risk', color: '#eab308' },
  { label: 'High risk', color: '#f97316' },
  { label: 'Extreme risk', color: '#ef4444' },
];

const simulationItems = [
  { label: 'Simulated inundation area', color: '#0ea5e9' },
  { label: 'Highlighted barangay', color: '#22c55e' },
];

const RiskLegend: React.FC<RiskLegendProps> = ({ position = 'bottom-left' }) => {
  const alignRight = position === 'bottom-right';

  return (
    <Paper
      elevation={3}
      sx={(theme) => ({
        position: 'absolute',
        bottom: theme.spacing(2.5),
        [alignRight ? 'right' : 'left']: theme.spacing(2),
        zIndex: 3,
        p: 1.5,
        borderRadius: 2,
        maxWidth: 260,
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(15,23,42,0.96)'
          : 'rgba(255,255,255,0.96)',
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
      })}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        Map Legend
      </Typography>

      <Box sx={{ mt: 1 }}>
        <Typography variant="overline" color="text.secondary">
          Flood risk level
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {riskItems.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: 0.5,
                  bgcolor: item.color,
                }}
              />
              <Typography variant="caption" color="text.primary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Typography variant="overline" color="text.secondary">
          Simulation overlays
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {simulationItems.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  bgcolor: item.color,
                }}
              />
              <Typography variant="caption" color="text.primary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default RiskLegend;
