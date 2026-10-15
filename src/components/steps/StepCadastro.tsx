import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Sparkles, ArrowRight, ArrowLeft, Check, HeartHandshake, History, Edit3 } from 'lucide-react';
import { ClientData } from '../../types';

interface StepCadastroProps {
  currentClient: ClientData | null;
  onSaveClient: (client: ClientData) => void;
  onBack: () => void;
  onContinue: () => void;
  onViewHistory?: (client: ClientData) => void;
}

const COMMON_GOALS = [
  'Recuperação de descoloração / loiro danificado',
  'Definição de cachos e controle de ressecamento',
  'Interromper quebra e efeito emborrachado',
  'Manutenção pós-progressiva ou química de alisamento',
  'Eliminar frizz e devolver brilho espelhado',
  'Fortalecimento e reposição de massa capilar',
];

export const StepCadastro: React.FC<StepCadastroProps> = ({
  currentClient,
  onSaveClient,
  onBack,
  onContinue,
  onViewHistory,
}) => {
  const isEditing = Boolean(currentClient && currentClient.name.trim().length > 0);

  const [formData, setFormData] = useState<ClientData>({
    id: currentClient?.id || `client-${Date.now()}`,
    name: currentClient?.name || '',
    phone: currentClient?.phone || '',
    email: currentClient?.email || '',
    age: currentClient?.age || '',
    hairGoal: currentClient?.hairGoal || '',
    notes: currentClient?.notes || '',
    archived: currentClient?.archived || false,
    createdAt: currentClient?.createdAt || new Date().toISOString(),
  });

  useEffect(() => {
    if (currentClient) {
      setFormData(currentClient);
    }
  }, [currentClient]);

  const [hasSaved, setHasSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Por favor, informe o nome completo da cliente para prosseguir.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Por favor, informe o telefone/WhatsApp de contato da cliente.');
      return;
    }

    setErrorMessage(null);
    onSaveClient(formData);
    setHasSaved(true);
    setTimeout(() => {
      onContinue();
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#0c101d] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-2 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
              <User className="w-3.5 h-3.5" /> Etapa 2 • {isEditing ? 'Edição de Cadastro' : 'Novo Cadastro da Cliente'}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isEditing ? `Editar Cadastro de ${currentClient?.name}` : 'Dados Pessoais & Queixa Principal'}
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {isEditing
                ? 'Atualize os dados da cliente. Todas as avaliações já vinculadas a este cadastro serão preservadas.'
                : 'Registre as informações de contato e a demanda inicial que a cliente trouxe para a bancada do salão.'}
            </p>
          </div>

          {isEditing && onViewHistory && currentClient && (
            <button
              type="button"
              onClick={() => onViewHistory(currentClient)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#1b2540] border border-[#202c48] text-slate-200 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>Ver Histórico Desta Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0c101d] rounded-2xl border border-[#1a2236] p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#f72585]" /> Nome Completo *
              </label>
              <input
                id="input-client-name"
                required
                type="text"
                placeholder="Ex: Mariana Silveira"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-[#1f283d] text-slate-100 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585] min-h-[48px]"
              />
            </div>

            {/* Telefone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#f72585]" /> Telefone / WhatsApp *
              </label>
              <input
                id="input-client-phone"
                required
                type="tel"
                placeholder="Ex: (11) 98765-4321"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-[#1f283d] text-slate-100 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585] min-h-[48px]"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> E-mail (opcional)
              </label>
              <input
                id="input-client-email"
                type="email"
                placeholder="Ex: cliente@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-[#1f283d] text-slate-100 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585] min-h-[48px]"
              />
            </div>

            {/* Idade */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Idade
              </label>
              <input
                id="input-client-age"
                type="number"
                min="5"
                max="120"
                placeholder="Ex: 28"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-[#1f283d] text-slate-100 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585] min-h-[48px]"
              />
            </div>
          </div>

          {/* Queixa Principal / Objetivo Capilar */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[#f72585]" /> Queixa Principal ou Objetivo do Tratamento *
            </label>
            <textarea
              id="input-client-goal"
              required
              rows={3}
              placeholder="Descreva o que incomoda a cliente e o resultado desejado no salão..."
              value={formData.hairGoal}
              onChange={(e) => setFormData({ ...formData, hairGoal: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-[#1f283d] text-slate-100 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585]"
            />

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-400 font-medium">Sugestões rápidas para a bancada (toque para preencher):</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setFormData({ ...formData, hairGoal: goal })}
                    className="text-xs px-3.5 py-2 rounded-xl bg-[#111728] hover:bg-[#192238] text-slate-300 border border-[#202b44] hover:border-[#f72585]/40 transition-colors cursor-pointer text-left min-h-[40px] flex items-center"
                  >
                    + {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Observações Adicionais */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-300">
              Observações Adicionais do Cabeleireiro (opcional)
            </label>
            <input
              id="input-client-notes"
              type="text"
              placeholder="Ex: Cliente tem evento em 15 dias; prefere produtos sem fragrância forte..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#060913] border border-[#1f283d] text-slate-100 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585] min-h-[48px]"
            />
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Buttons Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-[#0c101d] hover:bg-[#13192c] border border-[#1f283d] text-slate-300 text-sm font-semibold transition-colors cursor-pointer w-full sm:w-auto min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Clientes</span>
          </button>

          <button
            id="btn-save-and-continue-anamnese"
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer w-full sm:w-auto min-h-[48px] border border-[#ff66b2]/40"
          >
            {hasSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Salvo! Avançando...</span>
              </>
            ) : (
              <>
                <span>{isEditing ? 'Salvar Alterações & Continuar' : 'Salvar & Iniciar Anamnese'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
