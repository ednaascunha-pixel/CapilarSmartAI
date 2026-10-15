import {
  FullEvaluationRecord,
  SalonSettings,
  ClientData,
  ProfessionalReportData,
  FourWeekTreatmentSchedule,
  ScheduleWeek,
} from '../types';
import { compareEvaluations } from './evolutionComparator';

/**
 * Funções auxiliares para tradução e formatação legível e técnica
 */
function formatCurvature(c?: string): string {
  if (!c) return 'Não informado';
  const map: Record<string, string> = {
    '1A': '1A (Liso Fino)',
    '1B': '1B (Liso Médio)',
    '1C': '1C (Liso Grosso / Pesado)',
    '2A': '2A (Ondulado Leve)',
    '2B': '2B (Ondulado Definido)',
    '2C': '2C (Ondulado Intenso)',
    '3A': '3A (Cacheado Aberto)',
    '3B': '3B (Cacheado Médio)',
    '3C': '3C (Cacheado Fechado)',
    '4A': '4A (Crespo Suave)',
    '4B': '4B (Crespo Angulado / Z)',
    '4C': '4C (Crespo Muito Encaracolado)',
  };
  return map[c] || c;
}

function formatElasticity(e?: string): string {
  if (!e) return 'Não informado';
  const map: Record<string, string> = {
    SAUDAVEL: 'Saudável (Retração e retorno elástico adequados)',
    MEDIA: 'Elasticidade Moderada (Leve fadiga na tração)',
    BAIXA_EMBORRACHADO: 'Baixa / Emborrachado (Perda de resistência mecânica)',
  };
  return map[e] || e;
}

function formatPorosity(p?: string): string {
  if (!p) return 'Não informado';
  const map: Record<string, string> = {
    BAIXA: 'Baixa (Cutículas seladas / absorção lenta)',
    MEDIA: 'Média (Equilíbrio hídrico e absorção ideal)',
    ALTA: 'Alta (Cutículas desgastadas / hiperpermeável)',
  };
  return map[p] || p;
}

function formatThickness(t?: string): string {
  if (!t) return 'Não informado';
  const map: Record<string, string> = {
    FINO: 'Fino',
    MEDIO: 'Médio',
    GROSSO: 'Grosso',
  };
  return map[t] || t;
}

function formatDensity(d?: string): string {
  if (!d) return 'Não informado';
  const map: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
  };
  return map[d] || d;
}

function formatTensileResistance(r?: string): string {
  if (!r) return 'Não avaliado';
  const map: Record<string, string> = {
    BOA_RESISTENTE: 'Boa / Resistente à tração mecânica',
    MODERADA: 'Moderada (Suporta tração com limite)',
    FRAGIL_QUEBRADICO: 'Frágil / Quebradiço (Ruptura precoce)',
  };
  return map[r] || r;
}

function formatEndsState(e?: string): string {
  if (!e) return 'Não informado';
  const map: Record<string, string> = {
    INTEGRAS: 'Íntegras e alinhadas',
    RESSECADAS: 'Ressecadas com perda de maleabilidade',
    DUPLAS: 'Pontas duplas (bifurcadas)',
    MULTIPLAS_ESFARELADAS: 'Múltiplas / Fissuradas / Esfareladas',
  };
  return map[e] || e;
}

function formatTouch(t?: string): string {
  if (!t) return 'Não informado';
  const map: Record<string, string> = {
    MACIO_SEDOSO: 'Macio e sedoso',
    ASPERO_RIGIDO: 'Áspero e rígido',
    RESSECADO_OPOCO: 'Ressecado e opaco',
    FRAGIL_QUEBRADICO: 'Sensação frágil e quebradiça',
  };
  return map[t] || t;
}

function formatFrizz(f?: string): string {
  if (!f) return 'Não informado';
  const map: Record<string, string> = {
    LEVE: 'Leve (Alinhamento natural preservado)',
    MODERADO: 'Moderado (Fios desalinhados)',
    INTENSO: 'Intenso (Dispersão cuticular acentuada)',
  };
  return map[f] || f;
}

function formatScalp(s?: string): string {
  if (!s) return 'Não informado';
  const map: Record<string, string> = {
    NORMAL: 'Couro cabeludo normal / equilibrado',
    OLEOSO: 'Couro cabeludo oleoso',
    SECO: 'Couro cabeludo seco',
    SENSIVEL: 'Couro cabeludo sensível',
  };
  return map[s] || s;
}

function formatWashFrequency(w?: string): string {
  if (!w) return 'Não informado';
  const map: Record<string, string> = {
    DIARIA: 'Lavagem diária',
    '2_3_VEZES': '2 a 3 vezes por semana',
    '1_VEZ_SEMANA': '1 vez por semana',
  };
  return map[w] || w;
}

function formatHeatTools(h?: string): string {
  if (!h) return 'Não informado';
  const map: Record<string, string> = {
    DIARIO: 'Uso diário de secador / prancha',
    FREQUENTE: 'Uso frequente (2 a 4 vezes por semana)',
    OCASIONAL: 'Uso ocasional (eventos / finais de semana)',
    NUNCA: 'Não utiliza fontes de calor',
  };
  return map[h] || h;
}

/**
 * Gera a estrutura completa do Relatório Profissional da Avaliação Capilar
 * a partir do registro da avaliação e de dados periféricos já existentes.
 * Não recalcula pontuações nem cria uma segunda lógica de negócio.
 */
export function generateProfessionalReport(
  evaluation: FullEvaluationRecord,
  previousEvaluation?: FullEvaluationRecord | null,
  settings?: SalonSettings,
  client?: ClientData | null
): ProfessionalReportData {
  const evalDate = new Date(evaluation.date);
  const formattedDate = !isNaN(evalDate.getTime())
    ? evalDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : evaluation.date;

  const clientName = client?.name || evaluation.clientName || 'Cliente';
  const clientId = client?.id || evaluation.clientId;

  // 1. Identificação da Cliente
  const reportClient = {
    id: clientId,
    name: clientName,
    age: client?.age,
    phone: client?.phone,
    email: client?.email,
  };

  // 2. Objetivo da Cliente (Relato)
  const clientComplaints: string[] = [];
  if (client?.mainComplaint) {
    clientComplaints.push(client.mainComplaint);
  }
  if (evaluation.anamnese?.perceivedDamages && evaluation.anamnese.perceivedDamages.length > 0) {
    evaluation.anamnese.perceivedDamages.forEach((d) => {
      if (!clientComplaints.includes(d)) clientComplaints.push(d);
    });
  }

  const clientObjective = {
    mainComplaints: clientComplaints,
    declaredGoals: client?.hairGoal || 'Recuperação da saúde e vitalidade dos fios',
    resultExpectations: client?.notes || undefined,
  };

  // 3. Anamnese
  const anamnese = {
    scalpType: formatScalp(evaluation.anamnese.scalpType),
    washFrequency: formatWashFrequency(evaluation.anamnese.washFrequency),
    heatToolsUsage: formatHeatTools(evaluation.anamnese.heatTools),
    chemicalHistory:
      evaluation.anamnese.chemicalHistory && evaluation.anamnese.chemicalHistory.length > 0
        ? evaluation.anamnese.chemicalHistory
        : ['Nenhum procedimento químico relatado'],
    lastChemicalDateOrPeriod: evaluation.anamnese.lastChemicalTime,
    poolSunSeaExposure: Boolean(evaluation.anamnese.poolSunExposure),
    waterIntakeLiters: evaluation.anamnese.waterIntakeLiters,
    perceivedDamages: evaluation.anamnese.perceivedDamages || [],
  };

  // 4. Avaliação da Fibra
  const fiberAssessment = {
    curvature: formatCurvature(evaluation.visual.curvature),
    elasticity: formatElasticity(evaluation.visual.elasticity),
    porosity: formatPorosity(evaluation.visual.porosity),
    thickness: formatThickness(evaluation.visual.thickness),
    density: formatDensity(evaluation.visual.density),
    tensileResistance: formatTensileResistance(evaluation.visual.tensileResistance),
    endsState: formatEndsState(evaluation.visual.endsState),
    touchAspect: formatTouch(evaluation.visual.touchSensation),
    frizzAlignment: formatFrizz(evaluation.visual.frizzLevel),
    rootToTipDifference:
      evaluation.visual.rootToTipDifference === 'RAIZ_OLEOSA_PONTAS_SECAS'
        ? 'Raiz oleosa com pontas secas'
        : evaluation.visual.rootToTipDifference === 'COMPRIMENTO_DANIFICADO'
        ? 'Comprimento e pontas danificados em relação à raiz'
        : 'Uniforme da raiz às pontas',
    colorCondition:
      evaluation.visual.colorCondition === 'DESCOLORIDO_MECHAS'
        ? 'Fios descoloridos / mechas'
        : evaluation.visual.colorCondition === 'COLORIDO_UNIFORME'
        ? 'Coloração cosmética uniforme'
        : evaluation.visual.colorCondition === 'BRANCOS_RESISTENTES'
        ? 'Fios brancos / grisalhos resistentes'
        : 'Cor natural',
  };

  // 5. Microscopia / Aparelho Digital
  const hasMicroscopeData = Boolean(
    evaluation.visual.microscope &&
      (evaluation.visual.microscope.observedRegion ||
        (evaluation.visual.microscope.deviceFindings &&
          evaluation.visual.microscope.deviceFindings.length > 0) ||
        evaluation.visual.microscope.deviceNotes ||
        evaluation.visual.microscope.deviceImage)
  );

  const microscopy = hasMicroscopeData
    ? {
        hasData: true,
        observedRegion: evaluation.visual.microscope?.observedRegion || 'Região medial da haste capilar',
        findings: evaluation.visual.microscope?.deviceFindings || [],
        observations: evaluation.visual.microscope?.deviceNotes,
        image: evaluation.visual.microscope?.deviceImage,
      }
    : undefined;

  // 6. Índices e Necessidades (Identificados como PRIORIDADE / NECESSIDADE)
  const scoresAndNeeds = {
    overallHealthIndex: evaluation.scores.overallHealth,
    healthGrade: evaluation.scores.healthGrade,
    damageGrade: evaluation.scores.damageGrade,
    damageGradeLabel: evaluation.scores.damageGradeLabel,
    dominantNeedLabel: evaluation.scores.dominantNeedLabel,
    dominantNeedKey: evaluation.scores.dominantNeed,
    hydrationPriority: evaluation.scores.hydrationNeed,
    nutritionPriority: evaluation.scores.nutritionNeed,
    reconstructionPriority: evaluation.scores.reconstructionNeed,
    frizzControlNeed: evaluation.scores.frizzControlNeed,
    scalpBalanceAttention: evaluation.scores.scalpBalanceNeed,
    secondaryNeeds: evaluation.scores.secondaryNeeds || [],
  };

  // 7. Justificativas Técnicas (Baseadas nos dados reais do motor)
  const technicalJustifications = {
    primaryRationale:
      evaluation.scores.technicalJustification ||
      `Prioridade dominante definida como ${scoresAndNeeds.dominantNeedLabel} conforme os parâmetros físicos coletados na bancada.`,
    keyEvidences: evaluation.scores.keyEvidences || [],
    rationaleDetails: evaluation.scores.scoreRationale || [],
    treatmentObjectiveRecommended:
      evaluation.scores.recommendedTreatmentObjective ||
      'Restabelecimento da integridade da fibra e alinhamento lipídico.',
  };

  // 8. Tratamento Personalizado
  const treatmentPlan = {
    objective: evaluation.salonProtocol.objective || 'Equilíbrio e recuperação da fibra',
    priority: evaluation.salonProtocol.protocolName,
    mainTreatment: evaluation.salonProtocol.protocolName,
    complementaryTreatments:
      evaluation.salonProtocol.personalizedTreatment?.treatmentType ||
      evaluation.salonProtocol.targetIssue,
    frequency: evaluation.salonProtocol.recommendedSalonFrequency || '1 vez por semana',
    pauseTimeMinutes: evaluation.salonProtocol.pauseTimeMinutes || 15,
    protocolSteps: evaluation.salonProtocol.steps || [],
    selectedProducts: evaluation.salonProtocol.selectedProducts || [],
    professionalObservations:
      evaluation.salonProtocol.professionalObservation ||
      evaluation.salonProtocol.professionalNotes,
    precautions: evaluation.salonProtocol.precautions || [],
  };

  // 9. Cronograma de 4 Semanas
  let schedule4Weeks: ProfessionalReportData['schedule4Weeks'] = undefined;
  const sched: Partial<FourWeekTreatmentSchedule> | undefined =
    evaluation.treatmentSchedule || evaluation.salonProtocol?.schedule4Weeks;

  if (sched && typeof sched === 'object') {
    // Normalização defensiva: suporta array weeks ou objetos individuais week1..week4
    const getSafeWeek = (weekObj: Partial<ScheduleWeek> | undefined, weekNumber: 1 | 2 | 3 | 4) => {
      const fallbackFromList = Array.isArray(sched.weeks)
        ? sched.weeks.find((w) => w && w.weekNumber === weekNumber)
        : undefined;
      const target = weekObj || fallbackFromList;

      return {
        weekNumber,
        label: target?.weekLabel || `Semana ${weekNumber}`,
        objective: target?.objective || 'Não registrado nesta avaliação',
        treatment: target?.mainTreatment || 'Tratamento conforme evolução da fibra',
        careAndProtection: target?.protection || 'Proteção e cuidados habituais',
        reassessmentNotice:
          weekNumber === 4
            ? target?.reassessmentNotice || 'Reavaliar a fibra e comparar parâmetros com a avaliação inicial.'
            : undefined,
      };
    };

    // Só inclui se ao menos houver alguma indicação de cronograma ou semana definida
    const hasAnyWeekData =
      Boolean(sched.week1) ||
      Boolean(sched.week2) ||
      Boolean(sched.week3) ||
      Boolean(sched.week4) ||
      (Array.isArray(sched.weeks) && sched.weeks.length > 0) ||
      Boolean(sched.strategyRhythm) ||
      Boolean(sched.summary);

    if (hasAnyWeekData) {
      schedule4Weeks = {
        summary: sched.summary || 'Ciclo de 4 semanas focado em recomposição e manutenção',
        strategyRhythm: sched.strategyRhythm || 'Frequência semanal',
        weeks: [
          getSafeWeek(sched.week1, 1),
          getSafeWeek(sched.week2, 2),
          getSafeWeek(sched.week3, 3),
          getSafeWeek(sched.week4, 4),
        ],
      };
    }
  }

  // 10. Home Care
  const homeCare = {
    washingRoutine: {
      shampoo: evaluation.homeCare.shampooRecommendation || 'Shampoo de limpeza suave e pH equilibrado',
      conditioner: evaluation.homeCare.conditionerRecommendation || 'Condicionador selante cuticular',
    },
    treatmentMask: evaluation.homeCare.treatmentMask || 'Máscara de tratamento indicada para o cronograma',
    protection:
      evaluation.homeCare.leaveInThermalProtector ||
      'Leave-in hidratante com proteção térmica obrigatória antes de secador ou prancha',
    finishingAndEnds:
      evaluation.homeCare.oilFinisher || 'Óleo vegetal finalizador para selagem e proteção das pontas',
    scalpCare: sched?.scalpGuidance?.cosmeticGuidance,
    weeklyRoutine: evaluation.homeCare.weeklyCalendar || [],
    observations: evaluation.homeCare.washTips || [],
    selectedProducts: evaluation.homeCare.selectedProducts || [],
  };

  // 11. Observações Profissionais
  const professionalObservations = {
    evaluationNotes: evaluation.visual.professionalObservations || evaluation.professionalNotes,
    evolutionNotes: evaluation.evolutionNotes,
    attentionPoints: evaluation.scores.insufficientDataWarnings || [],
    professionalRecommendations: evaluation.salonProtocol.professionalObservation,
  };

  // 12. Próxima Reavaliação
  const nextReassessment = {
    guidance:
      evaluation.homeCare.monitoringFollowUp ||
      'Retorno planejado ao salão após 4 semanas de tratamento ou término do cronograma inicial.',
    goal:
      evaluation.nextEvaluationGoal ||
      evaluation.homeCare.reassessmentPlan ||
      sched?.reassessmentPrep?.guidance ||
      'Avaliar evolução da elasticidade, fechamento cuticular e retenção hídrica/lipídica.',
    estimatedTimeframe: 'Aproximadamente 4 semanas (conclusão do ciclo inicial)',
  };

  // COMPARAÇÃO COM AVALIAÇÃO ANTERIOR (EVOLUÇÃO)
  // Isolamento estrito de cliente: só compara se previousEvaluation for da MESMA cliente
  let evolutionComparison: ProfessionalReportData['evolutionComparison'] = undefined;

  if (previousEvaluation && previousEvaluation.clientId === evaluation.clientId) {
    const compReport = compareEvaluations(evaluation, previousEvaluation);
    const prevDate = new Date(previousEvaluation.date);
    const formattedPrevDate = !isNaN(prevDate.getTime())
      ? prevDate.toLocaleDateString('pt-BR')
      : previousEvaluation.date;

    const mainNeeds = [
      {
        need: 'Reconstrução',
        previousScore: previousEvaluation.scores.reconstructionNeed,
        currentScore: evaluation.scores.reconstructionNeed,
        diff: evaluation.scores.reconstructionNeed - previousEvaluation.scores.reconstructionNeed,
        trend:
          evaluation.scores.reconstructionNeed < previousEvaluation.scores.reconstructionNeed
            ? ('MELHORA' as const)
            : evaluation.scores.reconstructionNeed === previousEvaluation.scores.reconstructionNeed
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
      {
        need: 'Nutrição',
        previousScore: previousEvaluation.scores.nutritionNeed,
        currentScore: evaluation.scores.nutritionNeed,
        diff: evaluation.scores.nutritionNeed - previousEvaluation.scores.nutritionNeed,
        trend:
          evaluation.scores.nutritionNeed < previousEvaluation.scores.nutritionNeed
            ? ('MELHORA' as const)
            : evaluation.scores.nutritionNeed === previousEvaluation.scores.nutritionNeed
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
      {
        need: 'Hidratação',
        previousScore: previousEvaluation.scores.hydrationNeed,
        currentScore: evaluation.scores.hydrationNeed,
        diff: evaluation.scores.hydrationNeed - previousEvaluation.scores.hydrationNeed,
        trend:
          evaluation.scores.hydrationNeed < previousEvaluation.scores.hydrationNeed
            ? ('MELHORA' as const)
            : evaluation.scores.hydrationNeed === previousEvaluation.scores.hydrationNeed
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
      {
        need: 'Controle de Frizz',
        previousScore: previousEvaluation.scores.frizzControlNeed,
        currentScore: evaluation.scores.frizzControlNeed,
        diff: evaluation.scores.frizzControlNeed - previousEvaluation.scores.frizzControlNeed,
        trend:
          evaluation.scores.frizzControlNeed < previousEvaluation.scores.frizzControlNeed
            ? ('MELHORA' as const)
            : evaluation.scores.frizzControlNeed === previousEvaluation.scores.frizzControlNeed
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
    ];

    // Fiber evolution: elasticidade, porosidade, resistência, pontas, frizz
    const fiberEvolution = [
      {
        label: 'Elasticidade',
        previous: formatElasticity(previousEvaluation.visual.elasticity),
        current: formatElasticity(evaluation.visual.elasticity),
        trend:
          evaluation.visual.elasticity === 'SAUDAVEL' && previousEvaluation.visual.elasticity !== 'SAUDAVEL'
            ? ('MELHORA' as const)
            : evaluation.visual.elasticity === previousEvaluation.visual.elasticity
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
      {
        label: 'Porosidade',
        previous: formatPorosity(previousEvaluation.visual.porosity),
        current: formatPorosity(evaluation.visual.porosity),
        trend:
          evaluation.visual.porosity === 'MEDIA' && previousEvaluation.visual.porosity === 'ALTA'
            ? ('MELHORA' as const)
            : evaluation.visual.porosity === previousEvaluation.visual.porosity
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
      {
        label: 'Resistência à Tração',
        previous: formatTensileResistance(previousEvaluation.visual.tensileResistance),
        current: formatTensileResistance(evaluation.visual.tensileResistance),
        trend:
          evaluation.visual.tensileResistance === 'BOA_RESISTENTE' &&
          previousEvaluation.visual.tensileResistance !== 'BOA_RESISTENTE'
            ? ('MELHORA' as const)
            : evaluation.visual.tensileResistance === previousEvaluation.visual.tensileResistance
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
      {
        label: 'Estado das Pontas',
        previous: formatEndsState(previousEvaluation.visual.endsState),
        current: formatEndsState(evaluation.visual.endsState),
        trend:
          evaluation.visual.endsState === 'INTEGRAS' && previousEvaluation.visual.endsState !== 'INTEGRAS'
            ? ('MELHORA' as const)
            : evaluation.visual.endsState === previousEvaluation.visual.endsState
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
      {
        label: 'Frizz / Alinhamento',
        previous: formatFrizz(previousEvaluation.visual.frizzLevel),
        current: formatFrizz(evaluation.visual.frizzLevel),
        trend:
          evaluation.visual.frizzLevel === 'LEVE' && previousEvaluation.visual.frizzLevel !== 'LEVE'
            ? ('MELHORA' as const)
            : evaluation.visual.frizzLevel === previousEvaluation.visual.frizzLevel
            ? ('ESTABILIDADE' as const)
            : ('NECESSIDADE_ATENCAO' as const),
      },
    ];

    evolutionComparison = {
      hasPrevious: true,
      previousDate: formattedPrevDate,
      previousEvaluationId: previousEvaluation.id,
      overallHealthChange: compReport.overallHealthDiff
        ? {
            previous: compReport.overallHealthDiff.previousValue,
            current: compReport.overallHealthDiff.currentValue,
            diff: compReport.overallHealthDiff.difference,
            trend: compReport.overallHealthDiff.trend,
          }
        : undefined,
      damageGradeChange: compReport.damageGradeEvolution
        ? {
            previous: compReport.damageGradeEvolution.previous,
            current: compReport.damageGradeEvolution.current,
            text: compReport.damageGradeEvolution.text,
          }
        : undefined,
      mainNeedsEvolution: mainNeeds,
      fiberEvolution: fiberEvolution,
    };
  } else {
    evolutionComparison = {
      hasPrevious: false,
      message: 'Primeira avaliação registrada. Ainda não há histórico suficiente para comparação.',
      mainNeedsEvolution: [],
      fiberEvolution: [],
    };
  }

  return {
    evaluationId: evaluation.id,
    evaluationDate: formattedDate,
    professionalName: settings?.professionalName || 'Profissional Responsável',
    salonName: settings?.salonName || 'Espaço Capilar & Beleza',
    salonPhone: settings?.phone,
    enableSenacBadge: settings?.enableSenacBadge ?? true,
    client: reportClient,
    clientObjective,
    anamnese,
    fiberAssessment,
    microscopy,
    scoresAndNeeds,
    technicalJustifications,
    treatmentPlan,
    schedule4Weeks,
    homeCare,
    professionalObservations,
    nextReassessment,
    evolutionComparison,
  };
}
