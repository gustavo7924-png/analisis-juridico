import React, { useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { CompanyProfile, FollowUpEntry, LegalAuditResult } from '../types';
import { SPECIFIC_QUERY_SUGGESTIONS } from '../data/presets';

interface SpecificConsultationPanelProps {
  profile: CompanyProfile;
  result: LegalAuditResult;
  followUps: FollowUpEntry[];
  isAsking: boolean;
  errorMessage: string | null;
  onAskQuestion: (question: string) => Promise<void>;
  onBackToMatrix: () => void;
}

export const SpecificConsultationPanel: React.FC<SpecificConsultationPanelProps> = ({
  profile,
  result,
  followUps,
  isAsking,
  errorMessage,
  onAskQuestion,
  onBackToMatrix,
}) => {
  const [question, setQuestion] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;
    await onAskQuestion(trimmed);
    setQuestion('');
  };

  const orgName =
    profile.razonSocial.trim() || `${profile.tipoOrganizacion} (${profile.municipio || 'Colombia'})`;

  return (
    <div className="mx-auto max-w-[960px] px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#E5E0D5] pb-5">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-[#78716C]">
            Expediente Activo · {orgName}
          </p>
          <h1 className="font-editorial mt-1.5 text-3xl font-semibold text-[#1C1917]">
            Consulta Legal Específica
          </h1>
          <p className="mt-1.5 text-sm text-[#57534E]">
            Solicita conceptos puntuales aplicables a tu organización bajo la normativa colombiana,
            entidades IVC y riesgos en UVT o SMMLV.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToMatrix}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F5F5F4] whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a la Matriz</span>
        </button>
      </div>

      {/* Respuesta inicial del dictamen */}
      <section className="rounded-md border border-[#E5E0D5] bg-white p-6">
        <div className="text-xs font-semibold text-[#1E3A8A]">
          Orientación del Auditor Legal Corporativo
        </div>
        {profile.consultaEspecificaInicial.trim() && (
          <div className="mt-2 border-b border-[#F0ECE3] pb-3 text-sm font-medium text-[#1C1917]">
            Consulta inicial: “{profile.consultaEspecificaInicial}”
          </div>
        )}
        <div className="mt-3 text-sm leading-relaxed whitespace-pre-line text-[#292524]">
          {result.respuestaConsultaEspecifica}
        </div>
      </section>

      {/* Historial de consultas de seguimiento */}
      {followUps.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-editorial text-xl font-semibold text-[#1C1917]">
            Consultas Adicionales Resueltas ({followUps.length})
          </h2>
          {followUps.map((entry) => (
            <article
              key={entry.id}
              className="rounded-md border border-[#E5E0D5] bg-white p-6"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-[#78716C]">
                <span className="font-semibold text-[#1C1917]">Pregunta formulada</span>
                <span className="tabular-nums">
                  {new Date(entry.createdAt).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-medium text-[#1E3A8A]">{entry.question}</p>
              <div className="mt-4 border-t border-[#F0ECE3] pt-4 text-sm leading-relaxed whitespace-pre-line text-[#292524]">
                {entry.answer}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Formulario para nueva pregunta */}
      <section className="mt-8 rounded-md border border-[#E5E0D5] bg-white p-6">
        <h2 className="font-editorial text-lg font-semibold text-[#1C1917]">
          ¿Requiere alguna información legal específica adicional?
        </h2>
        <p className="mt-1 text-xs text-[#57534E]">
          Formula tu pregunta considerando el perfil ya auditado ({profile.tipoOrganizacion} · CIIU{' '}
          {profile.ciiu || 'por confirmar'} · {profile.municipio || 'Colombia'}).
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B]">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ej. ¿Qué requisitos exige la DIAN para expedir certificados de donación o qué contrato laboral conviene para personal remoto?"
            className="w-full rounded-md border border-[#D6D3D1] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1E3A8A] focus:outline-none"
          />

          <div className="flex flex-wrap gap-2">
            {SPECIFIC_QUERY_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuestion(suggestion)}
                className="cursor-pointer rounded-md border border-[#E5E0D5] bg-[#FBF9F5] px-2.5 py-1.5 text-left text-xs text-[#44403C] hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#1E3A8A] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isAsking ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Analizando normativa...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Consultar al Auditor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
