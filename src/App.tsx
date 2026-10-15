/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserX, Plus } from 'lucide-react';
import { Header } from './components/Header';
import { StepProgress, STEPS } from './components/StepProgress';
import { StepInicio } from './components/steps/StepInicio';
import { StepCliente } from './components/steps/StepCliente';
import { StepCadastro } from './components/steps/StepCadastro';
import { StepAnamnese } from './components/steps/StepAnamnese';
import { StepAnaliseVisual } from './components/steps/StepAnaliseVisual';
import { StepPontuacao } from './components/steps/StepPontuacao';
import { StepResultado } from './components/steps/StepResultado';
import { StepTratamentoProfissional } from './components/steps/StepTratamentoProfissional';
import { StepHomeCare } from './components/steps/StepHomeCare';
import { StepRelatorio } from './components/steps/StepRelatorio';
import { StepHistorico } from './components/steps/StepHistorico';

import {
  FlowStep,
  ClientData,
  AnamneseData,
  VisualAnalysisData,
  ScoringResult,
  SalonProtocol,
  HomeCareRoutine,
  FullEvaluationRecord,
  AiEvaluationResponse,
  FourWeekTreatmentSchedule,
} from './types';

import { INITIAL_CLIENTS, INITIAL_EVALUATIONS, INITIAL_PRODUCTS, INITIAL_SETTINGS } from './data/mockData';
import { ModalProdutos } from './components/modals/ModalProdutos';
import { ModalConfiguracoes } from './components/modals/ModalConfiguracoes';
import { SalonProduct, SalonSettings } from './types';
import {
  calculateCapillaryScores,
  generateSalonProtocol,
  generateHomeCareRoutine,
  generateTreatmentSchedule,
} from './utils/calculator';

const DEFAULT_ANAMNESE: AnamneseData = {
  scalpType: 'NORMAL',
  washFrequency: '2_3_VEZES',
  heatTools: 'NUNCA',
  chemicalHistory: ['Nenhuma'],
  perceivedDamages: [],
  poolSunExposure: false,
  waterIntakeLiters: '2L a 3L',
};

const DEFAULT_VISUAL: VisualAnalysisData = {
  curvature: '2A',
  thickness: 'MEDIO',
  density: 'MEDIA',
  elasticity: 'SAUDAVEL',
  porosity: 'MEDIA',
  endsState: 'INTEGRAS',
  tensileResistance: 'BOA_RESISTENTE',
  touchSensation: 'MACIO_SEDOSO',
  frizzLevel: 'LEVE',
  colorCondition: 'NATURAL',
  rootToTipDifference: 'UNIFORME',
  professionalObservations: '',
  microscope: {
    observedRegion: '',
    deviceFindings: [],
    deviceNotes: '',
  },
};

export default function App() {
  // Persistence state
  const [clients, setClients] = useState<ClientData[]>(() => {
    const saved = localStorage.getItem('capilar_smart_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved clients', e);
      }
    }
    return INITIAL_CLIENTS;
  });

  const [evaluations, setEvaluations] = useState<FullEvaluationRecord[]>(() => {
    const saved = localStorage.getItem('capilar_smart_evaluations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved evaluations', e);
      }
    }
    return INITIAL_EVALUATIONS;
  });

  const [products, setProducts] = useState<SalonProduct[]>(() => {
    const saved = localStorage.getItem('capilar_smart_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [settings, setSettings] = useState<SalonSettings>(() => {
    const saved = localStorage.getItem('capilar_smart_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved settings', e);
      }
    }
    return INITIAL_SETTINGS;
  });

  // Modals state
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Active flow state
  const [currentStep, setCurrentStep] = useState<FlowStep>('CLIENTE');
  const [completedSteps, setCompletedSteps] = useState<Set<FlowStep>>(new Set(['CLIENTE']));
  const [selectedReportEvaluation, setSelectedReportEvaluation] = useState<FullEvaluationRecord | null>(null);

  const initialEvaluation = INITIAL_EVALUATIONS.find((e) => e.clientId === INITIAL_CLIENTS[0]?.id);
  const [currentEvaluationId, setCurrentEvaluationId] = useState<string>(() => initialEvaluation?.id || `eval-${Date.now()}`);
  const [previousEvaluationId, setPreviousEvaluationId] = useState<string | undefined>(
    () => initialEvaluation?.previousEvaluationId
  );

  const [currentClient, setCurrentClient] = useState<ClientData | null>(INITIAL_CLIENTS[0] || null);

  const [anamnese, setAnamnese] = useState<AnamneseData>(() =>
    initialEvaluation ? initialEvaluation.anamnese : DEFAULT_ANAMNESE
  );
  const [visual, setVisual] = useState<VisualAnalysisData>(() =>
    initialEvaluation ? initialEvaluation.visual : DEFAULT_VISUAL
  );

  // Derived state
  const [scores, setScores] = useState<ScoringResult>(() =>
    initialEvaluation
      ? initialEvaluation.scores
      : calculateCapillaryScores(DEFAULT_ANAMNESE, DEFAULT_VISUAL, INITIAL_CLIENTS[0] || undefined, [])
  );
  const [salonProtocol, setSalonProtocol] = useState<SalonProtocol>(() =>
    initialEvaluation
      ? initialEvaluation.salonProtocol
      : generateSalonProtocol(scores, DEFAULT_VISUAL, INITIAL_PRODUCTS, DEFAULT_ANAMNESE, INITIAL_CLIENTS[0] || undefined)
  );
  const [homeCare, setHomeCare] = useState<HomeCareRoutine>(() =>
    initialEvaluation
      ? initialEvaluation.homeCare
      : generateHomeCareRoutine(scores, DEFAULT_VISUAL, DEFAULT_ANAMNESE, INITIAL_PRODUCTS, INITIAL_CLIENTS[0] || undefined)
  );

  const [treatmentSchedule, setTreatmentSchedule] = useState<FourWeekTreatmentSchedule>(() =>
    initialEvaluation?.treatmentSchedule
      ? initialEvaluation.treatmentSchedule
      : generateTreatmentSchedule(
          {
            anamnese: initialEvaluation ? initialEvaluation.anamnese : DEFAULT_ANAMNESE,
            visual: initialEvaluation ? initialEvaluation.visual : DEFAULT_VISUAL,
            client: INITIAL_CLIENTS[0] || undefined,
            id: initialEvaluation ? initialEvaluation.id : undefined,
            clientId: INITIAL_CLIENTS[0]?.id,
          },
          initialEvaluation ? initialEvaluation.salonProtocol : salonProtocol,
          scores
        )
  );

  const [aiInsights, setAiInsights] = useState<AiEvaluationResponse | undefined>(() =>
    initialEvaluation ? initialEvaluation.aiInsights : undefined
  );
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('capilar_smart_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('capilar_smart_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('capilar_smart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('capilar_smart_settings', JSON.stringify(settings));
  }, [settings]);

  // Recalculate whenever Anamnese or Visual changes
  const updateCalculations = (
    newAnamnese = anamnese,
    newVisual = visual,
    client = currentClient,
    currentEvaluations = evaluations
  ) => {
    const clientHistory = currentEvaluations.filter((e) => e.clientId === client?.id);
    const newScores = calculateCapillaryScores(newAnamnese, newVisual, client || undefined, clientHistory);
    const newProtocol = generateSalonProtocol(newScores, newVisual, products, newAnamnese, client || undefined);
    const newHome = generateHomeCareRoutine(newScores, newVisual, newAnamnese, products, client || undefined);
    const newSchedule = generateTreatmentSchedule(
      {
        anamnese: newAnamnese,
        visual: newVisual,
        client: client || undefined,
        clientId: client?.id,
      },
      newProtocol,
      newScores
    );

    setScores(newScores);
    setSalonProtocol(newProtocol);
    setHomeCare(newHome);
    setTreatmentSchedule(newSchedule);

    return { newScores, newProtocol, newHome, newSchedule };
  };

  const [historyFilterClientId, setHistoryFilterClientId] = useState<string | undefined>(undefined);

  // Step transitions
  const markStepCompleted = (step: FlowStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const handleSelectClient = (client: ClientData) => {
    setCurrentClient(client);
    markStepCompleted('CLIENTE');

    // Regra 2 & 3: Isolamento e Nova Avaliação
    // - Cria novo evaluationId
    // - Vincula previousEvaluationId apenas para histórico comparativo
    // - Inicia os campos da nova avaliação neutros/limpos
    // - Não copia automaticamente tratamentos ou resultados anteriores
    const clientEvals = evaluations.filter((e) => e.clientId === client.id);
    const sorted = [...clientEvals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEval = sorted[0];

    setCurrentEvaluationId(`eval-${Date.now()}`);
    setPreviousEvaluationId(latestEval ? latestEval.id : undefined);
    setSelectedReportEvaluation(null);

    setAnamnese(DEFAULT_ANAMNESE);
    setVisual(DEFAULT_VISUAL);
    setAiInsights(undefined);

    const cleanScores = calculateCapillaryScores(DEFAULT_ANAMNESE, DEFAULT_VISUAL, client, clientEvals);
    const cleanProtocol = generateSalonProtocol(cleanScores, DEFAULT_VISUAL, products, DEFAULT_ANAMNESE, client);
    const cleanHome = generateHomeCareRoutine(cleanScores, DEFAULT_VISUAL, DEFAULT_ANAMNESE, products, client);
    const cleanSchedule = generateTreatmentSchedule(
      {
        anamnese: DEFAULT_ANAMNESE,
        visual: DEFAULT_VISUAL,
        client,
        clientId: client.id,
      },
      cleanProtocol,
      cleanScores
    );

    setScores(cleanScores);
    setSalonProtocol(cleanProtocol);
    setHomeCare(cleanHome);
    setTreatmentSchedule(cleanSchedule);
  };

  const handleEditClient = (client: ClientData) => {
    setCurrentClient(client);
    markStepCompleted('CLIENTE');
    setCurrentStep('CADASTRO');
  };

  const handleToggleArchiveClient = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const isArchiving = !c.archived;
          return {
            ...c,
            archived: isArchiving,
            archivedAt: isArchiving ? new Date().toISOString() : undefined,
          };
        }
        return c;
      })
    );
  };

  const handleDeleteClient = (clientId: string) => {
    const nextClients = clients.filter((c) => c.id !== clientId);
    setClients(nextClients);
    localStorage.setItem('capilar_smart_clients', JSON.stringify(nextClients));

    const nextEvaluations = evaluations.filter((e) => e.clientId !== clientId);
    setEvaluations(nextEvaluations);
    localStorage.setItem('capilar_smart_evaluations', JSON.stringify(nextEvaluations));

    if (historyFilterClientId === clientId) {
      setHistoryFilterClientId(undefined);
    }
    if (selectedReportEvaluation?.clientId === clientId) {
      setSelectedReportEvaluation(null);
    }

    // Clear active state immediately if deleted client was active
    if (currentClient?.id === clientId) {
      setCurrentClient(null);
      setAnamnese(DEFAULT_ANAMNESE);
      setVisual(DEFAULT_VISUAL);
      setAiInsights(undefined);
      const cleanScores = calculateCapillaryScores(DEFAULT_ANAMNESE, DEFAULT_VISUAL, undefined, []);
      const cleanProtocol = generateSalonProtocol(cleanScores, DEFAULT_VISUAL, products, DEFAULT_ANAMNESE, undefined);
      const cleanHome = generateHomeCareRoutine(cleanScores, DEFAULT_VISUAL, DEFAULT_ANAMNESE, products, undefined);
      const cleanSchedule = generateTreatmentSchedule(
        {
          anamnese: DEFAULT_ANAMNESE,
          visual: DEFAULT_VISUAL,
        },
        cleanProtocol,
        cleanScores
      );
      setScores(cleanScores);
      setSalonProtocol(cleanProtocol);
      setHomeCare(cleanHome);
      setTreatmentSchedule(cleanSchedule);
      setCompletedSteps(new Set(['CLIENTE']));
      if (currentStep !== 'INICIO' && currentStep !== 'HISTORICO') {
        setCurrentStep('CLIENTE');
      }
    }
  };

  const handleViewClientHistory = (client: ClientData) => {
    setCurrentClient(client);
    setHistoryFilterClientId(client.id);
    markStepCompleted('CLIENTE');
    markStepCompleted('HISTORICO');
    setCurrentStep('HISTORICO');
  };

  const handleDuplicateEvaluation = (evalId: string) => {
    const sourceEval = evaluations.find((e) => e.id === evalId);
    if (!sourceEval) return undefined;

    const targetClient = clients.find((c) => c.id === sourceEval.clientId) || {
      id: sourceEval.clientId,
      name: sourceEval.clientName,
      phone: '',
      email: '',
      age: '',
      hairGoal: '',
      createdAt: new Date().toISOString(),
    };

    const clientHistory = evaluations.filter((e) => e.clientId === targetClient.id);
    const newScores = calculateCapillaryScores(sourceEval.anamnese, sourceEval.visual, targetClient, clientHistory);
    const newProtocol = generateSalonProtocol(newScores, sourceEval.visual, products, sourceEval.anamnese, targetClient);
    const newHomeCare = generateHomeCareRoutine(newScores, sourceEval.visual, sourceEval.anamnese, products, targetClient);
    const newSchedule = sourceEval.treatmentSchedule
      ? {
          ...sourceEval.treatmentSchedule,
          evaluationId: `eval-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          status: 'SUGERIDO' as const,
        }
      : generateTreatmentSchedule(
          {
            anamnese: sourceEval.anamnese,
            visual: sourceEval.visual,
            client: targetClient,
            id: `eval-${Date.now()}`,
            clientId: targetClient.id,
          },
          newProtocol,
          newScores
        );

    const duplicatedRecord: FullEvaluationRecord = {
      ...sourceEval,
      id: `eval-${Date.now()}`,
      date: new Date().toISOString(),
      scores: newScores,
      salonProtocol: newProtocol,
      homeCare: newHomeCare,
      treatmentSchedule: newSchedule,
      professionalNotes: `[Duplicada em ${new Date().toLocaleDateString('pt-BR')}] ${sourceEval.professionalNotes || ''}`.trim(),
    };

    const nextEvaluations = [duplicatedRecord, ...evaluations];
    setEvaluations(nextEvaluations);
    localStorage.setItem('capilar_smart_evaluations', JSON.stringify(nextEvaluations));

    return duplicatedRecord;
  };

  const handleDeleteEvaluation = (evalId: string) => {
    const evalToDelete = evaluations.find((e) => e.id === evalId);
    const nextEvaluations = evaluations.filter((e) => e.id !== evalId);
    setEvaluations(nextEvaluations);
    localStorage.setItem('capilar_smart_evaluations', JSON.stringify(nextEvaluations));

    if (selectedReportEvaluation?.id === evalId) {
      setSelectedReportEvaluation(null);
    }
    if (currentEvaluationId === evalId) {
      setCurrentEvaluationId(`eval-${Date.now()}`);
    }

    // If the deleted evaluation belongs to currentClient, update scores and calculation using remaining evaluations
    if (currentClient && evalToDelete?.clientId === currentClient.id) {
      const remainingClientHistory = nextEvaluations.filter((e) => e.clientId === currentClient.id);
      const newScores = calculateCapillaryScores(anamnese, visual, currentClient, remainingClientHistory);
      const newProtocol = generateSalonProtocol(newScores, visual, products, anamnese, currentClient);
      const newHome = generateHomeCareRoutine(newScores, visual, anamnese, products, currentClient);
      const newSchedule = generateTreatmentSchedule(
        {
          anamnese,
          visual,
          client: currentClient,
          clientId: currentClient.id,
        },
        newProtocol,
        newScores
      );
      setScores(newScores);
      setSalonProtocol(newProtocol);
      setHomeCare(newHome);
      setTreatmentSchedule(newSchedule);
    }
  };

  /**
   * Cria uma nova avaliação para a cliente existente (Reavaliação).
   * - Identifica a avaliação mais recente da cliente para preservar os dados estruturais e comparar.
   * - Isola completamente o registro histórico: a avaliação anterior permanece inalterada no histórico.
   * - Carrega dados perenes (histórico químico, perfil de curvatura) e reseta o estado transitório (insights de IA, agendamentos).
   * - Recalcula pontuações considerando o histórico anterior da mesma cliente.
   * - Direciona o profissional para o fluxo de avaliação (ANAMNESE/ANALISE_VISUAL) com a cliente selecionada.
   */
  const handleCreateReassessment = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    // Histórico isolado exclusivo da cliente
    const clientEvals = evaluations.filter((e) => e.clientId === clientId);
    const sorted = [...clientEvals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEval = sorted[0];

    setCurrentClient(client);

    // Carregar dados estruturais da avaliação mais recente, permitindo ao profissional atualizar os achados
    const baseAnamnese = latestEval ? { ...latestEval.anamnese } : DEFAULT_ANAMNESE;
    const baseVisual = latestEval ? { ...latestEval.visual, professionalObservations: '' } : DEFAULT_VISUAL;

    setAnamnese(baseAnamnese);
    setVisual(baseVisual);
    setAiInsights(undefined); // Reset transitório

    // Recalcular pontuações usando todo o histórico prévio da cliente como base comparativa
    const newScores = calculateCapillaryScores(baseAnamnese, baseVisual, client, clientEvals);
    const newProtocol = generateSalonProtocol(newScores, baseVisual, products, baseAnamnese, client);
    const newHome = generateHomeCareRoutine(newScores, baseVisual, baseAnamnese, products, client);
    const newSchedule = generateTreatmentSchedule(
      {
        anamnese: baseAnamnese,
        visual: baseVisual,
        client,
        clientId: client.id,
      },
      newProtocol,
      newScores
    );

    setScores(newScores);
    setSalonProtocol(newProtocol);
    setHomeCare(newHome);
    setTreatmentSchedule(newSchedule);

    setCurrentEvaluationId(`eval-${Date.now()}`);
    setPreviousEvaluationId(latestEval ? latestEval.id : undefined);
    setSelectedReportEvaluation(null);

    // Concluir passos cadastrais e iniciar o exame
    markStepCompleted('CLIENTE');
    markStepCompleted('CADASTRO');
    setCurrentStep('ANAMNESE');
  };

  const handleUpdateEvaluation = (updatedRecord: FullEvaluationRecord) => {
    setEvaluations((prev) => {
      const next = prev.map((e) => (e.id === updatedRecord.id ? updatedRecord : e));
      localStorage.setItem('capilar_smart_evaluations', JSON.stringify(next));
      return next;
    });
  };

  /**
   * Regra 11: Permitir abrir uma avaliação histórica e carregar seus dados para edição.
   * Mantém o mesmo evaluationId e atualiza o registro existente sem criar duplicatas.
   */
  const handleEditEvaluation = (record: FullEvaluationRecord) => {
    const matchedClient: ClientData = clients.find((c) => c.id === record.clientId) || {
      id: record.clientId,
      name: record.clientName,
      phone: '',
      email: '',
      age: '',
      hairGoal: '',
      createdAt: record.date,
    };

    setCurrentClient(matchedClient);
    setCurrentEvaluationId(record.id); // Mantém o ID original per Regra 11
    setPreviousEvaluationId(record.previousEvaluationId);
    setSelectedReportEvaluation(null);

    setAnamnese(record.anamnese);
    setVisual(record.visual);
    setScores(record.scores);
    setSalonProtocol(record.salonProtocol);
    setHomeCare(record.homeCare);
    setTreatmentSchedule(
      record.treatmentSchedule ||
        generateTreatmentSchedule(
          {
            anamnese: record.anamnese,
            visual: record.visual,
            client: matchedClient,
            id: record.id,
            clientId: matchedClient.id,
          },
          record.salonProtocol,
          record.scores
        )
    );
    setAiInsights(record.aiInsights);

    setCompletedSteps(
      new Set([
        'CLIENTE',
        'CADASTRO',
        'ANAMNESE',
        'ANALISE_VISUAL',
        'PONTUACAO',
        'RESULTADO',
        'TRATAMENTO_PROFISSIONAL',
        'HOME_CARE',
        'RELATORIO',
      ])
    );
    setCurrentStep('ANAMNESE');
  };

  const handleSaveClient = (client: ClientData) => {
    setCurrentClient(client);
    setClients((prev) => {
      const idx = prev.findIndex((c) => c.id === client.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = client;
        return next;
      }
      return [client, ...prev];
    });
    markStepCompleted('CLIENTE');
    markStepCompleted('CADASTRO');
    const clientHistory = evaluations.filter((e) => e.clientId === client.id);
    updateCalculations(anamnese, visual, client, clientHistory);
  };

  const handleCalculateAndAdvance = () => {
    const { newScores } = updateCalculations(anamnese, visual, currentClient, evaluations);
    markStepCompleted('ANALISE_VISUAL');
    markStepCompleted('PONTUACAO');
    setCurrentStep('PONTUACAO');

    // Automatically trigger AI analysis in background for seamless tablet experience
    fetchAiAnalysis(currentClient, anamnese, visual, newScores);
  };

  const fetchAiAnalysis = async (
    c = currentClient,
    a = anamnese,
    v = visual,
    s = scores
  ) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: c,
          anamnese: a,
          visual: v,
          scores: s,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (err) {
      console.warn('AI analysis fallback triggered:', err);
      // Deterministic fallback already handled by client engine
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSaveEvaluationRecord = () => {
    if (!currentClient) return;

    const evalId = currentEvaluationId || `eval-${Date.now()}`;
    const record: FullEvaluationRecord = {
      id: evalId,
      clientId: currentClient.id,
      clientName: currentClient.name,
      date: new Date().toISOString(),
      previousEvaluationId,
      evaluationMode: previousEvaluationId ? 'REAVALIACAO' : 'INICIAL',
      status: 'CONCLUIDA',
      anamnese,
      visual,
      scores,
      salonProtocol,
      homeCare,
      treatmentSchedule,
      aiInsights,
      professionalNotes: `Avaliação realizada na bancada do salão para ${currentClient.name}.`,
    };

    setEvaluations((prev) => {
      const idx = prev.findIndex((e) => e.id === evalId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });

    // Mark remaining steps
    markStepCompleted('TRATAMENTO_PROFISSIONAL');
    markStepCompleted('HOME_CARE');
    markStepCompleted('RELATORIO');
    markStepCompleted('HISTORICO');

    setSelectedReportEvaluation(null);
    setCurrentStep('HISTORICO');
  };

  const handleStartNewEvaluation = () => {
    const newClientObj: ClientData = {
      id: `client-${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      age: '',
      hairGoal: '',
      createdAt: new Date().toISOString(),
    };

    setCurrentEvaluationId(`eval-${Date.now()}`);
    setPreviousEvaluationId(undefined);
    setSelectedReportEvaluation(null);
    setCurrentClient(newClientObj);
    setAnamnese(DEFAULT_ANAMNESE);
    setVisual(DEFAULT_VISUAL);
    setAiInsights(undefined);
    updateCalculations(DEFAULT_ANAMNESE, DEFAULT_VISUAL, newClientObj, []);
    setCompletedSteps(new Set(['CLIENTE']));
    setCurrentStep('CADASTRO');
  };

  const handleSaveProduct = (prod: SalonProduct) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === prod.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = prod;
        return updated;
      }
      return [prod, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleExportBackup = () => {
    const data = {
      salonSettings: settings,
      clients,
      evaluations,
      products,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capilar_smart_ia_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDemoData = () => {
    setClients(INITIAL_CLIENTS);
    setEvaluations(INITIAL_EVALUATIONS);
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem('capilar_smart_clients');
    localStorage.removeItem('capilar_smart_evaluations');
    localStorage.removeItem('capilar_smart_products');
    localStorage.removeItem('capilar_smart_settings');
  };

  return (
    <div className="min-h-screen bg-[#060913] text-[#f1f5f9] flex flex-col selection:bg-[#f72585]/30 selection:text-white relative">
      {/* Top Professional Header */}
      <Header
        currentClient={currentClient}
        currentStep={currentStep}
        onGoHome={() => setCurrentStep('INICIO')}
        onNewEvaluation={handleStartNewEvaluation}
        onOpenHistory={() => setCurrentStep('HISTORICO')}
        onSelectClient={() => setCurrentStep('CLIENTE')}
        onOpenProducts={() => setIsProductsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        salonName={settings.salonName}
        enableSenacBadge={settings.enableSenacBadge}
      />

      {/* 9-Step Progress Pipeline */}
      {currentStep !== 'INICIO' && (
        <StepProgress
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
          completedSteps={completedSteps}
        />
      )}

      {/* Main Workspace Area Optimized for Salon Tablet Bench */}
      <main className={`flex-1 w-full ${currentStep === 'INICIO' ? 'p-0' : 'max-w-7xl mx-auto p-4 sm:p-6 md:p-8'}`}>
        {/* Step 0: TELA INICIAL */}
        {currentStep === 'INICIO' && (
          <StepInicio
            onStartEvaluation={() => {
              handleStartNewEvaluation();
              setCurrentStep('CLIENTE');
            }}
            onOpenClients={() => setCurrentStep('CLIENTE')}
            onOpenHistory={() => setCurrentStep('HISTORICO')}
            onOpenProducts={() => setIsProductsModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            currentClient={currentClient}
            totalClients={clients.length}
            totalEvaluations={evaluations.length}
            enableSenacBadge={settings.enableSenacBadge}
          />
        )}

        {/* Step 1: CLIENTE */}
        {currentStep === 'CLIENTE' && (
          <StepCliente
            clients={clients}
            evaluations={evaluations}
            selectedClient={currentClient}
            onSelectClient={handleSelectClient}
            onEditClient={handleEditClient}
            onViewHistory={handleViewClientHistory}
            onToggleArchive={handleToggleArchiveClient}
            onDeleteClient={handleDeleteClient}
            onGoToCadastro={handleStartNewEvaluation}
            onContinue={() => {
              markStepCompleted('CLIENTE');
              setCurrentStep('CADASTRO');
            }}
          />
        )}

        {/* Step 2: CADASTRO */}
        {currentStep === 'CADASTRO' && (
          !currentClient ? (
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-[#0c101d] border border-[#1e273d] text-center space-y-4 shadow-xl animate-fadeIn">
              <div className="w-12 h-12 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] mx-auto">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nenhuma cliente selecionada</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione uma cliente cadastrada ou inicie um novo cadastro para continuar.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('CLIENTE')}
                  className="px-4 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a243d] text-slate-200 text-xs font-semibold border border-[#232f4a] cursor-pointer"
                >
                  Ir para Lista de Clientes
                </button>
                <button
                  type="button"
                  onClick={handleStartNewEvaluation}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-xs font-bold shadow-[0_0_12px_rgba(247,37,133,0.3)] cursor-pointer hover:brightness-110"
                >
                  Novo Cadastro
                </button>
              </div>
            </div>
          ) : (
            <StepCadastro
              currentClient={currentClient}
              onSaveClient={handleSaveClient}
              onBack={() => setCurrentStep('CLIENTE')}
              onContinue={() => {
                markStepCompleted('CADASTRO');
                setCurrentStep('ANAMNESE');
              }}
              onViewHistory={handleViewClientHistory}
            />
          )
        )}

        {/* Step 3: ANAMNESE */}
        {currentStep === 'ANAMNESE' && (
          <StepAnamnese
            data={anamnese}
            onChange={(newA) => {
              setAnamnese(newA);
              updateCalculations(newA, visual, currentClient, evaluations);
            }}
            onBack={() => setCurrentStep('CADASTRO')}
            onContinue={() => {
              markStepCompleted('ANAMNESE');
              setCurrentStep('ANALISE_VISUAL');
            }}
          />
        )}

        {/* Step 4: ANÁLISE VISUAL */}
        {currentStep === 'ANALISE_VISUAL' && (
          <StepAnaliseVisual
            data={visual}
            onChange={(newV) => {
              setVisual(newV);
              updateCalculations(anamnese, newV, currentClient, evaluations);
            }}
            onBack={() => setCurrentStep('ANAMNESE')}
            onContinue={handleCalculateAndAdvance}
          />
        )}

        {/* Step 5: PONTUAÇÃO */}
        {currentStep === 'PONTUACAO' && (
          <StepPontuacao
            scores={scores}
            visual={visual}
            anamnese={anamnese}
            onBack={() => setCurrentStep('ANALISE_VISUAL')}
            onContinue={() => {
              markStepCompleted('PONTUACAO');
              setCurrentStep('RESULTADO');
            }}
          />
        )}

        {/* Step 6: RESULTADO */}
        {currentStep === 'RESULTADO' && (
          <StepResultado
            client={currentClient || { id: 'temp', name: 'Cliente', phone: '', email: '', age: '', hairGoal: '', createdAt: '' }}
            anamnese={anamnese}
            visual={visual}
            scores={scores}
            aiInsights={aiInsights}
            isLoadingAi={isLoadingAi}
            onGenerateAiAnalysis={() => fetchAiAnalysis()}
            onBack={() => setCurrentStep('PONTUACAO')}
            onGoToSalonProtocol={() => {
              markStepCompleted('RESULTADO');
              setCurrentStep('TRATAMENTO_PROFISSIONAL');
            }}
            onGoToHomeCare={() => {
              markStepCompleted('RESULTADO');
              setCurrentStep('HOME_CARE');
            }}
          />
        )}

        {/* Step 7: TRATAMENTO PROFISSIONAL */}
        {currentStep === 'TRATAMENTO_PROFISSIONAL' && (
          <StepTratamentoProfissional
            protocol={salonProtocol}
            scores={scores}
            schedule={treatmentSchedule}
            products={products}
            onUpdateProtocol={(updated) => setSalonProtocol(updated)}
            onUpdateSchedule={(updated) => setTreatmentSchedule(updated)}
            onOpenProductsModal={() => setIsProductsModalOpen(true)}
            onBack={() => setCurrentStep('RESULTADO')}
            onContinue={() => {
              markStepCompleted('TRATAMENTO_PROFISSIONAL');
              setCurrentStep('HOME_CARE');
            }}
          />
        )}

        {/* Step 8: HOME CARE */}
        {currentStep === 'HOME_CARE' && (
          <StepHomeCare
            homeCare={homeCare}
            client={currentClient || { id: 'temp', name: 'Cliente', phone: '', email: '', age: '', hairGoal: '', createdAt: '' }}
            scores={scores}
            products={products}
            onUpdateHomeCare={(updated) => setHomeCare(updated)}
            onOpenProductsModal={() => setIsProductsModalOpen(true)}
            onBack={() => setCurrentStep('TRATAMENTO_PROFISSIONAL')}
            onContinue={() => {
              markStepCompleted('HOME_CARE');
              setSelectedReportEvaluation(null);
              setCurrentStep('RELATORIO');
            }}
          />
        )}

        {/* Step 9: RELATÓRIO PROFISSIONAL */}
        {currentStep === 'RELATORIO' && (() => {
          const activeEval: FullEvaluationRecord = selectedReportEvaluation || {
            id: currentEvaluationId,
            clientId: currentClient?.id || 'client-temp',
            clientName: currentClient?.name || 'Cliente',
            date: new Date().toISOString(),
            previousEvaluationId,
            evaluationMode: previousEvaluationId ? 'REAVALIACAO' : 'INICIAL',
            status: 'CONCLUIDA',
            anamnese,
            visual,
            scores,
            salonProtocol,
            homeCare,
            treatmentSchedule,
            aiInsights,
            professionalNotes: `Avaliação realizada na bancada do salão para ${currentClient?.name || 'Cliente'}.`,
          };

          const prevEval = activeEval.previousEvaluationId
            ? evaluations.find((e) => e.id === activeEval.previousEvaluationId && e.clientId === activeEval.clientId) || null
            : evaluations
                .filter((e) => e.clientId === activeEval.clientId && e.id !== activeEval.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
          const evalClient =
            clients.find((c) => c.id === activeEval.clientId) || currentClient || null;

          return (
            <StepRelatorio
              evaluation={activeEval}
              previousEvaluation={prevEval}
              client={evalClient}
              settings={settings}
              isFromHistory={selectedReportEvaluation !== null}
              onBackToHomeCare={() => setCurrentStep('HOME_CARE')}
              onBackToHistory={() => {
                setSelectedReportEvaluation(null);
                setCurrentStep('HISTORICO');
              }}
              onSaveToHistory={handleSaveEvaluationRecord}
              onNewEvaluation={handleStartNewEvaluation}
            />
          );
        })()}

        {/* Step 10: HISTÓRICO */}
        {currentStep === 'HISTORICO' && (
          <StepHistorico
            evaluations={evaluations}
            onSelectEvaluation={(record) => {
              const matchedClient = clients.find((c) => c.id === record.clientId) || null;
              setCurrentClient(matchedClient);
              setAnamnese(record.anamnese);
              setVisual(record.visual);
              setScores(record.scores);
              setSalonProtocol(record.salonProtocol);
              setHomeCare(record.homeCare);
              setTreatmentSchedule(
                record.treatmentSchedule ||
                  generateTreatmentSchedule(
                    {
                      anamnese: record.anamnese,
                      visual: record.visual,
                      client: matchedClient || undefined,
                      id: record.id,
                      clientId: record.clientId,
                    },
                    record.salonProtocol,
                    record.scores
                  )
              );
              setAiInsights(record.aiInsights);
            }}
            onNewEvaluation={handleStartNewEvaluation}
            onDuplicateEvaluation={handleDuplicateEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
            initialFilterClientId={historyFilterClientId}
            onCreateReassessment={handleCreateReassessment}
            onUpdateEvaluation={handleUpdateEvaluation}
            onEditEvaluation={handleEditEvaluation}
            onViewReport={(record) => {
              setSelectedReportEvaluation(record);
              setCurrentStep('RELATORIO');
            }}
          />
        )}
      </main>

      {/* Footer with SENAC Integrated Project info */}
      <footer className="no-print mt-auto py-4 px-6 border-t border-[#182136] text-center text-xs text-slate-400 bg-[#05070e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-300 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="font-bold text-white">CAPILAR SMART <span className="text-[#f72585]">IA</span></span>
            <span className="text-[#f72585]">•</span>
            <span>Protótipo de Bancada para Projeto Integrador (SENAC)</span>
          </p>
          <p className="text-[11px] text-slate-400">
            "Tecnologia que entende o seu cabelo!" • Avaliação e Rotina Personalizada
          </p>
        </div>
      </footer>

      {/* Modal: Cadastro e Gestão de Produtos */}
      <ModalProdutos
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Modal: Configurações do Salão & Diretrizes */}
      <ModalConfiguracoes
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSet) => setSettings(newSet)}
        onExportBackup={handleExportBackup}
        onResetData={handleResetDemoData}
      />
    </div>
  );
}
