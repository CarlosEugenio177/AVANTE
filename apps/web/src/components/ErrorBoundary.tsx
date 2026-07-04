import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-xl border border-border text-center space-y-4">
            <div className="flex justify-center text-destructive mb-4">
              <AlertTriangle size={64} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Oops! Algo deu errado.</h1>
            <p className="text-muted-foreground text-sm">
              Um erro inesperado aconteceu. Nossa equipe já foi notificada (mentira, mas estamos trabalhando nisso).
            </p>
            {this.state.error && (
              <div className="p-3 bg-secondary rounded text-left overflow-auto max-h-32 text-xs text-secondary-foreground font-mono">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Recarregar Página
            </button>
            <div className="mt-4">
              <Link to="/" onClick={() => this.setState({ hasError: false })} className="text-sm text-primary underline">
                Ou volte para o Início
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
