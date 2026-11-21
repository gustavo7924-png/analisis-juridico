import React from 'react';

export type ActiveTab = 'wizard' | 'matrix' | 'products' | 'consultation' | 'history';

interface TopBarProps {
  activeTab: ActiveTab;
  hasAudit: boolean;
  historyCount: number;
  onSelectTab: (tab: ActiveTab) => void;
  onPrimaryAction: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  hasAudit,
  historyCount,
  onSelectTab,
  onPrimaryAction,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-[#E5E0D5] bg-[#FBF9F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        {/* Zona 1: Marca editorial única */}
        <button
          type="button"
          onClick={() => onSelectTab('wizard')}
          className="font-editorial cursor-pointer text-xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3A8A]"
        >
          LexMatríz Colombia
        </button>

        {/* Zona 2: Enlaces de navegación de una sola línea (5 enlaces) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#57534E]">
          <button
            type="button"
            onClick={() => onSelectTab('wizard')}
            className={`cursor-pointer py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'wizard'
                ? 'border-[#1E3A8A] text-[#1C1917]'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            Diagnóstico
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('matrix')}
            disabled={!hasAudit}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              !hasAudit
                ? 'cursor-not-allowed border-transparent text-[#A8A29E]'
                : activeTab === 'matrix'
                ? 'cursor-pointer border-[#1E3A8A] text-[#1C1917]'
                : 'cursor-pointer border-transparent hover:text-[#1C1917]'
            }`}
          >
            Matriz Legal
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('products')}
            disabled={!hasAudit}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              !hasAudit
                ? 'cursor-not-allowed border-transparent text-[#A8A29E]'
                : activeTab === 'products'
                ? 'cursor-pointer border-[#1E3A8A] text-[#1C1917]'
                : 'cursor-pointer border-transparent hover:text-[#1C1917]'
            }`}
          >
            Productos y Servicios
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('consultation')}
            disabled={!hasAudit}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              !hasAudit
                ? 'cursor-not-allowed border-transparent text-[#A8A29E]'
                : activeTab === 'consultation'
                ? 'cursor-pointer border-[#1E3A8A] text-[#1C1917]'
                : 'cursor-pointer border-transparent hover:text-[#1C1917]'
            }`}
          >
            Consulta Específica
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`cursor-pointer py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'history'
                ? 'border-[#1E3A8A] text-[#1C1917]'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            Historial ({historyCount})
          </button>
        </nav>

        {/* Zona 3: Acción primaria única */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="cursor-pointer rounded-md bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
          >
            {hasAudit && activeTab !== 'wizard' ? 'Imprimir / PDF' : 'Nueva Auditoría'}
          </button>
        </div>
      </div>

      {/* Navegación móvil compacta */}
      <div className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-[#E5E0D5] px-6 py-2 text-xs font-medium text-[#57534E]">
        <button
          type="button"
          onClick={() => onSelectTab('wizard')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'wizard' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          Diagnóstico
        </button>
        <button
          type="button"
          disabled={!hasAudit}
          onClick={() => onSelectTab('matrix')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            !hasAudit ? 'text-[#A8A29E]' : activeTab === 'matrix' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          Matriz Legal
        </button>
        <button
          type="button"
          disabled={!hasAudit}
          onClick={() => onSelectTab('products')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            !hasAudit ? 'text-[#A8A29E]' : activeTab === 'products' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          Productos y Servicios
        </button>
        <button
          type="button"
          disabled={!hasAudit}
          onClick={() => onSelectTab('consultation')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            !hasAudit
              ? 'text-[#A8A29E]'
              : activeTab === 'consultation'
              ? 'text-[#1E3A8A] font-semibold'
              : ''
          }`}
        >
          Consulta Específica
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('history')}
          className={`whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'history' ? 'text-[#1E3A8A] font-semibold' : ''
          }`}
        >
          Historial ({historyCount})
        </button>
      </div>
    </header>
  );
};
