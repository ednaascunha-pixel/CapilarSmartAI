import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Sparkles,
  Package,
  Droplets,
  Shield,
  Layers,
  Search,
  Check,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  SlidersHorizontal,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  SalonProduct,
  ProductCategory,
  CosmeticMacroCategory,
  ProductSupportTag,
} from '../../types';
import { mapCategoryToMacro } from '../../utils/productRecommender';

interface ModalProdutosProps {
  isOpen: boolean;
  onClose: () => void;
  products: SalonProduct[];
  onSaveProduct: (product: SalonProduct) => void;
  onDeleteProduct: (id: string) => void;
}

const MACRO_CATEGORIES: { id: CosmeticMacroCategory | 'TODAS'; label: string; icon: string; desc: string }[] = [
  { id: 'TODAS', label: 'Todas as Macrocategorias', icon: '✦', desc: 'Acervo completo de cosméticos' },
  { id: 'HIDRATACAO', label: 'Hidratação', icon: '🌊', desc: 'Reposição hídrica, umectantes e flexibilidade' },
  { id: 'NUTRICAO', label: 'Nutrição', icon: '💧', desc: 'Óleos, manteigas e reposição lipídica' },
  { id: 'RECONSTRUCAO', label: 'Reconstrução', icon: '⚡', desc: 'Proteínas, aminoácidos e força cortical' },
  { id: 'CONDICIONAMENTO_ALINHAMENTO', label: 'Condicionamento & Alinhamento', icon: '🧪', desc: 'Acidificantes, selamento cuticular e maciez' },
  { id: 'PROTECAO', label: 'Proteção', icon: '🛡️', desc: 'Protetores térmicos e filtros UV' },
  { id: 'COURO_CABELUDO', label: 'Couro Cabeludo', icon: '🫧', desc: 'Limpeza, equilíbrio e controle de oleosidade' },
  { id: 'FINALIZACAO', label: 'Finalização & Pontas', icon: '✨', desc: 'Séruns, óleos e antifrizz' },
];

const SUPPORT_TAGS: { id: ProductSupportTag; label: string }[] = [
  { id: 'hidratação', label: 'Hidratação' },
  { id: 'nutrição', label: 'Nutrição' },
  { id: 'reconstrução', label: 'Reconstrução' },
  { id: 'frizz', label: 'Controle de Frizz' },
  { id: 'proteção', label: 'Proteção Térmica/UV' },
  { id: 'pontas', label: 'Pontas / Selamento' },
  { id: 'couro cabeludo', label: 'Couro Cabeludo' },
  { id: 'condicionamento', label: 'Condicionamento' },
  { id: 'definição', label: 'Definição' },
  { id: 'brilho', label: 'Brilho' },
  { id: 'maciez', label: 'Maciez' },
  { id: 'resistência', label: 'Resistência / Córtex' },
];

const CURVATURE_OPTIONS = ['1A-1C (Lisos)', '2A-2C (Ondulados)', '3A-3C (Cacheados)', '4A-4C (Crespos)'];

export const ModalProdutos: React.FC<ModalProdutosProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [selectedMacro, setSelectedMacro] = useState<CosmeticMacroCategory | 'TODAS'>('TODAS');
  const [selectedTag, setSelectedTag] = useState<ProductSupportTag | 'TODAS'>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUseFilter, setTargetUseFilter] = useState<'TODOS' | 'PROFISSIONAL' | 'HOME_CARE'>('TODOS');
  const [stockFilter, setStockFilter] = useState<'TODOS' | 'EM_ESTOQUE' | 'ESGOTADO'>('TODOS');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SalonProduct | null>(null);

  // Form State
  const [form, setForm] = useState<Partial<SalonProduct>>({
    name: '',
    brand: '',
    line: '',
    category: 'MASCARA_NUTRICAO',
    macroCategory: 'NUTRICAO',
    productType: 'Máscara Nutritiva',
    purpose: '',
    targetUse: 'AMBOS',
    pH: '4.0',
    keyActives: '',
    cosmeticBenefits: [],
    indications: '',
    contraindications: '',
    usageInstructions: '',
    pauseTimeMinutes: 10,
    suggestedFrequency: '1 vez por semana',
    professionalNotes: '',
    price: '',
    inStock: true,
    active: true,
    tags: ['nutrição'],
    indicatedCurvatures: [],
  });

  const [activeTagInput, setActiveTagInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  if (!isOpen) return null;

  const startCreate = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      brand: '',
      line: '',
      category: 'MASCARA_NUTRICAO',
      macroCategory: 'NUTRICAO',
      productType: 'Máscara de Tratamento',
      purpose: '',
      targetUse: 'AMBOS',
      pH: '4.0',
      keyActives: '',
      cosmeticBenefits: [],
      indications: '',
      contraindications: '',
      usageInstructions: '',
      pauseTimeMinutes: 10,
      suggestedFrequency: '1 vez por semana',
      professionalNotes: '',
      price: '',
      inStock: true,
      active: true,
      tags: ['nutrição'],
      indicatedCurvatures: [],
    });
    setIsAdding(true);
  };

  const startEdit = (product: SalonProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand,
      line: product.line || '',
      category: product.category,
      macroCategory: product.macroCategory || mapCategoryToMacro(product.category),
      productType: product.productType || '',
      purpose: product.purpose || '',
      targetUse: product.targetUse,
      pH: product.pH || '4.0',
      keyActives: product.keyActives,
      cosmeticBenefits: product.cosmeticBenefits || [],
      indications: product.indications || '',
      contraindications: product.contraindications || '',
      usageInstructions: product.usageInstructions || product.description || '',
      pauseTimeMinutes: product.pauseTimeMinutes ?? 10,
      suggestedFrequency: product.suggestedFrequency || '',
      professionalNotes: product.professionalNotes || '',
      price: product.price || '',
      inStock: product.inStock !== false,
      active: product.active !== false,
      tags: product.tags || [],
      indicatedCurvatures: product.indicatedCurvatures || [],
    });
    setIsAdding(true);
  };

  const toggleTag = (tag: ProductSupportTag) => {
    const list = form.tags || [];
    if (list.includes(tag)) {
      setForm({ ...form, tags: list.filter((t) => t !== tag) });
    } else {
      setForm({ ...form, tags: [...list, tag] });
    }
  };

  const toggleCurvature = (curv: string) => {
    const list = form.indicatedCurvatures || [];
    if (list.includes(curv)) {
      setForm({ ...form, indicatedCurvatures: list.filter((c) => c !== curv) });
    } else {
      setForm({ ...form, indicatedCurvatures: [...list, curv] });
    }
  };

  const handleToggleStock = (product: SalonProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: SalonProduct = {
      ...product,
      inStock: product.inStock === false ? true : false,
    };
    onSaveProduct(updated);
  };

  const handleToggleActive = (product: SalonProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: SalonProduct = {
      ...product,
      active: product.active === false ? true : false,
    };
    onSaveProduct(updated);
  };

  const filteredProducts = products.filter((p) => {
    // Macro-Category Match
    const pMacro = p.macroCategory || mapCategoryToMacro(p.category);
    const matchesMacro = selectedMacro === 'TODAS' || pMacro === selectedMacro;

    // Tag Match
    const matchesTag =
      selectedTag === 'TODAS' ||
      (p.tags && p.tags.includes(selectedTag));

    // Target Use Match
    const matchesTargetUse =
      targetUseFilter === 'TODOS' ||
      p.targetUse === targetUseFilter ||
      p.targetUse === 'AMBOS';

    // Stock Match
    const matchesStock =
      stockFilter === 'TODOS' ||
      (stockFilter === 'EM_ESTOQUE' && p.inStock !== false) ||
      (stockFilter === 'ESGOTADO' && p.inStock === false);

    // Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.line && p.line.toLowerCase().includes(q)) ||
      p.keyActives.toLowerCase().includes(q) ||
      (p.purpose && p.purpose.toLowerCase().includes(q)) ||
      (p.productType && p.productType.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));

    return matchesMacro && matchesTag && matchesTargetUse && matchesStock;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.brand?.trim()) return;

    const actives = form.keyActives?.trim() || 'Ativos selecionados';
    const keyIngredients = actives
      .split(/[,+;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const macro =
      form.macroCategory ||
      (form.category ? mapCategoryToMacro(form.category) : 'NUTRICAO');

    const savedProd: SalonProduct = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: form.name.trim(),
      brand: form.brand.trim(),
      line: form.line?.trim() || undefined,
      category: form.category || 'MASCARA_NUTRICAO',
      macroCategory: macro,
      productType: form.productType?.trim() || undefined,
      purpose: form.purpose?.trim() || undefined,
      targetUse: form.targetUse || 'AMBOS',
      pH: form.pH?.trim() || '4.0',
      keyActives: actives,
      keyIngredients,
      cosmeticBenefits: form.cosmeticBenefits || [],
      indications: form.indications?.trim() || undefined,
      contraindications: form.contraindications?.trim() || undefined,
      usageInstructions: form.usageInstructions?.trim() || undefined,
      description: form.usageInstructions?.trim() || form.purpose?.trim() || '',
      price: form.price?.trim() || 'R$ 0,00',
      pauseTimeMinutes: Number(form.pauseTimeMinutes) || 0,
      suggestedFrequency: form.suggestedFrequency?.trim() || undefined,
      professionalNotes: form.professionalNotes?.trim() || undefined,
      inStock: form.inStock !== false,
      active: form.active !== false,
      tags: form.tags && form.tags.length > 0 ? form.tags : ['nutrição'],
      indicatedCurvatures: form.indicatedCurvatures || [],
    };

    onSaveProduct(savedProd);
    setIsAdding(false);
    setEditingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b2338] flex items-center justify-between bg-gradient-to-r from-[#11172a] via-[#0c101d] to-[#0c101d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] shadow-[0_0_12px_rgba(247,37,133,0.25)] flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f72585]/10 text-[#f72585] text-[10px] font-bold tracking-wider uppercase mb-1 border border-[#f72585]/30 shadow-[0_0_8px_rgba(247,37,133,0.15)]">
                <Sparkles className="w-3 h-3" /> CAPILAR SMART IA • Biblioteca Cosmética
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Biblioteca & Estoque de Cosméticos
              </h2>
              <p className="text-xs text-slate-400">
                Catálogo técnico com Macrocategorias, ativos funcionais, disponibilidade no salão e tags para protocolos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#151c2e] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3 sm:p-4 border-b border-[#182136] bg-[#080c18] flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, marca, linha, ativo (ex: murumuru, queratina, ácido lático) ou tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#060913] border border-[#1d273e] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585]"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Destino Filter */}
            <div className="flex items-center gap-1 bg-[#060913] p-1 rounded-xl border border-[#1d273e]">
              {(
                [
                  { id: 'TODOS', label: 'Todos Usos' },
                  { id: 'PROFISSIONAL', label: 'Lavatório' },
                  { id: 'HOME_CARE', label: 'Home Care' },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setTargetUseFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    targetUseFilter === filter.id
                      ? 'bg-[#151c2e] text-[#f72585] border border-[#f72585]/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-1 bg-[#060913] p-1 rounded-xl border border-[#1d273e]">
              {(
                [
                  { id: 'TODOS', label: 'Estoque Geral' },
                  { id: 'EM_ESTOQUE', label: 'No Salão' },
                  { id: 'ESGOTADO', label: 'Esgotados' },
                ] as const
              ).map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStockFilter(filter.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    stockFilter === filter.id
                      ? 'bg-[#151c2e] text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isAdding) {
                  setIsAdding(false);
                  setEditingProduct(null);
                } else {
                  startCreate();
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_15px_rgba(247,37,133,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap border border-[#ff66b2]/40"
            >
              {isAdding ? (
                <span>Ver Catálogo</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Novo Produto</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Macrocategorias Carousel */}
        {!isAdding && (
          <div className="px-3 sm:px-4 py-2 border-b border-[#182136] bg-[#090d1a] space-y-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {MACRO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedMacro(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedMacro === cat.id
                      ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white shadow-[0_0_10px_rgba(247,37,133,0.3)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#13192c]'
                  }`}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Secondary Tags Filter */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 text-[11px]">
              <span className="text-slate-500 font-medium whitespace-nowrap mr-1">Filtrar Tag:</span>
              <button
                type="button"
                onClick={() => setSelectedTag('TODAS')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                  selectedTag === 'TODAS'
                    ? 'bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/40'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Todas
              </button>
              {SUPPORT_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
                    selectedTag === tag.id
                      ? 'bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/40'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  #{tag.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isAdding ? (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto bg-[#060913] p-5 sm:p-7 rounded-2xl border border-[#1a2338]">
              <div className="flex items-center justify-between pb-3 border-b border-[#161e31]">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#f72585]" />
                    {editingProduct ? 'Editar Especificações do Cosmético' : 'Cadastrar Novo Produto Cosmético'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Os dados cadastrados alimentam as opções compatíveis no protocolo e prescrição Home Care.
                  </p>
                </div>
                <span className="text-[10px] text-[#f72585] font-semibold px-2 py-0.5 rounded bg-[#f72585]/10 border border-[#f72585]/30">
                  Formulário Completo
                </span>
              </div>

              {/* Linha 1: Nome, Marca, Linha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nome do Produto *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Máscara Nutritiva de Murumuru & Pracaxi"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Marca / Fabricante *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Botânica Amazônia, Tricologia Pro..."
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Linha Cosmética</label>
                  <input
                    type="text"
                    placeholder="Ex: Biomas Brasileiros, Acidic Balance..."
                    value={form.line}
                    onChange={(e) => setForm({ ...form, line: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>
              </div>

              {/* Linha 2: Macrocategoria, Categoria Específica, Tipo de Produto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Macrocategoria *</label>
                  <select
                    value={form.macroCategory}
                    onChange={(e) => setForm({ ...form, macroCategory: e.target.value as CosmeticMacroCategory })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585]"
                  >
                    <option value="HIDRATACAO">Hidratação (Água / Umectação)</option>
                    <option value="NUTRICAO">Nutrição (Lipídios / Óleos)</option>
                    <option value="RECONSTRUCAO">Reconstrução (Córtex / Proteínas)</option>
                    <option value="CONDICIONAMENTO_ALINHAMENTO">Condicionamento / Alinhamento Cuticular</option>
                    <option value="PROTECAO">Proteção Térmica & UV</option>
                    <option value="COURO_CABELUDO">Couro Cabeludo</option>
                    <option value="FINALIZACAO">Finalização & Selamento de Pontas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Classificação Técnica</label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      setForm({
                        ...form,
                        category: cat,
                        macroCategory: mapCategoryToMacro(cat),
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585]"
                  >
                    <option value="MASCARA_NUTRICAO">Máscara de Nutrição / Manteigas</option>
                    <option value="MASCARA_HIDRATACAO">Máscara de Hidratação / Umectante</option>
                    <option value="MASCARA_RECONSTRUCAO">Máscara de Reconstrução / Córtex</option>
                    <option value="ACIDIFICANTE">Acidificante Cuticular (pH Baixo)</option>
                    <option value="SHAMPOO">Shampoo Suave / Purificante</option>
                    <option value="CONDICIONADOR">Condicionador Selante</option>
                    <option value="LEAVE_IN">Leave-in com Proteção Térmica</option>
                    <option value="OLEO_FINALIZADOR">Óleo Finalizador de Pontas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tipo de Produto</label>
                  <input
                    type="text"
                    placeholder="Ex: Máscara, Sérum, Acidificante, Ampola..."
                    value={form.productType}
                    onChange={(e) => setForm({ ...form, productType: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>
              </div>

              {/* Linha 3: Finalidade & Principais Ativos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Finalidade Cosmética</label>
                  <input
                    type="text"
                    placeholder="Ex: Reposição lipídica, neutralização de alcalinidade..."
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Principais Ativos (separados por vírgula) *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Queratina Biomimética, Óleo de Pracaxi, Ácido Lático..."
                    value={form.keyActives}
                    onChange={(e) => setForm({ ...form, keyActives: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>
              </div>

              {/* Linha 4: Destino, pH, Pausa, Preço */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Destinação de Uso</label>
                  <select
                    value={form.targetUse}
                    onChange={(e) => setForm({ ...form, targetUse: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585]"
                  >
                    <option value="AMBOS">Salão & Home Care</option>
                    <option value="PROFISSIONAL">Apenas Salão / Bancada</option>
                    <option value="HOME_CARE">Apenas Home Care</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Faixa de pH</label>
                  <input
                    type="text"
                    placeholder="Ex: 3.5 - 4.0"
                    value={form.pH}
                    onChange={(e) => setForm({ ...form, pH: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tempo Pausa (min)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    placeholder="Ex: 10"
                    value={form.pauseTimeMinutes ?? 0}
                    onChange={(e) => setForm({ ...form, pauseTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Preço Sugerido</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 89,90"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>
              </div>

              {/* Tags de Apoio para Seleção Rápida */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#0c101d] border border-[#1d273e]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Tags de Apoio para Seleção Rápida
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Usadas pelo sistema para cruzar com a necessidade identificada
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUPPORT_TAGS.map((t) => {
                    const isSelected = (form.tags || []).includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#f72585]/20 text-[#f72585] border-[#f72585] shadow-[0_0_8px_rgba(247,37,133,0.3)]'
                            : 'bg-[#060913] text-slate-400 border-[#1f283d] hover:border-slate-500'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}#{t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Curvaturas */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Curvaturas com Maior Afinidade</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {CURVATURE_OPTIONS.map((curv) => {
                    const isSelected = (form.indicatedCurvatures || []).includes(curv);
                    return (
                      <button
                        key={curv}
                        type="button"
                        onClick={() => toggleCurvature(curv)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#f72585]/20 text-white border-[#f72585]'
                            : 'bg-[#0c101d] text-slate-400 border-[#1f283d]'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{curv}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modo de Aplicação & Contraindicações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Modo de Aplicação / Modo de Uso</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Enluvar mecha a mecha respeitando o tempo de pausa; enxaguar abundantemente."
                    value={form.usageInstructions}
                    onChange={(e) => setForm({ ...form, usageInstructions: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Contraindicações / Atenções de Uso</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Evitar raiz em couros oleosos; não aplicar em couro cabeludo lesionado."
                    value={form.contraindications}
                    onChange={(e) => setForm({ ...form, contraindications: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f72585]"
                  />
                </div>
              </div>

              {/* Status Toggles: Ativo no Sistema & Disponível no Salão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#0c101d] border border-[#1d273e]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block">Disponível no Salão (Estoque Atual)</span>
                    <span className="text-[11px] text-slate-400">
                      Produtos indisponíveis não aparecem como primeira opção de seleção
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.inStock !== false}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="w-4 h-4 accent-[#f72585] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t sm:border-t-0 sm:border-l border-[#1d273e] pt-2 sm:pt-0 sm:pl-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Status Ativo</span>
                    <span className="text-[11px] text-slate-400">
                      Permite inativar temporariamente sem apagar do histórico
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.active !== false}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 accent-[#f72585] rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a2338]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_15px_rgba(247,37,133,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar na Biblioteca'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-400 bg-[#060913] rounded-2xl border border-[#1a2338]">
                  <Package className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-slate-300">Nenhum cosmético corresponde aos filtros.</p>
                  <p className="text-xs text-slate-500 mt-1">Tente ajustar os filtros acima ou cadastre um novo produto.</p>
                  <button
                    type="button"
                    onClick={startCreate}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13192c] hover:bg-[#1a233c] text-xs font-semibold text-[#f72585] border border-[#f72585]/30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Primeiro Cosmético
                  </button>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const activesList = p.keyIngredients && p.keyIngredients.length > 0
                    ? p.keyIngredients
                    : p.keyActives
                    ? p.keyActives.split(/[,+;]/).map((s) => s.trim()).filter(Boolean)
                    : [];

                  const pMacro = p.macroCategory || mapCategoryToMacro(p.category);

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-[#060913] border border-[#1a2338] hover:border-[#f72585]/40 transition-all flex flex-col justify-between group relative space-y-3"
                    >
                      <div>
                        {/* Top Meta Line */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider">
                                {p.brand}
                              </span>
                              {p.line && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  • {p.line}
                                </span>
                              )}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#13192c] text-cyan-300 border border-cyan-800/30">
                                {pMacro}
                              </span>
                              {p.pH && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#13192c] text-slate-300 border border-[#232e48]">
                                  pH {p.pH}
                                </span>
                              )}
                              {p.pauseTimeMinutes ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> {p.pauseTimeMinutes} min
                                </span>
                              ) : null}
                            </div>
                            <h4 className="font-bold text-white text-sm leading-snug">
                              {p.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {p.price && (
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                                {p.price}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => startEdit(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30 transition-colors cursor-pointer"
                              title="Editar especificações"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                              title="Excluir da biblioteca"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Purpose & Ativos */}
                        {p.purpose && (
                          <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-2">
                            {p.purpose}
                          </p>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-[#182136] space-y-2">
                          {/* Active Ingredients Chips */}
                          <div className="flex flex-wrap gap-1">
                            {activesList.slice(0, 4).map((act, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-[#13192c] text-slate-300 font-medium border border-[#1e273e]"
                              >
                                {act}
                              </span>
                            ))}
                          </div>

                          {/* Support Tags */}
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {p.tags.map((tg, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#101726] text-[#f72585] font-semibold border border-[#f72585]/20"
                                >
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          )}

                          {p.contraindications && (
                            <p className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                              <span className="line-clamp-1">{p.contraindications}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Bar with Quick Stock Toggle */}
                      <div className="mt-2 pt-2 border-t border-[#151c2e] flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#11172a] text-slate-300 border border-[#1f283d] font-medium">
                          {p.targetUse === 'PROFISSIONAL'
                            ? 'Lavatório / Bancada'
                            : p.targetUse === 'HOME_CARE'
                            ? 'Revenda Home Care'
                            : 'Lavatório & Home Care'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStock(p, e)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                              p.inStock !== false
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                            title="Clique para alternar disponibilidade no salão"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.inStock !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                            {p.inStock !== false ? 'Disponível no Salão' : 'Indisponível / Esgotado'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#182136] bg-[#070b16] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Total: <strong className="text-white">{products.length}</strong> produtos</span>
            <span>•</span>
            <span>No salão: <strong className="text-emerald-400">{products.filter((p) => p.inStock !== false).length}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] text-slate-300 font-semibold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
