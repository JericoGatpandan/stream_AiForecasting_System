/**
 * Map Performance Monitoring Utilities
 */

export class MapPerformanceMonitor {
  constructor() {
    this.metrics = {
      mapLoadStart: null,
      mapLoadEnd: null,
      dataLoadStart: null,
      dataLoadEnd: null,
      renderStart: null,
      renderEnd: null,
      httpRequests: []
    };
  }

  startMapLoad() {
    this.metrics.mapLoadStart = performance.now();
    console.log('🗺️ Map loading started');
  }

  endMapLoad() {
    this.metrics.mapLoadEnd = performance.now();
    const duration = this.metrics.mapLoadEnd - this.metrics.mapLoadStart;
    console.log(`Map loaded in ${duration.toFixed(2)}ms`);
    return duration;
  }

  startDataLoad() {
    this.metrics.dataLoadStart = performance.now();
    console.log('Data loading started');
  }

  endDataLoad() {
    this.metrics.dataLoadEnd = performance.now();
    const duration = this.metrics.dataLoadEnd - this.metrics.dataLoadStart;
    console.log(`Data loaded in ${duration.toFixed(2)}ms`);
    return duration;
  }

  trackHttpRequest(url, startTime, endTime, success = true) {
    const duration = endTime - startTime;
    this.metrics.httpRequests.push({
      url,
      duration,
      success,
      timestamp: new Date().toISOString()
    });
    
    const status = success ? '✅' : '❌';
    console.log(`${status} HTTP ${url} - ${duration.toFixed(2)}ms`);
  }

  startRender() {
    this.metrics.renderStart = performance.now();
  }

  endRender() {
    this.metrics.renderEnd = performance.now();
    const duration = this.metrics.renderEnd - this.metrics.renderStart;
    console.log(`Render completed in ${duration.toFixed(2)}ms`);
    return duration;
  }

  getSummary() {
    const mapLoadTime = this.metrics.mapLoadEnd - this.metrics.mapLoadStart;
    const dataLoadTime = this.metrics.dataLoadEnd - this.metrics.dataLoadStart;
    const totalRequests = this.metrics.httpRequests.length;
    const failedRequests = this.metrics.httpRequests.filter(r => !r.success).length;
    const avgRequestTime = totalRequests > 0 
      ? this.metrics.httpRequests.reduce((sum, r) => sum + r.duration, 0) / totalRequests 
      : 0;

    return {
      mapLoadTime: mapLoadTime?.toFixed(2) + 'ms' || 'N/A',
      dataLoadTime: dataLoadTime?.toFixed(2) + 'ms' || 'N/A',
      totalRequests,
      failedRequests,
      avgRequestTime: avgRequestTime.toFixed(2) + 'ms',
      successRate: totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests * 100).toFixed(1) + '%' : 'N/A'
    };
  }

  logSummary() {
    const summary = this.getSummary();
    console.group('Map Performance Summary');
    console.log('Map Load Time:', summary.mapLoadTime);
    console.log('Data Load Time:', summary.dataLoadTime);
    console.log('Total HTTP Requests:', summary.totalRequests);
    console.log('Failed Requests:', summary.failedRequests);
    console.log('Average Request Time:', summary.avgRequestTime);
    console.log('Success Rate:', summary.successRate);
    console.groupEnd();
  }
}

// Create a wrapped fetch function that tracks performance
export function createPerformanceTrackedFetch(monitor) {
  return async function performanceTrackedFetch(url, options = {}) {
    const startTime = performance.now();
    let success = true;
    
    try {
      const response = await fetch(url, options);
      success = response.ok;
      const endTime = performance.now();
      monitor.trackHttpRequest(url, startTime, endTime, success);
      return response;
    } catch (error) {
      success = false;
      const endTime = performance.now();
      monitor.trackHttpRequest(url, startTime, endTime, success);
      throw error;
    }
  };
}

// Debounced function for performance-heavy operations
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for limiting frequent operations
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}