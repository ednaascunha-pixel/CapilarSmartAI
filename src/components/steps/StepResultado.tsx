import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Scissors,
  Home,
  RefreshCw,
  Droplets,
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wind,
  Smile,
  TrendingUp,
  FileCheck,
  Search,
} from 'lucide-react';
import {
  ClientData,
  AnamneseData,
  VisualAnalysisData,
  ScoringResult,
  AiEvaluationResponse,
} from '../../types';

interface StepResultadoProps {
  client: ClientData;
  anamnese: AnamneseData;
  visual: VisualAnalysisData;
  scores: ScoringResult;
  aiInsights?: AiEvaluationResponse;
  onGenerateAiAnalysis: () => Promise<void>;
  isLoadingAi: boolean;
  onBack: () => void;
  onGoToSalonProtocol: () => void;
  onGoToHomeCare: () => void;
}

export const StepResultado: React.FC<StepResultadoProps> = ({
  client,
  anamnese,
  visual,
  scores,
  aiInsights,
  onGenerateAiAnalysis,
  isLoadingAi,
  onBack,
  onGoToSalonProtocol,
  onGoToHomeCare,
}) => {
  // Cores e ícones para cada uma das 5 necessidades
  const getNeedMeta = (key: string) => {
    switch (key) {
      case 'RECONSTRUCAO':
        return {
          icon: <Shield className="w-4 h-4 text-[#f72585]" />,
          colorClass: 'text-[#ff66b2]',
          barClass: 'bg-gradient-to-r from-[#e01e84] to-[#f72585]',
          bgLight: 'bg-[#f72585]/10 border-[#f72585]/30',
        };
      case 'NUTRICAO':
        return {
          icon: <Zap className="w-4 h-4 text-amber-400" />,
          colorClass: 'text-amber-300',
          barClass: 'bg-gradient-to-r from-amber-500 to-amber-400',
          bgLight: 'bg-amber-500/10 border-amber-500/30',
        };
      case 'HIDRATACAO':
        return {
          icon: <Droplets className="w-4 h-4 text-cyan-400" />,
          colorClass: 'text-cyan-300',
          barClass: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
          bgLight: 'bg-cyan-500/10 border-cyan-500/30',
        };
      case 'CONTROLE_FRIZZ':
        return {
          icon: <Wind className="w-4 h-4 text-violet-400" />,
          colorClass: 'text-violet-300',
          barClass: 'bg-gradient-to-r from-violet-500 to-violet-400',
          bgLight: 'bg-violet-500/10 border-violet-500/30',
        };
      case 'EQUILIBRIO_COURO':
      default:
        return {
          icon: <Smile className="w-4 h-4 text-emerald-400" />,
          colorClass: 'text-emerald-300',
          barClass: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
          bgLight: 'bg-emerald-500/10 border-emerald-500/30',
        };
    }
  };

  const getPriorityBadge = (priority: 'ALTA' | 'MEDIA' | 'BAIXA') => {
    switch (priority) {
      case 'ALTA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Prioridade Alta
          </span>
        );
      case 'MEDIA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Prioridade Média
          </span>
        );
      case 'BAIXA':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700/50 text-slate-300 border border-slate-600">
            Prioridade Baixa
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
          <Sparkles className="w-3.5 h-3.5" /> Etapa 6 • Cruzamento Inteligente de Dados
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Avaliação Técnica & Necessidades Capilares de {client.name}
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Cruzamento determinístico entre exame físico de bancada, microscopia digital, anamnese e objetivos da cliente.
        </p>
      </div>

      {/* Alerta de Dados Insuficientes (quando houver) */}
      {scores.insufficientDataWarnings && scores.insufficientDataWarnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Atenção Técnica: Dados Adicionais Recomendados</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 pl-1">
            {scores.insufficientDataWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Aviso Profissional de Conduta Cosmética (Não-Médico) */}
      <div className="p-4 rounded-2xl bg-[#0c101d] border border-[#f72585]/30 text-xs text-slate-300 flex items-start gap-3 shadow-lg">
        <ShieldCheck className="w-5 h-5 text-[#f72585] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#ff66b2] text-sm">
            Avaliação Técnica Cosmética & Consultoria Capilar
          </p>
          <p className="leading-relaxed text-slate-300">
            Esta avaliação fundamenta-se na cosmetologia capilar e na terapia de salão. Não constitui diagnóstico médico dermatológico. Em caso de lesões severas ou prurido persistente, orientar encaminhamento médico especializado.
          </p>
        </div>
      </div>

      {/* Card 1: Painel Executivo de Saúde e Necessidade Dominante */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 sm:p-7 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2338]">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Classificação Primária da Fibra
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Curvatura <span className="text-[#f72585]">{visual.curvature}</span> • {scores.damageGradeLabel}
            </h3>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>Espessura: <strong>{visual.thickness.toLowerCase()}</strong></span>
              <span>•</span>
              <span>Porosidade: <strong>{visual.porosity.toLowerCase()}</strong></span>
              <span>•</span>
              <span>Elasticidade: <strong>{visual.elasticity.toLowerCase()}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#060913] px-4 py-3 rounded-xl border border-[#1b2338]">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Índice de Saúde</span>
              <span className="text-2xl font-black text-[#f72585]">{scores.overallHealth} / 100</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/40 flex items-center justify-center font-black text-xl shadow-[0_0_12px_rgba(247,37,133,0.25)]">
              {scores.healthGrade}
            </div>
          </div>
        </div>

        {/* Destaque da Necessidade Dominante & Secundárias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-[#12182b] to-[#070a14] border border-[#f72585]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f72585] flex items-center gap-1.5">
                <Flame className="w-4 h-4" /> Necessidade Principal Identificada
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f72585] text-white">
                Foco Imediato
              </span>
            </div>
            <h4 className="text-lg font-black text-white">
              {scores.dominantNeedLabel}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {scores.recommendedTreatmentObjective}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#060913] border border-[#1b2338] space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Necessidades Secundárias
              </span>
              {scores.secondaryNeeds && scores.secondaryNeeds.length > 0 ? (
                <div className="space-y-1">
                  {scores.secondaryNeeds.map((sec, idx) => (
                    <div key={idx} className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f72585]" />
                      <span>{sec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400">Nenhuma necessidade secundária urgente identificada.</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 pt-2 border-t border-[#182136]">
              Ajustadas no cronograma contínuo.
            </span>
          </div>
        </div>

        {/* As 5 Necessidades Capilares Detalhadas (0 a 100) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#f72585]" /> Índice das 5 Necessidades Capilares (0 a 100)
            </h4>
            <span className="text-[11px] text-slate-400">Pesos: Fibra (40%) • Aparelho (25%) • Anamnese (20%) • Objetivos (15%)</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {scores.needsList?.map((need) => {
              const meta = getNeedMeta(need.key);
              const isDominant = scores.dominantNeed === need.key;

              return (
                <div
                  key={need.key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDominant
                      ? 'bg-[#141b2e] border-[#f72585] shadow-[0_0_12px_rgba(247,37,133,0.18)]'
                      : 'bg-[#060913] border-[#1a2338]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${meta.bgLight}`}>{meta.icon}</div>
                      <div>
                        <span className="text-xs font-bold text-white">{need.label}</span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline ml-2">• {need.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {getPriorityBadge(need.priority)}
                      <span className={`text-sm font-black ${meta.colorClass} min-w-[42px] text-right`}>
                        {need.score}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full h-2 rounded-full bg-[#0a0f1d] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.barClass} transition-all duration-500`}
                      style={{ width: `${need.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card 2: Principais Evidências & Justificativa Técnica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Principais Evidências Encontradas */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#1b2338] pb-3">
            <Search className="w-4 h-4 text-[#f72585]" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Principais Evidências Encontradas
            </h4>
          </div>

          <div className="space-y-2.5">
            {scores.keyEvidences && scores.keyEvidences.length > 0 ? (
              scores.keyEvidences.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#f72585] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{ev}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Nenhuma anomalia crítica identificada.</p>
            )}
          </div>
        </div>

        {/* Justificativa Técnica em Linguagem Simples */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#1b2338] pb-3">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Justificativa Técnica da Prioridade
              </h4>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#060913] border border-[#1a2338] text-xs text-slate-200 leading-relaxed space-y-2">
              <p>{scores.technicalJustification}</p>
            </div>
          </div>

          {visual.professionalObservations && (
            <div className="pt-3 border-t border-[#182136] text-xs text-slate-400">
              <strong className="text-slate-200 block mb-1">Anotações da Bancada:</strong>
              <p className="italic">"{visual.professionalObservations}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Comparativo de Evolução Histórica (se houver avaliação anterior) */}
      {scores.evolutionComparison && scores.evolutionComparison.hasPrevious && (
        <div className="bg-[#0c101d] rounded-2xl border border-emerald-500/40 p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                Evolução Comparativa da Cliente
              </h4>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Histórico Ativo
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {scores.evolutionComparison.summary}
          </p>
          {scores.evolutionComparison.improvedNeeds && scores.evolutionComparison.improvedNeeds.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {scores.evolutionComparison.improvedNeeds.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#060913] border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                >
                  ✓ {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card 4: Parecer Inteligente (Assistente Capilar Smart IA) */}
      <div className="bg-gradient-to-br from-[#12182b] via-[#0d1222] to-[#070a14] rounded-2xl border border-[#f72585]/40 p-6 sm:p-7 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Parecer Técnico Inteligente • CAPILAR SMART IA
              </h3>
              <p className="text-[11px] sm:text-xs text-[#f72585]">
                Síntese cosmetológica gerada com base nos dados do atendimento
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerateAiAnalysis}
            disabled={isLoadingAi}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1a243d] border border-[#f72585]/40 text-xs text-slate-200 font-semibold transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto min-h-[42px] sm:min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#f72585] ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Gerando Análise...' : 'Atualizar com IA'}</span>
          </button>
        </div>

        {isLoadingAi ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#f72585] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              O modelo de Inteligência Artificial está formulando o parecer técnico e a rotina ideal...
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-200 leading-relaxed pt-2">
            <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338]">
              <p className="font-semibold text-slate-100 text-sm mb-1">Parecer da Fibra:</p>
              <p className="text-slate-300 leading-relaxed">
                {aiInsights?.summary ||
                  `A fibra capilar de ${client.name} apresenta necessidade imediata de ${scores.dominantNeedLabel.toLowerCase()}, com fragilidade decorrente do histórico e das agressões térmicas. A cutícula requer alinhamento e estabilização de pH.`}
              </p>
            </div>

            {aiInsights?.professionalInsight && (
              <div className="p-3.5 rounded-xl bg-[#13192d] border border-[#212c47] text-[#ffb3d9] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#f72585] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Dica Prática para a Bancada:</strong>
                  <span>{aiInsights.professionalInsight}</span>
                </div>
              </div>
            )}

            {aiInsights?.activeIngredients && aiInsights.activeIngredients.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Ativos Cosméticos Recomendados para esta Fibra:
                </span>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.activeIngredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#141b2e] text-[#f72585] border border-[#f72585]/30 text-xs font-medium"
                    >
                      ✓ {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Próximos Passos: Salão e Home Care */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
        <div
          onClick={onGoToSalonProtocol}
          className="p-5 sm:p-6 rounded-2xl bg-[#0c101d] border border-[#1e273d] hover:border-[#f72585] transition-all cursor-pointer group shadow-lg flex flex-col justify-between active:scale-[0.99]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#f72585]/20 text-[#f72585] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Scissors className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-[#f72585] transition-colors">
              Passo 7: Tratamento Profissional (Salão)
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Protocolo de lavatório e bancada conectado com os <strong>produtos cadastrados no salão</strong>, cronograma e timer.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#182136] flex items-center justify-between text-xs text-[#f72585] font-semibold">
            <span>Abrir Protocolo de Salão</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={onGoToHomeCare}
          className="p-5 sm:p-6 rounded-2xl bg-[#0c101d] border border-[#1e273d] hover:border-cyan-400 transition-all cursor-pointer group shadow-lg flex flex-col justify-between active:scale-[0.99]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              Passo 8: Rotina Home Care (Cliente)
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Guia de cuidados residenciais com produtos cadastrados, modo de uso e calendário semanal personalizado.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#182136] flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>Abrir Guia Home Care</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] border border-[#1f283d] text-slate-300 text-sm font-semibold transition-colors cursor-pointer w-full sm:w-auto min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Pontuação</span>
        </button>

        <button
          id="btn-advance-to-treatment"
          type="button"
          onClick={onGoToSalonProtocol}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer w-full sm:w-auto min-h-[48px] border border-[#ff66b2]/40"
        >
          <span>Avançar para Tratamento Profissional</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
