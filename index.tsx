import React, { ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Index.tsx loaded, beginning mount process...");

// Error Boundary Types
interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application Fatal Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-slate-600 mb-4">The application encountered an unexpected error during render.</p>
            <div className="bg-slate-100 p-4 rounded text-xs font-mono text-slate-700 overflow-auto max-h-48">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mount Function
const mount = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("Failed to find root element 'root'");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log("Root created, rendering App...");
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    // Manually remove loader if React mounts successfully
    setTimeout(() => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
            console.log("Removing initial loader...");
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }, 500);
    
  } catch (err) {
    console.error("Failed to mount React app:", err);
    // Fallback error display if React completely fails to start
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: red; font-family: sans-serif;">
        <h1>System Error</h1>
        <p>Failed to initialize application.</p>
        <pre>${err}</pre>
      </div>
    `;
  }
};

mount();