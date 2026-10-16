import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Scissors,
  Zap,
  Layers,
  Smile,
  X,
  FlipHorizontal,
  ChevronRight,
  ShieldCheck,
  Activity,
  Check,
  Copy,
  FileText,
  AlignLeft,
  LayoutGrid,
} from 'lucide-react';
import {
  FacialHairAnalysisResult,
  CurvatureType,
  DetectedCapillaryAnalysis,
  VisualAnalysisData,
} from '../types';

interface FacialHairScannerProps {
  clientName?: string;
  hairGoal?: string;
  currentCurvature?: CurvatureType;
  currentVisualData?: VisualAnalysisData;
  existingAnalysis?: FacialHairAnalysisResult;
  existingImage?: string;
  onAnalysisComplete: (result: FacialHairAnalysisResult, imageBase64: string) => void;
  onApplyCurvature?: (curvature: CurvatureType) => void;
  onApplyAllDetectedAnalysis?: (analysis: DetectedCapillaryAnalysis) => void;
  onApplySingleParameter?: (paramKey: keyof DetectedCapillaryAnalysis, value: any) => void;
  onAppendNotes?: (text: string) => void;
  onClearAnalysis?: () => void;
}

export const FacialHairScanner: React.FC<FacialHairScannerProps> = ({
  clientName,
  hairGoal,
  currentCurvature,
  currentVisualData,
  existingAnalysis,
  existingImage,
  onAnalysisComplete,
  onApplyCurvature,
  onApplyAllDetectedAnalysis,
  onApplySingleParameter,
  onAppendNotes,
  onClearAnalysis,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(existingImage || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedAll, setAppliedAll] = useState<boolean>(false);
  const [appliedNotes, setAppliedNotes] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'text' | 'cards'>('text');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showRawText, setShowRawText] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start live camera stream
  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    setErrorMsg(null);
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador. Use a opção de anexo de foto.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setFacingMode(mode);
    } catch (err: any) {
      console.warn('Câmera indisponível:', err);
      setErrorMsg(
        err.message || 'Permissão de câmera negada ou dispositivo ocupado. Você pode enviar uma foto diretamente.'
      );
      setIsCameraActive(false);
    }
  };

  // Flip camera between front and back
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  // Compress and resize image using client-side canvas
  const processImageToJpeg = (source: HTMLVideoElement | HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const MAX_DIM = 1024;
    let width = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
    let height = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;

    if (!width || !height) {
      width = 800;
      height = 800;
    }

    if (width > height && width > MAX_DIM) {
      height = Math.round((height * MAX_DIM) / width);
      width = MAX_DIM;
    } else if (height > MAX_DIM) {
      width = Math.round((width * MAX_DIM) / height);
      height = MAX_DIM;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(source, 0, 0, width, height);
    }
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Capture still from video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const base64 = processImageToJpeg(videoRef.current);
      setSelectedImage(base64);
      stopCamera();
      triggerAnalysis(base64);
    } catch {
      setErrorMsg('Não foi possível capturar a imagem da câmera.');
    }
  };

  // Handle uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const compressedBase64 = processImageToJpeg(img);
        setSelectedImage(compressedBase64);
        triggerAnalysis(compressedBase64);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Trigger server-side multimodal AI analysis
  const triggerAnalysis = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAppliedAll(false);
    setAppliedNotes(false);

    try {
      const response = await fetch('/api/ai-hair-face-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          clientName: clientName || 'Cliente',
          hairGoal: hairGoal || 'Harmonização e Tratamento',
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha no servidor: ${response.statusText}`);
      }

      const result: FacialHairAnalysisResult = await response.json();
      onAnalysisComplete(result, imageBase64);

      // Auto-apply all 9 parameters if callback provided
      if (result.detectedAnalysis && onApplyAllDetectedAnalysis) {
        onApplyAllDetectedAnalysis(result.detectedAnalysis);
        setAppliedAll(true);
      }
    } catch (err: any) {
      console.error('Erro na análise facial por IA:', err);
      setErrorMsg('Não foi possível concluir a leitura automática. Você pode tentar novamente com outra foto.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAll = () => {
    if (existingAnalysis?.detectedAnalysis && onApplyAllDetectedAnalysis) {
      onApplyAllDetectedAnalysis(existingAnalysis.detectedAnalysis);
      setAppliedAll(true);
    }
  };

  const handleApplySingle = (key: keyof DetectedCapillaryAnalysis, value: any) => {
    if (onApplySingleParameter) {
      onApplySingleParameter(key, value);
    } else if (key === 'curvature' && onApplyCurvature) {
      onApplyCurvature(value);
    }
  };

  const handleAppendObservations = () => {
    if (!existingAnalysis || !onAppendNotes) return;
    const d = existingAnalysis.detectedAnalysis;
    const reportText = `[Laudo Machine Learning]:\n` +
      `1. Curvatura: ${d?.curvature || existingAnalysis.hairCurvatureDetected || '2B'} (${d?.curvatureReason || ''})\n` +
      `2. Elasticidade: ${getElasticityLabel(d?.elasticity)} (${d?.elasticityReason || ''})\n` +
      `3. Porosidade: ${getPorosityLabel(d?.porosity)} (${d?.porosityReason || ''})\n` +
      `4. Espessura: ${getThicknessLabel(d?.thickness)} (${d?.thicknessReason || ''})\n` +
      `5. Densidade: ${getDensityLabel(d?.density)} (${d?.densityReason || ''})\n` +
      `6. Pontas: ${getEndsLabel(d?.endsState)} (${d?.endsStateReason || ''})\n` +
      `7. Tração: ${getTensileLabel(d?.tensileResistance)} (${d?.tensileResistanceReason || ''})\n` +
      `8. Toque & Aspecto: ${getTouchLabel(d?.touchSensation)} (${d?.touchSensationReason || ''})\n` +
      `9. Frizz & Alinhamento: ${getFrizzLabel(d?.frizzLevel)} (${d?.frizzLevelReason || ''})\n` +
      `Visagismo: Formato ${existingAnalysis.faceShape}. Harmonização: ${existingAnalysis.visagismRecommendation}\n` +
      `Protocolo sugerido: ${existingAnalysis.cosmeticProtocolRecommendation}`;
    onAppendNotes(reportText);
    setAppliedNotes(true);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setErrorMsg(null);
    setAppliedAll(false);
    setAppliedNotes(false);
    stopCamera();
    if (onClearAnalysis) {
      onClearAnalysis();
    }
  };

  const detected = existingAnalysis?.detectedAnalysis;

  // Helpers to display user-friendly labels for detected parameters
  const getElasticityLabel = (val?: string) => {
    switch (val) {
      case 'SAUDAVEL':
        return 'Alta / Saudável';
      case 'MEDIA':
        return 'Média / Moderada';
      case 'BAIXA_EMBORRACHADO':
        return 'Baixa / Emborrachado';
      default:
        return val || 'Média';
    }
  };

  const getPorosityLabel = (val?: string) => {
    switch (val) {
      case 'BAIXA':
        return 'Baixa (Cutículas Fechadas)';
      case 'MEDIA':
        return 'Média (Equilibrada)';
      case 'ALTA':
        return 'Alta (Cutículas Abertas)';
      default:
        return val || 'Média';
    }
  };

  const getThicknessLabel = (val?: string) => {
    switch (val) {
      case 'FINO':
        return 'Fino / Delicado';
      case 'MEDIO':
        return 'Médio / Padrão';
      case 'GROSSO':
        return 'Grosso / Robusto';
      default:
        return val || 'Médio';
    }
  };

  const getDensityLabel = (val?: string) => {
    switch (val) {
      case 'BAIXA':
        return 'Baixa Densidade';
      case 'MEDIA':
        return 'Média Densidade';
      case 'ALTA':
        return 'Alta Densidade';
      default:
        return val || 'Média';
    }
  };

  const getEndsLabel = (val?: string) => {
    switch (val) {
      case 'INTEGRAS':
        return 'Íntegras / Seladas';
      case 'RESSECADAS':
        return 'Secas / Rígidas';
      case 'DUPLAS':
        return 'Pontas Duplas';
      case 'MULTIPLAS_ESFARELADAS':
        return 'Esfareladas / Múltiplas';
      default:
        return val || 'Pontas Duplas';
    }
  };

  const getTensileLabel = (val?: string) => {
    switch (val) {
      case 'BOA_RESISTENTE':
        return 'Boa / Resistente';
      case 'MODERADA':
        return 'Moderada';
      case 'FRAGIL_QUEBRADICO':
        return 'Frágil / Rompe Fácil';
      default:
        return val || 'Moderada';
    }
  };

  const getTouchLabel = (val?: string) => {
    switch (val) {
      case 'MACIO_SEDOSO':
        return 'Macio & Sedoso';
      case 'ASPERO_RIGIDO':
        return 'Áspero & Rígido';
      case 'RESSECADO_OPOCO':
        return 'Ressecado & Opaco';
      case 'FRAGIL_QUEBRADICO':
        return 'Frágil & Quebradiço';
      default:
        return val || 'Áspero & Rígido';
    }
  };

  const getFrizzLabel = (val?: string) => {
    switch (val) {
      case 'LEVE':
        return 'Leve / Discreto';
      case 'MODERADO':
        return 'Moderado';
      case 'INTENSO':
        return 'Intenso / Desalinhado';
      default:
        return val || 'Moderado';
    }
  };

  const generateTextReport = () => {
    if (!existingAnalysis) return '';
    const d = existingAnalysis.detectedAnalysis;
    return `=======================================================
LAUDO TÉCNICO DE ANÁLISE CAPILAR & VISAGISMO
CAPILAR SMART IA • PROJETO INTEGRADOR
=======================================================
Cliente: ${clientName || 'Cliente'}
Objetivo: ${hairGoal || 'Harmonização e Tratamento'}
Data da Análise: ${new Date().toLocaleDateString('pt-BR')}

--- DIAGNÓSTICO DAS 9 ETAPAS DE BANCADA ---
1. Classificação da Curvatura (Tabela Internacional): ${d?.curvature || existingAnalysis.hairCurvatureDetected || '2B'}
   • Parecer: ${d?.curvatureReason || 'Classificado conforme Tabela Internacional.'}

2. Teste de Elasticidade: ${getElasticityLabel(d?.elasticity)}
   • Parecer: ${d?.elasticityReason || 'Comportamento elástico e resposta cortical avaliados.'}

3. Teste de Porosidade: ${getPorosityLabel(d?.porosity)}
   • Parecer: ${d?.porosityReason || 'Nível de abertura cuticular e refração de luz.'}

4. Espessura do Fio: ${getThicknessLabel(d?.thickness)}
   • Parecer: ${d?.thicknessReason || 'Calibre aparente da fibra em relação ao diâmetro médio.'}

5. Densidade Capilar: ${getDensityLabel(d?.density)}
   • Parecer: ${d?.densityReason || 'Distribuição folicular e cobertura do couro cabeludo.'}

6. Estado das Pontas: ${getEndsLabel(d?.endsState)}
   • Parecer: ${d?.endsStateReason || 'Grau de integridade cuticular e ramificações nas extremidades.'}

7. Resistência à Tração: ${getTensileLabel(d?.tensileResistance)}
   • Parecer: ${d?.tensileResistanceReason || 'Resposta da fibra sob tensão mecânica.'}

8. Toque e Aspecto: ${getTouchLabel(d?.touchSensation)}
   • Parecer: ${d?.touchSensationReason || 'Sensação tátil, flexibilidade e brilho aparente.'}

9. Frizz & Alinhamento: ${getFrizzLabel(d?.frizzLevel)}
   • Parecer: ${d?.frizzLevelReason || 'Grau de dispersão dos fios e resposta à higrometria.'}

--- VISAGISMO E HARMONIZAÇÃO FACIAL ---
• Formato Facial: ${existingAnalysis.faceShape || 'Padrão'}
• Proporções Faciais: ${existingAnalysis.facialFeatures || ''}
• Harmonização Visagista & Corte: ${existingAnalysis.visagismRecommendation || ''}

--- CONDUTA E PROTOCOLO PRIORITÁRIO ---
• Protocolo Cosmético Recomendado: ${existingAnalysis.cosmeticProtocolRecommendation || ''}
• Parecer Técnico Geral: ${existingAnalysis.summary || existingAnalysis.apparentHairCondition || ''}
=======================================================`;
  };

  const handleCopyTextReport = () => {
    const text = generateTextReport();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }).catch(() => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2500);
      } catch (err) {
        console.warn('Erro ao copiar texto:', err);
      }
    });
  };

  return (
    <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2338] pb-4 mb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#f72585]/15 to-[#7209b7]/15 border border-[#f72585]/30 text-[#f72585] text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(247,37,133,0.2)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Machine Learning & Visão Multimodal
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Leitura Automática da Fibra & Visagismo por Imagem
          </h3>
          <p className="text-xs text-slate-300">
            Fotografe ou anexe a foto do cabelo da cliente. O modelo de Machine Learning identifica automaticamente todas as 9 características da fibra e as proporções do rosto.
          </p>
        </div>

        {/* Action badges or reset */}
        {existingAnalysis && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 9 Etapas Classificadas
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-[#f72585] transition-colors p-1.5 rounded-lg hover:bg-[#1a2236] cursor-pointer"
              title="Nova Análise por Imagem"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start justify-between gap-2 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Live Camera View */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#f72585]/40 shadow-[0_0_25px_rgba(247,37,133,0.25)] mb-6 animate-fadeIn">
          <div className="relative aspect-4/3 max-h-[380px] w-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Silhouette & Face Alignment Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              <div className="w-48 sm:w-56 h-64 sm:h-72 border-2 border-dashed border-[#f72585]/70 rounded-[50%] shadow-[0_0_20px_rgba(247,37,133,0.3)] flex flex-col items-center justify-between p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#f72585] bg-black/70 px-2 py-0.5 rounded-full mt-2">
                  Topo / Cabelo
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#f72585] bg-black/70 px-2 py-0.5 rounded-full mb-2">
                  Queixo / Rosto
                </span>
              </div>
              <p className="text-[11px] font-medium text-white/90 bg-black/70 px-3 py-1 rounded-full mt-3 backdrop-blur-sm shadow">
                Posicione o rosto e as mechas dentro da moldura
              </p>
            </div>
          </div>

          {/* Camera Controls Bar */}
          <div className="p-3 bg-[#060913]/90 border-t border-[#1b2338] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="px-3.5 py-2 rounded-xl bg-[#13192c] hover:bg-[#1b2338] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>

            <button
              type="button"
              onClick={handleCapturePhoto}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] hover:brightness-110 text-white text-xs font-bold shadow-[0_0_15px_rgba(247,37,133,0.5)] flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Capturar Foto & Ler Fibra
            </button>

            <button
              type="button"
              onClick={toggleCameraFacing}
              className="px-3 py-2 rounded-xl bg-[#13192c] hover:bg-[#1b2338] text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Alternar Câmera"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* When no analysis has been run and camera is closed */}
      {!isCameraActive && !existingAnalysis && !isAnalyzing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          {/* Option 1: Live Camera */}
          <button
            type="button"
            onClick={() => startCamera('user')}
            className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-b from-[#13192c] to-[#0c101d] border border-[#1f283d] hover:border-[#f72585]/60 hover:shadow-[0_0_20px_rgba(247,37,133,0.15)] transition-all cursor-pointer group text-center space-y-3"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#f72585]/15 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(247,37,133,0.2)]">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Tirar Foto com a Câmera</span>
              <span className="text-xs text-slate-400 mt-1 block">
                Aciona a câmera do tablet para escanear a mecha e rosto da cliente
              </span>
            </div>
          </button>

          {/* Option 2: Upload Photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-b from-[#13192c] to-[#0c101d] border border-[#1f283d] hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer group text-center space-y-3"
          >
            <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Carregar Foto da Galeria</span>
              <span className="text-xs text-slate-400 mt-1 block">
                JPG ou PNG nítido exibindo as mechas e o comprimento do cabelo
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Loading State during AI Processing */}
      {isAnalyzing && (
        <div className="p-8 rounded-2xl bg-[#060913] border border-[#f72585]/40 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_0_25px_rgba(247,37,133,0.2)] animate-pulse">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#e01e84] to-[#7209b7] flex items-center justify-center text-white shadow-[0_0_20px_rgba(247,37,133,0.5)]">
            <Sparkles className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Analisando Imagem com Machine Learning</h4>
            <p className="text-xs text-slate-300 max-w-md mt-1">
              Classificando curvatura, elasticidade, porosidade, espessura, densidade, pontas, tração, toque sensorial e frizz...
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#f72585] font-semibold bg-[#f72585]/10 px-3 py-1 rounded-full border border-[#f72585]/20">
            <span className="w-2 h-2 rounded-full bg-[#f72585] animate-ping" /> Processamento Multimodal das 9 Etapas
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {existingAnalysis && !isAnalyzing && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Control Bar with View Mode, Actions and Feedback */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0d1424] to-[#080d1a] border border-[#232e48] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#f72585]" /> Laudo da Leitura por Machine Learning
                </h4>
                <p className="text-[11px] text-slate-300">
                  Todas as 9 etapas da bancada foram diagnosticadas e salvas automaticamente na avaliação.
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center flex-wrap gap-2">
              {/* View Mode Switcher */}
              <div className="inline-flex rounded-lg bg-[#060913] p-1 border border-[#1b2338]">
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'text'
                      ? 'bg-[#f72585] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Exibir resposta em formato texto corrido/laudo"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Laudo em Texto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-[#f72585] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Exibir cartões individuais"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cartões</span>
                </button>
              </div>

              {/* Copy Full Text Report */}
              <button
                type="button"
                onClick={handleCopyTextReport}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  copiedReport
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-[#12192c] hover:bg-[#1a233d] border-[#253250] text-slate-200 hover:text-white'
                }`}
                title="Copiar texto completo do laudo para a área de transferência"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Texto Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" /> Copiar Laudo em Texto
                  </>
                )}
              </button>

              {/* Append into Professional Observations */}
              {onAppendNotes && (
                <button
                  type="button"
                  onClick={handleAppendObservations}
                  disabled={appliedNotes}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    appliedNotes
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#12192c] hover:bg-[#1a233d] border-[#253250] text-slate-200 hover:text-white'
                  }`}
                  title="Inserir laudo descritivo no campo de observações"
                >
                  {appliedNotes ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Inserido nas Obs.
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Inserir nas Obs.
                    </>
                  )}
                </button>
              )}

              {/* Reset / New Photo */}
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#12192c] hover:bg-[#1a233d] border border-[#253250] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="Tirar outra foto ou enviar novo arquivo"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Nova Foto
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: LAUDO EM TEXTO (RESPOSTA ESTRUTURADA EM TEXTO APÓS A ANÁLISE) */}
          {viewMode === 'text' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Lateral Photo & Badges Box */}
                {selectedImage && (
                  <div className="lg:col-span-4 space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-[#202b44] bg-black max-h-64 sm:max-h-72 flex items-center justify-center shadow-lg">
                      <img
                        src={selectedImage}
                        alt="Foto da Cliente"
                        className="w-full h-full object-cover max-h-64 sm:max-h-72"
                      />
                      <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 bg-black/80 backdrop-blur-xs rounded-lg text-[10px] text-slate-300 text-center border border-white/10 font-medium">
                        Foto Analisada por Machine Learning
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#090d1a] border border-[#1b253b] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                          <Smile className="w-3.5 h-3.5 text-cyan-400" /> Visagismo Facial:
                        </span>
                        <span className="font-bold text-white bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                          {existingAnalysis.faceShape}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                          <Layers className="w-3.5 h-3.5 text-[#f72585]" /> Curvatura Estimada:
                        </span>
                        <span className="font-extrabold text-[#ff66b2] bg-[#f72585]/15 px-2 py-0.5 rounded border border-[#f72585]/30">
                          {detected?.curvature || existingAnalysis.hairCurvatureDetected || '2B'}
                        </span>
                      </div>
                      {existingAnalysis.apparentHairCondition && (
                        <p className="text-[11px] text-slate-400 italic pt-1 border-t border-[#182033] line-clamp-3">
                          "{existingAnalysis.apparentHairCondition}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Text Report Document Box */}
                <div className={`${selectedImage ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#070b16] border border-[#1e2a44] shadow-xl space-y-4">
                    <div className="border-b border-[#1b253b] pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#f72585] uppercase tracking-wider">
                          Laudo Descritivo • Análise Capilar por Machine Learning
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Diagnóstico Técnico das 9 Etapas de Bancada
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date().toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* The 9 Items in Structured Text */}
                    <div className="space-y-3.5 text-xs text-slate-200">
                      {/* 1. Curvatura */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#f72585]" /> 1. Classificação da Curvatura (Tabela Internacional):
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#f72585]/20 text-[#ff66b2] font-black border border-[#f72585]/40 text-xs">
                            {detected?.curvature || existingAnalysis.hairCurvatureDetected || '2B'}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.curvatureReason || 'Classificado conforme o padrão morfológico da Tabela Internacional.'}
                        </p>
                      </div>

                      {/* 2. Elasticidade */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-cyan-400" /> 2. Teste de Elasticidade:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-700/60 text-xs">
                            {getElasticityLabel(detected?.elasticity)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.elasticityReason || 'Comportamento elástico da haste e preservação das pontes de hidrogênio e cistina.'}
                        </p>
                      </div>

                      {/* 3. Porosidade */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 3. Teste de Porosidade:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-700/60 text-xs">
                            {getPorosityLabel(detected?.porosity)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.porosityReason || 'Nível de abertura das cutículas e capacidade de retenção hídrica do fio.'}
                        </p>
                      </div>

                      {/* 4. Espessura do Fio */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-purple-400" /> 4. Espessura do Fio:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 font-bold border border-purple-700/60 text-xs">
                            {getThicknessLabel(detected?.thickness)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.thicknessReason || 'Diâmetro aparente da fibra em relação ao padrão médio.'}
                        </p>
                      </div>

                      {/* 5. Densidade Capilar */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-400" /> 5. Densidade Capilar:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-bold border border-blue-700/60 text-xs">
                            {getDensityLabel(detected?.density)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.densityReason || 'Distribuição folicular e volume aparente no couro cabeludo.'}
                        </p>
                      </div>

                      {/* 6. Estado das Pontas */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-rose-400" /> 6. Estado das Pontas:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-700/60 text-xs">
                            {getEndsLabel(detected?.endsState)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.endsStateReason || 'Condição da extremidade distal, ausência ou presença de bifurcações e fissuras.'}
                        </p>
                      </div>

                      {/* 7. Resistência à Tração */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 7. Resistência à Tração:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-700/60 text-xs">
                            {getTensileLabel(detected?.tensileResistance)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.tensileResistanceReason || 'Comportamento da haste frente a força mecânica de tração e flexão.'}
                        </p>
                      </div>

                      {/* 8. Toque e Aspecto */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-amber-300" /> 8. Toque e Aspecto:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-200 font-bold border border-amber-700/60 text-xs">
                            {getTouchLabel(detected?.touchSensation)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.touchSensationReason || 'Sensação tátil, emoliência e reflexão de brilho na superfície cuticular.'}
                        </p>
                      </div>

                      {/* 9. Frizz & Alinhamento */}
                      <div className="p-3 rounded-xl bg-[#0c1222] border border-[#19233a] space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-indigo-400" /> 9. Frizz & Alinhamento:
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-700/60 text-xs">
                            {getFrizzLabel(detected?.frizzLevel)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed pl-5">
                          {detected?.frizzLevelReason || 'Grau de dispersão dos fios na haste e sensibilidade à umidade relativa do ar.'}
                        </p>
                      </div>
                    </div>

                    {/* Narrative Clinical & Protocol Blocks */}
                    <div className="border-t border-[#1b253b] pt-4 space-y-3">
                      {/* Visagism & Cut */}
                      <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-purple-500/20 space-y-1">
                        <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Scissors className="w-3.5 h-3.5 text-purple-400" /> Harmonização Visagista & Recomendação de Corte:
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {existingAnalysis.visagismRecommendation}
                        </p>
                      </div>

                      {/* Cosmetic Protocol */}
                      <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-emerald-500/20 space-y-1">
                        <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" /> Protocolo Cosmético Prioritário na Bancada:
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {existingAnalysis.cosmeticProtocolRecommendation}
                        </p>
                      </div>

                      {/* General Technical Summary */}
                      <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-slate-700/40 space-y-1">
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#f72585]" /> Conclusão & Parecer Técnico Geral:
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{existingAnalysis.summary}"
                        </p>
                      </div>
                    </div>

                    {/* Toggle Raw Text Format View */}
                    <div className="pt-2 border-t border-[#1b253b]">
                      <button
                        type="button"
                        onClick={() => setShowRawText(!showRawText)}
                        className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#f72585]" />
                        <span>{showRawText ? 'Ocultar Texto Puro para Cópia' : 'Exibir Laudo em Texto Puro (Formatado para WhatsApp / Ficha)'}</span>
                      </button>

                      {showRawText && (
                        <div className="mt-3 p-3 rounded-xl bg-black border border-[#1b253b] space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono">Texto formatado para envio ou cópia rápida:</span>
                            <button
                              type="button"
                              onClick={handleCopyTextReport}
                              className="text-[11px] font-bold text-[#f72585] hover:text-[#ff66b2] cursor-pointer flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copiar Tudo
                            </button>
                          </div>
                          <textarea
                            readOnly
                            rows={14}
                            value={generateTextReport()}
                            className="w-full p-2.5 rounded-lg bg-[#070b14] border border-[#1b2438] text-[11px] font-mono text-slate-300 leading-relaxed resize-none focus:outline-hidden select-all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: MODO CARTÕES */}
          {viewMode === 'cards' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top Overview: Photo Preview + Key Visagism Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Captured Photo Thumbnail */}
            {selectedImage && (
              <div className="relative rounded-xl overflow-hidden border border-[#1f283d] bg-black max-h-52 flex items-center justify-center group">
                <img
                  src={selectedImage}
                  alt="Foto da Cliente"
                  className="w-full h-full object-cover max-h-52"
                />
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/75 backdrop-blur-xs rounded-lg text-[10px] text-slate-300 text-center border border-white/10">
                  Foto processada por Machine Learning
                </div>
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className={`space-y-3 ${selectedImage ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Face Shape Badge */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#121829] to-[#0a0e1c] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5" /> Formato Facial (Visagismo)
                  </div>
                  <div className="text-base font-extrabold text-white mt-1">
                    {existingAnalysis.faceShape}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {existingAnalysis.facialFeatures}
                  </p>
                </div>

                {/* Detected Curvature Badge */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#121829] to-[#0a0e1c] border border-[#f72585]/30 shadow-[0_0_15px_rgba(247,37,133,0.1)]">
                  <div className="text-[11px] font-bold text-[#f72585] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Curvatura Estimada
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xl font-black text-white tracking-wide">
                      {detected?.curvature || existingAnalysis.hairCurvatureDetected || '2B'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#f72585]/20 text-[#ff66b2] font-semibold border border-[#f72585]/40">
                      Tabela Internacional
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {detected?.curvatureReason || existingAnalysis.apparentHairCondition}
                  </div>
                </div>
              </div>

              {/* Apparent Condition summary */}
              <div className="p-3.5 rounded-xl bg-[#060913] border border-[#1b2338]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" /> Condição Geral Observada na Fibra
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  {existingAnalysis.apparentHairCondition}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PAINEL DAS 9 ETAPAS CLASSIFICADAS POR MACHINE LEARNING         */}
          {/* ============================================================== */}
          {detected && (
            <div className="bg-[#080d1a] rounded-2xl border-2 border-[#f72585]/40 p-4 sm:p-6 shadow-[0_0_25px_rgba(247,37,133,0.18)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f283d] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-[#f72585] animate-ping" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#f72585]" /> Leitura das 9 Etapas Capilares (Machine Learning)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Todas as 9 etapas avaliativas foram lidas e diagnosticadas a partir da imagem.
                  </p>
                </div>

                {/* Primary Action Button: Apply All */}
                <button
                  type="button"
                  onClick={handleApplyAll}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                    appliedAll
                      ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-gradient-to-r from-[#e01e84] to-[#f72585] hover:brightness-110 text-white shadow-[0_0_15px_rgba(247,37,133,0.4)] active:scale-95'
                  }`}
                >
                  {appliedAll ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Todas as 9 Etapas Aplicadas
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Aplicar Todas as 9 Etapas na Avaliação
                    </>
                  )}
                </button>
              </div>

              {/* 9 Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Curvatura */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#f72585]" /> 1. Curvatura
                      </span>
                      <span className="text-xs font-extrabold text-[#f72585] bg-[#f72585]/15 px-2 py-0.5 rounded border border-[#f72585]/30">
                        {detected.curvature}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.curvatureReason || 'Classificado conforme Tabela Internacional.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('curvature', detected.curvature)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentCurvature === detected.curvature
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentCurvature === detected.curvature ? '✓ Aplicado' : 'Aplicar Curvatura'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 2. Teste de Elasticidade */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-[#f72585]" /> 2. Elasticidade
                      </span>
                      <span className="text-xs font-extrabold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        {getElasticityLabel(detected.elasticity)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.elasticityReason || 'Comportamento elástico e resistência cortical identificados.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('elasticity', detected.elasticity)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.elasticity === detected.elasticity
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.elasticity === detected.elasticity ? '✓ Aplicado' : 'Aplicar Elasticidade'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 3. Teste de Porosidade */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#f72585]" /> 3. Porosidade
                      </span>
                      <span className="text-xs font-extrabold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        {getPorosityLabel(detected.porosity)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.porosityReason || 'Abertura cuticular e dispersão de luz estimadas.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('porosity', detected.porosity)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.porosity === detected.porosity
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.porosity === detected.porosity ? '✓ Aplicado' : 'Aplicar Porosidade'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 4. Espessura do Fio */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#f72585]" /> 4. Espessura
                      </span>
                      <span className="text-xs font-extrabold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                        {getThicknessLabel(detected.thickness)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.thicknessReason || 'Calibre aparente da fibra em relação ao padrão médio.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('thickness', detected.thickness)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.thickness === detected.thickness
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.thickness === detected.thickness ? '✓ Aplicado' : 'Aplicar Espessura'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 5. Densidade Capilar */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#f72585]" /> 5. Densidade
                      </span>
                      <span className="text-xs font-extrabold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                        {getDensityLabel(detected.density)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.densityReason || 'Volume aparente e cobertura por cm² identificados.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('density', detected.density)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.density === detected.density
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.density === detected.density ? '✓ Aplicado' : 'Aplicar Densidade'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 6. Estado das Pontas */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Scissors className="w-3.5 h-3.5 text-[#f72585]" /> 6. Estado das Pontas
                      </span>
                      <span className="text-xs font-extrabold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                        {getEndsLabel(detected.endsState)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.endsStateReason || 'Grau de coesão e preservação das extremidades distais.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('endsState', detected.endsState)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.endsState === detected.endsState
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.endsState === detected.endsState ? '✓ Aplicado' : 'Aplicar Pontas'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 7. Resistência à Tração */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-[#f72585]" /> 7. Tração Mecânica
                      </span>
                      <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        {getTensileLabel(detected.tensileResistance)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.tensileResistanceReason || 'Integridade estrutural e resistência à quebra.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('tensileResistance', detected.tensileResistance)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.tensileResistance === detected.tensileResistance
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.tensileResistance === detected.tensileResistance ? '✓ Aplicado' : 'Aplicar Tração'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 8. Toque e Aspecto */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#f72585]" /> 8. Toque & Aspecto
                      </span>
                      <span className="text-xs font-extrabold text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        {getTouchLabel(detected.touchSensation)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.touchSensationReason || 'Sensação tátil e reflexo de brilho estimados.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('touchSensation', detected.touchSensation)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.touchSensation === detected.touchSensation
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.touchSensation === detected.touchSensation ? '✓ Aplicado' : 'Aplicar Toque'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* 9. Frizz & Alinhamento */}
                <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1e2a42] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-[#f72585]" /> 9. Frizz & Alinhamento
                      </span>
                      <span className="text-xs font-extrabold text-purple-200 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                        {getFrizzLabel(detected.frizzLevel)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {detected.frizzLevelReason || 'Dispersão cuticular e sensibilidade à umidade.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplySingle('frizzLevel', detected.frizzLevel)}
                    className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      currentVisualData?.frizzLevel === detected.frizzLevel
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#151c30] hover:bg-[#1c2642] border-[#253250] text-slate-200'
                    }`}
                  >
                    <span>{currentVisualData?.frizzLevel === detected.frizzLevel ? '✓ Aplicado' : 'Aplicar Frizz'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Deep Visagism & Protocol Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visagism & Cut Recommendation */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#121829] to-[#0a0e1c] border border-[#232e48] space-y-2">
              <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-400" /> Harmonização Visagista & Corte
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {existingAnalysis.visagismRecommendation}
              </p>
            </div>

            {/* Cosmetic Salon Protocol Recommendation */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#121829] to-[#0a0e1c] border border-[#232e48] space-y-2">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Protocolo Cosmético Prioritário
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {existingAnalysis.cosmeticProtocolRecommendation}
              </p>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="p-4 rounded-xl bg-[#060913] border border-[#1f283d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f72585]" /> Parecer Técnico Integrado
              </span>
              <p className="text-xs text-slate-200 font-medium italic">
                "{existingAnalysis.summary}"
              </p>
            </div>

            {onAppendNotes && (
              <button
                type="button"
                onClick={handleAppendObservations}
                disabled={appliedNotes}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  appliedNotes
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#1a2236] hover:bg-[#25304a] border-[#2f3d5c] text-white hover:border-[#f72585]'
                }`}
              >
                {appliedNotes ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Parecer Inserido
                  </>
                ) : (
                  <>
                    Inserir nas Observações <ChevronRight className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )}
    </div>
  );
};
