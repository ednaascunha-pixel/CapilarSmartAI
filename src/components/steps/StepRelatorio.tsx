import React, { useState, useId } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Sparkles,
  Scissors,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Microscope,
  Phone,
  Layers,
  ArrowLeft,
  Share2,
  Check,
  TrendingUp,
  Minus,
  AlertTriangle,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';
import {
  FullEvaluationRecord,
  SalonSettings,
  ClientData,
  ProfessionalReportData,
} from '../../types';
import { generateProfessionalReport } from '../../utils/reportGenerator';

interface StepRelatorioProps {
  evaluation: FullEvaluationRecord;
  previousEvaluation?: FullEvaluationRecord | null;
  client?: ClientData | null;
  settings: SalonSettings;
  onBackToHomeCare?: () => void;
  onBackToHistory?: () => void;
  onSaveToHistory?: () => void;
  onNewEvaluation?: () => void;
  isFromHistory?: boolean;
}

export const StepRelatorio: React.FC<StepRelatorioProps> = ({
  evaluation,
  previousEvaluation,
  client,
  settings,
  onBackToHomeCare,
  onBackToHistory,
  onSaveToHistory,
  onNewEvaluation,
  isFromHistory = false,
}) => {
  const printStyleId = useId();
  const [copiedToast, setCopiedToast] = useState(false);

  // Derivação pura do relatório a partir dos dados existentes
  if (!evaluation) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-[#0c101d] border border-[#1e273d] text-center space-y-4 shadow-xl animate-fadeIn">
        <div className="w-12 h-12 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Nenhuma avaliação selecionada</h3>
          <p className="text-xs text-slate-400 mt-1">
            Selecione uma avaliação no histórico ou finalize as etapas de avaliação para emitir o relatório.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          {onBackToHistory && (
            <button
              type="button"
              onClick={onBackToHistory}
              className="px-4 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a243d] text-slate-200 text-xs font-semibold border border-[#232f4a] cursor-pointer"
            >
              Ir para o Histórico
            </button>
          )}
          {onBackToHomeCare && (
            <button
              type="button"
              onClick={onBackToHomeCare}
              className="px-4 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a243d] text-slate-200 text-xs font-semibold border border-[#232f4a] cursor-pointer"
            >
              Voltar ao Home Care
            </button>
          )}
        </div>
      </div>
    );
  }

  const report: ProfessionalReportData = generateProfessionalReport(
    evaluation,
    previousEvaluation,
    settings,
    client
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `*RELATÓRIO DE AVALIAÇÃO CAPILAR PROFISSIONAL*
*Espaço:* ${report.salonName}
*Profissional:* ${report.professionalName}
*Cliente:* ${report.client.name}
*Data:* ${report.evaluationDate}
*Código:* #${report.evaluationId}

*ÍNDICE DE INTEGRIDADE:* ${report.scoresAndNeeds.overallHealthIndex}/100 (${report.scoresAndNeeds.damageGradeLabel})
*PRIORIDADE PRINCIPAL:* ${report.scoresAndNeeds.dominantNeedLabel}
- Reconstrução: ${report.scoresAndNeeds.reconstructionPriority}%
- Nutrição: ${report.scoresAndNeeds.nutritionPriority}%
- Hidratação: ${report.scoresAndNeeds.hydrationPriority}%
- Controle de Frizz: ${report.scoresAndNeeds.frizzControlNeed}%

*TRATAMENTO INDICADO NO SALÃO:*
${report.treatmentPlan.mainTreatment} (${report.treatmentPlan.frequency})

*KIT HOME CARE INDICADO:*
- Shampoo: ${report.homeCare.washingRoutine.shampoo}
- Condicionador: ${report.homeCare.washingRoutine.conditioner}
- Máscara: ${report.homeCare.treatmentMask}
- Proteção Térmica: ${report.homeCare.protection}
- Finalizador / Pontas: ${report.homeCare.finishingAndEnds}

*PRÓXIMA REAVALIAÇÃO:*
${report.nextReassessment.goal} (${report.nextReassessment.estimatedTimeframe})`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText).then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3000);
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Print Stylesheet Overrides */}
      <style key={printStyleId}>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-report {
            background-color: #ffffff !important;
            color: #111827 !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            padding: 24px !important;
          }
          .printable-report * {
            color: #111827 !important;
            border-color: #d1d5db !important;
            background-color: transparent !important;
          }
          .printable-report .print-badge {
            background-color: #f3f4f6 !important;
            border: 1px solid #d1d5db !important;
          }
          .printable-report .print-highlight {
            background-color: #f9fafb !important;
          }
        }
      `}</style>

      {/* Top Banner & Quick Controls (Hidden during print) */}
      <div className="no-print bg-[#0c101d] rounded-2xl border border-[#1e273d] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" /> Etapa 9 • Relatório Profissional da Avaliação
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Prontuário e Ficha Técnica de {report.client.name}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
            Estrutura unificada e técnica da avaliação capilar, pronta para registro e impressão.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white text-xs font-bold shadow-[0_0_15px_rgba(247,37,133,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[42px] border border-[#ff66b2]/40"
            title="Imprimir prontuário em folha ou salvar em PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] text-slate-200 border border-[#1f2a42] text-xs font-semibold transition-all cursor-pointer min-h-[42px]"
            title="Copiar resumo textual para WhatsApp"
          >
            {copiedToast ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#f72585]" />
                <span>Copiar Resumo</span>
              </>
            )}
          </button>

          {isFromHistory && onBackToHistory && (
            <button
              type="button"
              onClick={onBackToHistory}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0c101d] hover:bg-[#13192c] text-slate-300 border border-[#1f283d] text-xs font-semibold transition-colors cursor-pointer min-h-[42px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Histórico</span>
            </button>
          )}

          {!isFromHistory && onSaveToHistory && (
            <button
              type="button"
              onClick={onSaveToHistory}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#16213e] text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer min-h-[42px]"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Salvar no Histórico</span>
            </button>
          )}
        </div>
      </div>

      {/* DOCUMENTO PRINCIPAL (Folha do Relatório Profissional) */}
      <div className="printable-report bg-[#0a0e1a] rounded-2xl border border-[#1a233a] p-5 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* CABEÇALHO DO DOCUMENTO */}
        <div className="border-b border-[#1f2a44] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold tracking-wider text-[#f72585] uppercase">
                  {report.salonName}
                </span>
                {report.enableSenacBadge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#131a2e] text-slate-300 border border-[#1f2942]">
                    SENAC • Projeto Integrador
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                RELATÓRIO DE AVALIAÇÃO CAPILAR
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Prontuário Técnico e Prescrição Terapêutica Cosmética
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="inline-block px-2.5 py-1 rounded-md bg-[#131a2e] border border-[#212c46] text-slate-300 font-mono text-[11px]">
                ID: <span className="text-[#f72585] font-bold">{report.evaluationId}</span>
              </div>
              <p className="text-slate-400 text-[11px] flex items-center sm:justify-end gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{report.evaluationDate}</span>
              </p>
              <p className="text-slate-300 font-medium text-[11px]">
                Profissional: <strong className="text-white">{report.professionalName}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 1. IDENTIFICAÇÃO DA CLIENTE */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                1
              </span>
              Identificação da Cliente
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Dados Cadastrais</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Nome Completo:</span>
              <strong className="text-white text-sm">{report.client.name}</strong>
            </div>

            {report.client.age && (
              <div>
                <span className="text-slate-400 text-[11px] block">Idade / Nascimento:</span>
                <span className="text-slate-200">{report.client.age} anos</span>
              </div>
            )}

            {report.client.phone && (
              <div>
                <span className="text-slate-400 text-[11px] block">Telefone / Contato:</span>
                <span className="text-slate-200 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {report.client.phone}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-400 text-[11px] block">Código de Registro:</span>
              <span className="text-slate-300 font-mono text-[11px]">{report.client.id}</span>
            </div>
          </div>
        </section>

        {/* 2. OBJETIVO DA CLIENTE (Relatado pela cliente) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                2
              </span>
              Objetivo da Cliente
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Relato da Cliente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] font-medium block">
                Queixas e Danos Percebidos (Informado pela Cliente):
              </span>
              {report.clientObjective.mainComplaints.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {report.clientObjective.mainComplaints.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-[#101524] text-slate-200 border border-[#222d46] text-[11px]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px]">Nenhuma queixa específica registrada.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] font-medium block">
                Objetivo Declarado & Expectativa:
              </span>
              <p className="text-slate-200 bg-[#0c101d] p-2.5 rounded-lg border border-[#1f283d] text-xs leading-relaxed">
                "{report.clientObjective.declaredGoals}"
                {report.clientObjective.resultExpectations && (
                  <span className="block mt-1 text-slate-400 text-[11px]">
                    Observação adicional: {report.clientObjective.resultExpectations}
                  </span>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 3. ANAMNESE (Distinção entre Histórico Relatado e Condição Observada) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3.5 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                3
              </span>
              Anamnese Capilar
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">
              Histórico da Rotina e Hábitos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Condição Cosmética do Couro:</span>
              <strong className="text-slate-200 text-xs">{report.anamnese.scalpType}</strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Frequência de Lavagem:</span>
              <span className="text-slate-200">{report.anamnese.washFrequency}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Uso de Fontes Térmicas:</span>
              <span className="text-slate-200">{report.anamnese.heatToolsUsage}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338] sm:col-span-2">
              <span className="text-slate-400 text-[11px] block">Histórico de Químicas Declaradas:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {report.anamnese.chemicalHistory.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#141b2e] text-[#f72585] font-medium text-[11px] border border-[#f72585]/20"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Tempo da Última Química:</span>
              <span className="text-slate-200">
                {report.anamnese.lastChemicalDateOrPeriod || 'Não se aplica / não relatado'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Exposição a Piscina / Sol / Mar:</span>
              <span className="text-slate-200">
                {report.anamnese.poolSunSeaExposure ? 'Sim (exposição frequente)' : 'Não'}
              </span>
            </div>

            {report.anamnese.waterIntakeLiters && (
              <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
                <span className="text-slate-400 text-[11px] block">Ingestão Hídrica Diária:</span>
                <span className="text-slate-200">{report.anamnese.waterIntakeLiters} L / dia</span>
              </div>
            )}
          </div>
        </section>

        {/* 4. AVALIAÇÃO DA FIBRA (Avaliação Técnica de Bancada) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3.5 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                4
              </span>
              Avaliação Física da Fibra
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Avaliação Profissional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Padrão de Curvatura:</span>
              <strong className="text-white text-xs">{report.fiberAssessment.curvature}</strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Teste de Elasticidade:</span>
              <strong className="text-slate-200 text-xs">{report.fiberAssessment.elasticity}</strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Grau de Porosidade:</span>
              <strong className="text-slate-200 text-xs">{report.fiberAssessment.porosity}</strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Espessura do Fio:</span>
              <span className="text-slate-200">{report.fiberAssessment.thickness}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Densidade Capilar:</span>
              <span className="text-slate-200">{report.fiberAssessment.density}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Resistência à Tração:</span>
              <strong className="text-slate-200 text-xs">
                {report.fiberAssessment.tensileResistance}
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Estado das Pontas:</span>
              <span className="text-slate-200">{report.fiberAssessment.endsState}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Toque e Sensação:</span>
              <span className="text-slate-200">{report.fiberAssessment.touchAspect}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Frizz & Alinhamento:</span>
              <span className="text-slate-200">{report.fiberAssessment.frizzAlignment}</span>
            </div>
          </div>
        </section>

        {/* 5. MICROSCOPIA / APARELHO DIGITAL (Somente se registrado) */}
        {report.microscopy?.hasData && (
          <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3.5 print-highlight">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                  5
                </span>
                Microscopia / Registro Digital
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">
                Achado Registrado na Avaliação
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <span className="text-slate-400 text-[11px] block">Região Observada:</span>
                  <strong className="text-slate-200 text-xs">{report.microscopy.observedRegion}</strong>
                </div>

                {report.microscopy.findings.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">
                      Achados Registrados no Aparelho:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.microscopy.findings.map((finding, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-[#131b2e] text-cyan-300 border border-cyan-500/20 text-[11px]"
                        >
                          {finding}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.microscopy.observations && (
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">
                      Observações da Imagem:
                    </span>
                    <p className="text-slate-300 text-xs bg-[#0c101d] p-2.5 rounded-lg border border-[#1f283d]">
                      {report.microscopy.observations}
                    </p>
                  </div>
                )}
              </div>

              {report.microscopy.image && (
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0c101d] border border-[#1f283d]">
                  <img
                    src={report.microscopy.image}
                    alt="Registro microscópico da fibra"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-40 object-cover rounded-lg border border-[#2b354d]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1.5">
                    Registro fotográfico da fibra capilar
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VISAGISMO E LEITURA FACIAL (se registrado na avaliação) */}
        {evaluation.visual?.facialAnalysis && (
          <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-purple-500/30 space-y-3.5 print-highlight">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-black">
                  ✦
                </span>
                Visagismo & Análise Facial Computacional
              </h3>
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Formato: {evaluation.visual.facialAnalysis.faceShape}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338] space-y-1 md:col-span-2">
                <span className="text-purple-300 text-[11px] font-semibold block">Harmonização e Corte:</span>
                <p className="text-slate-200">{evaluation.visual.facialAnalysis.visagismRecommendation}</p>

                <span className="text-emerald-300 text-[11px] font-semibold block pt-2">Protocolo Cosmético Sugerido:</span>
                <p className="text-slate-200">{evaluation.visual.facialAnalysis.cosmeticProtocolRecommendation}</p>

                <p className="text-slate-400 text-[11px] italic pt-1">
                  "{evaluation.visual.facialAnalysis.summary}"
                </p>
              </div>

              {evaluation.visual.facialAnalysisImage && (
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0c101d] border border-[#1f283d]">
                  <img
                    src={evaluation.visual.facialAnalysisImage}
                    alt="Foto Facial da Cliente"
                    className="w-full max-h-36 object-cover rounded-lg border border-[#2b354d]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1">
                    Registro de Visagismo
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 6. ÍNDICE E NECESSIDADES (PRIORIDADE / NECESSIDADE - NÃO DANO) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-4 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                6
              </span>
              Índice de Integridade & Prioridades de Tratamento
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f72585]/10 text-[#f72585] border border-[#f72585]/30">
              Resultado do Motor Técnico
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {/* Health Score */}
            <div className="p-3.5 rounded-xl bg-[#0c101d] border border-[#1f283d] flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Índice Geral de Integridade:</span>
                <p className="text-xs text-slate-300 mt-0.5">Escala de 0 a 100</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">
                  {report.scoresAndNeeds.overallHealthIndex}
                </span>
                <span className="text-slate-400 text-xs">/100</span>
              </div>
            </div>

            {/* Damage Grade */}
            <div className="p-3.5 rounded-xl bg-[#0c101d] border border-[#1f283d] flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">Grau da Fibra:</span>
                <p className="text-xs text-slate-300 mt-0.5">{report.scoresAndNeeds.damageGradeLabel}</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#f72585]/20 text-[#f72585] font-bold text-xs border border-[#f72585]/30">
                {report.scoresAndNeeds.damageGrade.replace('_', ' ')}
              </span>
            </div>

            {/* Dominant Need */}
            <div className="p-3.5 rounded-xl bg-[#0c101d] border border-[#1f283d] flex items-center justify-between sm:col-span-2 md:col-span-1">
              <div>
                <span className="text-slate-400 text-[11px] block">Necessidade Dominante:</span>
                <p className="text-xs text-slate-300 mt-0.5">Foco prioritário imediato</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                {report.scoresAndNeeds.dominantNeedLabel}
              </span>
            </div>
          </div>

          {/* Barras de Prioridade Cosmética */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
              Níveis de Prioridade Cosmética (Necessidade dos Fios):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">Reconstrução</span>
                  <strong className="text-rose-400">
                    {report.scoresAndNeeds.reconstructionPriority}%
                  </strong>
                </div>
                <div className="w-full bg-[#161d2e] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${report.scoresAndNeeds.reconstructionPriority}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">Nutrição</span>
                  <strong className="text-amber-400">
                    {report.scoresAndNeeds.nutritionPriority}%
                  </strong>
                </div>
                <div className="w-full bg-[#161d2e] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${report.scoresAndNeeds.nutritionPriority}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">Hidratação</span>
                  <strong className="text-cyan-400">
                    {report.scoresAndNeeds.hydrationPriority}%
                  </strong>
                </div>
                <div className="w-full bg-[#161d2e] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${report.scoresAndNeeds.hydrationPriority}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">Controle de Frizz</span>
                  <strong className="text-purple-400">
                    {report.scoresAndNeeds.frizzControlNeed}%
                  </strong>
                </div>
                <div className="w-full bg-[#161d2e] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${report.scoresAndNeeds.frizzControlNeed}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338]">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">Couro Cabeludo</span>
                  <strong className="text-teal-400">
                    {report.scoresAndNeeds.scalpBalanceAttention}%
                  </strong>
                </div>
                <div className="w-full bg-[#161d2e] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${report.scoresAndNeeds.scalpBalanceAttention}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. JUSTIFICATIVAS TÉCNICAS (Do motor) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                7
              </span>
              Justificativas Técnicas & Parecer da Avaliação
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Fundamentação Científica</span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-200 leading-relaxed bg-[#0c101d] p-3 rounded-lg border border-[#1f283d]">
              <strong>Parecer Técnico:</strong> {report.technicalJustifications.primaryRationale}
            </p>

            {report.technicalJustifications.keyEvidences.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 text-[11px] block font-semibold">
                  Evidências Físicas Identificadas na Bancada:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {report.technicalJustifications.keyEvidences.map((ev, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5 text-slate-300 bg-[#0c101d] p-2 rounded border border-[#1a2338] text-[11px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#f72585] flex-shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* 8. TRATAMENTO PERSONALIZADO (Salão) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3.5 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                8
              </span>
              Tratamento Personalizado de Salão
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">
              Protocolo Terapêutico Indicado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338] sm:col-span-2">
              <span className="text-slate-400 text-[11px] block">Tratamento Principal:</span>
              <strong className="text-white text-sm block mt-0.5">
                {report.treatmentPlan.mainTreatment}
              </strong>
              <p className="text-slate-300 text-xs mt-1">{report.treatmentPlan.objective}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">Frequência Recomendada:</span>
              <strong className="text-emerald-400 text-xs block mt-0.5">
                {report.treatmentPlan.frequency}
              </strong>
              <span className="text-slate-400 text-[11px]">
                Tempo de pausa estimado: {report.treatmentPlan.pauseTimeMinutes} min
              </span>
            </div>
          </div>

          {/* Passos do Protocolo */}
          {report.treatmentPlan.protocolSteps.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300 block">
                Passo a Passo de Aplicação na Bancada:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {report.treatmentPlan.protocolSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338] space-y-1 text-xs"
                  >
                    <div className="flex items-center gap-1.5 text-[#f72585] font-bold text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-[#f72585]/20 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cosméticos Específicos Utilizados no Salão */}
          {report.treatmentPlan.selectedProducts && report.treatmentPlan.selectedProducts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300 block">
                Cosméticos Prescritos / Aplicados no Salão:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {report.treatmentPlan.selectedProducts.map((p, pIdx) => (
                  <div
                    key={p.id || pIdx}
                    className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#f72585] uppercase">{p.brandSnapshot}</span>
                      <span className="text-slate-400">{p.macroCategorySnapshot}</span>
                    </div>
                    <div className="font-semibold text-white text-[11px] line-clamp-1">{p.nameSnapshot}</div>
                    {p.dosageOrOrientation && (
                      <p className="text-[10px] text-slate-400">
                        {p.dosageOrOrientation}
                        {p.pauseTimeMinutes ? ` • ${p.pauseTimeMinutes} min` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 9. CRONOGRAMA DE 4 SEMANAS (Resumido) */}
        {report.schedule4Weeks && (
          <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3.5 print-highlight">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                  9
                </span>
                Cronograma Capilar de 4 Semanas
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">
                {report.schedule4Weeks.strategyRhythm}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {report.schedule4Weeks.weeks.map((w) => (
                <div
                  key={w.weekNumber}
                  className="p-3 rounded-xl bg-[#0c101d] border border-[#1f283d] space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-[#1a2338] pb-1.5">
                    <strong className="text-white text-xs font-bold">{w.label}</strong>
                    <span className="text-[10px] font-semibold text-[#f72585] px-1.5 py-0.2 rounded bg-[#f72585]/10">
                      Semana {w.weekNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Tratamento Principal:</span>
                    <strong className="text-slate-200 text-xs leading-tight block">
                      {w.treatment}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Objetivo:</span>
                    <p className="text-slate-300 text-[11px] leading-tight">{w.objective}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Cuidados & Proteção:</span>
                    <p className="text-slate-400 text-[11px] leading-tight">{w.careAndProtection}</p>
                  </div>

                  {w.reassessmentNotice && (
                    <div className="pt-1.5 border-t border-[#1a2338] text-[10px] text-amber-400 font-medium">
                      ⚠️ {w.reassessmentNotice}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. HOME CARE (Prescrição Residencial) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3.5 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                10
              </span>
              Prescrição Cosmética de Home Care
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Guia de Manutenção da Cliente
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">1. Rotina de Lavagem (Shampoo):</span>
              <strong className="text-slate-200 text-xs block mt-0.5">
                {report.homeCare.washingRoutine.shampoo}
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">2. Condicionador Selante:</span>
              <strong className="text-slate-200 text-xs block mt-0.5">
                {report.homeCare.washingRoutine.conditioner}
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">3. Tratamentos (Máscara):</span>
              <strong className="text-slate-200 text-xs block mt-0.5">
                {report.homeCare.treatmentMask}
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">4. Proteção Térmica & Leave-in:</span>
              <strong className="text-slate-200 text-xs block mt-0.5">
                {report.homeCare.protection}
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
              <span className="text-slate-400 text-[11px] block">5. Finalização & Pontas:</span>
              <strong className="text-slate-200 text-xs block mt-0.5">
                {report.homeCare.finishingAndEnds}
              </strong>
            </div>

            {report.homeCare.scalpCare && (
              <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338]">
                <span className="text-slate-400 text-[11px] block">Cuidado com Couro Cabeludo:</span>
                <span className="text-slate-300 text-xs block mt-0.5">
                  {report.homeCare.scalpCare}
                </span>
              </div>
            )}
          </div>

          {/* Dicas de Ouro */}
          {report.homeCare.observations.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-300 block">
                Recomendações Práticas de Uso:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.homeCare.observations.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338] text-[11px] text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cosméticos Específicos Prescritos para Home Care */}
          {report.homeCare.selectedProducts && report.homeCare.selectedProducts.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#182136]">
              <span className="text-[11px] font-bold text-slate-300 block">
                Produtos Prescritos do Acervo para Aquisição / Uso Contínuo:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {report.homeCare.selectedProducts.map((p, pIdx) => (
                  <div
                    key={p.id || pIdx}
                    className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#f72585] uppercase">{p.brandSnapshot}</span>
                      <span className="text-slate-400">{p.macroCategorySnapshot}</span>
                    </div>
                    <div className="font-semibold text-white text-[11px] line-clamp-1">{p.nameSnapshot}</div>
                    {p.dosageOrOrientation && (
                      <p className="text-[10px] text-slate-300">
                        <strong>Orientação:</strong> {p.dosageOrOrientation}
                      </p>
                    )}
                    {p.customNotes && (
                      <p className="text-[10px] text-slate-400 italic">
                        {p.customNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 11. OBSERVAÇÕES PROFISSIONAIS */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-3 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                11
              </span>
              Observações Profissionais & Pontos de Atenção
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Registro do Terapeuta</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338] space-y-1">
              <span className="text-slate-400 text-[11px] block font-semibold">
                Observações da Bancada:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {report.professionalObservations.evaluationNotes ||
                  'Avaliação realizada conforme procedimentos técnicos de anamnese e inspeção física.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#0c101d] border border-[#1b2338] space-y-1">
              <span className="text-slate-400 text-[11px] block font-semibold">
                Anotações da Evolução & Conduta:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {report.professionalObservations.evolutionNotes ||
                  report.professionalObservations.professionalRecommendations ||
                  'Manter adesão rigorosa ao cronograma proposto e evitar sobrecarga térmica sem proteção.'}
              </p>
            </div>
          </div>
        </section>

        {/* 12. PRÓXIMA REAVALIAÇÃO */}
        <section className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#0c101d] to-[#141b2e] border border-[#f72585]/30 space-y-2.5 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#f72585] flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#f72585]/20 text-[#f72585] flex items-center justify-center text-xs font-black">
                12
              </span>
              Plano de Próxima Reavaliação
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f72585]/20 text-white">
              {report.nextReassessment.estimatedTimeframe}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Orientação de Retorno:</span>
              <p className="text-slate-200 mt-0.5">{report.nextReassessment.guidance}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Meta & Objetivo para a Próxima Avaliação:</span>
              <p className="text-slate-200 font-semibold mt-0.5">{report.nextReassessment.goal}</p>
            </div>
          </div>
        </section>

        {/* COMPARAÇÃO COM AVALIAÇÃO ANTERIOR (EVOLUÇÃO) */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#060913] border border-[#182136] space-y-4 print-highlight">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#f72585]" />
              Evolução Comparativa da Fibra
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Histórico da Mesma Cliente
            </span>
          </div>

          {report.evolutionComparison?.hasPrevious ? (
            <div className="space-y-4 text-xs">
              <p className="text-slate-300 text-xs">
                Comparação entre a avaliação anterior ({report.evolutionComparison.previousDate}) e a
                atual ({report.evaluationDate}):
              </p>

              {/* Índices Comparados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.evolutionComparison.overallHealthChange && (
                  <div className="p-3 rounded-xl bg-[#0c101d] border border-[#1b2338] flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Índice Geral de Integridade:</span>
                      <span className="text-slate-400 text-xs">
                        Anterior: {report.evolutionComparison.overallHealthChange.previous} pts → Atual:{' '}
                        {report.evolutionComparison.overallHealthChange.current} pts
                      </span>
                    </div>
                    <span
                      className={`font-bold text-xs px-2 py-1 rounded ${
                        report.evolutionComparison.overallHealthChange.diff > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : report.evolutionComparison.overallHealthChange.diff < 0
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {report.evolutionComparison.overallHealthChange.diff > 0
                        ? `+${report.evolutionComparison.overallHealthChange.diff} pts (Melhora)`
                        : report.evolutionComparison.overallHealthChange.diff < 0
                        ? `${report.evolutionComparison.overallHealthChange.diff} pts (Atenção)`
                        : 'Estável'}
                    </span>
                  </div>
                )}

                {report.evolutionComparison.damageGradeChange && (
                  <div className="p-3 rounded-xl bg-[#0c101d] border border-[#1b2338] flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Grau da Fibra:</span>
                      <span className="text-slate-400 text-xs">
                        {report.evolutionComparison.damageGradeChange.previous} →{' '}
                        {report.evolutionComparison.damageGradeChange.current}
                      </span>
                    </div>
                    <span className="text-slate-200 text-xs font-semibold">
                      {report.evolutionComparison.damageGradeChange.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Evolução dos Parâmetros Físicos */}
              {report.evolutionComparison.fiberEvolution && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Parâmetros Físicos Observados:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {report.evolutionComparison.fiberEvolution.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#0c101d] border border-[#1a2338] text-[11px]"
                      >
                        <span className="text-slate-400 block font-semibold">{item.label}</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-300">
                          <span className="line-through text-slate-500">{item.previous}</span>
                          <span>→</span>
                          <strong className="text-white">{item.current}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0c101d] border border-[#1a2338] text-center text-xs text-slate-400">
              <p>
                {report.evolutionComparison?.message ||
                  'Primeira avaliação registrada. Ainda não há histórico suficiente para comparação.'}
              </p>
            </div>
          )}
        </section>

        {/* ASSINATURAS E TERMO ÉTICO (Pronto para impressão) */}
        <div className="pt-6 border-t border-[#1f2a44] space-y-6">
          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed text-justify">
            <strong>Termo Ético e Limites de Atuação:</strong> Este relatório é um instrumento técnico de
            avaliação capilar com foco exclusivamente cosmético e estético, voltado para a prescrição de
            tratamentos capilares, recuperação da haste e cuidados de rotina (Home Care). Não possui
            caráter de laudo médico ou dermatológico e não diagnostica patologias do couro cabeludo. Em caso
            de lesões, dor persistente ou alterações clínicas, recomenda-se consulta médica
            dermatológica.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="border-t border-slate-600 pt-2 text-center text-xs">
              <strong className="text-slate-200 block">{report.professionalName}</strong>
              <span className="text-slate-400 text-[11px]">Profissional Terapeuta / Cabeleireiro(a)</span>
            </div>

            <div className="border-t border-slate-600 pt-2 text-center text-xs">
              <strong className="text-slate-200 block">{report.client.name}</strong>
              <span className="text-slate-400 text-[11px]">Assinatura da Cliente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Bottom Buttons (Hidden during print) */}
      <div className="no-print flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {onBackToHomeCare && !isFromHistory && (
          <button
            type="button"
            onClick={onBackToHomeCare}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] border border-[#1f283d] text-slate-300 text-sm font-semibold transition-colors cursor-pointer min-h-[46px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Home Care</span>
          </button>
        )}

        {isFromHistory && onBackToHistory && (
          <button
            type="button"
            onClick={onBackToHistory}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] border border-[#1f283d] text-slate-300 text-sm font-semibold transition-colors cursor-pointer min-h-[46px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Histórico</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] text-white font-bold text-sm border border-[#212d48] transition-all cursor-pointer min-h-[46px]"
          >
            <Printer className="w-4 h-4 text-[#f72585]" />
            <span>Imprimir Relatório</span>
          </button>

          {!isFromHistory && onSaveToHistory && (
            <button
              type="button"
              onClick={onSaveToHistory}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[46px] border border-[#ff66b2]/40"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Concluir & Salvar no Histórico</span>
            </button>
          )}

          {onNewEvaluation && (
            <button
              type="button"
              onClick={onNewEvaluation}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] text-slate-300 font-semibold text-sm border border-[#1f283d] transition-all cursor-pointer min-h-[46px]"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Nova Avaliação</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
