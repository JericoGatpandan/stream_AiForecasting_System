const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { createLogger } = require('./utils/logger');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler');

const logger = createLogger(config.log.level);
const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration to allow frontend
const allowedOrigin = process.env.CLIENT_ORIGIN || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if ([allowedOrigin].includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));

// Global basic rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

if (!config.isProd) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
    });
    next();
  });
}

app.use('/environmental', require('./routes/environmentalData'));
app.use('/weather', require('./routes/weather'));
app.use('/barangays', require('./routes/barangays'));
app.use('/flood', require('./routes/floodCharacteristics'));
app.use('/sensors', require('./routes/sensors'));
app.use('/predictions', require('./routes/predictions'));

app.get('/health', async (req, res) => {
  const uptime = process.uptime();
  let dbStatus = 'unknown';
  try { await db.sequelize.authenticate(); dbStatus = 'up'; } catch { dbStatus = 'down'; }
  res.json({
    status: 'ok',
    env: config.env,
    uptime_seconds: Math.round(uptime),
    timestamp: new Date().toISOString(),
    db: dbStatus,
    version: require('../package.json').version
  });
});

app.use((req, res) => { res.status(404).json({ error: 'Not Found' }); });
app.use(errorHandler);

function startServer() {
  if (config.env === 'vercel' || process.env.VERCEL) {
    logger.info('Running in Vercel mode (no explicit listen).');
    return app;
  }
  // const maybeAutoSeed = async () => {
  //   try {
  //     const count = await db.Barangay.count();
  //     if (count === 0) {
  //       logger.info('No barangays found. Auto-seeding database...');
  //       const { seedDatabase } = require('./seedMVP');
  //       await seedDatabase();
  //       logger.info('Auto-seed complete.');
  //     } else {
  //       logger.info(`Database already seeded (Barangays: ${count}). Skipping auto-seed.`);
  //     }
  //   } catch (e) {
  //     logger.warn(`Auto-seed skipped: ${e.message}`);
  //   }
  // };

  db.sequelize.sync({ force: false })
    .then(async () => {
      // await maybeAutoSeed();
      app.listen(config.port, () => {
        logger.info(`Server listening on http://localhost:${config.port}`);
        logger.info(`Environment: ${config.env}`);
      });
    })
    .catch(err => {
      logger.error('Database connection failed:', err);
      process.exit(1);
    });
  return app;
}



if (require.main === module) { startServer(); }

module.exports = app;
