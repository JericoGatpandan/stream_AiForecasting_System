import config from '../config';

// Performance monitoring utility
export class PerformanceMonitor {
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.measurements = [];
  }

  start(label = 'default') {
    if (config.debug.enablePerformanceLogs) {
      this.startTime = performance.now();
      console.time(`${this.name}-${label}`);
    }
  }

  end(label = 'default') {
    if (config.debug.enablePerformanceLogs && this.startTime) {
      const endTime = performance.now();
      const duration = endTime - this.startTime;
      
      console.timeEnd(`${this.name}-${label}`);
      console.log(`🚀 ${this.name}-${label}: ${duration.toFixed(2)}ms`);
      
      this.measurements.push({
        label,
        duration,
        timestamp: new Date().toISOString()
      });
    }
  }

  getMeasurements() {
    return this.measurements;
  }

  clear() {
    this.measurements = [];
  }
}

// Debug logger with different levels
export class Logger {
  static levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  constructor(context = 'App', level = Logger.levels.INFO) {
    this.context = context;
    this.level = config.app.isDevelopment ? Logger.levels.DEBUG : level;
  }

  error(message, ...args) {
    if (this.level >= Logger.levels.ERROR) {
      console.error(`❌ [${this.context}]`, message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level >= Logger.levels.WARN) {
      console.warn(`⚠️ [${this.context}]`, message, ...args);
    }
  }

  info(message, ...args) {
    if (this.level >= Logger.levels.INFO) {
      console.info(`ℹ️ [${this.context}]`, message, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level >= Logger.levels.DEBUG) {
      console.log(`🐛 [${this.context}]`, message, ...args);
    }
  }

  group(label, callback) {
    if (this.level >= Logger.levels.DEBUG) {
      console.group(`📁 [${this.context}] ${label}`);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }
}

// Component render tracker
export const useRenderTracker = (componentName) => {
  if (config.debug.enablePerformanceLogs) {
    const renderCount = React.useRef(0);
    renderCount.current++;
    
    React.useEffect(() => {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
    });

    React.useEffect(() => {
      console.log(`🟢 ${componentName} mounted`);
      return () => {
        console.log(`🔴 ${componentName} unmounted`);
      };
    }, []);
  }
};

// State change tracker
export const useStateTracker = (stateName, value) => {
  const prevValue = React.useRef();
  
  React.useEffect(() => {
    if (config.debug.enablePerformanceLogs) {
      if (prevValue.current !== undefined) {
        console.log(`📊 ${stateName} changed:`, {
          from: prevValue.current,
          to: value
        });
      }
      prevValue.current = value;
    }
  }, [stateName, value]);
};

// API call tracker
export const trackApiCall = (method, url, startTime) => {
  if (config.debug.enableApiLogs) {
    const duration = performance.now() - startTime;
    console.log(`📡 API ${method.toUpperCase()} ${url} completed in ${duration.toFixed(2)}ms`);
  }
};

// Error tracker
export const trackError = (error, context = 'Unknown') => {
  console.error(`💥 Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });

  // In production, you would send this to your error tracking service
  if (config.app.isProduction) {
    // sendToErrorService(error, context);
  }
};

// Memory usage tracker
export const trackMemoryUsage = () => {
  if (config.debug.enablePerformanceLogs && 'memory' in performance) {
    const memory = performance.memory;
    console.log('🧠 Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
    });
  }
};

// Create default logger instance
export const logger = new Logger('App');

export default {
  PerformanceMonitor,
  Logger,
  logger,
  useRenderTracker,
  useStateTracker,
  trackApiCall,
  trackError,
  trackMemoryUsage
};