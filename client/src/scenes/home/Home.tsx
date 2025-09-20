import React from 'react'
import Map from '../map/Map'
import { Box, Paper, Typography } from '@mui/material'

function Home() {
    return (
        <Box
            sx={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 0,
                    borderRadius: 0,
                    flexGrow: 1,
                    overflow: 'hidden'
                }}
            >
                {/* <Typography variant="h3" sx={{ mb: 2 }}>
                    Interactive Map
                </Typography> */}
                <Box sx={{ height: '100%', width: '100%' }} >
                    <Map />
                </Box>
            </Paper>
        </Box>
    )
}

export default Home