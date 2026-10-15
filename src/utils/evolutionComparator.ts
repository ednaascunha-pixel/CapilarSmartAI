import { FullEvaluationRecord } from '../types';

export type EvolutionTrend = 'MELHORA' | 'ESTABILIDADE' | 'NECESSIDADE_ATENCAO';

export interface NumericalMetricDiff {
  key: string;
  label: string;
  unit: string;
  previousValue: number;
  currentValue: number;
  difference: number; // currentValue - previousValue
  trend: EvolutionTrend;
  interpretationText: string;
}

export interface QualitativeMetricDiff {
  key: string;
  label: string;
  previousValue: string;
  currentValue: string;
  trend: EvolutionTrend;
  interpretationText: string;
}

export interface TechnicalEvolutionReport {
  isFirstEvaluation: boolean;
  message?: string;
  clientId: string;
  clientName: string;
  previousEvaluationId?: string;
  previousDate?: string;
  currentEvaluationId?: string;
  currentDate?: string;
  overallHealthDiff?: NumericalMetricDiff;
  damageGradeEvolution?: {
    previous: string;
    current: string;
    trend: EvolutionTrend;
    text: string;
  };
  numericalMetrics: NumericalMetricDiff[];
  qualitativeMetrics: QualitativeMetricDiff[];
  technicalExplanation: string;
  clientPerceptionVsTechnicalEvidence: {
    clientPerceptionSummary: string;
    technicalEvidenceSummary: string;
  };
  treatmentComparison: {
    previousTreatmentName: string;
    currentTreatmentName: string;
    previousDominantNeed: string;
    currentDominantNeed: string;
  };
  professionalEvolutionNotes?: string;
  nextReassessmentGoal?: string;
}

/**
 * Normaliza rótulos e chaves qualitativas
 */
function formatTestValue(val: string | undefined): string {
  if (!val) return 'Não informado';
  return val.replace(/_/g, ' ').toLowerCase();
}

/**
 * Compara a avaliação atual com a anterior da MESMA CLIENTE.
 * Se não houver avaliação anterior, retorna explicitamente a indicação de primeira avaliação.
 */
export function compareEvaluations(
  current: FullEvaluationRecord,
  previous?: FullEvaluationRecord | null
): TechnicalEvolutionReport {
  // Verificação de isolamento: Se não existir anterior ou se pertencerem a clientes diferentes
  if (!previous || previous.clientId !== current.clientId) {
    return {
      isFirstEvaluation: true,
      message: 'Primeira avaliação registrada. Ainda não há dados anteriores para comparação.',
      clientId: current.clientId,
      clientName: current.clientName,
      currentEvaluationId: current.id,
      currentDate: current.date,
      numericalMetrics: [],
      qualitativeMetrics: [],
      technicalExplanation:
        'Esta é a primeira avaliação capilar desta cliente no sistema. Os parâmetros coletados servirão como linha de base (baseline) para os futuros acompanhamentos da fibra.',
      clientPerceptionVsTechnicalEvidence: {
        clientPerceptionSummary:
          current.anamnese.perceivedDamages?.length > 0
            ? `Queixas relatadas pela cliente: ${current.anamnese.perceivedDamages.join(', ')}.`
            : 'Nenhuma queixa específica registrada pela cliente.',
        technicalEvidenceSummary:
          current.scores.keyEvidences?.length > 0
            ? `Evidências técnicas da bancada: ${current.scores.keyEvidences.join('; ')}.`
            : 'Dados técnicos registrados na avaliação inicial.',
      },
      treatmentComparison: {
        previousTreatmentName: 'Nenhum (primeiro ciclo)',
        currentTreatmentName: current.salonProtocol.protocolName,
        previousDominantNeed: 'Nenhuma',
        currentDominantNeed: current.scores.dominantNeedLabel,
      },
      professionalEvolutionNotes: current.evolutionNotes || current.professionalNotes,
      nextReassessmentGoal:
        current.nextEvaluationGoal ||
        'Reavaliar em aproximadamente 4 semanas ao final do ciclo de tratamento.',
    };
  }

  // Há duas avaliações da mesma cliente:
  const prevScores = previous.scores;
  const currScores = current.scores;

  // 1. Índice Geral de Integridade
  const healthDiff = currScores.overallHealth - prevScores.overallHealth;
  let healthTrend: EvolutionTrend = 'ESTABILIDADE';
  let healthText = 'Índice de integridade avaliado mantido estável.';
  if (healthDiff >= 5) {
    healthTrend = 'MELHORA';
    healthText = `Melhora do índice de integridade avaliado (+${healthDiff} pontos).`;
  } else if (healthDiff <= -5) {
    healthTrend = 'NECESSIDADE_ATENCAO';
    healthText = `Oscilação no índice de integridade avaliado (${healthDiff} pontos). Requer acompanhamento.`;
  }

  const overallHealthDiff: NumericalMetricDiff = {
    key: 'overallHealth',
    label: 'Índice Geral de Integridade',
    unit: 'pts',
    previousValue: prevScores.overallHealth,
    currentValue: currScores.overallHealth,
    difference: healthDiff,
    trend: healthTrend,
    interpretationText: healthText,
  };

  // 2. Grau de Integridade (GRAU_1 a GRAU_4)
  const gradeRank: Record<string, number> = {
    GRAU_1: 1,
    GRAU_2: 2,
    GRAU_3: 3,
    GRAU_4: 4,
  };
  const prevGradeRank = gradeRank[prevScores.damageGrade] || 2;
  const currGradeRank = gradeRank[currScores.damageGrade] || 2;
  let gradeTrend: EvolutionTrend = 'ESTABILIDADE';
  let gradeText = `Grau ${currScores.damageGrade} mantido estável.`;
  if (currGradeRank < prevGradeRank) {
    gradeTrend = 'MELHORA';
    gradeText = `Evolução positiva: a fibra transitou de ${prevScores.damageGrade} para ${currScores.damageGrade}.`;
  } else if (currGradeRank > prevGradeRank) {
    gradeTrend = 'NECESSIDADE_ATENCAO';
    gradeText = `Atenção: a fibra apresentou maior grau de alteração (${prevScores.damageGrade} ➔ ${currScores.damageGrade}).`;
  }

  // 3. Métricas Numéricas das Demandas Capilares
  // IMPORTANTE (Regra 7): Uma redução na necessidade (ex: reconstrução de 80 para 45) significa
  // "Redução da necessidade reconstrutora" e NÃO piora!
  const calcNeedDiff = (
    key: string,
    label: string,
    prevVal: number,
    currVal: number,
    isNeedReductionImprovement = true
  ): NumericalMetricDiff => {
    const diff = currVal - prevVal;
    let trend: EvolutionTrend = 'ESTABILIDADE';
    let text = 'Demanda cosmética estável no período.';

    if (Math.abs(diff) >= 5) {
      if (isNeedReductionImprovement) {
        // Redução da necessidade = fibra recuperada/atendida (MELHORA)
        if (diff < 0) {
          trend = 'MELHORA';
          if (key === 'reconstruction') {
            text = `Redução da necessidade reconstrutora (-${Math.abs(diff)}%), indicando consolidação proteica e menor urgência de reposição.`;
          } else if (key === 'frizz') {
            text = `Redução da necessidade de controle de frizz (-${Math.abs(diff)}%), indicando maior alinhamento e selagem cuticular.`;
          } else if (key === 'hydration') {
            text = `Redução da urgência hídrica (-${Math.abs(diff)}%), indicando melhor retenção de umidade pela fibra.`;
          } else if (key === 'nutrition') {
            text = `Redução da demanda lipídica (-${Math.abs(diff)}%), indicando melhor emoliência e barreira lipídica suprida.`;
          } else {
            text = `Redução da necessidade cosmética (-${Math.abs(diff)}%), indicando resposta favorável da fibra.`;
          }
        } else {
          trend = 'NECESSIDADE_ATENCAO';
          text = `Aumento da demanda (+${diff}%), indicando maior necessidade de intervenção cosmética nesta etapa.`;
        }
      } else {
        if (diff > 0) {
          trend = 'MELHORA';
          text = `Evolução positiva (+${diff}%).`;
        } else {
          trend = 'NECESSIDADE_ATENCAO';
          text = `Variação negativa (${diff}%).`;
        }
      }
    }

    return {
      key,
      label,
      unit: '%',
      previousValue: prevVal,
      currentValue: currVal,
      difference: diff,
      trend,
      interpretationText: text,
    };
  };

  const numericalMetrics: NumericalMetricDiff[] = [
    calcNeedDiff('reconstruction', 'Prioridade de Reconstrução', prevScores.reconstructionNeed, currScores.reconstructionNeed, true),
    calcNeedDiff('hydration', 'Prioridade de Hidratação', prevScores.hydrationNeed, currScores.hydrationNeed, true),
    calcNeedDiff('nutrition', 'Prioridade de Nutrição (Lipídica)', prevScores.nutritionNeed, currScores.nutritionNeed, true),
    calcNeedDiff('frizz', 'Necessidade de Controle de Frizz', prevScores.frizzControlNeed ?? 0, currScores.frizzControlNeed ?? 0, true),
    calcNeedDiff('scalp', 'Atenção ao Couro Cabeludo', prevScores.scalpBalanceNeed ?? 0, currScores.scalpBalanceNeed ?? 0, true),
  ];

  // 4. Testes Físicos Qualitativos da Fibra
  const compareQualitative = (
    key: string,
    label: string,
    prevVal: string | undefined,
    currVal: string | undefined,
    favorableValues: string[],
    unfavorableValues: string[]
  ): QualitativeMetricDiff => {
    const p = prevVal || '';
    const c = currVal || '';

    let trend: EvolutionTrend = 'ESTABILIDADE';
    let interpretationText = 'Sem alteração no parâmetro.';

    if (p !== c) {
      const isNowFavorable = favorableValues.some((fv) => c.toUpperCase().includes(fv.toUpperCase()));
      const wasUnfavorable = unfavorableValues.some((uf) => p.toUpperCase().includes(uf.toUpperCase()));

      const isNowUnfavorable = unfavorableValues.some((uf) => c.toUpperCase().includes(uf.toUpperCase()));
      const wasFavorable = favorableValues.some((fv) => p.toUpperCase().includes(fv.toUpperCase()));

      if (key === 'porosidade' && p.toUpperCase().includes('ALTA') && (c.toUpperCase().includes('MEDIA') || c.toUpperCase().includes('BAIXA'))) {
        trend = 'MELHORA';
        interpretationText = `Melhora do equilíbrio de porosidade observado na avaliação (transição de "${formatTestValue(p)}" para "${formatTestValue(c)}").`;
      } else if (isNowFavorable && wasUnfavorable) {
        trend = 'MELHORA';
        interpretationText = `Melhora documentada: transição de "${formatTestValue(p)}" para "${formatTestValue(c)}".`;
      } else if (isNowUnfavorable && wasFavorable) {
        trend = 'NECESSIDADE_ATENCAO';
        interpretationText = `Ponto de atenção: transição de "${formatTestValue(p)}" para "${formatTestValue(c)}".`;
      } else {
        trend = 'ESTABILIDADE';
        interpretationText = `Variação de "${formatTestValue(p)}" para "${formatTestValue(c)}".`;
      }
    }

    return {
      key,
      label,
      previousValue: formatTestValue(p),
      currentValue: formatTestValue(c),
      trend,
      interpretationText,
    };
  };

  const qualitativeMetrics: QualitativeMetricDiff[] = [
    compareQualitative(
      'elasticidade',
      'Elasticidade da Fibra',
      previous.visual.elasticity,
      current.visual.elasticity,
      ['SAUDAVEL'],
      ['BAIXA_EMBORRACHADO']
    ),
    compareQualitative(
      'resistencia',
      'Resistência à Tração Mecânica',
      previous.visual.tensileResistance,
      current.visual.tensileResistance,
      ['BOA_RESISTENTE'],
      ['FRAGIL_QUEBRADICO']
    ),
    compareQualitative(
      'porosidade',
      'Porosidade Cuticular',
      previous.visual.porosity,
      current.visual.porosity,
      ['BAIXA', 'MEDIA'],
      ['ALTA']
    ),
    compareQualitative(
      'pontas',
      'Estado das Pontas',
      previous.visual.endsState,
      current.visual.endsState,
      ['INTEGRAS'],
      ['MULTIPLAS_ESFARELADAS', 'DUPLAS']
    ),
    compareQualitative(
      'toque',
      'Toque / Aspecto',
      previous.visual.touchSensation,
      current.visual.touchSensation,
      ['MACIO_SEDOSO'],
      ['ASPERO_RIGIDO', 'FRAGIL_QUEBRADICO', 'RESSECADO_OPOCO']
    ),
    compareQualitative(
      'frizz',
      'Nível de Frizz Visual',
      previous.visual.frizzLevel,
      current.visual.frizzLevel,
      ['LEVE'],
      ['INTENSO']
    ),
  ];

  // 5. Evolução Técnica Explicada (sem inventar causalidade)
  const explanations: string[] = [];

  const reconDiff = currScores.reconstructionNeed - prevScores.reconstructionNeed;
  const elasticityImproved =
    previous.visual.elasticity === 'BAIXA_EMBORRACHADO' &&
    (current.visual.elasticity === 'MEDIA' || current.visual.elasticity === 'SAUDAVEL');
  const tensileImproved =
    previous.visual.tensileResistance === 'FRAGIL_QUEBRADICO' &&
    (current.visual.tensileResistance === 'MODERADA' || current.visual.tensileResistance === 'BOA_RESISTENTE');

  if (reconDiff < 0 && (elasticityImproved || tensileImproved)) {
    explanations.push(
      'Na avaliação atual, houve redução da necessidade de reconstrução associada à melhora registrada na elasticidade e na resistência à tração.'
    );
  }

  const frizzDiff = (currScores.frizzControlNeed ?? 0) - (prevScores.frizzControlNeed ?? 0);
  const porosityImproved =
    previous.visual.porosity === 'ALTA' &&
    (current.visual.porosity === 'MEDIA' || current.visual.porosity === 'BAIXA');
  const touchImproved =
    previous.visual.touchSensation !== 'MACIO_SEDOSO' &&
    current.visual.touchSensation === 'MACIO_SEDOSO';

  if (frizzDiff < 0 && (porosityImproved || touchImproved)) {
    explanations.push(
      'Houve diminuição na necessidade de controle de frizz com convergência na redução da aspereza ao toque e melhor selagem cuticular.'
    );
  }

  if (healthDiff > 0 && explanations.length === 0) {
    explanations.push(
      `O índice geral de integridade apresentou melhora (+${healthDiff} pontos), refletindo a evolução favorável nos parâmetros da fibra capilar.`
    );
  } else if (healthDiff < 0 && explanations.length === 0) {
    explanations.push(
      `O índice de integridade capilar apresentou decréscimo (${healthDiff} pontos), sugerindo a necessidade de ajuste no cronograma e reforço das etapas de proteção.`
    );
  } else if (healthDiff === 0 && explanations.length === 0) {
    explanations.push(
      'A fibra capilar manteve parâmetros de integridade estáveis entre as avaliações registradas.'
    );
  }

  // 6. Separação Estrita: Queixa da Cliente vs Evidência Técnica
  const prevPerceptions = previous.anamnese.perceivedDamages || [];
  const currPerceptions = current.anamnese.perceivedDamages || [];
  const resolvedPerceptions = prevPerceptions.filter((p) => !currPerceptions.includes(p));
  const newPerceptions = currPerceptions.filter((p) => !prevPerceptions.includes(p));

  let clientPerceptionSummary = '';
  if (resolvedPerceptions.length > 0) {
    clientPerceptionSummary = `Melhora percebida pela cliente: ${resolvedPerceptions.join(', ')}. `;
  }
  if (newPerceptions.length > 0) {
    clientPerceptionSummary += `Novas percepções relatadas pela cliente: ${newPerceptions.join(', ')}.`;
  }
  if (!clientPerceptionSummary) {
    clientPerceptionSummary =
      currPerceptions.length > 0
        ? `Percepções mantidas pela cliente: ${currPerceptions.join(', ')}.`
        : 'Cliente não relatou desconfortos ou danos agudos na avaliação.';
  }

  let technicalEvidenceSummary = '';
  const improvedTech = qualitativeMetrics.filter((m) => m.trend === 'MELHORA');
  const attentionTech = qualitativeMetrics.filter((m) => m.trend === 'NECESSIDADE_ATENCAO');

  if (improvedTech.length > 0) {
    technicalEvidenceSummary = `Evidências técnicas documentadas de melhora: ${improvedTech
      .map((m) => `${m.label.toLowerCase()} (${m.currentValue})`)
      .join(', ')}.`;
  }
  if (attentionTech.length > 0) {
    technicalEvidenceSummary += ` Pontos com evidência de atenção: ${attentionTech
      .map((m) => `${m.label.toLowerCase()} (${m.currentValue})`)
      .join(', ')}.`;
  }
  if (!technicalEvidenceSummary) {
    technicalEvidenceSummary = 'Testes físicos de bancada mantiveram estabilidade nos parâmetros avaliados.';
  }

  return {
    isFirstEvaluation: false,
    clientId: current.clientId,
    clientName: current.clientName,
    previousEvaluationId: previous.id,
    previousDate: previous.date,
    currentEvaluationId: current.id,
    currentDate: current.date,
    overallHealthDiff,
    damageGradeEvolution: {
      previous: prevScores.damageGrade,
      current: currScores.damageGrade,
      trend: gradeTrend,
      text: gradeText,
    },
    numericalMetrics,
    qualitativeMetrics,
    technicalExplanation: explanations.join(' '),
    clientPerceptionVsTechnicalEvidence: {
      clientPerceptionSummary,
      technicalEvidenceSummary,
    },
    treatmentComparison: {
      previousTreatmentName: previous.salonProtocol?.protocolName || 'Protocolo anterior',
      currentTreatmentName: current.salonProtocol?.protocolName || 'Protocolo atual',
      previousDominantNeed: prevScores.dominantNeedLabel || 'Necessidade anterior',
      currentDominantNeed: currScores.dominantNeedLabel || 'Necessidade atual',
    },
    professionalEvolutionNotes: current.evolutionNotes || current.professionalNotes,
    nextReassessmentGoal:
      current.nextEvaluationGoal ||
      'Reavaliar em aproximadamente 4 semanas ao final do ciclo de tratamento.',
  };
}
