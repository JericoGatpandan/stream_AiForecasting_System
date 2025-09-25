const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { createLogger } = require('./utils/logger');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler');

const logger = createLogger(config.log.level);
const app = express();

app.use(express.json({ limit: '512kb' }));
app.use(cors());

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
    version: require('./package.json').version
  });
});

app.use((req, res) => { res.status(404).json({ error: 'Not Found' }); });
app.use(errorHandler);

function startServer() {
  if (config.env === 'vercel' || process.env.VERCEL) {
    logger.info('Running in Vercel mode (no explicit listen).');
    return app;
  }
  db.sequelize.sync({ force: false })
    .then(() => {
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
