import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="error-boundary-box glass-card animated-slide-up">
            <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              MindTrack encountered an unexpected error. Don't worry, your progress and logged entries stored in the device are safe.
            </p>
            {this.state.error && (
              <pre style={{ 
                background: 'var(--bg-primary)', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                fontSize: '0.8rem', 
                overflowX: 'auto', 
                color: 'var(--text-muted)',
                textAlign: 'left',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-color)'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button className="btn btn-primary" onClick={this.handleReset}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
