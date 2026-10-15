export type FlowStep =
  | 'INICIO'
  | 'CLIENTE'
  | 'CADASTRO'
  | 'ANAMNESE'
  | 'ANALISE_VISUAL'
  | 'PONTUACAO'
  | 'RESULTADO'
  | 'TRATAMENTO_PROFISSIONAL'
  | 'HOME_CARE'
  | 'RELATORIO'
  | 'HISTORICO';

export type CurvatureType =
  | '1A' | '1B' | '1C'
  | '2A' | '2B' | '2C'
  | '3A' | '3B' | '3C'
  | '4A' | '4B' | '4C';

export type StrandThickness = 'FINO' | 'MEDIO' | 'GROSSO';
export type HairDensity = 'BAIXA' | 'MEDIA' | 'ALTA';
export type ScalpType = 'NORMAL' | 'OLEOSO' | 'SECO' | 'SENSIVEL';
export type ElasticityTest = 'SAUDAVEL' | 'MEDIA' | 'BAIXA_EMBORRACHADO';
export type PorosityTest = 'BAIXA' | 'MEDIA' | 'ALTA';
export type EndsState = 'INTEGRAS' | 'RESSECADAS' | 'DUPLAS' | 'MULTIPLAS_ESFARELADAS';
export type TensileResistance = 'BOA_RESISTENTE' | 'MODERADA' | 'FRAGIL_QUEBRADICO';
export type TouchSensation = 'MACIO_SEDOSO' | 'ASPERO_RIGIDO' | 'RESSECADO_OPOCO' | 'FRAGIL_QUEBRADICO';
export type FrizzLevel = 'LEVE' | 'MODERADO' | 'INTENSO';

export interface DigitalMicroscopeData {
  observedRegion?: string; // 'Couro Cabeludo / Topo', 'Comprimento Médio', 'Pontas', 'Linha Frontal'
  deviceImage?: string; // base64 / URL
  deviceFindings?: string[]; // 'Cutícula entreaberta/desgastada', 'Fissuras no córtex', 'Acúmulo sebáceo folicular', 'Descamação fina', 'Afinamento distal', 'Tricoptilose/ponta bifurcada', 'Fibra íntegra e alinhada'
  deviceNotes?: string;
}

export interface ClientData {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number | string;
  hairGoal: string; // Objetivo da cliente
  mainComplaint?: string; // Queixa principal
  notes?: string;
  archived?: boolean; // Se o cadastro está arquivado
  archivedAt?: string;
  createdAt: string;
}

export interface AnamneseData {
  scalpType: ScalpType;
  washFrequency: 'DIARIA' | '2_3_VEZES' | '1_VEZ_SEMANA';
  heatTools: 'DIARIO' | 'FREQUENTE' | 'OCASIONAL' | 'NUNCA';
  chemicalHistory: string[]; // ['Coloração', 'Descoloração/Mechas', 'Progressiva/Formol/Ácido', 'Relaxamento/Guanidina', 'Botox Capilar', 'Nenhuma']
  lastChemicalTime?: string; // 'Menos de 1 mês', '1 a 3 meses', '3 a 6 meses', 'Mais de 6 meses', 'Nunca'
  perceivedDamages: string[]; // ['Frizz excessivo', 'Quebra mecânica', 'Pontas ralas/bifurcadas', 'Falta de brilho/Opacidade', 'Aspereza ao toque', 'Emborrachamento']
  poolSunExposure: boolean;
  waterIntakeLiters: string;
}

export interface FacialHairAnalysisResult {
  faceShape: string;
  facialFeatures: string;
  hairCurvatureDetected?: CurvatureType;
  hairTextureDetected?: string;
  apparentHairCondition: string;
  visagismRecommendation: string;
  cosmeticProtocolRecommendation: string;
  summary: string;
  analyzedAt: string;
  source: 'ai' | 'expert-vision';
}

export interface VisualAnalysisData {
  curvature: CurvatureType;
  thickness: StrandThickness;
  density: HairDensity;
  elasticity: ElasticityTest;
  porosity: PorosityTest;
  endsState: EndsState;
  tensileResistance?: TensileResistance; // Resistência à tração mecânica
  touchSensation?: TouchSensation; // Toque e aspecto da fibra
  frizzLevel?: FrizzLevel; // Frizz
  colorCondition?: 'NATURAL' | 'COLORIDO_UNIFORME' | 'DESCOLORIDO_MECHAS' | 'BRANCOS_RESISTENTES';
  rootToTipDifference?: 'UNIFORME' | 'RAIZ_OLEOSA_PONTAS_SECAS' | 'COMPRIMENTO_DANIFICADO';
  professionalObservations?: string; // Observações da bancada
  microscope?: DigitalMicroscopeData; // Dados do aparelho / microscópio
  facialAnalysis?: FacialHairAnalysisResult; // Leitura facial e visagismo computacional
  facialAnalysisImage?: string; // Foto otimizada utilizada na leitura
}

export type CapillaryNeedKey =
  | 'HIDRATACAO'
  | 'NUTRICAO'
  | 'RECONSTRUCAO'
  | 'CONTROLE_FRIZZ'
  | 'EQUILIBRIO_COURO';

export type PriorityLevel = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface NeedDetail {
  key: CapillaryNeedKey;
  label: string;
  score: number; // 0 a 100
  priority: PriorityLevel;
  objective: string;
  description: string;
}

export interface ScoringResult {
  overallHealth: number; // 0 to 100
  healthGrade: 'A' | 'B' | 'C' | 'D';
  hydrationNeed: number; // 0 to 100
  nutritionNeed: number; // 0 to 100
  reconstructionNeed: number; // 0 to 100
  frizzControlNeed: number; // 0 to 100
  scalpBalanceNeed: number; // 0 to 100
  scalpHealth: number; // 0 to 100
  needsList: NeedDetail[];
  damageGrade: 'GRAU_1' | 'GRAU_2' | 'GRAU_3' | 'GRAU_4';
  damageGradeLabel: string;
  dominantNeed: CapillaryNeedKey;
  dominantNeedLabel: string;
  secondaryNeeds: string[];
  keyEvidences: string[]; // Principais evidências encontradas
  technicalJustification: string; // Justificativa técnica em linguagem simples
  recommendedTreatmentObjective: string; // Objetivo recomendado para o tratamento
  professionalObservations?: string;
  insufficientDataWarnings?: string[]; // Avisos de dados insuficientes
  evolutionComparison?: {
    hasPrevious: boolean;
    previousDate?: string;
    healthDiff?: number;
    improvedNeeds?: string[];
    worsenedNeeds?: string[];
    summary?: string;
  };
  scoreRationale: string[]; // Compatibilidade
}

export interface CosmeticFunctionCategory {
  categoryName: string;
  role: string;
  suggestedActives: string[];
}

export interface PersonalizedTreatmentData {
  primaryNeed: string; // "O que este cabelo mais precisa agora?"
  justification: string; // "Por que precisa?"
  priorityTreatment: string; // "Qual tratamento é prioritário?"
  treatmentType: string; // Tipo de tratamento
  suggestedFrequency: string; // "Qual deve ser a frequência?"
  homeCareGuidance: string; // "Quais cuidados devem ser mantidos em casa?"
  reassessmentPlan: string; // "Quando e o que reavaliar?"
  professionalObservation: string; // Observação profissional técnica
  precautions: string[]; // Cuidados / limitações
  cosmeticCategories: CosmeticFunctionCategory[]; // Categorias cosméticas e ativos sugeridos
  status: 'SUGERIDO' | 'VALIDADO_PROFISSIONAL' | 'AJUSTADO_PROFISSIONAL';
  professionalNotes?: string;
}

export interface SalonProtocolStep {
  title: string;
  description: string;
  tip?: string;
  matchedProductId?: string;
  matchedProductName?: string;
  matchedProductBrand?: string;
}

export interface SalonProtocol {
  protocolName: string;
  category: 'RECONSTRUCAO' | 'NUTRICAO' | 'HIDRATACAO' | 'CONTROLE_FRIZZ' | 'EQUILIBRIO_COURO' | 'TERAPIA_CAPILAR';
  targetIssue: string;
  objective: string;
  expectedDuration: string;
  pauseTimeMinutes: number;
  steps: SalonProtocolStep[];
  activeIngredients: string[];
  recommendedSalonFrequency: string;
  usedProducts: SalonProduct[];
  products?: SalonProduct[];
  selectedProducts?: SelectedProduct[];
  salonCycleSchedule: {
    week: number;
    treatment: string;
    focus: string;
  }[];
  // Cronograma capilar estruturado de 4 semanas
  schedule4Weeks?: FourWeekTreatmentSchedule;
  // Tratamento personalizado estruturado (Regras 4, 5, 6, 7, 8, 12)
  personalizedTreatment?: PersonalizedTreatmentData;
  justification?: string;
  treatmentType?: string;
  suggestedFrequency?: string;
  professionalObservation?: string;
  precautions?: string[];
  cosmeticCategories?: CosmeticFunctionCategory[];
  reassessmentPlan?: string;
  status?: 'SUGERIDO' | 'VALIDADO_PROFISSIONAL' | 'AJUSTADO_PROFISSIONAL';
  professionalNotes?: string;
}

export interface ScheduleWeek {
  weekNumber: 1 | 2 | 3 | 4;
  weekLabel: string; // "Semana 1", "Semana 2", etc.
  objective: string; // objetivo da semana
  mainTreatment: string; // tratamento principal
  complementaryTreatment?: string; // tratamento complementar, quando necessário
  protection: string; // cuidados / proteção (térmica, acidificação, uv, fricção)
  homeCare: string; // orientação de manutenção em casa
  professionalNote: string; // observação profissional
  reassessmentNotice?: string; // específico para semana 4 ("Reavaliar a fibra e comparar com a avaliação inicial.")
  treatmentCategory: 'HIDRATACAO' | 'NUTRICAO' | 'RECONSTRUCAO' | 'ACIDIFICACAO' | 'EQUILIBRIO_COURO' | 'MANUTENCAO';
  category?: 'HIDRATACAO' | 'NUTRICAO' | 'RECONSTRUCAO' | 'ACIDIFICACAO' | 'EQUILIBRIO_COURO' | 'MANUTENCAO';
  isReconstruction: boolean;
  status?: 'SUGERIDO' | 'VALIDADO' | 'AJUSTADO' | 'CONCLUIDO';
}

export interface ScalpCareGuidance {
  needsAttention: boolean;
  scalpType: ScalpType;
  cosmeticGuidance: string; // Cuidado cosmético específico sem misturar com a fibra
  hasSuspiciousSigns: boolean;
  suspiciousFindings?: string[];
  medicalReferralNotice?: string; // Encaminhamento se houver sinais persistentes/suspeitos
}

export interface ReassessmentComparisonField {
  key: 'elasticidade' | 'porosidade' | 'resistencia' | 'pontas' | 'frizz' | 'toque' | 'microscopia' | 'indiceGeral' | 'prioridades';
  label: string;
  initialValue: string;
}

export interface ReassessmentPreparation {
  prompt: string; // "Reavaliar a fibra e comparar com a avaliação inicial."
  targetWeek: 4;
  comparisonFields: ReassessmentComparisonField[];
  guidance: string;
}

export interface FourWeekTreatmentSchedule {
  id: string; // id único do cronograma
  evaluationId?: string; // vinculado à avaliação
  clientId: string; // vinculado à cliente
  createdAt: string;
  summary: string;
  strategyRhythm: string;
  dominantNeed: CapillaryNeedKey;
  week1: ScheduleWeek;
  week2: ScheduleWeek;
  week3: ScheduleWeek;
  week4: ScheduleWeek;
  weeks?: ScheduleWeek[];
  hasTechnicalEvidenceForReconstruction?: boolean;
  scalpGuidance: ScalpCareGuidance;
  reassessmentPrep: ReassessmentPreparation;
  status: 'SUGERIDO' | 'VALIDADO_PROFISSIONAL' | 'AJUSTADO_PROFISSIONAL';
  professionalNotes?: string;
  version: number;
}

export interface HomeCareItem {
  stepNumber: number;
  category: string;
  title: string;
  recommendation: string;
  howToUse: string;
  matchedProduct?: SalonProduct;
}

export interface HomeCareRoutine {
  shampooRecommendation: string;
  conditionerRecommendation: string;
  treatmentMask: string;
  leaveInThermalProtector: string;
  oilFinisher: string;
  items: HomeCareItem[];
  objective: string;
  usedProducts: SalonProduct[];
  products?: SalonProduct[];
  selectedProducts?: SelectedProduct[];
  washTips: string[];
  weeklyCalendar: {
    day: string;
    action: string;
    products: string;
  }[];
  monitoringFollowUp: string;
  reassessmentPlan?: string;
  cosmeticCategories?: CosmeticFunctionCategory[];
}

export interface AiEvaluationResponse {
  summary: string;
  professionalInsight: string;
  activeIngredients?: string[];
  salonStepByStep?: string;
  cronogramaSchedule?: string[];
  homeCareTip?: string;
  source?: 'ai' | 'engine' | 'ai-raw';
}

export interface FullEvaluationRecord {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  createdAt?: string;
  previousEvaluationId?: string; // Vinculação com a avaliação anterior da mesma cliente para comparativo
  evaluationMode?: 'INICIAL' | 'REAVALIACAO' | 'AVULSA'; // Modo da avaliação
  isDemoData?: boolean; // Sinalização para dados demonstrativos
  status?: 'EM_ANDAMENTO' | 'CONCLUIDA';
  anamnese: AnamneseData;
  visual: VisualAnalysisData;
  scores: ScoringResult;
  calculation?: ScoringResult;
  salonProtocol: SalonProtocol;
  homeCare: HomeCareRoutine;
  treatmentSchedule?: FourWeekTreatmentSchedule;
  aiInsights?: AiEvaluationResponse;
  professionalNotes?: string;
  evolutionNotes?: string; // Observações da evolução capilar (resposta ao tratamento, percepção, ajustes)
  nextEvaluationGoal?: string; // Previsão / objetivo para a próxima avaliação (ex: "Reavaliar em 4 semanas")
  images?: string[]; // Fotos e microscopia associadas individualmente a esta avaliação
}

export type ProductSupportTag =
  | 'hidratação'
  | 'nutrição'
  | 'reconstrução'
  | 'frizz'
  | 'proteção'
  | 'pontas'
  | 'couro cabeludo'
  | 'condicionamento'
  | 'definição'
  | 'brilho'
  | 'maciez'
  | 'resistência';

export type CosmeticMacroCategory =
  | 'HIDRATACAO'
  | 'NUTRICAO'
  | 'RECONSTRUCAO'
  | 'CONDICIONAMENTO_ALINHAMENTO'
  | 'PROTECAO'
  | 'COURO_CABELUDO'
  | 'FINALIZACAO';

export type TreatmentStage =
  | 'HIGIENIZACAO'
  | 'PREPARACAO_ACIDIFICACAO'
  | 'TRATAMENTO_PRINCIPAL'
  | 'TRATAMENTO_INTENSIVO'
  | 'CONDICIONAMENTO_SELAMENTO'
  | 'PROTECAO_FINALIZACAO'
  | 'HOME_CARE_ROTINA'
  | 'OUTRO';

export interface SelectedProduct {
  id?: string;
  productId: string;
  nameSnapshot: string;
  brandSnapshot: string;
  lineSnapshot?: string;
  category: string;
  categorySnapshot?: string;
  macroCategory?: CosmeticMacroCategory;
  macroCategorySnapshot?: CosmeticMacroCategory | string;
  function?: string;
  stage: TreatmentStage | string;
  stageLabel?: string;
  quantityOrOrientation?: string;
  dosageOrOrientation?: string;
  pauseTimeMinutes?: number;
  applicationMode?: string;
  applicationTechnique?: string;
  rinseOff?: boolean;
  requiresRinse?: boolean;
  professionalNotes?: string;
  customNotes?: string;
  productType?: string;
  isCustomReplacement?: boolean;
  order?: number;
  selectedAt?: string;
  inStockAtSelection?: boolean;
  activesSnapshot?: string;
  pHSnapshot?: string;
}

export type ProductCategory =
  | 'SHAMPOO'
  | 'MASCARA_HIDRATACAO'
  | 'MASCARA_NUTRICAO'
  | 'MASCARA_RECONSTRUCAO'
  | 'ACIDIFICANTE'
  | 'CONDICIONADOR'
  | 'LEAVE_IN'
  | 'OLEO_FINALIZADOR'
  | 'SERUM'
  | 'CREME_PENTEAR'
  | 'TONICO_COURO'
  | 'ESFOLIANTE_COURO';

export interface SalonProduct {
  id: string;
  name: string;
  brand: string;
  line?: string;
  category: ProductCategory;
  macroCategory?: CosmeticMacroCategory;
  productType?: string;
  purpose?: string;
  targetUse: 'PROFISSIONAL' | 'HOME_CARE' | 'AMBOS';
  keyActives: string;
  keyIngredients?: string[];
  activeIngredients?: string[];
  cosmeticBenefits?: string[];
  indications?: string;
  cautions?: string;
  contraindications?: string;
  usageInstructions?: string;
  pauseTimeMinutes?: number;
  suggestedFrequency?: string;
  professionalNotes?: string;
  active?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  pH?: string;
  description: string;
  price?: string;
  indicatedCurvatures?: string[];
  tags?: ProductSupportTag[];
  cosmeticFunction?: 'HIDRATACAO' | 'NUTRICAO' | 'RECONSTRUCAO' | 'ACIDIFICACAO' | 'EQUILIBRIO_COURO' | 'FINALIZACAO';
}

export interface SalonSettings {
  salonName: string;
  professionalName: string;
  phone: string;
  instagram: string;
  enableSenacBadge: boolean;
  defaultPauseTime: number;
  customNotes: string;
}

/**
 * Estrutura do Relatório Profissional da Avaliação Capilar
 * Reúne em uma única representação profissional todas as informações
 * geradas pelos módulos do sistema, sem recalcular ou reinventar dados.
 */
export interface ProfessionalReportData {
  evaluationId: string;
  evaluationDate: string;
  professionalName: string;
  salonName: string;
  salonPhone?: string;
  enableSenacBadge?: boolean;

  // 1. IDENTIFICAÇÃO DA CLIENTE
  client: {
    id: string;
    name: string;
    birthDate?: string;
    age?: number | string;
    phone?: string;
    email?: string;
  };

  // 2. OBJETIVO DA CLIENTE (Relato da cliente)
  clientObjective: {
    mainComplaints: string[];
    declaredGoals: string;
    resultExpectations?: string;
  };

  // 3. ANAMNESE (Relato/Histórico vs Avaliação profissional)
  anamnese: {
    scalpType: string;
    washFrequency: string;
    heatToolsUsage: string;
    chemicalHistory: string[];
    lastChemicalDateOrPeriod?: string;
    poolSunSeaExposure: boolean;
    waterIntakeLiters?: string;
    perceivedDamages: string[];
  };

  // 4. AVALIAÇÃO DA FIBRA
  fiberAssessment: {
    curvature: string;
    elasticity: string;
    porosity: string;
    thickness: string;
    density: string;
    tensileResistance: string;
    endsState: string;
    touchAspect: string;
    frizzAlignment: string;
    rootToTipDifference?: string;
    colorCondition?: string;
  };

  // 5. MICROSCOPIA / APARELHO DIGITAL
  microscopy?: {
    hasData: boolean;
    observedRegion?: string;
    findings: string[];
    observations?: string;
    image?: string;
  };

  // 6. ÍNDICE E NECESSIDADES (PRIORIDADE / NECESSIDADE)
  scoresAndNeeds: {
    overallHealthIndex: number; // 0 a 100
    healthGrade: 'A' | 'B' | 'C' | 'D';
    damageGrade: string; // GRAU_1 a GRAU_4
    damageGradeLabel: string;
    dominantNeedLabel: string;
    dominantNeedKey: string;
    hydrationPriority: number; // %
    nutritionPriority: number; // %
    reconstructionPriority: number; // %
    frizzControlNeed: number; // %
    scalpBalanceAttention: number; // %
    secondaryNeeds: string[];
  };

  // 7. JUSTIFICATIVAS TÉCNICAS (Geradas pelo motor)
  technicalJustifications: {
    primaryRationale: string;
    keyEvidences: string[];
    rationaleDetails: string[];
    treatmentObjectiveRecommended: string;
  };

  // 8. TRATAMENTO PERSONALIZADO
  treatmentPlan: {
    objective: string;
    priority: string;
    mainTreatment: string;
    complementaryTreatments?: string;
    frequency: string;
    pauseTimeMinutes: number;
    protocolSteps: SalonProtocolStep[];
    selectedProducts?: SelectedProduct[];
    professionalObservations?: string;
    precautions?: string[];
  };

  // 9. CRONOGRAMA DE 4 SEMANAS
  schedule4Weeks?: {
    summary: string;
    strategyRhythm: string;
    weeks: {
      weekNumber: 1 | 2 | 3 | 4;
      label: string;
      objective: string;
      treatment: string;
      careAndProtection: string;
      reassessmentNotice?: string;
    }[];
  };

  // 10. HOME CARE
  homeCare: {
    washingRoutine: {
      shampoo: string;
      conditioner: string;
    };
    treatmentMask: string;
    protection: string;
    finishingAndEnds: string;
    scalpCare?: string;
    weeklyRoutine: { day: string; action: string; products: string }[];
    observations: string[];
    selectedProducts?: SelectedProduct[];
  };

  // 11. OBSERVAÇÕES PROFISSIONAIS
  professionalObservations: {
    evaluationNotes?: string;
    evolutionNotes?: string;
    attentionPoints?: string[];
    professionalRecommendations?: string;
  };

  // 12. PRÓXIMA REAVALIAÇÃO
  nextReassessment: {
    guidance: string;
    goal: string;
    estimatedTimeframe: string;
  };

  // COMPARAÇÃO COM AVALIAÇÃO ANTERIOR (EVOLUÇÃO)
  evolutionComparison?: {
    hasPrevious: boolean;
    previousDate?: string;
    previousEvaluationId?: string;
    overallHealthChange?: {
      previous: number;
      current: number;
      diff: number;
      trend: 'MELHORA' | 'ESTABILIDADE' | 'NECESSIDADE_ATENCAO';
    };
    damageGradeChange?: {
      previous: string;
      current: string;
      text: string;
    };
    mainNeedsEvolution: {
      need: string;
      previousScore: number;
      currentScore: number;
      diff: number;
      trend: 'MELHORA' | 'ESTABILIDADE' | 'NECESSIDADE_ATENCAO';
    }[];
    fiberEvolution: {
      label: string;
      previous: string;
      current: string;
      trend: 'MELHORA' | 'ESTABILIDADE' | 'NECESSIDADE_ATENCAO';
    }[];
    message?: string;
  };
}
