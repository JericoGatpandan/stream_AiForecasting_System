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
    minTime?: Date;
    maxTime?: Date;
    timeJumpMinutes?: number; // Current selected time jump in minutes
    onTimeJumpChange?: (minutes: number) => void;
    disabled?: boolean;
}

const TimeControl: React.FC<TimeControlProps> = ({
    isPlaying,
    onPlayPause,
    currentTime,
    onTimeChange,
    minTime,
    maxTime,
    timeJumpMinutes = 30,
    onTimeJumpChange,
    disabled = false
}) => {
    const [sliderValue, setSliderValue] = useState(0);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    const panelRef = React.useRef<HTMLDivElement | null>(null);

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!panelRef.current) return;
        setDragging(true);
        const rect = panelRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragging || !panelRef.current) return;
        e.preventDefault();

        const parent = panelRef.current.parentElement;
        if (!parent) return;
        const parentRect = parent.getBoundingClientRect();

        // Calculate new position within parent bounds
        let newLeft = e.clientX - parentRect.left - dragOffset.x;
        let newTop = e.clientY - parentRect.top - dragOffset.y;

        const maxLeft = parentRect.width - panelRef.current.offsetWidth;
        const maxTop = parentRect.height - panelRef.current.offsetHeight;

        newLeft = Math.max(0, Math.min(maxLeft, newLeft));
        newTop = Math.max(0, Math.min(maxTop, newTop));

        panelRef.current.style.left = `${newLeft}px`;
        panelRef.current.style.top = `${newTop}px`;
        panelRef.current.style.transform = 'none';
        panelRef.current.style.bottom = 'auto';
      };

    const handleDragEnd = () => {
        setDragging(false);
    };

    // Derive safe time bounds if not provided
    const safeMinTime = React.useMemo(() => {
        return minTime ?? new Date(currentTime.getTime() - 6 * 60 * 60 * 1000); // 6h before
    }, [minTime, currentTime]);

    const safeMaxTime = React.useMemo(() => {
        return maxTime ?? new Date(currentTime.getTime() + 6 * 60 * 60 * 1000); // 6h after
    }, [maxTime, currentTime]);

    // Convert date to slider value (0-100)
    const dateToSliderValue = useCallback((date: Date): number => {
        const totalDuration = safeMaxTime.getTime() - safeMinTime.getTime();
        if (totalDuration <= 0) return 0;
        const currentDuration = date.getTime() - safeMinTime.getTime();
        return Math.max(0, Math.min(100, (currentDuration / totalDuration) * 100));
    }, [safeMinTime, safeMaxTime]);

    // Convert slider value to date
    const sliderValueToDate = useCallback((value: number): Date => {
        const totalDuration = safeMaxTime.getTime() - safeMinTime.getTime();
        if (totalDuration <= 0) return new Date(safeMinTime);
        const targetTime = safeMinTime.getTime() + (totalDuration * (value / 100));
        return new Date(targetTime);
    }, [safeMinTime, safeMaxTime]);

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
        if (newTime <= safeMaxTime) {
            onTimeChange(newTime);
        }
    };

    const stepBackward = () => {
        const newTime = new Date(currentTime.getTime() - (30 * 60 * 1000)); // 30 minutes
        if (newTime >= safeMinTime) {
            onTimeChange(newTime);
        }
    };

    const fastForward = () => {
        const newTime = new Date(currentTime.getTime() + (3 * 60 * 60 * 1000)); // 3 hours
        if (newTime <= safeMaxTime) {
            onTimeChange(newTime);
        } else {
            onTimeChange(safeMaxTime);
        }
    };

    const fastRewind = () => {
        const newTime = new Date(currentTime.getTime() - (3 * 60 * 60 * 1000)); // 3 hours
        if (newTime >= safeMinTime) {
            onTimeChange(newTime);
        } else {
            onTimeChange(safeMinTime);
        }
    };

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
        const marks = [] as { value: number; label: string }[];
        const totalMs = safeMaxTime.getTime() - safeMinTime.getTime();
        if (totalMs <= 0) return marks;

        const totalHours = totalMs / (60 * 60 * 1000);
        const markInterval = totalHours > 48 ? 12 : totalHours > 24 ? 6 : 3; // hours between marks

        for (let i = 0; i <= totalHours; i += markInterval) {
            const markTime = new Date(safeMinTime.getTime() + (i * 60 * 60 * 1000));
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
            ref={panelRef}
            elevation={3}
            sx={(theme) => ({
                position: 'absolute',
                bottom: theme.spacing(2),
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                p: 1.5,
                backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(15,23,42,0.96)'
                    : 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                minWidth: 520,
                maxWidth: 'min(780px, 100% - 32px)',
                opacity: disabled ? 0.6 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
                cursor: dragging ? 'grabbing' : 'default',
            })}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={dragging ? handleDragEnd : undefined}
        >
            {/* Drag handle */}
            <Box
                onMouseDown={handleDragStart}
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'grab',
                    mb: 0.5,
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 4,
                        borderRadius: 999,
                        bgcolor: 'divider',
                    }}
                />
            </Box>

            {/* Current Time Display */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                <Chip
                    label={formatTime(currentTime)}
                    color="primary"
                    variant="filled"
                    sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                />
            </Box>

            {/* Time Slider */}
            <Box sx={{ px: 1, mb: 1.5 }}>
                <Slider
                    value={sliderValue}
                    onChange={handleSliderChange as any}
                    min={0}
                    max={100}
                    step={0.1}
                    marks={timeMarks}
                    valueLabelDisplay="off"
                    sx={{
                        '& .MuiSlider-mark': {
                            backgroundColor: 'primary.main',
                            height: 6,
                            width: 2
                        },
                        '& .MuiSlider-markLabel': {
                            fontSize: '0.65rem',
                            color: 'text.secondary'
                        },
                        '& .MuiSlider-thumb': {
                            width: 18,
                            height: 18,
                            backgroundColor: 'primary.main'
                        },
                        '& .MuiSlider-track': {
                            height: 5,
                            backgroundColor: 'primary.main'
                        },
                        '& .MuiSlider-rail': {
                            height: 5,
                            backgroundColor: 'grey.300'
                        }
                    }}
                />
            </Box>

            {/* Control Buttons + Jump */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {/* Transport controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Rewind 3 hours">
                        <span>
                            <IconButton onClick={fastRewind} disabled={currentTime <= safeMinTime} size="small">
                                <FastRewind fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Back 30 minutes">
                        <span>
                            <IconButton onClick={stepBackward} disabled={currentTime <= safeMinTime} size="small">
                                <SkipPrevious fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title={isPlaying ? "Pause" : "Play"}>
                        <IconButton
                            onClick={() => onPlayPause(!isPlaying)}
                            color="primary"
                            size="medium"
                            sx={{
                                mx: 0.5,
                                backgroundColor: 'primary.light',
                                '&:hover': { backgroundColor: 'primary.main' },
                            }}
                        >
                            {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Forward 30 minutes">
                        <span>
                            <IconButton onClick={stepForward} disabled={currentTime >= safeMaxTime} size="small">
                                <SkipNext fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Fast forward 3 hours">
                        <span>
                            <IconButton onClick={fastForward} disabled={currentTime >= safeMaxTime} size="small">
                                <FastForward fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {/* Time Jump Control */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Speed fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                        Jump:
                    </Typography>

                    <ToggleButtonGroup
                        value={timeJumpMinutes}
                        exclusive
                        onChange={(_, minutes) => minutes !== null && onTimeJumpChange?.(minutes)}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                px: 1,
                                py: 0.3,
                                fontSize: '0.65rem',
                                minWidth: 48,
                                textTransform: 'none'
                            }
                        }}
                    >
                        <ToggleButton value={0}>Now</ToggleButton>
                        <ToggleButton value={30}>+30m</ToggleButton>
                        <ToggleButton value={60}>+1h</ToggleButton>
                        <ToggleButton value={120}>+2h</ToggleButton>
                        <ToggleButton value={360}>+6h</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
        </Paper>
    );
};

export default TimeControl;
