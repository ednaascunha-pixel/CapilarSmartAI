import React, { useState } from 'react';
import {
  X,
  Settings,
  Sparkles,
  Building2,
  Phone,
  Instagram,
  Clock,
  ShieldCheck,
  Download,
  RotateCcw,
  Check,
  FileText,
} from 'lucide-react';
import { SalonSettings } from '../../types';

interface ModalConfiguracoesProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SalonSettings;
  onSaveSettings: (settings: SalonSettings) => void;
  onExportBackup: () => void;
  onResetData: () => void;
}

export const ModalConfiguracoes: React.FC<ModalConfiguracoesProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportBackup,
  onResetData,
}) => {
  const [form, setForm] = useState<SalonSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#1b2338] flex items-center justify-between bg-gradient-to-r from-[#11172a] via-[#0c101d] to-[#0c101d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f72585]/10 border border-[#f72585]/30 flex items-center justify-center text-[#f72585] shadow-[0_0_10px_rgba(247,37,133,0.2)]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f72585]/10 text-[#f72585] text-[10px] font-bold tracking-wider uppercase mb-1 border border-[#f72585]/30 shadow-[0_0_8px_rgba(247,37,133,0.15)]">
                <Sparkles className="w-3 h-3" /> CAPILAR SMART IA • Sistema
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Configurações do Salão & Diretrizes
              </h2>
              <p className="text-xs text-slate-400">
                Personalize o nome do seu espaço, contatos do profissional e padrões de atendimento.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#151c2e] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Dados do Salão */}
          <div className="bg-[#060913] p-4 sm:p-5 rounded-2xl border border-[#1a2338] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#f72585]" /> Identificação do Espaço de Beleza
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome do Salão / Espaço *</label>
                <input
                  required
                  type="text"
                  value={form.salonName}
                  onChange={(e) => setForm({ ...form, salonName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Cabeleireiro(a) Responsável *</label>
                <input
                  required
                  type="text"
                  value={form.professionalName}
                  onChange={(e) => setForm({ ...form, professionalName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#f72585]" /> WhatsApp do Atendimento
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Instagram className="w-3 h-3 text-[#f72585]" /> Instagram Profissional
                </label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585]"
                />
              </div>
            </div>
          </div>

          {/* Parâmetros do Atendimento */}
          <div className="bg-[#060913] p-4 sm:p-5 rounded-2xl border border-[#1a2338] space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f72585]" /> Parâmetros de Bancada
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tempo Padrão de Pausa (minutos)</label>
                <select
                  value={form.defaultPauseTime}
                  onChange={(e) => setForm({ ...form, defaultPauseTime: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585]"
                >
                  <option value={10}>10 minutos (Express)</option>
                  <option value={15}>15 minutos (Padrão de Máscara)</option>
                  <option value={20}>20 minutos (Tratamento Intensivo)</option>
                  <option value={30}>30 minutos (Reconstrução Complexa)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enableSenacBadge}
                    onChange={(e) => setForm({ ...form, enableSenacBadge: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f72585]"></div>
                </label>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Exibir Selo SENAC Projeto Integrador</p>
                  <p className="text-[11px] text-slate-400">Mantém o carimbo acadêmico-profissional visível no cabeçalho.</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-slate-300">Mensagem de Rodapé da Ficha da Cliente</label>
              <textarea
                rows={2}
                value={form.customNotes}
                onChange={(e) => setForm({ ...form, customNotes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0c101d] border border-[#1f283d] text-xs text-white focus:outline-none focus:border-[#f72585]"
              />
            </div>
          </div>

          {/* Backup e Gestão de Dados */}
          <div className="bg-[#060913] p-4 sm:p-5 rounded-2xl border border-[#1a2338] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#f72585]" /> Gerenciamento de Prontuários & Segurança
            </h3>
            <p className="text-xs text-slate-400">
              Todas as avaliações e clientes são salvas no armazenamento seguro do seu navegador.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] border border-[#232f48] text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#f72585]" />
                <span>Exportar Backup (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={onResetData}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 text-xs text-rose-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Dados de Exemplo</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#182136]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] text-xs text-slate-300 transition-colors cursor-pointer border border-[#222d46]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-xs shadow-[0_0_15px_rgba(247,37,133,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-[#ff66b2]/40"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Salvo com Sucesso!
                </>
              ) : (
                'Salvar Configurações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
