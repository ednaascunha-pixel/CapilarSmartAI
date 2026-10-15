import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  Droplets,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Flame,
  Check,
  Heart,
  Plus,
  Trash2,
  Package,
  Search,
  ArrowUpDown,
  X,
  Clock,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import {
  HomeCareRoutine,
  ClientData,
  ScoringResult,
  SalonProduct,
  SelectedProduct,
  CosmeticMacroCategory,
} from '../../types';
import {
  getFlatCompatibleProducts,
  createSelectedProductSnapshot,
  mapCategoryToMacro,
} from '../../utils/productRecommender';

interface StepHomeCareProps {
  homeCare: HomeCareRoutine;
  client: ClientData;
  scores: ScoringResult;
  products?: SalonProduct[];
  onBack: () => void;
  onContinue: () => void;
  onUpdateHomeCare?: (updatedHomeCare: HomeCareRoutine) => void;
  onOpenProductsModal?: () => void;
}

export const StepHomeCare: React.FC<StepHomeCareProps> = ({
  homeCare,
  client,
  scores,
  products = [],
  onBack,
  onContinue,
  onUpdateHomeCare,
  onOpenProductsModal,
}) => {
  // Local state of selected products with snapshot isolation
  const [selectedHomeProducts, setSelectedHomeProducts] = useState<SelectedProduct[]>(() => {
    if (homeCare.selectedProducts && homeCare.selectedProducts.length > 0) {
      return homeCare.selectedProducts;
    }
    if (homeCare.products && homeCare.products.length > 0) {
      return homeCare.products.map((p, idx) => ({
        id: `sel-home-${p.id}-${idx}`,
        productId: p.id,
        nameSnapshot: p.name,
        brandSnapshot: p.brand,
        lineSnapshot: p.line,
        category: p.category,
        categorySnapshot: p.category,
        macroCategorySnapshot: p.macroCategory || mapCategoryToMacro(p.category),
        stage: 'HOME_CARE_ROTINA',
        stageLabel: p.category.includes('SHAMPOO')
          ? 'Shampoo de Manutenção'
          : p.category.includes('CONDICIONADOR')
          ? 'Condicionador Selante'
          : p.category.includes('MASCARA')
          ? 'Máscara de Tratamento'
          : p.category.includes('LEAVE_IN')
          ? 'Leave-in Termoprotetor'
          : 'Finalizador de Pontas',
        dosageOrOrientation: p.suggestedFrequency || 'Conforme necessidade da rotina',
        pauseTimeMinutes: p.pauseTimeMinutes || 0,
        applicationTechnique: p.usageInstructions || 'Aplicar uniformemente conforme instrução do rótulo.',
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

  // Selector modal state
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [selectorMacro, setSelectorMacro] = useState<CosmeticMacroCategory | 'TODAS'>('TODAS');
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorOnlyInStock, setSelectorOnlyInStock] = useState(false);

  const syncHomeCareProducts = (newList: SelectedProduct[]) => {
    setSelectedHomeProducts(newList);
    if (onUpdateHomeCare) {
      onUpdateHomeCare({
        ...homeCare,
        selectedProducts: newList,
      });
    }
  };

  const handleOpenSelector = (index: number | null) => {
    setReplacingIndex(index);
    setSelectorMacro('TODAS');
    setSelectorSearch('');
    setIsSelectorOpen(true);
  };

  const handleSelectProduct = (product: SalonProduct) => {
    const stageLabel = product.category.includes('SHAMPOO')
      ? 'Shampoo de Manutenção'
      : product.category.includes('CONDICIONADOR')
      ? 'Condicionador Selante'
      : product.category.includes('MASCARA')
      ? 'Máscara de Tratamento'
      : product.category.includes('LEAVE_IN')
      ? 'Leave-in Termoprotetor'
      : 'Finalizador de Pontas';

    const newSnapshot = createSelectedProductSnapshot(
      product,
      'HOME_CARE_ROTINA',
      product.suggestedFrequency || '',
      product.pauseTimeMinutes || 0,
      product.suggestedFrequency || 'Uso habitual',
      product.usageInstructions || 'Aplicar nos fios limpos e úmidos.',
      !product.category.includes('LEAVE_IN') && !product.category.includes('OLEO'),
      replacingIndex !== null ? replacingIndex + 1 : selectedHomeProducts.length + 1
    );
    newSnapshot.stageLabel = stageLabel;

    if (replacingIndex !== null) {
      const updated = [...selectedHomeProducts];
      updated[replacingIndex] = newSnapshot;
      syncHomeCareProducts(updated);
    } else {
      syncHomeCareProducts([...selectedHomeProducts, newSnapshot]);
    }

    setIsSelectorOpen(false);
    setReplacingIndex(null);
  };

  const handleRemoveProduct = (index: number) => {
    const updated = selectedHomeProducts.filter((_, i) => i !== index).map((p, i) => ({
      ...p,
      order: i + 1,
    }));
    syncHomeCareProducts(updated);
  };

  const handleUpdateDetails = (index: number, fields: Partial<SelectedProduct>) => {
    const updated = [...selectedHomeProducts];
    updated[index] = { ...updated[index], ...fields };
    syncHomeCareProducts(updated);
  };

  // Recommender for Home Care
  const recommendationMock = {
    scores,
    anamnese: {} as any,
    visual: {} as any,
    client,
  };
  const compatibleRecommendations = getFlatCompatibleProducts(
    recommendationMock,
    products.filter((p) => p.targetUse === 'HOME_CARE' || p.targetUse === 'AMBOS')
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
          <Home className="w-3.5 h-3.5" /> Etapa 8 • Rotina de Cuidados em Casa (Home Care)
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Prescrição Cosmética para {client.name}
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Guia personalizado que o cabeleireiro entrega à cliente para garantir a longevidade dos resultados do salão.
        </p>
      </div>

      {/* Product Prescription Grid */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f72585]" /> Kit Essencial de Manutenção Residencial
          </h3>
          <span className="text-xs text-[#f72585] font-semibold">5 Passos de Cuidados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {/* Shampoo */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <span className="w-6 h-6 rounded-md bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-[0_0_6px_rgba(247,37,133,0.3)]">1</span>
              Shampoo Recomendado
            </div>
            <p className="text-xs text-slate-300 sm:pl-8 leading-relaxed">
              {homeCare.shampooRecommendation}
            </p>
          </div>

          {/* Condicionador */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <span className="w-6 h-6 rounded-md bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-[0_0_6px_rgba(247,37,133,0.3)]">2</span>
              Condicionador Selante
            </div>
            <p className="text-xs text-slate-300 sm:pl-8 leading-relaxed">
              {homeCare.conditionerRecommendation}
            </p>
          </div>

          {/* Máscara de Tratamento */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <span className="w-6 h-6 rounded-md bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-[0_0_6px_rgba(247,37,133,0.3)]">3</span>
              Máscara de Cronograma
            </div>
            <p className="text-xs text-slate-300 sm:pl-8 leading-relaxed">
              {homeCare.treatmentMask}
            </p>
          </div>

          {/* Leave-in & Termoprotetor */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <span className="w-6 h-6 rounded-md bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-[0_0_6px_rgba(247,37,133,0.3)]">4</span>
              Leave-in & Protetor Térmico
            </div>
            <p className="text-xs text-slate-300 sm:pl-8 leading-relaxed">
              {homeCare.leaveInThermalProtector}
            </p>
          </div>

          {/* Óleo Reparador de Pontas */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-1 md:col-span-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
              <span className="w-6 h-6 rounded-md bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-[0_0_6px_rgba(247,37,133,0.3)]">5</span>
              Óleo Reparador de Pontas Diário
            </div>
            <p className="text-xs text-slate-300 sm:pl-8 leading-relaxed">
              {homeCare.oilFinisher}
            </p>
          </div>
        </div>
      </div>

      {/* PRODUTOS ESPECÍFICOS SELECIONADOS NA BIBLIOTECA DO SALÃO */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182136] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#f72585]" /> Produtos Prescritos da Biblioteca para Home Care
              </h3>
              <span className="text-[10px] text-[#f72585] font-semibold px-2 py-0.5 rounded bg-[#f72585]/10 border border-[#f72585]/20">
                {selectedHomeProducts.length} Cosmético(s)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Opções compatíveis com a necessidade identificada. O profissional seleciona e orienta a cliente para aquisição no salão.
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
                <span>Acervo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => handleOpenSelector(null)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_12px_rgba(247,37,133,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Adicionar Produto Home Care</span>
            </button>
          </div>
        </div>

        {selectedHomeProducts.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#060913] border border-dashed border-[#1f283d] text-center space-y-2">
            <Package className="w-8 h-8 text-slate-500 mx-auto opacity-60" />
            <p className="text-xs font-semibold text-slate-300">Nenhum produto físico vinculado a este Home Care.</p>
            <p className="text-[11px] text-slate-500">
              Clique no botão abaixo para prescrever produtos do acervo do salão para a cliente levar.
            </p>
            <button
              type="button"
              onClick={() => handleOpenSelector(null)}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1b253f] text-xs font-semibold text-[#f72585] border border-[#f72585]/30 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Explorar Opções Compatíveis
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {selectedHomeProducts.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#060913] border border-[#1a2338] hover:border-[#f72585]/40 transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#141c2f]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider">
                        {item.brandSnapshot}
                      </span>
                      {item.lineSnapshot && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          • {item.lineSnapshot}
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#13192c] text-cyan-300 border border-cyan-800/30">
                        {item.macroCategorySnapshot}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                          item.inStockAtSelection
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                        }`}
                      >
                        {item.inStockAtSelection ? 'Disponível no Salão' : 'Sob Encomenda'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenSelector(idx)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30 transition-colors cursor-pointer"
                        title="Substituir produto"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-xs mt-1">
                    {item.nameSnapshot}
                  </h4>

                  {item.activesSnapshot && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.activesSnapshot.split(/[,+;]/).slice(0, 3).map((act, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-[#11172a] text-slate-300 border border-[#1f283d]"
                        >
                          {act.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orientação Residencial */}
                <div className="pt-2 border-t border-[#141c2f] space-y-1.5 text-xs">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-400">Frequência e Modo de Uso em Casa</label>
                    <input
                      type="text"
                      value={item.dosageOrOrientation || ''}
                      onChange={(e) => handleUpdateDetails(idx, { dosageOrOrientation: e.target.value })}
                      placeholder="Ex: 2x na semana, após o shampoo"
                      className="w-full px-2.5 py-1 rounded-lg bg-[#0a0f1d] border border-[#1f283d] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-slate-400">Observação da Profissional</label>
                    <input
                      type="text"
                      value={item.customNotes || ''}
                      onChange={(e) => handleUpdateDetails(idx, { customNotes: e.target.value })}
                      placeholder="Ex: Não passar na raiz; enxaguar 100%"
                      className="w-full px-2.5 py-1 rounded-lg bg-[#0a0f1d] border border-[#1f283d] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Care Calendar (Calendário Semanal) */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f72585]" /> Calendário Semanal Sugerido
          </h3>
          <span className="text-xs text-slate-400">Rotina Residencial</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {homeCare.weeklyCalendar.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] space-y-2 flex flex-col justify-between hover:border-[#f72585]/40 transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-[#f72585] block mb-1">
                  {item.day}
                </span>
                <p className="text-xs font-semibold text-white">
                  {item.action}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-[#182136] leading-relaxed">
                {item.products}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Washing & Habit Tips */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#f72585]" /> Recomendações de Ouro do Cabeleireiro
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {homeCare.washTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#060913] border border-[#1a2338] flex items-start gap-3 text-xs text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reavaliação e Retorno Programado */}
      {homeCare.monitoringFollowUp && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0c101d] to-[#141b2e] border border-[#f72585]/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f72585] uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#f72585]" /> Plano de Reavaliação & Retorno ao Salão
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {homeCare.monitoringFollowUp}
          </p>
          {homeCare.reassessmentPlan && (
            <p className="text-[11px] text-slate-400 pt-1 border-t border-[#1a2338]">
              <strong>Objetivo da Reavaliação:</strong> {homeCare.reassessmentPlan}
            </p>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] border border-[#1f283d] text-slate-300 text-sm font-semibold transition-colors cursor-pointer w-full sm:w-auto min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Tratamento</span>
        </button>

        <button
          id="btn-goto-report"
          type="button"
          onClick={onContinue}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer w-full sm:w-auto min-h-[48px] border border-[#ff66b2]/40"
        >
          <span>Gerar Relatório Profissional</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Modal: Opções compatíveis para Home Care */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1b2338] flex items-center justify-between bg-gradient-to-r from-[#11172a] to-[#0c101d]">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f72585]/10 text-[#f72585] text-[10px] font-bold tracking-wider uppercase mb-1 border border-[#f72585]/30">
                  <Sparkles className="w-3 h-3" /> Sugestão Inteligente Home Care
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Opções compatíveis com a necessidade identificada
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Produtos de manutenção para a cliente levar do salão. A escolha final é do profissional.
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
                    placeholder="Buscar cosmético para home care, ativo, marca..."
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
                  <span>Apenas com estoque no salão</span>
                </label>
              </div>

              {/* Macrocategorias Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {(
                  [
                    { id: 'TODAS', label: 'Todas' },
                    { id: 'HIDRATACAO', label: 'Hidratação' },
                    { id: 'NUTRICAO', label: 'Nutrição' },
                    { id: 'RECONSTRUCAO', label: 'Reconstrução' },
                    { id: 'CONDICIONAMENTO_ALINHAMENTO', label: 'Condicionadores' },
                    { id: 'PROTECAO', label: 'Leave-in & Proteção' },
                    { id: 'FINALIZACAO', label: 'Óleos & Séruns' },
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
                          {p.price && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-bold">
                              {p.price}
                            </span>
                          )}
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                              isAvailable
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                                : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                            }`}
                          >
                            {isAvailable ? 'No Salão' : 'Sob Encomenda'}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm">
                          {p.name}
                        </h4>

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
                          Prescrever
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-[#182136] bg-[#070b16] flex items-center justify-between text-xs text-slate-400">
              <span>{filteredOptions.length} opção(ões) de Home Care exibida(s)</span>
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
