import { Box, Paper, Typography, Chip, Skeleton, Stack } from '@mui/material';
import type { FloodRiskAssessment } from '@/state/types';
import { useGetFloodCharacteristicsByBarangayQuery, useGetFloodRiskByBarangayQuery } from '@/state/api';

interface FloodRiskPanelProps {
  selectedBarangayName: string | null;
}

const riskColor: Record<FloodRiskAssessment['currentRiskLevel'], 'default' | 'success' | 'warning' | 'error'> = {
  low: 'success',
  moderate: 'warning',
  high: 'error',
  extreme: 'error',
};

function formatRiskLabel(level: FloodRiskAssessment['currentRiskLevel']) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export default function FloodRiskPanel({ selectedBarangayName }: FloodRiskPanelProps) {
  const hasSelection = Boolean(selectedBarangayName);

  const {
    data: characteristics,
    isLoading: isCharLoading,
  } = useGetFloodCharacteristicsByBarangayQuery(selectedBarangayName ?? '', {
    skip: !hasSelection,
  });

  const {
    data: risk,
    isLoading: isRiskLoading,
  } = useGetFloodRiskByBarangayQuery(selectedBarangayName ?? '', {
    skip: !hasSelection,
  });

  return (
    <Paper
      elevation={4}
      sx={(theme) => ({
        position: 'absolute',
        top: theme.spacing(2),
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        maxWidth: 520,
        width: 'calc(100% - 32px)',
        padding: theme.spacing(1.5),
        borderRadius: 3,
        backdropFilter: 'blur(8px)',
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(15, 23, 42, 0.92)'
          : 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.75),
        pointerEvents: 'auto',
      })}
    >
      {!hasSelection ? (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Select a barangay on the map to view flood risk details.
        </Typography>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Flood Risk Overview
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedBarangayName}
              </Typography>
            </Box>

            {!isRiskLoading && risk && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Current risk level
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    size="small"
                    color={riskColor[risk.currentRiskLevel]}
                    label={formatRiskLabel(risk.currentRiskLevel)}
                  />
                </Box>
              </Box>
            )}
          </Box>

          {(isCharLoading || isRiskLoading) && (
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <Skeleton variant="rounded" height={24} />
              <Skeleton variant="rounded" height={40} />
            </Stack>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            {!isCharLoading && characteristics && (
              <>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Max depth: ${characteristics.maximumDepth.toFixed(2)} m`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Peak velocity: ${characteristics.peakVelocity.toFixed(2)} m/s`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Arrival: ~${characteristics.arrivalTime.toFixed(1)} h`}
                />
              </>
            )}

            {!isRiskLoading && risk && (
              <Typography variant="caption" color="text.secondary">
                Rainfall: {risk.riskFactors.rainfall.toFixed(1)} mm · Water level:{' '}
                {risk.riskFactors.waterLevel.toFixed(2)} m
              </Typography>
            )}
          </Box>

          {!isCharLoading && !isRiskLoading && !characteristics && !risk && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              No flood model data available for this barangay yet.
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
