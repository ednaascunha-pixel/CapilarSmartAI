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
} from 'lucide-react';
import { FacialHairAnalysisResult, CurvatureType } from '../types';

interface FacialHairScannerProps {
  clientName?: string;
  hairGoal?: string;
  currentCurvature?: CurvatureType;
  existingAnalysis?: FacialHairAnalysisResult;
  existingImage?: string;
  onAnalysisComplete: (result: FacialHairAnalysisResult, imageBase64: string) => void;
  onApplyCurvature?: (curvature: CurvatureType) => void;
  onAppendNotes?: (text: string) => void;
  onClearAnalysis?: () => void;
}

export const FacialHairScanner: React.FC<FacialHairScannerProps> = ({
  clientName,
  hairGoal,
  currentCurvature,
  existingAnalysis,
  existingImage,
  onAnalysisComplete,
  onApplyCurvature,
  onAppendNotes,
  onClearAnalysis,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(existingImage || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appliedCurvature, setAppliedCurvature] = useState<boolean>(false);
  const [appliedNotes, setAppliedNotes] = useState<boolean>(false);

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
    } catch (err: any) {
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
    // Reset file input so same file can be reselected if needed
    e.target.value = '';
  };

  // Trigger server-side multimodal AI analysis
  const triggerAnalysis = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAppliedCurvature(false);
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
    } catch (err: any) {
      console.error('Erro na análise facial por IA:', err);
      setErrorMsg('Não foi possível concluir a leitura automática. Você pode tentar novamente com outra foto.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyCurvature = (curv?: CurvatureType) => {
    if (curv && onApplyCurvature) {
      onApplyCurvature(curv);
      setAppliedCurvature(true);
    }
  };

  const handleAppendObservations = () => {
    if (!existingAnalysis || !onAppendNotes) return;
    const textToAppend = `[Visagismo & IA]: Formato ${existingAnalysis.faceShape}. Harmonização: ${existingAnalysis.visagismRecommendation} Protocolo sugerido: ${existingAnalysis.cosmeticProtocolRecommendation}`;
    onAppendNotes(textToAppend);
    setAppliedNotes(true);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setErrorMsg(null);
    setAppliedCurvature(false);
    setAppliedNotes(false);
    stopCamera();
    if (onClearAnalysis) {
      onClearAnalysis();
    }
  };

  return (
    <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2338] pb-4 mb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#f72585]/15 to-[#7209b7]/15 border border-[#f72585]/30 text-[#f72585] text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(247,37,133,0.2)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Módulo de Visão Computacional & Visagismo
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Leitura Facial & Análise da Fibra por IA
          </h3>
          <p className="text-xs text-slate-300">
            Fotografe o rosto e cabelo da cliente para identificar formato facial, simetria, curvatura sugerida e harmonização de corte.
          </p>
        </div>

        {/* Action badges or reset */}
        {existingAnalysis && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Análise Concluída
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-[#f72585] transition-colors p-1.5 rounded-lg hover:bg-[#1a2236] cursor-pointer"
              title="Nova Análise"
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
              <Camera className="w-4 h-4" /> Capturar Foto
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
                Aciona a câmera do tablet ou webcam com guia visual de enquadramento
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
                JPG ou PNG nítido exibindo rosto e comprimento do cabelo
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
            <h4 className="text-base font-bold text-white">Analisando Imagem com Inteligência Artificial</h4>
            <p className="text-xs text-slate-300 max-w-md mt-1">
              Escaneando formato facial, simetria dos terços, padrão aparente de curvatura da fibra e alinhamento dos fios...
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#f72585] font-semibold bg-[#f72585]/10 px-3 py-1 rounded-full border border-[#f72585]/20">
            <span className="w-2 h-2 rounded-full bg-[#f72585] animate-ping" /> Processamento Multimodal em Andamento
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {existingAnalysis && !isAnalyzing && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Overview: Photo Preview + Key Badges */}
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
                  Foto processada & otimizada
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
                      {existingAnalysis.hairCurvatureDetected || '2B'}
                    </span>
                    {existingAnalysis.hairCurvatureDetected && onApplyCurvature && (
                      <button
                        type="button"
                        onClick={() => handleApplyCurvature(existingAnalysis.hairCurvatureDetected)}
                        disabled={appliedCurvature || currentCurvature === existingAnalysis.hairCurvatureDetected}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          appliedCurvature || currentCurvature === existingAnalysis.hairCurvatureDetected
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#f72585]/20 hover:bg-[#f72585]/30 border-[#f72585]/50 text-white shadow-[0_0_10px_rgba(247,37,133,0.3)]'
                        }`}
                      >
                        {appliedCurvature || currentCurvature === existingAnalysis.hairCurvatureDetected ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Curvatura Aplicada
                          </>
                        ) : (
                          <>
                            Aplicar à Avaliação <ChevronRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Textura aparente: <span className="text-slate-200 font-semibold">{existingAnalysis.hairTextureDetected || 'Média'}</span>
                  </div>
                </div>
              </div>

              {/* Apparent Condition summary */}
              <div className="p-3.5 rounded-xl bg-[#060913] border border-[#1b2338]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" /> Condição Visual & Textura dos Fios
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  {existingAnalysis.apparentHairCondition}
                </p>
              </div>
            </div>
          </div>

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
  );
};
