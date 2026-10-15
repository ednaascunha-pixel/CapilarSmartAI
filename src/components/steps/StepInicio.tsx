import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Users,
  Clock,
  Package,
  Settings,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { ClientData } from '../../types';

interface StepInicioProps {
  onStartEvaluation: () => void;
  onOpenClients: () => void;
  onOpenHistory: () => void;
  onOpenProducts: () => void;
  onOpenSettings: () => void;
  currentClient: ClientData | null;
  totalClients: number;
  totalEvaluations: number;
  enableSenacBadge?: boolean;
}

export const StepInicio: React.FC<StepInicioProps> = ({
  onStartEvaluation,
  onOpenClients,
  onOpenHistory,
  onOpenProducts,
  onOpenSettings,
  currentClient,
  totalClients,
  totalEvaluations,
  enableSenacBadge = true,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden bg-[#05070e]">
      {/* Background Cybernetic Glow & Hair Strand Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient magenta/neon pink glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-gradient-to-b from-[#ff007f]/15 via-[#f72585]/8 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#e01e84]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-[#f72585]/10 rounded-full blur-[120px]" />

        {/* Subtle Cyber Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(#f72585 1px, transparent 1px), linear-gradient(to right, #f72585 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Organic Technological Hair Strands (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.12]"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 200 C300 100, 500 500, 900 300 C1200 150, 1400 400, 1600 250"
            stroke="#f72585"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
          <path
            d="M-50 450 C350 350, 650 750, 1050 500 C1350 350, 1500 650, 1700 550"
            stroke="#e01e84"
            strokeWidth="1"
          />
          <path
            d="M100 800 C400 650, 700 850, 1100 700 C1300 600, 1500 800, 1700 720"
            stroke="#ff007f"
            strokeWidth="1"
            strokeDasharray="6 12"
          />
          {/* Luminous Micro-nodes */}
          <circle cx="500" cy="500" r="3" fill="#f72585" />
          <circle cx="900" cy="300" r="3" fill="#ff007f" />
          <circle cx="1050" cy="500" r="2.5" fill="#f72585" />
          <circle cx="700" cy="850" r="3" fill="#ff007f" />
        </svg>
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 flex flex-col items-center text-center">
        
        {/* Project Tag / SENAC Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121626] border border-[#f72585]/30 text-[#f72585] text-xs font-semibold tracking-wider mb-6 sm:mb-8 shadow-[0_0_15px_rgba(247,37,133,0.15)] animate-pulse">
          <Zap className="w-3.5 h-3.5 text-[#ff007f]" />
          <span>PROTÓTIPO PROFISSIONAL PARA BANCADA DE SALÃO</span>
          {enableSenacBadge && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 flex items-center gap-1 font-normal">
                <BookOpen className="w-3 h-3 text-[#f72585]" /> SENAC Projeto Integrador
              </span>
            </>
          )}
        </div>

        {/* Strong Brand Typography */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
            <span className="block tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              CAPILAR
            </span>
            <span className="inline-flex items-center gap-2.5 sm:gap-4 mt-1 sm:mt-2 text-[#ffffff]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                SMART
              </span>
              <span className="relative inline-block px-3 py-0.5 sm:px-4 sm:py-1 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-3xl sm:text-5xl md:text-6xl font-black shadow-[0_0_25px_rgba(247,37,133,0.5)] border border-[#ff66b2]/40 transform -skew-x-3">
                IA
              </span>
            </span>
          </h1>

          {/* Subtítulo: TECNOLOGIA + CIÊNCIA + BELEZA */}
          <div className="pt-2">
            <p className="text-xs sm:text-sm md:text-base font-bold tracking-[0.25em] sm:tracking-[0.35em] text-[#f72585] uppercase flex items-center justify-center gap-2 sm:gap-3">
              <span>TECNOLOGIA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f72585] shadow-[0_0_8px_#f72585]" />
              <span>CIÊNCIA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f72585] shadow-[0_0_8px_#f72585]" />
              <span>BELEZA</span>
            </p>
          </div>
        </div>

        {/* Frase Oficial: “Tecnologia que entende o seu cabelo!” */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-lg sm:text-2xl md:text-3xl font-medium text-slate-200 tracking-tight leading-snug">
            “Tecnologia que entende o seu cabelo!”
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Avaliação cosmética avançada com cálculo tricológico computadorizado, matriz de danos, protocolo de bancada com temporizador e rotina personalizada de cuidados.
          </p>
        </div>

        {/* Primary CTA: INICIAR AVALIAÇÃO */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center mb-12 sm:mb-16">
          <button
            id="btn-iniciar-avaliacao-hero"
            type="button"
            onClick={onStartEvaluation}
            className="w-full sm:w-auto min-w-[260px] group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#e01e84] via-[#f72585] to-[#ff007f] text-white font-extrabold text-base tracking-wider uppercase shadow-[0_0_30px_rgba(247,37,133,0.45)] hover:shadow-[0_0_45px_rgba(247,37,133,0.7)] hover:brightness-110 active:scale-98 transition-all cursor-pointer border border-[#ff66b2]/50"
          >
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
            <span>INICIAR AVALIAÇÃO</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Selected Client Quick Indicator (if any) */}
        {currentClient && (
          <div className="mb-10 p-3.5 sm:p-4 rounded-2xl bg-[#0c101d]/90 border border-[#f72585]/30 flex items-center justify-between gap-4 max-w-lg w-full text-left shadow-[0_0_20px_rgba(247,37,133,0.1)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e01e84] to-[#f72585] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
                {currentClient.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#f72585] uppercase tracking-wider">Cliente Selecionada na Bancada</p>
                <p className="text-sm font-bold text-white truncate">{currentClient.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentClient.phone || 'Sem telefone registrado'}</p>
              </div>
            </div>
            <button
              onClick={onStartEvaluation}
              className="px-3.5 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#202b45] text-xs font-semibold text-white border border-[#2b3754] hover:border-[#f72585]/50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Technology Architecture Highlights (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left mb-12">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-[#0c101d]/90 border border-[#1e273d] hover:border-[#f72585]/40 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f72585]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] mb-3.5">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
              Tricologia Computacional
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mapeamento de curvatura (1A a 4C), espessura, elasticidade de córtex e teste hidrostático de porosidade cuticular.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-[#0c101d]/90 border border-[#1e273d] hover:border-[#f72585]/40 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f72585]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] mb-3.5">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
              Matriz H-N-R Sob Medida
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algoritmo de ponderação que calcula a porcentagem exata necessária de Hidratação, Nutrição e Reconstrução para cada fibra.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-[#0c101d]/90 border border-[#1e273d] hover:border-[#f72585]/40 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f72585]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] mb-3.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
              Protocolo & Home Care
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sequência de lavatório com temporizador de pausa integrado, prescrição para o lar e acompanhamento no prontuário.
            </p>
          </div>
        </div>

        {/* Direct Action Hub Grid (4 Fast Navigation Tiles) */}
        <div className="w-full">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 text-center sm:text-left">
            Módulos Rápidos do Sistema
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={onOpenClients}
              className="p-3.5 rounded-xl bg-[#0c101d] border border-[#1e273d] hover:border-[#f72585]/50 text-left transition-all hover:bg-[#11172a] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-[#f72585]" />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#f72585]">
                  {totalClients} cad.
                </span>
              </div>
              <p className="text-xs font-bold text-white">Clientes</p>
              <p className="text-[11px] text-slate-400">Banco de clientes</p>
            </button>

            <button
              onClick={onOpenHistory}
              className="p-3.5 rounded-xl bg-[#0c101d] border border-[#1e273d] hover:border-[#f72585]/50 text-left transition-all hover:bg-[#11172a] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-4 h-4 text-[#f72585]" />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-[#f72585]">
                  {totalEvaluations} aval.
                </span>
              </div>
              <p className="text-xs font-bold text-white">Prontuários</p>
              <p className="text-[11px] text-slate-400">Histórico salvo</p>
            </button>

            <button
              onClick={onOpenProducts}
              className="p-3.5 rounded-xl bg-[#0c101d] border border-[#1e273d] hover:border-[#f72585]/50 text-left transition-all hover:bg-[#11172a] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <Package className="w-4 h-4 text-[#f72585]" />
                <span className="text-[10px] font-bold text-[#f72585]">Catálogo</span>
              </div>
              <p className="text-xs font-bold text-white">Produtos</p>
              <p className="text-[11px] text-slate-400">Estoque & Home Care</p>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-3.5 rounded-xl bg-[#0c101d] border border-[#1e273d] hover:border-[#f72585]/50 text-left transition-all hover:bg-[#11172a] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <Settings className="w-4 h-4 text-[#f72585]" />
                <span className="text-[10px] font-bold text-slate-400">Diretrizes</span>
              </div>
              <p className="text-xs font-bold text-white">Configurações</p>
              <p className="text-[11px] text-slate-400">Dados do salão</p>
            </button>
          </div>
        </div>

        {/* Security, Ethical & Medical Notice */}
        <div className="mt-10 p-3.5 sm:p-4 rounded-xl bg-[#0a0e1a]/80 border border-[#1a2236] max-w-3xl text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#f72585]" />
            <span>Aviso Ético e Profissional de Avaliação Capilar</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            O <strong>CAPILAR SMART IA</strong> é uma ferramenta profissional de avaliação cosmética e recomendação de cuidados para profissionais cabeleireiros. O sistema <strong>não realiza diagnóstico médico ou dermatológico</strong>. Diante de alterações patológicas no couro cabeludo (como feridas, infecções fúngicas, descamação atípica ou alopecias cicatriciais), oriente a cliente a consultar um médico dermatologista ou tricologista habilitado.
          </p>
        </div>

      </div>
    </div>
  );
};
