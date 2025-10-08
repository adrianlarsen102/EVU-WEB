import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--dark-bg)',
          color: 'var(--text-primary)',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            padding: '3rem',
            borderRadius: '10px',
            border: '2px solid var(--accent-color)',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <h1 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>
              ⚠️ Something went wrong
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                backgroundColor: 'var(--secondary-color)',
                padding: '1rem',
                borderRadius: '5px',
                textAlign: 'left',
                overflow: 'auto',
                fontSize: '0.85rem',
                color: 'var(--accent-color)'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'var(--dark-bg)',
                border: 'none',
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
