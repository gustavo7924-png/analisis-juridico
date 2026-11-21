import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Loader2,
  Plus,
  Scale,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { CompanyProfile, LegalAuditResult } from '../types';
import { buildProductsCsv, buildSafeSlug, downloadTextFile } from '../utils/export';

interface ProductsServicesAnalysisProps {
  profile: CompanyProfile;
  result: LegalAuditResult;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onRunDeepAnalysis: (productosServicios: string[]) => Promise<void>;
  onBackToMatrix: () => void;
}

export const ProductsServicesAnalysis: React.FC<ProductsServicesAnalysisProps> = ({
  profile,
  result,
  isAnalyzing,
  errorMessage,
  onRunDeepAnalysis,
  onBackToMatrix,
}) => {
  const [items, setItems] = useState<string[]>(() =>
    profile.productosServicios && profile.productosServicios.length > 0
      ? [...profile.productosServicios]
      : []
  );
  const [draftItem, setDraftItem] = useState<string>('');

  const addItemsFromText = (raw: string) => {
    const parts = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setItems((prev) => {
      const existing = new Set(prev.map((p) => p.toLowerCase()));
      const next = [...prev];
      parts.forEach((p) => {
        if (!existing.has(p.toLowerCase())) {
          existing.add(p.toLowerCase());
          next.push(p);
        }
      });
      return next;
    });
    setDraftItem('');
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pending = draftItem.trim();
    let listToRun = items;
    if (pending) {
      const merged = [
        ...items,
        ...pending
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ];
      listToRun = Array.from(new Set(merged));
      setItems(listToRun);
      setDraftItem('');
    }
    if (listToRun.length === 0 || isAnalyzing) return;
    await onRunDeepAnalysis(listToRun);
  };

  const handleExportProductsCsv = () => {
    const csv = buildProductsCsv(profile, result);
    downloadTextFile(
      `productos-servicios-normativa-${buildSafeSlug({ profile })}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  };

  const analyzedList = result.analisisProductosServicios ?? [];
  const orgName =
    profile.razonSocial.trim() ||
    `${profile.tipoOrganizacion} (${profile.municipio || 'Colombia'})`;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E0D5] pb-6">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-[#78716C]">
            Expediente Activo · {orgName}
          </p>
          <h1 className="font-editorial mt-1.5 text-3xl font-semibold text-[#1C1917]">
            Análisis Jurídico Profundo de Productos y Servicios
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#57534E]">
            Ingresa el listado de bienes, productos o servicios que comercializa o presta tu
            organización. El auditor jurídico identificará desde el derecho colombiano qué normas,
            registros sanitarios, licencias y entidades IVC cobijan cada línea de negocio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {analyzedList.length > 0 && (
            <button
              type="button"
              onClick={handleExportProductsCsv}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Exportar CSV (Excel)</span>
            </button>
          )}
          <button
            type="button"
            onClick={onBackToMatrix}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la Matriz</span>
          </button>
        </div>
      </div>

      {/* Editor del listado de productos o servicios */}
      <section className="rounded-md border border-[#E5E0D5] bg-white p-6">
        <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
          Listado de Productos o Servicios a Evaluar
        </h2>
        <p className="mt-1 text-xs text-[#57534E]">
          Agrega uno por uno o pega varios separados por comas o saltos de línea (ej. alimentos
          empacados, software SaaS, asesoría financiera, cursos presenciales, dispositivos médicos).
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B]"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={draftItem}
              onChange={(e) => setDraftItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draftItem.trim()) {
                  e.preventDefault();
                  addItemsFromText(draftItem);
                }
              }}
              placeholder="Ej. Venta de suplementos alimenticios en tienda en línea"
              className="flex-1 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addItemsFromText(draftItem)}
              disabled={!draftItem.trim()}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-md border border-[#D6D3D1] bg-[#FBF9F5] px-4 py-2.5 text-xs font-semibold text-[#1C1917] transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar al listado</span>
            </button>
          </div>

          {items.length > 0 ? (
            <div className="divide-y divide-[#E5E0D5] rounded-md border border-[#E5E0D5] bg-[#FBF9F5]">
              {items.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[#1C1917]"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono text-xs text-[#78716C] tabular-nums shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="truncate">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    aria-label={`Eliminar ${item}`}
                    className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-[#991B1B] hover:underline shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Quitar</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[#D6D3D1] bg-[#FBF9F5] px-4 py-6 text-center text-xs text-[#78716C]">
              Aún no has agregado productos o servicios al listado. Agrega al menos uno arriba para
              identificar qué normas colombianas lo cobijan.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-[#78716C] tabular-nums">
              {items.length} producto(s) o servicio(s) en lista
            </span>
            <button
              type="submit"
              disabled={(items.length === 0 && !draftItem.trim()) || isAnalyzing}
              className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ejecutando análisis jurídico profundo...</span>
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4" />
                  <span>Ejecutar Análisis Jurídico Profundo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Resultados del análisis jurídico profundo */}
      {analyzedList.length > 0 && (
        <div className="mt-10 space-y-8">
          {result.resumenClasificacionPortafolio && (
            <section className="rounded-md border border-[#E5E0D5] bg-white p-6">
              <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
                Visión Jurídica General del Portafolio
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[#292524]">
                {result.resumenClasificacionPortafolio}
              </p>
            </section>
          )}

          {/* Tabla resumen de normas que cobijan cada producto/servicio */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E0D5] pb-2.5">
              <h2 className="font-editorial text-2xl font-semibold text-[#1C1917]">
                Matriz Normativa por Producto o Servicio
              </h2>
              <button
                type="button"
                onClick={handleExportProductsCsv}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Descargar tabla en CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-[#E5E0D5] bg-white">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E0D5] bg-[#F5F2EB] text-[#1C1917]">
                    <th className="w-[18%] px-4 py-3 font-semibold">Producto / Servicio</th>
                    <th className="w-[18%] px-4 py-3 font-semibold">Clasificación Jurídica</th>
                    <th className="w-[24%] px-4 py-3 font-semibold">Normas que lo Cobijan</th>
                    <th className="w-[24%] px-4 py-3 font-semibold">
                      Requisitos Habilitantes y Registros
                    </th>
                    <th className="w-[16%] px-4 py-3 font-semibold">Entidad IVC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D5]">
                  {analyzedList.map((item, idx) => (
                    <tr key={idx} className="align-top hover:bg-[#FBF9F5]">
                      <td className="px-4 py-3.5 font-semibold text-[#1C1917]">
                        {item.productoServicio}
                      </td>
                      <td className="px-4 py-3.5 leading-relaxed text-[#292524]">
                        {item.clasificacionJuridica}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] leading-relaxed text-[#1E3A8A]">
                        {item.normasQueLoCobijan}
                      </td>
                      <td className="px-4 py-3.5 leading-relaxed text-[#292524]">
                        {item.requisitosHabilitantes}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#1C1917]">
                        {item.entidadReguladora}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Respuestas jurídicas profundas individuales */}
          <section className="space-y-4">
            <h2 className="font-editorial text-2xl font-semibold text-[#1C1917]">
              Dictamen y Respuesta Jurídica Profunda por Ítem
            </h2>
            <div className="space-y-4">
              {analyzedList.map((item, idx) => (
                <article
                  key={idx}
                  className="rounded-md border border-[#E5E0D5] bg-white p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#F0ECE3] pb-3">
                    <div>
                      <span className="font-mono text-xs font-semibold text-[#1E3A8A] tabular-nums">
                        ÍTEM {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-editorial mt-0.5 text-xl font-semibold text-[#1C1917]">
                        {item.productoServicio}
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-[#57534E]">
                      {item.clasificacionJuridica} · IVC: {item.entidadReguladora}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold text-[#57534E]">
                        Marco normativo aplicable
                      </div>
                      <p className="mt-1 font-mono text-xs leading-relaxed text-[#1E3A8A]">
                        {item.normasQueLoCobijan}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#57534E]">
                        Requisitos habilitantes y permisos
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#292524]">
                        {item.requisitosHabilitantes}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#F0ECE3] pt-4">
                    <div className="text-xs font-semibold text-[#1C1917]">
                      Respuesta y análisis jurídico profundo
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-[#292524]">
                      {item.analisisJuridicoProfundo}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
