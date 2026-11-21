import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { ClientType, CompanyProfile } from '../types';
import {
  COMMON_CIIU_CODES,
  COMMON_MUNICIPALITIES,
  EMPTY_PROFILE,
  INCOME_RANGES,
  ORGANIZATION_PRESETS,
  ORGANIZATION_TYPES,
  SPECIFIC_QUERY_SUGGESTIONS,
} from '../data/presets';

interface IntakeWizardProps {
  profile: CompanyProfile;
  isGenerating: boolean;
  errorMessage: string | null;
  onChangeProfile: (updated: CompanyProfile) => void;
  onSubmitAudit: (profileToRun: CompanyProfile) => void;
  onDismissError: () => void;
}

const CLIENT_TYPES: ClientType[] = [
  'B2C (Consumidor final)',
  'B2B (Empresas)',
  'Estado (Contratación Pública)',
  'Mixto (B2C y B2B)',
  'No especificado',
];

const STEPS = [
  { id: 1, title: '01. Naturaleza y Ubicación' },
  { id: 2, title: '02. Talento Humano y Mercados' },
  { id: 3, title: '03. Factores Especiales y Consulta' },
];

export const IntakeWizard: React.FC<IntakeWizardProps> = ({
  profile,
  isGenerating,
  errorMessage,
  onChangeProfile,
  onSubmitAudit,
  onDismissError,
}) => {
  const [step, setStep] = useState<number>(1);
  const [draftProduct, setDraftProduct] = useState<string>('');

  const addProductsFromText = (raw: string) => {
    const parts = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const current = profile.productosServicios ?? [];
    const seen = new Set(current.map((p) => p.toLowerCase()));
    const next = [...current];
    parts.forEach((p) => {
      if (!seen.has(p.toLowerCase())) {
        seen.add(p.toLowerCase());
        next.push(p);
      }
    });
    updateField('productosServicios', next);
    setDraftProduct('');
  };

  const removeProduct = (index: number) => {
    const current = profile.productosServicios ?? [];
    updateField(
      'productosServicios',
      current.filter((_, idx) => idx !== index)
    );
  };

  const updateField = <K extends keyof CompanyProfile>(
    key: K,
    value: CompanyProfile[K]
  ) => {
    onChangeProfile({ ...profile, [key]: value });
  };

  const applyPreset = (presetProfile: CompanyProfile) => {
    onChangeProfile({ ...presetProfile });
    onDismissError();
  };

  const resetForm = () => {
    onChangeProfile({ ...EMPTY_PROFILE });
    setStep(1);
    onDismissError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    onSubmitAudit(profile);
  };

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-10">
      {/* Encabezado editorial de sección */}
      <section className="mb-10 border-b border-[#E5E0D5] pb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-[#78716C]">
          República de Colombia · Auditoría Jurídica y Cumplimiento Normativo
        </p>
        <h1 className="font-editorial mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#1C1917] sm:text-4xl">
          Diagnóstico de Requisitos Legales y Riesgos de Incumplimiento
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#57534E]">
          Parametriza la estructura jurídica, actividad económica CIIU, planta de personal y
          jurisdicción municipal de tu organización para generar la matriz normativa por áreas
          funcionales, entidades IVC y alertas críticas de prioridad inmediata.
        </p>

        {/* Casos de referencia rápida */}
        <div className="mt-6">
          <p className="mb-2.5 text-xs font-medium text-[#57534E]">
            Cargar perfil ilustrativo para evaluación rápida:
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {ORGANIZATION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.profile)}
                className="cursor-pointer rounded-md border border-[#E5E0D5] bg-white px-3.5 py-2.5 text-left transition-colors hover:border-[#1E3A8A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A]"
              >
                <div className="text-xs font-semibold text-[#1C1917] truncate">
                  {preset.label}
                </div>
                <div className="mt-1 text-xs text-[#78716C] line-clamp-2">
                  {preset.summary}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between gap-4 rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
        >
          <div>
            <span className="font-semibold">Error al generar el dictamen: </span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="cursor-pointer text-xs font-semibold underline shrink-0"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Barra de pasos del asistente */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D5] pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-6">
          {STEPS.map((item) => {
            const isActive = step === item.id;
            const isCompleted = step > item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.id)}
                className={`cursor-pointer flex items-center gap-2 py-1.5 text-sm transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#1E3A8A] font-semibold text-[#1E3A8A]'
                    : isCompleted
                    ? 'border-transparent font-medium text-[#1C1917] hover:text-[#1E3A8A]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {isCompleted && <Check className="h-3.5 w-3.5 text-[#1E3A8A]" />}
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Limpiar formulario</span>
        </button>
      </div>

      {/* Hoja principal del formulario */}
      <form
        onSubmit={handleSubmit}
        className="rounded-md border border-[#E5E0D5] bg-white p-6 sm:p-8"
      >
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
                Naturaleza Jurídica, Tamaño y Jurisdicción
              </h2>
              <p className="mt-1 text-sm text-[#57534E]">
                Define el tipo societario o entidad sin ánimo de lucro, actividad CIIU y municipio
                de operación para determinar el régimen de inspección, vigilancia y control.
              </p>
            </div>

            {/* Tipo de organización */}
            <div>
              <label className="block text-sm font-semibold text-[#1C1917]">
                Tipo y tamaño de organización
              </label>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ORGANIZATION_TYPES.map((org) => {
                  const selected = profile.tipoOrganizacion === org.value;
                  return (
                    <button
                      key={org.value}
                      type="button"
                      onClick={() => updateField('tipoOrganizacion', org.value)}
                      className={`cursor-pointer rounded-md border p-3.5 text-left transition-colors ${
                        selected
                          ? 'border-[#1E3A8A] bg-[#EFF6FF]/60'
                          : 'border-[#E5E0D5] bg-white hover:border-[#A8A29E]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#1C1917]">
                          {org.label}
                        </span>
                        {selected && <Check className="h-4 w-4 text-[#1E3A8A] shrink-0" />}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                        {org.detail}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="razonSocial"
                  className="block text-sm font-semibold text-[#1C1917]"
                >
                  Razón social o nombre de la entidad{' '}
                  <span className="font-normal text-[#78716C]">(Opcional)</span>
                </label>
                <input
                  id="razonSocial"
                  type="text"
                  value={profile.razonSocial}
                  onChange={(e) => updateField('razonSocial', e.target.value)}
                  placeholder="Ej. Inversiones del Valle S.A.S. / Fundación Horizonte"
                  className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="municipio"
                  className="block text-sm font-semibold text-[#1C1917]"
                >
                  Municipio o Distrito principal de operación
                </label>
                <input
                  id="municipio"
                  type="text"
                  value={profile.municipio}
                  onChange={(e) => updateField('municipio', e.target.value)}
                  placeholder="Ej. Bogotá D.C., Medellín, Cali (si se omite, se genera alerta)"
                  className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {COMMON_MUNICIPALITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => updateField('municipio', city)}
                      className="cursor-pointer text-xs text-[#57534E] underline-offset-2 hover:text-[#1E3A8A] hover:underline"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label
                  htmlFor="ciiu"
                  className="block text-sm font-semibold text-[#1C1917]"
                >
                  Código CIIU (Rev. 4 A.C.)
                </label>
                <input
                  id="ciiu"
                  type="text"
                  value={profile.ciiu}
                  onChange={(e) => updateField('ciiu', e.target.value)}
                  placeholder="Ej. 6201, 4711, 8899"
                  className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="actividadEconomica"
                  className="block text-sm font-semibold text-[#1C1917]"
                >
                  Objeto social o actividad económica principal
                </label>
                <input
                  id="actividadEconomica"
                  type="text"
                  value={profile.actividadEconomica}
                  onChange={(e) => updateField('actividadEconomica', e.target.value)}
                  placeholder="Describe los bienes producidos, servicios prestados o fin social"
                  className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>
            </div>

            {/* Sugerencias de CIIU */}
            <div className="rounded-md border border-[#E5E0D5] bg-[#FBF9F5] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#57534E]">
                <Search className="h-3.5 w-3.5" />
                <span>Selección rápida de códigos CIIU frecuentes:</span>
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COMMON_CIIU_CODES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() =>
                      onChangeProfile({
                        ...profile,
                        ciiu: item.code,
                        actividadEconomica: item.desc,
                      })
                    }
                    className="cursor-pointer flex items-baseline gap-2 text-left text-xs text-[#44403C] hover:text-[#1E3A8A]"
                  >
                    <span className="font-mono font-semibold tabular-nums text-[#1E3A8A]">
                      {item.code}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="rangoActivosIngresos"
                className="block text-sm font-semibold text-[#1C1917]"
              >
                Rango aproximado de ingresos brutos anuales o activos (UVT / SMMLV)
              </label>
              <select
                id="rangoActivosIngresos"
                value={profile.rangoActivosIngresos}
                onChange={(e) => updateField('rangoActivosIngresos', e.target.value)}
                className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A8A] focus:outline-none"
              >
                {INCOME_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
                Talento Humano, Contratación y Perfil de Clientes
              </h2>
              <p className="mt-1 text-sm text-[#57534E]">
                Estos parámetros definen las obligaciones ante Mintrabajo, UGPP, SIC (Estatuto del
                Consumidor / Habeas Data) y contratación pública.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="numeroEmpleados"
                  className="block text-sm font-semibold text-[#1C1917]"
                >
                  Número de empleados directos
                </label>
                <input
                  id="numeroEmpleados"
                  type="number"
                  min={0}
                  value={profile.numeroEmpleados}
                  onChange={(e) => updateField('numeroEmpleados', e.target.value)}
                  placeholder="Ej. 12 (vacío = supuesto)"
                  className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-[#78716C]">
                  Determina estándares SG-SST (Res. 0312/2019), cuota SENA y comités obligatorios.
                </p>
              </div>

              <div>
                <label
                  htmlFor="numeroContratistas"
                  className="block text-sm font-semibold text-[#1C1917]"
                >
                  Contratistas (Prestación de servicios)
                </label>
                <input
                  id="numeroContratistas"
                  type="number"
                  min={0}
                  value={profile.numeroContratistas}
                  onChange={(e) => updateField('numeroContratistas', e.target.value)}
                  placeholder="Ej. 3"
                  className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-[#78716C]">
                  Impacta verificación de aportes PILA, ARL y riesgo de contrato realidad ante UGPP.
                </p>
              </div>

              <div>
                <label
                  htmlFor="tipoCliente"
                  className="block text-sm font-semibold text-[#1C1917]"
                >
                  Tipo de cliente principal
                </label>
                <select
                  id="tipoCliente"
                  value={profile.tipoCliente}
                  onChange={(e) => updateField('tipoCliente', e.target.value as ClientType)}
                  className="mt-2 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] focus:border-[#1E3A8A] focus:outline-none"
                >
                  {CLIENT_TYPES.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-[#E5E0D5] pt-6">
              <p className="text-sm font-semibold text-[#1C1917]">
                Canales comerciales, datos y contratación
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    key: 'manejaDatosPersonales' as const,
                    title: 'Tratamiento de datos personales',
                    desc: 'Bases de clientes, empleados, asociados, donantes o cámaras de seguridad (Ley 1581/2012).',
                  },
                  {
                    key: 'comercioElectronico' as const,
                    title: 'Comercio electrónico o ventas no presenciales',
                    desc: 'Tienda en línea, WhatsApp o pasarela de pagos (derecho de retracto y reversión de pago).',
                  },
                  {
                    key: 'establecimientoAbierto' as const,
                    title: 'Establecimiento físico abierto al público',
                    desc: 'Local, oficina de atención o bodega sujeta a uso de suelo, bomberos, Sayco/Acinpro y Ley 1801.',
                  },
                  {
                    key: 'contratacionEstatal' as const,
                    title: 'Contratación con el Estado (SECOP / Convenios)',
                    desc: 'Licitaciones, mínima cuantía o convenios de asociación ESAL (Ley 80/1993, D. 092/2017).',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`cursor-pointer flex items-start gap-3 rounded-md border p-4 transition-colors ${
                      profile[item.key]
                        ? 'border-[#1E3A8A] bg-[#EFF6FF]/40'
                        : 'border-[#E5E0D5] bg-white hover:border-[#A8A29E]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profile[item.key]}
                      onChange={(e) => updateField(item.key, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#D6D3D1] accent-[#1E3A8A]"
                    />
                    <div>
                      <div className="text-sm font-semibold text-[#1C1917]">{item.title}</div>
                      <div className="mt-1 text-xs leading-relaxed text-[#57534E]">
                        {item.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
                Factores Regulatorios Especiales y Consulta Legal Específica
              </h2>
              <p className="mt-1 text-sm text-[#57534E]">
                Activa las condiciones sectoriales que aplican a tu operación y formula cualquier
                pregunta jurídica puntual que desees resolver en el dictamen.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  key: 'registroInvima' as const,
                  title: 'Productos vigilados por INVIMA / Reglamentos técnicos',
                  desc: 'Alimentos, bebidas, cosméticos, suplementos, dispositivos médicos o insumos de salud.',
                },
                {
                  key: 'impactoAmbiental' as const,
                  title: 'Gestión ambiental, vertimientos o residuos peligrosos',
                  desc: 'Generación de RESPEL, aceites, emisiones, permisos de agua o plan de manejo ambiental.',
                },
                {
                  key: 'propiedadIntelectual' as const,
                  title: 'Propiedad intelectual, marcas, software o derechos de autor',
                  desc: 'Registro marcario ante SIC, licenciamiento de software o contratos de cesión patrimonial.',
                },
                {
                  key: 'comercioExterior' as const,
                  title: 'Comercio exterior, importación, exportación o divisas',
                  desc: 'Operaciones aduaneras ante DIAN y canalización cambiaria ante el Banco de la República.',
                },
                {
                  key: 'recursosCooperacionESAL' as const,
                  title: 'Donaciones, cooperación internacional o Régimen Tributario Especial',
                  desc: 'Excedentes de ESAL, certificados de donación (Art. 257 E.T.) y actualización web RTE.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`cursor-pointer flex items-start gap-3 rounded-md border p-4 transition-colors ${
                    profile[item.key]
                      ? 'border-[#1E3A8A] bg-[#EFF6FF]/40'
                      : 'border-[#E5E0D5] bg-white hover:border-[#A8A29E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profile[item.key]}
                    onChange={(e) => updateField(item.key, e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#D6D3D1] accent-[#1E3A8A]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#1C1917]">{item.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-[#57534E]">
                      {item.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Listado de Productos o Servicios para análisis jurídico profundo */}
            <div className="border-t border-[#E5E0D5] pt-6">
              <label
                htmlFor="draftProduct"
                className="block text-sm font-semibold text-[#1C1917]"
              >
                Listado de productos o servicios para análisis jurídico profundo
              </label>
              <p className="mt-1 text-xs text-[#57534E]">
                Opcional. Enumera los productos o servicios que ofrece tu organización para que la
                aplicación identifique desde la visión jurídica qué normas colombianas exactas
                cobijan a cada uno (registros, licencias, consumidor, propiedad intelectual o IVA).
              </p>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  id="draftProduct"
                  type="text"
                  value={draftProduct}
                  onChange={(e) => setDraftProduct(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && draftProduct.trim()) {
                      e.preventDefault();
                      addProductsFromText(draftProduct);
                    }
                  }}
                  placeholder="Ej. Venta en línea de cosméticos / Licenciamiento de software SaaS"
                  className="flex-1 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => addProductsFromText(draftProduct)}
                  disabled={!draftProduct.trim()}
                  className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-md border border-[#D6D3D1] bg-[#FBF9F5] px-4 py-2.5 text-xs font-semibold text-[#1C1917] transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar</span>
                </button>
              </div>

              {(profile.productosServicios ?? []).length > 0 && (
                <div className="mt-3 divide-y divide-[#E5E0D5] rounded-md border border-[#E5E0D5] bg-[#FBF9F5]">
                  {(profile.productosServicios ?? []).map((item, idx) => (
                    <div
                      key={`${item}-${idx}`}
                      className="flex items-center justify-between gap-3 px-3.5 py-2 text-xs text-[#1C1917]"
                    >
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-mono text-[#78716C] tabular-nums shrink-0">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span className="truncate font-medium">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(idx)}
                        className="cursor-pointer inline-flex items-center gap-1 text-[#991B1B] hover:underline shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E0D5] pt-6">
              <label
                htmlFor="consultaEspecificaInicial"
                className="block text-sm font-semibold text-[#1C1917]"
              >
                ¿Requiere alguna información legal específica que aplique en su organización?
              </label>
              <p className="mt-1 text-xs text-[#57534E]">
                Opcional. Si tienes una duda particular (SAGRILAFT, teletrabajo, libranzas, RTE,
                protección al consumidor o ley de insolvencia), inclúyela aquí para recibir respuesta
                directa en el informe. También podrás hacer más consultas después de generar la matriz.
              </p>
              <textarea
                id="consultaEspecificaInicial"
                rows={4}
                value={profile.consultaEspecificaInicial}
                onChange={(e) => updateField('consultaEspecificaInicial', e.target.value)}
                placeholder="Ej. ¿Nuestra fundación está obligada a tener Revisor Fiscal y actualizar el Registro Web del RTE cada año?"
                className="mt-3 w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
              />
              <div className="mt-3">
                <p className="text-xs font-medium text-[#78716C]">Sugerencias frecuentes:</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {SPECIFIC_QUERY_SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => updateField('consultaEspecificaInicial', q)}
                      className="cursor-pointer rounded-md border border-[#E5E0D5] bg-[#FBF9F5] px-2.5 py-1.5 text-left text-xs text-[#44403C] transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pie de navegación del asistente */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E0D5] pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isGenerating}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              step === 1 || isGenerating
                ? 'cursor-not-allowed border-[#E5E0D5] text-[#A8A29E]'
                : 'cursor-pointer border-[#D6D3D1] bg-white text-[#1C1917] hover:bg-[#F5F5F4]'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Paso anterior</span>
          </button>

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                type="submit"
                className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#172554] whitespace-nowrap shrink-0"
              >
                <span>Continuar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating}
                className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#172554] disabled:cursor-wait disabled:opacity-75 whitespace-nowrap shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generando Matriz Normativa...</span>
                  </>
                ) : (
                  <span>Generar Matriz Legal y Alertas</span>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Estado de carga estructurado durante análisis */}
      {isGenerating && (
        <div className="mt-8 rounded-md border border-[#E5E0D5] bg-white p-6">
          <p className="text-sm font-semibold text-[#1C1917]">
            Ejecutando auditoría jurídica bajo el ordenamiento colombiano...
          </p>
          <p className="mt-1 text-xs text-[#57534E]">
            Cruzando perfil organizacional ({profile.tipoOrganizacion} · CIIU{' '}
            {profile.ciiu || 'por verificar'} · {profile.municipio || 'Colombia'}) contra Leyes,
            Decretos Únicos Reglamentarios, Resoluciones y Circulares de Superintendencias.
          </p>
          <div className="mt-4 space-y-2.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#F0ECE3]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#F0ECE3]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[#F0ECE3]" />
          </div>
        </div>
      )}
    </div>
  );
};
