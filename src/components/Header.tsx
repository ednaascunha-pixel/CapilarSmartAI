import React from 'react';
import { Sparkles, UserCheck, Plus, Clock, BookOpen, Package, Settings, Home } from 'lucide-react';
import { ClientData, FlowStep } from '../types';

interface HeaderProps {
  currentClient: ClientData | null;
  currentStep: FlowStep;
  onGoHome: () => void;
  onNewEvaluation: () => void;
  onOpenHistory: () => void;
  onSelectClient: () => void;
  onOpenProducts: () => void;
  onOpenSettings: () => void;
  salonName?: string;
  enableSenacBadge?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentClient,
  currentStep,
  onGoHome,
  onNewEvaluation,
  onOpenHistory,
  onSelectClient,
  onOpenProducts,
  onOpenSettings,
  salonName = 'Espaço Capilar & Beleza',
  enableSenacBadge = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#05070e]/95 backdrop-blur-md border-b border-[#1c2438] px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        {/* Top Row: Logo & Brand Identity */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 sm:gap-3.5 text-left group cursor-pointer"
            title="Ir para a Tela Inicial"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-[#ff007f] via-[#f72585] to-[#7209b7] p-[1.5px] shadow-[0_0_15px_rgba(247,37,133,0.35)] flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_22px_rgba(247,37,133,0.6)] transition-all">
              <div className="h-full w-full bg-[#080c18] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#f72585]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  CAPILAR SMART{' '}
                  <span className="text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-[#e01e84] to-[#f72585] shadow-[0_0_10px_rgba(247,37,133,0.5)] tracking-wider">
                    IA
                  </span>
                </h1>
                {enableSenacBadge && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-[#111728] text-slate-300 border border-[#222f4d]">
                    <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#f72585]" /> SENAC • Projeto Integrador
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block truncate max-w-xl">
                "Tecnologia que entende o seu cabelo!" • TECNOLOGIA + CIÊNCIA + BELEZA
              </p>
            </div>
          </button>
        </div>

        {/* Action Controls: Touch-friendly on mobile & tablet */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[#141b2e] overflow-x-auto no-scrollbar">
          {/* Home Button */}
          <button
            id="header-btn-home"
            onClick={onGoHome}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs transition-colors cursor-pointer min-h-[38px] flex-shrink-0 ${
              currentStep === 'INICIO'
                ? 'bg-[#151b2e] text-[#f72585] border-[#f72585]/50 shadow-[0_0_10px_rgba(247,37,133,0.2)]'
                : 'bg-[#0b0f1d] hover:bg-[#13192c] border-[#1d2740] text-slate-300'
            }`}
            title="Tela Inicial com apresentação da marca"
          >
            <Home className="w-3.5 h-3.5 text-[#f72585]" />
            <span className="text-[11px] sm:text-xs hidden sm:inline">Início</span>
          </button>

          {/* Client badge */}
          {currentClient ? (
            <button
              id="header-client-badge"
              onClick={onSelectClient}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0b0f1d] hover:bg-[#13192c] border border-[#1d2740] hover:border-[#f72585]/50 text-xs transition-colors cursor-pointer min-h-[38px] flex-shrink-0"
              title="Trocar ou editar cliente selecionado"
            >
              <div className="w-6 h-6 rounded-full bg-[#f72585]/20 text-[#f72585] flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                {currentClient.name.charAt(0) || 'C'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-slate-200 font-medium truncate max-w-[80px] sm:max-w-[120px] md:max-w-[140px] leading-tight text-[11px] sm:text-xs">
                  {currentClient.name || 'Nova Cliente'}
                </p>
                <p className="text-[9px] text-[#f72585] flex items-center gap-0.5">
                  <UserCheck className="w-2.5 h-2.5 flex-shrink-0" /> <span className="truncate">Em avaliação</span>
                </p>
              </div>
            </button>
          ) : (
            <button
              id="header-client-badge"
              onClick={onSelectClient}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0b0f1d] hover:bg-[#13192c] border border-dashed border-[#293757] text-xs text-slate-300 transition-colors cursor-pointer min-h-[38px] flex-shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] sm:text-xs">Clientes</span>
            </button>
          )}

          {/* Produtos Button */}
          <button
            id="header-btn-products"
            onClick={onOpenProducts}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0b0f1d] hover:bg-[#13192c] border border-[#1d2740] hover:border-[#f72585]/50 text-xs text-slate-200 transition-colors cursor-pointer min-h-[38px] flex-shrink-0"
            title="Cadastro e Gestão de Produtos do Salão e Home Care"
          >
            <Package className="w-3.5 h-3.5 text-[#f72585]" />
            <span className="text-[11px] sm:text-xs hidden md:inline">Produtos</span>
          </button>

          {/* Settings Button */}
          <button
            id="header-btn-settings"
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0b0f1d] hover:bg-[#13192c] border border-[#1d2740] hover:border-[#f72585]/50 text-xs text-slate-200 transition-colors cursor-pointer min-h-[38px] flex-shrink-0"
            title="Configurações do Salão & Diretrizes"
          >
            <Settings className="w-3.5 h-3.5 text-[#f72585]" />
            <span className="text-[11px] sm:text-xs hidden md:inline">Ajustes</span>
          </button>

          {/* History Button */}
          <button
            id="header-btn-history"
            onClick={onOpenHistory}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0b0f1d] hover:bg-[#13192c] border border-[#1d2740] hover:border-[#f72585]/50 text-xs text-slate-200 transition-colors cursor-pointer min-h-[38px] flex-shrink-0"
            title="Ver histórico de prontuários salvos"
          >
            <Clock className="w-3.5 h-3.5 text-[#f72585]" />
            <span className="text-[11px] sm:text-xs">Histórico</span>
          </button>

          {/* New Evaluation Button */}
          <button
            id="header-btn-new-eval"
            onClick={onNewEvaluation}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_18px_rgba(247,37,133,0.35)] hover:shadow-[0_0_25px_rgba(247,37,133,0.55)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[38px] flex-shrink-0 whitespace-nowrap border border-[#ff66b2]/40"
            title="Iniciar uma nova avaliação na bancada"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="text-[11px] sm:text-xs">Nova Avaliação</span>
          </button>
        </div>
      </div>
    </header>
  );
};
