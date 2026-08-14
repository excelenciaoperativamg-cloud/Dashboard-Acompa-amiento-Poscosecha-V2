export type Calificacion = 'Sobresaliente' | 'Bueno' | 'En desarrollo' | 'En observación' | '-';

export interface EvaluacionRendimiento {
  idRendimiento?: string;
  llave?: string;
  ano: number;
  semana: string; // e.g. "2026-28"
  fecha?: string; // e.g. "15/07/2026"
  codigo: string; // Matrícula / Código operario
  nombre: string;
  labor: string;
  rendimiento: number;
  meta: number;
  minimo: number;
  observacion?: number; // Rendimiento en observación
  resultadoRendimiento?: Calificacion;
  nuevoAntiguo?: string; // e.g. "En ruta", "Nuevo", "Antiguo"
  fechaIngreso?: string; // e.g. "01/03/2026"
  dia?: number | string; // e.g. 1, 2, 3, 4, 5 (Día en curva de aprendizaje)
  rendimientoEsperado?: number; // Rendimiento o Esperado (meta esperada)
  proceso?: string;
  entrenador?: string;
  registro?: string;
}

export interface EvaluacionCalidad {
  idCalidad?: string;
  llave?: string;
  ano: number;
  semana: string;
  fecha?: string; // e.g. "15/07/2026"
  codigo: string;
  nombre: string;
  labor: string;
  dia?: number | string;
  nuevoAntiguo?: string;
  fechaIngreso?: string;
  proceso?: string;
  entrenador?: string;
  registro?: string;
  porcentajeProcentaje?: number; // legacy field
  porcentajeProceso?: number;    // % Proceso e.g. 88
  porcentajeProducto?: number;   // % Producto e.g. 92
  porcentajeCalidad?: number;    // % CALIDAD e.g. 90 (prioriza el menor entre % Proceso y % Producto)
  metaCalidad?: number;         // Target e.g. 90 (%)
  resultadoCalidad?: Calificacion;
}

export interface PersonaMatricula {
  codigo: string;
  nombre: string;
  cargo?: string;
  area?: string;
  supervisor?: string;
  formador?: string;
}

export interface ConsolidadoPriorizacion {
  id: string;
  semana: string;
  fecha: string;
  codigo: string;
  nombre: string;
  labor: string;
  rendimiento: number;
  metaRendimiento: number;
  minimoRendimiento: number;
  observacionRendimiento?: number;
  promedioProceso?: number; // Promedio de % Proceso
  promedioProducto?: number; // Promedio de % Producto
  porcentajeProceso?: number; // % CALIDAD (promedio priorizando el menor entre % Proceso y % Producto)
  porcentajeProducto?: number; // % Producto promedio si aplica
  metaCalidad: number;
  resultadoRendimiento: Calificacion;
  resultadoCalidad: Calificacion;
  afDiaFormador: number; // #AF/Día Formador
  acompSemSupRuta: number | string; // Acompañamiento/sem Sup Ruta
  acompSemSupProceso: number | string; // Acompañamiento/sem Sup Proceso
  
  // Auxiliary fields for UI drilldown and analysis
  matriculaInfo?: PersonaMatricula;
  areaMatricula?: string;
  cargoMatricula?: string;
  tieneMatricula?: boolean;
  todasLasEvaluacionesRendimiento: EvaluacionRendimiento[];
  todasLasEvaluacionesCalidad: EvaluacionCalidad[];
  nivelPrioridad: 'Alta' | 'Media' | 'Baja';
}

export interface RegistroBajoIndicador {
  id: string;
  semana: string;
  codigo: string;
  nombre: string;
  labor: string;
  formador: string;
  tipoAcompanamiento: string; // e.g. "AF Día Formador", "Acompañamiento Sup Ruta", "Acompañamiento Sup Procesos", "Refuerzo Técnico Calidad", "Plan Mejora Rendimiento"
  porcentajeAcompanamiento: number; // % cumplimiento (e.g. 95, 80, 100, 70)
  metaAcompanamiento?: number; // Target e.g. 100
  indicadorOrigen?: string;
  estadoAcompanamiento?: string;
  fecha?: string;
}

export interface SheetsDataResponse {
  sheetId: string;
  source: 'google_sheets_live' | 'mock_default' | 'user_csv';
  lastUpdated: string;
  semanasDisponibles: string[];
  rendimientoRaw: EvaluacionRendimiento[];
  consolidadoRaw: EvaluacionCalidad[];
  matriculasRaw: PersonaMatricula[];
  bajosIndicadoresRaw?: RegistroBajoIndicador[];
  consolidadoPriorizado: ConsolidadoPriorizacion[];
  error?: string;
}
