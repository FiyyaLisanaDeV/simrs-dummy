import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white p-8 flex items-center justify-center animate-in fade-in">
          <div className="max-w-3xl w-full bg-red-950/20 border border-red-900/50 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertOctagon className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-red-400">Crash Terdeteksi</h1>
                <p className="text-red-300/70 mt-1">Aplikasi Frontend mengalami runtime error.</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-5 border border-red-900/30 font-mono text-sm overflow-x-auto space-y-4">
              <div>
                <h3 className="text-red-400 font-bold mb-2">Message:</h3>
                <p className="text-white bg-red-950/50 p-3 rounded-lg">{this.state.error?.toString()}</p>
              </div>
              
              {this.state.errorInfo && (
                <div>
                  <h3 className="text-red-400 font-bold mb-2">Component Stack:</h3>
                  <pre className="text-gray-400 bg-neutral-900/50 p-4 rounded-lg text-xs leading-relaxed overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <RefreshCcw className="w-5 h-5" />
                Reload Aplikasi
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
