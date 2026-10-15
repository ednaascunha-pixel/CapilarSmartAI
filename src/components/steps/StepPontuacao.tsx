import React from 'react';
import { Award, Droplets, Zap, Shield, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { ScoringResult, VisualAnalysisData, AnamneseData } from '../../types';

interface StepPontuacaoProps {
  scores: ScoringResult;
  visual: VisualAnalysisData;
  anamnese: AnamneseData;
  onBack: () => void;
  onContinue: () => void;
}

export const StepPontuacao: React.FC<StepPontuacaoProps> = ({
  scores,
  visual,
  anamnese,
  onBack,
  onContinue,
}) => {
  // Color configuration based on health
  const getHealthBadge = (health: number) => {
    if (health >= 80) return { label: 'Excelente / Saudável', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    if (health >= 60) return { label: 'Moderado / Atenção', color: 'text-amber-300 bg-amber-950/60 border-amber-800' };
    if (health >= 40) return { label: 'Danificado / Tratamento Urgente', color: 'text-[#ff66b2] bg-[#2a0e20] border-[#f72585]/40' };
    return { label: 'Crítico / Perda de Massa Extrema', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
  };

  const badge = getHealthBadge(scores.overallHealth);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
          <Award className="w-3.5 h-3.5" /> Etapa 5 • Pontuação & Índice Capilar
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Cálculo Inteligente de Saúde & Necessidades
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Algoritmo cosmetológico avançado baseado nos parâmetros profissionais de avaliação capilar.
        </p>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-gradient-to-br from-[#12182b] via-[#0d1222] to-[#070a14] rounded-2xl border border-[#1e273d] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center">
          {/* Gauge Ring */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#161d30"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#magentaGaugeGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * scores.overallHealth) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="magentaGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e01e84" />
                    <stop offset="100%" stopColor="#f72585" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {scores.overallHealth}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Pontos de 100
                </span>
              </div>
            </div>

            <span className={`mt-3 text-xs px-3 py-1 rounded-full border font-semibold ${badge.color}`}>
              {badge.label}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Índice Global de Saúde Capilar</p>
          </div>

          {/* Breakdown Needs Bars */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Necessidades Identificadas no Cronograma
            </h3>

            {/* Hidratação */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs gap-2">
                <span className="text-slate-300 font-medium flex items-center gap-1.5 truncate">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Hidratação (H₂O / Água)</span>
                </span>
                <span className="font-bold text-cyan-300 flex-shrink-0">{scores.hydrationNeed}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#161d30] overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${scores.hydrationNeed}%` }}
                />
              </div>
            </div>

            {/* Nutrição */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs gap-2">
                <span className="text-slate-300 font-medium flex items-center gap-1.5 truncate">
                  <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Nutrição (Lipídios / Óleos)</span>
                </span>
                <span className="font-bold text-amber-300 flex-shrink-0">{scores.nutritionNeed}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#161d30] overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${scores.nutritionNeed}%` }}
                />
              </div>
            </div>

            {/* Reconstrução */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs gap-2">
                <span className="text-slate-300 font-medium flex items-center gap-1.5 truncate">
                  <Shield className="w-3.5 h-3.5 text-[#f72585] flex-shrink-0" />
                  <span>Reconstrução (Proteína / Massa)</span>
                </span>
                <span className="font-bold text-[#ff66b2] flex-shrink-0">{scores.reconstructionNeed}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#161d30] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e01e84] to-[#f72585] rounded-full transition-all duration-700"
                  style={{ width: `${scores.reconstructionNeed}%` }}
                />
              </div>
            </div>

            {/* Controle de Frizz */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs gap-2">
                <span className="text-slate-300 font-medium flex items-center gap-1.5 truncate">
                  <Droplets className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  <span>Controle de Frizz & Alinhamento</span>
                </span>
                <span className="font-bold text-violet-300 flex-shrink-0">{scores.frizzControlNeed ?? 0}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#161d30] overflow-hidden">
                <div
                  className="h-full bg-violet-400 rounded-full transition-all duration-700"
                  style={{ width: `${scores.frizzControlNeed ?? 0}%` }}
                />
              </div>
            </div>

            {/* Couro Cabeludo */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs gap-2">
                <span className="text-slate-300 font-medium flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Equilíbrio do Couro Cabeludo</span>
                </span>
                <span className="font-bold text-emerald-300 flex-shrink-0">{scores.scalpBalanceNeed ?? 0}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#161d30] overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${scores.scalpBalanceNeed ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Damage Grade Banner */}
        <div className="mt-6 pt-5 border-t border-[#1a2338] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Avaliação da Estrutura:</span>
            <p className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span className="text-[#f72585]">{scores.damageGradeLabel}</span>
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-[#060913] border border-[#1f2940] text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Foco Principal Imediato:</span>
            <span className="text-sm font-bold text-[#f72585]">
              {scores.dominantNeedLabel?.toUpperCase() || (scores.dominantNeed === 'RECONSTRUCAO' ? 'RECONSTRUÇÃO PROTEICA' : scores.dominantNeed === 'NUTRICAO' ? 'REPOSIÇÃO LIPÍDICA' : scores.dominantNeed === 'CONTROLE_FRIZZ' ? 'CONTROLE DE FRIZZ' : scores.dominantNeed === 'EQUILIBRIO_COURO' ? 'EQUILÍBRIO DO COURO' : 'HIDRATAÇÃO HÍDRICA')}
            </span>
          </div>
        </div>
      </div>

      {/* Rationale & Factor Audit */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#f72585]" /> Justificativa Cosmetológica da Pontuação
        </h3>
        <p className="text-xs text-slate-400">
          Entenda quais fatores levantados na Anamnese e no Exame Visual influenciaram a pontuação da cliente:
        </p>

        <div className="space-y-2">
          {scores.scoreRationale.map((reason, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#060913] border border-[#1b2338] flex items-start gap-3 text-xs text-slate-300"
            >
              <div className="w-5 h-5 rounded-full bg-[#f72585]/20 text-[#f72585] flex items-center justify-center font-bold flex-shrink-0 text-[10px] mt-0.5 shadow-[0_0_6px_rgba(247,37,133,0.3)]">
                {idx + 1}
              </div>
              <p className="leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] border border-[#1f283d] text-slate-300 text-sm font-semibold transition-colors cursor-pointer w-full sm:w-auto min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Análise Visual</span>
        </button>

        <button
          id="btn-view-results"
          type="button"
          onClick={onContinue}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer w-full sm:w-auto min-h-[48px] border border-[#ff66b2]/40"
        >
          <span>Ver Resultado da Avaliação Técnica</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
