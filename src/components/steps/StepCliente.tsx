import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  UserCheck,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Phone,
  Edit3,
  History,
  Archive,
  ArchiveRestore,
  Trash2,
  FileText,
  Check,
} from 'lucide-react';
import { ClientData, FullEvaluationRecord } from '../../types';
import { ModalConfirmacao } from '../modals/ModalConfirmacao';

interface StepClienteProps {
  clients: ClientData[];
  evaluations: FullEvaluationRecord[];
  selectedClient: ClientData | null;
  onSelectClient: (client: ClientData) => void;
  onEditClient: (client: ClientData) => void;
  onViewHistory: (client: ClientData) => void;
  onToggleArchive: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onGoToCadastro: () => void;
  onContinue: () => void;
}

export const StepCliente: React.FC<StepClienteProps> = ({
  clients,
  evaluations,
  selectedClient,
  onSelectClient,
  onEditClient,
  onViewHistory,
  onToggleArchive,
  onDeleteClient,
  onGoToCadastro,
  onContinue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ATIVAS' | 'ARQUIVADAS' | 'TODAS'>('ATIVAS');

  // Deletion state
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.hairGoal && c.hairGoal.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'ATIVAS') return !c.archived;
    if (activeTab === 'ARQUIVADAS') return Boolean(c.archived);
    return true; // TODAS
  });

  const activeCount = clients.filter((c) => !c.archived).length;
  const archivedCount = clients.filter((c) => Boolean(c.archived)).length;

  const getClientEvalCount = (clientId: string) => {
    return evaluations.filter((e) => e.clientId === clientId).length;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Salon Bench Welcome */}
      <div className="bg-gradient-to-r from-[#121626] via-[#0d111d] to-[#070a14] rounded-2xl border border-[#1e273d] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#f72585]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f72585]/10 border border-[#f72585]/30 text-[#f72585] text-xs font-semibold uppercase tracking-wider mb-3 shadow-[0_0_10px_rgba(247,37,133,0.15)]">
            <Sparkles className="w-3.5 h-3.5" /> Etapa 1 • Gerenciamento de Clientes & Atendimento
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gerenciamento de Cadastros
          </h2>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Selecione uma cliente para iniciar o atendimento técnico na bancada ou gerencie os cadastros (editar, acessar prontuário, arquivar ou excluir).
          </p>
        </div>

        {/* Disclaimer highlight according to user mandate */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 bg-[#070b14]/80 border border-[#1d2740] px-3.5 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#f72585] flex-shrink-0" />
          <span>
            <strong className="text-white">Diretriz Profissional:</strong> Ferramenta cosmética e capilar para cabeleireiros. Não realiza diagnóstico médico ou dermatológico.
          </span>
        </div>
      </div>

      {/* Action Bar: Search, Filter Tabs & New Client */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="client-search-input"
            type="text"
            placeholder="Buscar cliente por nome, telefone ou objetivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c101d] border border-[#1d2740] text-base sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#f72585] focus:ring-1 focus:ring-[#f72585] transition-all min-h-[48px]"
          />
        </div>

        {/* Status Tabs: Ativas, Arquivadas, Todas */}
        <div className="flex bg-[#0c101d] p-1 rounded-xl border border-[#1d2740] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ATIVAS')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ATIVAS'
                ? 'bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white shadow-[0_0_10px_rgba(247,37,133,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Ativas ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ARQUIVADAS')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ARQUIVADAS'
                ? 'bg-[#1e273d] text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-400" />
            <span>Arquivadas ({archivedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TODAS')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'TODAS'
                ? 'bg-[#151c2e] text-white border border-[#263554]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Todas ({clients.length})</span>
          </button>
        </div>

        {/* New Client Button */}
        <button
          id="btn-new-client-trigger"
          onClick={onGoToCadastro}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#111728] hover:bg-[#182138] border border-[#233152] text-slate-100 text-sm font-semibold transition-all shadow-md active:scale-98 cursor-pointer w-full sm:w-auto min-h-[48px] hover:border-[#f72585]/40 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4 text-[#f72585]" />
          <span>Cadastrar Nova Cliente</span>
        </button>
      </div>

      {/* Clients Grid: 1 col on mobile, 2 cols on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredClients.map((client) => {
          const isSelected = selectedClient?.id === client.id;
          const evalCount = getClientEvalCount(client.id);

          return (
            <div
              key={client.id}
              id={`client-card-${client.id}`}
              className={`p-4 sm:p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#141b2e] to-[#0c101d] border-[#f72585] shadow-[0_0_18px_rgba(247,37,133,0.25)] ring-1 ring-[#f72585]'
                  : 'bg-[#0c101d] border-[#1b243b] hover:border-[#f72585]/40 hover:bg-[#101526]'
              }`}
            >
              <div>
                {/* Card Top: Avatar, Name, Phone & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => onSelectClient(client)}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#e01e84] to-[#f72585] text-white shadow-[0_0_10px_rgba(247,37,133,0.4)]'
                          : client.archived
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-[#151c2e] text-[#f72585] border border-[#232f4a]'
                      }`}
                    >
                      {client.name.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm sm:text-base leading-tight truncate">
                          {client.name}
                        </h3>
                        {client.archived && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.2 rounded-full flex-shrink-0">
                            Arquivada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{client.phone || 'Sem telefone'}</span>
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#f72585] bg-[#f72585]/10 px-2 py-0.5 rounded-full border border-[#f72585]/30 flex-shrink-0">
                      <UserCheck className="w-3 h-3" /> Ativa
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div
                  onClick={() => onSelectClient(client)}
                  className="mt-3.5 pt-3 border-t border-[#182136] space-y-1.5 cursor-pointer"
                >
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400">Objetivo: </span>
                    <span className="font-medium text-slate-200 line-clamp-2">
                      {client.hairGoal || 'Avaliação capilar geral'}
                    </span>
                  </div>

                  {client.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1">
                      Obs: {client.notes}
                    </p>
                  )}

                  {/* Evaluations Badge */}
                  <div className="pt-1 flex items-center gap-1.5 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-[#f72585]" />
                    <span className="font-medium text-slate-300">
                      {evalCount > 0 ? (
                        <strong className="text-white">{evalCount} {evalCount === 1 ? 'avaliação salva' : 'avaliações salvas'}</strong>
                      ) : (
                        <span className="text-slate-500">Sem avaliações no histórico</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar on Card */}
              <div className="mt-4 pt-3 border-t border-[#182136] flex flex-col gap-2.5">
                {/* Secondary row: Actions (Editar, Histórico, Arquivar, Excluir) */}
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClient(client);
                    }}
                    title="Editar dados da cliente"
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#141b2e] hover:bg-[#1b2540] border border-[#202c48] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#f72585]" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewHistory(client);
                    }}
                    title="Ver prontuário e histórico de avaliações"
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-[#141b2e] hover:bg-[#1b2540] border border-[#202c48] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Histórico</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(client.id);
                    }}
                    title={client.archived ? 'Restaurar / Desarquivar cliente' : 'Arquivar cliente'}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      client.archived
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                        : 'bg-[#141b2e] hover:bg-[#1b2540] border-[#202c48] text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    {client.archived ? (
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClientToDelete(client);
                    }}
                    title="Excluir cadastro e avaliações"
                    className="p-2 rounded-lg bg-[#1a0f16] hover:bg-[#281320] border border-red-500/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary select trigger */}
                <button
                  type="button"
                  onClick={() => onSelectClient(client)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#f72585]/15 text-[#f72585] border border-[#f72585]/40'
                      : 'bg-[#090d18] text-slate-300 hover:text-white hover:bg-[#141b2e] border border-[#1e273d]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selecionada para Consulta</span>
                    </>
                  ) : (
                    <span>Selecionar p/ Consulta</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-12 px-4 rounded-2xl bg-[#0c101d] border border-[#1b243b]">
            <p className="text-slate-300 font-medium">
              Nenhuma cliente encontrada em "{activeTab.toLowerCase()}" com o filtro aplicado.
            </p>
            <p className="text-xs text-slate-400 mt-1">Deseja cadastrar uma nova cliente agora?</p>
            <button
              onClick={onGoToCadastro}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-semibold text-xs min-h-[44px] shadow-[0_0_15px_rgba(247,37,133,0.3)] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Cadastrar Cliente
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom / Continue Bar */}
      {selectedClient && (
        <div className="sticky bottom-3 sm:bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-[#0c101d]/95 backdrop-blur-md border border-[#f72585]/40 shadow-[0_0_25px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f72585]/20 text-[#f72585] flex items-center justify-center font-bold flex-shrink-0">
              {selectedClient.name.charAt(0) || 'C'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-slate-400">Cliente Selecionada para Consulta:</p>
              <p className="text-xs sm:text-sm font-semibold text-white truncate">{selectedClient.name} • {selectedClient.phone || 'Sem fone'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEditClient(selectedClient)}
              className="px-4 py-3 rounded-xl bg-[#141b2e] hover:bg-[#1a233c] border border-[#232f4a] text-xs font-semibold text-slate-200 transition-colors cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-[#f72585]" />
              <span>Editar Cadastro</span>
            </button>

            <button
              id="btn-continue-to-cadastro"
              onClick={onContinue}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#e01e84] to-[#f72585] text-white font-bold text-sm shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[48px] border border-[#ff66b2]/40"
            >
              <span>Prosseguir para Anamnese</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Client Deletion */}
      <ModalConfirmacao
        isOpen={Boolean(clientToDelete)}
        title="Excluir Cadastro da Cliente?"
        description={`Tem certeza que deseja excluir permanentemente o cadastro de ${clientToDelete?.name}?`}
        details={
          clientToDelete
            ? `Esta ação é irreversível. O cadastro e todas as suas ${getClientEvalCount(clientToDelete.id)} avaliações vinculadas serão permanentemente removidos da base de dados e do histórico.`
            : undefined
        }
        confirmText="Sim, Excluir Cadastro e Avaliações"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={() => {
          if (clientToDelete) {
            onDeleteClient(clientToDelete.id);
            setClientToDelete(null);
          }
        }}
        onClose={() => setClientToDelete(null)}
      />
    </div>
  );
};
