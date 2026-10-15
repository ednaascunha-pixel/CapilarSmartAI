import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Preserva no console do desenvolvedor para depuração sem expor stack trace na UI
    console.error('ErrorBoundary capturou erro de renderização:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070e] text-slate-100 flex items-center justify-center p-4">
          <div className="bg-[#0c101d] rounded-2xl border border-[#232f48] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#f72585]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] shadow-[0_0_15px_rgba(247,37,133,0.2)] flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider block">
                  CAPILAR SMART IA • SEGURANÇA DO SISTEMA
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Ocorreu um erro inesperado
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O aplicativo identificou uma inconsistência durante a renderização desta visualização.
              Seus dados de clientes e avaliações permanecem protegidos e preservados.
            </p>

            <div className="p-3.5 rounded-xl bg-[#060913] border border-[#1b2438] text-xs text-slate-400 space-y-1">
              <span className="text-[11px] font-semibold text-slate-300 block">
                O que você pode fazer agora:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Tentar carregar a etapa novamente;</li>
                <li>Retornar à tela inicial do sistema para retomar a navegação.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] text-slate-200 text-xs font-semibold border border-[#232f48] transition-all cursor-pointer min-h-[42px]"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Retornar ao Início</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-xs font-bold shadow-[0_0_15px_rgba(247,37,133,0.35)] hover:brightness-110 transition-all cursor-pointer min-h-[42px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
