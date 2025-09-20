// import React from 'react'
import Map from '../map/Map'
import { Box, Paper } from '@mui/material'

function Home() {
    return (
        <Box
            sx={{
                height: 'calc(100vh - 100px)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Paper
                elevation={2}
                sx={{
                    p: 0,
                    borderRadius: 2,
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