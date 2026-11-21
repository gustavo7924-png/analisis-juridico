import { CompanyProfile, LegalAuditResult, SavedAuditRecord } from '../types';

function escapeMarkdownCell(value: string): string {
  return (value || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n+/g, ' ')
    .trim();
}

export function buildAuditMarkdown(profile: CompanyProfile, result: LegalAuditResult): string {
  const lines: string[] = [];
  const nombreOrg = profile.razonSocial.trim() || `${profile.tipoOrganizacion} (${profile.municipio || 'Colombia'})`;

  lines.push(`# Matriz de Requisitos Legales y Riesgos de Incumplimiento — ${nombreOrg}`);
  lines.push('');
  lines.push(`- **Naturaleza Jurídica / Tamaño:** ${profile.tipoOrganizacion}`);
  lines.push(`- **Actividad Económica / CIIU:** ${profile.ciiu || 'No especificado'} ${profile.actividadEconomica ? `— ${profile.actividadEconomica}` : ''}`);
  lines.push(`- **Municipio / Distrito:** ${profile.municipio || 'No especificado'}`);
  lines.push(`- **Empleados Directos / Contratistas:** ${profile.numeroEmpleados || 'No especificado'} directos / ${profile.numeroContratistas || '0'} contratistas`);
  lines.push(`- **Ingresos / Activos:** ${profile.rangoActivosIngresos || 'No especificado'}`);
  lines.push(`- **Tipo de Cliente:** ${profile.tipoCliente}`);
  lines.push('');
  lines.push('## Resumen Ejecutivo');
  lines.push('');
  lines.push(result.resumenEjecutivo);
  lines.push('');

  if (result.supuestosYAlertasVerificacion.length > 0) {
    lines.push('## Supuestos y Alertas de Verificación');
    lines.push('');
    result.supuestosYAlertasVerificacion.forEach((item) => {
      lines.push(`- ${item}`);
    });
    lines.push('');
  }

  result.areas.forEach((area) => {
    lines.push(`## ${area.areaNombre}`);
    lines.push('');
    if (area.justificacionArea) {
      lines.push(`*${area.justificacionArea}*`);
      lines.push('');
    }
    lines.push('| Área / Proceso | Norma Aplicable (Ley/Decreto/Resolución) | Obligación Específica para la Empresa | Entidad Vigilante (IVC) | Riesgo y Sanción por Incumplimiento |');
    lines.push('| :--- | :--- | :--- | :--- | :--- |');
    area.filas.forEach((row) => {
      lines.push(
        `| ${escapeMarkdownCell(row.areaProceso)} | ${escapeMarkdownCell(row.normaAplicable)} | ${escapeMarkdownCell(row.obligacionEspecifica)} | ${escapeMarkdownCell(row.entidadVigilanteIVC)} | ${escapeMarkdownCell(row.riesgoYSancion)} |`
      );
    });
    lines.push('');
  });

  lines.push('## Alertas Críticas de Prioridad Inmediata');
  lines.push('');
  result.alertasCriticas.forEach((alert, idx) => {
    lines.push(`### ${idx + 1}. ${alert.titulo}`);
    lines.push(`- **Área afectada:** ${alert.areaAfectada}`);
    lines.push(`- **Norma vulnerada:** ${alert.normaVulnerada}`);
    lines.push(`- **Impacto, sanción o responsabilidad solidaria:** ${alert.impactoYSancion}`);
    lines.push(`- **Acción inmediata recomendada:** ${alert.accionInmediata}`);
    lines.push('');
  });

  if (result.analisisProductosServicios && result.analisisProductosServicios.length > 0) {
    lines.push('## Análisis Jurídico de Productos y Servicios');
    lines.push('');
    if (result.resumenClasificacionPortafolio) {
      lines.push(result.resumenClasificacionPortafolio);
      lines.push('');
    }
    lines.push('| Producto / Servicio | Clasificación Jurídica | Normas que lo Cobijan | Requisitos Habilitantes | Entidad IVC | Respuesta Jurídica Profunda |');
    lines.push('| :--- | :--- | :--- | :--- | :--- | :--- |');
    result.analisisProductosServicios.forEach((item) => {
      lines.push(
        `| ${escapeMarkdownCell(item.productoServicio)} | ${escapeMarkdownCell(item.clasificacionJuridica)} | ${escapeMarkdownCell(item.normasQueLoCobijan)} | ${escapeMarkdownCell(item.requisitosHabilitantes)} | ${escapeMarkdownCell(item.entidadReguladora)} | ${escapeMarkdownCell(item.analisisJuridicoProfundo)} |`
      );
    });
    lines.push('');
  }

  if (result.respuestaConsultaEspecifica) {
    lines.push('## Atención a Consulta Legal Específica');
    lines.push('');
    lines.push(result.respuestaConsultaEspecifica);
    lines.push('');
  }

  return lines.join('\n');
}

function escapeCsvField(value: string): string {
  const clean = (value || '').replace(/\r?\n+/g, ' ').trim();
  if (clean.includes('"') || clean.includes(',') || clean.includes(';')) {
    return `"${clean.replace(/"/g, '""')}"`;
  }
  return `"${clean}"`;
}

export function buildAuditCsv(
  profile: CompanyProfile,
  result: LegalAuditResult,
  areasOverride?: LegalAuditResult['areas']
): string {
  const headers = [
    'Organización',
    'Tipo Organización',
    'CIIU',
    'Municipio',
    'Área Funcional',
    'Área / Proceso',
    'Norma Aplicable (Ley/Decreto/Resolución)',
    'Obligación Específica para la Empresa',
    'Entidad Vigilante (IVC)',
    'Riesgo y Sanción por Incumplimiento',
    'Nivel de Riesgo',
  ];

  const orgName = profile.razonSocial.trim() || profile.tipoOrganizacion;
  const rows: string[] = [headers.map(escapeCsvField).join(',')];
  const targetAreas = areasOverride ?? result.areas;

  targetAreas.forEach((area) => {
    area.filas.forEach((row) => {
      rows.push(
        [
          orgName,
          profile.tipoOrganizacion,
          profile.ciiu || 'No especificado',
          profile.municipio || 'No especificado',
          area.areaNombre,
          row.areaProceso,
          row.normaAplicable,
          row.obligacionEspecifica,
          row.entidadVigilanteIVC,
          row.riesgoYSancion,
          row.nivelRiesgo,
        ]
          .map(escapeCsvField)
          .join(',')
      );
    });
  });

  // Add UTF-8 BOM for clean Excel opening in Spanish
  return '\uFEFF' + rows.join('\n');
}

export function buildProductsCsv(
  profile: CompanyProfile,
  result: LegalAuditResult
): string {
  const headers = [
    'Organización',
    'Producto o Servicio',
    'Clasificación Jurídica',
    'Normas que lo Cobijan',
    'Requisitos Habilitantes y Registros',
    'Entidad Reguladora (IVC)',
    'Análisis Jurídico Profundo',
  ];

  const orgName = profile.razonSocial.trim() || profile.tipoOrganizacion;
  const rows: string[] = [headers.map(escapeCsvField).join(',')];

  (result.analisisProductosServicios || []).forEach((item) => {
    rows.push(
      [
        orgName,
        item.productoServicio,
        item.clasificacionJuridica,
        item.normasQueLoCobijan,
        item.requisitosHabilitantes,
        item.entidadReguladora,
        item.analisisJuridicoProfundo,
      ]
        .map(escapeCsvField)
        .join(',')
    );
  });

  return '\uFEFF' + rows.join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildSafeSlug(record: Pick<SavedAuditRecord, 'profile'>): string {
  const base =
    record.profile.razonSocial.trim() ||
    `${record.profile.tipoOrganizacion}-${record.profile.municipio || 'colombia'}`;
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
