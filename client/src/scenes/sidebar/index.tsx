import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext'
import {
    Box,
    Typography,
    useTheme,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Button,
    Switch,
    Avatar,
    Chip,
    Stack,
    IconButton
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map'
// import WaterIcon from '@mui/icons-material/Water'
import AnalyticsIcon from '@mui/icons-material/Analytics';
// import PsychologyIcon from '@mui/icons-material/Psychology'
import FloodIcon from '@mui/icons-material/Flood';
import WarningIcon from '@mui/icons-material/Warning'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloudIcon from '@mui/icons-material/Cloud'
import WbSunnyIcon from '@mui/icons-material/WbSunny'


const drawerWidth = 240;

// User data - in a real app this would come from authentication context
const userData = {
    name: "Jerico Gatpandan",
    role: "Admin", // Could be "Admin" or "User"
    email: "jerico.gatpandan@stream.com",
    avatar: "/api/placeholder/40/40"
};

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    minHeight: '64px',
    justifyContent: 'space-between',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2d2d34' : '#ffffff',
        color: theme.palette.text.primary,
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        transition: 'all 0.2s ease-in-out',
    }
}));

const UserProfileSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    marginBottom: theme.spacing(1),
}));

const MenuItemButton = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
    margin: '4px 12px',
    borderRadius: '12px',
    minHeight: '48px',
    backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.action.hover,
        color: theme.palette.text.primary,
        transform: 'translateX(4px)',
    },
    '& .MuiListItemIcon-root': {
        color: 'inherit',
        minWidth: '40px',
    },
    '& .MuiListItemText-primary': {
        fontWeight: isActive ? 600 : 400,
        fontSize: '14px',
    }
}));

const NotificationBadge = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 600,
    minWidth: '18px',
    textAlign: 'center',
}));

// const AskMeteorologistButton = styled(Button)(({ theme }) => ({
//     margin: '16px 12px',
//     backgroundColor: theme.palette.secondary.main,
//     color: theme.palette.secondary.contrastText,
//     borderRadius: '24px',
//     padding: '12px 20px',
//     textTransform: 'none',
//     fontWeight: 500,
//     fontSize: '14px',
//     '&:hover': {
//         backgroundColor: theme.palette.secondary.dark,
//         transform: 'translateY(-2px)',
//         boxShadow: `0 6px 16px ${theme.palette.secondary.main}30`,
//     },
// }));
const WeatherWidget = styled(Box)(({ theme }) => ({
    padding: '16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.12)',
    marginTop: 'auto',
}));


const Sidebar = () => {
    const { palette } = useTheme();
    const { isDarkMode, toggleDarkMode } = useCustomTheme();
    const [open, setOpen] = useState(true);
    const location = useLocation();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const menuItems = [
        {
            text: 'Home',
            icon: <HomeIcon />,
            path: '/',
            badge: '1'
        },
        {
            text: 'Forecast',
            icon: <FloodIcon />,
            path: '/forecast',
            badge: null
        },
        {
            text: 'Analytics',
            icon: <AnalyticsIcon />,
            path: '/analytics',
            badge: null
        },
        {
            text: 'Weather Alerts',
            icon: <WarningIcon />,
            path: '/weather-alerts',
            badge: '1'
        },
        {
            text: 'Settings',
            icon: <SettingsIcon />,
            path: '/settings',
            badge: null
        },
    ];

    return (
        <StyledDrawer
            variant="permanent"
            sx={{
                width: open ? drawerWidth : 65,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : 65,
                    boxSizing: 'border-box',
                    transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
            open={open}
        >
            {/* Header with Logo and Toggle */}
            <DrawerHeader>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: open ? 'center' : 'center',
                        width: '100%',
                        py: 2,
                        position: 'relative'
                    }}
                >
                    <Box
                        component="img"
                        src="/Stream_logo.svg"
                        alt="Stream Logo"
                        sx={{
                            height: open ? '40px' : '32px',
                            width: 'auto',
                            transition: 'all 0.2s ease-in-out',
                            display: open ? 'flex' : 'none'
                        }}
                    />
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{
                            position: 'absolute',
                            justifyContent: 'center',
                            right: 8,
                            color: palette.text.secondary,
                            '&:hover': {
                                color: palette.text.primary,
                                backgroundColor: palette.action.hover
                            }
                        }}
                    >
                        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </Box>
            </DrawerHeader>

            {/* User Profile Section */}
            {open && (
                <UserProfileSection>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: palette.secondary.main,
                                fontSize: '16px',
                                fontWeight: 600
                            }}
                        >
                            E
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: palette.text.primary,
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    lineHeight: 1.2
                                }}
                            >
                                {userData.name}
                            </Typography>
                            <Chip
                                label={userData.role}
                                size="small"
                                sx={{
                                    backgroundColor: userData.role === 'Admin' ? palette.success.main : palette.info.main,
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    height: '20px',
                                    marginTop: '4px'
                                }}
                            />
                        </Box>
                        <IconButton
                            size="small"
                            sx={{
                                color: palette.text.secondary,
                                '&:hover': { color: palette.text.primary }
                            }}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </UserProfileSection>
            )}

            {/* Menu Items */}
            <List sx={{ flexGrow: 1, paddingTop: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem
                            key={item.text}
                            disablePadding
                            sx={{ display: 'block' }}
                        >
                            <MenuItemButton
                                component={Link}
                                to={item.path}
                                isActive={isActive}
                                sx={{
                                    justifyContent: open ? 'initial' : 'center',
                                    px: open ? 2.5 : 0,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        '& .MuiTypography-root': {
                                            fontSize: '14px'
                                        }
                                    }}
                                />
                                {open && item.badge && (
                                    <NotificationBadge>
                                        {item.badge}
                                    </NotificationBadge>
                                )}
                            </MenuItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Ask Meteorologist Button */}
            {/* {open && (
                <AskMeteorologistButton
                    startIcon={<QuestionAnswerIcon />}
                    fullWidth
                >
                    Ask meteorologist
                </AskMeteorologistButton>
            )} */}

            {/* Weather Widget and Dark Mode Toggle */}
            {open && (
                <WeatherWidget>
                    <Stack spacing={2}>
                        {/* Weather Display */}
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <CloudIcon sx={{ color: '#95a5a6', fontSize: '20px' }} />
                                <WbSunnyIcon sx={{ color: '#f39c12', fontSize: '20px' }} />
                            </Box>
                        </Stack>

                        {/* Dark Mode Toggle */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#b0b0b0',
                                    fontSize: '13px'
                                }}
                            >
                                Dark mode
                            </Typography>
                            <Switch
                                checked={isDarkMode}
                                onChange={toggleDarkMode}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: palette.secondary.main,
                                        '& + .MuiSwitch-track': {
                                            backgroundColor: palette.secondary.main,
                                        },
                                    },
                                }}
                            />
                        </Stack>
                    </Stack>
                </WeatherWidget>
            )}
            {/* Logout Button */}
            <Box sx={{ p: 2, mt: 'auto' }}>
                <Button
                    startIcon={<LogoutIcon />}
                    fullWidth
                    sx={{
                        backgroundColor: palette.secondary.main,
                        color: palette.secondary.contrastText,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 500,
                        py: 1.5,
                        '&:hover': {
                            backgroundColor: palette.secondary.dark,
                        },
                    }}
                >
                    <Typography sx={{ display: open ? 'flex' : 'none' }}>
                        Logout
                    </Typography>

                </Button>
            </Box>
        </StyledDrawer>
    )
}

export default Sidebar;