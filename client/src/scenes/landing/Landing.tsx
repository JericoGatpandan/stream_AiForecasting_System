import { Box, Button, Container, Stack, Typography, Chip, Card, CardContent, AppBar, Toolbar, IconButton } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import InsightsIcon from '@mui/icons-material/Insights';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import MapIcon from '@mui/icons-material/Map';
import SecurityIcon from '@mui/icons-material/Security';

const features = [
  { title: 'Real-time Flood Monitoring', desc: 'Track water levels and rainfall with live sensor data.', icon: <MapIcon /> },
  { title: 'AI Flood Forecasts', desc: 'Predict risk levels across barangays using advanced ML.', icon: <InsightsIcon /> },
  { title: 'Actionable Alerts', desc: 'Get timely notifications for high-risk conditions.', icon: <CrisisAlertIcon /> },
  { title: 'Enterprise-grade Security', desc: 'Secure authentication, rate limits, and modern best practices.', icon: <SecurityIcon /> },
];

// Simple scroll-reveal wrapper without extra deps
const Reveal: React.FC<{ delay?: number; y?: number; children: React.ReactNode }> = ({ delay = 0, y = 16, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShow(true);
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Box ref={ref} sx={{
      opacity: show ? 1 : 0,
      transform: show ? 'none' : `translateY(${y}px)`,
      transition: `opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      '@media (prefers-reduced-motion: reduce)': { transition: 'none', transform: 'none', opacity: 1 }
    }}>
      {children}
    </Box>
  );
};

const Landing = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: (t) => t.palette.background.default }}>
      {/* Top nav */}
      <AppBar position="fixed" elevation={0} color="transparent" sx={{ backdropFilter: 'blur(8px)', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
            <Box component="img" src="/Stream_logo.svg" alt="Stream Logo" sx={{ height: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>STREAM</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => navigate('/login')}>Sign in</Button>
            <Button variant="contained" onClick={() => navigate('/register')}>Get started</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Background accents (gradient mesh + subtle grid + animated blobs) */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Gradient mesh */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: (
            theme => `
              radial-gradient(35% 40% at 15% 10%, ${theme.palette.primary.main}22 0%, transparent 60%),
              radial-gradient(28% 36% at 85% 15%, ${theme.palette.secondary.main}22 0%, transparent 62%),
              radial-gradient(30% 36% at 80% 80%, ${theme.palette.success.main}1f 0%, transparent 60%),
              radial-gradient(26% 30% at 20% 85%, ${theme.palette.warning.main}1a 0%, transparent 60%)
            `
          ),
          filter: 'saturate(120%)',
        }} />

        {/* Subtle grid pattern */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: `
            linear-gradient(to right, rgba(120,120,120,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120,120,120,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 80%, transparent 100%)'
        }} />

        {/* Animated blobs (respect reduced-motion) */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          opacity: 0.12,
          filter: 'blur(40px)',
          animation: 'floatA 18s ease-in-out infinite',
          '@keyframes floatA': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(40px, 20px) scale(1.05)' }
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -120,
          right: -140,
          width: 360,
          height: 360,
          borderRadius: '50%',
          backgroundColor: 'secondary.main',
          opacity: 0.12,
          filter: 'blur(60px)',
          animation: 'floatB 22s ease-in-out infinite',
          '@keyframes floatB': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(-30px, -10px) scale(0.98)' }
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
        }} />
        {/* Rain lines layer */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          backgroundImage: 'repeating-linear-gradient(200deg, currentColor 0px, currentColor 1px, transparent 3px, transparent 8px)',
          color: 'primary.main',
          backgroundSize: 'auto',
          transform: 'translateZ(0)',
          animation: 'rainSlide 12s linear infinite',
          '@keyframes rainSlide': {
            from: { backgroundPosition: '0 0' },
            to: { backgroundPosition: '0 400px' }
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
        }} />
        {/* Isoline/contour SVG for topographic vibe */}
        <Box component="svg" viewBox="0 0 1440 600" preserveAspectRatio="none" sx={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
          <path d="M0 300 C 180 260, 360 360, 540 320 C 720 280, 900 340, 1080 300 C 1260 260, 1380 300, 1440 280" stroke="currentColor" fill="none" strokeWidth="2" />
          <path d="M0 360 C 180 320, 360 420, 540 380 C 720 340, 900 400, 1080 360 C 1260 320, 1380 360, 1440 340" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M0 420 C 180 380, 360 480, 540 440 C 720 400, 900 460, 1080 420 C 1260 380, 1380 420, 1440 400" stroke="currentColor" fill="none" strokeWidth="1" />
        </Box>
        {/* Water ripple pulse near hero center */}
        <Box sx={{
          position: 'absolute', left: '50%', top: '28%', width: 8, height: 8, borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 0 rgba(18,239,200,0.3)',
          animation: 'ripple 3.5s ease-out infinite',
          '@keyframes ripple': {
            '0%': { boxShadow: '0 0 0 0 rgba(18,239,200,0.30)' },
            '70%': { boxShadow: '0 0 0 28px rgba(18,239,200,0.0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(18,239,200,0.0)' }
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          backgroundColor: '#12EFC8',
          opacity: 0.5
        }} />
      </Box>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: 16, pb: 10 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Reveal>
            <Chip label="Flood Intelligence Platform" color="primary" sx={{ fontWeight: 600 }} />
          </Reveal>
          <Reveal delay={50}>
            <Typography variant="h1" sx={{ maxWidth: 900 }}>
              Smarter AI-powered flood forecasting and monitoring
            </Typography>
          </Reveal>
          <Reveal delay={100}>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 820 }}>
              Stay ahead of extreme weather with live environmental data, precise forecasts, and actionable alerts—all in one modern platform.
            </Typography>
          </Reveal>
          <Reveal delay={150}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" color="primary" onClick={() => navigate('/register')}>
                Get started free
              </Button>
              <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </Stack>
          </Reveal>
          <Reveal delay={220}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
              <Chip size="small" label="Live sensors · 128" sx={{ fontWeight: 600 }} />
              <Chip size="small" label="Active alerts · 2" color="warning" sx={{ fontWeight: 600 }} />
              <Chip size="small" label="Coverage · 24 barangays" variant="outlined" sx={{ fontWeight: 600 }} />
            </Stack>
          </Reveal>
        </Stack>
      </Container>

      {/* Wave divider under hero */}
      <Box sx={{ position: 'relative', pointerEvents: 'none' }}>
        <Box component="svg" viewBox="0 0 1440 120" preserveAspectRatio="none" sx={{ display: 'block', width: '100%', height: 60 }}>
          <path d="M0,64L48,58.7C96,53,192,43,288,37.3C384,32,480,32,576,53.3C672,75,768,117,864,128C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="currentColor" opacity="0.06" />
        </Box>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Typography variant="h3" textAlign="center">Why STREAM</Typography>
          <Typography variant="body1" textAlign="center" sx={{ color: 'text.secondary' }}>
            Built for speed, accuracy, and clarity
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <Card sx={{ flex: 1, border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(8px)', transition: 'transform 200ms ease, box-shadow 200ms ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <IconButton size="small" color="primary" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>{f.icon}</IconButton>
                    <Typography variant="h5">{f.title}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </Stack>
      </Container>

  {/* Metrics band */}
  <Box sx={{ py: 8, background: () => isDarkMode ? 'rgba(25,118,210,0.06)' : 'rgba(25,118,210,0.04)', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="lg">
      <Reveal>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Stack>
            <Typography variant="h3" sx={{ lineHeight: 1, fontWeight: 800 }}>99.9%</Typography>
            <Typography variant="body2" color="text.secondary">Uptime for data ingestion</Typography>
          </Stack>
          <Stack>
            <Typography variant="h3" sx={{ lineHeight: 1, fontWeight: 800 }}>24+</Typography>
            <Typography variant="body2" color="text.secondary">Barangays monitored</Typography>
          </Stack>
          <Stack>
            <Typography variant="h3" sx={{ lineHeight: 1, fontWeight: 800 }}>15 min</Typography>
            <Typography variant="body2" color="text.secondary">Forecast refresh cadence</Typography>
          </Stack>
          <Stack>
            <Typography variant="h3" sx={{ lineHeight: 1, fontWeight: 800 }}>AES-256</Typography>
            <Typography variant="body2" color="text.secondary">Security at-rest & in-transit</Typography>
          </Stack>
        </Stack>
      </Reveal>
    </Container>
  </Box>

  {/* Logos marquee */}
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="overline" color="text.secondary">Trusted by responders and planners</Typography>
    </Stack>
    <Box sx={{ position: 'relative', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
      <Box sx={{
        display: 'inline-flex',
        gap: 3,
        px: 2,
        whiteSpace: 'nowrap',
        animation: 'logos-marquee 28s linear infinite',
        '@keyframes logos-marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
      }}>
        {[...Array(2)].flatMap(() => ['HydroWatch', 'RiverGuard', 'ClimaOps', 'ResilienceLab', 'GeoSense', 'AquaGrid', 'FlowOps', 'StormEye']).map((name, idx) => (
          <Box key={`${name}-${idx}`} sx={{ px: 2, py: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 2, color: 'text.secondary', fontWeight: 600, minWidth: 140, textAlign: 'center', bgcolor: 'background.paper' }}>
            {name}
          </Box>
        ))}
      </Box>
    </Box>
  </Container>

  {/* Product preview mock */}
  <Container maxWidth="lg" sx={{ pb: 8 }}>
    <Reveal>
      <Card sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h5">See risks before they surge</Typography>
            <Typography variant="body2" color="text.secondary">An interactive map with live sensors, risk heatmaps, and forecast timelines helps you act fast.</Typography>
          </Stack>
          <Box sx={{
          height: 320,
          borderRadius: 2,
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}22 0%, ${t.palette.secondary.main}22 100%)`,
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative'
        }}>
          {/* Faux UI blocks to suggest a screenshot without assets */}
          <Box sx={{ position: 'absolute', top: 16, left: 16, bgcolor: 'background.paper', borderRadius: 1, p: 1, boxShadow: 1, minWidth: 160, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">Layer Controls</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip size="small" label="Flood" color="primary" />
              <Chip size="small" label="Rain" variant="outlined" />
              <Chip size="small" label="Wind" variant="outlined" />
            </Stack>
          </Box>
          <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', bgcolor: 'background.paper', borderRadius: 2, px: 2, py: 1, border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
            <Typography variant="caption">Timeline ▸ | ▌▌ 06:00 → 18:00</Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: 24, right: 24, display: 'grid', gap: 1 }}>
            {["LOW", "MOD", "HIGH", "EXT"].map((lvl, i) => (
              <Box key={lvl} sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, px: 1, py: 0.5, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: ['#4CAF50','#FFC107','#FF9800','#F44336'][i] }} />
                <Typography variant="caption" fontWeight={600}>{lvl}</Typography>
              </Box>
            ))}
          </Box>
          </Box>
        </CardContent>
      </Card>
    </Reveal>
  </Container>

  {/* Testimonials */}
  <Container maxWidth="lg" sx={{ pb: 10 }}>
    <Stack spacing={3} sx={{ mb: 2 }}>
      <Reveal>
        <Typography variant="h3" textAlign="center">What teams say</Typography>
      </Reveal>
      <Reveal delay={60}>
        <Typography variant="body2" textAlign="center" color="text.secondary">Reliable insights that speed up response</Typography>
      </Reveal>
    </Stack>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      {[{
        quote: 'We shaved hours off our briefing time during heavy rains.',
        name: 'Operations Chief', org: 'City DRRMO'
      }, {
        quote: 'Forecasts were on point and the UI is clean for field teams.',
        name: 'Hydro Engr.', org: 'Watershed Authority'
      }, {
        quote: 'Exactly what we needed for barangay risk visibility.',
        name: 'Planner', org: 'LGU Planning'
      }].map((t, i) => (
        <Reveal key={t.name} delay={i * 80}>
          <Card sx={{ flex: 1, border: '1px solid', borderColor: 'divider', transition: 'transform 200ms ease, box-shadow 200ms ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
            <CardContent>
              <Typography variant="body1" sx={{ mb: 1 }}>
                “{t.quote}”
              </Typography>
              <Typography variant="caption" color="text.secondary">
                — {t.name}, {t.org}
              </Typography>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </Stack>
  </Container>

      {/* CTA */}
      <Box sx={{ py: 8, background: () => isDarkMode ? '#1f2937' : '#f3f4f6', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography variant="h4">Ready to explore STREAM?</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" onClick={() => navigate('/register')}>Create account</Button>
              <Button variant="text" onClick={() => navigate('/login')}>I have an account</Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

  {/* Footer */}
  <Box sx={{ py: 4 }}>
    <Container maxWidth="lg">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box component="img" src="/Stream_logo.svg" alt="Stream Logo" sx={{ height: 20 }} />
          <Typography variant="body2" color="text.secondary">© {new Date().getFullYear()} STREAM</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button size="small">Privacy</Button>
          <Button size="small">Security</Button>
          <Button size="small">Docs</Button>
        </Stack>
      </Stack>
    </Container>
  </Box>
    </Box>
  );
};

export default Landing;


