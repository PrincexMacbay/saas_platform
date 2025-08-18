import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Something went wrong</h3>
            <p>An error occurred while rendering this component.</p>
            <details className="error-details">
              <summary>Error Details (for developers)</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
            <button 
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="retry-button"
            >
              Try Again
            </button>
          </div>

          <style jsx>{`
            .error-boundary {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 400px;
              padding: 20px;
            }

            .error-content {
              text-align: center;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              padding: 40px;
              max-width: 600px;
              width: 100%;
            }

            .error-content i {
              font-size: 3rem;
              color: #e74c3c;
              margin-bottom: 20px;
            }

            .error-content h3 {
              margin: 0 0 15px 0;
              color: #2c3e50;
              font-size: 1.5rem;
            }

            .error-content p {
              color: #7f8c8d;
              margin: 0 0 30px 0;
              font-size: 1.1rem;
            }

            .error-details {
              margin: 20px 0;
              text-align: left;
            }

            .error-details summary {
              cursor: pointer;
              color: #3498db;
              margin-bottom: 10px;
            }

            .error-details pre {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              overflow-x: auto;
              font-size: 0.9rem;
              color: #e74c3c;
              margin: 10px 0;
            }

            .retry-button {
              background: #3498db;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: background 0.3s ease;
            }

            .retry-button:hover {
              background: #2980b9;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
