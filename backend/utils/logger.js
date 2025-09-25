const levels = ['error', 'warn', 'info', 'debug'];

function createLogger(level = 'info') {
  const currentIdx = levels.indexOf(level);
  const ts = () => new Date().toISOString();
  const base = (lvl, color, args) => {
    if (levels.indexOf(lvl) <= currentIdx) {
      // eslint-disable-next-line no-console
      console.log(`${color}[${ts()}] ${lvl.toUpperCase()}\x1b[0m`, ...args);
    }
  };
  return {
    error: (...a) => base('error', '\x1b[31m', a),
    warn: (...a) => base('warn', '\x1b[33m', a),
    info: (...a) => base('info', '\x1b[36m', a),
    debug: (...a) => base('debug', '\x1b[90m', a)
  };
}

module.exports = { createLogger };
