import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Check,
  Edit3,
  UserCheck,
  Layers,
  HelpCircle,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  HeartPulse,
  Plus,
  Trash2,
  Package,
  Search,
  ArrowUpDown,
  X,
  Droplets,
  Tag,
} from 'lucide-react';
import {
  SalonProtocol,
  ScoringResult,
  FourWeekTreatmentSchedule,
  ScheduleWeek,
  SalonProduct,
  SelectedProduct,
  CosmeticMacroCategory,
  TreatmentStage,
} from '../../types';
import {
  getFlatCompatibleProducts,
  createSelectedProductSnapshot,
  mapCategoryToMacro,
} from '../../utils/productRecommender';

interface StepTratamentoProfissionalProps {
  protocol: SalonProtocol;
  scores: ScoringResult;
  schedule?: FourWeekTreatmentSchedule;
  products?: SalonProduct[];
  onBack: () => void;
  onContinue: () => void;
  onUpdateProtocol?: (updatedProtocol: SalonProtocol) => void;
  onUpdateSchedule?: (updatedSchedule: FourWeekTreatmentSchedule) => void;
  onOpenProductsModal?: () => void;
}

export const StepTratamentoProfissional: React.FC<StepTratamentoProfissionalProps> = ({
  protocol,
  scores,
  schedule,
  products = [],
  onBack,
  onContinue,
  onUpdateProtocol,
  onUpdateSchedule,
  onOpenProductsModal,
}) => {
  // Integrated pause timer for the salon bench
  const defaultSeconds = protocol.pauseTimeMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);

  // Professional validation & custom adjustment state (Regra 12)
  const initialStatus = protocol.personalizedTreatment?.status || protocol.status || 'SUGERIDO';
  const initialNotes = protocol.personalizedTreatment?.professionalNotes || protocol.professionalNotes || '';
  const [currentStatus, setCurrentStatus] = useState<'SUGERIDO' | 'VALIDADO_PROFISSIONAL' | 'AJUSTADO_PROFISSIONAL'>(initialStatus);
  const [professionalNotes, setProfessionalNotes] = useState(initialNotes);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavedBannerVisible, setIsSavedBannerVisible] = useState(false);

  // Schedule state & professional review
  const activeSchedule = schedule || protocol.schedule4Weeks;
  const [scheduleStatus, setScheduleStatus] = useState<'SUGERIDO' | 'VALIDADO_PROFISSIONAL' | 'AJUSTADO_PROFISSIONAL'>(
    activeSchedule?.status || 'SUGERIDO'
  );
  const [scheduleNotes, setScheduleNotes] = useState(activeSchedule?.professionalNotes || '');
  const [isEditingScheduleNotes, setIsEditingScheduleNotes] = useState(false);
  const [isReassessmentTableOpen, setIsReassessmentTableOpen] = useState(false);
  const [scheduleSavedToast, setScheduleSavedToast] = useState(false);

  // Selected Products state with snapshot isolation
  const [selectedProductsList, setSelectedProductsList] = useState<SelectedProduct[]>(() => {
    if (protocol.selectedProducts && protocol.selectedProducts.length > 0) {
      return protocol.selectedProducts;
    }
    if (protocol.products && protocol.products.length > 0) {
      return protocol.products.map((p, idx) => ({
        id: `sel-${p.id}-${idx}`,
        productId: p.id,
        nameSnapshot: p.name,
        brandSnapshot: p.brand,
        lineSnapshot: p.line,
        category: p.category,
        categorySnapshot: p.category,
        macroCategorySnapshot: p.macroCategory || mapCategoryToMacro(p.category),
        stage: p.category.includes('SHAMPOO')
          ? 'LAVATORIO_HIGIENIZACAO'
          : p.category.includes('ACIDIFICANTE')
          ? 'ACIDIFICACAO_PREPARACAO'
          : p.category.includes('CONDICIONADOR')
          ? 'CONDICIONAMENTO_SELAMENTO'
          : p.category.includes('LEAVE_IN') || p.category.includes('OLEO')
          ? 'PROTECAO_FINALIZACAO'
          : 'TRATAMENTO_INTENSIVO',
        stageLabel: p.category.includes('SHAMPOO')
          ? '1. Higienização Suave'
          : p.category.includes('ACIDIFICANTE')
          ? '2. Acidificação & Selamento'
          : p.category.includes('CONDICIONADOR')
          ? '4. Selamento Cuticular'
          : p.category.includes('LEAVE_IN') || p.category.includes('OLEO')
          ? '5. Proteção & Finalização'
          : '3. Tratamento Ativo de Bancada',
        dosageOrOrientation: 'Quantidade adequada para o comprimento e densidade',
        pauseTimeMinutes: p.pauseTimeMinutes || (p.category.includes('MASCARA') ? 10 : 2),
        applicationTechnique: p.usageInstructions || 'Distribuir mecha a mecha uniformemente enluvando.',
        requiresRinse: !p.category.includes('LEAVE_IN') && !p.category.includes('OLEO'),
        order: idx + 1,
        selectedAt: new Date().toISOString(),
        inStockAtSelection: p.inStock !== false,
        activesSnapshot: p.keyActives,
        pHSnapshot: p.pH,
      }));
    }
    return [];
  });

  // Modal State for "Opções compatíveis com a necessidade identificada"
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [targetStepIndex, setTargetStepIndex] = useState<number | null>(null);
  const [selectorTargetStage, setSelectorTargetStage] = useState<TreatmentStage>('TRATAMENTO_INTENSIVO');
  const [selectorMacro, setSelectorMacro] = useState<CosmeticMacroCategory | 'TODAS'>('TODAS');
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorOnlyInStock, setSelectorOnlyInStock] = useState(false);

  const syncSelectedProducts = (updatedList: SelectedProduct[]) => {
    setSelectedProductsList(updatedList);
    if (onUpdateProtocol) {
      onUpdateProtocol({
        ...protocol,
        selectedProducts: updatedList,
      });
    }
  };

  const handleOpenSelector = (index: number | null, stage?: TreatmentStage) => {
    setTargetStepIndex(index);
    if (stage) setSelectorTargetStage(stage);
    setSelectorMacro('TODAS');
    setSelectorSearch('');
    setIsSelectorOpen(true);
  };

  const handleSelectProduct = (product: SalonProduct) => {
    const stage = targetStepIndex !== null && selectedProductsList[targetStepIndex]
      ? selectedProductsList[targetStepIndex].stage
      : selectorTargetStage;

    const newSnapshot = createSelectedProductSnapshot(
      product,
      stage,
      '',
      product.pauseTimeMinutes || 10,
      'Quantidade padrão conforme densidade e comprimento',
      product.usageInstructions || 'Aplicar uniformemente enluvando.',
      !product.category.includes('LEAVE_IN') && !product.category.includes('OLEO'),
      targetStepIndex !== null ? targetStepIndex + 1 : selectedProductsList.length + 1
    );

    if (targetStepIndex !== null) {
      const updated = [...selectedProductsList];
      updated[targetStepIndex] = newSnapshot;
      syncSelectedProducts(updated);
    } else {
      syncSelectedProducts([...selectedProductsList, newSnapshot]);
    }

    setIsSelectorOpen(false);
    setTargetStepIndex(null);
  };

  const handleRemoveSelectedProduct = (index: number) => {
    const updated = selectedProductsList.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      order: i + 1,
    }));
    syncSelectedProducts(updated);
  };

  const handleMoveProduct = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === selectedProductsList.length - 1) return;

    const updated = [...selectedProductsList];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Recalculate order
    const reordered = updated.map((item, i) => ({ ...item, order: i + 1 }));
    syncSelectedProducts(reordered);
  };

  const handleUpdateProductDetails = (index: number, fields: Partial<SelectedProduct>) => {
    const updated = [...selectedProductsList];
    updated[index] = { ...updated[index], ...fields };
    syncSelectedProducts(updated);
  };

  // Recommended options calculation
  const recommendationMock = {
    scores,
    anamnese: {} as any,
    visual: {} as any,
    client: {} as any,
  };
  const compatibleRecommendations = getFlatCompatibleProducts(
    recommendationMock,
    products
  );

  const filteredOptions = compatibleRecommendations.filter((opt) => {
    const p = opt.product;
    if (selectorOnlyInStock && p.inStock === false) return false;
    if (selectorMacro !== 'TODAS' && (p.macroCategory || mapCategoryToMacro(p.category)) !== selectorMacro) return false;
    if (selectorSearch) {
      const q = selectorSearch.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.keyActives.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  // Synchronize local schedule status if prop changes
  useEffect(() => {
    if (activeSchedule) {
      setScheduleStatus(activeSchedule.status || 'SUGERIDO');
      setScheduleNotes(activeSchedule.professionalNotes || '');
    }
  }, [activeSchedule]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(defaultSeconds);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Validar decisão do profissional no protocolo imediato
  const handleValidateTreatment = () => {
    const newStatus = 'VALIDADO_PROFISSIONAL';
    setCurrentStatus(newStatus);
    const updated: SalonProtocol = {
      ...protocol,
      status: newStatus,
      personalizedTreatment: protocol.personalizedTreatment
        ? {
            ...protocol.personalizedTreatment,
            status: newStatus,
            professionalNotes,
          }
        : undefined,
      professionalNotes,
    };
    if (onUpdateProtocol) {
      onUpdateProtocol(updated);
    }
    setIsSavedBannerVisible(true);
    setTimeout(() => setIsSavedBannerVisible(false), 3500);
  };

  // Salvar ajustes/anotações do profissional no protocolo imediato
  const handleSaveNotes = () => {
    const newStatus = professionalNotes.trim() ? 'AJUSTADO_PROFISSIONAL' : currentStatus;
    setCurrentStatus(newStatus);
    setIsEditingNotes(false);
    const updated: SalonProtocol = {
      ...protocol,
      status: newStatus,
      personalizedTreatment: protocol.personalizedTreatment
        ? {
            ...protocol.personalizedTreatment,
            status: newStatus,
            professionalNotes,
          }
        : undefined,
      professionalNotes,
    };
    if (onUpdateProtocol) {
      onUpdateProtocol(updated);
    }
    setIsSavedBannerVisible(true);
    setTimeout(() => setIsSavedBannerVisible(false), 3500);
  };

  // Validar cronograma de 4 semanas pelo profissional
  const handleValidateSchedule = () => {
    if (!activeSchedule) return;
    const newStatus = 'VALIDADO_PROFISSIONAL';
    setScheduleStatus(newStatus);
    const updated: FourWeekTreatmentSchedule = {
      ...activeSchedule,
      status: newStatus,
      professionalNotes: scheduleNotes,
    };
    if (onUpdateSchedule) {
      onUpdateSchedule(updated);
    }
    setScheduleSavedToast(true);
    setTimeout(() => setScheduleSavedToast(false), 3500);
  };

  // Salvar ajustes/anotações do cronograma
  const handleSaveScheduleNotes = () => {
    if (!activeSchedule) return;
    const newStatus = scheduleNotes.trim() ? 'AJUSTADO_PROFISSIONAL' : scheduleStatus;
    setScheduleStatus(newStatus);
    setIsEditingScheduleNotes(false);
    const updated: FourWeekTreatmentSchedule = {
      ...activeSchedule,
      status: newStatus,
      professionalNotes: scheduleNotes,
    };
    if (onUpdateSchedule) {
      onUpdateSchedule(updated);
    }
    setScheduleSavedToast(true);
    setTimeout(() => setScheduleSavedToast(false), 3500);
  };

  const scheduleWeeks: ScheduleWeek[] = React.useMemo(() => {
    if (!activeSchedule) return [];
    if (Array.isArray(activeSchedule.weeks) && activeSchedule.weeks.length > 0) {
      return activeSchedule.weeks;
    }
    const list: ScheduleWeek[] = [];
    if (activeSchedule.week1) list.push(activeSchedule.week1);
    if (activeSchedule.week2) list.push(activeSchedule.week2);
    if (activeSchedule.week3) list.push(activeSchedule.week3);
    if (activeSchedule.week4) list.push(activeSchedule.week4);
    return list;
  }, [activeSchedule]);

  const treatment = protocol.personalizedTreatment;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
          <Scissors className="w-3.5 h-3.5" /> Etapa 7 • Tratamento Personalizado & Protocolo de Bancada
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Prescrição Técnica do Salão
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          O motor analítico cruza as evidências físicas da fibra para estruturar a estratégia de tratamento, cronograma e execução.
        </p>
      </div>

      {/* Confirmation Toast */}
      {isSavedBannerVisible && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Conduta profissional registrada com sucesso e vinculada à avaliação desta cliente!</span>
          </div>
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Gravado</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* CARD 1: MÓDULO DE TRATAMENTO PERSONALIZADO (AS 5 RESPOSTAS)  */}
      {/* ============================================================ */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#24304c] p-4 sm:p-7 space-y-6 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#1b2338]">
          <div>
            <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider px-2 py-0.5 rounded bg-[#f72585]/10 border border-[#f72585]/30 inline-block mb-1">
              Inteligência Analítica Capilar
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#f72585]" /> Tratamento Personalizado Baseado na Avaliação
            </h3>
          </div>

          {/* Professional Status Badge */}
          <div className="flex items-center gap-2">
            {currentStatus === 'VALIDADO_PROFISSIONAL' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Validado pelo Profissional
              </span>
            ) : currentStatus === 'AJUSTADO_PROFISSIONAL' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Ajustado pelo Profissional
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Sugerido pelo Sistema
              </span>
            )}
          </div>
        </div>

        {/* The 5 Fundamental Questions & Answers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question 1: O que mais precisa agora? */}
          <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5">
            <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-[10px]">1</span>
              O que este cabelo mais precisa agora?
            </span>
            <h4 className="text-sm font-bold text-white leading-snug">
              {treatment?.primaryNeed || protocol.objective}
            </h4>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span>Classificação: <strong>{scores.damageGrade.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>Integridade: <strong>{scores.overallHealth}%</strong></span>
            </div>
          </div>

          {/* Question 3: Qual tratamento é prioritário? */}
          <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5">
            <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-[10px]">2</span>
              Qual tratamento é prioritário?
            </span>
            <h4 className="text-sm font-bold text-white leading-snug">
              {treatment?.priorityTreatment || protocol.protocolName}
            </h4>
            <p className="text-[11px] text-slate-400">
              Tipo: <strong>{treatment?.treatmentType || protocol.category}</strong>
            </p>
          </div>

          {/* Question 2: Por que precisa? (Justificativa Técnica Baseada na Avaliação) */}
          <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5 md:col-span-2">
            <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-[10px]">3</span>
              Por que precisa? (Justificativa Técnica Baseada na Avaliação)
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {treatment?.justification || protocol.targetIssue}
            </p>
          </div>

          {/* Question 4: Frequência & Reavaliação */}
          <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5">
            <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-[10px]">4</span>
              Qual deve ser a frequência?
            </span>
            <p className="text-xs text-slate-200 font-medium">
              {treatment?.suggestedFrequency || protocol.recommendedSalonFrequency}
            </p>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-[#182136]">
              <strong>Plano de Reavaliação:</strong> {treatment?.reassessmentPlan || 'Reavaliação em 30 dias com teste mecânico.'}
            </p>
          </div>

          {/* Question 5: Cuidados e Limitações */}
          <div className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">5</span>
              Cuidados e Limitações de Segurança
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {(treatment?.precautions || [
                'Suspender novas químicas alcalinas durante o ciclo de recuperação.',
                'Utilizar proteção térmica em qualquer secagem.',
              ]).map((prec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{prec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Categorias, Ativos e Funções Cosméticas Recomendadas (Regra 8) */}
        {treatment?.cosmeticCategories && treatment.cosmeticCategories.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#f72585]" /> Categorias e Funções Cosméticas Prescritas
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {treatment.cosmeticCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white">{cat.categoryName}</h5>
                    <span className="text-[10px] text-[#f72585] font-semibold px-2 py-0.5 rounded bg-[#f72585]/10">
                      Função Ativa
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {cat.role}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-[#182136]">
                    {cat.suggestedActives.map((act, aIdx) => (
                      <span
                        key={aIdx}
                        className="text-[9px] px-2 py-0.5 rounded bg-[#13192c] text-slate-200 font-medium"
                      >
                        ✦ {act}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observação Profissional para Bancada */}
        {treatment?.professionalObservation && (
          <div className="p-3.5 rounded-xl bg-[#13192c] border border-[#232f48] text-xs text-[#ffb3d9] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#f72585] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Observação Profissional de Bancada:</strong>
              <p className="leading-relaxed text-slate-300">{treatment.professionalObservation}</p>
            </div>
          </div>
        )}

        {/* Professional Decision & Action Control (Regra 12) */}
        <div className="p-4 rounded-xl bg-[#060913] border border-[#232f48] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#f72585]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Validação e Decisão Técnica do Profissional
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              O profissional é o responsável final pelo protocolo.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleValidateTreatment}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                currentStatus === 'VALIDADO_PROFISSIONAL'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-[#18233d] hover:bg-[#202e50] text-slate-200 border border-[#2f3d61]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{currentStatus === 'VALIDADO_PROFISSIONAL' ? 'Tratamento Validado ✓' : 'Validar Sugestão Técnica'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-[#141b2e] hover:bg-[#1c2640] text-slate-300 border border-[#24304c] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#f72585]" />
              <span>{isEditingNotes ? 'Fechar Anotações' : 'Ajustar Conduta / Inserir Notas'}</span>
            </button>
          </div>

          {/* Editable notes area */}
          {(isEditingNotes || professionalNotes) && (
            <div className="pt-2 space-y-2 animate-fadeIn">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Conduta ou Observação Particular do Cabeleireiro:
              </label>
              <textarea
                value={professionalNotes}
                onChange={(e) => setProfessionalNotes(e.target.value)}
                placeholder="Ex: Cliente prefere aplicação sem secagem térmica nesta sessão; ajustar tempo de pausa para 12 minutos devido à sensibilidade do couro cabeludo..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#0c101d] border border-[#24304c] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 rounded-lg bg-[#f72585] text-white text-xs font-bold hover:brightness-110 cursor-pointer shadow"
                >
                  Salvar Ajuste do Profissional
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CARD 2: PROTOCOL EXECUTION & BENCH TIMER                      */}
      {/* ============================================================ */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-4 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1b2338]">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider px-2 py-0.5 rounded bg-[#f72585]/10 border border-[#f72585]/30">
                {protocol.category}
              </span>
              <span className="text-[11px] text-slate-400">
                Duração Prevista: {protocol.expectedDuration}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {protocol.protocolName}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Foco terapêutico:</strong> {protocol.targetIssue}
            </p>
          </div>

          {/* Integrated Salon Bench Timer Widget */}
          <div className="p-4 rounded-2xl bg-[#060913] border border-[#f72585]/30 shadow-inner flex flex-col items-center justify-center w-full md:w-auto md:min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-[#f72585]" /> Timer de Pausa na Bancada
            </span>
            <div className="text-3xl font-mono font-black tracking-widest text-[#f72585] my-1 drop-shadow-[0_0_8px_rgba(247,37,133,0.5)]">
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-2 mt-2 w-full justify-center">
              <button
                type="button"
                onClick={toggleTimer}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[42px] flex-1 sm:flex-initial shadow-md ${
                  isRunning
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white hover:brightness-110 shadow-[0_0_12px_rgba(247,37,133,0.35)]'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
              </button>
              <button
                type="button"
                onClick={resetTimer}
                title="Reiniciar timer"
                className="p-2.5 rounded-xl bg-[#13192c] hover:bg-[#1a243c] text-slate-300 border border-[#212c47] transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            {timeLeft === 0 && (
              <span className="text-[11px] text-emerald-400 font-bold mt-2 animate-bounce">
                Tempo de pausa concluído!
              </span>
            )}
          </div>
        </div>

        {/* Biblioteca Cosmética & Produtos Selecionados no Protocolo */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182136] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#f72585]" /> Biblioteca & Produtos do Protocolo Profissional
                </span>
                <span className="text-[10px] text-[#f72585] font-semibold px-2 py-0.5 rounded bg-[#f72585]/10 border border-[#f72585]/20">
                  {selectedProductsList.length} Cosmético(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Opções compatíveis com a necessidade identificada. O profissional possui autonomia total para selecionar, substituir ou reordenar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenProductsModal && (
                <button
                  type="button"
                  onClick={onOpenProductsModal}
                  className="px-3 py-1.5 rounded-xl bg-[#13192c] hover:bg-[#1a233c] text-slate-300 hover:text-white text-xs font-semibold border border-[#202a42] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Gerenciar Acervo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenSelector(null, 'TRATAMENTO_INTENSIVO')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_12px_rgba(247,37,133,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Adicionar Cosmético</span>
              </button>
            </div>
          </div>

          {/* List of Selected Products in Protocol */}
          {selectedProductsList.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#060913] border border-dashed border-[#1f283d] text-center space-y-2">
              <Package className="w-8 h-8 text-slate-500 mx-auto opacity-60" />
              <p className="text-xs font-semibold text-slate-300">Nenhum produto adicionado a este protocolo.</p>
              <p className="text-[11px] text-slate-500">
                Clique no botão abaixo para explorar as opções compatíveis com a necessidade deste cabelo.
              </p>
              <button
                type="button"
                onClick={() => handleOpenSelector(null, 'TRATAMENTO_INTENSIVO')}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1b253f] text-xs font-semibold text-[#f72585] border border-[#f72585]/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ver Opções Compatíveis
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedProductsList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1a2338] hover:border-[#f72585]/40 transition-all space-y-3"
                >
                  {/* Top Line: Stage, Ordering & Action buttons */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#141c2f]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-md bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/40 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {item.stageLabel || `Etapa ${idx + 1}`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#13192c] text-cyan-300 border border-cyan-800/30">
                        {item.macroCategorySnapshot}
                      </span>
                      {item.pHSnapshot && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#11172a] text-slate-300 border border-[#232e48]">
                          pH {item.pHSnapshot}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${
                          item.inStockAtSelection
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                        }`}
                      >
                        {item.inStockAtSelection ? 'No Salão' : 'Indisponível'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveProduct(idx, 'UP')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-[#101726] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Mover para cima"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveProduct(idx, 'DOWN')}
                        disabled={idx === selectedProductsList.length - 1}
                        className="p-1 rounded bg-[#101726] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Mover para baixo"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenSelector(idx, item.stage as TreatmentStage)}
                        className="px-2 py-1 rounded bg-[#13192c] hover:bg-[#1a233c] text-xs font-semibold text-cyan-300 border border-cyan-800/30 hover:border-cyan-500/50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Substituir por outra opção compatível"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Substituir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedProduct(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remover cosmético do protocolo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider">
                        {item.brandSnapshot} {item.lineSnapshot ? `• ${item.lineSnapshot}` : ''}
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {item.nameSnapshot}
                      </h4>
                    </div>
                    {item.activesSnapshot && (
                      <div className="flex flex-wrap gap-1">
                        {item.activesSnapshot.split(/[,+;]/).slice(0, 3).map((act, aIdx) => (
                          <span
                            key={aIdx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[#11172a] text-slate-300 border border-[#1f283d]"
                          >
                            {act.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Professional Dosage & Pause Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-slate-400">Dosagem / Quantidade</label>
                      <input
                        type="text"
                        value={item.dosageOrOrientation || ''}
                        onChange={(e) => handleUpdateProductDetails(idx, { dosageOrOrientation: e.target.value })}
                        placeholder="Ex: 15g, 3 pumps"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0f1d] border border-[#1f283d] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-slate-400">Tempo de Pausa (min)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={item.pauseTimeMinutes ?? 0}
                        onChange={(e) => handleUpdateProductDetails(idx, { pauseTimeMinutes: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0f1d] border border-[#1f283d] text-white text-xs focus:outline-none focus:border-[#f72585]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-slate-400">Enxágue Obrigatório?</label>
                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateProductDetails(idx, { requiresRinse: true })}
                          className={`flex-1 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                            item.requiresRinse !== false
                              ? 'bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/40'
                              : 'bg-[#0a0f1d] text-slate-400 border border-[#1f283d]'
                          }`}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateProductDetails(idx, { requiresRinse: false })}
                          className={`flex-1 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                            item.requiresRinse === false
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-[#0a0f1d] text-slate-400 border border-[#1f283d]'
                          }`}
                        >
                          Leave-in (Não)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-semibold text-slate-400">Observação Técnica</label>
                      <input
                        type="text"
                        value={item.customNotes || ''}
                        onChange={(e) => handleUpdateProductDetails(idx, { customNotes: e.target.value })}
                        placeholder="Ex: Enluvar com água morna"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0f1d] border border-[#1f283d] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Ingredients Section */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#f72585]" /> Ativos Chave do Protocolo Profissional
          </span>
          <div className="flex flex-wrap gap-2">
            {protocol.activeIngredients.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-[#141b2e] border border-[#f72585]/30 text-xs font-medium text-slate-200"
              >
                ✦ {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step by Step Guide for Bench & Basin */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#f72585]" /> Passo a Passo de Aplicação no Salão
        </h3>

        <div className="space-y-3">
          {protocol.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-2 transition-all hover:border-[#f72585]/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/40 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-[0_0_8px_rgba(247,37,133,0.25)]">
                  {idx + 1}
                </div>
                <h4 className="font-semibold text-white text-sm">{step.title}</h4>
              </div>

              <p className="text-xs text-slate-300 sm:pl-10 leading-relaxed">
                {step.description}
              </p>

              {step.tip && (
                <div className="sm:ml-10 p-2.5 rounded-lg bg-[#13192c] border border-[#232f48] text-[11px] text-[#ffb3d9] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#f72585] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Dica de Bancada:</strong> {step.tip}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CRONOGRAMA CAPILAR PERSONALIZADO — 4 SEMANAS */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-6 space-y-5">
        {/* Header with rhythm and strategy */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#182136]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" /> Cronograma de 4 Semanas
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  scheduleStatus === 'VALIDADO_PROFISSIONAL'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                    : scheduleStatus === 'AJUSTADO_PROFISSIONAL'
                    ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                    : 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30'
                }`}
              >
                {scheduleStatus === 'VALIDADO_PROFISSIONAL' && <CheckCircle2 className="w-3 h-3" />}
                {scheduleStatus === 'AJUSTADO_PROFISSIONAL' && <Edit3 className="w-3 h-3" />}
                {scheduleStatus === 'SUGERIDO' && <Sparkles className="w-3 h-3" />}
                <span>
                  {scheduleStatus === 'VALIDADO_PROFISSIONAL'
                    ? 'Validado pelo Profissional'
                    : scheduleStatus === 'AJUSTADO_PROFISSIONAL'
                    ? 'Ajustado com Notas Técnicas'
                    : 'Sugerido pelo Motor de Análise'}
                </span>
              </span>

              {/* Technical Reconstruction Indicator */}
              {activeSchedule?.hasTechnicalEvidenceForReconstruction ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f72585]/15 border border-[#f72585]/40 text-[#ff80bf] text-[11px] font-semibold">
                  <Activity className="w-3 h-3 text-[#f72585]" /> Reconstrução Baseada em Evidência
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> Sem Sobrecarga Proteica (Foco Hidrolipídico)
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              {activeSchedule?.strategyRhythm || 'Planejamento Sequencial Personalizado'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {activeSchedule?.summary ||
                'Plano estruturado de 4 semanas gerado a partir do cruzamento entre anamnese, teste de mecha e necessidades prioritárias.'}
            </p>
          </div>

          {/* Professional validation & adjustment actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {scheduleStatus !== 'VALIDADO_PROFISSIONAL' && (
              <button
                type="button"
                onClick={handleValidateSchedule}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a243c] border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                title="Aprovar o cronograma sugerido"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Validar Cronograma</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditingScheduleNotes(!isEditingScheduleNotes)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a243c] border border-[#232f48] text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              title="Anotar ajustes ou orientações personalizadas"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#f72585]" />
              <span>{isEditingScheduleNotes ? 'Fechar Notas' : 'Ajustar / Anotar'}</span>
            </button>
          </div>
        </div>

        {/* Schedule Saved Toast Banner */}
        {scheduleSavedToast && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Cronograma salvo e validado com sucesso para esta avaliação!</span>
          </div>
        )}

        {/* Schedule Professional Notes Editor */}
        {isEditingScheduleNotes && (
          <div className="p-4 rounded-xl bg-[#060913] border border-[#232f48] space-y-3 animate-fadeIn">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Observações e Ajustes do Profissional para o Cronograma de 4 Semanas:
            </label>
            <textarea
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="Ex: Ajustei a pausa da Semana 2 para 15 minutos; orientada a usar fronha de cetim e reforçar a umectação nas pontas..."
              className="w-full h-24 px-3 py-2 text-xs rounded-xl bg-[#0d1222] border border-[#1e273d] text-slate-200 focus:outline-none focus:border-[#f72585] placeholder-slate-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingScheduleNotes(false)}
                className="px-3 py-1.5 rounded-lg bg-[#141b2e] text-slate-300 text-xs font-semibold hover:bg-[#1c253d] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveScheduleNotes}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-xs font-bold shadow-sm hover:brightness-110 cursor-pointer"
              >
                Salvar Ajustes do Cronograma
              </button>
            </div>
          </div>
        )}

        {/* Scalp Guidance Box (Regras 6 e 7: Couro Cabeludo Cosmético e Alerta Ético) */}
        {activeSchedule?.scalpGuidance?.needsAttention && (
          <div className="p-4 rounded-xl bg-[#080d1a] border border-teal-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Atenção Específica ao Couro Cabeludo (Cuidado Cosmético Zonal)
                </h4>
              </div>
              <span className="text-[10px] text-teal-400 font-semibold px-2 py-0.5 rounded bg-teal-950/40 border border-teal-500/20">
                Separado da Haste
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeSchedule.scalpGuidance.cosmeticGuidance}
            </p>

            {/* Health Referral Notice (Regras 4 e 7: Não diagnosticar; sugerir avaliação médica se houver sinais suspeitos) */}
            {activeSchedule.scalpGuidance.hasSuspiciousSigns && activeSchedule.scalpGuidance.medicalReferralNotice && (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200 mt-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                    Recomendação Ética Interdisciplinar:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {activeSchedule.scalpGuidance.medicalReferralNotice}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4 Weeks Cards Grid */}
        {scheduleWeeks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduleWeeks.map((week) => {
              const isWeek4 = week.weekNumber === 4;
              const cat = week.category || week.treatmentCategory;
              const isReconstruction = cat === 'RECONSTRUCAO';
              const isNutrition = cat === 'NUTRICAO';
              const isHydration = cat === 'HIDRATACAO';
              const isAcidification = cat === 'ACIDIFICACAO';

              let borderColor = 'border-[#1a2338] hover:border-[#f72585]/40';
              let badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';

              if (isReconstruction) {
                borderColor = 'border-[#f72585]/30 hover:border-[#f72585]/60';
                badgeColor = 'text-[#f72585] bg-[#f72585]/10 border-[#f72585]/30';
              } else if (isNutrition) {
                borderColor = 'border-amber-500/30 hover:border-amber-500/60';
                badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
              } else if (isAcidification) {
                borderColor = 'border-violet-500/30 hover:border-violet-500/60';
                badgeColor = 'text-violet-400 bg-violet-500/10 border-violet-500/30';
              }

              return (
                <div
                  key={week.weekNumber}
                  className={`p-4 sm:p-5 rounded-xl bg-[#060913] border ${borderColor} space-y-3.5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#13192c] border border-[#212c47] flex items-center justify-center text-[10px] text-[#f72585] font-black">
                          {week.weekNumber}
                        </span>
                        Semana {week.weekNumber}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                        {cat}
                      </span>
                    </div>

                    {/* Objetivo da Semana */}
                    <div className="mb-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Objetivo da Semana:
                      </span>
                      <p className="text-xs text-white font-medium mt-0.5 leading-snug">
                        {week.objective}
                      </p>
                    </div>

                    {/* Tratamento Principal */}
                    <div className="p-2.5 rounded-lg bg-[#0d1222] border border-[#1b253d] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#f72585] block tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Tratamento Principal:
                      </span>
                      <p className="text-xs text-slate-200 leading-snug font-medium">
                        {week.mainTreatment}
                      </p>
                    </div>

                    {/* Tratamento Complementar (se houver) */}
                    {week.complementaryTreatment && (
                      <div className="p-2.5 rounded-lg bg-[#0d1222]/70 border border-[#1b253d] space-y-1 mt-2">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Complementar:
                        </span>
                        <p className="text-xs text-slate-300 leading-snug">
                          {week.complementaryTreatment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Operational Details (Proteção, Nota Profissional, Home Care) */}
                  <div className="space-y-2 pt-2 border-t border-[#182136] text-[11px]">
                    {/* Cuidados e Proteção */}
                    <div className="text-slate-300">
                      <strong className="text-slate-400 font-semibold">Proteção & Cuidados:</strong>{' '}
                      <span>{week.protection}</span>
                    </div>

                    {/* Observação Profissional */}
                    <div className="text-slate-300">
                      <strong className="text-[#ff99cc] font-semibold">Dica Profissional:</strong>{' '}
                      <span>{week.professionalNote}</span>
                    </div>

                    {/* Orientação Home Care */}
                    <div className="text-slate-300">
                      <strong className="text-amber-300/90 font-semibold">Manutenção em Casa:</strong>{' '}
                      <span>{week.homeCare}</span>
                    </div>

                    {/* Semana 4: Reavaliação Obrigatória da Fibra */}
                    {isWeek4 && (
                      <div className="mt-3 p-3 rounded-xl bg-[#0f172a] border border-[#f72585]/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#ff80bf] flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[#f72585]" />
                            Reavaliar a fibra e comparar com a avaliação inicial.
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Ao término deste ciclo de 4 semanas, realize uma nova análise de tração, porosidade e toque para mensurar a evolução antes de planejar novos procedimentos químicos.
                        </p>

                        {/* Expandable Reassessment Prep Checklist (9 Parameters Prepared) */}
                        {activeSchedule?.reassessmentPrep && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setIsReassessmentTableOpen(!isReassessmentTableOpen)}
                              className="text-[11px] text-[#f72585] hover:text-[#ff99cc] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>
                                {isReassessmentTableOpen
                                  ? 'Ocultar matriz de 9 parâmetros de reavaliação'
                                  : 'Ver matriz de 9 parâmetros preparados para reavaliação →'}
                              </span>
                              {isReassessmentTableOpen ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>

                            {isReassessmentTableOpen && (
                              <div className="mt-2.5 p-2.5 rounded-lg bg-[#060913] border border-[#1e273d] space-y-1.5 animate-fadeIn">
                                <div className="flex items-center justify-between pb-1 border-b border-[#182136] text-[10px] uppercase font-bold text-slate-400">
                                  <span>Parâmetro Avaliado</span>
                                  <span>Valor Inicial Registrado</span>
                                </div>
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                  {activeSchedule.reassessmentPrep.comparisonFields.map((field) => (
                                    <div
                                      key={field.key}
                                      className="flex items-center justify-between gap-2 text-[11px] py-1 border-b border-[#141b2e] last:border-none"
                                    >
                                      <span className="text-slate-300 font-medium">{field.label}:</span>
                                      <span className="text-[#f72585] font-semibold text-right truncate max-w-[55%]">
                                        {field.initialValue}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] text-slate-400 pt-1 italic">
                                  * Estrutura preparada para conexão com a reavaliação periódica.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback in case activeSchedule is not set */
          Array.isArray(protocol?.salonCycleSchedule) && protocol.salonCycleSchedule.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {protocol.salonCycleSchedule.map((session) => (
                <div
                  key={session.week}
                  className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-2 flex flex-col justify-between hover:border-[#f72585]/40 transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#f72585] px-2 py-0.5 rounded bg-[#f72585]/10 border border-[#f72585]/20 inline-block mb-1">
                      Semana {session.week}
                    </span>
                    <p className="text-xs font-semibold text-white mt-1 leading-snug">
                      {session.treatment}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-[#182136]">
                    <strong>Objetivo:</strong> {session.focus}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-[#060913] border border-[#1a2338] text-slate-400 space-y-2">
              <Calendar className="w-6 h-6 text-[#f72585] mx-auto opacity-70" />
              <p className="text-xs font-semibold text-slate-300">
                Esta avaliação não possui um cronograma de 4 semanas pré-estruturado.
              </p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                O profissional pode avançar com o protocolo de bancada prescrito acima ou ajustar o plano terapêutico conforme a evolução clínica.
              </p>
            </div>
          )
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] border border-[#1f283d] text-slate-300 text-sm font-semibold transition-colors cursor-pointer w-full sm:w-auto min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Resultado</span>
        </button>

        <button
          id="btn-continue-to-homecare"
          type="button"
          onClick={onContinue}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer w-full sm:w-auto min-h-[48px] border border-[#ff66b2]/40"
        >
          <span>Avançar para Home Care (Rotina Cliente)</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Modal / Drawer: Opções compatíveis com a necessidade identificada */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1b2338] flex items-center justify-between bg-gradient-to-r from-[#11172a] to-[#0c101d]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f72585]/10 text-[#f72585] text-[10px] font-bold tracking-wider uppercase mb-1 border border-[#f72585]/30">
                  <Sparkles className="w-3 h-3" /> Sugestão Inteligente de Cosméticos
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Opções compatíveis com a necessidade identificada
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reconstrução: {scores.reconstructionNeed}% • Nutrição: {scores.nutritionNeed}% • Hidratação: {scores.hydrationNeed}%.
                  O sistema sugere; a escolha final é do profissional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#151c2e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-3 sm:p-4 border-b border-[#182136] bg-[#080c18] space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por cosmético, ativo, marca..."
                    value={selectorSearch}
                    onChange={(e) => setSelectorSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#060913] border border-[#1d273e] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2.5 py-1.5 rounded-lg bg-[#0c101d] border border-[#1d273e] whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectorOnlyInStock}
                    onChange={(e) => setSelectorOnlyInStock(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#f72585] rounded cursor-pointer"
                  />
                  <span>Apenas no estoque do salão</span>
                </label>
              </div>

              {/* Macrocategorias Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {(
                  [
                    { id: 'TODAS', label: 'Todas' },
                    { id: 'RECONSTRUCAO', label: 'Reconstrução' },
                    { id: 'NUTRICAO', label: 'Nutrição' },
                    { id: 'HIDRATACAO', label: 'Hidratação' },
                    { id: 'CONDICIONAMENTO_ALINHAMENTO', label: 'Condicionamento / Selamento' },
                    { id: 'PROTECAO', label: 'Proteção' },
                    { id: 'COURO_CABELUDO', label: 'Couro Cabeludo' },
                    { id: 'FINALIZACAO', label: 'Finalização' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectorMacro(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectorMacro === cat.id
                        ? 'bg-[#f72585] text-white shadow-[0_0_8px_rgba(247,37,133,0.3)]'
                        : 'bg-[#101726] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Compatible Options */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Package className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
                  <p className="text-xs font-semibold">Nenhum cosmético encontrado com os filtros selecionados.</p>
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const p = opt.product;
                  const isAvailable = p.inStock !== false;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isAvailable
                          ? 'bg-[#060913] border-[#1a2338] hover:border-[#f72585]/40'
                          : 'bg-[#060913]/60 border-[#1a2338]/60 opacity-80'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider">
                            {p.brand}
                          </span>
                          {p.line && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              • {p.line}
                            </span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#13192c] text-cyan-300 border border-cyan-800/30">
                            {p.macroCategory || mapCategoryToMacro(p.category)}
                          </span>
                          {p.pH && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#13192c] text-slate-300 border border-[#232e48]">
                              pH {p.pH}
                            </span>
                          )}
                          {p.pauseTimeMinutes ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {p.pauseTimeMinutes} min
                            </span>
                          ) : null}
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                              isAvailable
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                                : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                            }`}
                          >
                            {isAvailable ? 'No Salão' : 'Esgotado'}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm">
                          {p.name}
                        </h4>

                        {/* Motivos de compatibilidade */}
                        {opt.reasons && opt.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {opt.reasons.map((r, rIdx) => (
                              <span
                                key={rIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-[#13192c] text-[#ff80bf] font-medium border border-[#f72585]/20 flex items-center gap-1"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-[#f72585]" /> {r}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400 italic">
                          Ativos: {p.keyActives}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Afinidade</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {opt.compatibilityScore}% compatível
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_12px_rgba(247,37,133,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                        >
                          Selecionar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-[#182136] bg-[#070b16] flex items-center justify-between text-xs text-slate-400">
              <span>{filteredOptions.length} opção(ões) compatível(is) exibida(s)</span>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] text-slate-300 font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
