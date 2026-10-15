import React, { useRef, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ClipboardList,
  Eye,
  Award,
  Sparkles,
  Scissors,
  Home,
  FileText,
  History,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FlowStep } from '../types';

interface StepProgressProps {
  currentStep: FlowStep;
  onStepClick: (step: FlowStep) => void;
  completedSteps: Set<FlowStep>;
}

interface StepItem {
  id: FlowStep;
  label: string;
  icon: React.ElementType;
  shortLabel: string;
}

export const STEPS: StepItem[] = [
  { id: 'CLIENTE', label: '1. Cliente', shortLabel: 'Cliente', icon: Users },
  { id: 'CADASTRO', label: '2. Cadastro', shortLabel: 'Cadastro', icon: UserPlus },
  { id: 'ANAMNESE', label: '3. Anamnese', shortLabel: 'Anamnese', icon: ClipboardList },
  { id: 'ANALISE_VISUAL', label: '4. Análise Visual', shortLabel: 'Análise', icon: Eye },
  { id: 'PONTUACAO', label: '5. Pontuação', shortLabel: 'Pontuação', icon: Award },
  { id: 'RESULTADO', label: '6. Resultado', shortLabel: 'Resultado', icon: Sparkles },
  { id: 'TRATAMENTO_PROFISSIONAL', label: '7. Trat. Profissional', shortLabel: 'Tratamento', icon: Scissors },
  { id: 'HOME_CARE', label: '8. Home Care', shortLabel: 'Home Care', icon: Home },
  { id: 'RELATORIO', label: '9. Relatório', shortLabel: 'Relatório', icon: FileText },
  { id: 'HISTORICO', label: '10. Histórico', shortLabel: 'Histórico', icon: History },
];

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  onStepClick,
  completedSteps,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const activeStep = STEPS[currentIndex] || STEPS[0];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll active step into view on mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector(
        `#nav-step-${currentStep.toLowerCase()}`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentStep]);

  const handlePrevStep = () => {
    if (currentIndex > 0) {
      onStepClick(STEPS[currentIndex - 1].id);
    }
  };

  const handleNextStep = () => {
    if (currentIndex < STEPS.length - 1) {
      onStepClick(STEPS[currentIndex + 1].id);
    }
  };

  return (
    <div className="w-full bg-[#070a14] border-b border-[#182033] transition-all">
      {/* Mobile Step Header (Visible on phones < 640px) */}
      <div className="sm:hidden px-3 pt-2.5 pb-2 border-b border-[#141a2a]">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-xl bg-[#0e1322] text-slate-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all border border-[#1f2a42]"
            aria-label="Etapa anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center min-w-0 flex-1 px-1">
            <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider block">
              Etapa {currentIndex + 1} de {STEPS.length}
            </span>
            <p className="text-xs font-bold text-white truncate">
              {activeStep.label}
            </p>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={currentIndex === STEPS.length - 1}
            className="p-1.5 rounded-xl bg-[#0e1322] text-slate-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all border border-[#1f2a42]"
            aria-label="Próxima etapa"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mini progress bar on mobile */}
        <div className="w-full h-1 bg-[#121829] rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-[#e01e84] via-[#f72585] to-[#ff007f] transition-all duration-300 shadow-[0_0_10px_rgba(247,37,133,0.6)]"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Track of Steps (Optimized for Mobile scroll, Tablet tap, Desktop expansion) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-2.5">
        <div
          ref={scrollContainerRef}
          className="flex items-center justify-start sm:justify-between overflow-x-auto no-scrollbar py-0.5 gap-1.5 sm:gap-2"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.has(step.id);
            const isPast = index < currentIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  id={`nav-step-${step.id.toLowerCase()}`}
                  onClick={() => onStepClick(step.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 cursor-pointer min-h-[38px] sm:min-h-[40px] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#e01e84] via-[#f72585] to-[#ff007f] text-white font-bold shadow-[0_0_16px_rgba(247,37,133,0.4)] border border-[#ff66b2]/50 scale-[1.02]'
                      : isCompleted || isPast
                      ? 'bg-[#0e1322] text-slate-200 hover:bg-[#151c2e] border border-[#1e283f] hover:border-[#f72585]/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#101524] border border-transparent'
                  }`}
                >
                  <span className="relative flex items-center justify-center flex-shrink-0">
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : isPast ? 'text-[#f72585]' : 'text-slate-400'}`} />
                    )}
                  </span>
                  <span className="hidden xl:inline">{step.label}</span>
                  <span className="inline xl:hidden text-[11px] sm:text-xs">{step.shortLabel}</span>
                </button>

                {index < STEPS.length - 1 && (
                  <div
                    className={`h-[1px] w-2 sm:w-3 md:w-4 flex-shrink-0 transition-colors ${
                      isPast ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585]' : 'bg-[#182033]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
