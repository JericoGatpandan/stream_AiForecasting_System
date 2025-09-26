import React from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Skeleton, 
    Stack,
    Grid
} from '@mui/material';

interface LoadingSkeletonProps {
    variant?: 'card' | 'list' | 'chart' | 'map' | 'table' | 'custom';
    count?: number;
    height?: number | string;
    animation?: 'pulse' | 'wave' | false;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    variant = 'card',
    count = 1,
    height = 200,
    animation = 'wave'
}) => {
    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return (
                    <Card elevation={2} sx={{ height }}>
                        <CardContent>
                            <Stack spacing={1}>
                                <Skeleton 
                                    variant="text" 
                                    width="40%" 
                                    height={32}
                                    animation={animation}
                                />
                                <Skeleton 
                                    variant="text" 
                                    width="60%" 
                                    height={20}
                                    animation={animation}
                                />
                                <Box sx={{ mt: 2 }}>
                                    <Skeleton 
                                        variant="rectangular" 
                                        height={120}
                                        animation={animation}
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Box>
                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                    <Skeleton 
                                        variant="rounded" 
                                        width={80} 
                                        height={32}
                                        animation={animation}
                                    />
                                    <Skeleton 
                                        variant="rounded" 
                                        width={100} 
                                        height={32}
                                        animation={animation}
                                    />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                );

            case 'list':
                return (
                    <Box sx={{ width: '100%' }}>
                        {Array.from({ length: count }).map((_, index) => (
                            <Box 
                                key={index} 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2, 
                                    p: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Skeleton 
                                    variant="circular" 
                                    width={40} 
                                    height={40}
                                    animation={animation}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Skeleton 
                                        variant="text" 
                                        width="70%" 
                                        height={20}
                                        animation={animation}
                                    />
                                    <Skeleton 
                                        variant="text" 
                                        width="50%" 
                                        height={16}
                                        animation={animation}
                                    />
                                </Box>
                                <Skeleton 
                                    variant="rounded" 
                                    width={80} 
                                    height={32}
                                    animation={animation}
                                />
                            </Box>
                        ))}
                    </Box>
                );

            case 'chart':
                return (
                    <Card elevation={2}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Skeleton 
                                        variant="text" 
                                        width="30%" 
                                        height={28}
                                        animation={animation}
                                    />
                                    <Skeleton 
                                        variant="rounded" 
                                        width={120} 
                                        height={36}
                                        animation={animation}
                                    />
                                </Box>
                                <Skeleton 
                                    variant="rectangular" 
                                    height={300}
                                    animation={animation}
                                    sx={{ borderRadius: 1 }}
                                />
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton 
                                            key={i}
                                            variant="text" 
                                            width={60} 
                                            height={20}
                                            animation={animation}
                                        />
                                    ))}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                );

            case 'table':
                return (
                    <Card elevation={2}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ overflow: 'hidden' }}>
                                {/* Table Header */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    p: 2, 
                                    borderBottom: '1px solid', 
                                    borderColor: 'divider',
                                    bgcolor: 'grey.50'
                                }}>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Box key={i} sx={{ flex: 1, mr: 2 }}>
                                            <Skeleton 
                                                variant="text" 
                                                width="80%" 
                                                height={20}
                                                animation={animation}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                                
                                {/* Table Rows */}
                                {Array.from({ length: count }).map((_, index) => (
                                    <Box 
                                        key={index}
                                        sx={{ 
                                            display: 'flex', 
                                            p: 2, 
                                            borderBottom: index < count - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <Box key={i} sx={{ flex: 1, mr: 2 }}>
                                                <Skeleton 
                                                    variant="text" 
                                                    width={i === 0 ? '90%' : '70%'} 
                                                    height={18}
                                                    animation={animation}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                );

            case 'map':
                return (
                    <Box 
                        sx={{ 
                            height: typeof height === 'number' ? `${height}px` : height,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Skeleton 
                                variant="rectangular" 
                                width="100%" 
                                height="100%"
                                animation={animation}
                                sx={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    borderRadius: 1
                                }}
                            />
                            {/* Map-like patterns */}
                            <Box sx={{ 
                                position: 'absolute', 
                                top: '20%', 
                                left: '20%',
                                zIndex: 1
                            }}>
                                <Skeleton 
                                    variant="rounded" 
                                    width={60} 
                                    height={40}
                                    animation={animation}
                                />
                            </Box>
                            <Box sx={{ 
                                position: 'absolute', 
                                top: '50%', 
                                right: '30%',
                                zIndex: 1
                            }}>
                                <Skeleton 
                                    variant="rounded" 
                                    width={80} 
                                    height={50}
                                    animation={animation}
                                />
                            </Box>
                        </Box>
                    </Box>
                );

            default:
                return (
                    <Skeleton 
                        variant="rectangular" 
                        height={height}
                        animation={animation}
                        sx={{ borderRadius: 1 }}
                    />
                );
        }
    };

    if (count === 1) {
        return renderSkeleton();
    }

    return (
        <Grid container spacing={2}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    {renderSkeleton()}
                </Grid>
            ))}
        </Grid>
    );
};

export default LoadingSkeleton;