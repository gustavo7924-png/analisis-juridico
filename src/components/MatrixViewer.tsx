import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Edit3,
  FileSpreadsheet,
  Printer,
  Search,
} from 'lucide-react';
import {
  CompanyProfile,
  FunctionalAreaName,
  LegalAuditResult,
  RiskLevel,
} from '../types';
import {
  buildAuditCsv,
  buildAuditMarkdown,
  buildSafeSlug,
  downloadTextFile,
} from '../utils/export';
import { RiskDistributionChart } from './RiskDistributionChart';

interface MatrixViewerProps {
  profile: CompanyProfile;
  result: LegalAuditResult;
  createdAt: string;
  onEditProfile: () => void;
  onGoToProducts: () => void;
  onGoToConsultation: () => void;
}

const ALL_AREAS = 'Todas las Áreas';

export const MatrixViewer: React.FC<MatrixViewerProps> = ({
  profile,
  result,
  createdAt,
  onEditProfile,
  onGoToProducts,
  onGoToConsultation,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>(ALL_AREAS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedIvc, setSelectedIvc] = useState<string>('TODAS');
  const [selectedRisk, setSelectedRisk] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'table' | 'markdown'>('table');
  const [copiedMd, setCopiedMd] = useState<boolean>(false);

  const ivcOptions = useMemo(() => {
    const set = new Set<string>();
    result.areas.forEach((area) => {
      area.filas.forEach((row) => {
        if (row.entidadVigilanteIVC) {
          set.add(row.entidadVigilanteIVC.trim());
        }
      });
    });
    return Array.from(set).sort();
  }, [result]);

  const filteredAreas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return result.areas
      .filter((area) => selectedArea === ALL_AREAS || area.areaNombre === selectedArea)
      .map((area) => {
        const filas = area.filas.filter((row) => {
          const matchesIvc =
            selectedIvc === 'TODAS' || row.entidadVigilanteIVC.trim() === selectedIvc;
          const matchesRisk =
            selectedRisk === 'TODOS' || row.nivelRiesgo === (selectedRisk as RiskLevel);
          const matchesSearch =
            !term ||
            row.areaProceso.toLowerCase().includes(term) ||
            row.normaAplicable.toLowerCase().includes(term) ||
            row.obligacionEspecifica.toLowerCase().includes(term) ||
            row.entidadVigilanteIVC.toLowerCase().includes(term) ||
            row.riesgoYSancion.toLowerCase().includes(term);
          return matchesIvc && matchesRisk && matchesSearch;
        });
        return { ...area, filas };
      })
      .filter((area) => area.filas.length > 0);
  }, [result, selectedArea, searchTerm, selectedIvc, selectedRisk]);

  const totalObligations = useMemo(
    () => result.areas.reduce((acc, a) => acc + a.filas.length, 0),
    [result]
  );

  const markdownString = useMemo(
    () => buildAuditMarkdown(profile, result),
    [profile, result]
  );

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownString);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      downloadTextFile(
        `matriz-legal-${buildSafeSlug({ profile })}.md`,
        markdownString,
        'text/markdown;charset=utf-8'
      );
    }
  };

  const handleDownloadMarkdown = () => {
    downloadTextFile(
      `matriz-legal-${buildSafeSlug({ profile })}.md`,
      markdownString,
      'text/markdown;charset=utf-8'
    );
  };

  const isFiltered =
    selectedArea !== ALL_AREAS ||
    searchTerm.trim() !== '' ||
    selectedIvc !== 'TODAS' ||
    selectedRisk !== 'TODOS';

  const filteredCount = useMemo(
    () => filteredAreas.reduce((acc, a) => acc + a.filas.length, 0),
    [filteredAreas]
  );

  const handleDownloadCsv = (onlyFiltered = false) => {
    const csv = buildAuditCsv(
      profile,
      result,
      onlyFiltered ? filteredAreas : undefined
    );
    const suffix = onlyFiltered ? '-filtrado' : '';
    downloadTextFile(
      `matriz-legal-${buildSafeSlug({ profile })}${suffix}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const formattedDate = new Date(createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const orgDisplayName =
    profile.razonSocial.trim() || `${profile.tipoOrganizacion} en ${profile.municipio || 'Colombia'}`;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      {/* Cabecera del dictamen y metadatos sin cápsulas */}
      <section className="border-b border-[#E5E0D5] pb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C]">
              <span>Dictamen de Cumplimiento</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.tipoOrganizacion}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                CIIU {profile.ciiu || 'No especificado'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{profile.municipio || 'Municipio no especificado'}</span>
            </div>

            <h1 className="font-editorial mt-2 text-3xl font-semibold text-[#1C1917] sm:text-4xl">
              {orgDisplayName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#57534E] tabular-nums">
              <span>
                Empleados directos: {profile.numeroEmpleados || 'No especificado'}
              </span>
              <span aria-hidden="true">/</span>
              <span>Contratistas: {profile.numeroContratistas || '0'}</span>
              <span aria-hidden="true">/</span>
              <span>Clientes: {profile.tipoCliente}</span>
              <span aria-hidden="true">/</span>
              <span>Obligaciones identificadas: {totalObligations}</span>
            </div>
          </div>

          {/* Barra de acciones de edición y exportación */}
          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onEditProfile}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editar perfil</span>
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
            >
              {copiedMd ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#15803D]" />
                  <span>Markdown copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar MD</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>.MD</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadCsv(false)}
              title="Descargar requisitos normativos de toda la matriz en CSV para Excel"
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#1E3A8A]/40 bg-white px-3.5 py-2 text-xs font-semibold text-[#1E3A8A] transition-colors hover:bg-[#EFF6FF] whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Exportar CSV ({totalObligations})</span>
            </button>
            {isFiltered && (
              <button
                type="button"
                onClick={() => handleDownloadCsv(true)}
                title="Descargar únicamente las filas visibles con los filtros actuales"
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>CSV Filtrado ({filteredCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrintPdf}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-[#1E3A8A] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>PDF / Imprimir</span>
            </button>
          </div>
        </div>

        <p className="mt-5 max-w-4xl text-sm leading-relaxed text-[#292524]">
          {result.resumenEjecutivo}
        </p>
      </section>

      {/* Supuestos y Alertas de Verificación */}
      {result.supuestosYAlertasVerificacion.length > 0 && (
        <section className="mt-8 rounded-md border border-[#FCD34D] bg-[#FFFBEB] p-5 print-break-inside-avoid">
          <h2 className="text-sm font-semibold text-[#92400E]">
            Supuestos Jurídicos y Alertas de Verificación
          </h2>
          <ul className="mt-2.5 space-y-1.5 text-sm text-[#78350F]">
            {result.supuestosYAlertasVerificacion.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {idx + 1}. {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Alertas Críticas de Prioridad Inmediata (Top 3) */}
      <section className="mt-8 print-break-inside-avoid">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#B91C1C]" />
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1917]">
              Alertas Críticas de Prioridad Inmediata
            </h2>
          </div>
          <span className="text-xs font-medium text-[#78716C] tabular-nums">
            3 brechas de mayor impacto (cierre, multas o responsabilidad solidaria)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {result.alertasCriticas.map((alert, idx) => (
            <article
              key={idx}
              className="rounded-md border border-[#FECACA] bg-white p-5 print-break-inside-avoid"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#991B1B]">
                <span className="font-mono font-semibold tabular-nums">
                  PRIORIDAD 0{idx + 1}
                </span>
                <span className="truncate font-medium">{alert.areaAfectada}</span>
              </div>
              <h3 className="font-editorial mt-2 text-lg font-semibold leading-snug text-[#1C1917]">
                {alert.titulo}
              </h3>
              <p className="mt-2 font-mono text-xs text-[#57534E]">
                {alert.normaVulnerada}
              </p>
              <div className="mt-3 border-t border-[#F5F5F4] pt-3 text-xs leading-relaxed text-[#292524]">
                <span className="font-semibold text-[#991B1B]">Riesgo y sanción: </span>
                {alert.impactoYSancion}
              </div>
              <div className="mt-2.5 text-xs leading-relaxed text-[#292524]">
                <span className="font-semibold text-[#1E3A8A]">Acción inmediata: </span>
                {alert.accionInmediata}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Visualización gráfica de distribución de riesgos por área funcional */}
      <RiskDistributionChart
        areas={result.areas}
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
      />

      {/* Controles de filtrado y vista */}
      <section className="no-print mt-10 border-t border-[#E5E0D5] pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Pestañas segmentadas por área funcional */}
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-[#E5E0D5] bg-[#F5F2EB] p-1">
            {[ALL_AREAS, ...result.areas.map((a) => a.areaNombre)].map((areaLabel) => {
              const active = selectedArea === areaLabel;
              return (
                <button
                  key={areaLabel}
                  type="button"
                  onClick={() => setSelectedArea(areaLabel)}
                  className={`cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-[#1C1917] shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  {areaLabel}
                </button>
              );
            })}
          </div>

          {/* Toggle Vista Tabla / Vista Markdown */}
          <div className="flex items-center gap-1 rounded-md border border-[#E5E0D5] bg-[#F5F2EB] p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'table'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Vista Tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'markdown'
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Vista Markdown
            </button>
          </div>
        </div>

        {viewMode === 'table' && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#78716C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar norma, decreto, obligación o sanción..."
                className="w-full rounded-md border border-[#D6D3D1] bg-white py-2 pr-3 pl-9 text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <select
              value={selectedIvc}
              onChange={(e) => setSelectedIvc(e.target.value)}
              aria-label="Filtrar por entidad vigilante IVC"
              className="rounded-md border border-[#D6D3D1] bg-white px-3 py-2 text-xs text-[#1C1917] focus:border-[#1E3A8A] focus:outline-none"
            >
              <option value="TODAS">Todas las Entidades IVC</option>
              {ivcOptions.map((ivc) => (
                <option key={ivc} value={ivc}>
                  {ivc}
                </option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              aria-label="Filtrar por nivel de riesgo"
              className="rounded-md border border-[#D6D3D1] bg-white px-3 py-2 text-xs text-[#1C1917] focus:border-[#1E3A8A] focus:outline-none"
            >
              <option value="TODOS">Todos los niveles de riesgo</option>
              <option value="CRÍTICO">Riesgo Crítico</option>
              <option value="ALTO">Riesgo Alto</option>
              <option value="MEDIO">Riesgo Medio</option>
            </select>
          </div>
        )}
      </section>

      {/* Contenido de la Matriz */}
      {viewMode === 'markdown' ? (
        <section className="mt-6">
          <div className="rounded-md border border-[#E5E0D5] bg-white p-5">
            <div className="mb-3 flex items-center justify-between border-b border-[#E5E0D5] pb-3">
              <span className="text-xs font-semibold text-[#57534E]">
                Salida reglamentaria en formato de tabla Markdown (5 columnas)
              </span>
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:underline"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedMd ? 'Copiado' : 'Copiar todo'}</span>
              </button>
            </div>
            <pre className="max-h-[680px] overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#1C1917]">
              {markdownString}
            </pre>
          </div>
        </section>
      ) : (
        <section className="mt-6 space-y-10">
          {filteredAreas.length === 0 ? (
            <div className="rounded-md border border-[#E5E0D5] bg-white p-10 text-center">
              <p className="text-sm font-semibold text-[#1C1917]">
                No hay requisitos legales que coincidan con los filtros actuales.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedArea(ALL_AREAS);
                  setSearchTerm('');
                  setSelectedIvc('TODAS');
                  setSelectedRisk('TODOS');
                }}
                className="cursor-pointer mt-3 text-xs font-semibold text-[#1E3A8A] underline"
              >
                Restablecer filtros de búsqueda
              </button>
            </div>
          ) : (
            filteredAreas.map((area) => (
              <div key={area.areaNombre as FunctionalAreaName} className="space-y-3">
                <div className="border-b border-[#E5E0D5] pb-2.5">
                  <h2 className="font-editorial text-2xl font-semibold text-[#1C1917]">
                    {area.areaNombre}
                  </h2>
                  {area.justificacionArea && (
                    <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                      {area.justificacionArea}
                    </p>
                  )}
                </div>

                <div className="overflow-x-auto rounded-md border border-[#E5E0D5] bg-white">
                  <table className="w-full min-w-[920px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E0D5] bg-[#F5F2EB] text-[#1C1917]">
                        <th className="w-[14%] px-4 py-3 font-semibold">Área / Proceso</th>
                        <th className="w-[19%] px-4 py-3 font-semibold">
                          Norma Aplicable (Ley/Decreto/Resolución)
                        </th>
                        <th className="w-[30%] px-4 py-3 font-semibold">
                          Obligación Específica para la Empresa
                        </th>
                        <th className="w-[15%] px-4 py-3 font-semibold">
                          Entidad Vigilante (IVC)
                        </th>
                        <th className="w-[22%] px-4 py-3 font-semibold">
                          Riesgo y Sanción por Incumplimiento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D5]">
                      {area.filas.map((row, idx) => (
                        <tr
                          key={idx}
                          className="align-top transition-colors hover:bg-[#FBF9F5]"
                        >
                          <td className="px-4 py-3.5 font-medium text-[#1C1917]">
                            <div>{row.areaProceso}</div>
                            <div
                              className={`mt-1.5 text-[11px] font-semibold ${
                                row.nivelRiesgo === 'CRÍTICO'
                                  ? 'text-[#B91C1C]'
                                  : row.nivelRiesgo === 'ALTO'
                                  ? 'text-[#B45309]'
                                  : 'text-[#57534E]'
                              }`}
                            >
                              Riesgo {row.nivelRiesgo}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px] leading-relaxed text-[#1E3A8A]">
                            {row.normaAplicable}
                          </td>
                          <td className="px-4 py-3.5 leading-relaxed text-[#292524]">
                            {row.obligacionEspecifica}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-[#1C1917]">
                            {row.entidadVigilanteIVC}
                          </td>
                          <td className="px-4 py-3.5 leading-relaxed text-[#292524] tabular-nums">
                            {row.riesgoYSancion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Bloque de acceso al Análisis Jurídico Profundo de Productos y Servicios */}
      <section className="no-print mt-12 rounded-md border border-[#E5E0D5] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h3 className="font-editorial text-xl font-semibold text-[#1C1917]">
              Análisis Jurídico Profundo por Listado de Productos o Servicios
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
              {(result.analisisProductosServicios?.length ?? 0) > 0
                ? `Se analizaron ${result.analisisProductosServicios?.length} producto(s) o servicio(s) bajo la normativa colombiana. Puedes revisar las normas que cobijan cada ítem, ampliar el listado o descargarlo en CSV.`
                : 'Ingresa el listado específico de productos o servicios de tu organización para identificar desde la visión jurídica qué leyes, decretos, registros o entidades IVC cobijan cada uno.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToProducts}
            className="cursor-pointer rounded-md border border-[#1E3A8A] bg-white px-4 py-2.5 text-xs font-semibold text-[#1E3A8A] transition-colors hover:bg-[#EFF6FF] whitespace-nowrap shrink-0"
          >
            {(result.analisisProductosServicios?.length ?? 0) > 0
              ? 'Ver análisis de productos y servicios'
              : 'Analizar listado de productos o servicios'}
          </button>
        </div>
      </section>

      {/* Llamado explícito de consulta legal específica */}
      <section className="no-print mt-4 rounded-md border border-[#E5E0D5] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h3 className="font-editorial text-xl font-semibold text-[#1C1917]">
              ¿Requiere alguna información legal específica para su organización?
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
              {result.respuestaConsultaEspecifica}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToConsultation}
            className="cursor-pointer rounded-md bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0"
          >
            Realizar consulta específica
          </button>
        </div>
      </section>
    </div>
  );
};
