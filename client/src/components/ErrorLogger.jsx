import React, { useState, useEffect, useRef } from 'react';
import { useErrorLogger } from '../contexts/ErrorLoggerContext';
import { setErrorLoggerContext } from '../utils/errorLogger';
import './ErrorLogger.css';

const ErrorLogger = () => {
  const { errors, isVisible, toggleVisibility, clearErrors, getErrorCount, addError } = useErrorLogger();
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all'); // all, frontend, backend, network
  const scrollRef = useRef(null);

  // Set the context for utility functions
  useEffect(() => {
    setErrorLoggerContext({ addError });
  }, [addError]);



  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && scrollRef.current && errors.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo(0, 0);
      }, 100);
    }
  }, [errors.length, autoScroll]);

  // Global error handler
  useEffect(() => {
    const { addError } = useErrorLogger();

    const handleGlobalError = (event) => {
      addError(event.error || event, 'frontend', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event) => {
      addError(event.reason, 'frontend', {
        type: 'unhandledRejection'
      });
    };

    // Intercept console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addError(new Error(errorMessage), 'frontend', {
        source: 'console.error'
      });
    };

    // Intercept console warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
      const warningMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      addError(new Error(`WARNING: ${warningMessage}`), 'frontend', {
        source: 'console.warn'
      });
    };

    // Intercept fetch requests for network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Log non-2xx responses as errors
        if (!response.ok) {
          const errorData = await response.clone().text();
          addError(new Error(`HTTP ${response.status}: ${response.statusText}`), 'network', {
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            response: errorData
          });
        }
        
        return response;
      } catch (error) {
        addError(error, 'network', {
          url: args[0],
          method: args[1]?.method || 'GET'
        });
        throw error;
      }
    };

    // Intercept XMLHttpRequest for older API calls
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._errorLoggerMethod = method;
      this._errorLoggerUrl = url;
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      const xhr = this;
      const originalOnReadyStateChange = xhr.onreadystatechange;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status >= 400) {
          addError(new Error(`XHR ${xhr.status}: ${xhr.statusText}`), 'network', {
            url: xhr._errorLoggerUrl,
            method: xhr._errorLoggerMethod,
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText
          });
        }
        
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(xhr, args);
        }
      };
      
      return originalXHRSend.apply(this, args);
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
    };
  }, []);

  // Export errors as JSON
  const exportErrors = () => {
    const dataStr = JSON.stringify(errors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `errors-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get filtered errors
  const getFilteredErrors = () => {
    if (filter === 'all') return errors;
    return errors.filter(error => error.type === filter);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get error type color
  const getErrorTypeColor = (type) => {
    const colors = {
      'frontend': '#dc3545',
      'backend': '#fd7e14',
      'network': '#6f42c1',
      'api': '#0dcaf0',
      'validation': '#ffc107'
    };
    return colors[type] || '#6c757d';
  };

  // Get error type icon
  const getErrorTypeIcon = (type) => {
    const icons = {
      'frontend': 'fas fa-bug',
      'backend': 'fas fa-server',
      'network': 'fas fa-wifi',
      'api': 'fas fa-code',
      'validation': 'fas fa-exclamation-triangle'
    };
    return icons[type] || 'fas fa-exclamation-circle';
  };

  if (!isVisible) {
    return (
      <div className="error-logger-minimized">
        <button
          className="error-logger-toggle"
          onClick={toggleVisibility}
          title="Show Error Logger"
        >
          <i className="fas fa-exclamation-triangle"></i>
          {errors.length > 0 && (
            <span className="error-count">{errors.length}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="error-logger">
      {/* Header */}
      <div className="error-logger-header">
        <div className="error-logger-title">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Error Logger
          {errors.length > 0 && (
            <span className="error-count-badge">{errors.length}</span>
          )}
        </div>
        <div className="error-logger-controls">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Disable Auto-scroll' : 'Enable Auto-scroll'}
          >
            <i className={`fas fa-${autoScroll ? 'lock' : 'unlock'}`}></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <i className={`fas fa-${isExpanded ? 'compress' : 'expand'}`}></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleVisibility}
            title="Minimize"
          >
            <i className="fas fa-minus"></i>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="error-logger-filters">
        <div className="btn-group btn-group-sm" role="group">
          {['all', 'frontend', 'backend', 'network', 'api', 'validation'].map(type => (
            <button
              key={type}
              type="button"
              className={`btn ${filter === type ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(type)}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ms-1">({getErrorCount(type)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="error-logger-actions">
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={clearErrors}
          disabled={errors.length === 0}
        >
          <i className="fas fa-trash me-1"></i>
          Clear All
        </button>
        <button
          className="btn btn-sm btn-outline-info"
          onClick={exportErrors}
          disabled={errors.length === 0}
        >
          <i className="fas fa-download me-1"></i>
          Export
        </button>
      </div>

      {/* Error List */}
      <div 
        className={`error-logger-content ${isExpanded ? 'expanded' : ''}`}
        ref={scrollRef}
      >
        {getFilteredErrors().length === 0 ? (
          <div className="error-logger-empty">
            <i className="fas fa-check-circle text-success"></i>
            <p>No errors logged</p>
          </div>
        ) : (
          <div className="error-list">
            {getFilteredErrors().map(error => (
              <div key={error.id} className="error-item">
                <div className="error-header">
                  <div className="error-type">
                    <i 
                      className={getErrorTypeIcon(error.type)}
                      style={{ color: getErrorTypeColor(error.type) }}
                    ></i>
                    <span className="error-type-label">{error.type}</span>
                  </div>
                  <div className="error-time">
                    {formatTimestamp(error.timestamp)}
                  </div>
                </div>
                
                <div className="error-message">
                  {error.message}
                </div>
                
                {error.context && Object.keys(error.context).length > 0 && (
                  <div className="error-context">
                    <strong>Context:</strong>
                    <pre>{JSON.stringify(error.context, null, 2)}</pre>
                  </div>
                )}
                
                {error.stack && (
                  <div className="error-stack">
                    <strong>Stack:</strong>
                    <pre>{error.stack}</pre>
                  </div>
                )}
                
                <div className="error-meta">
                  <small>
                    <strong>URL:</strong> {error.url}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorLogger;
