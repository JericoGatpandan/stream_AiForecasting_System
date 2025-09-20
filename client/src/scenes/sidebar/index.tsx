import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Box, Typography, useTheme, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, styled } from '@mui/material'
import FlexBetween from '@/components/FlexBetween'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeIcon from '@mui/icons-material/Home'
import AirIcon from '@mui/icons-material/Air'
import NotificationsIcon from '@mui/icons-material/Notifications'
import BarChartIcon from '@mui/icons-material/BarChart'

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const Sidebar = () => {
    const { palette } = useTheme();
    const [open, setOpen] = useState(true);
    const location = useLocation();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, path: '/' },
        { text: 'Forecast', icon: <AirIcon />, path: '/forecast' },
        { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts' },
        { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? drawerWidth : 65,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : 65,
                    boxSizing: 'border-box',
                    borderRight: 'none',
                    backgroundColor: palette.background.default,
                    color: palette.grey[300],
                    transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
                    overflowX: 'hidden',
                },
            }}
            open={open}
        >
            <DrawerHeader>
                <FlexBetween width="100%" p="0.5rem 0.75rem">
                    <Box sx={{
                        display: open ? 'flex' : 'none',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Box
                            component="img"
                            alt="Stream Logo"
                            src="/Stream_logo.svg"
                            height="28px"
                        />
                        <Typography variant="h4" color={palette.grey[100]}>
                            STREAM
                        </Typography>
                    </Box>
                    <IconButton onClick={handleDrawerToggle}>
                        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </FlexBetween>
            </DrawerHeader>
            <Divider />
            <List>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem
                            key={item.text}
                            disablePadding
                            sx={{ display: 'block' }}
                        >
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    backgroundColor: isActive ? palette.primary[600] : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive
                                            ? palette.primary[600]
                                            : palette.primary[900]
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: isActive ? palette.grey[100] : palette.grey[300]
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        '& .MuiTypography-root': {
                                            fontWeight: isActive ? 'bold' : 'normal',
                                            color: isActive ? palette.grey[100] : palette.grey[300]
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    )
}

export default Sidebar;