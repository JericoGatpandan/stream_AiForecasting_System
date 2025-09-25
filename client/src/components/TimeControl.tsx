import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    IconButton,
    Slider,
    Typography,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    Chip
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    SkipNext,
    SkipPrevious,
    FastForward,
    FastRewind,
    Speed
} from '@mui/icons-material';

export interface TimeControlProps {
    isPlaying: boolean;
    onPlayPause: (playing: boolean) => void;
    currentTime: Date;
    onTimeChange: (time: Date) => void;
    minTime: Date;
    maxTime: Date;
    playbackSpeed: number;
    onSpeedChange: (speed: number) => void;
    disabled?: boolean;
}

const TimeControl: React.FC<TimeControlProps> = ({
    isPlaying,
    onPlayPause,
    currentTime,
    onTimeChange,
    minTime,
    maxTime,
    playbackSpeed,
    onSpeedChange,
    disabled = false
}) => {
    const [sliderValue, setSliderValue] = useState(0);

    // Convert date to slider value (0-100)
    const dateToSliderValue = useCallback((date: Date): number => {
        const totalDuration = maxTime.getTime() - minTime.getTime();
        const currentDuration = date.getTime() - minTime.getTime();
        return Math.max(0, Math.min(100, (currentDuration / totalDuration) * 100));
    }, [minTime, maxTime]);

    // Convert slider value to date
    const sliderValueToDate = useCallback((value: number): Date => {
        const totalDuration = maxTime.getTime() - minTime.getTime();
        const targetTime = minTime.getTime() + (totalDuration * (value / 100));
        return new Date(targetTime);
    }, [minTime, maxTime]);

    // Update slider when currentTime changes
    useEffect(() => {
        setSliderValue(dateToSliderValue(currentTime));
    }, [currentTime, dateToSliderValue]);

    // Handle slider change
    const handleSliderChange = (_: Event, value: number | number[]) => {
        const newValue = Array.isArray(value) ? value[0] : value;
        setSliderValue(newValue);
        onTimeChange(sliderValueToDate(newValue));
    };

    // Step controls
    const stepForward = () => {
        const newTime = new Date(currentTime.getTime() + (30 * 60 * 1000)); // 30 minutes
        if (newTime <= maxTime) {
            onTimeChange(newTime);
        }
    };

    const stepBackward = () => {
        const newTime = new Date(currentTime.getTime() - (30 * 60 * 1000)); // 30 minutes
        if (newTime >= minTime) {
            onTimeChange(newTime);
        }
    };

    const fastForward = () => {
        const newTime = new Date(currentTime.getTime() + (3 * 60 * 60 * 1000)); // 3 hours
        if (newTime <= maxTime) {
            onTimeChange(newTime);
        } else {
            onTimeChange(maxTime);
        }
    };

    const fastRewind = () => {
        const newTime = new Date(currentTime.getTime() - (3 * 60 * 60 * 1000)); // 3 hours
        if (newTime >= minTime) {
            onTimeChange(newTime);
        } else {
            onTimeChange(minTime);
        }
    };

    // Speed options
    const speedOptions = [0.5, 1, 2, 4, 8];

    // Format time display
    const formatTime = (date: Date) => {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Calculate time marks for slider
    const generateTimeMarks = () => {
        const marks = [];
        const totalHours = (maxTime.getTime() - minTime.getTime()) / (60 * 60 * 1000);
        const markInterval = totalHours > 48 ? 12 : totalHours > 24 ? 6 : 3; // hours between marks
        
        for (let i = 0; i <= totalHours; i += markInterval) {
            const markTime = new Date(minTime.getTime() + (i * 60 * 60 * 1000));
            const value = dateToSliderValue(markTime);
            marks.push({
                value,
                label: markTime.toLocaleString('en-US', { 
                    month: 'numeric', 
                    day: 'numeric',
                    hour: 'numeric'
                })
            });
        }
        return marks;
    };

    const timeMarks = generateTimeMarks();

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: 3,
                minWidth: 600,
                maxWidth: 800,
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? 'none' : 'auto'
            }}
        >
            {/* Current Time Display */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Chip
                    label={formatTime(currentTime)}
                    color="primary"
                    variant="filled"
                    sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                />
            </Box>

            {/* Time Slider */}
            <Box sx={{ px: 2, mb: 3 }}>
                <Slider
                    value={sliderValue}
                    onChange={handleSliderChange}
                    min={0}
                    max={100}
                    step={0.1}
                    marks={timeMarks}
                    valueLabelDisplay="off"
                    sx={{
                        '& .MuiSlider-mark': {
                            backgroundColor: 'primary.main',
                            height: 8,
                            width: 2
                        },
                        '& .MuiSlider-markLabel': {
                            fontSize: '0.7rem',
                            color: 'text.secondary'
                        },
                        '& .MuiSlider-thumb': {
                            width: 20,
                            height: 20,
                            backgroundColor: 'primary.main'
                        },
                        '& .MuiSlider-track': {
                            height: 6,
                            backgroundColor: 'primary.main'
                        },
                        '& .MuiSlider-rail': {
                            height: 6,
                            backgroundColor: 'grey.300'
                        }
                    }}
                />
            </Box>

            {/* Control Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                <Tooltip title="Rewind 3 hours">
                    <span>
                        <IconButton onClick={fastRewind} disabled={currentTime <= minTime}>
                            <FastRewind />
                        </IconButton>
                    </span>
                </Tooltip>
                
                <Tooltip title="Back 30 minutes">
                    <span>
                        <IconButton onClick={stepBackward} disabled={currentTime <= minTime}>
                            <SkipPrevious />
                        </IconButton>
                    </span>
                </Tooltip>
                
                <Tooltip title={isPlaying ? "Pause" : "Play"}>
                    <IconButton 
                        onClick={() => onPlayPause(!isPlaying)}
                        color="primary"
                        sx={{ 
                            backgroundColor: 'primary.light',
                            '&:hover': { backgroundColor: 'primary.main' },
                            mx: 1
                        }}
                    >
                        {isPlaying ? <Pause /> : <PlayArrow />}
                    </IconButton>
                </Tooltip>
                
                <Tooltip title="Forward 30 minutes">
                    <span>
                        <IconButton onClick={stepForward} disabled={currentTime >= maxTime}>
                            <SkipNext />
                        </IconButton>
                    </span>
                </Tooltip>
                
                <Tooltip title="Fast forward 3 hours">
                    <span>
                        <IconButton onClick={fastForward} disabled={currentTime >= maxTime}>
                            <FastForward />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {/* Speed Control */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                        Speed:
                    </Typography>
                </Box>
                
                <ToggleButtonGroup
                    value={playbackSpeed}
                    exclusive
                    onChange={(_, speed) => speed && onSpeedChange(speed)}
                    size="small"
                    sx={{ 
                        '& .MuiToggleButton-root': {
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            minWidth: 40
                        }
                    }}
                >
                    {speedOptions.map(speed => (
                        <ToggleButton key={speed} value={speed}>
                            {speed}x
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
        </Paper>
    );
};

export default TimeControl;