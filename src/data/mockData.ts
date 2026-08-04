import { EvaluacionRendimiento, EvaluacionCalidad, PersonaMatricula, RegistroBajoIndicador } from '../types';

export const MOCK_MATRICULAS: PersonaMatricula[] = [
  { codigo: '1001', nombre: 'María Camila Rodríguez', cargo: 'Operario Poscosecha', area: 'Clasificación' },
  { codigo: '1002', nombre: 'Juan José Gómez', cargo: 'Operario Poscosecha', area: 'Armado de Ramos' },
  { codigo: '1003', nombre: 'Ana Lucía Martínez', cargo: 'Operario Poscosecha', area: 'Enmalle y Capuchón' },
  { codigo: '1004', nombre: 'Carlos Eduardo Pérez', cargo: 'Operario Poscosecha', area: 'Empaque' },
  { codigo: '1005', nombre: 'Diana Patricia Vargas', cargo: 'Operario Poscosecha', area: 'Hidratación' },
  { codigo: '1006', nombre: 'Jorge Iván Jaramillo', cargo: 'Operario Poscosecha', area: 'Desbotonado' },
  { codigo: '1007', nombre: 'Sonia Esperanza Morales', cargo: 'Operario Poscosecha', area: 'Clasificación' },
  { codigo: '1008', nombre: 'Andrés Felipe Castro', cargo: 'Operario Poscosecha', area: 'Armado de Ramos' },
  { codigo: '1009', nombre: 'Valeria Restrepo', cargo: 'Operario Poscosecha', area: 'Capuchón' },
  { codigo: '1010', nombre: 'Gabriel Antonio Silva', cargo: 'Operario Poscosecha', area: 'Empaque' },
  { codigo: '1011', nombre: 'Martha Isabel Londoño', cargo: 'Operario Poscosecha', area: 'Selección Capullos' },
  { codigo: '1012', nombre: 'Santiago Moreno', cargo: 'Operario Poscosecha', area: 'Enmalle' },
  { codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', cargo: 'Operario Poscosecha', area: 'Alimentador' }
];

export const MOCK_RENDIMIENTO: EvaluacionRendimiento[] = [
  // Ejemplo del usuario: MARTINEZ MARTINEZ LUIS MANUEL (5 evaluaciones en Alimentador)
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', rendimiento: 380, meta: 400, minimo: 350, observacion: 320 },
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', rendimiento: 390, meta: 400, minimo: 350, observacion: 320 },
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', rendimiento: 410, meta: 400, minimo: 350, observacion: 320 },
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', rendimiento: 370, meta: 400, minimo: 350, observacion: 320 },
  { ano: 2026, semana: '2026-28', fecha: '17/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', rendimiento: 400, meta: 400, minimo: 350, observacion: 320 },

  // Semana 2026-28
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Clasificación Rosas', rendimiento: 450, meta: 420, minimo: 380, observacion: 350 },
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Desbotonado', rendimiento: 360, meta: 400, minimo: 350, observacion: 320 }, // Bueno (360 entre 400 y 350)
  
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Armado de Ramos', rendimiento: 280, meta: 320, minimo: 290, observacion: 260 }, // En desarrollo (280 entre minimo 290 y obs 260)
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Empaque Capuchón', rendimiento: 310, meta: 320, minimo: 290, observacion: 260 }, // Bueno
  
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1003', nombre: 'Ana Lucía Martínez', labor: 'Enmalle y Capuchón', rendimiento: 500, meta: 500, minimo: 450, observacion: 400 }, // Bueno
  
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1004', nombre: 'Carlos Eduardo Pérez', labor: 'Empaque Cajas', rendimiento: 120, meta: 110, minimo: 95, observacion: 80 }, // Sobresaliente
  
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1005', nombre: 'Diana Patricia Vargas', labor: 'Hidratación', rendimiento: 380, meta: 400, minimo: 360, observacion: 320 }, // Bueno
  
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1006', nombre: 'Jorge Iván Jaramillo', labor: 'Desbotonado', rendimiento: 290, meta: 350, minimo: 310, observacion: 300 }, // En observación (< 300)
  
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1007', nombre: 'Sonia Esperanza Morales', labor: 'Clasificación Rosas', rendimiento: 430, meta: 420, minimo: 380, observacion: 350 }, // Sobresaliente
  
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1008', nombre: 'Andrés Felipe Castro', labor: 'Armado de Ramos', rendimiento: 320, meta: 320, minimo: 290, observacion: 260 }, // Bueno
  
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1009', nombre: 'Valeria Restrepo', labor: 'Capuchón', rendimiento: 480, meta: 450, minimo: 400, observacion: 360 }, // Sobresaliente
  
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1010', nombre: 'Gabriel Antonio Silva', labor: 'Empaque', rendimiento: 75, meta: 110, minimo: 95, observacion: 85 }, // En observación (< 85)

  // Semana 2026-27
  { ano: 2026, semana: '2026-27', fecha: '07/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Clasificación Rosas', rendimiento: 410, meta: 420, minimo: 380, observacion: 350 },
  { ano: 2026, semana: '2026-27', fecha: '08/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Armado de Ramos', rendimiento: 320, meta: 320, minimo: 290, observacion: 260 },
  { ano: 2026, semana: '2026-27', fecha: '09/07/2026', codigo: '1003', nombre: 'Ana Lucía Martínez', labor: 'Enmalle y Capuchón', rendimiento: 460, meta: 500, minimo: 450, observacion: 400 },
  { ano: 2026, semana: '2026-27', fecha: '10/07/2026', codigo: '1004', nombre: 'Carlos Eduardo Pérez', labor: 'Empaque Cajas', rendimiento: 105, meta: 110, minimo: 95, observacion: 80 }
];

export const MOCK_CONSOLIDADO_CALIDAD: EvaluacionCalidad[] = [
  // Ejemplo del usuario: MARTINEZ MARTINEZ LUIS MANUEL (5 evaluaciones en Alimentador, promedio 98%)
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '17/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', porcentajeCalidad: 92, porcentajeProceso: 92, porcentajeProducto: 92, metaCalidad: 90 },

  // Semana 2026-28
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Clasificación Rosas', porcentajeCalidad: 95, porcentajeProceso: 96, porcentajeProducto: 94, metaCalidad: 90 }, // Sobresaliente
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Desbotonado', porcentajeCalidad: 88, porcentajeProceso: 88, porcentajeProducto: 88, metaCalidad: 90 }, // En desarrollo

  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Armado de Ramos', porcentajeCalidad: 82, porcentajeProceso: 80, porcentajeProducto: 84, metaCalidad: 90 }, // En observación (< 85%)

  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1003', nombre: 'Ana Lucía Martínez', labor: 'Enmalle y Capuchón', porcentajeCalidad: 90, porcentajeProceso: 90, porcentajeProducto: 90, metaCalidad: 90 }, // Bueno

  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1004', nombre: 'Carlos Eduardo Pérez', labor: 'Empaque Cajas', porcentajeCalidad: 96, porcentajeProceso: 95, porcentajeProducto: 97, metaCalidad: 90 }, // Sobresaliente

  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1005', nombre: 'Diana Patricia Vargas', labor: 'Hidratación', porcentajeCalidad: 87, porcentajeProceso: 86, porcentajeProducto: 88, metaCalidad: 90 }, // En desarrollo

  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1006', nombre: 'Jorge Iván Jaramillo', labor: 'Desbotonado', porcentajeCalidad: 81, porcentajeProceso: 82, porcentajeProducto: 80, metaCalidad: 90 }, // En observación

  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1007', nombre: 'Sonia Esperanza Morales', labor: 'Clasificación Rosas', porcentajeCalidad: 92, porcentajeProceso: 92, porcentajeProducto: 92, metaCalidad: 90 }, // Sobresaliente

  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1008', nombre: 'Andrés Felipe Castro', labor: 'Armado de Ramos', porcentajeCalidad: 89, porcentajeProceso: 89, porcentajeProducto: 89, metaCalidad: 90 }, // En desarrollo

  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1009', nombre: 'Valeria Restrepo', labor: 'Capuchón', porcentajeCalidad: 94, porcentajeProceso: 94, porcentajeProducto: 94, metaCalidad: 90 }, // Sobresaliente

  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1010', nombre: 'Gabriel Antonio Silva', labor: 'Empaque', porcentajeCalidad: 84, porcentajeProceso: 84, porcentajeProducto: 84, metaCalidad: 90 }, // En observación

  // Semana 2026-27
  { ano: 2026, semana: '2026-27', fecha: '07/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Clasificación Rosas', porcentajeCalidad: 91, porcentajeProceso: 91, porcentajeProducto: 91, metaCalidad: 90 },
  { ano: 2026, semana: '2026-27', fecha: '08/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Armado de Ramos', porcentajeCalidad: 88, porcentajeProceso: 88, porcentajeProducto: 88, metaCalidad: 90 },
  { ano: 2026, semana: '2026-27', fecha: '09/07/2026', codigo: '1003', nombre: 'Ana Lucía Martínez', labor: 'Enmalle y Capuchón', porcentajeCalidad: 92, porcentajeProceso: 92, porcentajeProducto: 92, metaCalidad: 90 },
  { ano: 2026, semana: '2026-27', fecha: '10/07/2026', codigo: '1004', nombre: 'Carlos Eduardo Pérez', labor: 'Empaque Cajas', porcentajeCalidad: 94, porcentajeProceso: 94, porcentajeProducto: 94, metaCalidad: 90 }
];

export const MOCK_BAJOS_INDICADORES: RegistroBajoIndicador[] = [
  // Semana 2026-28 (6 registros)
  {
    id: 'bi-1',
    semana: '2026-28',
    codigo: '210334',
    nombre: 'RICO OSPINO CARLOS EDUARDO',
    labor: 'Empaque Cajas',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Otro',
    porcentajeAcompanamiento: 100,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '08/07/2026'
  },
  {
    id: 'bi-2',
    semana: '2026-28',
    codigo: '210335',
    nombre: 'PEREZ CAMARGO CECIA SARAY',
    labor: 'Clasificación',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Aspecto positivo',
    porcentajeAcompanamiento: 100,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Seguimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '09/07/2026'
  },
  {
    id: 'bi-3',
    semana: '2026-28',
    codigo: '210336',
    nombre: 'MONTILLA CABRERA LEONARDO',
    labor: 'Desbotonado',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 85,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'En Proceso',
    fecha: '10/07/2026'
  },
  {
    id: 'bi-4',
    semana: '2026-28',
    codigo: '210337',
    nombre: 'MARIMON PEREZ ZULAY CAROLINA',
    labor: 'Armado ramos',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 90,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '08/07/2026'
  },
  {
    id: 'bi-5',
    semana: '2026-28',
    codigo: '210338',
    nombre: 'JURADO OQUENDO MERLYS',
    labor: 'Capuchón',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 75,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'En Proceso',
    fecha: '09/07/2026'
  },
  {
    id: 'bi-6',
    semana: '2026-28',
    codigo: '210339',
    nombre: 'GUETTE CASSIANI NORVEY',
    labor: 'Armado ramos',
    formador: 'Yuleidys Pedrozo',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 92,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '10/07/2026'
  },

  // Semana 2026-29 (6 registros)
  {
    id: 'bi-7',
    semana: '2026-29',
    codigo: '210340',
    nombre: 'GONZALEZ CHACIN ELIANDIS CAROLINA',
    labor: 'Armado ramos',
    formador: 'Yuleidys Pedrozo',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 88,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '14/07/2026'
  },
  {
    id: 'bi-8',
    semana: '2026-29',
    codigo: '210340',
    nombre: 'GONZALEZ CHACIN ELIANDIS CAROLINA',
    labor: 'Armado ramos',
    formador: 'Yuleidys Pedrozo',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 95,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'Completado',
    fecha: '15/07/2026'
  },
  {
    id: 'bi-9',
    semana: '2026-29',
    codigo: '210341',
    nombre: 'URBINA CANASTO JEFFERSON DAVID',
    labor: 'Hidratación',
    formador: 'Yuleidys Pedrozo',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 82,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'En Proceso',
    fecha: '16/07/2026'
  },
  {
    id: 'bi-10',
    semana: '2026-29',
    codigo: '210342',
    nombre: 'MARTINEZ MARTINEZ LUIS MANUEL',
    labor: 'Alimentador',
    formador: 'Nidia Gomez Madero',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 94,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '15/07/2026'
  },
  {
    id: 'bi-11',
    semana: '2026-29',
    codigo: '210343',
    nombre: 'JARAMILLO JORGE IVAN',
    labor: 'Desbotonado',
    formador: 'Nidia Gomez Madero',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 78,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'En Proceso',
    fecha: '15/07/2026'
  },
  {
    id: 'bi-12',
    semana: '2026-29',
    codigo: '210344',
    nombre: 'SILVA GABRIEL ANTONIO',
    labor: 'Empaque',
    formador: 'Diana Gabriela Pedraza',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 96,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'Completado',
    fecha: '16/07/2026'
  },

  // Semana 2026-30 (10 registros - Total 22)
  {
    id: 'bi-13',
    semana: '2026-30',
    codigo: '210345',
    nombre: 'RODRIGUEZ MARIA CAMILA',
    labor: 'Clasificación',
    formador: 'Diana Gabriela Pedraza',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 88,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'En Proceso',
    fecha: '21/07/2026'
  },
  {
    id: 'bi-14',
    semana: '2026-30',
    codigo: '210346',
    nombre: 'CASTRO ANDRES FELIPE',
    labor: 'Armado de Ramos',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 91,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '22/07/2026'
  },
  {
    id: 'bi-15',
    semana: '2026-30',
    codigo: '210347',
    nombre: 'GOMEZ JUAN JOSE',
    labor: 'Poscosecha',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 95,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '21/07/2026'
  },
  {
    id: 'bi-16',
    semana: '2026-30',
    codigo: '210348',
    nombre: 'VARGAS DIANA PATRICIA',
    labor: 'Hidratación',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 87,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '22/07/2026'
  },
  {
    id: 'bi-17',
    semana: '2026-30',
    codigo: '210334',
    nombre: 'RICO OSPINO CARLOS EDUARDO',
    labor: 'Empaque Cajas',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 90,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'Completado',
    fecha: '23/07/2026'
  },
  {
    id: 'bi-18',
    semana: '2026-30',
    codigo: '210335',
    nombre: 'PEREZ CAMARGO CECIA SARAY',
    labor: 'Clasificación',
    formador: 'Yuleidys Pedrozo',
    tipoAcompanamiento: 'Rendimiento',
    porcentajeAcompanamiento: 85,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Bajo Rendimiento',
    estadoAcompanamiento: 'En Proceso',
    fecha: '23/07/2026'
  },
  {
    id: 'bi-19',
    semana: '2026-30',
    codigo: '210336',
    nombre: 'MONTILLA CABRERA LEONARDO',
    labor: 'Desbotonado',
    formador: 'Nidia Gomez Madero',
    tipoAcompanamiento: 'Aspecto positivo',
    porcentajeAcompanamiento: 100,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Seguimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '24/07/2026'
  },
  {
    id: 'bi-20',
    semana: '2026-30',
    codigo: '210337',
    nombre: 'MARIMON PEREZ ZULAY CAROLINA',
    labor: 'Armado ramos',
    formador: 'Diana Gabriela Pedraza',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 92,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'Completado',
    fecha: '24/07/2026'
  },
  {
    id: 'bi-21',
    semana: '2026-30',
    codigo: '210338',
    nombre: 'JURADO OQUENDO MERLYS',
    labor: 'Capuchón',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Otro',
    porcentajeAcompanamiento: 100,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Seguimiento',
    estadoAcompanamiento: 'Completado',
    fecha: '25/07/2026'
  },
  {
    id: 'bi-22',
    semana: '2026-30',
    codigo: '210339',
    nombre: 'GUETTE CASSIANI NORVEY',
    labor: 'Armado ramos',
    formador: 'Leysla Rodriguez',
    tipoAcompanamiento: 'Calidad',
    porcentajeAcompanamiento: 89,
    metaAcompanamiento: 100,
    indicadorOrigen: 'Baja Calidad',
    estadoAcompanamiento: 'En Proceso',
    fecha: '25/07/2026'
  }
];

