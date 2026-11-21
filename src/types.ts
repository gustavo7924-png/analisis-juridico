export type OrganizationType =
  | 'Microempresa'
  | 'Pequeña empresa'
  | 'Mediana empresa'
  | 'Gran empresa'
  | 'Cooperativa'
  | 'Fundación'
  | 'Corporación / Asociación'
  | 'ONG';

export type ClientType =
  | 'B2C (Consumidor final)'
  | 'B2B (Empresas)'
  | 'Estado (Contratación Pública)'
  | 'Mixto (B2C y B2B)'
  | 'No especificado';

export type FunctionalAreaName =
  | 'Constitución / Societario'
  | 'Talento Humano y SST'
  | 'Contratación y Consumidor'
  | 'Producto / Propiedad Intelectual / Ambiental'
  | 'Contabilidad / Tributario / Prevención de Lavado de Activos';

export type RiskLevel = 'CRÍTICO' | 'ALTO' | 'MEDIO';

export interface CompanyProfile {
  razonSocial: string;
  tipoOrganizacion: OrganizationType;
  ciiu: string;
  actividadEconomica: string;
  municipio: string;
  numeroEmpleados: string;
  numeroContratistas: string;
  rangoActivosIngresos: string;
  tipoCliente: ClientType;
  manejaDatosPersonales: boolean;
  comercioElectronico: boolean;
  establecimientoAbierto: boolean;
  contratacionEstatal: boolean;
  registroInvima: boolean;
  impactoAmbiental: boolean;
  propiedadIntelectual: boolean;
  comercioExterior: boolean;
  recursosCooperacionESAL: boolean;
  productosServicios: string[];
  consultaEspecificaInicial: string;
}

export interface ProductServiceLegalAnalysis {
  productoServicio: string;
  clasificacionJuridica: string;
  normasQueLoCobijan: string;
  requisitosHabilitantes: string;
  entidadReguladora: string;
  analisisJuridicoProfundo: string;
}

export interface MatrixRow {
  areaProceso: string;
  normaAplicable: string;
  obligacionEspecifica: string;
  entidadVigilanteIVC: string;
  riesgoYSancion: string;
  nivelRiesgo: RiskLevel;
}

export interface FunctionalAreaMatrix {
  areaNombre: FunctionalAreaName;
  justificacionArea: string;
  filas: MatrixRow[];
}

export interface CriticalAlert {
  titulo: string;
  areaAfectada: string;
  normaVulnerada: string;
  impactoYSancion: string;
  accionInmediata: string;
}

export interface LegalAuditResult {
  resumenEjecutivo: string;
  supuestosYAlertasVerificacion: string[];
  areas: FunctionalAreaMatrix[];
  alertasCriticas: CriticalAlert[];
  resumenClasificacionPortafolio?: string;
  analisisProductosServicios?: ProductServiceLegalAnalysis[];
  respuestaConsultaEspecifica: string;
}

export interface FollowUpEntry {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface SavedAuditRecord {
  id: string;
  createdAt: string;
  profile: CompanyProfile;
  result: LegalAuditResult;
  followUps: FollowUpEntry[];
}
