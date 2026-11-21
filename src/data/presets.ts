import { CompanyProfile, OrganizationType } from '../types';

export interface OrganizationPreset {
  id: string;
  label: string;
  summary: string;
  profile: CompanyProfile;
}

export const EMPTY_PROFILE: CompanyProfile = {
  razonSocial: '',
  tipoOrganizacion: 'Microempresa',
  ciiu: '',
  actividadEconomica: '',
  municipio: '',
  numeroEmpleados: '',
  numeroContratistas: '',
  rangoActivosIngresos: 'No especificado (generar alerta de verificación)',
  tipoCliente: 'Mixto (B2C y B2B)',
  manejaDatosPersonales: true,
  comercioElectronico: false,
  establecimientoAbierto: false,
  contratacionEstatal: false,
  registroInvima: false,
  impactoAmbiental: false,
  propiedadIntelectual: false,
  comercioExterior: false,
  recursosCooperacionESAL: false,
  productosServicios: [],
  consultaEspecificaInicial: '',
};

export const ORGANIZATION_TYPES: {
  value: OrganizationType;
  label: string;
  detail: string;
}[] = [
  {
    value: 'Microempresa',
    label: 'Microempresa',
    detail: 'Sociedad o PN con ingresos dentro del rango micro (D. 957/2019)',
  },
  {
    value: 'Pequeña empresa',
    label: 'Pequeña empresa',
    detail: 'Operación consolidada con nómina y estructura societaria formal',
  },
  {
    value: 'Mediana empresa',
    label: 'Mediana empresa',
    detail: 'Mayor exposición a topes de Revisoría, SAGRILAFT o PTEE',
  },
  {
    value: 'Gran empresa',
    label: 'Gran empresa',
    detail: 'Vigilancia plena SuperSociedades, SAGRILAFT, PTEE y grandes contribuyentes',
  },
  {
    value: 'Cooperativa',
    label: 'Cooperativa',
    detail: 'Economía solidaria vigilada por Supersolidaria (Ley 79/1988 y 454/1998)',
  },
  {
    value: 'Fundación',
    label: 'Fundación',
    detail: 'ESAL con patrimonio afectado a fin de interés general y RTE',
  },
  {
    value: 'Corporación / Asociación',
    label: 'Corporación / Asociación',
    detail: 'ESAL gremial o asociativa sujeta a control de Gobernación o Alcaldía',
  },
  {
    value: 'ONG',
    label: 'ONG',
    detail: 'Organización no gubernamental con proyectos sociales y cooperación',
  },
];

export const COMMON_CIIU_CODES: { code: string; desc: string }[] = [
  { code: '6201', desc: 'Actividades de desarrollo de sistemas informáticos (software)' },
  { code: '4711', desc: 'Comercio al por menor en establecimientos no especializados' },
  { code: '1089', desc: 'Elaboración de otros productos alimenticios n.c.p.' },
  { code: '8559', desc: 'Otros tipos de educación n.c.p.' },
  { code: '7020', desc: 'Actividades de consultoría de gestión' },
  { code: '6499', desc: 'Otras actividades de servicio financiero / solidario' },
  { code: '8899', desc: 'Otras actividades de asistencia social sin alojamiento (ESAL/ONG)' },
];

export const COMMON_MUNICIPALITIES = [
  'Bogotá D.C.',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Bucaramanga',
  'Cartagena de Indias',
];

export const INCOME_RANGES = [
  'No especificado (generar alerta de verificación)',
  'Hasta 23.563 UVT anuales (Microempresa servicios/comercio)',
  'Entre 23.564 y 204.995 UVT anuales (Pequeña empresa)',
  'Entre 204.996 y 1.736.565 UVT anuales (Mediana empresa)',
  'Activos o ingresos entre 30.000 y 40.000 SMMLV (Alerta PTEE/SAGRILAFT)',
  'Superior a 40.000 SMMLV en ingresos o activos (Obligado SAGRILAFT / Revisoría)',
];

export const SPECIFIC_QUERY_SUGGESTIONS = [
  '¿Estamos obligados a implementar SAGRILAFT o Programa de Transparencia y Ética Empresarial (PTEE)?',
  '¿Qué requisitos debemos cumplir para mantener o calificar en el Régimen Tributario Especial (RTE)?',
  '¿Cómo debemos estructurar el SG-SST y el Comité de Convivencia Laboral según nuestra planta actual?',
  '¿Qué obligaciones aplican frente al Registro Nacional de Bases de Datos (RNBD) y Habeas Data?',
];

export const ORGANIZATION_PRESETS: OrganizationPreset[] = [
  {
    id: 'micro-comercio-bogota',
    label: 'Microempresa Comercio · Bogotá',
    summary: '4 empleados · Local comercial y ventas B2C en línea · CIIU 4711',
    profile: {
      razonSocial: 'Comercializadora Andina S.A.S.',
      tipoOrganizacion: 'Microempresa',
      ciiu: '4711',
      actividadEconomica: 'Comercio al por menor en establecimientos y comercio electrónico',
      municipio: 'Bogotá D.C.',
      numeroEmpleados: '4',
      numeroContratistas: '1',
      rangoActivosIngresos: 'Hasta 23.563 UVT anuales (Microempresa servicios/comercio)',
      tipoCliente: 'B2C (Consumidor final)',
      manejaDatosPersonales: true,
      comercioElectronico: true,
      establecimientoAbierto: true,
      contratacionEstatal: false,
      registroInvima: false,
      impactoAmbiental: false,
      propiedadIntelectual: true,
      comercioExterior: false,
      recursosCooperacionESAL: false,
      productosServicios: [
        'Venta presencial y en línea de calzado y marroquinería nacional',
        'Accesorios electrónicos de consumo importados de terceros',
        'Garantías y cambios de mercancía para consumidor final (B2C)',
      ],
      consultaEspecificaInicial:
        '¿Qué obligaciones tenemos frente al derecho de retracto, reversión de pago y avisos de establecimiento abierto al público en Bogotá?',
    },
  },
  {
    id: 'pyme-tech-medellin',
    label: 'Pequeña Empresa Software · Medellín',
    summary: '22 empleados · B2B y contratos internacionales · CIIU 6201',
    profile: {
      razonSocial: 'Nube Abierta Ingeniería S.A.S.',
      tipoOrganizacion: 'Pequeña empresa',
      ciiu: '6201',
      actividadEconomica: 'Desarrollo de software empresarial SaaS y consultoría TI',
      municipio: 'Medellín',
      numeroEmpleados: '22',
      numeroContratistas: '5',
      rangoActivosIngresos: 'Entre 23.564 y 204.995 UVT anuales (Pequeña empresa)',
      tipoCliente: 'B2B (Empresas)',
      manejaDatosPersonales: true,
      comercioElectronico: false,
      establecimientoAbierto: false,
      contratacionEstatal: true,
      registroInvima: false,
      impactoAmbiental: false,
      propiedadIntelectual: true,
      comercioExterior: true,
      recursosCooperacionESAL: false,
      productosServicios: [
        'Licenciamiento de software SaaS en la nube para empresas (B2B)',
        'Desarrollo de software a la medida e integración API',
        'Soporte técnico y alojamiento de bases de datos corporativas',
      ],
      consultaEspecificaInicial:
        '¿Cómo debemos blindar la titularidad patrimonial del software desarrollado por empleados y contratistas y qué obligaciones cambiarias aplican al exportar servicios?',
    },
  },
  {
    id: 'fundacion-ong-cali',
    label: 'Fundación / ONG · Cali',
    summary: '11 empleados · Asistencia social y cooperación internacional · CIIU 8899',
    profile: {
      razonSocial: 'Fundación Raíces del Pacífico',
      tipoOrganizacion: 'Fundación',
      ciiu: '8899',
      actividadEconomica: 'Programas educativos, asistencia social y gestión de cooperación internacional',
      municipio: 'Cali',
      numeroEmpleados: '11',
      numeroContratistas: '6',
      rangoActivosIngresos: 'Hasta 23.563 UVT anuales (Microempresa servicios/comercio)',
      tipoCliente: 'Mixto (B2C y B2B)',
      manejaDatosPersonales: true,
      comercioElectronico: false,
      establecimientoAbierto: false,
      contratacionEstatal: true,
      registroInvima: false,
      impactoAmbiental: false,
      propiedadIntelectual: false,
      comercioExterior: false,
      recursosCooperacionESAL: true,
      productosServicios: [
        'Programas de educación informal y talleres comunitarios presenciales',
        'Ejecución de convenios sociales con entidades públicas y cooperación internacional',
        'Recepción de donaciones deducibles y emisión de certificados',
      ],
      consultaEspecificaInicial:
        '¿Qué plazos y documentos exige la actualización anual del Régimen Tributario Especial (RTE) ante la DIAN y qué reportes debemos rendir a la Gobernación del Valle?',
    },
  },
  {
    id: 'cooperativa-barranquilla',
    label: 'Cooperativa Multiactiva · Barranquilla',
    summary: '38 empleados · Servicios y crédito a asociados · CIIU 6499',
    profile: {
      razonSocial: 'Cooperativa Multiactiva del Caribe',
      tipoOrganizacion: 'Cooperativa',
      ciiu: '6499',
      actividadEconomica: 'Servicios solidarios de aporte y crédito, consumo y bienestar para asociados',
      municipio: 'Barranquilla',
      numeroEmpleados: '38',
      numeroContratistas: '4',
      rangoActivosIngresos: 'Entre 204.996 y 1.736.565 UVT anuales (Mediana empresa)',
      tipoCliente: 'B2C (Consumidor final)',
      manejaDatosPersonales: true,
      comercioElectronico: false,
      establecimientoAbierto: true,
      contratacionEstatal: false,
      registroInvima: false,
      impactoAmbiental: false,
      propiedadIntelectual: false,
      comercioExterior: false,
      recursosCooperacionESAL: false,
      productosServicios: [
        'Colocación de créditos de consumo y libranza para asociados',
        'Captación de aportes sociales y depósitos de ahorro',
        'Convenios de bienestar, educación cooperativa y microseguros',
      ],
      consultaEspecificaInicial:
        '¿Cuáles son las exigencias de SARLAFT y gobierno cooperativo que vigila la Supersolidaria para cooperativas con sección de aporte y crédito?',
    },
  },
];
