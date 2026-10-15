import {
  AnamneseData,
  VisualAnalysisData,
  ScoringResult,
  SalonProtocol,
  HomeCareRoutine,
  ClientData,
  FullEvaluationRecord,
  SalonProduct,
  CapillaryNeedKey,
  PriorityLevel,
  NeedDetail,
  SalonProtocolStep,
  HomeCareItem,
  CosmeticFunctionCategory,
  PersonalizedTreatmentData,
  FourWeekTreatmentSchedule,
  ScheduleWeek,
  ScalpCareGuidance,
  ReassessmentPreparation,
  ReassessmentComparisonField,
} from '../types';

/**
 * CRUZAMENTO INTELIGENTE DOS DADOS DA AVALIAÇÃO CAPILAR
 * 
 * Ordem de peso:
 * 1. Avaliação técnica da fibra (peso ~40%)
 * 2. Análise visual/digital e observações do aparelho (peso ~25%)
 * 3. Anamnese (peso ~20%)
 * 4. Queixa e objetivo da cliente (peso ~15%)
 * 
 * As 5 necessidades analisadas (0 a 100):
 * - Hidratação (Reposição Hídrica)
 * - Nutrição (Reposição Lipídica)
 * - Reconstrução (Suporte à resistência e estrutura)
 * - Controle de Frizz (Alinhamento e selagem cuticular)
 * - Equilíbrio do Couro Cabeludo (Cuidados cosméticos da raiz)
 */
export function calculateCapillaryScores(
  anamnese: AnamneseData,
  visual: VisualAnalysisData,
  client?: ClientData | null,
  previousEvaluations?: FullEvaluationRecord[]
): ScoringResult {
  /*
   * CAPILAR SMART IA — MOTOR DE ANÁLISE E PONTUAÇÃO
   * Regra central:
   * percepção ≠ evidência técnica
   * necessidade ≠ percentual de dano
   * curvatura ≠ dano
   *
   * Esta função calcula prioridades cosméticas/profissionais.
   * Não realiza diagnóstico médico.
   */

  // ============================================================
  // 1. PONTUAÇÕES INICIAIS
  // ============================================================

  let healthScore = 100;

  let hydrationPoints = 0;
  let nutritionPoints = 0;
  let reconstructionPoints = 0;
  let frizzPoints = 0;
  let scalpBalancePoints = 0;

  let scalpHealth = 100;

  const evidences: string[] = [];
  const rationale: string[] = [];
  const warnings: string[] = [];

  const addEvidence = (text: string) => {
    if (text && !evidences.includes(text)) {
      evidences.push(text);
    }
  };

  const addWarning = (text: string) => {
    if (text && !warnings.includes(text)) {
      warnings.push(text);
    }
  };

  const addRationale = (text: string) => {
    if (text && !rationale.includes(text)) {
      rationale.push(text);
    }
  };

  const clamp = (value: number, min = 0, max = 100) =>
    Math.min(max, Math.max(min, Math.round(value)));

  // ============================================================
  // 2. CONTEXTO MORFOLÓGICO
  // ============================================================

  const curvature = visual.curvature;

  const isCurlyCoily = [
    '3A',
    '3B',
    '3C',
    '4A',
    '4B',
    '4C',
  ].includes(curvature);

  const isWavy = ['2A', '2B', '2C'].includes(curvature);

  /*
   * IMPORTANTE:
   * Curvatura não gera pontos de dano ou necessidade.
   * Ela serve apenas como contexto para aplicação do protocolo.
   */
  addEvidence(`Curvatura ${curvature} registrada como característica morfológica.`);

  if (isCurlyCoily) {
    addRationale(
      'A curvatura 3A–4C é considerada apenas como característica morfológica para adaptação da técnica e distribuição dos produtos, sem ser interpretada como dano.'
    );
  } else if (isWavy) {
    addRationale(
      'A curvatura ondulada é considerada apenas como característica morfológica, sem aumento automático de necessidade de tratamento.'
    );
  }

  // ============================================================
  // 3. ELASTICIDADE — EVIDÊNCIA ESTRUTURAL FORTE
  // ============================================================

  if (visual.elasticity === 'BAIXA_EMBORRACHADO') {
    healthScore -= 32;
    reconstructionPoints += 25;

    addEvidence('Elasticidade baixa/emborrachada.');
    addRationale(
      'A baixa resposta elástica é uma evidência estrutural relevante e aumenta a prioridade de reconstrução.'
    );
  } else if (visual.elasticity === 'MEDIA') {
    healthScore -= 14;
    reconstructionPoints += 18;
    nutritionPoints += 6;

    addEvidence('Elasticidade intermediária.');
    addRationale(
      'A elasticidade intermediária indica necessidade de acompanhamento da resistência da fibra e suporte preventivo.'
    );
  } else if (visual.elasticity === 'SAUDAVEL') {
    addEvidence('Elasticidade saudável.');
    addRationale(
      'A elasticidade saudável não confirma necessidade de reconstrução.'
    );
  }

  // ============================================================
  // 4. RESISTÊNCIA À TRAÇÃO
  // ============================================================

  if (visual.tensileResistance === 'FRAGIL_QUEBRADICO') {
    healthScore -= 20;
    reconstructionPoints += 20;

    addEvidence('Resistência à tração frágil/quebradiça.');
    addRationale(
      'A resistência frágil à tração é evidência estrutural para priorização de fortalecimento.'
    );
  } else if (visual.tensileResistance === 'MODERADA') {
    healthScore -= 8;
    reconstructionPoints += 10;

    addEvidence('Resistência à tração moderada.');
    addRationale(
      'A resistência moderada recomenda suporte preventivo e acompanhamento da resposta da fibra.'
    );
  } else if (visual.tensileResistance === 'BOA_RESISTENTE') {
    addEvidence('Boa resistência à tração.');
  }

  // ============================================================
  // 5. POROSIDADE
  // ============================================================

  if (visual.porosity === 'ALTA') {
    healthScore -= 18;

    hydrationPoints += 12;
    nutritionPoints += 10;
    frizzPoints += 10;
    reconstructionPoints += 6;

    addEvidence('Porosidade alta.');
    addRationale(
      'A porosidade alta aumenta a prioridade de hidratação, nutrição e controle de frizz.'
    );
  } else if (visual.porosity === 'MEDIA') {
    addEvidence('Porosidade média.');
    addRationale(
      'A porosidade média, isoladamente, não caracteriza dano estrutural.'
    );
  } else if (visual.porosity === 'BAIXA') {
    addEvidence('Porosidade baixa.');
  }

  // ============================================================
  // 6. TOQUE / ASPECTO
  // ============================================================

  if (visual.touchSensation === 'ASPERO_RIGIDO') {
    healthScore -= 10;

    nutritionPoints += 16;
    hydrationPoints += 10;
    frizzPoints += 8;

    addEvidence('Toque áspero/rígido.');
    addRationale(
      'Aspereza e rigidez são evidências cosméticas relevantes para suporte de nutrição, hidratação e alinhamento.'
    );
  } else if (visual.touchSensation === 'RESSECADO_OPOCO') {
    healthScore -= 8;

    hydrationPoints += 16;
    nutritionPoints += 8;

    addEvidence('Toque ressecado/opaco.');
    addRationale(
      'O toque ressecado/opaco aumenta a prioridade de reposição de água e suporte condicionante.'
    );
  } else if (visual.touchSensation === 'FRAGIL_QUEBRADICO') {
    healthScore -= 15;
    reconstructionPoints += 15;

    addEvidence('Toque frágil/quebradiço.');
    addRationale(
      'O toque frágil reforça a necessidade de atenção à resistência da fibra.'
    );
  } else if (visual.touchSensation === 'MACIO_SEDOSO') {
    addEvidence('Toque macio/sedoso.');
    addRationale(
      'O toque macio/sedoso não confirma necessidade reparadora intensa.'
    );
  }

  // ============================================================
  // 7. FRIZZ — ÚNICO ÍNDICE DE CONTROLE DE FRIZZ
  // ============================================================

  if (visual.frizzLevel === 'INTENSO') {
    frizzPoints += 35;

    addEvidence('Frizz intenso/desalinhamento observado.');
    addRationale(
      'O frizz intenso gera prioridade específica de controle de frizz.'
    );
  } else if (visual.frizzLevel === 'MODERADO') {
    frizzPoints += 20;

    addEvidence('Frizz moderado observado.');
    addRationale(
      'O frizz moderado indica necessidade cosmética de alinhamento e controle.'
    );
  } else if (visual.frizzLevel === 'LEVE') {
    frizzPoints += 10;

    addEvidence('Frizz leve observado.');
  }

  // ============================================================
  // 8. PONTAS
  // ============================================================

  if (visual.endsState === 'MULTIPLAS_ESFARELADAS') {
    healthScore -= 16;

    reconstructionPoints += 12;
    nutritionPoints += 8;
    frizzPoints += 8;

    addEvidence('Pontas múltiplas/esfareladas.');
    addRationale(
      'A alteração distal importante reforça a necessidade de cuidado com a integridade das pontas.'
    );
  } else if (visual.endsState === 'DUPLAS') {
    healthScore -= 9;

    reconstructionPoints += 6;
    nutritionPoints += 8;
    frizzPoints += 6;

    addEvidence('Pontas duplas.');
    addRationale(
      'Pontas duplas indicam alteração distal e necessidade de cuidado localizado.'
    );
  } else if (visual.endsState === 'RESSECADAS') {
    healthScore -= 6;

    hydrationPoints += 8;
    nutritionPoints += 8;

    addEvidence('Pontas ressecadas.');
    addRationale(
      'Pontas ressecadas aumentam a prioridade de condicionamento e reposição cosmética.'
    );
  } else if (visual.endsState === 'INTEGRAS') {
    addEvidence('Pontas íntegras.');
    addRationale(
      'Pontas íntegras não confirmam necessidade de reconstrução.'
    );
  }

  // ============================================================
  // 9. ESPESSURA E DENSIDADE
  // ============================================================

  /*
   * Não gerar dano apenas porque o fio é fino ou a densidade é baixa.
   * São informações contextuais para escolha da técnica e quantidade
   * de produto.
   */

  if (visual.thickness === 'FINO') {
    addEvidence('Fio fino registrado.');
    addRationale(
      'A espessura fina é considerada um fator técnico de aplicação e não uma confirmação de dano.'
    );
  } else if (visual.thickness === 'MEDIO') {
    addEvidence('Espessura média registrada.');
  } else if (visual.thickness === 'GROSSO') {
    addEvidence('Fio grosso registrado.');
  }

  if (visual.density === 'BAIXA') {
    addWarning(
      'Densidade baixa registrada; considerar distribuição e quantidade de produto na aplicação.'
    );
  }

  // ============================================================
  // 10. DIFERENÇA RAIZ–PONTAS
  // ============================================================

  if (visual.rootToTipDifference === 'RAIZ_OLEOSA_PONTAS_SECAS') {
    scalpBalancePoints += 10;
    hydrationPoints += 8;
    nutritionPoints += 8;

    addEvidence('Raiz oleosa e pontas secas.');
    addRationale(
      'A diferença entre raiz e pontas indica necessidade de abordagem zonal, evitando tratar todo o cabelo da mesma maneira.'
    );
  } else if (visual.rootToTipDifference === 'COMPRIMENTO_DANIFICADO') {
    healthScore -= 6;

    reconstructionPoints += 10;
    nutritionPoints += 8;

    addEvidence('Comprimento com alteração/dano observado.');
    addRationale(
      'A diferença de integridade no comprimento recomenda tratamento localizado e acompanhamento da evolução.'
    );
  } else if (visual.rootToTipDifference === 'UNIFORME') {
    addEvidence('Comportamento raiz–pontas uniforme.');
  }

  // ============================================================
  // 11. MICROSCOPIA
  // ============================================================

  const microscopyFindings = visual.microscope?.deviceFindings ?? [];

  const hasFinding = (term: string) =>
    microscopyFindings.some((finding) =>
      finding.toLowerCase().includes(term.toLowerCase())
    );

  if (hasFinding('fissura') || hasFinding('córtex')) {
    reconstructionPoints += 20;
    healthScore -= 16;

    addEvidence('Microscopia registrou alteração compatível com fissuras no córtex.');
    addRationale(
      'A observação microscópica de fissuras reforça a prioridade de suporte à integridade da fibra.'
    );
  }

  if (
    hasFinding('cutícula desgastada') ||
    hasFinding('cutícula aberta') ||
    hasFinding('cutícula irregular')
  ) {
    frizzPoints += 20;
    nutritionPoints += 12;
    hydrationPoints += 8;
    healthScore -= 10;

    addEvidence('Microscopia registrou desgaste/irregularidade de cutícula.');
    addRationale(
      'A alteração de cutícula contribui para necessidade de controle de frizz e condicionamento da fibra.'
    );
  }

  // ------------------------------------------------------------
  // Pontas: evitar duplicação com exame visual
  // ------------------------------------------------------------

  const endsAlreadySeverelyAltered =
    visual.endsState === 'MULTIPLAS_ESFARELADAS';

  if (hasFinding('tricoptilose') || hasFinding('ponta dupla')) {
    if (endsAlreadySeverelyAltered) {
      reconstructionPoints += 5;
      nutritionPoints += 4;

      addEvidence(
        'Microscopia confirmou alteração das pontas já registrada no exame visual; incremento reduzido para evitar duplicação.'
      );
    } else {
      reconstructionPoints += 12;
      nutritionPoints += 10;

      addEvidence('Microscopia registrou alteração nas pontas.');
      addRationale(
        'A confirmação microscópica das pontas reforça a evidência distal já observada.'
      );
    }
  }

  if (hasFinding('afinamento distal')) {
    reconstructionPoints += 10;
    healthScore -= 6;

    addEvidence('Microscopia registrou afinamento distal.');
  }

  if (
    hasFinding('fibra íntegra') ||
    hasFinding('fibra alinhada') ||
    hasFinding('coesão cuticular preservada')
  ) {
    addEvidence('Microscopia registrou fibra preservada/alinhada.');
    addRationale(
      'A observação de fibra preservada deve ser considerada na interpretação e evita superestimar dano.'
    );
  }

  // ============================================================
  // 12. COURO CABELUDO — LINGUAGEM COSMÉTICA
  // ============================================================

  if (anamnese.scalpType === 'OLEOSO') {
    scalpBalancePoints += 25;
    scalpHealth -= 14;

    addEvidence('Couro cabeludo classificado como oleoso.');
    addRationale(
      'Há necessidade cosmética de equilíbrio da oleosidade e adequação da rotina de higienização.'
    );
  } else if (anamnese.scalpType === 'SECO') {
    scalpBalancePoints += 20;
    hydrationPoints += 4;
    scalpHealth -= 8;

    addEvidence('Couro cabeludo classificado como seco.');
    addRationale(
      'O couro cabeludo seco direciona atenção para equilíbrio e conforto cosmético.'
    );
  } else if (anamnese.scalpType === 'SENSIVEL') {
    scalpBalancePoints += 20;
    scalpHealth -= 10;

    addEvidence('Couro cabeludo classificado como sensível.');

    addWarning(
      'Em caso de sensibilidade persistente, intensa ou associada a alterações incomuns, orientar avaliação dermatológica.'
    );
  }

  if (
    hasFinding('descamação') ||
    hasFinding('descamação fina') ||
    hasFinding('escamação')
  ) {
    scalpBalancePoints += 20;
    scalpHealth -= 18;

    addEvidence('Microscopia registrou descamação/escamação.');
    addRationale(
      'A descamação observada direciona atenção cosmética ao couro cabeludo.'
    );

    addWarning(
      'Se a descamação for persistente, intensa ou acompanhada de outros sinais, orientar avaliação dermatológica.'
    );
  }

  if (
    hasFinding('acúmulo sebáceo') ||
    hasFinding('sebo acumulado')
  ) {
    scalpBalancePoints += 20;
    scalpHealth -= 15;

    addEvidence('Microscopia registrou acúmulo sebáceo.');
    addRationale(
      'O acúmulo sebáceo observado direciona o cuidado para equilíbrio da oleosidade.'
    );
  }

  // ============================================================
  // 13. FREQUÊNCIA DE LAVAGEM + COURO CABELUDO
  // ============================================================

  if (
    anamnese.washFrequency === 'DIARIA' &&
    anamnese.scalpType === 'SECO'
  ) {
    scalpBalancePoints += 8;

    addEvidence(
      'Lavagem diária associada a couro cabeludo classificado como seco.'
    );

    addRationale(
      'A frequência de higienização deve ser considerada em conjunto com a característica do couro cabeludo.'
    );
  }

  if (
    anamnese.washFrequency === '1_VEZ_SEMANA' &&
    anamnese.scalpType === 'OLEOSO'
  ) {
    scalpBalancePoints += 8;

    addEvidence(
      'Lavagem espaçada associada a couro cabeludo classificado como oleoso.'
    );
  }

  // ============================================================
  // 14. EXPOSIÇÃO QUÍMICA
  // ============================================================

  const chemicalHistory = anamnese.chemicalHistory ?? [];

  const hasChemical = (terms: string[]) =>
    chemicalHistory.some((chemical) =>
      terms.some((term) =>
        chemical.toLowerCase().includes(term.toLowerCase())
      )
    );

  const hasBleaching = hasChemical([
    'descoloração',
    'descoloracao',
    'mechas',
    'luzes',
    'bleaching',
  ]);

  const hasStraightening = hasChemical([
    'progressiva',
    'formol',
    'ácido',
    'acido',
    'relaxamento',
    'guanidina',
    'botox',
    'alisamento',
  ]);

  const hasColoring = hasChemical([
    'coloração',
    'coloracao',
    'tinta',
    'coloração permanente',
    'coloracao permanente',
  ]);

  if (hasBleaching) {
    healthScore -= 18;

    reconstructionPoints += 18;
    hydrationPoints += 8;
    nutritionPoints += 8;

    addEvidence('Histórico de descoloração/mechas.');
    addRationale(
      'O histórico de descoloração aumenta a necessidade de acompanhamento da integridade e condicionamento da fibra.'
    );
  }

  if (hasStraightening) {
    healthScore -= 14;

    reconstructionPoints += 12;
    nutritionPoints += 10;
    hydrationPoints += 6;

    addEvidence('Histórico de procedimento químico de transformação.');
    addRationale(
      'O histórico químico é considerado como fator de exposição e deve ser cruzado com os testes da fibra.'
    );
  }

  if (hasColoring) {
    healthScore -= 5;

    nutritionPoints += 6;
    hydrationPoints += 6;

    addEvidence('Histórico de coloração.');
  }

  // ============================================================
  // 15. TEMPO DESDE A QUÍMICA
  // ============================================================

  const lastChemicalText = anamnese.lastChemicalTime?.toLowerCase() ?? '';

  const recentChemical =
    lastChemicalText.includes('semana') ||
    lastChemicalText.includes('dias') ||
    lastChemicalText.includes('menos de 1 mês') ||
    lastChemicalText.includes('menos de 1 mes') ||
    lastChemicalText.includes('1 mês') ||
    lastChemicalText.includes('1 mes');

  if (recentChemical && chemicalHistory.length > 0) {
    reconstructionPoints += 8;

    addEvidence('Procedimento químico informado como recente.');
    addRationale(
      'A proximidade do procedimento químico aumenta a necessidade de acompanhamento da resposta da fibra.'
    );
  }

  // ============================================================
  // 16. FERRAMENTAS TÉRMICAS
  // ============================================================

  if (anamnese.heatTools === 'DIARIO') {
    healthScore -= 12;

    hydrationPoints += 8;
    nutritionPoints += 6;
    frizzPoints += 10;

    addEvidence('Uso diário de ferramentas térmicas.');
    addRationale(
      'O uso diário de calor é um fator de exposição que aumenta a necessidade de proteção e condicionamento.'
    );
  } else if (anamnese.heatTools === 'FREQUENTE') {
    healthScore -= 7;

    hydrationPoints += 6;
    nutritionPoints += 5;
    frizzPoints += 7;

    addEvidence('Uso frequente de ferramentas térmicas.');
  }

  // ============================================================
  // 17. SOL / PISCINA
  // ============================================================

  if (anamnese.poolSunExposure) {
    hydrationPoints += 8;
    nutritionPoints += 6;
    healthScore -= 4;

    addEvidence('Exposição a sol/piscina informada.');
    addRationale(
      'A exposição ambiental direciona atenção para proteção e condicionamento cosmético.'
    );
  }

  // ============================================================
  // 18. CONVERGÊNCIA DE FRIZZ TÉCNICO
  // ============================================================

  const frizzTechnicalEvidence =
    visual.frizzLevel === 'MODERADO' ||
    visual.frizzLevel === 'INTENSO' ||
    visual.porosity === 'ALTA' ||
    visual.touchSensation === 'ASPERO_RIGIDO' ||
    microscopyFindings.some((finding) => {
      const value = finding.toLowerCase();
      return (
        value.includes('cutícula aberta') ||
        value.includes('cuticula aberta') ||
        value.includes('cutícula desgastada') ||
        value.includes('cuticula desgastada')
      );
    });

  // ============================================================
  // 19. PERCEPÇÃO DO CLIENTE
  // ============================================================

  const perceivedDamages = anamnese.perceivedDamages ?? [];

  const hasPerceived = (terms: string[]) =>
    perceivedDamages.some((item) =>
      terms.some((term) =>
        item.toLowerCase().includes(term.toLowerCase())
      )
    );

  const hasStructuralEvidence =
    visual.elasticity === 'BAIXA_EMBORRACHADO' ||
    visual.elasticity === 'MEDIA' ||
    visual.tensileResistance === 'FRAGIL_QUEBRADICO' ||
    visual.touchSensation === 'FRAGIL_QUEBRADICO' ||
    visual.endsState === 'MULTIPLAS_ESFARELADAS' ||
    hasFinding('fissura') ||
    hasFinding('afinamento distal');

  if (
    hasPerceived([
      'frizz',
      'cabelo armado',
      'desalinhamento',
    ])
  ) {
    if (frizzTechnicalEvidence) {
      frizzPoints += 8;

      addEvidence(
        'Queixa de frizz/desalinhamento com convergência de observação técnica.'
      );

      addRationale(
        'A percepção de frizz encontra suporte em sinais técnicos de desalinhamento, aspereza, porosidade ou cutícula.'
      );
    } else {
      frizzPoints += 4;

      addEvidence('Queixa de frizz/desalinhamento registrada pelo cliente.');
      addWarning(
        'A queixa de frizz foi registrada, mas não deve ser interpretada isoladamente como dano estrutural.'
      );
    }
  }

  if (
    hasPerceived([
      'emborrachamento',
      'emborrachado',
    ])
  ) {
    if (
      visual.elasticity === 'BAIXA_EMBORRACHADO' ||
      visual.tensileResistance === 'FRAGIL_QUEBRADICO'
    ) {
      reconstructionPoints += 10;

      addEvidence(
        'Queixa de emborrachamento com confirmação por avaliação da fibra.'
      );
    } else {
      addEvidence('Queixa de emborrachamento registrada pelo cliente.');
      addWarning(
        'A percepção de emborrachamento não foi confirmada pelos testes estruturais disponíveis.'
      );
    }
  }

  if (
    hasPerceived([
      'quebra',
      'quebrando',
      'quebrado',
    ])
  ) {
    if (hasStructuralEvidence) {
      reconstructionPoints += 10;

      addEvidence(
        'Queixa de quebra com convergência de evidências técnicas.'
      );

      addRationale(
        'A queixa de quebra recebe maior peso quando acompanhada por alterações observadas na fibra.'
      );
    } else {
      reconstructionPoints += 4;

      addEvidence('Queixa de quebra registrada pelo cliente.');
      addWarning(
        'A queixa de quebra não foi confirmada pelos testes estruturais disponíveis.'
      );
    }
  }

  if (
    hasPerceived([
      'falta de brilho',
      'opacidade',
      'sem brilho',
    ])
  ) {
    if (
      visual.touchSensation === 'RESSECADO_OPOCO' ||
      visual.porosity === 'ALTA'
    ) {
      hydrationPoints += 8;

      addEvidence(
        'Queixa de falta de brilho com evidência de ressecamento/opacidade ou porosidade elevada.'
      );
    } else {
      hydrationPoints += 4;

      addEvidence('Queixa estética de falta de brilho.');
    }
  }

  if (
    hasPerceived([
      'aspereza',
      'áspero',
      'aspera',
    ])
  ) {
    if (visual.touchSensation === 'ASPERO_RIGIDO') {
      nutritionPoints += 8;

      addEvidence(
        'Queixa de aspereza confirmada pelo teste de toque.'
      );
    } else {
      nutritionPoints += 4;

      addEvidence('Queixa de aspereza registrada pelo cliente.');
    }
  }

  if (
    hasPerceived([
      'pontas ralas',
      'pontas bifurcadas',
      'pontas finas',
    ])
  ) {
    if (
      visual.endsState === 'DUPLAS' ||
      visual.endsState === 'MULTIPLAS_ESFARELADAS'
    ) {
      nutritionPoints += 6;
      reconstructionPoints += 5;

      addEvidence(
        'Queixa de pontas alteradas confirmada pelo exame visual.'
      );
    } else {
      nutritionPoints += 3;

      addEvidence('Queixa de pontas alteradas registrada pelo cliente.');
      addWarning(
        'A percepção sobre as pontas não foi confirmada pela avaliação visual.'
      );
    }
  }

  // ============================================================
  // 20. OBJETIVOS DO CLIENTE
  // ============================================================

  const goal = client?.hairGoal?.toLowerCase() ?? '';

  const goalIncludes = (terms: string[]) =>
    terms.some((term) => goal.includes(term));

  const hasFrizzGoal = goalIncludes([
    'frizz',
    'armado',
    'alinhamento',
    'disciplinar',
  ]);

  const hasHydrationGoal = goalIncludes([
    'hidratação',
    'hidratacao',
    'brilho',
    'maciez',
    'ressecamento',
  ]);

  const hasNutritionGoal = goalIncludes([
    'nutrição',
    'nutricao',
    'definição',
    'definicao',
    'oleosidade',
    'umectação',
    'umectacao',
    'emoliência',
    'emoliencia',
  ]);

  const hasReconstructionGoal = goalIncludes([
    'reconstrução',
    'reconstrucao',
    'força',
    'forca',
    'quebra',
    'fortalecer',
  ]);

  if (hasFrizzGoal) {
    frizzPoints += frizzTechnicalEvidence ? 8 : 5;

    addEvidence('Objetivo do cliente relacionado a controle de frizz/alinhamento.');

    if (!frizzTechnicalEvidence) {
      addWarning(
        'O objetivo de controle de frizz é uma demanda cosmética e não confirma, sozinho, dano estrutural.'
      );
    }
  }

  if (hasHydrationGoal) {
    hydrationPoints +=
      visual.touchSensation === 'RESSECADO_OPOCO' ||
      visual.porosity === 'ALTA'
        ? 6
        : 4;

    addEvidence('Objetivo do cliente relacionado a hidratação/brilho/maciez.');
  }

  if (hasNutritionGoal) {
    nutritionPoints +=
      visual.touchSensation === 'ASPERO_RIGIDO' ||
      visual.porosity === 'ALTA'
        ? 6
        : 4;

    addEvidence('Objetivo do cliente relacionado a nutrição/definição/emoliência.');
  }

  if (hasReconstructionGoal) {
    if (hasStructuralEvidence) {
      reconstructionPoints += 6;

      addEvidence(
        'Objetivo de reconstrução com evidência estrutural convergente.'
      );
    } else {
      reconstructionPoints += 3;

      addEvidence('Objetivo do cliente relacionado a reconstrução/fortalecimento.');
      addWarning(
        'O objetivo de reconstrução foi registrado, mas não há evidência estrutural suficiente para classificá-lo como dano.'
      );
    }
  }

  if (
    goalIncludes([
      'couro cabeludo',
      'oleosidade',
      'descamação',
      'descamacao',
      'sensibilidade',
      'coceira',
      'queda',
    ])
  ) {
    scalpBalancePoints += 6;

    addEvidence(
      'Objetivo do cliente relacionado ao equilíbrio cosmético do couro cabeludo.'
    );

    if (
      goalIncludes([
        'coceira',
        'queda',
      ])
    ) {
      addWarning(
        'Queixas persistentes de coceira ou queda devem ser encaminhadas para avaliação profissional de saúde.'
      );
    }
  }

  // ============================================================
  // 21. OBSERVAÇÕES PROFISSIONAIS
  // ============================================================

  /*
   * Texto livre não é convertido automaticamente em pontuação.
   * Isso evita que o motor invente evidências a partir de palavras
   * não padronizadas.
   */

  if (visual.professionalObservations?.trim()) {
    addEvidence('Há observação profissional registrada para consulta.');
  }

  if (visual.microscope?.deviceNotes?.trim()) {
    addEvidence('Há observação complementar da microscopia registrada.');
  }

  // ============================================================
  // 22. NORMALIZAÇÃO
  // ============================================================

  hydrationPoints = clamp(hydrationPoints);
  nutritionPoints = clamp(nutritionPoints);
  reconstructionPoints = clamp(reconstructionPoints);
  frizzPoints = clamp(frizzPoints);
  scalpBalancePoints = clamp(scalpBalancePoints);

  healthScore = clamp(healthScore);
  scalpHealth = clamp(scalpHealth);

  // ============================================================
  // 23. GRAU DE INTEGRIDADE
  // ============================================================

  let damageGrade:
    | 'GRAU_1'
    | 'GRAU_2'
    | 'GRAU_3'
    | 'GRAU_4';

  if (
    visual.elasticity === 'BAIXA_EMBORRACHADO' ||
    reconstructionPoints >= 80 ||
    healthScore <= 38
  ) {
    damageGrade = 'GRAU_4';
  } else if (
    reconstructionPoints >= 65 ||
    (healthScore <= 58 && nutritionPoints >= 65)
  ) {
    damageGrade = 'GRAU_3';
  } else if (
    healthScore <= 75 ||
    reconstructionPoints >= 45 ||
    nutritionPoints >= 60
  ) {
    damageGrade = 'GRAU_2';
  } else {
    damageGrade = 'GRAU_1';
  }

  const damageGradeLabel =
    damageGrade === 'GRAU_1'
      ? 'Fibra com Boa Integridade / Necessidades Cosméticas Leves'
      : damageGrade === 'GRAU_2'
      ? 'Alterações Leves a Moderadas'
      : damageGrade === 'GRAU_3'
      ? 'Alterações Moderadas a Importantes'
      : 'Alterações Estruturais Importantes';

  // ============================================================
  // 24. HEALTH GRADE
  // ============================================================

  const healthGrade: 'A' | 'B' | 'C' | 'D' =
    healthScore >= 78
      ? 'A'
      : healthScore >= 60
      ? 'B'
      : healthScore >= 40
      ? 'C'
      : 'D';

  // ============================================================
  // 25. NECESSIDADES
  // ============================================================

  const priorityFromScore = (score: number): PriorityLevel =>
    score >= 70 ? 'ALTA' : score >= 40 ? 'MEDIA' : 'BAIXA';

  const needsList: NeedDetail[] = [
    {
      key: 'HIDRATACAO',
      label: 'Prioridade de Hidratação',
      score: hydrationPoints,
      priority: priorityFromScore(hydrationPoints),
      objective:
        'Reposição de água, melhora do toque, flexibilidade cosmética e aparência de brilho.',
      description:
        'Indicada principalmente quando há sinais de ressecamento, opacidade, porosidade elevada, exposição ou demanda cosmética compatível.',
    },
    {
      key: 'NUTRICAO',
      label: 'Prioridade de Nutrição',
      score: nutritionPoints,
      priority: priorityFromScore(nutritionPoints),
      objective:
        'Reposição lipídica, emoliência, maciez, controle de aspereza e melhora da maleabilidade.',
      description:
        'Indicada quando há aspereza, ressecamento, porosidade, alteração das pontas ou demanda de emoliência/definição.',
    },
    {
      key: 'RECONSTRUCAO',
      label: 'Prioridade de Reconstrução',
      score: reconstructionPoints,
      priority: priorityFromScore(reconstructionPoints),
      objective:
        'Suporte à resistência e integridade da fibra conforme os sinais técnicos encontrados.',
      description:
        'Prioridade baseada principalmente em elasticidade, resistência, toque frágil, fissuras e alterações importantes das pontas.',
    },
    {
      key: 'CONTROLE_FRIZZ',
      label: 'Necessidade de Controle de Frizz',
      score: frizzPoints,
      priority: priorityFromScore(frizzPoints),
      objective:
        'Redução do desalinhamento visual e melhora da disciplina cosmética dos fios.',
      description:
        'Considera frizz observado ou declarado, porosidade, aspereza e alterações de cutícula.',
    },
    {
      key: 'EQUILIBRIO_COURO',
      label: 'Atenção ao Equilíbrio do Couro Cabeludo',
      score: scalpBalancePoints,
      priority: priorityFromScore(scalpBalancePoints),
      objective:
        'Equilíbrio cosmético da rotina de higienização e cuidados do couro cabeludo.',
      description:
        'Considera oleosidade, ressecamento, sensibilidade e observações cosméticas realizadas durante a avaliação.',
    },
  ];

  // ============================================================
  // 26. DOMINÂNCIA
  // ============================================================

  const sortedNeeds = [...needsList].sort(
    (a, b) => b.score - a.score
  );

  const strongestNeed = sortedNeeds[0];

  /*
   * Abaixo de 40 não existe necessidade reparadora dominante.
   *
   * O contrato atual exige uma CapillaryNeedKey.
   * Por isso mantemos uma chave técnica de referência,
   * mas o LABEL passa a informar "Manutenção cosmética".
   */

  const hasRelevantNeed = strongestNeed.score >= 40;

  let dominantNeed: CapillaryNeedKey = strongestNeed.key;
  let dominantNeedLabel = strongestNeed.label;

  if (!hasRelevantNeed) {
    if (hasFrizzGoal || visual.frizzLevel === 'LEVE') {
      dominantNeed = 'CONTROLE_FRIZZ';
      dominantNeedLabel = 'Manutenção cosmética com foco em controle de frizz';
    } else if (hasHydrationGoal) {
      dominantNeed = 'HIDRATACAO';
      dominantNeedLabel = 'Manutenção cosmética com foco em hidratação';
    } else if (hasNutritionGoal) {
      dominantNeed = 'NUTRICAO';
      dominantNeedLabel = 'Manutenção cosmética com foco em nutrição';
    } else {
      dominantNeed = 'HIDRATACAO';
      dominantNeedLabel = 'Manutenção cosmética — sem necessidade reparadora dominante';
    }

    addRationale(
      'As prioridades ficaram abaixo do limiar técnico de 40 pontos; o foco recomendado é manutenção cosmética, sem justificar tratamento reparador intensivo.'
    );
  }

  const secondaryNeeds = needsList
    .filter(
      (need) =>
        need.key !== dominantNeed &&
        need.score >= 40
    )
    .sort((a, b) => b.score - a.score)
    .map((need) => need.label);

  // ============================================================
  // 27. JUSTIFICATIVA TÉCNICA DINÂMICA
  // ============================================================

  const justificationParts: string[] = [];

  if (visual.elasticity === 'SAUDAVEL') {
    justificationParts.push('elasticidade saudável');
  }

  if (visual.tensileResistance === 'BOA_RESISTENTE') {
    justificationParts.push('boa resistência à tração');
  }

  if (visual.porosity === 'MEDIA') {
    justificationParts.push('porosidade média');
  }

  if (visual.touchSensation === 'MACIO_SEDOSO') {
    justificationParts.push('toque macio/sedoso');
  }

  if (visual.endsState === 'INTEGRAS') {
    justificationParts.push('pontas íntegras');
  }

  if (visual.porosity === 'ALTA') {
    justificationParts.push('porosidade alta');
  }

  if (visual.touchSensation === 'ASPERO_RIGIDO') {
    justificationParts.push('aspereza/rigidez ao toque');
  }

  if (visual.touchSensation === 'RESSECADO_OPOCO') {
    justificationParts.push('ressecamento/opacidade ao toque');
  }

  if (visual.elasticity === 'BAIXA_EMBORRACHADO') {
    justificationParts.push('elasticidade baixa/emborrachada');
  }

  if (visual.tensileResistance === 'FRAGIL_QUEBRADICO') {
    justificationParts.push('resistência frágil à tração');
  }

  if (visual.endsState === 'DUPLAS') {
    justificationParts.push('pontas duplas');
  }

  if (visual.endsState === 'MULTIPLAS_ESFARELADAS') {
    justificationParts.push('pontas múltiplas/esfareladas');
  }

  if (hasFinding('fissura')) {
    justificationParts.push('fissuras observadas na microscopia');
  }

  if (
    hasFinding('cutícula aberta') ||
    hasFinding('cuticula aberta') ||
    hasFinding('cutícula desgastada') ||
    hasFinding('cuticula desgastada')
  ) {
    justificationParts.push('alteração de cutícula observada na microscopia');
  }

  if (hasBleaching) {
    justificationParts.push('histórico de descoloração');
  }

  if (
    anamnese.heatTools === 'DIARIO' ||
    anamnese.heatTools === 'FREQUENTE'
  ) {
    justificationParts.push('exposição térmica informada');
  }

  if (anamnese.poolSunExposure) {
    justificationParts.push('exposição a sol/piscina');
  }

  let technicalJustification = '';

  if (!hasRelevantNeed && damageGrade === 'GRAU_1') {
    technicalJustification =
      justificationParts.length > 0
        ? `Fibra com boa integridade geral, considerando ${justificationParts.join(
            ', '
          )}. As demandas registradas são predominantemente cosméticas e não justificam reconstrução intensiva.`
        : 'Fibra sem evidências estruturais relevantes nos dados preenchidos. Recomenda-se manutenção cosmética e acompanhamento.';
  } else {
    if (strongestNeed.key === 'RECONSTRUCAO') {
      technicalJustification =
        `Prioridade de Reconstrução, baseada em ${justificationParts.length > 0
          ? justificationParts.join(', ')
          : 'evidências estruturais registradas na avaliação'
        }.`;
    } else if (strongestNeed.key === 'NUTRICAO') {
      technicalJustification =
        `Prioridade de Nutrição, baseada em ${justificationParts.length > 0
          ? justificationParts.join(', ')
          : 'sinais cosméticos registrados na avaliação'
        }.`;
    } else if (strongestNeed.key === 'HIDRATACAO') {
      technicalJustification =
        `Prioridade de Hidratação, baseada em ${justificationParts.length > 0
          ? justificationParts.join(', ')
          : 'sinais de ressecamento/exposição registrados'
        }.`;
    } else if (strongestNeed.key === 'CONTROLE_FRIZZ') {
      technicalJustification =
        `Necessidade de Controle de Frizz, relacionada a ${justificationParts.length > 0
          ? justificationParts.join(', ')
          : 'frizz/desalinhamento registrado na avaliação'
        }.`;
    } else {
      technicalJustification =
        `Atenção ao equilíbrio cosmético do couro cabeludo, considerando ${justificationParts.length > 0
          ? justificationParts.join(', ')
          : 'os dados registrados na avaliação'
        }.`;
    }
  }

  // ============================================================
  // 28. OBJETIVO DE TRATAMENTO
  // ============================================================

  let recommendedTreatmentObjective = '';

  if (!hasRelevantNeed && damageGrade === 'GRAU_1') {
    recommendedTreatmentObjective =
      'Manutenção cosmética: preservar a integridade da fibra, controlar a demanda estética registrada e evitar intervenções reparadoras desnecessárias.';
  } else {
    const dominant = needsList.find(
      (need) => need.key === dominantNeed
    );

    recommendedTreatmentObjective =
      dominant?.objective ??
      'Manutenção cosmética e acompanhamento da resposta da fibra.';
  }

  // ============================================================
  // 29. AVISOS DE DADOS INSUFICIENTES
  // ============================================================

  if (!visual.tensileResistance) {
    addWarning(
      'Resistência à tração não preenchida; a avaliação estrutural fica parcialmente limitada.'
    );
  }

  if (!visual.touchSensation) {
    addWarning(
      'Avaliação de toque/aspecto não preenchida.'
    );
  }

  if (!visual.frizzLevel) {
    addWarning(
      'Nível de frizz não preenchido; a necessidade de controle de frizz pode estar subestimada.'
    );
  }

  if (!visual.microscope?.deviceFindings?.length) {
    addWarning(
      'Não há achados de microscopia preenchidos; a análise utiliza os demais dados disponíveis.'
    );
  }

  // ============================================================
  // 30. COMPARAÇÃO EVOLUTIVA — SOMENTE MESMO CLIENTE
  // ============================================================

  let evolutionComparison:
    | ScoringResult['evolutionComparison']
    | undefined;

  if (client?.id && previousEvaluations?.length) {
    const clientHistory = previousEvaluations
      .filter((evaluation) => evaluation.clientId === client.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      );

    if (clientHistory.length > 0) {
      const previous = clientHistory[0];

      const previousResult = previous.calculation || previous.scores;

      if (previousResult) {
        const healthDiff =
          healthScore - previousResult.overallHealth;

        const currentScores = {
          HIDRATACAO: hydrationPoints,
          NUTRICAO: nutritionPoints,
          RECONSTRUCAO: reconstructionPoints,
          CONTROLE_FRIZZ: frizzPoints,
          EQUILIBRIO_COURO: scalpBalancePoints,
        };

        const previousScores = {
          HIDRATACAO: previousResult.hydrationNeed,
          NUTRICAO: previousResult.nutritionNeed,
          RECONSTRUCAO: previousResult.reconstructionNeed,
          CONTROLE_FRIZZ: previousResult.frizzControlNeed,
          EQUILIBRIO_COURO: previousResult.scalpBalanceNeed,
        };

        const improvedNeeds: string[] = [];
        const worsenedNeeds: string[] = [];

        Object.keys(currentScores).forEach((key) => {
          const typedKey = key as CapillaryNeedKey;

          if (
            currentScores[typedKey] <
            previousScores[typedKey] - 10
          ) {
            improvedNeeds.push(key);
          }

          if (
            currentScores[typedKey] >
            previousScores[typedKey] + 10
          ) {
            worsenedNeeds.push(key);
          }
        });

        evolutionComparison = {
          hasPrevious: true,
          previousDate: previous.createdAt || previous.date,
          healthDiff,
          improvedNeeds,
          worsenedNeeds,
          summary:
            healthDiff > 5
              ? 'Houve melhora no índice geral de integridade em relação à avaliação anterior do mesmo cliente.'
              : healthDiff < -5
              ? 'Houve redução no índice geral de integridade em relação à avaliação anterior do mesmo cliente.'
              : 'O índice geral de integridade permaneceu relativamente estável em relação à avaliação anterior.',
        };
      }
    }
  }

  // ============================================================
  // 31. RESULTADO FINAL
  // ============================================================

  return {
    overallHealth: healthScore,
    healthGrade,

    hydrationNeed: hydrationPoints,
    nutritionNeed: nutritionPoints,
    reconstructionNeed: reconstructionPoints,

    frizzControlNeed: frizzPoints,

    scalpBalanceNeed: scalpBalancePoints,
    scalpHealth,

    needsList,

    damageGrade,
    damageGradeLabel,

    dominantNeed,
    dominantNeedLabel,

    secondaryNeeds,

    keyEvidences: evidences,

    technicalJustification,

    recommendedTreatmentObjective,

    professionalObservations:
      visual.professionalObservations,

    insufficientDataWarnings:
      warnings.length > 0 ? warnings : undefined,

    evolutionComparison,

    scoreRationale: rationale,
  };
}


/**
 * GERAÇÃO DO PROTOCOLO PROFISSIONAL E TRATAMENTO PERSONALIZADO NO SALÃO
 * Motor de Prescrição Capilar Baseado em Evidências Técnicas Reais
 */
export function generateSalonProtocol(
  scores: ScoringResult,
  visual: VisualAnalysisData,
  availableProducts: SalonProduct[] = [],
  anamnese?: AnamneseData,
  client?: ClientData | null
): SalonProtocol {
  // Mapeamento opcional de produtos cadastrados no salão
  const getProductByCategory = (category: SalonProduct['category']): SalonProduct | undefined => {
    return (
      availableProducts.find(
        (p) => p.category === category && (p.targetUse === 'PROFISSIONAL' || p.targetUse === 'AMBOS')
      ) || availableProducts.find((p) => p.category === category)
    );
  };

  const acidificante = getProductByCategory('ACIDIFICANTE');
  const shampoo = getProductByCategory('SHAMPOO');
  const mascaraReconstrucao = getProductByCategory('MASCARA_RECONSTRUCAO');
  const mascaraNutricao = getProductByCategory('MASCARA_NUTRICAO');
  const mascaraHidratacao = getProductByCategory('MASCARA_HIDRATACAO');
  const leaveIn = getProductByCategory('LEAVE_IN');
  const oleo = getProductByCategory('OLEO_FINALIZADOR');

  const usedProducts: SalonProduct[] = [];
  if (shampoo) usedProducts.push(shampoo);
  if (acidificante) usedProducts.push(acidificante);

  // Evidências físicas da fibra
  const microscopyFindings = visual.microscope?.deviceFindings ?? [];
  const hasMicroscopicFissures = microscopyFindings.some((f) => {
    const l = f.toLowerCase();
    return l.includes('fissura') || l.includes('córtex') || l.includes('afinamento distal');
  });

  const hasStructuralEvidence =
    visual.elasticity === 'BAIXA_EMBORRACHADO' ||
    visual.tensileResistance === 'FRAGIL_QUEBRADICO' ||
    visual.touchSensation === 'FRAGIL_QUEBRADICO' ||
    visual.endsState === 'MULTIPLAS_ESFARELADAS' ||
    hasMicroscopicFissures;

  const isHealthyFiber =
    scores.damageGrade === 'GRAU_1' &&
    visual.elasticity === 'SAUDAVEL' &&
    visual.tensileResistance === 'BOA_RESISTENTE' &&
    (visual.endsState === 'INTEGRAS' || visual.endsState === 'RESSECADAS');

  // Queixas e objetivos
  const chemicalHistory = anamnese?.chemicalHistory ?? [];
  const hasBleaching = chemicalHistory.some((c) =>
    ['descoloração', 'descoloracao', 'mechas', 'luzes'].some((t) => c.toLowerCase().includes(t))
  );
  const heatToolsDaily = anamnese?.heatTools === 'DIARIO' || anamnese?.heatTools === 'FREQUENTE';

  // CATEGORIAS E FUNÇÕES COSMÉTICAS (Regra 8)
  const catUmectantes: CosmeticFunctionCategory = {
    categoryName: 'Agentes Umectantes e Hidratantes',
    role: 'Atração de moléculas de água e retenção hídrica no interior da fibra',
    suggestedActives: ['D-Pantenol (Pró-vitamina B5)', 'Ácido Hialurônico', 'Extrato de Aloe Vera (Babosa)', 'Glicerina Vegetal'],
  };

  const catLipidios: CosmeticFunctionCategory = {
    categoryName: 'Lipídios, Óleos e Manteigas Nobres',
    role: 'Reposição do manto graxo, preenchimento intercelular e emoliência para redução de aspereza',
    suggestedActives: ['Manteiga de Murumuru', 'Óleo de Pracaxi', 'Manteiga de Karité', 'Ceramidas Vegetais', 'Óleo de Argan'],
  };

  const catProteinas: CosmeticFunctionCategory = {
    categoryName: 'Proteínas e Aminoácidos Biomiméticos',
    role: 'Reforço da resistência à tração e recomposição de pontes cistínicas danificadas',
    suggestedActives: ['Aminoácidos da Seda', 'Arginina', 'Queratina Hidrolisada de Baixo Peso Molecular', 'Creatina'],
  };

  const catAcidificantes: CosmeticFunctionCategory = {
    categoryName: 'Acidificantes Cuticulares Niveladores de pH',
    role: 'Fechamento e alinhamento das escamas cuticulares, retenção de nutrientes e brilho reflexivo',
    suggestedActives: ['Ácido Lático pH 3.0 a 3.5', 'Complexo Acidificante com Vinagre de Maçã Cosmético'],
  };

  const catTermoprotecao: CosmeticFunctionCategory = {
    categoryName: 'Agentes Filmógenos e Protetores Térmicos',
    role: 'Blindagem contra temperatura de secador/chapinha e barreira hidrofóbica contra umidade do ar',
    suggestedActives: ['Polímeros Termoprotetores até 230°C', 'Filtro UV Capilar', 'Silicones Nobres Solúveis'],
  };

  const catCouroCabeludo: CosmeticFunctionCategory = {
    categoryName: 'Agentes Cosméticos de Equilíbrio do Couro Cabeludo',
    role: 'Higienização suave sem sulfatos agressivos e normalização da oleosidade e do manto hidrolipídico da raiz',
    suggestedActives: ['Tensoativos Micelares Suaves', 'Extrato de Camomila', 'Zinco PCA', 'Prébióticos Reguladores'],
  };

  // ============================================================
  // CENÁRIOS DE TRATAMENTO PERSONALIZADO
  // ============================================================

  // 1. COMPROMETIMENTO ESTRUTURAL IMPORTANTE / RECONSTRUÇÃO PROPORCIONAL (Regras 1 e 4)
  if (
    (scores.dominantNeed === 'RECONSTRUCAO' && hasStructuralEvidence) ||
    scores.damageGrade === 'GRAU_4' ||
    (visual.elasticity === 'BAIXA_EMBORRACHADO' && scores.reconstructionNeed >= 40)
  ) {
    if (mascaraReconstrucao) usedProducts.push(mascaraReconstrucao);
    if (leaveIn) usedProducts.push(leaveIn);

    const primaryNeed = 'Recuperação Estrutural e Resistência da Fibra Capilar';
    const treatmentType = 'Reconstrução Molecular Progressiva com Reposição Gradual de Aminoácidos';
    const priorityTreatment = 'Protocolo de Resgate Estrutural & Carga Proteica Cortical';
    const suggestedFrequency = '1 sessão a cada 15 dias no salão (máximo 2 reconstruções no ciclo de 4 semanas), intercalando com nutrição';
    const reassessmentPlan = 'Reavaliação em 30 dias com teste mecânico de tração e elasticidade antes de qualquer nova intervenção química';

    const justification = `Indicado devido à confirmação de fragilidade estrutural física: elasticidade ${
      visual.elasticity === 'BAIXA_EMBORRACHADO' ? 'baixa/emborrachada' : 'intermediária'
    }, resistência à tração ${
      visual.tensileResistance === 'FRAGIL_QUEBRADICO' ? 'frágil/quebradiça' : 'moderada'
    } e pontas ${visual.endsState.toLowerCase().replace('_', ' ')}${
      hasBleaching ? ', agravadas por histórico químico de descoloração' : ''
    }. A reposição de aminoácidos é necessária para recuperar a coesão interna, respeitando pausas para não enrijecer o fio.`;

    const professionalObservation =
      'ATENÇÃO NA BANCADA: Enluvar cada mecha suavemente sem tracionar ou esticar excessivamente. Não aplicar força mecânica durante o enxágue. Intercalar obrigatoriamente com nutrição lipídica para manter a maleabilidade e flexibilidade.';

    const precautions = [
      'SUSPENDER imediatamente novos procedimentos químicos alcalinos (descolorações, mechas, alisamentos) durante o ciclo.',
      'Evitar o uso de chapinhas e ferramentas térmicas diretas acima de 180°C.',
      'Não realizar excesso de aplicações reconstrutoras seguidas para evitar efeito rebote de rigidez (overdose proteica).',
      'Desembaraçar sempre iniciando pelas pontas com escova de cerdas maleáveis.',
    ];

    const cosmeticCategories = [catProteinas, catAcidificantes, catLipidios, catTermoprotecao];

    const steps: SalonProtocolStep[] = [
      {
        title: 'Passo 1: Higienização Biomimética no Lavatório',
        description: shampoo
          ? `Higienizar suavemente com ${shampoo.name} (${shampoo.brand}). pH fisiológico limpando sem agredir o manto lipídico.`
          : 'Lavar os fios com Shampoo Suave sem sulfatos pesados em água morna a fria.',
        tip: 'Massagear apenas o couro cabeludo; deixar a espuma descer suavemente pelo comprimento sem atrito.',
        matchedProductId: shampoo?.id,
        matchedProductName: shampoo?.name,
        matchedProductBrand: shampoo?.brand,
      },
      {
        title: 'Passo 2: Acidificação Cuticular Prévia (pH 3.0)',
        description: acidificante
          ? `Aplicar no lavatório o ${acidificante.name} (${acidificante.brand}). pH ácido para nivelar cutículas e reter a carga proteica.`
          : 'Aplicar acidificante profissional de pH 3.0 para alinhamento inicial das cutículas.',
        tip: 'Tempo de pausa de 5 minutos antes da aplicação da máscara proteica.',
        matchedProductId: acidificante?.id,
        matchedProductName: acidificante?.name,
        matchedProductBrand: acidificante?.brand,
      },
      {
        title: 'Passo 3: Aplicação de Carga Proteica Cortical Biomimética',
        description: mascaraReconstrucao
          ? `Enluvar mecha a mecha com ${mascaraReconstrucao.name} (${mascaraReconstrucao.brand}). Ativos: ${mascaraReconstrucao.keyActives}.`
          : 'Aplicar máscara reconstrutora rica em aminoácidos biomiméticos, arginina e queratina hidrolisada.',
        tip: `Pausa de 10 a 15 minutos em touca simples sem calor excessivo. Curvatura ${visual.curvature} requer enluvamento lento e delicado.`,
        matchedProductId: mascaraReconstrucao?.id,
        matchedProductName: mascaraReconstrucao?.name,
        matchedProductBrand: mascaraReconstrucao?.brand,
      },
      {
        title: 'Passo 4: Enxágue Total e Blindagem Térmica',
        description: leaveIn
          ? `Enxaguar 100% com água fria e aplicar ${leaveIn.name} (${leaveIn.brand}) para blindagem térmica e proteção mecânica.`
          : 'Enxaguar 100% com água fria e finalizar com protetor térmico com polímeros protetores.',
        tip: 'Secar com jato morno sem tração mecânica na escova.',
        matchedProductId: leaveIn?.id,
        matchedProductName: leaveIn?.name,
        matchedProductBrand: leaveIn?.brand,
      },
    ];

    const salonCycleSchedule = [
      { week: 1, treatment: 'Reconstrução com Carga Proteica + Acidificação pH 3.0', focus: 'Estabilizar o rompimento e devolver coesão interna' },
      { week: 2, treatment: 'Nutrição Lipídica com Manteigas Nobres', focus: 'Devolver flexibilidade e evitar enrijecimento da fibra' },
      { week: 3, treatment: 'Hidratação Hídrica com D-Pantenol e Babosa', focus: 'Repor água e restaurar maleabilidade' },
      { week: 4, treatment: 'Reconstrução de Consolidação + Selagem de Cutícula', focus: 'Fixação proteica progressiva e proteção da fibra' },
    ];

    return {
      protocolName: 'Cauterização Molecular & Suporte Cortical SOS',
      category: 'RECONSTRUCAO',
      targetIssue: 'Fragilidade mecânica, baixa elasticidade e perda de massa proteica.',
      objective: 'Suporte à resistência e estrutura da fibra capilar com recuperação progressiva.',
      expectedDuration: '60 - 75 min',
      pauseTimeMinutes: 15,
      steps,
      activeIngredients: ['Complexo de Aminoácidos', 'Arginina', 'Queratina Biomimética', 'Ácido Lático pH 3.0'],
      recommendedSalonFrequency: suggestedFrequency,
      usedProducts,
      products: usedProducts,
      salonCycleSchedule,
      personalizedTreatment: {
        primaryNeed,
        justification,
        priorityTreatment,
        treatmentType,
        suggestedFrequency,
        homeCareGuidance: 'Higienização delicada, uso diário de protetor térmico e máscara reconstrutora a cada 15 dias.',
        reassessmentPlan,
        professionalObservation,
        precautions,
        cosmeticCategories,
        status: 'SUGERIDO',
      },
      justification,
      treatmentType,
      suggestedFrequency,
      professionalObservation,
      precautions,
      cosmeticCategories,
      reassessmentPlan,
      status: 'SUGERIDO',
    };
  }

  // 2. FIBRA SAUDÁVEL / GRAU 1 / DEMANDA ESTÉTICA (Regras 2 e 3)
  if (isHealthyFiber || (scores.damageGrade === 'GRAU_1' && scores.reconstructionNeed < 40 && scores.nutritionNeed < 40)) {
    if (mascaraHidratacao) usedProducts.push(mascaraHidratacao);
    if (leaveIn) usedProducts.push(leaveIn);

    const primaryNeed = 'Manutenção Cosmética Preventiva, Maleabilidade e Brilho';
    const treatmentType = 'Tratamento Cosmético Suave de Preservação e Alinhamento';
    const priorityTreatment = 'Protocolo de Manutenção Cosmética & Realce de Brilho Natural';
    const suggestedFrequency = '1 sessão a cada 21 a 30 dias no salão para manutenção preventiva';
    const reassessmentPlan = 'Reavaliação em 30 a 45 dias para acompanhar integridade das pontas e manutenção do brilho';

    const justification =
      'Fibra com excelente integridade estrutural, elasticidade saudável e boa resistência à tração. Não há evidência física de dano estrutural. A recomendação foca exclusivamente em manutenção cosmética (brilho, toque macio, flexibilidade e proteção diária), sem sobrecarregar a fibra com processos agressivos desnecessários.';

    const professionalObservation =
      'Fibra preservada: não aplicar procedimentos reconstrutores fortes nem acidificações de pH excessivamente baixo, para não enrijecer ou pesar os fios.';

    const precautions = [
      'Evitar o uso de máscaras pesadas ou químicas reconstrutoras que possam causar rigidez por acúmulo.',
      'Manter proteção térmica sempre que utilizar fontes de calor como secador ou difusor.',
      'Utilizar água morna ou fria no lavatório para preservar a cutícula naturalmente alinhada.',
    ];

    const cosmeticCategories = [catUmectantes, catLipidios, catTermoprotecao];

    const steps: SalonProtocolStep[] = [
      {
        title: 'Passo 1: Lavagem Micelar Suave',
        description: shampoo
          ? `Lavar com ${shampoo.name} (${shampoo.brand}) para limpeza delicada sem desengordurar em excesso.`
          : 'Higienização suave com shampoo micelar sem sulfatos pesados.',
        tip: 'Água em temperatura ambiente para preservar o alinhamento natural das cutículas.',
        matchedProductId: shampoo?.id,
        matchedProductName: shampoo?.name,
        matchedProductBrand: shampoo?.brand,
      },
      {
        title: 'Passo 2: Banho de Brilho com Ácido Hialurônico e D-Pantenol',
        description: mascaraHidratacao
          ? `Aplicar ${mascaraHidratacao.name} (${mascaraHidratacao.brand}) promovendo toque sedoso e emoliência.`
          : 'Aplicar máscara hidratante fluida rica em agentes umectantes como D-pantenol e babosa.',
        tip: 'Pausa rápida de 8 a 10 minutos para garantir maleabilidade sem peso.',
        matchedProductId: mascaraHidratacao?.id,
        matchedProductName: mascaraHidratacao?.name,
        matchedProductBrand: mascaraHidratacao?.brand,
      },
      {
        title: 'Passo 3: Selagem Suave de Lavatório',
        description: 'Condicionamento leve para estabilizar o pH fisiológico e selar os agentes umectantes.',
        tip: 'Enxaguar abundantemente com água fria.',
      },
      {
        title: 'Passo 4: Finalização com Proteção Térmica e Brilho',
        description: leaveIn
          ? `Finalizar com ${leaveIn.name} (${leaveIn.brand}) para movimento fluido e proteção contra radicais livres.`
          : 'Aplicar leave-in protetor térmico e filtro solar capilar.',
        tip: 'Secagem natural ou com escovação polida suave.',
        matchedProductId: leaveIn?.id,
        matchedProductName: leaveIn?.name,
        matchedProductBrand: leaveIn?.brand,
      },
    ];

    const salonCycleSchedule = [
      { week: 1, treatment: 'Hidratação Micelar com Ácido Hialurônico', focus: 'Maciez, hidratação e flexibilidade' },
      { week: 2, treatment: 'Nutrição Leve com Óleos Nobres', focus: 'Manto lipídico e alinhamento' },
      { week: 3, treatment: 'Hidratação Suave com D-Pantenol', focus: 'Retenção hídrica prolongada' },
      { week: 4, treatment: 'Selagem Cuticular e Brilho Espelhado', focus: 'Proteção preventiva e toque sedoso' },
    ];

    return {
      protocolName: 'Protocolo de Manutenção Cosmética & Realce de Brilho',
      category: 'HIDRATACAO',
      targetIssue: 'Demanda estética de brilho, toque macio e manutenção preventiva da fibra.',
      objective: 'Preservar a integridade natural da fibra, conferir brilho espelhado e toque sedoso.',
      expectedDuration: '40 - 45 min',
      pauseTimeMinutes: 10,
      steps,
      activeIngredients: ['Ácido Hialurônico', 'D-Pantenol', 'Extrato de Aloe Vera', 'Polímeros Termoprotetores'],
      recommendedSalonFrequency: suggestedFrequency,
      usedProducts,
      products: usedProducts,
      salonCycleSchedule,
      personalizedTreatment: {
        primaryNeed,
        justification,
        priorityTreatment,
        treatmentType,
        suggestedFrequency,
        homeCareGuidance: 'Lavagens suaves, uso de protetor térmico diário e hidratação semanal em casa.',
        reassessmentPlan,
        professionalObservation,
        precautions,
        cosmeticCategories,
        status: 'SUGERIDO',
      },
      justification,
      treatmentType,
      suggestedFrequency,
      professionalObservation,
      precautions,
      cosmeticCategories,
      reassessmentPlan,
      status: 'SUGERIDO',
    };
  }

  // 3. CONTROLE DE FRIZZ / CUTÍCULA DESGASTADA / ALTA POROSIDADE (Regra 5)
  if (
    scores.dominantNeed === 'CONTROLE_FRIZZ' ||
    (scores.frizzControlNeed >= 45 && visual.frizzLevel === 'INTENSO')
  ) {
    if (mascaraNutricao) usedProducts.push(mascaraNutricao);
    if (leaveIn) usedProducts.push(leaveIn);

    const primaryNeed = 'Controle de Frizz, Nivelamento Cuticular e Disciplina';
    const treatmentType = 'Alinhamento Cuticular Disciplinante com Acidificação e Agentes Filmógenos';
    const priorityTreatment = 'Protocolo de Acidificação Cuticular & Blindagem Antifrizz';
    const suggestedFrequency = '1 sessão a cada 15 dias no salão durante o ciclo de alinhamento';
    const reassessmentPlan = 'Reavaliação em 30 dias avaliando alinhamento cuticular ao microscópio e resposta à umidade';

    const justification = `Indicado pela presença de frizz ${visual.frizzLevel.toLowerCase()}, porosidade ${visual.porosity.toLowerCase()} e ${
      visual.touchSensation === 'ASPERO_RIGIDO' ? 'aspereza ao toque' : 'sensibilidade à umidade'
    }. As cutículas necessitam de nivelamento por pH ácido e preenchimento lipídico para estabilizar a carga eletrostática e reduzir o desalinhamento.`;

    const professionalObservation =
      'O enluvamento deve ser minucioso no sentido raiz-pontas. Secar com o bico direcionador do secador alinhado paralelamente aos fios para fechar as escamas mecânica e termicamente.';

    const precautions = [
      'Evitar esfregar o cabelo com toalhas convencionais felpudas; recomendar toalha de microfibra ou algodão.',
      'Indispensável o uso de protetor térmico com ativos filmógenos antes de qualquer secador.',
      'Controlar a temperatura do secador para evitar dilatação cuticular excessiva.',
    ];

    const cosmeticCategories = [catAcidificantes, catLipidios, catTermoprotecao, catUmectantes];

    const steps: SalonProtocolStep[] = [
      {
        title: 'Passo 1: Higienização Micelar Alinhadora',
        description: shampoo
          ? `Lavar com ${shampoo.name} (${shampoo.brand}) para remoção de resíduos e cargas estáticas.`
          : 'Lavar com shampoo micelar suave e sulfato-free em água morna a fria.',
        tip: 'Usar água morna a fria; a água quente estimula o frizz e dilata as cutículas.',
        matchedProductId: shampoo?.id,
        matchedProductName: shampoo?.name,
        matchedProductBrand: shampoo?.brand,
      },
      {
        title: 'Passo 2: Acidificação de Alinhamento Cuticular (pH 3.0)',
        description: acidificante
          ? `Aplicar ${acidificante.name} (${acidificante.brand}) mecha a mecha alinhando com pente de dentes largos.`
          : 'Aplicar acidificante de pH 3.0 a 3.5 com enluvamento mecha a mecha.',
        tip: 'A estabilização ácida reduz instantaneamente as cargas estáticas causadoras do frizz.',
        matchedProductId: acidificante?.id,
        matchedProductName: acidificante?.name,
        matchedProductBrand: acidificante?.brand,
      },
      {
        title: 'Passo 3: Máscara Disciplinante Antiumidade',
        description: mascaraNutricao
          ? `Aplicar ${mascaraNutricao.name} promovendo emoliência, alinhamento e peso cosmético controlado.`
          : 'Aplicar máscara nutritiva emoliente rica em óleos vegetais de murumuru e pracaxi.',
        tip: 'Pausa de 12 minutos no lavatório com touca térmica suave.',
        matchedProductId: mascaraNutricao?.id,
        matchedProductName: mascaraNutricao?.name,
        matchedProductBrand: mascaraNutricao?.brand,
      },
      {
        title: 'Passo 4: Blindagem Térmica e Antifrizz',
        description: leaveIn
          ? `Finalizar com ${leaveIn.name} (${leaveIn.brand}) garantindo termoproteção e escudo contra umidade.`
          : 'Aplicar leave-in antifrizz termoativado com polímeros protetores.',
        tip: 'Secar com secador mantendo o bico direcionado no sentido de crescimento dos fios.',
        matchedProductId: leaveIn?.id,
        matchedProductName: leaveIn?.name,
        matchedProductBrand: leaveIn?.brand,
      },
    ];

    const salonCycleSchedule = [
      { week: 1, treatment: 'Acidificação Intensiva + Nutrição Alinhadora', focus: 'Selagem de cutículas e antiestática' },
      { week: 2, treatment: 'Hidratação Hídrica com Ácido Hialurônico', focus: 'Equilíbrio de umidade interna da fibra' },
      { week: 3, treatment: 'Nutrição Lipídica Disciplinante', focus: 'Maleabilidade e peso cosmético natural' },
      { week: 4, treatment: 'Blindagem Térmica de Manutenção', focus: 'Resistência duradoura anti-umidade' },
    ];

    return {
      protocolName: 'Blindagem Cuticular & Alinhamento Anti-Frizz',
      category: 'CONTROLE_FRIZZ',
      targetIssue: 'Frizz desalinhado, cutículas abertas/desgastadas e sensibilidade à umidade.',
      objective: 'Controle de frizz, alinhamento cuticular e proteção contra fatores ambientais.',
      expectedDuration: '50 - 55 min',
      pauseTimeMinutes: 12,
      steps,
      activeIngredients: ['Ácido Lático pH 3.0', 'Óleo de Pracaxi', 'Ceramidas Vegetais', 'Polímeros Termoprotetores'],
      recommendedSalonFrequency: suggestedFrequency,
      usedProducts,
      products: usedProducts,
      salonCycleSchedule,
      personalizedTreatment: {
        primaryNeed,
        justification,
        priorityTreatment,
        treatmentType,
        suggestedFrequency,
        homeCareGuidance: 'Secagem com bico direcionador, fronha de cetim e óleo reparador antifrizz diário.',
        reassessmentPlan,
        professionalObservation,
        precautions,
        cosmeticCategories,
        status: 'SUGERIDO',
      },
      justification,
      treatmentType,
      suggestedFrequency,
      professionalObservation,
      precautions,
      cosmeticCategories,
      reassessmentPlan,
      status: 'SUGERIDO',
    };
  }

  // 4. ATENÇÃO AO COURO CABELUDO / LINGUAGEM COSMÉTICA (Regra 7)
  if (
    scores.dominantNeed === 'EQUILIBRIO_COURO' ||
    (scores.scalpBalanceNeed >= 45 && (anamnese?.scalpType === 'OLEOSO' || anamnese?.scalpType === 'SENSIVEL'))
  ) {
    if (mascaraHidratacao) usedProducts.push(mascaraHidratacao);

    const primaryNeed = 'Equilíbrio Cosmético do Couro Cabeludo e Higienização Equilibrada';
    const treatmentType = 'Terapia Cosmética Reguladora da Raiz com Tratamento Zonal de Comprimento';
    const priorityTreatment = 'Protocolo Zonal de Equilíbrio Capilar (Raiz Purificada + Pontas Hidratadas)';
    const suggestedFrequency = '1 sessão semanal nas primeiras 2 a 3 semanas, espaçando para cada 15 dias';
    const reassessmentPlan = 'Reavaliação cosmética em 21 dias do aspecto sebáceo e conforto do couro cabeludo';

    const justification = `Indicado por sinais cosméticos de ${
      anamnese?.scalpType === 'OLEOSO' ? 'oleosidade excessiva na raiz' : 'sensibilidade e desconforto no couro cabeludo'
    }${
      visual.rootToTipDifference === 'RAIZ_OLEOSA_PONTAS_SECAS' ? ', combinados a comprimento e pontas secas' : ''
    }. Exige higienização suave que purifique os óstios sem agredir a barreira cutânea, mantendo o comprimento protegido.`;

    const professionalObservation =
      'TRATAMENTO ZONAL: Tratar o couro cabeludo exclusivamente com shampoo suave/purificante e ativos calmantes. Aplicar máscaras e condicionadores estritamente no comprimento e pontas (a partir de 3cm da raiz).';

    const precautions = [
      'NUNCA aplicar máscaras nutritivas, condicionadores ou óleos pesados diretamente no couro cabeludo.',
      'Secar a raiz totalmente com temperatura morna ou fria; nunca dormir ou prender os fios úmidos.',
      'AVISO COSMÉTICO/MÉDICO: Se houver descamação atípica, coceira persistente, vermelhidão ou queda acentuada, orientar a cliente a procurar avaliação médica com dermatologista.',
    ];

    const cosmeticCategories = [catCouroCabeludo, catUmectantes, catTermoprotecao];

    const steps: SalonProtocolStep[] = [
      {
        title: 'Passo 1: Higienização Purificante & Calmante da Raiz',
        description: shampoo
          ? `Higienizar a raiz com ${shampoo.name} (${shampoo.brand}). pH equilibrado para limpeza sem efeito rebote.`
          : 'Aplicar shampoo suave com extrato de camomila e prébióticos.',
        tip: 'Massagear com as polpas dos dedos em movimentos circulares suaves, sem atrito das unhas.',
        matchedProductId: shampoo?.id,
        matchedProductName: shampoo?.name,
        matchedProductBrand: shampoo?.brand,
      },
      {
        title: 'Passo 2: Acidificação Suave Zonal (Somente Comprimento e Pontas)',
        description: acidificante
          ? `Aplicar ${acidificante.name} no comprimento e pontas, preservando o couro cabeludo limpo.`
          : 'Aplicar acidificante de pH 3.5 suave apenas no comprimento e pontas.',
        tip: 'Manter a raiz completamente livre de produtos oclusivos.',
        matchedProductId: acidificante?.id,
        matchedProductName: acidificante?.name,
        matchedProductBrand: acidificante?.brand,
      },
      {
        title: 'Passo 3: Máscara Leve com Ácido Hialurônico e D-Pantenol',
        description: mascaraHidratacao
          ? `Enluvar o comprimento com ${mascaraHidratacao.name} para hidratação sem pesar na raiz.`
          : 'Hidratação leve no comprimento para restaurar maciez das pontas.',
        tip: 'Enxágue 100% abundante com água em temperatura ambiente.',
        matchedProductId: mascaraHidratacao?.id,
        matchedProductName: mascaraHidratacao?.name,
        matchedProductBrand: mascaraHidratacao?.brand,
      },
      {
        title: 'Passo 4: Secagem Completa da Raiz',
        description: 'Secar a raiz 100% com temperatura morna a fria, garantindo ambiente arejado para o couro cabeludo.',
        tip: 'Nunca prender com fios úmidos para evitar proliferação de fungos da flora natural.',
      },
    ];

    const salonCycleSchedule = [
      { week: 1, treatment: 'Purificação Micelar + Hidratação Zonal', focus: 'Limpeza equilibrada dos óstios e hidratação das pontas' },
      { week: 2, treatment: 'Calmante com D-Pantenol e Camomila', focus: 'Conforto do couro cabeludo e alívio de sensibilidade' },
      { week: 3, treatment: 'Equilíbrio Sebáceo com Zinco PCA', focus: 'Normalização cosmética da oleosidade da raiz' },
      { week: 4, treatment: 'Manutenção Preventiva de Raiz e Pontas', focus: 'Preservação da barreira cutânea e pontas alinhadas' },
    ];

    return {
      protocolName: 'Terapia Cosmética de Equilíbrio do Couro Cabeludo & Comprimento Zonal',
      category: 'EQUILIBRIO_COURO',
      targetIssue: 'Oleosidade na raiz, sensibilidade cosmética e diferença entre raiz e pontas.',
      objective: 'Purificação suave do couro cabeludo e hidratação das pontas sem sobrecarga sebácea.',
      expectedDuration: '45 min',
      pauseTimeMinutes: 10,
      steps,
      activeIngredients: ['Extrato de Camomila', 'Zinco PCA', 'Prébióticos', 'D-Pantenol'],
      recommendedSalonFrequency: suggestedFrequency,
      usedProducts,
      products: usedProducts,
      salonCycleSchedule,
      personalizedTreatment: {
        primaryNeed,
        justification,
        priorityTreatment,
        treatmentType,
        suggestedFrequency,
        homeCareGuidance: 'Shampoo adequado à raiz, máscaras apenas nas pontas e secagem completa da raiz.',
        reassessmentPlan,
        professionalObservation,
        precautions,
        cosmeticCategories,
        status: 'SUGERIDO',
      },
      justification,
      treatmentType,
      suggestedFrequency,
      professionalObservation,
      precautions,
      cosmeticCategories,
      reassessmentPlan,
      status: 'SUGERIDO',
    };
  }

  // 5. NUTRIÇÃO / REPOSIÇÃO LIPÍDICA / ASPEREZA / POROSIDADE (Regra 5)
  if (scores.dominantNeed === 'NUTRICAO' || scores.nutritionNeed >= 40) {
    if (mascaraNutricao) usedProducts.push(mascaraNutricao);
    if (oleo) usedProducts.push(oleo);

    const primaryNeed = 'Reposição Lipídica, Emoliência e Redução de Aspereza';
    const treatmentType = 'Nutrição Lipídica Intensiva com Manteigas e Óleos Nobres';
    const priorityTreatment = 'Protocolo de Nutrição Lipídica Profunda & Restauração do Manto Graxo';
    const suggestedFrequency = '1 sessão a cada 15 dias no salão';
    const reassessmentPlan = 'Reavaliação em 30 dias com teste de toque e análise de porosidade';

    const justification = `Indicado pela constatação de toque ${
      visual.touchSensation === 'ASPERO_RIGIDO' ? 'áspero e rígido' : 'ressecado'
    }, porosidade ${visual.porosity.toLowerCase()} e pontas ${visual.endsState.toLowerCase().replace('_', ' ')}. Os fios necessitam de reposição lipídica para restabelecer a camada cimentícia entre as cutículas e devolver maciez.`;

    const professionalObservation =
      'Enluvar mecha por mecha vigorosamente no lavatório para que os óleos penetrem nas escamas. Se o cabelo for fino, dosar a quantidade de óleo finalizador para não pesar.';

    const precautions = [
      'Retirar o excesso de água com toalha antes de aplicar a máscara para melhor absorção dos lipídios.',
      'Não aplicar a máscara lipídica no couro cabeludo.',
      'Enxaguar abundantemente para não acumular resíduos pesados na fibra.',
    ];

    const cosmeticCategories = [catLipidios, catUmectantes, catAcidificantes, catTermoprotecao];

    const steps: SalonProtocolStep[] = [
      {
        title: 'Passo 1: Lavagem Hidronutritiva Delicada',
        description: shampoo
          ? `Higienização suave com ${shampoo.name} (${shampoo.brand}) preparando as cutículas para a umectação.`
          : 'Higienização com shampoo hidratante de limpeza delicada em água morna.',
        tip: 'Retirar o excesso de água com toalha de microfibra antes da aplicação dos lipídios.',
        matchedProductId: shampoo?.id,
        matchedProductName: shampoo?.name,
        matchedProductBrand: shampoo?.brand,
      },
      {
        title: 'Passo 2: Umectação e Nutrição com Manteigas Nobres',
        description: mascaraNutricao
          ? `Aplicar ${mascaraNutricao.name} (${mascaraNutricao.brand}). Ativos nobres: ${mascaraNutricao.keyActives}.`
          : 'Aplicar máscara lipídica rica em manteiga de murumuru, karité e óleo de pracaxi.',
        tip: 'Enluvar cada mecha no sentido da cutícula por 15 a 20 repetições para máxima emoliência.',
        matchedProductId: mascaraNutricao?.id,
        matchedProductName: mascaraNutricao?.name,
        matchedProductBrand: mascaraNutricao?.brand,
      },
      {
        title: 'Passo 3: Selagem Acidificante Cuticular',
        description: acidificante
          ? `Aplicar ${acidificante.name} sobre o comprimento para travamento dos lipídios no córtex.`
          : 'Aplicar selante acidificante de pH 3.5 por 3 minutos.',
        tip: 'Sela os óleos dentro da fibra, impedindo que se percam nas próximas lavagens.',
        matchedProductId: acidificante?.id,
        matchedProductName: acidificante?.name,
        matchedProductBrand: acidificante?.brand,
      },
      {
        title: 'Passo 4: Finalização com Óleo Nobre e Proteção Térmica',
        description: oleo
          ? `Enxaguar 100% e finalizar com 2 gotas de ${oleo.name} (${oleo.brand}) nas pontas.`
          : 'Aplicar óleo reparador de pontas com filtro UV e proteção térmica.',
        tip: 'Secagem com difusor para valorizar a curvatura ou escova suave.',
        matchedProductId: oleo?.id,
        matchedProductName: oleo?.name,
        matchedProductBrand: oleo?.brand,
      },
    ];

    const salonCycleSchedule = [
      { week: 1, treatment: 'Nutrição Profunda com Manteigas Nobres', focus: 'Preenchimento lipídico e emoliência imediata' },
      { week: 2, treatment: 'Hidratação Hídrica com D-Pantenol', focus: 'Equilíbrio da umidade e flexibilidade' },
      { week: 3, treatment: 'Nutrição Selante com Ceramidas e Óleo de Pracaxi', focus: 'Brilho reflexivo e toque sedoso' },
      { week: 4, treatment: 'Acidificação Suave e Nutrição de Manutenção', focus: 'Blindagem cuticular e retenção duradoura' },
    ];

    return {
      protocolName: 'Nutrição Lipídica & Restauração do Manto Graxo',
      category: 'NUTRICAO',
      targetIssue: 'Aspereza ao toque, porosidade elevada, pontas secas e falta de brilho.',
      objective: 'Reposição lipídica intensiva e restauração da maleabilidade e emoliência.',
      expectedDuration: '50 - 60 min',
      pauseTimeMinutes: 18,
      steps,
      activeIngredients: ['Manteiga de Murumuru', 'Óleo de Pracaxi', 'Ceramidas Vegetais', 'Vitamina E'],
      recommendedSalonFrequency: suggestedFrequency,
      usedProducts,
      products: usedProducts,
      salonCycleSchedule,
      personalizedTreatment: {
        primaryNeed,
        justification,
        priorityTreatment,
        treatmentType,
        suggestedFrequency,
        homeCareGuidance: 'Uso de óleo reparador nas pontas duas vezes ao dia e máscara nutritiva semanal.',
        reassessmentPlan,
        professionalObservation,
        precautions,
        cosmeticCategories,
        status: 'SUGERIDO',
      },
      justification,
      treatmentType,
      suggestedFrequency,
      professionalObservation,
      precautions,
      cosmeticCategories,
      reassessmentPlan,
      status: 'SUGERIDO',
    };
  }

  // 6. HIDRATAÇÃO HÍDRICA / RESSECAMENTO (Padrão quando não é Reconstrução, Nutrição, Frizz ou Couro)
  if (mascaraHidratacao) usedProducts.push(mascaraHidratacao);
  if (leaveIn) usedProducts.push(leaveIn);

  const primaryNeed = 'Recarga Hídrica, Flexibilidade e Retenção de Umidade';
  const treatmentType = 'Hidratação Hídrica Profunda com Ativos Higroscópicos e Umectantes';
  const priorityTreatment = 'Protocolo de Hidro-Reconstituição com Ácido Hialurônico & D-Pantenol';
  const suggestedFrequency = '1 sessão a cada 15 dias no salão';
  const reassessmentPlan = 'Reavaliação em 30 dias com teste de toque e nível de opacidade';

  const justification = `Indicado por sinais de ressecamento ao toque, opacidade visual e necessidade de reposição de água${
    heatToolsDaily ? ', acentuados pelo uso de ferramentas térmicas' : ''
  }. Agentes higroscópicos restauram a maleabilidade sem alterar a estrutura da fibra.`;

  const professionalObservation =
    'Garantir enluvamento com água morna a fria. A máscara deve agir com touca simples para potencializar a retenção hídrica sem superaquecer o fio.';

  const precautions = [
    'Sempre finalizar com condicionador selante para que a água não evapore das cutículas.',
    'Utilizar protetor térmico antes de qualquer secador ou difusor.',
  ];

  const cosmeticCategories = [catUmectantes, catLipidios, catAcidificantes, catTermoprotecao];

  const steps: SalonProtocolStep[] = [
    {
      title: 'Passo 1: Lavagem Purificante Micelar',
      description: shampoo
        ? `Lavar os fios com ${shampoo.name} (${shampoo.brand}) preparando as fibras para a retenção hídrica.`
        : 'Higienização suave com shampoo micelar sulfato-free em água ambiente.',
      tip: 'Água em temperatura ambiente para preservar o brilho.',
      matchedProductId: shampoo?.id,
      matchedProductName: shampoo?.name,
      matchedProductBrand: shampoo?.brand,
    },
    {
      title: 'Passo 2: Shot Hidratante com Ácido Hialurônico e D-Pantenol',
      description: mascaraHidratacao
        ? `Distribuir mecha a mecha ${mascaraHidratacao.name} (${mascaraHidratacao.brand}). Ativos: ${mascaraHidratacao.keyActives}.`
        : 'Aplicar máscara concentrada em ácido hialurônico, pantenol e extrato de aloe vera.',
      tip: 'Pausa de 15 minutos em touca simples para retenção molecular de água.',
      matchedProductId: mascaraHidratacao?.id,
      matchedProductName: mascaraHidratacao?.name,
      matchedProductBrand: mascaraHidratacao?.brand,
    },
    {
      title: 'Passo 3: Acidificação Finalizadora de Cutícula',
      description: acidificante
        ? `Enxaguar a máscara e aplicar ${acidificante.name} por 3 minutos para retenção da umidade.`
        : 'Aplicar acidificante suave de lavatório por 3 minutos para selar a hidratação.',
      tip: 'Garante que a água absorvida permaneça no córtex.',
      matchedProductId: acidificante?.id,
      matchedProductName: acidificante?.name,
      matchedProductBrand: acidificante?.brand,
    },
    {
      title: 'Passo 4: Finalização Fluida com Proteção Térmica',
      description: leaveIn
        ? `Aplicar no comprimento ${leaveIn.name} (${leaveIn.brand}) para movimento e balanço natural.`
        : 'Aplicar leave-in fluido aquoso com filtro UV e proteção térmica.',
      tip: 'Fios soltos, com brilho e movimento leve.',
      matchedProductId: leaveIn?.id,
      matchedProductName: leaveIn?.name,
      matchedProductBrand: leaveIn?.brand,
    },
  ];

  const salonCycleSchedule = [
    { week: 1, treatment: 'Hidratação Intensiva com Ácido Hialurônico', focus: 'Recarga hídrica profunda e flexibilidade' },
    { week: 2, treatment: 'Nutrição Suave com Óleos Nobres', focus: 'Retenção lipídica da água na fibra' },
    { week: 3, treatment: 'Hidratação com Pantenol e Babosa', focus: 'Maleabilidade e maciez prolongada' },
    { week: 4, treatment: 'Nutrição Selante Finalizadora', focus: 'Alinhamento e proteção preventiva' },
  ];

  return {
    protocolName: 'Hidro-Reconstituição com Ácido Hialurônico & D-Pantenol',
    category: 'HIDRATACAO',
    targetIssue: 'Perda de umidade, toque seco, opacidade e falta de maleabilidade.',
    objective: 'Reposição hídrica profunda e restauração da umidade natural e flexibilidade.',
    expectedDuration: '45 - 50 min',
    pauseTimeMinutes: 15,
    steps,
    activeIngredients: ['Ácido Hialurônico', 'D-Pantenol', 'Extrato de Babosa', 'Glicerina Vegetal'],
    recommendedSalonFrequency: suggestedFrequency,
    usedProducts,
    products: usedProducts,
    salonCycleSchedule,
    personalizedTreatment: {
      primaryNeed,
      justification,
      priorityTreatment,
      treatmentType,
      suggestedFrequency,
      homeCareGuidance: 'Hidratação semanal em casa, protetor térmico em todas as secagens e água morna.',
      reassessmentPlan,
      professionalObservation,
      precautions,
      cosmeticCategories,
      status: 'SUGERIDO',
    },
    justification,
    treatmentType,
    suggestedFrequency,
    professionalObservation,
    precautions,
    cosmeticCategories,
    reassessmentPlan,
    status: 'SUGERIDO',
  };
}

/**
 * GERAÇÃO DA ROTINA DE HOME CARE PERSONALIZADA
 * Prescrição cosmética personalizada baseada na avaliação atual
 */
export function generateHomeCareRoutine(
  scores: ScoringResult,
  visual: VisualAnalysisData,
  anamnese: AnamneseData,
  availableProducts: SalonProduct[] = [],
  client?: ClientData | null
): HomeCareRoutine {
  const findHomeProduct = (category: SalonProduct['category']): SalonProduct | undefined => {
    return (
      availableProducts.find((p) => p.category === category && (p.targetUse === 'HOME_CARE' || p.targetUse === 'AMBOS')) ||
      availableProducts.find((p) => p.category === category)
    );
  };

  const shampooProd = findHomeProduct('SHAMPOO');
  const condProd = findHomeProduct('CONDICIONADOR') || findHomeProduct('ACIDIFICANTE');
  const leaveInProd = findHomeProduct('LEAVE_IN');
  const oleoProd = findHomeProduct('OLEO_FINALIZADOR');

  // Selecionar máscara de acordo com a necessidade dominante proporcional
  let maskCategory: SalonProduct['category'] = 'MASCARA_HIDRATACAO';
  if (scores.dominantNeed === 'RECONSTRUCAO' && scores.damageGrade !== 'GRAU_1') {
    maskCategory = 'MASCARA_RECONSTRUCAO';
  } else if (scores.dominantNeed === 'NUTRICAO' || scores.dominantNeed === 'CONTROLE_FRIZZ') {
    maskCategory = 'MASCARA_NUTRICAO';
  }

  const maskProd = findHomeProduct(maskCategory) || findHomeProduct('MASCARA_HIDRATACAO');

  const usedProducts: SalonProduct[] = [];
  if (shampooProd) usedProducts.push(shampooProd);
  if (condProd) usedProducts.push(condProd);
  if (maskProd) usedProducts.push(maskProd);
  if (leaveInProd) usedProducts.push(leaveInProd);
  if (oleoProd) usedProducts.push(oleoProd);

  // Categorias cosméticas descritivas (Regra 8)
  const shampooDesc = shampooProd
    ? `${shampooProd.name} (${shampooProd.brand}) — Ativos: ${shampooProd.keyActives}`
    : anamnese.scalpType === 'OLEOSO'
    ? 'Shampoo Purificante Equilibrante: tensoativos suaves micelares (pH 5.0 a 5.5) para controle da oleosidade sem agredir a barreira cutânea'
    : anamnese.scalpType === 'SENSIVEL'
    ? 'Shampoo Dermo-Calmante: tensoativos botânicos com camomila e prébióticos sem sulfatos pesados'
    : 'Shampoo Hidratante Micelar: limpeza suave sem sulfatos pesados para preservar o manto lipídico';

  const condDesc = condProd
    ? `${condProd.name} (${condProd.brand}) — pH ${condProd.pH || '3.8 a 4.0'}`
    : 'Condicionador Selante Acidificante (pH 3.8 a 4.2) com ácido lático e ceramidas para alinhamento cuticular após a máscara';

  const maskDesc = maskProd
    ? `${maskProd.name} (${maskProd.brand}) — Ativos: ${maskProd.keyActives}`
    : scores.dominantNeed === 'RECONSTRUCAO' && scores.damageGrade !== 'GRAU_1'
    ? 'Máscara com Proteínas e Aminoácidos Biomiméticos (arginina, creatina e queratina de baixo peso molecular)'
    : scores.dominantNeed === 'NUTRICAO'
    ? 'Máscara Lipídica Nutritiva (manteiga de murumuru, karité e óleo nobre de pracaxi)'
    : 'Máscara Hidratante com Agentes Umectantes (ácido hialurônico, D-pantenol e aloe vera)';

  const leaveInDesc = leaveInProd
    ? `${leaveInProd.name} (${leaveInProd.brand}) — Proteção térmica até 230°C`
    : `Leave-in com Proteção Térmica e Filtro UV (${
        ['3A', '3B', '3C', '4A', '4B', '4C'].includes(visual.curvature)
          ? 'Creme de pentear com agentes emolientes e efeito memória'
          : 'Fluido protetor leve com polímeros antifrizz'
      })`;

  const oleoDesc = oleoProd
    ? `${oleoProd.name} (${oleoProd.brand}) — Ativos: ${oleoProd.keyActives}`
    : 'Óleo Reparador com Lipídios Nobres (óleo de argan e pracaxi) para selagem diária das pontas';

  const items: HomeCareItem[] = [
    {
      stepNumber: 1,
      category: 'HIGIENIZAÇÃO EQUILIBRADA',
      title: 'Passo 1: Shampoo',
      recommendation: shampooDesc,
      howToUse:
        'Aplicar exclusivamente na raiz com água morna ou fria. Massagear delicadamente com a polpa dos dedos. Deixar a espuma escorrer pelo comprimento sem esfregar as pontas.',
      matchedProduct: shampooProd,
    },
    {
      stepNumber: 2,
      category: 'TRATAMENTO COSMÉTICO',
      title: 'Passo 2: Máscara de Tratamento',
      recommendation: maskDesc,
      howToUse:
        scores.dominantNeed === 'RECONSTRUCAO' && scores.damageGrade !== 'GRAU_1'
          ? 'Usar a cada 15 dias. Retirar o excesso de água com toalha de microfibra, enluvar mecha por mecha e pausar por 5 a 10 minutos.'
          : 'Usar 1 a 2 vezes por semana. Enluvar mecha por mecha após retirar o excesso de água e pausar por 5 minutos no banho.',
      matchedProduct: maskProd,
    },
    {
      stepNumber: 3,
      category: 'SELAGEM CUTICULAR',
      title: 'Passo 3: Condicionador Selante',
      recommendation: condDesc,
      howToUse:
        'Aplicar logo após enxaguar a máscara para alinhar as escamas cuticulares e reter os ativos no córtex. Enxaguar 100% com água fria.',
      matchedProduct: condProd,
    },
    {
      stepNumber: 4,
      category: 'PROTEÇÃO TÉRMICA & BLINDAGEM',
      title: 'Passo 4: Leave-in Termoprotetor',
      recommendation: leaveInDesc,
      howToUse:
        'Aplicar nos fios úmidos antes de qualquer secador, chapinha ou difusor. Distribuir uniformemente do meio às pontas com pente de dentes largos.',
      matchedProduct: leaveInProd,
    },
    {
      stepNumber: 5,
      category: 'FINALIZAÇÃO LIPÍDICA',
      title: 'Passo 5: Óleo Reparador de Pontas',
      recommendation: oleoDesc,
      howToUse:
        'Espalhar 2 a 3 gotas nas palmas das mãos e aplicar nas pontas secas pela manhã e antes de dormir para selar fissuras e evitar pontas duplas.',
      matchedProduct: oleoProd,
    },
  ];

  // Calendário semanal adaptado à frequência de lavagem da anamnese
  const isDailyWash = anamnese.washFrequency === 'DIARIA';
  const isOnceAWeek = anamnese.washFrequency === '1_VEZ_SEMANA';

  const weeklyCalendar = isDailyWash
    ? [
        { day: 'Segunda-feira', action: 'Lavagem & Condicionamento Suave', products: 'Shampoo Suave + Condicionador Selante + Leave-in Protetor' },
        { day: 'Terça-feira', action: 'Higienização Rápida', products: 'Shampoo Suave + Condicionador nas pontas' },
        { day: 'Quarta-feira', action: 'Dia de Tratamento', products: 'Shampoo + Máscara de Tratamento (5 min) + Condicionador' },
        { day: 'Quinta-feira', action: 'Lavagem Leve', products: 'Shampoo Suave + Condicionador + Gotas de Óleo' },
        { day: 'Sexta-feira', action: 'Higienização & Termoproteção', products: 'Shampoo + Condicionador + Leave-in com Proteção Térmica' },
        { day: 'Sábado', action: 'Tratamento / Manutenção', products: 'Shampoo + Máscara ou Condicionador + Óleo de Pontas' },
        { day: 'Domingo', action: 'Descanso e Umectação Noturna', products: 'Gotas de óleo vegetal nas pontas secas antes de dormir' },
      ]
    : isOnceAWeek
    ? [
        { day: 'Sábado ou Domingo', action: 'Sessão Completa de Tratamento', products: 'Shampoo + Máscara (10 min) + Condicionador + Leave-in + Óleo' },
        { day: 'Quarta-feira', action: 'Manutenção e Revitalização a Seco', products: 'Umidificar levemente as pontas com leave-in fluido e selar com 2 gotas de óleo' },
      ]
    : [
        { day: 'Segunda-feira', action: 'Lavagem & Condicionamento', products: 'Shampoo + Condicionador Selante + Leave-in Termoprotetor' },
        { day: 'Quinta-feira', action: 'Dia de Máscara de Tratamento', products: 'Shampoo + Máscara de Tratamento + Condicionador Selante' },
        { day: 'Sábado ou Domingo', action: 'Higienização & Selagem com Óleo', products: 'Shampoo Suave + Condicionador + Gotas de Óleo Reparador nas Pontas' },
      ];

  return {
    shampooRecommendation: shampooDesc,
    conditionerRecommendation: condDesc,
    treatmentMask: maskDesc,
    leaveInThermalProtector: leaveInDesc,
    oilFinisher: oleoDesc,
    items,
    objective: scores.recommendedTreatmentObjective,
    usedProducts,
    products: usedProducts,
    washTips: [
      'Nunca lavar com água excessivamente quente: dilata as escamas cuticulares e estimula oleosidade rebote no couro cabeludo.',
      'Desembaraçar sempre iniciando pelas pontas em direção à raiz com escova de cerdas flexíveis.',
      'Secar com toalha de microfibra ou tecido de algodão suave para eliminar atrito e quebra mecânica.',
      'Usar touca ou fronha de cetim para dormir: reduz drasticamente o atrito noturno e o frizz.',
    ],
    weeklyCalendar,
    monitoringFollowUp:
      'Retorno sugerido ao salão em 21 a 30 dias para reavaliação dos índices de elasticidade e tração e ajuste da fase seguinte do cronograma.',
    reassessmentPlan: 'Reavaliação em 30 dias na bancada do salão.',
  };
}

/**
 * MOTOR DE CRONOGRAMA CAPILAR PERSONALIZADO — 4 SEMANAS
 * 
 * Transforma o tratamento personalizado da avaliação atual em um plano organizado de 4 semanas.
 * 
 * Regras cruciais:
 * 1. RECONSTRUÇÃO NÃO DEVE SER AUTOMÁTICA: depende estritamente de evidências técnicas da fibra.
 * 2. NÃO utilizar o mesmo cronograma para todos os clientes: cronograma mutável conforme necessidades,
 *    danos, histórico químico, calor, testes físicos e objetivos.
 * 3. Não transformar em prescrição médica; não diagnosticar doenças.
 * 4. Couro cabeludo com atenção recebe orientação cosmética isolada, sem misturar com o tratamento da fibra.
 * 5. Se houver sinais suspeitos/persistentes no couro, orientar avaliação por médico dermatologista/tricologista.
 * 6. Semana 4 inclui obrigatoriamente etapa de "Reavaliar a fibra e comparar com a avaliação inicial",
 *    com estrutura preparada para comparação dos 9 parâmetros.
 * 7. Evitar excesso de reconstrução em sequência para não gerar sobrecarga proteica/rigidez.
 */
export function generateTreatmentSchedule(
  evaluation: {
    anamnese: AnamneseData;
    visual: VisualAnalysisData;
    client?: ClientData | null;
    id?: string;
    clientId?: string;
  },
  treatmentPlan: SalonProtocol,
  scores: ScoringResult
): FourWeekTreatmentSchedule {
  const { anamnese, visual, client } = evaluation;
  const clientId = client?.id || evaluation.clientId || 'cliente-atual';
  const evaluationId = evaluation.id || `eval-${Date.now()}`;

  // 1. ANÁLISE DE EVIDÊNCIAS TÉCNICAS PARA RECONSTRUÇÃO
  // A reconstrução NUNCA é automática. Depende de evidência física direta.
  const hasElasticityDamage = visual.elasticity === 'BAIXA_EMBORRACHADO';
  const hasFragileTensile = visual.tensileResistance === 'FRAGIL_QUEBRADICO';
  const hasMultipleSplitEnds = visual.endsState === 'MULTIPLAS_ESFARELADAS';
  const hasHighChemicalExposure = anamnese.chemicalHistory.some((c) =>
    c.includes('Descolor') || c.includes('Alisa') || c.includes('Relax')
  );
  const hasSevereDamageGrade = scores.damageGrade === 'GRAU_3' || scores.damageGrade === 'GRAU_4';
  const hasCortexMicroscopeFindings = visual.microscope?.deviceFindings?.some((f) =>
    f.toLowerCase().includes('córtex') || f.toLowerCase().includes('fissura') || f.toLowerCase().includes('afinamento')
  );

  // Evidência técnica real para justificar reposição proteica
  const hasTechnicalEvidenceForReconstruction =
    hasElasticityDamage ||
    hasFragileTensile ||
    (hasMultipleSplitEnds && hasSevereDamageGrade) ||
    (hasHighChemicalExposure && (visual.elasticity === 'MEDIA' || visual.porosity === 'ALTA') && scores.overallHealth < 50) ||
    Boolean(hasCortexMicroscopeFindings);

  // 2. AVALIAÇÃO ESPECÍFICA DO COURO CABELUDO (COSMÉTICA ISOLADA + ALERTA DE SAÚDE)
  const isOilyScalp = anamnese.scalpType === 'OLEOSO';
  const isDryScalp = anamnese.scalpType === 'SECO';
  const isSensitiveScalp = anamnese.scalpType === 'SENSIVEL';
  const hasScalpComplaint = anamnese.perceivedDamages.some((d) =>
    d.toLowerCase().includes('couro') || d.toLowerCase().includes('sensibilidade') || d.toLowerCase().includes('queda')
  );
  const microscopeScalpFindings = visual.microscope?.deviceFindings?.filter((f) =>
    f.toLowerCase().includes('sebáceo') || f.toLowerCase().includes('descamação') || f.toLowerCase().includes('folicular')
  ) || [];

  const scalpNeedsAttention =
    isOilyScalp || isDryScalp || isSensitiveScalp || hasScalpComplaint || microscopeScalpFindings.length > 0;

  // Sinais suspeitos/persistentes (descamação intensa com sensibilidade, dor, afinamento abrupto ou queixa de queda severa)
  const hasSuspiciousSigns =
    (isSensitiveScalp && microscopeScalpFindings.some((f) => f.toLowerCase().includes('descamação'))) ||
    anamnese.perceivedDamages.some((d) => d.toLowerCase().includes('queda excessiva')) ||
    (visual.microscope?.deviceNotes ? visual.microscope.deviceNotes.toLowerCase().includes('vermelhidão') || visual.microscope.deviceNotes.toLowerCase().includes('placa') : false);

  let scalpCosmeticGuidance = 'Couro cabeludo íntegro. Manter higienização regular e não depositar máscaras ou óleos na raiz.';
  if (isOilyScalp) {
    scalpCosmeticGuidance = 'Higienização equilibrada com shampoo regulador cosmético suave (pH 5.0 - 5.5). Não esfregar com unhas, massagear com as pontas dos dedos e enxaguar com água fria/morna. Não aplicar máscaras, condicionadores ou óleos na raiz.';
  } else if (isDryScalp) {
    scalpCosmeticGuidance = 'Higienização suave com agentes limpantes hidratantes. Evitar água excessivamente quente para preservar a barreira lipídica protetora natural do couro cabeludo.';
  } else if (isSensitiveScalp) {
    scalpCosmeticGuidance = 'Higienização hipoalergênica com água morna. Uso de tônico cosmético calmante à base de Camomila ou D-Pantenol. Evitar tração mecânica excessiva e atrito.';
  }

  const scalpGuidance: ScalpCareGuidance = {
    needsAttention: scalpNeedsAttention,
    scalpType: anamnese.scalpType,
    cosmeticGuidance: scalpCosmeticGuidance,
    hasSuspiciousSigns,
    suspiciousFindings: microscopeScalpFindings,
    medicalReferralNotice: hasSuspiciousSigns
      ? 'Aviso Importante de Saúde: Foram observados sinais persistentes de sensibilidade ou descamação no couro cabeludo. O profissional cabeleireiro realiza cuidados exclusivamente cosméticos. Recomenda-se agendar consulta com médico dermatologista ou tricologista para diagnóstico e avaliação clínica especializada.'
      : undefined,
  };

  // 3. ESTRUTURA PREPARADA PARA REAVALIAÇÃO COMPARATIVA NA SEMANA 4
  const comparisonFields: ReassessmentComparisonField[] = [
    {
      key: 'elasticidade',
      label: 'Elasticidade da Fibra',
      initialValue:
        visual.elasticity === 'BAIXA_EMBORRACHADO'
          ? 'Baixa / Emborrachado (Perda de retorno elástico)'
          : visual.elasticity === 'MEDIA'
          ? 'Média (Retorno elástico lento)'
          : 'Saudável (Boa tração e retorno natural)',
    },
    {
      key: 'porosidade',
      label: 'Porosidade Cuticular',
      initialValue:
        visual.porosity === 'ALTA'
          ? 'Alta (Cutículas excessivamente abertas/ásperas)'
          : visual.porosity === 'MEDIA'
          ? 'Média (Absorção e retenção equilibrada)'
          : 'Baixa (Cutículas seladas e alinhadas)',
    },
    {
      key: 'resistencia',
      label: 'Resistência à Tração Mecânica',
      initialValue:
        visual.tensileResistance === 'FRAGIL_QUEBRADICO'
          ? 'Frágil / Quebradiço (Rompimento sob tração leve)'
          : visual.tensileResistance === 'MODERADA'
          ? 'Moderada (Resiste a tração média)'
          : 'Boa / Resistente (Sem quebra à tração)',
    },
    {
      key: 'pontas',
      label: 'Estado das Pontas',
      initialValue:
        visual.endsState === 'MULTIPLAS_ESFARELADAS'
          ? 'Múltiplas / Esfareladas (Bifurcações avançadas)'
          : visual.endsState === 'DUPLAS'
          ? 'Pontas Duplas visíveis'
          : visual.endsState === 'RESSECADAS'
          ? 'Ressecadas e desidratadas'
          : 'Íntegras e seladas',
    },
    {
      key: 'frizz',
      label: 'Nível de Frizz & Estática',
      initialValue:
        visual.frizzLevel === 'INTENSO'
          ? 'Intenso (Arrepiados pronunciados)'
          : visual.frizzLevel === 'MODERADO'
          ? 'Moderado (Dispersão visível na superfície)'
          : 'Leve (Alinhamento uniforme)',
    },
    {
      key: 'toque',
      label: 'Toque / Sensação Tátil',
      initialValue:
        visual.touchSensation === 'ASPERO_RIGIDO'
          ? 'Áspero e Rígido'
          : visual.touchSensation === 'RESSECADO_OPOCO'
          ? 'Ressecado e Opaco'
          : visual.touchSensation === 'FRAGIL_QUEBRADICO'
          ? 'Frágil e Quebradiço'
          : 'Macio e Sedoso',
    },
    {
      key: 'microscopia',
      label: 'Achados da Microscopia Digital',
      initialValue:
        visual.microscope?.deviceFindings && visual.microscope.deviceFindings.length > 0
          ? visual.microscope.deviceFindings.join(', ')
          : 'Sem alterações microscópicas registradas',
    },
    {
      key: 'indiceGeral',
      label: 'Índice Geral de Integridade',
      initialValue: `${scores.overallHealth}/100 — ${scores.damageGradeLabel}`,
    },
    {
      key: 'prioridades',
      label: 'Necessidade Dominante & Perfil',
      initialValue: `${scores.dominantNeedLabel} (H: ${scores.hydrationNeed}% | N: ${scores.nutritionNeed}% | R: ${scores.reconstructionNeed}% | F: ${scores.frizzControlNeed ?? 0}%)`,
    },
  ];

  const reassessmentPrep: ReassessmentPreparation = {
    prompt: 'Reavaliar a fibra e comparar com a avaliação inicial.',
    targetWeek: 4,
    comparisonFields,
    guidance:
      'Na Semana 4, repita os testes de mecha com a fibra molhada e seca: elasticidade, resistência à tração, toque das pontas e porosidade. Compare diretamente os valores obtidos com o prontuário de entrada para validar os ganhos estruturais e cosméticos.',
  };

  // 4. ESTRUTURAÇÃO INTELIGENTE DAS 4 SEMANAS
  let week1: ScheduleWeek;
  let week2: ScheduleWeek;
  let week3: ScheduleWeek;
  let week4: ScheduleWeek;
  let strategyRhythm = '';
  let scheduleSummary = '';

  const clientGoalText = client?.hairGoal ? ` Visando o objetivo da cliente de "${client.hairGoal}".` : '';
  const heatProtectionNote = anamnese.heatTools !== 'NUNCA'
    ? ' Obrigatória aplicação de protetor térmico até 230°C antes de qualquer secador, difusor ou prancha.'
    : ' Secagem preferencialmente ao natural ou com ar morno.';

  // =========================================================================
  // CENÁRIO A: Comprometimento Estrutural Importante (Evidência de Reconstrução)
  // Exemplo 3 do Usuário:
  // Semana 1: Recuperação/fortalecimento conforme avaliação
  // Semana 2: Hidratação para suporte cosmético
  // Semana 3: Tratamento reconstrutor somente se ainda houver indicação técnica
  // Semana 4: Hidratação/nutrição e reavaliação
  // Regra de ouro: Evitar excesso de reconstrução em sequência!
  // =========================================================================
  if (hasTechnicalEvidenceForReconstruction) {
    strategyRhythm = 'Recuperação Estrutural com Suporte Hídrico e Cautela Reconstrutora';
    scheduleSummary = `Plano de choque seguro para fibra fragilizada (${scores.damageGradeLabel}, saúde ${scores.overallHealth}/100). Intercala aporte de aminoácidos com recargas hídricas profundas para evitar rigidez mecânica.${clientGoalText}`;

    // Semana 1
    week1 = {
      weekNumber: 1,
      weekLabel: 'Semana 1',
      objective: 'Estabilização de pH e reposição proteica inicial para estancar fragilidade da fibra.',
      mainTreatment: 'Tratamento Reconstrutor & Fortalecimento de Córtex (Complexo de Aminoácidos e Queratina Vegetal)',
      complementaryTreatment: 'Acidificação Estabilizadora (pH 3.0 - 3.5) para ancoragem proteica e selagem cuticular.',
      protection: `Proteção mecânica rigorosa ao pentear (iniciar sempre pelas pontas).${heatProtectionNote}`,
      homeCare: 'Higienização com shampoo suave de reconstrução, condicionador selante e leave-in com aminoácidos. Não tracionar os fios úmidos.',
      professionalNote: 'Evidência física de perda proteica confirmada. Aplicação precisa sem tempo de pausa excessivo para não enrijecer.',
      treatmentCategory: 'RECONSTRUCAO',
      isReconstruction: true,
      status: 'SUGERIDO',
    };

    // Semana 2
    week2 = {
      weekNumber: 2,
      weekLabel: 'Semana 2',
      objective: 'Suporte hídrico e devolução de emoliência para compensar a rigidez da reconstrução anterior.',
      mainTreatment: 'Hidratação Profunda com Umectantes Higroscópicos (D-Pantenol, Ácido Hialurônico e Glicerina Vegetal)',
      complementaryTreatment: 'Máscara de Emoliência Fluida sem carga proteica.',
      protection: 'Finalizador bifásico protetor e secagem com temperatura amena.',
      homeCare: 'Máscara hidratante de 5 a 10 minutos no banho, enxágue 100% com água fria para conferir flexibilidade.',
      professionalNote: 'Pausa proteica mandatória: evitar reconstruções seguidas que geram sobrecarga e quebra mecânica.',
      treatmentCategory: 'HIDRATACAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };

    // Semana 3
    const needsSecondReconstruction = scores.damageGrade === 'GRAU_4' || hasElasticityDamage;
    if (needsSecondReconstruction) {
      week3 = {
        weekNumber: 3,
        weekLabel: 'Semana 3',
        objective: 'Reforço estrutural complementar orientado pelo teste de elasticidade e porosidade.',
        mainTreatment: 'Tratamento Fortalecedor Complementar com Peptídeos e Ceramidas Biomiméticas',
        complementaryTreatment: 'Umectação lipídica leve com óleo de pracaxi nas pontas após a máscara.',
        protection: 'Leave-in termoprotetor rico em lipídios e proteção anti-quebra.',
        homeCare: 'Manutenção equilibrada com shampoo fortificante e máscara hidratante/nutritiva nos outros dias da semana.',
        professionalNote: 'Segundo ciclo reconstrutor administrado com espaçamento de 14 dias da primeira aplicação.',
        treatmentCategory: 'RECONSTRUCAO',
        isReconstruction: true,
        status: 'SUGERIDO',
      };
    } else {
      week3 = {
        weekNumber: 3,
        weekLabel: 'Semana 3',
        objective: 'Nutrição lipídica disciplinante para envelopar a queratina recuperada e selar a cutícula.',
        mainTreatment: 'Nutrição Lipídica Intensiva com Manteiga de Murumuru e Óleos Nobres',
        complementaryTreatment: 'Selagem ácida suave para alinhamento da fibra.',
        protection: 'Sérum lipídico nas pontas para evitar formação de pontas duplas.',
        homeCare: 'Máscara nutritiva residencial e óleo finalizador leve diariamente nas pontas.',
        professionalNote: 'Fibra respondeu bem ao suporte hídrico; avanço para reposição lipídica para garantir toque sedoso.',
        treatmentCategory: 'NUTRICAO',
        isReconstruction: false,
        status: 'SUGERIDO',
      };
    }

    // Semana 4
    week4 = {
      weekNumber: 4,
      weekLabel: 'Semana 4',
      objective: 'Selagem preventiva, hidratação de manutenção e reavaliação comparativa completa da fibra.',
      mainTreatment: 'Hidratação Hídrica Selante & Alinhamento Cuticular com D-Pantenol e Aloe Vera',
      complementaryTreatment: 'Acidificante equilibrante suave e selagem de pontas com óleo nobre.',
      protection: 'Blindagem finalizadora termoativada e orientação para uso contínuo de fronha de cetim.',
      homeCare: 'Rotina de suporte contínuo: shampoo suave, máscara de hidratação semanal e protetor térmico.',
      professionalNote: 'Momento de executar a reavaliação técnica na bancada para comparar a evolução com o prontuário inicial.',
      reassessmentNotice: 'Reavaliar a fibra e comparar com a avaliação inicial (elasticidade, tração, porosidade e pontas).',
      treatmentCategory: 'HIDRATACAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };
  }

  // =========================================================================
  // CENÁRIO B: Fibra Saudável com Demanda de Brilho, Maciez e Toque (Grau 1)
  // Exemplo 1 do Usuário:
  // Semana 1: Hidratação/cuidado cosmético
  // Semana 2: Manutenção e nutrição leve, se indicada
  // Semana 3: Hidratação/manutenção
  // Semana 4: Reavaliação e ajuste
  // Regra: NÃO inserir reconstrução intensa sem evidência técnica!
  // =========================================================================
  else if (scores.damageGrade === 'GRAU_1' || scores.overallHealth >= 75) {
    strategyRhythm = 'Manutenção Preventiva & Realce Cosmético de Brilho e Maciez';
    scheduleSummary = `Fibra com excelente integridade estrutural (${scores.overallHealth}/100). Foco 100% cosmético em umectação, retenção hídrica e manto lipídico leve, dispensando reconstruções proteicas desnecessárias.${clientGoalText}`;

    // Semana 1
    week1 = {
      weekNumber: 1,
      weekLabel: 'Semana 1',
      objective: 'Cuidado cosmético inicial para retenção hídrica, maleabilidade e luminosidade imediata.',
      mainTreatment: 'Hidratação Micelar Suave com Ácido Hialurônico e Extrato de Aloe Vera',
      complementaryTreatment: 'Enxágue acidificante suave para realce do brilho reflexivo.',
      protection: `Proteção solar e térmica leve sem peso cosmético.${heatProtectionNote}`,
      homeCare: 'Shampoo com tensoativos suaves, máscara hidratante fluida (pausa de 5 min) e leave-in leve.',
      professionalNote: 'Estrutura capilar sadia. Proibida sobrecarga de queratina ou aminoácidos para não endurecer os fios.',
      treatmentCategory: 'HIDRATACAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };

    // Semana 2
    week2 = {
      weekNumber: 2,
      weekLabel: 'Semana 2',
      objective: 'Manutenção e nutrição leve para reforço do manto lipídico e alinhamento cuticular.',
      mainTreatment: 'Nutrição Lipídica Leve com Óleos Nobres Fluídos (Pracaxi e Semente de Uva)',
      complementaryTreatment: 'Condicionamento selante para fechamento suave das cutículas.',
      protection: 'Gotas de óleo reparador antioxidante nas pontas.',
      homeCare: 'Condicionador selante nutritivo e 2 gotas de óleo finalizador após a secagem.',
      professionalNote: 'Aporte lipídico moderado para selar a umectação da semana 1 sem tirar o balanço natural.',
      treatmentCategory: 'NUTRICAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };

    // Semana 3
    week3 = {
      weekNumber: 3,
      weekLabel: 'Semana 3',
      objective: 'Hidratação contínua para manutenção da flexibilidade e prevenção contra o ressecamento diário.',
      mainTreatment: 'Hidratação com D-Pantenol e Polissacarídeos Vegetais',
      complementaryTreatment: 'Leave-in anti-frizz com filtro UV.',
      protection: 'Protetor térmico e mecânico contra poluição e radiação UV.',
      homeCare: 'Higienização e máscara hidratante semanal com água fria.',
      professionalNote: 'Manter a constância de água nos fios para sustentar o toque macio solicitado pela cliente.',
      treatmentCategory: 'HIDRATACAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };

    // Semana 4
    week4 = {
      weekNumber: 4,
      weekLabel: 'Semana 4',
      objective: 'Selagem cuticular, manutenção do brilho espelhado e reavaliação da resposta da fibra.',
      mainTreatment: 'Tratamento de Selagem Cuticular e Brilho Espelhado com Polímeros Suaves',
      complementaryTreatment: 'Finalização polida e alinhamento das pontas com sérum.',
      protection: 'Blindagem anti-umidade para preservar o alinhamento em ambientes externos.',
      homeCare: 'Manter a rotina domiciliar estabelecida e agendar revisão cosmética em 30 a 45 dias.',
      professionalNote: 'Revisar toque, brilho e maleabilidade para conferir se o objetivo foi 100% atingido.',
      reassessmentNotice: 'Reavaliar a fibra e comparar com a avaliação inicial (toque, brilho, pontas e integridade geral).',
      treatmentCategory: 'MANUTENCAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };
  }

  // =========================================================================
  // CENÁRIO C: Ressecamento, Aspereza, Porosidade e Frizz (Grau 2 ou Predominância)
  // Exemplo 2 do Usuário:
  // Semana 1: Hidratação
  // Semana 2: Nutrição
  // Semana 3: Hidratação
  // Semana 4: Nutrição ou hidratação conforme a necessidade predominante
  // Associar proteção térmica e cuidados de alinhamento quando indicados.
  // =========================================================================
  else {
    const isNutritionPriority = scores.dominantNeed === 'NUTRICAO' || scores.nutritionNeed >= scores.hydrationNeed;
    strategyRhythm = isNutritionPriority
      ? 'Equilíbrio Hidrolipídico com Predominância Nutritiva e Controle de Frizz'
      : 'Reposição Hídrica Intensiva com Selagem Lipídica e Antiestática';

    scheduleSummary = `Plano focado em recuperar maciez, maleabilidade e emoliência para fibra com aspereza e porosidade (${scores.damageGradeLabel}, saúde ${scores.overallHealth}/100). Sem necessidade de reconstrução agressiva.${clientGoalText}`;

    // Semana 1: Hidratação
    week1 = {
      weekNumber: 1,
      weekLabel: 'Semana 1',
      objective: 'Reposição hídrica profunda para devolver a água perdida e amolecer a rigidez da fibra.',
      mainTreatment: 'Hidratação Intensiva com Ácido Hialurônico, Glicerina e Extrato de Babosa',
      complementaryTreatment: visual.porosity === 'ALTA' ? 'Acidificação cuticular preparatória para regular o pH e segurar a água.' : undefined,
      protection: `Aplicação obrigatória de leave-in com polímeros termoprotetores e anti-frizz.${heatProtectionNote}`,
      homeCare: 'Lavagem com shampoo hidratante, aplicação de máscara de hidratação por 7 minutos e enxágue total.',
      professionalNote: 'A fibra desidratada necessita de água antes de receber camadas densas de lipídios.',
      treatmentCategory: 'HIDRATACAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };

    // Semana 2: Nutrição
    week2 = {
      weekNumber: 2,
      weekLabel: 'Semana 2',
      objective: 'Reposição lipídica densa para envelopar a água, combater a aspereza e eliminar o frizz.',
      mainTreatment: 'Nutrição Profunda com Blend de Manteigas Nobres (Murumuru e Karité) e Ceramidas',
      complementaryTreatment: 'Tratamento de alinhamento e selagem de cutículas com óleo vegetal de pracaxi.',
      protection: 'Protetor térmico de alta performance e uso de touca/fronha de cetim para dormir.',
      homeCare: 'Máscara de nutrição residencial e 2 a 3 gotas de óleo reparador nas pontas após a secagem.',
      professionalNote: 'Carga de lipídios combate diretamente a estática e a aspereza do toque.',
      treatmentCategory: 'NUTRICAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };

    // Semana 3: Hidratação
    week3 = {
      weekNumber: 3,
      weekLabel: 'Semana 3',
      objective: 'Recarga hídrica complementar para manter o equilíbrio hidrolipídico sem sobrepeso.',
      mainTreatment: 'Hidratação Hídrica com D-Pantenol e Complexo de Frutas Cítricas',
      complementaryTreatment: 'Leave-in anti-umidade com bloqueador de frizz atmosférico.',
      protection: 'Blindagem anti-umidade para impedir que a fibra absorva umidade do ar e arme.',
      homeCare: 'Máscara hidratante residencial, respeitando o tempo de pausa e enxágue em água fria.',
      professionalNote: 'Intercalar hidratação após a nutrição garante fios soltos com movimento natural.',
      treatmentCategory: 'HIDRATACAO',
      isReconstruction: false,
      status: 'SUGERIDO',
    };

    // Semana 4: Nutrição ou Hidratação conforme necessidade predominante
    if (isNutritionPriority) {
      week4 = {
        weekNumber: 4,
        weekLabel: 'Semana 4',
        objective: 'Selagem lipídica duradoura, alinhamento das pontas e reavaliação completa da evolução.',
        mainTreatment: 'Nutrição Selante com Óleo de Argan, Ceramidas e Acidificação Suave',
        complementaryTreatment: 'Reparação de pontas secas com sérum de amino-silicones protetores.',
        protection: 'Termoprotetor com filtro UV e proteção contra atrito mecânico.',
        homeCare: 'Manter a rotina com o Kit Essencial Home Care prescrito no atendimento.',
        professionalNote: 'Realizar os testes de tração, toque e porosidade para mensurar a redução do frizz e aspereza.',
        reassessmentNotice: 'Reavaliar a fibra e comparar com a avaliação inicial (frizz, porosidade, toque e pontas).',
        treatmentCategory: 'NUTRICAO',
        isReconstruction: false,
        status: 'SUGERIDO',
      };
    } else {
      week4 = {
        weekNumber: 4,
        weekLabel: 'Semana 4',
        objective: 'Consolidação hídrica, selagem das cutículas e reavaliação comparativa dos resultados.',
        mainTreatment: 'Hidratação & Selagem de Cutículas com Ácido Hialurônico e D-Pantenol',
        complementaryTreatment: 'Acidificante equilibrante para fixação dos ativos no interior da fibra.',
        protection: 'Finalizador protetor térmico fluido e secagem suave com difusor ou escovação polida.',
        homeCare: 'Continuidade dos cuidados em casa com foco em lavagens em água morna/fria.',
        professionalNote: 'Verificar resposta do córtex e das pontas para definir a próxima etapa em 30 dias.',
        reassessmentNotice: 'Reavaliar a fibra e comparar com a avaliação inicial (elasticidade, porosidade, toque e frizz).',
        treatmentCategory: 'HIDRATACAO',
        isReconstruction: false,
        status: 'SUGERIDO',
      };
    }
  }

  // Populate category alias and array representation
  week1.category = week1.treatmentCategory;
  week2.category = week2.treatmentCategory;
  week3.category = week3.treatmentCategory;
  week4.category = week4.treatmentCategory;

  // Retorno estruturado e tipado com vinculação ao id da avaliação e cliente
  return {
    id: `cronograma-${evaluationId}`,
    evaluationId,
    clientId,
    createdAt: new Date().toISOString(),
    summary: scheduleSummary,
    strategyRhythm,
    dominantNeed: scores.dominantNeed,
    week1,
    week2,
    week3,
    week4,
    weeks: [week1, week2, week3, week4],
    hasTechnicalEvidenceForReconstruction,
    scalpGuidance,
    reassessmentPrep,
    status: 'SUGERIDO',
    professionalNotes: treatmentPlan.personalizedTreatment?.professionalNotes || undefined,
    version: 1,
  };
}


