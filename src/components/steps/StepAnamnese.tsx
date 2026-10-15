import React, { useState } from 'react';
import {
  ClipboardList,
  Sparkles,
  Flame,
  Droplets,
  FlaskConical,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { AnamneseData, ScalpType } from '../../types';
import { CHEMICAL_OPTIONS, PERCEIVED_DAMAGES_OPTIONS } from '../../data/hairKnowledge';

interface StepAnamneseProps {
  data: AnamneseData;
  onChange: (data: AnamneseData) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const StepAnamnese: React.FC<StepAnamneseProps> = ({
  data,
  onChange,
  onBack,
  onContinue,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAdvance = () => {
    if (!data.washFrequency) {
      setValidationError('Por favor, selecione a frequência de lavagem dos fios.');
      return;
    }
    if (!data.scalpType) {
      setValidationError('Por favor, informe a condição do couro cabeludo.');
      return;
    }
    if (!data.chemicalHistory || data.chemicalHistory.length === 0) {
      setValidationError('Por favor, selecione pelo menos uma opção no histórico químico (ou marque "Nenhuma").');
      return;
    }
    setValidationError(null);
    onContinue();
  };

  const toggleChemical = (chemId: string) => {
    let current = [...data.chemicalHistory];
    if (chemId === 'Nenhuma') {
      current = ['Nenhuma'];
    } else {
      current = current.filter((c) => c !== 'Nenhuma');
      if (current.includes(chemId)) {
        current = current.filter((c) => c !== chemId);
      } else {
        current.push(chemId);
      }
    }
    if (current.length === 0) current = ['Nenhuma'];
    onChange({ ...data, chemicalHistory: current });
  };

  const toggleDamage = (damageId: string) => {
    let current = [...data.perceivedDamages];
    if (current.includes(damageId)) {
      current = current.filter((d) => d !== damageId);
    } else {
      current.push(damageId);
    }
    onChange({ ...data, perceivedDamages: current });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
          <ClipboardList className="w-3.5 h-3.5" /> Etapa 3 • Anamnese Capilar
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Investigação de Hábitos & Histórico Químico
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Perguntas essenciais de bancada para mapear agressões prévias, rotina de higienização e comportamentos da cliente.
        </p>

        {/* Professional Safety Notice */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 bg-[#060913]/90 border border-[#1d2740] px-3.5 py-2 rounded-xl">
          <ShieldAlert className="w-4 h-4 text-[#f72585] flex-shrink-0" />
          <span>
            <strong className="text-white">Observação Profissional:</strong> A análise de couro cabeludo é voltada para a seleção cosmética de lavatório. Não substitui consulta médica dermatológica.
          </span>
        </div>
      </div>

      {/* Questions Container */}
      <div className="space-y-6">
        {/* 1. Couro Cabeludo (Cosmético) */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#f72585]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Como você classifica a oleosidade do couro cabeludo?
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'NORMAL', label: 'Normal / Equilibrado', desc: 'Sem excesso de sebo ou repuxamento' },
              { id: 'OLEOSO', label: 'Oleoso', desc: 'Raiz pesa e brilha em menos de 24h' },
              { id: 'SECO', label: 'Seco', desc: 'Opaco, pouca produção sebácea natural' },
              { id: 'SENSIVEL', label: 'Sensível / Cosmético', desc: 'Sensação de ardência leve ao lavar' },
            ].map((scalp) => {
              const isSelected = data.scalpType === scalp.id;
              return (
                <button
                  key={scalp.id}
                  type="button"
                  onClick={() => onChange({ ...data, scalpType: scalp.id as ScalpType })}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#141c30] border-[#f72585] ring-1 ring-[#f72585] shadow-[0_0_12px_rgba(247,37,133,0.3)]'
                      : 'bg-[#060913] border-[#1f283d] hover:bg-[#0e1424] hover:border-[#f72585]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white">{scalp.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#f72585]" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{scalp.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Frequência de Lavagem & Uso de Calor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frequência de Lavagem */}
          <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#f72585]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Frequência de lavagens
              </h3>
            </div>
            <div className="space-y-2">
              {[
                { id: 'DIARIA', label: 'Diariamente (todos os dias)', desc: 'Lavagem frequente, risco de ressecamento nas pontas' },
                { id: '2_3_VEZES', label: '2 a 3 vezes por semana', desc: 'Frequência média mais comum e equilibrada' },
                { id: '1_VEZ_SEMANA', label: '1 vez por semana ou menos', desc: 'Fios muito secos, crespos ou rotina espaçada' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...data, washFrequency: opt.id as any })}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    data.washFrequency === opt.id
                      ? 'bg-[#141c30] border-[#f72585] ring-1 ring-[#f72585] shadow-[0_0_10px_rgba(247,37,133,0.25)]'
                      : 'bg-[#060913] border-[#1f283d] hover:bg-[#0e1424]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{opt.label}</p>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>
                  {data.washFrequency === opt.id && <Check className="w-4 h-4 text-[#f72585]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Uso de Ferramentas Térmicas */}
          <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#f72585]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Uso de calor (secador / chapinha / babyliss)
              </h3>
            </div>
            <div className="space-y-2">
              {[
                { id: 'DIARIO', label: 'Diário (quase todos os dias)', desc: 'Alto estresse térmico na queratina' },
                { id: 'FREQUENTE', label: 'Frequente (2 a 4x na semana)', desc: 'Requer proteção térmica rigorosa' },
                { id: 'OCASIONAL', label: 'Ocasional (1x na semana ou festas)', desc: 'Danos moderados a baixos' },
                { id: 'NUNCA', label: 'Raro ou Nunca (seca ao natural)', desc: 'Sem agressão térmica direta' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...data, heatTools: opt.id as any })}
                  className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    data.heatTools === opt.id
                      ? 'bg-[#141c30] border-[#f72585] ring-1 ring-[#f72585] shadow-[0_0_10px_rgba(247,37,133,0.25)]'
                      : 'bg-[#060913] border-[#1f283d] hover:bg-[#0e1424]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{opt.label}</p>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>
                  {data.heatTools === opt.id && <Check className="w-4 h-4 text-[#f72585]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Histórico Químico de Transformação */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#f72585]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Histórico de processos químicos (selecione todos que se aplicam)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Múltipla escolha</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHEMICAL_OPTIONS.map((chem) => {
              const isSelected = data.chemicalHistory.includes(chem.id);
              return (
                <button
                  key={chem.id}
                  type="button"
                  onClick={() => toggleChemical(chem.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#141c30] border-[#f72585] ring-1 ring-[#f72585] shadow-[0_0_10px_rgba(247,37,133,0.25)]'
                      : 'bg-[#060913] border-[#1f283d] hover:bg-[#0e1424]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#e01e84] to-[#f72585] border-[#f72585] text-white shadow-[0_0_8px_rgba(247,37,133,0.4)]'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{chem.label}</p>
                    <p className="text-[11px] text-slate-400">{chem.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tempo da última química */}
          {data.chemicalHistory.some((c) => c !== 'Nenhuma') && (
            <div className="pt-3 border-t border-[#1a2236] space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Quando foi realizado o último procedimento químico?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Menos de 1 mês', '1 a 3 meses', '3 a 6 meses', 'Mais de 6 meses'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onChange({ ...data, lastChemicalTime: time })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      data.lastChemicalTime === time
                        ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white border-[#f72585] font-semibold shadow-[0_0_10px_rgba(247,37,133,0.3)]'
                        : 'bg-[#060913] text-slate-300 border-[#1f283d] hover:bg-[#0e1424]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Danos e Sintomas Percebidos pela Cliente */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f72585]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                5. Danos e queixas percebidos no toque e no dia a dia
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Toque para selecionar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {PERCEIVED_DAMAGES_OPTIONS.map((item) => {
              const isSelected = data.perceivedDamages.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleDamage(item.id)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#181c2f] border-[#f72585] text-white shadow-[0_0_10px_rgba(247,37,133,0.25)]'
                      : 'bg-[#060913] border-[#1f283d] text-slate-300 hover:bg-[#0e1424]'
                  }`}
                >
                  <span className="text-xs font-medium">{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#f72585] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Exposição e Fatores de Rotina */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1f283d] gap-3">
            <div>
              <p className="text-xs font-semibold text-white">Exposição a Piscina (Cloro) ou Mar?</p>
              <p className="text-[11px] text-slate-400">Metais e sal aceleram a oxidação e ressecamento.</p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...data, poolSunExposure: !data.poolSunExposure })}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                data.poolSunExposure ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585]' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  data.poolSunExposure ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#060913] border border-[#1f283d] gap-3">
            <div>
              <p className="text-xs font-semibold text-white">Consumo Hídrico Diário Estimado</p>
              <p className="text-[11px] text-slate-400">Hidratação celular sistêmica da haste capilar.</p>
            </div>
            <select
              value={data.waterIntakeLiters}
              onChange={(e) => onChange({ ...data, waterIntakeLiters: e.target.value })}
              className="px-3 py-2 rounded-lg bg-[#0c101d] border border-[#1f283d] text-base sm:text-xs text-white focus:outline-none min-h-[42px] cursor-pointer"
            >
              <option value="Menos de 1L">Menos de 1L / dia</option>
              <option value="1.5L">Em torno de 1.5L</option>
              <option value="2L a 3L">Adequado: 2L a 3L</option>
              <option value="Mais de 3L">+ de 3L / dia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-red-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
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
          <span>Voltar para Cadastro</span>
        </button>

        <button
          id="btn-continue-to-visual"
          type="button"
          onClick={handleAdvance}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer w-full sm:w-auto min-h-[48px] border border-[#ff66b2]/40"
        >
          <span>Prosseguir para Análise Visual</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
