import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  title: string;
  description: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  isOpen,
  title,
  description,
  details,
  confirmText = 'Confirmar Exclusão',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0c101d] rounded-2xl border border-[#261824] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header with Danger Accent */}
        <div className="p-5 border-b border-[#231520] flex items-start justify-between bg-gradient-to-r from-[#1c0e18] to-[#0c101d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)] flex-shrink-0">
              {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold tracking-wider uppercase mb-1 border border-red-500/25">
                <ShieldAlert className="w-3 h-3" /> Confirmação de Segurança
              </div>
              <h3 className="text-base font-bold text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            {description}
          </p>

          {details && (
            <div className="p-3 rounded-xl bg-[#140b12] border border-red-500/20 text-[11px] text-red-300/90 leading-relaxed">
              <strong>Atenção:</strong> {details}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1e1520] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 bg-[#090d18]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1c2640] border border-[#24304c] text-slate-300 text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
