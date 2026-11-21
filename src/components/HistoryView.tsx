import React from 'react';
import { Download, FileSpreadsheet, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { SavedAuditRecord } from '../types';
import {
  buildAuditCsv,
  buildAuditMarkdown,
  buildSafeSlug,
  downloadTextFile,
} from '../utils/export';

interface HistoryViewProps {
  records: SavedAuditRecord[];
  activeAuditId: string | null;
  onOpenRecord: (record: SavedAuditRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNewAudit: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  activeAuditId,
  onOpenRecord,
  onDeleteRecord,
  onNewAudit,
}) => {
  return (
    <div className="mx-auto max-w-[1040px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D5] pb-5">
        <div>
          <h1 className="font-editorial text-3xl font-semibold text-[#1C1917]">
            Historial Local de Auditorías
          </h1>
          <p className="mt-1.5 text-sm text-[#57534E]">
            Los dictámenes se conservan únicamente en el almacenamiento local de este navegador.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewAudit}
          className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva auditoría</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="rounded-md border border-[#E5E0D5] bg-white p-12 text-center">
          <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
            Aún no hay auditorías guardadas
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#57534E]">
            Completa el asistente de perfilamiento empresarial para generar tu primera Matriz de
            Requisitos Legales y Alertas Críticas.
          </p>
          <button
            type="button"
            onClick={onNewAudit}
            className="cursor-pointer mt-5 rounded-md bg-[#1E3A8A] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#172554]"
          >
            Iniciar primer diagnóstico
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#E5E0D5] rounded-md border border-[#E5E0D5] bg-white">
          {records.map((record) => {
            const title =
              record.profile.razonSocial.trim() ||
              `${record.profile.tipoOrganizacion} · ${record.profile.municipio || 'Colombia'}`;
            const dateStr = new Date(record.createdAt).toLocaleString('es-CO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const totalRows = record.result.areas.reduce((sum, a) => sum + a.filas.length, 0);
            const isCurrent = record.id === activeAuditId;

            return (
              <div
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-[#FBF9F5]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C] tabular-nums">
                    <span>{dateStr}</span>
                    <span aria-hidden="true">·</span>
                    <span>{record.profile.tipoOrganizacion}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">
                      CIIU {record.profile.ciiu || 'No especificado'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{totalRows} obligaciones</span>
                    {isCurrent && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#1E3A8A]">Expediente abierto</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-editorial mt-1.5 text-lg font-semibold text-[#1C1917] truncate">
                    {title}
                  </h2>
                  <p className="mt-1 text-xs text-[#57534E] line-clamp-1">
                    {record.result.resumenEjecutivo}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenRecord(record)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3 py-2 text-xs font-medium text-[#1C1917] hover:border-[#1E3A8A] hover:text-[#1E3A8A] whitespace-nowrap shrink-0"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>Abrir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTextFile(
                        `matriz-legal-${buildSafeSlug(record)}.csv`,
                        buildAuditCsv(record.profile, record.result),
                        'text/csv;charset=utf-8'
                      )
                    }
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
                    title="Exportar tabla a CSV para Excel"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTextFile(
                        `matriz-legal-${buildSafeSlug(record)}.md`,
                        buildAuditMarkdown(record.profile, record.result),
                        'text/markdown;charset=utf-8'
                      )
                    }
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
                    title="Descargar Markdown"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>.MD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(record.id)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#E5E0D5] bg-white px-3 py-2 text-xs font-medium text-[#991B1B] hover:border-[#FCA5A5] hover:bg-[#FEF2F2] whitespace-nowrap shrink-0"
                    title="Eliminar del historial"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
