import React, { useState } from 'react';
import { Eye, Layers, Sparkles, Activity, ShieldCheck, ArrowRight, ArrowLeft, Check, HelpCircle } from 'lucide-react';
import { VisualAnalysisData, CurvatureType, StrandThickness, HairDensity, ElasticityTest, PorosityTest, EndsState } from '../../types';
import { CURVATURE_CATALOG } from '../../data/hairKnowledge';
import { FacialHairScanner } from '../FacialHairScanner';

interface StepAnaliseVisualProps {
  data: VisualAnalysisData;
  clientName?: string;
  hairGoal?: string;
  onChange: (data: VisualAnalysisData) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const StepAnaliseVisual: React.FC<StepAnaliseVisualProps> = ({
  data,
  clientName,
  hairGoal,
  onChange,
  onBack,
  onContinue,
}) => {
  const [selectedCurvatureCategory, setSelectedCurvatureCategory] = useState<'Todos' | 'Lisos' | 'Ondulados' | 'Cacheados' | 'Crespos'>('Todos');
  const [showBenchHelper, setShowBenchHelper] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAdvance = () => {
    if (!data.curvature) {
      setValidationError('Por favor, selecione o padrão de curvatura da cliente.');
      return;
    }
    if (!data.thickness) {
      setValidationError('Por favor, defina a espessura da haste capilar (Fina, Média ou Grossa).');
      return;
    }
    if (!data.elasticity) {
      setValidationError('Por favor, realize e selecione o resultado do teste de tração e elasticidade.');
      return;
    }
    if (!data.porosity) {
      setValidationError('Por favor, selecione o nível de porosidade ao toque cuticular.');
      return;
    }
    setValidationError(null);
    onContinue();
  };

  const filteredCurvatures = CURVATURE_CATALOG.filter((c) =>
    selectedCurvatureCategory === 'Todos' ? true : c.category === selectedCurvatureCategory
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
            <Eye className="w-3.5 h-3.5" /> Etapa 4 • Análise Visual & Tátil de Bancada
          </div>
          <button
            type="button"
            onClick={() => setShowBenchHelper(!showBenchHelper)}
            className="text-xs text-[#f72585] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Como testar na bancada?
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          Exame Físico da Fibra Capilar
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Avaliação técnica realizada pelo profissional com mechas em mãos: curvatura, diâmetro, tração elástica e toque cuticular.
        </p>

        {showBenchHelper && (
          <div className="mt-4 p-4 rounded-xl bg-[#060913] border border-[#1e273d] text-xs text-slate-300 space-y-2 animate-fadeIn">
            <p className="font-semibold text-[#f72585]">Protocolo de Teste de Bancada Profissional:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>Teste de Elasticidade:</strong> Umedeça uma mecha fina de cerca de 10 fios. Segure firme e estique suavemente. Fio saudável alonga cerca de 20-30% e retorna à forma. Se esticar sem voltar ou partir, a elasticidade está comprometida.</li>
              <li><strong>Teste de Porosidade ao Toque:</strong> Isole um fio, segure a ponta e deslize os dedos indicador e polegar no sentido oposto (da ponta para a raiz). Se o deslizamento for irregular e áspero com "nódulos", a porosidade está alta (cutículas abertas).</li>
            </ul>
          </div>
        )}
      </div>

      {/* Leitura Facial e Visagismo por IA (Visão Computacional) */}
      <FacialHairScanner
        clientName={clientName}
        hairGoal={hairGoal}
        currentCurvature={data.curvature}
        existingAnalysis={data.facialAnalysis}
        existingImage={data.facialAnalysisImage}
        onAnalysisComplete={(result, imageBase64) => {
          onChange({
            ...data,
            facialAnalysis: result,
            facialAnalysisImage: imageBase64,
          });
        }}
        onApplyCurvature={(curv) => {
          onChange({
            ...data,
            curvature: curv,
          });
        }}
        onAppendNotes={(text) => {
          const currentObs = data.professionalObservations || '';
          const newObs = currentObs ? `${currentObs}\n\n${text}` : text;
          onChange({
            ...data,
            professionalObservations: newObs,
          });
        }}
        onClearAnalysis={() => {
          onChange({
            ...data,
            facialAnalysis: undefined,
            facialAnalysisImage: undefined,
          });
        }}
      />

      {/* 1. Curvatura do Fio (1A a 4C) */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f72585]" /> 1. Classificação da Curvatura (Tabela Internacional)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Identifique o padrão de ondulação natural ou predominante.</p>
          </div>

          {/* Curvature Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#060913] border border-[#1b2338] overflow-x-auto no-scrollbar">
            {(['Todos', 'Lisos', 'Ondulados', 'Cacheados', 'Crespos'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCurvatureCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCurvatureCategory === cat
                    ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-semibold shadow-[0_0_8px_rgba(247,37,133,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Curvatures Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {filteredCurvatures.map((curv) => {
            const isSelected = data.curvature === curv.code;
            return (
              <button
                key={curv.code}
                type="button"
                onClick={() => onChange({ ...data, curvature: curv.code as CurvatureType })}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#141c30] border-[#f72585] ring-2 ring-[#f72585]/60 shadow-[0_0_12px_rgba(247,37,133,0.3)]'
                    : 'bg-[#060913] border-[#1a2338] hover:bg-[#0e1424] hover:border-[#f72585]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#f72585]">{curv.code}</span>
                    <span className="text-lg opacity-80">{curv.curlIcon}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-white truncate">{curv.category}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-tight">
                  {curv.tendency}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Curvature Highlight */}
        {data.curvature && (
          <div className="p-3.5 rounded-xl bg-[#0e1322] border border-[#1e2840] flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Curvatura selecionada: <strong className="text-[#f72585]">{data.curvature}</strong> - {CURVATURE_CATALOG.find((c) => c.code === data.curvature)?.description}
            </span>
            <span className="text-[11px] text-[#f72585] font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Confirmada
            </span>
          </div>
        )}
      </div>

      {/* 2. Teste de Elasticidade & Teste de Porosidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teste de Elasticidade */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#f72585]" /> 2. Teste de Elasticidade
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#161c30] text-[#ff66b2] border border-[#f72585]/40">
                Resistência Cortical
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Resultado do teste de estiramento do fio úmido na bancada.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'SAUDAVEL',
                label: 'Alta / Saudável',
                sub: 'Estica e retorna prontamente à forma inicial sem deformação permanente.',
                tag: 'Fibras íntegras',
                tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
              },
              {
                id: 'MEDIA',
                label: 'Média / Moderada',
                sub: 'Estica razoavelmente, mas apresenta ligeira perda de memória elástica.',
                tag: 'Alerta inicial',
                tagColor: 'text-amber-300 bg-amber-950/60 border-amber-800',
              },
              {
                id: 'BAIXA_EMBORRACHADO',
                label: 'Baixa / Emborrachado (Crítico)',
                sub: 'Fio estica excessivamente como chiclete e parte, ou não retorna.',
                tag: 'Ação Imediata',
                tagColor: 'text-rose-400 bg-rose-950/60 border-rose-800 font-bold',
              },
            ].map((el) => {
              const isSelected = data.elasticity === el.id;
              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => onChange({ ...data, elasticity: el.id as ElasticityTest })}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#141c30] border-[#f72585] ring-1 ring-[#f72585] shadow-[0_0_10px_rgba(247,37,133,0.25)]'
                      : 'bg-[#060913] border-[#1a2338] hover:bg-[#0e1424]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{el.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${el.tagColor}`}>
                      {el.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{el.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teste de Porosidade */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f72585]" /> 3. Teste de Porosidade
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#201026] text-[#ff66b2] border border-[#f72585]/40">
                Abertura Cuticular
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deslize tátil dos dedos da ponta para a raiz ou teste de retenção.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'BAIXA',
                label: 'Baixa Porosidade (Cutículas Fechadas)',
                sub: 'Fio muito liso, toque escorregadio, água e cremes demoram a penetrar.',
                action: 'Necessita de calor suave para absorção',
              },
              {
                id: 'MEDIA',
                label: 'Média Porosidade (Ideal / Equilibrada)',
                sub: 'Cutículas alinhadas, boa absorção e retenção hídrica adequada.',
                action: 'Manter cronograma padrão',
              },
              {
                id: 'ALTA',
                label: 'Alta Porosidade (Cutículas Abertas / Danificadas)',
                sub: 'Toque áspero com atrito; absorve água rápido e perde tudo com a mesma velocidade.',
                action: 'Necessita de acidificação pH 3.0 e nutrição lipídica',
              },
            ].map((por) => {
              const isSelected = data.porosity === por.id;
              return (
                <button
                  key={por.id}
                  type="button"
                  onClick={() => onChange({ ...data, porosity: por.id as PorosityTest })}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#141c30] border-[#f72585] ring-1 ring-[#f72585] shadow-[0_0_10px_rgba(247,37,133,0.25)]'
                      : 'bg-[#060913] border-[#1a2338] hover:bg-[#0e1424]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{por.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#f72585]" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1">{por.sub}</p>
                  <span className="text-[10px] text-[#f72585] font-medium">{por.action}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Espessura, Densidade e Estado das Pontas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Espessura */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            4. Espessura do Fio
          </h3>
          <div className="space-y-2">
            {[
              { id: 'FINO', label: 'Fino / Delicado', desc: 'Frágil a químicas e quebra mecânica' },
              { id: 'MEDIO', label: 'Médio / Padrão', desc: 'Resistência equilibrada' },
              { id: 'GROSSO', label: 'Grosso / Robusto', desc: 'Muita massa, cutícula compacta' },
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => onChange({ ...data, thickness: th.id as StrandThickness })}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-all cursor-pointer min-h-[46px] ${
                  data.thickness === th.id
                    ? 'bg-[#141c30] border-[#f72585] text-white font-semibold shadow-[0_0_8px_rgba(247,37,133,0.2)]'
                    : 'bg-[#060913] border-[#1a2338] text-slate-300 hover:bg-[#0e1424]'
                }`}
              >
                <div>{th.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{th.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Densidade */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            5. Densidade Capilar
          </h3>
          <div className="space-y-2">
            {[
              { id: 'BAIXA', label: 'Baixa Densidade', desc: 'Couro visível facilmente entre os fios' },
              { id: 'MEDIA', label: 'Média Densidade', desc: 'Volume padrão e cobertura equilibrada' },
              { id: 'ALTA', label: 'Alta Densidade', desc: 'Muita quantidade de fios por cm²' },
            ].map((den) => (
              <button
                key={den.id}
                type="button"
                onClick={() => onChange({ ...data, density: den.id as HairDensity })}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-all cursor-pointer min-h-[46px] ${
                  data.density === den.id
                    ? 'bg-[#141c30] border-[#f72585] text-white font-semibold shadow-[0_0_8px_rgba(247,37,133,0.2)]'
                    : 'bg-[#060913] border-[#1a2338] text-slate-300 hover:bg-[#0e1424]'
                }`}
              >
                <div>{den.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{den.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Estado das Pontas */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-5 space-y-3 sm:col-span-2 lg:col-span-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            6. Estado das Pontas
          </h3>
          <div className="space-y-2">
            {[
              { id: 'INTEGRAS', label: 'Íntegras / Seladas', desc: 'Pontas unidas e saudáveis' },
              { id: 'RESSECADAS', label: 'Secas / Rígidas', desc: 'Aspereza sem grande bifurcação' },
              { id: 'DUPLAS', label: 'Pontas Duplas', desc: 'Fissura cuticular visível' },
              { id: 'MULTIPLAS_ESFARELADAS', label: 'Esfareladas / Múltiplas', desc: 'Degradação intensa do córtex' },
            ].map((end) => (
              <button
                key={end.id}
                type="button"
                onClick={() => onChange({ ...data, endsState: end.id as EndsState })}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-all cursor-pointer min-h-[46px] ${
                  data.endsState === end.id
                    ? 'bg-[#141c30] border-[#f72585] text-white font-semibold shadow-[0_0_8px_rgba(247,37,133,0.2)]'
                    : 'bg-[#060913] border-[#1a2338] text-slate-300 hover:bg-[#0e1424]'
                }`}
              >
                <div>{end.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{end.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Tração Mecânica, Toque da Fibra e Frizz */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Resistência à Tração Mecânica */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              7. Resistência à Tração
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Teste físico de força sob mecha úmida.</p>
          </div>
          <div className="space-y-2">
            {[
              { id: 'BOA_RESISTENTE', label: 'Boa / Resistente', desc: 'Suporta a tração manual sem romper' },
              { id: 'MODERADA', label: 'Moderada', desc: 'Alongamento tolerável com ligeira fragilidade' },
              { id: 'FRAGIL_QUEBRADICO', label: 'Frágil / Rompe Fácil', desc: 'Quebra imediata sob mínima tensão' },
            ].map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => onChange({ ...data, tensileResistance: tr.id as any })}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-all cursor-pointer min-h-[46px] ${
                  (data.tensileResistance || 'BOA_RESISTENTE') === tr.id
                    ? 'bg-[#141c30] border-[#f72585] text-white font-semibold shadow-[0_0_8px_rgba(247,37,133,0.2)]'
                    : 'bg-[#060913] border-[#1a2338] text-slate-300 hover:bg-[#0e1424]'
                }`}
              >
                <div>{tr.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{tr.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Toque e Aspecto da Fibra */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              8. Toque e Aspecto
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sensação sensorial ao manusear a mecha.</p>
          </div>
          <div className="space-y-2">
            {[
              { id: 'MACIO_SEDOSO', label: 'Macio & Sedoso', desc: 'Deslize fluído e brilho' },
              { id: 'ASPERO_RIGIDO', label: 'Áspero & Rígido', desc: 'Falta de maleabilidade e manto lipídico' },
              { id: 'RESSECADO_OPOCO', label: 'Ressecado & Opaco', desc: 'Falta de água e movimento natural' },
              { id: 'FRAGIL_QUEBRADICO', label: 'Frágil & Quebradiço', desc: 'Sensação espigada com risco de ruptura' },
            ].map((ts) => (
              <button
                key={ts.id}
                type="button"
                onClick={() => onChange({ ...data, touchSensation: ts.id as any })}
                className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer min-h-[44px] ${
                  (data.touchSensation || 'ASPERO_RIGIDO') === ts.id
                    ? 'bg-[#141c30] border-[#f72585] text-white font-semibold shadow-[0_0_8px_rgba(247,37,133,0.2)]'
                    : 'bg-[#060913] border-[#1a2338] text-slate-300 hover:bg-[#0e1424]'
                }`}
              >
                <div>{ts.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{ts.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Nível de Frizz */}
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-4 sm:p-5 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              9. Frizz & Alinhamento
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Comportamento cuticular frente ao ambiente.</p>
          </div>
          <div className="space-y-2">
            {[
              { id: 'LEVE', label: 'Leve / Discreto', desc: 'Fios alinhados com dispersão mínima' },
              { id: 'MODERADO', label: 'Moderado', desc: 'Frizz perceptível no topo e contorno' },
              { id: 'INTENSO', label: 'Intenso / Desalinhado', desc: 'Alta eletrostática e sensibilidade à umidade' },
            ].map((fr) => (
              <button
                key={fr.id}
                type="button"
                onClick={() => onChange({ ...data, frizzLevel: fr.id as any })}
                className={`w-full p-3 rounded-xl text-left border text-xs transition-all cursor-pointer min-h-[46px] ${
                  (data.frizzLevel || 'MODERADO') === fr.id
                    ? 'bg-[#141c30] border-[#f72585] text-white font-semibold shadow-[0_0_8px_rgba(247,37,133,0.2)]'
                    : 'bg-[#060913] border-[#1a2338] text-slate-300 hover:bg-[#0e1424]'
                }`}
              >
                <div>{fr.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{fr.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Análise com Aparelho / Microscópio Digital */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2338] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" /> Microscopia & Aparelho Digital
            </div>
            <h3 className="text-base font-bold text-white">
              Registro de Análise com Aparelho Digital
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Inspeção da fibra sob aumento óptico para cruzamento de dados com a avaliação da bancada.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 px-3 py-1 rounded-lg bg-[#060913] border border-[#1b2338] self-start sm:self-auto">
            Integração Digital
          </span>
        </div>

        {/* Região Observada */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200">
            Região Observada pelo Aparelho:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Couro Cabeludo / Topo', 'Comprimento Médio', 'Pontas', 'Linha Frontal'].map((region) => {
              const currentRegion = data.microscope?.observedRegion || 'Pontas';
              const isSelected = currentRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      microscope: {
                        ...data.microscope,
                        observedRegion: region,
                      },
                    })
                  }
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141c30] border-[#f72585] text-white shadow-[0_0_8px_rgba(247,37,133,0.2)]'
                      : 'bg-[#060913] border-[#1a2338] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achados Visuais do Aparelho */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200">
            Achados Observados sob Aumento:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'Cutícula entreaberta/desgastada', desc: 'Escamas erodidas com perda de selagem' },
              { id: 'Fissuras no córtex', desc: 'Microfraturas estruturais na haste' },
              { id: 'Tricoptilose/ponta bifurcada', desc: 'Pontas duplas ou esfarelamento distal' },
              { id: 'Acúmulo sebáceo folicular', desc: 'Depósito lipídico periostial na raiz' },
              { id: 'Descamação fina', desc: 'Descamação epitelial do couro cabeludo' },
              { id: 'Afinamento distal', desc: 'Perda de calibre em direção às extremidades' },
              { id: 'Fibra íntegra e alinhada', desc: 'Boa coesão cuticular e córtex protegido' },
            ].map((finding) => {
              const currentFindings = data.microscope?.deviceFindings || [];
              const isChecked = currentFindings.includes(finding.id);

              return (
                <label
                  key={finding.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-[#141c30] border-[#f72585] text-white shadow-[0_0_6px_rgba(247,37,133,0.2)]'
                      : 'bg-[#060913] border-[#1a2338] text-slate-300 hover:bg-[#0e1424]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...currentFindings, finding.id]
                        : currentFindings.filter((f) => f !== finding.id);
                      onChange({
                        ...data,
                        microscope: {
                          ...data.microscope,
                          deviceFindings: updated,
                        },
                      });
                    }}
                    className="mt-0.5 accent-[#f72585] rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-semibold">{finding.id}</div>
                    <div className="text-[10px] text-slate-400">{finding.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Upload de Imagem do Aparelho & Observações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Imagem do Aparelho */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">
              Foto / Captura do Microscópio:
            </label>
            <div className="p-3 rounded-xl bg-[#060913] border border-[#1b2338] space-y-3">
              {data.microscope?.deviceImage ? (
                <div className="relative rounded-lg overflow-hidden border border-[#f72585]/40 max-h-40 flex items-center justify-center bg-black">
                  <img
                    src={data.microscope.deviceImage}
                    alt="Registro do Microscópio"
                    className="object-contain max-h-36 w-full"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...data,
                        microscope: {
                          ...data.microscope,
                          deviceImage: undefined,
                        },
                      })
                    }
                    className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-[#f72585] border border-[#f72585]/50 text-[10px] rounded hover:bg-black cursor-pointer"
                  >
                    Remover Foto
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#1e273d] hover:border-[#f72585]/50 rounded-xl p-4 transition-colors cursor-pointer text-center group">
                  <Eye className="w-6 h-6 text-slate-500 group-hover:text-[#f72585] mb-2 transition-colors" />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Anexar foto do microscópio
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    PNG, JPG ou foto capturada pelo aparelho
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onChange({
                            ...data,
                            microscope: {
                              ...data.microscope,
                              deviceImage: reader.result as string,
                            },
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Anotações do Aparelho */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">
              Observações Técnicas do Aparelho:
            </label>
            <textarea
              rows={4}
              value={data.microscope?.deviceNotes || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  microscope: {
                    ...data.microscope,
                    deviceNotes: e.target.value,
                  },
                })
              }
              placeholder="Ex: Fissuras transversais identificadas a 5 cm das pontas. Presença de cutícula descolada."
              className="w-full p-3 rounded-xl bg-[#060913] border border-[#1b2338] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f72585] resize-none"
            />
          </div>
        </div>

        {/* Nota de transparência tecnológica */}
        <div className="p-3 rounded-xl bg-[#060913]/60 border border-[#1b2338] text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#f72585] shrink-0 mt-0.5" />
          <span>
            <strong>Estrutura Digital Pronta:</strong> Os achados visuais e notas do microscópio são cruzados diretamente nos cálculos de pontuação. O módulo de visão computacional para interpretação automática de imagens será disponibilizado nas próximas atualizações.
          </span>
        </div>
      </div>

      {/* 7. Observações Livres da Bancada */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-5 space-y-2">
        <label className="text-xs font-bold text-white uppercase tracking-wider">
          10. Observações Livres do Profissional (Bancada)
        </label>
        <textarea
          rows={3}
          value={data.professionalObservations || ''}
          onChange={(e) => onChange({ ...data, professionalObservations: e.target.value })}
          placeholder="Ex: Cliente relatou aumento da queda após banho quente. Mecha teste apresentou boa resposta ao teste ácido."
          className="w-full p-3 rounded-xl bg-[#060913] border border-[#1b2338] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f72585] resize-none"
        />
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
          <span>Voltar para Anamnese</span>
        </button>

        <button
          id="btn-calculate-score"
          type="button"
          onClick={handleAdvance}
          className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer w-full sm:w-auto min-h-[48px] border border-[#ff66b2]/40"
        >
          <span>Calcular Pontuação & Índice Capilar</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
