import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  User,
  Share2,
  Printer,
  Copy,
  Check,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Trash2,
  ArrowLeftRight,
  GitCompare,
  Layers,
  CheckCircle2,
  Phone,
  FileText,
  Target,
  Save,
  RotateCcw,
  Edit3,
} from 'lucide-react';
import { FullEvaluationRecord } from '../../types';
import { ModalConfirmacao } from '../modals/ModalConfirmacao';
import { ModalCompararEvolucao } from '../modals/ModalCompararEvolucao';

interface StepHistoricoProps {
  evaluations: FullEvaluationRecord[];
  onSelectEvaluation: (evalRecord: FullEvaluationRecord) => void;
  onNewEvaluation: () => void;
  onDuplicateEvaluation: (evalId: string) => FullEvaluationRecord | undefined;
  onDeleteEvaluation: (evalId: string) => void;
  initialFilterClientId?: string;
  onCreateReassessment?: (clientId: string) => void;
  onUpdateEvaluation?: (updatedRecord: FullEvaluationRecord) => void;
  onViewReport?: (evalRecord: FullEvaluationRecord) => void;
  onEditEvaluation?: (evalRecord: FullEvaluationRecord) => void;
}

export const StepHistorico: React.FC<StepHistoricoProps> = ({
  evaluations,
  onSelectEvaluation,
  onNewEvaluation,
  onDuplicateEvaluation,
  onDeleteEvaluation,
  initialFilterClientId,
  onCreateReassessment,
  onUpdateEvaluation,
  onViewReport,
  onEditEvaluation,
}) => {
  const [clientFilterId, setClientFilterId] = useState<string | undefined>(initialFilterClientId);

  const [selectedRecord, setSelectedRecord] = useState<FullEvaluationRecord | null>(
    () => {
      if (initialFilterClientId) {
        const found = evaluations.find((e) => e.clientId === initialFilterClientId);
        if (found) return found;
        return null;
      }
      return evaluations[0] || null;
    }
  );

  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  // Modal and toast states
  const [evalToDelete, setEvalToDelete] = useState<FullEvaluationRecord | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Editable Evolution State for selectedRecord
  const [evolutionNotesInput, setEvolutionNotesInput] = useState('');
  const [nextGoalInput, setNextGoalInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (selectedRecord) {
      setEvolutionNotesInput(selectedRecord.evolutionNotes || selectedRecord.professionalNotes || '');
      setNextGoalInput(selectedRecord.nextEvaluationGoal || '');
    }
  }, [selectedRecord?.id]);

  // Keep selectedRecord synchronized if evaluations array changes (e.g. after deletion, filtering or duplication)
  useEffect(() => {
    const currentFiltered = evaluations.filter((e) => {
      if (clientFilterId && e.clientId !== clientFilterId) {
        return false;
      }
      return (
        e.clientName.toLowerCase().includes(filterName.toLowerCase()) ||
        e.id.toLowerCase().includes(filterName.toLowerCase())
      );
    });

    if (currentFiltered.length === 0) {
      setSelectedRecord(null);
      setMobileTab('list');
      return;
    }

    if (selectedRecord) {
      const stillExists = currentFiltered.find((e) => e.id === selectedRecord.id);
      if (!stillExists) {
        setSelectedRecord(currentFiltered[0] || null);
      } else {
        setSelectedRecord(stillExists);
      }
    } else {
      setSelectedRecord(currentFiltered[0] || null);
    }
  }, [evaluations, clientFilterId, filterName]);

  const filtered = evaluations
    .filter((e) => {
      if (clientFilterId && e.clientId !== clientFilterId) {
        return false;
      }
      return (
        e.clientName.toLowerCase().includes(filterName.toLowerCase()) ||
        e.id.toLowerCase().includes(filterName.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSelectRecord = (record: FullEvaluationRecord) => {
    setSelectedRecord(record);
    onSelectEvaluation(record);
    setMobileTab('detail');
  };

  const handleDuplicate = (record: FullEvaluationRecord) => {
    const newRecord = onDuplicateEvaluation(record.id);
    if (newRecord) {
      setSelectedRecord(newRecord);
      setSuccessToast(`Avaliação duplicada com sucesso! Código gerado: ${newRecord.id}`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleSaveEvolutionNotes = () => {
    if (!selectedRecord) return;
    const updated: FullEvaluationRecord = {
      ...selectedRecord,
      evolutionNotes: evolutionNotesInput,
      nextEvaluationGoal: nextGoalInput,
    };
    setSelectedRecord(updated);
    if (onUpdateEvaluation) {
      onUpdateEvaluation(updated);
    }
    setIsSavingNotes(true);
    setSuccessToast('Anotações de evolução e meta da próxima avaliação salvas com sucesso!');
    setTimeout(() => {
      setIsSavingNotes(false);
      setSuccessToast(null);
    }, 3500);
  };

  const handleDelete = () => {
    if (!evalToDelete) return;
    const deletedId = evalToDelete.id;
    onDeleteEvaluation(deletedId);

    // Pick next available respecting the active client filter
    const remaining = evaluations
      .filter((e) => e.id !== deletedId)
      .filter((e) => (!clientFilterId || e.clientId === clientFilterId));

    setSelectedRecord(remaining[0] || null);
    if (remaining.length === 0) {
      setMobileTab('list');
    }
    setEvalToDelete(null);
    setSuccessToast('Avaliação individual removida com sucesso. O cadastro da cliente foi preservado.');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const generateWhatsAppMessage = (rec: FullEvaluationRecord) => {
    const rawWeeks = rec.treatmentSchedule?.weeks || [
      rec.treatmentSchedule?.week1,
      rec.treatmentSchedule?.week2,
      rec.treatmentSchedule?.week3,
      rec.treatmentSchedule?.week4,
    ];
    const weeksList = (rawWeeks || []).filter((w): w is NonNullable<typeof w> => Boolean(w));

    const scheduleSummary = rec.treatmentSchedule && weeksList.length > 0
      ? `\n\n📅 *CRONOGRAMA DE TRATAMENTO (4 SEMANAS)*\n${weeksList
          .map(
            (w) =>
              `• *Semana ${w.weekNumber} (${w.category || w.treatmentCategory || 'Tratamento'})*: ${w.mainTreatment} - _${w.objective}_`
          )
          .join('\n')}${
          rec.treatmentSchedule.scalpGuidance?.needsAttention
            ? `\n💆‍♀️ *Couro Cabeludo*: ${rec.treatmentSchedule.scalpGuidance.cosmeticGuidance}`
            : ''
        }`
      : '';

    return `✨ *CAPILAR SMART IA - AVALIAÇÃO PERSONALIZADA* ✨
_"Da avaliação à rotina de cuidados: uma experiência capilar personalizada."_

Olá, *${rec.clientName}*! Segue o resumo do seu atendimento capilar profissional:

📋 *AVALIAÇÃO TÉCNICA CAPILAR*
• Curvatura: ${rec.visual.curvature}
• Nível de Saúde: ${rec.scores.overallHealth}/100 (${rec.scores.damageGradeLabel})
• Foco Principal: ${rec.scores.dominantNeedLabel || (rec.scores.dominantNeed === 'RECONSTRUCAO' ? 'Reconstrução Proteica' : rec.scores.dominantNeed === 'NUTRICAO' ? 'Reposição Lipídica' : 'Hidratação Hídrica')}
• Objetivo Recomendado: ${rec.scores.recommendedTreatmentObjective || 'Recuperação da fibra capilar'}

💆‍♀️ *TRATAMENTO PROFISSIONAL REALIZADO NO SALÃO*
• Protocolo: ${rec.salonProtocol.protocolName}
• Ativos: ${rec.salonProtocol.activeIngredients.slice(0, 3).join(', ')}${scheduleSummary}

🏡 *SEU GUIA HOME CARE (ROTINA EM CASA)*
1. Shampoo: ${rec.homeCare.shampooRecommendation}
2. Máscara: ${rec.homeCare.treatmentMask}
3. Condicionador: ${rec.homeCare.conditionerRecommendation}
4. Leave-in: ${rec.homeCare.leaveInThermalProtector}
5. Finalizador: ${rec.homeCare.oilFinisher}

⚠️ *Aviso Ético:* Avaliação cosmética e profissional capilar. Não substitui consulta médica dermatológica.`;
  };

  const copyToClipboard = (rec: FullEvaluationRecord) => {
    const text = generateWhatsAppMessage(rec);
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Evaluations for the currently selected client (for evolution comparison)
  const clientEvals = selectedRecord
    ? evaluations.filter((e) => e.clientId === selectedRecord.clientId)
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-4 sm:p-6 shadow-xl relative overflow-hidden no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
              <History className="w-3.5 h-3.5" /> Etapa 9 • Histórico, Evolução & Gestão de Avaliações
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Prontuário Técnico & Comparativo de Evolução
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Gerencie cada avaliação salva: visualize a ficha, compare a evolução ao longo do tempo, duplique para novos ciclos ou exclua registros com segurança.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap sm:flex-nowrap">
            {evaluations.length >= 2 && (
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#151c2e] hover:bg-[#1e2740] border border-[#273656] text-cyan-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                <span>Comparar Evolução ({clientEvals.length >= 2 ? `${clientEvals.length} da cliente` : `${evaluations.length} total`})</span>
              </button>
            )}

            <button
              onClick={onNewEvaluation}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-h-[44px] border border-[#ff66b2]/40"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Avaliação Limpa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-[#0c101d] p-1 rounded-xl border border-[#1e273d] no-print">
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all min-h-[42px] flex items-center justify-center gap-1.5 ${
            mobileTab === 'list'
              ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white shadow-[0_0_10px_rgba(247,37,133,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Lista de Avaliações ({filtered.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all min-h-[42px] flex items-center justify-center gap-1.5 ${
            mobileTab === 'detail'
              ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white shadow-[0_0_10px_rgba(247,37,133,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Ficha Técnica Detalhada</span>
        </button>
      </div>

      {/* Filtered Client Banner (Prontuário Individual) */}
      {clientFilterId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#0c101d] border border-[#f72585]/30 text-xs text-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f72585] animate-pulse" />
            <span>
              <strong>Prontuário Individual Ativo:</strong> Exibindo histórico exclusivo desta cliente ({filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setClientFilterId(undefined);
              if (!selectedRecord && evaluations.length > 0) {
                setSelectedRecord(evaluations[0]);
              }
            }}
            className="text-xs font-semibold text-[#f72585] hover:underline cursor-pointer"
          >
            Remover filtro e ver todos os clientes
          </button>
        </div>
      )}

      {/* Main Grid: Left list of evaluations, Right detailed sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Saved List */}
        <div className={`space-y-4 no-print ${mobileTab === 'detail' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-4 space-y-3">
            <input
              type="text"
              placeholder="Filtrar por nome da cliente ou código..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl bg-[#060913] border border-[#1f283e] text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585] min-h-[44px]"
            />

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filtered.map((record) => {
                const isSelected = selectedRecord?.id === record.id;
                return (
                  <div
                    key={record.id}
                    onClick={() => handleSelectRecord(record)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[74px] ${
                      isSelected
                        ? 'bg-[#151b2e] border-[#f72585] ring-1 ring-[#f72585] shadow-[0_0_12px_rgba(247,37,133,0.2)]'
                        : 'bg-[#060913] border-[#182136] hover:bg-[#0f1424] hover:border-[#f72585]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white leading-tight truncate">
                          {record.clientName}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span>{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#f72585] bg-[#f72585]/10 px-2 py-0.5 rounded-md border border-[#f72585]/30 flex-shrink-0">
                        {record.scores.overallHealth} pts
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#182136] flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Curvatura {record.visual.curvature}</span>
                      <span className="text-[#f72585] font-medium truncate max-w-[120px]">
                        {record.scores.dominantNeed}
                      </span>
                    </div>

                    {/* Quick action buttons on list card */}
                    <div className="mt-2 pt-2 border-t border-[#141b2e] flex items-center justify-end gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(record);
                        }}
                        title="Duplicar esta avaliação"
                        className="p-1 px-2 rounded bg-[#101524] hover:bg-[#182138] text-slate-300 hover:text-white border border-[#1f283d] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3 text-[#f72585]" />
                        <span>Duplicar</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvalToDelete(record);
                        }}
                        title="Excluir esta avaliação"
                        className="p-1 px-2 rounded bg-[#1a0f16] hover:bg-[#281320] text-red-400 hover:text-red-300 border border-red-500/30 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-8 px-3 text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-300">
                    {clientFilterId
                      ? 'Esta cliente ainda não possui uma avaliação registrada.'
                      : `Nenhuma avaliação encontrada com o filtro "${filterName}".`}
                  </p>
                  {clientFilterId && (
                    <button
                      type="button"
                      onClick={onNewEvaluation}
                      className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-xs font-semibold shadow-[0_0_10px_rgba(247,37,133,0.3)] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Iniciar Avaliação
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detailed Record Sheet */}
        <div className={`lg:col-span-2 ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          {selectedRecord ? (
            <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-5 sm:p-8 space-y-6 shadow-2xl print-container">
              {/* Back to list on mobile */}
              <button
                type="button"
                onClick={() => setMobileTab('list')}
                className="lg:hidden flex items-center gap-1.5 text-xs text-[#f72585] font-semibold mb-1 cursor-pointer"
              >
                <span>← Voltar para lista de avaliações</span>
              </button>

              {/* Sheet Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2338]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-white">
                      {selectedRecord.clientName}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f72585]/10 text-[#f72585] border border-[#f72585]/40 font-semibold shadow-[0_0_8px_rgba(247,37,133,0.15)]">
                      Curvatura {selectedRecord.visual.curvature}
                    </span>
                    {clientEvals.length > 1 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-medium">
                        {clientEvals.length} avaliações da cliente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Atendimento em: {new Date(selectedRecord.date).toLocaleDateString('pt-BR')} às {new Date(selectedRecord.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">ID: {selectedRecord.id}</span>
                  </p>
                </div>

                {/* Print, WhatsApp, Reavaliar, Duplicate & Delete Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 no-print">
                  {onViewReport && (
                    <button
                      onClick={() => onViewReport(selectedRecord)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a243c] border border-[#f72585]/40 text-[#f72585] text-xs font-bold shadow-[0_0_10px_rgba(247,37,133,0.15)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[42px]"
                      title="Abrir o Relatório Profissional completo desta avaliação"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Relatório</span>
                    </button>
                  )}

                  {onEditEvaluation && (
                    <button
                      onClick={() => onEditEvaluation(selectedRecord)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#10192d] hover:bg-[#17233f] border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[42px]"
                      title="Reabrir esta avaliação para edição mantendo o mesmo ID"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Editar Avaliação</span>
                    </button>
                  )}

                  {onCreateReassessment && (
                    <button
                      onClick={() => onCreateReassessment(selectedRecord.clientId)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-xs font-bold shadow-[0_0_12px_rgba(247,37,133,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[42px] border border-[#ff80bf]/30"
                      title="Iniciar nova avaliação desta cliente preservando este registro anterior intacto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reavaliar Cliente</span>
                    </button>
                  )}

                  {clientEvals.length >= 2 && (
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#101828] hover:bg-[#18243c] border border-cyan-500/40 text-xs font-semibold text-cyan-300 transition-colors cursor-pointer min-h-[42px]"
                      title="Comparar evolução com avaliações anteriores"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Comparar</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDuplicate(selectedRecord)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] border border-[#232f4a] text-xs font-semibold text-slate-200 transition-colors cursor-pointer min-h-[42px]"
                    title="Duplicar esta avaliação gerando novo ID e data atual"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#f72585]" />
                    <span>Duplicar</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(selectedRecord)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] border border-[#232f4a] text-xs font-semibold text-slate-200 transition-colors cursor-pointer min-h-[42px]"
                    title="Copiar mensagem formatada para WhatsApp"
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#f72585]" />
                        <span>WhatsApp</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] border border-[#232f4a] text-xs font-semibold text-slate-200 transition-colors cursor-pointer min-h-[42px]"
                    title="Imprimir prontuário da cliente"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-300" />
                    <span>Imprimir</span>
                  </button>

                  <button
                    onClick={() => setEvalToDelete(selectedRecord)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1a0f16] hover:bg-[#281320] border border-red-500/30 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer min-h-[42px]"
                    title="Excluir individualmente esta avaliação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              {/* Score Highlight Box (5 Needs) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-[#060913] border border-[#1a2236]">
                <div className="text-center p-2 col-span-2 sm:col-span-1 border-b sm:border-b-0 sm:border-r border-[#1a2236]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Índice Saúde</span>
                  <span className="text-2xl font-black text-[#f72585] drop-shadow-[0_0_6px_rgba(247,37,133,0.4)]">
                    {selectedRecord.scores.overallHealth}/100
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">
                    Grau {selectedRecord.scores.healthGrade || 'B'}
                  </span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hidratação</span>
                  <span className="text-base font-bold text-cyan-400">{selectedRecord.scores.hydrationNeed}%</span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nutrição</span>
                  <span className="text-base font-bold text-amber-400">{selectedRecord.scores.nutritionNeed}%</span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reconstrução</span>
                  <span className="text-base font-bold text-[#f72585]">{selectedRecord.scores.reconstructionNeed}%</span>
                </div>
                <div className="text-center p-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Frizz</span>
                  <span className="text-base font-bold text-violet-400">{selectedRecord.scores.frizzControlNeed ?? 0}%</span>
                </div>
              </div>

              {/* Evolution Comparison Banner if Present */}
              {selectedRecord.scores.evolutionComparison?.hasPrevious && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <GitCompare className="w-4 h-4 text-emerald-400" /> Evolução em Relação à Avaliação Anterior:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCompareModalOpen(true)}
                      className="text-[11px] text-emerald-300 underline font-semibold cursor-pointer"
                    >
                      Abrir comparativo lado a lado →
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedRecord.scores.evolutionComparison.summary}</p>
                </div>
              )}

              {/* Technical Justification */}
              {selectedRecord.scores.technicalJustification && (
                <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2236] space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#f72585] text-[11px] block">
                    Justificativa Técnica do Cruzamento:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedRecord.scores.technicalJustification}
                  </p>
                </div>
              )}

              {/* Protocol Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Protocolo de Salão Aplicado
                </h4>
                <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2236] space-y-2">
                  <p className="font-semibold text-white text-sm">
                    {selectedRecord.salonProtocol.protocolName}
                  </p>
                  <p className="text-xs text-slate-300">
                    {selectedRecord.salonProtocol.targetIssue}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {selectedRecord.salonProtocol.activeIngredients.map((ing, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#13192b] text-[#f72585] border border-[#f72585]/30">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prescribed Home Care */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Prescrição Home Care (Rotina em Casa)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#060913] border border-[#1a2236]">
                    <span className="text-[11px] font-semibold text-[#f72585] block">Shampoo:</span>
                    <p className="text-slate-300 mt-0.5">{selectedRecord.homeCare.shampooRecommendation}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#060913] border border-[#1a2236]">
                    <span className="text-[11px] font-semibold text-[#f72585] block">Condicionador:</span>
                    <p className="text-slate-300 mt-0.5">{selectedRecord.homeCare.conditionerRecommendation}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#060913] border border-[#1a2236]">
                    <span className="text-[11px] font-semibold text-[#f72585] block">Máscara:</span>
                    <p className="text-slate-300 mt-0.5">{selectedRecord.homeCare.treatmentMask}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#060913] border border-[#1a2236]">
                    <span className="text-[11px] font-semibold text-[#f72585] block">Finalizador:</span>
                    <p className="text-slate-300 mt-0.5">{selectedRecord.homeCare.leaveInThermalProtector}</p>
                  </div>
                </div>
              </div>

              {/* 4-Week Capillary Schedule if Present */}
              {selectedRecord.treatmentSchedule && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#f72585]" /> Cronograma de 4 Semanas Vinculado
                    </h4>
                    <span className="text-[10px] text-[#f72585] font-semibold px-2 py-0.5 rounded bg-[#f72585]/10 border border-[#f72585]/30">
                      {selectedRecord.treatmentSchedule.status === 'VALIDADO_PROFISSIONAL'
                        ? 'Validado'
                        : selectedRecord.treatmentSchedule.status === 'AJUSTADO_PROFISSIONAL'
                        ? 'Ajustado'
                        : 'Sugerido'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {(
                      selectedRecord.treatmentSchedule.weeks || [
                        selectedRecord.treatmentSchedule.week1,
                        selectedRecord.treatmentSchedule.week2,
                        selectedRecord.treatmentSchedule.week3,
                        selectedRecord.treatmentSchedule.week4,
                      ]
                    )
                      .filter((w): w is NonNullable<typeof w> => Boolean(w))
                      .map((w) => (
                      <div
                        key={w.weekNumber}
                        className="p-3 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white">Semana {w.weekNumber}</span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#13192c] text-[#f72585] border border-[#f72585]/20">
                            {w.category || w.treatmentCategory || 'Tratamento'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium leading-snug">
                          {w.mainTreatment || 'Tratamento registrado'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          <strong>Foco:</strong> {w.objective || 'Manutenção da fibra'}
                        </p>
                        {w.weekNumber === 4 && (
                          <div className="mt-1 pt-1 border-t border-[#141b2e] text-[10px] text-[#ff80bf] font-semibold flex items-center gap-1">
                            <span>• Reavaliação e comparação obrigatória</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedRecord.treatmentSchedule.scalpGuidance?.needsAttention && (
                    <div className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-500/30 text-[11px] text-teal-200">
                      <strong>Couro Cabeludo:</strong> {selectedRecord.treatmentSchedule.scalpGuidance.cosmeticGuidance}
                    </div>
                  )}
                </div>
              )}

              {/* Observação da Evolução & Próxima Avaliação (Campos Profissionais da Reavaliação) */}
              <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f72585]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Acompanhamento da Evolução da Fibra
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveEvolutionNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2e] hover:bg-[#1a233c] text-[#f72585] border border-[#f72585]/40 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                  >
                    {isSavingNotes ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Salvo!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar Anotações</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Observação da Evolução */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-[#f72585]" />
                      <span>Observação da Evolução (Profissional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={evolutionNotesInput}
                      onChange={(e) => setEvolutionNotesInput(e.target.value)}
                      placeholder="Registre a resposta da fibra, adesão da cliente ao Home Care, textura observada, etc..."
                      className="w-full p-2.5 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f72585] resize-none"
                    />
                  </div>

                  {/* Próxima Avaliação (Previsão / Objetivo) */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Próxima Avaliação (Previsão / Objetivo)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={nextGoalInput}
                      onChange={(e) => setNextGoalInput(e.target.value)}
                      placeholder="Ex: Reavaliar após ciclo de 4 semanas. Meta: verificar ganho de elasticidade e retenção lipídica..."
                      className="w-full p-2.5 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Notes & Disclaimer */}
              <div className="p-3.5 rounded-xl bg-[#060913] border border-[#1a2236] text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Termo Ético & Profissional:</p>
                <p className="leading-relaxed">
                  Avaliação cosmética voltada para procedimentos estéticos de embelezamento capilar e orientação de manutenção. Não constitui e não substitui consulta médica dermatológica.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#0c101d] border border-[#1e273d] text-slate-400 space-y-3">
              <p className="text-slate-200 font-semibold text-sm">
                {clientFilterId
                  ? 'Esta cliente ainda não possui uma avaliação registrada.'
                  : 'Nenhuma avaliação selecionada.'}
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {clientFilterId
                  ? 'Inicie o primeiro atendimento técnico para registrar os achados, calcular índices e prescrever protocolos.'
                  : 'Selecione uma avaliação da lista à esquerda ou inicie uma nova consulta.'}
              </p>
              <button
                onClick={onNewEvaluation}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-xs font-bold shadow-[0_0_12px_rgba(247,37,133,0.3)] cursor-pointer hover:brightness-110"
              >
                <Plus className="w-3.5 h-3.5" /> Iniciar Avaliação
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Individual Evaluation Deletion */}
      <ModalConfirmacao
        isOpen={Boolean(evalToDelete)}
        title="Excluir Avaliação Individual?"
        description={`Tem certeza que deseja excluir esta avaliação de ${evalToDelete?.clientName} realizada em ${evalToDelete ? new Date(evalToDelete.date).toLocaleDateString('pt-BR') : ''}?`}
        details="A cliente permanecerá cadastrada e suas outras avaliações continuarão preservadas no histórico."
        confirmText="Sim, Excluir Esta Avaliação"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleDelete}
        onClose={() => setEvalToDelete(null)}
      />

      {/* Evolution Comparison Modal */}
      <ModalCompararEvolucao
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        clientEvaluations={clientEvals}
        allEvaluations={evaluations}
        initialRecordA={clientEvals[1] || evaluations[1] || null}
        initialRecordB={selectedRecord}
      />
    </div>
  );
};
