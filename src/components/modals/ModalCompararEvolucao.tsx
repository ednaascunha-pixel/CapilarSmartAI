import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  FileText,
  Target,
  Eye,
  Microscope,
  HelpCircle,
} from 'lucide-react';
import { FullEvaluationRecord } from '../../types';
import { compareEvaluations } from '../../utils/evolutionComparator';

interface ModalCompararEvolucaoProps {
  isOpen: boolean;
  onClose: () => void;
  clientEvaluations: FullEvaluationRecord[];
  allEvaluations: FullEvaluationRecord[];
  initialRecordA?: FullEvaluationRecord | null;
  initialRecordB?: FullEvaluationRecord | null;
}

export const ModalCompararEvolucao: React.FC<ModalCompararEvolucaoProps> = ({
  isOpen,
  onClose,
  clientEvaluations,
  allEvaluations,
  initialRecordA,
  initialRecordB,
}) => {
  // STRICT DATA ISOLATION:
  // We identify the target client ID from initialRecordB or initialRecordA or clientEvaluations.
  // We NEVER allow mixing evaluations from different clients.
  const targetClientId =
    initialRecordB?.clientId ||
    initialRecordA?.clientId ||
    (clientEvaluations.length > 0 ? clientEvaluations[0].clientId : '');

  // Filter ONLY evaluations from this client
  const targetClientEvaluations = (
    clientEvaluations.length > 0
      ? clientEvaluations
      : allEvaluations.filter((e) => e.clientId === targetClientId)
  ).filter((e) => !targetClientId || e.clientId === targetClientId);

  // Sort by date ascending (oldest first)
  const sortedClientEvals = [...targetClientEvaluations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const defaultA =
    initialRecordA && initialRecordA.clientId === targetClientId
      ? initialRecordA
      : sortedClientEvals.length >= 2
      ? sortedClientEvals[0]
      : sortedClientEvals[0] || null;

  const defaultB =
    initialRecordB && initialRecordB.clientId === targetClientId
      ? initialRecordB
      : sortedClientEvals.length >= 2
      ? sortedClientEvals[sortedClientEvals.length - 1]
      : sortedClientEvals[0] || null;

  const [recordAId, setRecordAId] = useState<string>(defaultA?.id || '');
  const [recordBId, setRecordBId] = useState<string>(defaultB?.id || '');

  useEffect(() => {
    if (defaultA?.id) setRecordAId(defaultA.id);
    if (defaultB?.id) setRecordBId(defaultB.id);
  }, [defaultA?.id, defaultB?.id]);

  if (!isOpen) return null;

  const recordA = sortedClientEvals.find((e) => e.id === recordAId) || defaultA;
  const recordB = sortedClientEvals.find((e) => e.id === recordBId) || defaultB;

  // Single evaluation edge case for this client:
  if (!recordB) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 max-w-md text-center space-y-4">
          <p className="text-slate-300 text-sm">
            Nenhuma avaliação encontrada para esta cliente.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#141b2e] hover:bg-[#1f2942] rounded-xl text-xs text-white font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Is this the first/single evaluation for this client?
  const isSingleEvaluation = sortedClientEvals.length <= 1 || recordA?.id === recordB.id;

  // Generate comparison report using technical evolution engine
  const report = isSingleEvaluation
    ? compareEvaluations(recordB, null)
    : compareEvaluations(recordB, recordA);

  const healthDiff = report.overallHealthDiff?.difference ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#1b2338] flex items-center justify-between bg-gradient-to-r from-[#141b2e] via-[#0c101d] to-[#0c101d] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] shadow-[0_0_12px_rgba(247,37,133,0.25)] flex-shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f72585]/10 text-[#f72585] text-[10px] font-bold tracking-wider uppercase mb-1 border border-[#f72585]/30">
                <Sparkles className="w-3 h-3" /> Histórico & Evolução Capilar • Prontuário Independente
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Acompanhamento da Fibra • {report.clientName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#141b2e] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Isolation Notice Banner */}
          <div className="p-3 rounded-xl bg-[#060913] border border-[#1b2338] flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Isolamento Estrito:</strong> Exibindo exclusivamente avaliações independentes registradas para <strong>{report.clientName}</strong> (ID: {report.clientId}).
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#12192d] text-cyan-300 border border-cyan-500/20 font-medium">
              {sortedClientEvals.length} avaliação(ões) no histórico
            </span>
          </div>

          {/* If there is only 1 evaluation: Show baseline info */}
          {report.isFirstEvaluation ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#11172a] to-[#0c101d] border border-cyan-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-lg mx-auto">
                <h4 className="text-base font-bold text-white">Primeira Avaliação Registrada</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {report.message || 'Esta é a primeira avaliação capilar desta cliente no sistema. Ainda não há histórico anterior para comparação.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Data registrada: <strong>{new Date(report.currentDate || '').toLocaleDateString('pt-BR')}</strong> • Código: <span className="font-mono">{report.currentEvaluationId}</span>
                </p>
              </div>

              {/* Goal for next evaluation */}
              <div className="p-4 rounded-xl bg-[#060913] border border-[#1b2338] max-w-lg mx-auto text-left text-xs space-y-1.5">
                <span className="font-bold text-[#f72585] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Meta para a Próxima Avaliação
                </span>
                <p className="text-slate-300">
                  {report.nextReassessmentGoal || 'Reavaliar a fibra em 4 semanas para medir resposta hídrica e lipídica.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Selectors Bar for Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#060913] border border-[#1b2338]">
                {/* Avaliação A (Base) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Avaliação Anterior (Base de Comparação)</span>
                  </label>
                  <select
                    value={recordAId}
                    onChange={(e) => setRecordAId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585]"
                  >
                    {sortedClientEvals.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {new Date(ev.date).toLocaleDateString('pt-BR')} — {ev.scores.overallHealth} pts • {ev.scores.damageGrade} ({ev.scores.dominantNeed})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Avaliação B (Recente) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#f72585] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#f72585]" />
                    <span>Avaliação Atual / Recente</span>
                  </label>
                  <select
                    value={recordBId}
                    onChange={(e) => setRecordBId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0c101d] border border-[#f72585]/50 text-xs text-white focus:outline-none focus:border-[#f72585]"
                  >
                    {sortedClientEvals.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {new Date(ev.date).toLocaleDateString('pt-BR')} — {ev.scores.overallHealth} pts • {ev.scores.damageGrade} ({ev.scores.dominantNeed})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Health Score Evolution Summary Banner */}
              {recordA && recordB && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#11172a] to-[#0c101d] border border-[#1e273d] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-[#060913] border border-[#1e273d] flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Anterior</span>
                      <span className="text-xl font-black text-slate-300">{recordA.scores.overallHealth}</span>
                      <span className="text-[8px] text-slate-500 font-bold">{recordA.scores.damageGrade}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <div className="w-6 sm:w-10 h-0.5 bg-[#f72585]/40" />
                      <ArrowLeftRight className="w-4 h-4 text-[#f72585]" />
                      <div className="w-6 sm:w-10 h-0.5 bg-[#f72585]/40" />
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-[#060913] border border-[#f72585]/40 flex flex-col items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(247,37,133,0.25)]">
                      <span className="text-[9px] uppercase font-bold text-[#f72585]">Atual</span>
                      <span className="text-xl font-black text-white">{recordB.scores.overallHealth}</span>
                      <span className="text-[8px] text-[#ff80bf] font-bold">{recordB.scores.damageGrade}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end text-center sm:text-right">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                      {healthDiff > 0 ? (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-full">
                          <TrendingUp className="w-4 h-4" /> Ganho de Integridade: +{healthDiff} pontos
                        </span>
                      ) : healthDiff < 0 ? (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-full">
                          <TrendingDown className="w-4 h-4" /> Variação: {healthDiff} pontos
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-300 bg-[#141b2e] px-3 py-1.5 rounded-full border border-[#232f4a]">
                          <Activity className="w-4 h-4" /> Integridade Estável (0 pts de variação)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {report.damageGradeEvolution?.text}
                    </p>
                  </div>
                </div>
              )}

              {/* Technical Evolution Explanation Banner (Rule: non-automatic interpretation) */}
              <div className="p-4 rounded-2xl bg-[#0e1424] border border-[#1b253d] space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#f72585]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Parecer Técnico de Evolução da Fibra
                  </h4>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {report.technicalExplanation}
                </p>
              </div>

              {/* Perception vs Technical Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5 text-xs">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block">
                    1. Percepção / Relato da Cliente:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.clientPerceptionVsTechnicalEvidence.clientPerceptionSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5 text-xs">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block">
                    2. Evidência Técnica Documentada de Bancada:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.clientPerceptionVsTechnicalEvidence.technicalEvidenceSummary}
                  </p>
                </div>
              </div>

              {/* Numerical Metrics Comparison Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#f72585]" /> Demandas Capilares & Prioridades de Tratamento
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    *Menor necessidade de reconstrução = melhora na integridade
                  </span>
                </div>

                <div className="space-y-2.5">
                  {report.numericalMetrics.map((metric) => {
                    return (
                      <div
                        key={metric.key}
                        className="p-3.5 rounded-xl bg-[#060913] border border-[#1a2236] space-y-1.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{metric.label}</span>
                          </div>

                          <div className="flex items-center gap-3 font-mono self-end sm:self-auto">
                            <span className="text-slate-400">
                              {metric.previousValue}
                              {metric.unit}
                            </span>
                            <span className="text-slate-600">➔</span>
                            <span className="text-white font-bold">
                              {metric.currentValue}
                              {metric.unit}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-sans font-bold ${
                                metric.trend === 'MELHORA'
                                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                                  : metric.trend === 'NECESSIDADE_ATENCAO'
                                  ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                                  : 'text-slate-400 bg-[#141b2e]'
                              }`}
                            >
                              {metric.difference > 0 ? `+${metric.difference}` : metric.difference}
                              {metric.unit}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400">{metric.interpretationText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Physical Tests Comparison Grid (Qualitative) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f72585]" /> Testes Físicos da Fibra Capilar
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {report.qualitativeMetrics.map((q) => (
                    <div
                      key={q.key}
                      className={`p-3.5 rounded-xl bg-[#060913] border space-y-1.5 transition-all ${
                        q.trend === 'MELHORA'
                          ? 'border-emerald-500/40 bg-[#061110]'
                          : q.trend === 'NECESSIDADE_ATENCAO'
                          ? 'border-amber-500/40 bg-[#140f06]'
                          : 'border-[#1a2236]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                          {q.label}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            q.trend === 'MELHORA'
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : q.trend === 'NECESSIDADE_ATENCAO'
                              ? 'text-amber-400 bg-amber-950/60'
                              : 'text-slate-400 bg-[#12182a]'
                          }`}
                        >
                          {q.trend === 'MELHORA' ? 'Melhora' : q.trend === 'NECESSIDADE_ATENCAO' ? 'Atenção' : 'Estável'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400 line-through truncate max-w-[90px]">
                          {q.previousValue}
                        </span>
                        <span className="text-slate-600">➔</span>
                        <span className="text-white font-bold truncate flex-1">
                          {q.currentValue}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {q.interpretationText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Microscopy Comparison (if available in either evaluation) */}
              {(recordA?.visual.microscope?.deviceImage || recordB?.visual.microscope?.deviceImage) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Microscope className="w-3.5 h-3.5 text-cyan-400" /> Comparativo Visual do Microscópio Digital
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Previous image */}
                    <div className="p-3 rounded-xl bg-[#060913] border border-[#1a2338] space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 block">
                        Microscopia Anterior ({new Date(recordA.date).toLocaleDateString('pt-BR')}):
                      </span>
                      {recordA.visual.microscope?.deviceImage ? (
                        <img
                          src={recordA.visual.microscope.deviceImage}
                          alt="Microscopia Anterior"
                          className="w-full h-40 object-cover rounded-lg border border-[#1e273d]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-[#0a0f1d] border border-dashed border-[#1e273d] flex items-center justify-center text-slate-500 text-xs">
                          Sem foto na avaliação anterior
                        </div>
                      )}
                      {recordA.visual.microscope?.deviceNotes && (
                        <p className="text-[10px] text-slate-400 italic">
                          "{recordA.visual.microscope.deviceNotes}"
                        </p>
                      )}
                    </div>

                    {/* Current image */}
                    <div className="p-3 rounded-xl bg-[#060913] border border-[#1a2338] space-y-2">
                      <span className="text-[11px] font-bold text-[#f72585] block">
                        Microscopia Atual ({new Date(recordB.date).toLocaleDateString('pt-BR')}):
                      </span>
                      {recordB.visual.microscope?.deviceImage ? (
                        <img
                          src={recordB.visual.microscope.deviceImage}
                          alt="Microscopia Atual"
                          className="w-full h-40 object-cover rounded-lg border border-[#f72585]/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-40 rounded-lg bg-[#0a0f1d] border border-dashed border-[#1e273d] flex items-center justify-center text-slate-500 text-xs">
                          Sem foto na avaliação atual
                        </div>
                      )}
                      {recordB.visual.microscope?.deviceNotes && (
                        <p className="text-[10px] text-slate-400 italic">
                          "{recordB.visual.microscope.deviceNotes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Evolution Notes & Next Reassessment Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-2 text-xs">
                  <span className="font-bold text-[#f72585] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Observação da Evolução (Profissional)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {recordB.evolutionNotes ||
                      recordB.professionalNotes ||
                      'Fibra respondendo bem ao tratamento. Manter hidratação regular e proteção térmica diária.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-2 text-xs">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Próxima Avaliação (Previsão / Objetivo)
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {recordB.nextEvaluationGoal ||
                      'Reavaliar a integridade cuticular e elasticidade da fibra em aproximadamente 4 semanas.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1b2338] flex items-center justify-between bg-[#080c18] flex-shrink-0">
          <span className="text-[11px] text-slate-400">
            Uso técnico cosmético. Não substitui consulta médica dermatológica.
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_15px_rgba(247,37,133,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Concluir Análise Comparativa
          </button>
        </div>
      </div>
    </div>
  );
};
