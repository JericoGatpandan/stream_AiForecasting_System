import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

// Loading State Component
export const LoadingState = ({ 
  message = 'Loading...', 
  size = 'md',
  className = '',
  showSpinner = true 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {showSpinner && <LoadingSpinner size={size} className="mb-4" />}
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
};

// Error State Component
export const ErrorState = ({ 
  error, 
  onRetry, 
  title = 'Error',
  className = '',
  showDetails = false 
}) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.isNetworkError) return 'Network connection failed. Please check your internet connection.';
    return 'An unexpected error occurred.';
  };

  const getErrorIcon = (error) => {
    if (error?.isNetworkError) {
      return <WifiOff className="w-12 h-12 text-red-500" />;
    }
    return <AlertTriangle className="w-12 h-12 text-red-500" />;
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      {getErrorIcon(error)}
      <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
      
      {showDetails && import.meta.env.DEV && error?.originalError && (
        <details className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-left w-full max-w-md">
          <summary className="cursor-pointer text-red-700 font-medium text-sm">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(error.originalError, null, 2)}
          </pre>
        </details>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ 
  icon: Icon = Wifi,
  title = 'No data found',
  message = 'There is no data to display.',
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <Icon className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {action}
    </div>
  );
};

// Generic Async Content Wrapper
export const AsyncContent = ({ 
  loading, 
  error, 
  data, 
  children,
  loadingMessage,
  emptyMessage = 'No data available',
  onRetry,
  showErrorDetails = false,
  renderEmpty
}) => {
  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={onRetry} 
        showDetails={showErrorDetails}
      />
    );
  }

  // Check if data is empty (null, undefined, empty array, empty object)
  const isEmpty = data == null || 
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && Object.keys(data).length === 0);

  if (isEmpty) {
    if (renderEmpty) {
      return renderEmpty();
    }
    return <EmptyState message={emptyMessage} />;
  }

  return children;
};