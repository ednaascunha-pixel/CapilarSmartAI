import {
  SalonProduct,
  ProductCategory,
  CosmeticMacroCategory,
  ProductSupportTag,
  SelectedProduct,
  SalonProtocol,
  ScoringResult,
  VisualAnalysisData,
  AnamneseData,
  ClientData,
} from '../types';

export interface EvaluationInputForRecommendation {
  scores: ScoringResult;
  visual?: VisualAnalysisData;
  anamnese?: AnamneseData;
  client?: ClientData;
}

export interface CompatibleProductOption {
  product: SalonProduct;
  isPrimarySuggestion: boolean;
  compatibilityScore: number;
  compatibilityReasons: string[];
  availableInSalon: boolean;
}

export interface RecommendedStageOption {
  stageId: string;
  stageName: string;
  stepOrder: number;
  macroCategory: CosmeticMacroCategory;
  primaryNeedAddressed: string;
  rationale: string;
  defaultApplication: {
    quantityOrOrientation: string;
    pauseTimeMinutes: number;
    applicationMode: string;
    rinseOff: boolean;
  };
  compatibleProducts: CompatibleProductOption[];
}

export interface HomeCareSlotOption {
  slot: 'shampoo' | 'mascara' | 'condicionador' | 'leaveIn' | 'oleo' | 'couro';
  slotLabel: string;
  macroCategory: CosmeticMacroCategory;
  guidance: string;
  compatibleProducts: CompatibleProductOption[];
}

export interface RecommendedProductsResult {
  disclaimer: string;
  dominantNeed: string;
  targetDegree: number;
  stages: RecommendedStageOption[];
  homeCareSlots: HomeCareSlotOption[];
}

/**
 * Mapeia categorias detalhadas para as 7 macrocategorias cosméticas organizadas
 */
export function mapCategoryToMacro(category: ProductCategory | string): CosmeticMacroCategory {
  switch (category) {
    case 'MASCARA_HIDRATACAO':
      return 'HIDRATACAO';
    case 'MASCARA_NUTRICAO':
      return 'NUTRICAO';
    case 'MASCARA_RECONSTRUCAO':
      return 'RECONSTRUCAO';
    case 'ACIDIFICANTE':
    case 'CONDICIONADOR':
      return 'CONDICIONAMENTO_ALINHAMENTO';
    case 'LEAVE_IN':
      return 'PROTECAO';
    case 'SHAMPOO':
    case 'TONICO_COURO':
    case 'ESFOLIANTE_COURO':
      return 'COURO_CABELUDO';
    case 'OLEO_FINALIZADOR':
    case 'SERUM':
    case 'CREME_PENTEAR':
      return 'FINALIZACAO';
    default:
      return 'CONDICIONAMENTO_ALINHAMENTO';
  }
}

/**
 * Mapeia necessidades do motor para tags cosméticas de apoio
 */
export function getTagsForNeeds(scores: ScoringResult): ProductSupportTag[] {
  const tags: ProductSupportTag[] = [];
  if (scores.reconstructionNeed >= 50) tags.push('reconstrução', 'resistência');
  if (scores.nutritionNeed >= 50) tags.push('nutrição', 'maciez');
  if (scores.hydrationNeed >= 50) tags.push('hidratação', 'brilho');
  if (scores.frizzControlNeed >= 50) tags.push('frizz');
  if (scores.scalpBalanceNeed >= 60) tags.push('couro cabeludo');
  return tags;
}

/**
 * Cria snapshot seguro de produto selecionado no momento da prescrição (preservação histórica)
 */
export function createSelectedProductSnapshot(
  product: SalonProduct,
  stageName: string,
  overridesOrDosage?: Partial<SelectedProduct> | string,
  pauseTimeMinutes?: number,
  quantityOrOrientation?: string,
  applicationTechnique?: string,
  requiresRinse?: boolean,
  order?: number
): SelectedProduct {
  const isLeaveInOrOil =
    product.category === 'LEAVE_IN' ||
    product.category === 'OLEO_FINALIZADOR' ||
    product.category === 'SERUM' ||
    product.category === 'CREME_PENTEAR';

  const overrides: Partial<SelectedProduct> =
    typeof overridesOrDosage === 'object' && overridesOrDosage !== null
      ? overridesOrDosage
      : {
          dosageOrOrientation: typeof overridesOrDosage === 'string' ? overridesOrDosage : undefined,
          pauseTimeMinutes,
          quantityOrOrientation,
          applicationTechnique,
          requiresRinse,
          order,
        };

  return {
    id: overrides.id || `sel-${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    productId: product.id,
    nameSnapshot: product.name,
    brandSnapshot: product.brand,
    lineSnapshot: product.line,
    category: product.category,
    categorySnapshot: product.category,
    macroCategory: product.macroCategory || mapCategoryToMacro(product.category),
    macroCategorySnapshot: product.macroCategory || mapCategoryToMacro(product.category),
    function: product.purpose || product.description || 'Suporte cosmético à fibra',
    stage: stageName,
    stageLabel: overrides.stageLabel,
    quantityOrOrientation:
      overrides.quantityOrOrientation || 'Quantidade proporcional ao volume e comprimento dos fios.',
    dosageOrOrientation:
      overrides.dosageOrOrientation || overrides.quantityOrOrientation || 'Conforme orientação profissional.',
    pauseTimeMinutes:
      overrides.pauseTimeMinutes !== undefined
        ? overrides.pauseTimeMinutes
        : product.pauseTimeMinutes || 0,
    applicationMode:
      overrides.applicationMode ||
      product.usageInstructions ||
      'Distribuir uniformemente mecha a mecha, evitando a raiz.',
    applicationTechnique:
      overrides.applicationTechnique || overrides.applicationMode || product.usageInstructions || 'Aplicação mecha a mecha.',
    rinseOff: overrides.rinseOff !== undefined ? overrides.rinseOff : !isLeaveInOrOil,
    requiresRinse: overrides.requiresRinse !== undefined ? overrides.requiresRinse : (overrides.rinseOff !== undefined ? overrides.rinseOff : !isLeaveInOrOil),
    professionalNotes: overrides.professionalNotes || '',
    customNotes: overrides.customNotes || '',
    productType: product.productType || product.category,
    isCustomReplacement: overrides.isCustomReplacement ?? false,
    order: overrides.order,
    selectedAt: overrides.selectedAt || new Date().toISOString(),
    inStockAtSelection: overrides.inStockAtSelection ?? (product.inStock !== false),
    activesSnapshot: product.keyActives,
    pHSnapshot: product.pH,
  };
}

/**
 * getRecommendedProducts:
 * 1. Recebe as necessidades já calculadas pelo motor
 * 2. Identifica as categorias necessárias
 * 3. Procura produtos compatíveis na biblioteca
 * 4. Apresenta opções ao profissional com linguagem neutra ("Opções compatíveis com a necessidade identificada.")
 * NÃO afirma que produto é obrigatório; a escolha final cabe ao profissional.
 */
export function getRecommendedProducts(
  evaluation: EvaluationInputForRecommendation,
  treatmentPlan: SalonProtocol | undefined,
  productLibrary: SalonProduct[]
): RecommendedProductsResult {
  const { scores, visual } = evaluation;
  const isDegreeHigh = scores.damageGrade === 'GRAU_3' || scores.damageGrade === 'GRAU_4';
  const isPorous = visual?.porosity === 'ALTA';
  const isFragile = visual?.elasticity === 'BAIXA_EMBORRACHADO';

  const stages: RecommendedStageOption[] = [];

  // Etapa 1: Higienização
  const shampooOptions = scoreAndFilterProducts(
    productLibrary,
    ['SHAMPOO'],
    'COURO_CABELUDO',
    scores.scalpBalanceNeed > 60 ? ['couro cabeludo'] : ['hidratação', 'condicionamento'],
    scores
  );
  stages.push({
    stageId: 'stage-wash',
    stageName: '1. Higienização Preparatória',
    stepOrder: 1,
    macroCategory: 'COURO_CABELUDO',
    primaryNeedAddressed: scores.scalpBalanceNeed > 60 ? 'Limpeza com equilíbrio do couro cabeludo' : 'Higienização suave para abertura cuticular controlada',
    rationale: 'Opções compatíveis com a necessidade identificada de higienização.',
    defaultApplication: {
      quantityOrOrientation: '10ml a 15ml no couro cabeludo umedecido.',
      pauseTimeMinutes: 2,
      applicationMode: 'Massagear suavemente o couro cabeludo com as pontas dos dedos sem friccionar o comprimento.',
      rinseOff: true,
    },
    compatibleProducts: shampooOptions,
  });

  // Etapa 2: Acidificação ou Preparação Cuticular (se fibra porosa/fragilizada)
  if (isPorous || isFragile || isDegreeHigh) {
    const acidOptions = scoreAndFilterProducts(
      productLibrary,
      ['ACIDIFICANTE', 'CONDICIONADOR'],
      'CONDICIONAMENTO_ALINHAMENTO',
      ['condicionamento', 'resistência', 'frizz'],
      scores
    );
    stages.push({
      stageId: 'stage-acidification',
      stageName: '2. Acidificação & Equalização de Porosidade (pH Baixo)',
      stepOrder: 2,
      macroCategory: 'CONDICIONAMENTO_ALINHAMENTO',
      primaryNeedAddressed: 'Equilíbrio de pH e alinhamento cuticular contra porosidade excessiva',
      rationale: 'Opções compatíveis com a necessidade identificada de acidificação e alinhamento cuticular.',
      defaultApplication: {
        quantityOrOrientation: 'Quantidade suficiente para enluvar o comprimento e pontas.',
        pauseTimeMinutes: 5,
        applicationMode: 'Aplicar após o enxágue do shampoo, enluvando mecha a mecha no sentido do crescimento.',
        rinseOff: true,
      },
      compatibleProducts: acidOptions,
    });
  }

  // Etapa 3: Tratamento Intensivo de Bancada (focado na necessidade dominante)
  const dominant = scores.dominantNeed;
  let targetCategories: ProductCategory[] = [];
  let targetMacro: CosmeticMacroCategory = 'HIDRATACAO';
  let targetDesc = '';

  if (dominant === 'RECONSTRUCAO') {
    targetCategories = ['MASCARA_RECONSTRUCAO'];
    targetMacro = 'RECONSTRUCAO';
    targetDesc = 'Reposição proteica e suporte à resistência da fibra (aminoácidos / queratina)';
  } else if (dominant === 'NUTRICAO') {
    targetCategories = ['MASCARA_NUTRICAO'];
    targetMacro = 'NUTRICAO';
    targetDesc = 'Reposição lipídica e emoliência para redução de aspereza e rigidez';
  } else {
    targetCategories = ['MASCARA_HIDRATACAO'];
    targetMacro = 'HIDRATACAO';
    targetDesc = 'Reposição hídrica com umectantes para flexibilidade e retenção de água';
  }

  const maskOptions = scoreAndFilterProducts(
    productLibrary,
    targetCategories,
    targetMacro,
    dominant === 'RECONSTRUCAO' ? ['reconstrução', 'resistência'] : dominant === 'NUTRICAO' ? ['nutrição', 'maciez'] : ['hidratação', 'brilho'],
    scores
  );

  stages.push({
    stageId: 'stage-mask',
    stageName: `3. Tratamento Intensivo (${dominant.charAt(0).toUpperCase() + dominant.slice(1).toLowerCase()})`,
    stepOrder: 3,
    macroCategory: targetMacro,
    primaryNeedAddressed: targetDesc,
    rationale: 'Opções compatíveis com a necessidade identificada de tratamento intensivo.',
    defaultApplication: {
      quantityOrOrientation: '20g a 30g distribuídos homogeneamente.',
      pauseTimeMinutes: treatmentPlan?.pauseTimeMinutes || 10,
      applicationMode: 'Enluvar mecha por mecha, alinhando os fios e respeitando o tempo de pausa.',
      rinseOff: true,
    },
    compatibleProducts: maskOptions,
  });

  // Etapa 4: Selamento / Condicionamento
  const conditionerOptions = scoreAndFilterProducts(
    productLibrary,
    ['CONDICIONADOR', 'ACIDIFICANTE'],
    'CONDICIONAMENTO_ALINHAMENTO',
    ['condicionamento', 'maciez', 'brilho'],
    scores
  );
  stages.push({
    stageId: 'stage-seal',
    stageName: '4. Selamento Cuticular & Condicionamento',
    stepOrder: 4,
    macroCategory: 'CONDICIONAMENTO_ALINHAMENTO',
    primaryNeedAddressed: 'Selamento da cutícula para retenção dos ativos de tratamento',
    rationale: 'Opções compatíveis com a necessidade identificada de selamento e condicionamento.',
    defaultApplication: {
      quantityOrOrientation: '10ml a 15ml no comprimento e pontas.',
      pauseTimeMinutes: 3,
      applicationMode: 'Aplicar após o enxágue da máscara, deslizando suavemente os dedos e enxaguando abundantemente.',
      rinseOff: true,
    },
    compatibleProducts: conditionerOptions,
  });

  // Etapa 5: Proteção Térmica & Finalização
  const leaveInOptions = scoreAndFilterProducts(
    productLibrary,
    ['LEAVE_IN', 'CREME_PENTEAR'],
    'PROTECAO',
    ['proteção', 'frizz', 'alinhamento' as any],
    scores
  );
  stages.push({
    stageId: 'stage-protection',
    stageName: '5. Proteção Térmica & Leave-in',
    stepOrder: 5,
    macroCategory: 'PROTECAO',
    primaryNeedAddressed: 'Escudo protetor contra calor e atrito mecânico',
    rationale: 'Opções compatíveis com a necessidade identificada de proteção térmica.',
    defaultApplication: {
      quantityOrOrientation: 'Quantidade equivalente a uma moeda de 1 real.',
      pauseTimeMinutes: 0,
      applicationMode: 'Distribuir sobre os cabelos úmidos antes de qualquer secador ou difusor.',
      rinseOff: false,
    },
    compatibleProducts: leaveInOptions,
  });

  // Etapa 6: Óleo / Sérum Finalizador de Pontas
  const oilOptions = scoreAndFilterProducts(
    productLibrary,
    ['OLEO_FINALIZADOR', 'SERUM'],
    'FINALIZACAO',
    ['pontas', 'brilho', 'frizz'],
    scores
  );
  stages.push({
    stageId: 'stage-oil',
    stageName: '6. Finalização de Pontas & Antifrizz',
    stepOrder: 6,
    macroCategory: 'FINALIZACAO',
    primaryNeedAddressed: 'Proteção lipídica de pontas e controle de frizz estático',
    rationale: 'Opções compatíveis com a necessidade identificada de finalização e reparação de pontas.',
    defaultApplication: {
      quantityOrOrientation: '2 a 4 gotas friccionadas na palma das mãos.',
      pauseTimeMinutes: 0,
      applicationMode: 'Pressionar suavemente sobre as pontas e áreas com frizz residual.',
      rinseOff: false,
    },
    compatibleProducts: oilOptions,
  });

  // Home Care Slots
  const homeCareSlots: HomeCareSlotOption[] = [
    {
      slot: 'shampoo',
      slotLabel: 'Higienização Residencial (Shampoo)',
      macroCategory: 'COURO_CABELUDO',
      guidance: 'Shampoo com pH balanceado adequado à rotina.',
      compatibleProducts: shampooOptions.filter((opt) => opt.product.targetUse !== 'PROFISSIONAL'),
    },
    {
      slot: 'mascara',
      slotLabel: `Tratamento Semanal (${targetMacro})`,
      macroCategory: targetMacro,
      guidance: `Máscara focada na necessidade principal: ${targetDesc}.`,
      compatibleProducts: maskOptions.filter((opt) => opt.product.targetUse !== 'PROFISSIONAL'),
    },
    {
      slot: 'condicionador',
      slotLabel: 'Condicionador Selante',
      macroCategory: 'CONDICIONAMENTO_ALINHAMENTO',
      guidance: 'Condicionador de ação rápida para uso frequente.',
      compatibleProducts: conditionerOptions.filter((opt) => opt.product.targetUse !== 'PROFISSIONAL'),
    },
    {
      slot: 'leaveIn',
      slotLabel: 'Proteção Térmica / Leave-in',
      macroCategory: 'PROTECAO',
      guidance: 'Protetor térmico obrigatório antes de qualquer calor.',
      compatibleProducts: leaveInOptions.filter((opt) => opt.product.targetUse !== 'PROFISSIONAL'),
    },
    {
      slot: 'oleo',
      slotLabel: 'Finalizador de Pontas (Óleo / Sérum)',
      macroCategory: 'FINALIZACAO',
      guidance: 'Gotas de óleo para selamento diário das pontas.',
      compatibleProducts: oilOptions.filter((opt) => opt.product.targetUse !== 'PROFISSIONAL'),
    },
  ];

  return {
    disclaimer: 'Opções compatíveis com a necessidade identificada. A escolha final cabe ao profissional.',
    dominantNeed: dominant,
    targetDegree: scores.damageGrade === 'GRAU_4' ? 4 : scores.damageGrade === 'GRAU_3' ? 3 : scores.damageGrade === 'GRAU_2' ? 2 : 1,
    stages,
    homeCareSlots,
  };
}

/**
 * Retorna uma lista plana de opções compatíveis para fácil seleção pelo profissional
 */
export function getFlatCompatibleProducts(
  evaluation: EvaluationInputForRecommendation,
  productLibrary: SalonProduct[]
): { product: SalonProduct; compatibilityScore: number; reasons: string[] }[] {
  const result = getRecommendedProducts(evaluation, undefined, productLibrary);
  const map = new Map<string, { product: SalonProduct; compatibilityScore: number; reasons: string[] }>();

  for (const stage of result.stages) {
    for (const opt of stage.compatibleProducts) {
      if (!map.has(opt.product.id)) {
        map.set(opt.product.id, {
          product: opt.product,
          compatibilityScore: opt.compatibilityScore,
          reasons: opt.compatibilityReasons,
        });
      }
    }
  }

  for (const slot of result.homeCareSlots) {
    for (const opt of slot.compatibleProducts) {
      if (!map.has(opt.product.id)) {
        map.set(opt.product.id, {
          product: opt.product,
          compatibilityScore: opt.compatibilityScore,
          reasons: opt.compatibilityReasons,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Filtra e pontua produtos por compatibilidade com a necessidade
 */
function scoreAndFilterProducts(
  library: SalonProduct[],
  allowedCategories: ProductCategory[],
  macro: CosmeticMacroCategory,
  tags: ProductSupportTag[],
  scores: ScoringResult
): CompatibleProductOption[] {
  // Filtra apenas produtos ativos
  const activeProducts = library.filter((p) => p.active !== false);

  const scored: CompatibleProductOption[] = [];

  for (const prod of activeProducts) {
    let score = 0;
    const reasons: string[] = [];

    // Correspondência de Categoria
    if (allowedCategories.includes(prod.category)) {
      score += 50;
      reasons.push(`Categoria ${prod.category} correspondente`);
    } else if (prod.macroCategory === macro || mapCategoryToMacro(prod.category) === macro) {
      score += 35;
      reasons.push(`Macro-função cosmética ${macro}`);
    } else {
      // Categoria incompatível para esta etapa
      continue;
    }

    // Disponibilidade no Salão
    const available = prod.inStock !== false;
    if (available) {
      score += 20;
      reasons.push('Disponível no salão');
    } else {
      reasons.push('Não disponível no momento no salão');
    }

    // Tags de apoio
    const prodTags = prod.tags || [];
    for (const tag of tags) {
      if (prodTags.includes(tag)) {
        score += 10;
        reasons.push(`Atende ao objetivo cosmético: ${tag}`);
      }
    }

    // Ativos chave
    const activesText = `${prod.keyActives || ''} ${prod.keyIngredients?.join(' ') || ''} ${prod.activeIngredients?.join(' ') || ''}`.toLowerCase();
    if (scores.dominantNeed === 'RECONSTRUCAO' && (activesText.includes('queratina') || activesText.includes('aminoácido') || activesText.includes('proteína') || activesText.includes('arginina'))) {
      score += 15;
      reasons.push('Contém ativos de suporte proteico/resistência');
    }
    if (scores.dominantNeed === 'NUTRICAO' && (activesText.includes('óleo') || activesText.includes('manteiga') || activesText.includes('lipíd') || activesText.includes('pracaxi') || activesText.includes('argan') || activesText.includes('murumuru'))) {
      score += 15;
      reasons.push('Contém lipídios e agentes emolientes');
    }
    if (scores.dominantNeed === 'HIDRATACAO' && (activesText.includes('pantenol') || activesText.includes('aloe') || activesText.includes('glicerina') || activesText.includes('hialurônico'))) {
      score += 15;
      reasons.push('Contém umectantes de alta afinidade hídrica');
    }

    scored.push({
      product: prod,
      isPrimarySuggestion: false,
      compatibilityScore: score,
      compatibilityReasons: reasons,
      availableInSalon: available,
    });
  }

  // Ordena por disponibilidade (em estoque primeiro) e score decrescente
  scored.sort((a, b) => {
    if (a.availableInSalon && !b.availableInSalon) return -1;
    if (!a.availableInSalon && b.availableInSalon) return 1;
    return b.compatibilityScore - a.compatibilityScore;
  });

  if (scored.length > 0 && scored[0].availableInSalon) {
    scored[0].isPrimarySuggestion = true;
  }

  return scored;
}
