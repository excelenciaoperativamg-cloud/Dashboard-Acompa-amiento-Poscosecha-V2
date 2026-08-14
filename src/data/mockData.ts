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
  // Ejemplo exacto de la imagen del usuario: VILLAMIL SUAREZ JENIFER ESTER (Fecha ingreso: 25/05/2026)
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 660, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '26/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 2, rendimiento: 690, rendimientoEsperado: 690, meta: 690, minimo: 520, observacion: 470, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '27/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 3, rendimiento: 740, rendimientoEsperado: 910, meta: 910, minimo: 600, observacion: 550, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '28/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 4, rendimiento: 780, rendimientoEsperado: 940, meta: 940, minimo: 650, observacion: 600, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '29/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 5, rendimiento: 820, rendimientoEsperado: 917, meta: 917, minimo: 700, observacion: 650, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '30/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 6, rendimiento: 865, rendimientoEsperado: 864, meta: 864, minimo: 720, observacion: 680, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-23', fecha: '01/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 7, rendimiento: 890, rendimientoEsperado: 943, meta: 943, minimo: 750, observacion: 700, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-23', fecha: '02/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 8, rendimiento: 909, rendimientoEsperado: 930, meta: 930, minimo: 780, observacion: 720, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-23', fecha: '03/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 9, rendimiento: 950, rendimientoEsperado: 950, meta: 950, minimo: 800, observacion: 750, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-23', fecha: '04/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 10, rendimiento: 989, rendimientoEsperado: 989, meta: 989, minimo: 820, observacion: 770, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-23', fecha: '05/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 11, rendimiento: 1068, rendimientoEsperado: 1000, meta: 1000, minimo: 850, observacion: 800, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-23', fecha: '06/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 12, rendimiento: 956, rendimientoEsperado: 1050, meta: 1050, minimo: 880, observacion: 820, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-24', fecha: '08/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 14, rendimiento: 1029, rendimientoEsperado: 1100, meta: 1100, minimo: 900, observacion: 850, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-24', fecha: '09/06/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', proceso: 'Clasificación', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 15, rendimiento: 1018, rendimientoEsperado: 1250, meta: 1250, minimo: 950, observacion: 900, registro: 'Rendimiento' },

  // Otros operarios de la imagen del usuario
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214501', nombre: 'YOTENGO YANDI DANY YULIANA', labor: 'Armado ramos', proceso: 'Armado', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 600, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214502', nombre: 'Yaritza Alejandra González Otalvarez', labor: 'Mesas', proceso: 'Mesa', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 580, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214503', nombre: 'VILLARRAGA POSADA ANA SOFIA', labor: 'Capuchón', proceso: 'Empaque', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 640, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214504', nombre: 'VILLADIEGO JULIO ELIS DAYANIS', labor: 'Desbotonado', proceso: 'Campo', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 620, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214505', nombre: 'VILLA PINEDA LAURA CAMILA', labor: 'Hidratación', proceso: 'Poscosecha', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 610, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214506', nombre: 'VERGARA AGAMEZ DORIS TATIANA', labor: 'Armado ramos', proceso: 'Armado', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 630, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214507', nombre: 'VELASQUEZ MERCADO CRISTIAN DAVID', labor: 'Mesas', proceso: 'Mesa', nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026', dia: 1, rendimiento: 650, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },

  // Datos del Excel del usuario con "En ruta", Día, Rendimiento y Rendimiento Esperado
  { ano: 2026, semana: '2026-31', fecha: '28/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', proceso: 'Armado de ramo', nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026', dia: 1, rendimiento: 540, rendimientoEsperado: 660, meta: 660, minimo: 500, observacion: 450, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-31', fecha: '29/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', proceso: 'Armado de ramo', nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026', dia: 2, rendimiento: 410, rendimientoEsperado: 700, meta: 700, minimo: 550, observacion: 500, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-31', fecha: '30/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', proceso: 'Armado de ramo', nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026', dia: 3, rendimiento: 714, rendimientoEsperado: 740, meta: 740, minimo: 600, observacion: 550, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-31', fecha: '31/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', proceso: 'Armado de ramo', nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026', dia: 4, rendimiento: 665, rendimientoEsperado: 780, meta: 780, minimo: 650, observacion: 600, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-31', fecha: '01/08/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', proceso: 'Armado de ramo', nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026', dia: 5, rendimiento: 835, rendimientoEsperado: 820, meta: 820, minimo: 700, observacion: 650, registro: 'Rendimiento' },

  { ano: 2026, semana: '2026-31', fecha: '28/07/2026', codigo: '214379', nombre: 'ALCAZAR ALCAZAR MAYBELYS', labor: 'Mesas', proceso: 'Mesa', nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026', dia: 1, rendimiento: 283, rendimientoEsperado: 200, meta: 200, minimo: 180, observacion: 160, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-31', fecha: '29/07/2026', codigo: '214379', nombre: 'ALCAZAR ALCAZAR MAYBELYS', labor: 'Mesas', proceso: 'Mesa', nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026', dia: 2, rendimiento: 308, rendimientoEsperado: 220, meta: 220, minimo: 200, observacion: 180, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-31', fecha: '30/07/2026', codigo: '214379', nombre: 'ALCAZAR ALCAZAR MAYBELYS', labor: 'Mesas', proceso: 'Mesa', nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026', dia: 3, rendimiento: 381, rendimientoEsperado: 230, meta: 230, minimo: 210, observacion: 190, registro: 'Rendimiento' },

  { ano: 2026, semana: '2026-31', fecha: '28/07/2026', codigo: '214380', nombre: 'OYOLA DURANGO MISADAY', labor: 'Mesas', proceso: 'Mesa', nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026', dia: 1, rendimiento: 390, rendimientoEsperado: 200, meta: 200, minimo: 180, observacion: 160, registro: 'Rendimiento' },
  { ano: 2026, semana: '2026-31', fecha: '29/07/2026', codigo: '214380', nombre: 'OYOLA DURANGO MISADAY', labor: 'Mesas', proceso: 'Mesa', nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026', dia: 2, rendimiento: 377, rendimientoEsperado: 220, meta: 220, minimo: 200, observacion: 180, registro: 'Rendimiento' },

  { ano: 2026, semana: '2026-33', fecha: '13/08/2026', codigo: '3511', nombre: 'ESTUPINAN ESTEPA MARIA DEL CARMEN', labor: 'Mesas', proceso: 'Empaque', entrenador: 'CABALLERO GA', nuevoAntiguo: 'En ruta', fechaIngreso: '18/10/2005', dia: 1, rendimiento: 125, rendimientoEsperado: 200, meta: 200, minimo: 180, observacion: 160, registro: 'Rendimiento' },

  // Ejemplo anterior: MARTINEZ MARTINEZ LUIS MANUEL (5 evaluaciones)
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 1, rendimiento: 380, rendimientoEsperado: 400, meta: 400, minimo: 350, observacion: 320, nuevoAntiguo: 'Nuevo', fechaIngreso: '01/06/2026' },
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 2, rendimiento: 390, rendimientoEsperado: 400, meta: 400, minimo: 350, observacion: 320, nuevoAntiguo: 'Nuevo', fechaIngreso: '01/06/2026' },
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 3, rendimiento: 410, rendimientoEsperado: 400, meta: 400, minimo: 350, observacion: 320, nuevoAntiguo: 'Nuevo', fechaIngreso: '01/06/2026' },
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 4, rendimiento: 370, rendimientoEsperado: 400, meta: 400, minimo: 350, observacion: 320, nuevoAntiguo: 'Nuevo', fechaIngreso: '01/06/2026' },
  { ano: 2026, semana: '2026-28', fecha: '17/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 5, rendimiento: 400, rendimientoEsperado: 400, meta: 400, minimo: 350, observacion: 320, nuevoAntiguo: 'Nuevo', fechaIngreso: '01/06/2026' },

  // Semana 2026-28
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Clasificación Rosas', dia: 1, rendimiento: 450, rendimientoEsperado: 420, meta: 420, minimo: 380, observacion: 350, nuevoAntiguo: 'Antiguo', fechaIngreso: '15/01/2024' },
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Desbotonado', dia: 2, rendimiento: 360, rendimientoEsperado: 400, meta: 400, minimo: 350, observacion: 320, nuevoAntiguo: 'Antiguo', fechaIngreso: '15/01/2024' },
  
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Armado de Ramos', dia: 1, rendimiento: 280, rendimientoEsperado: 320, meta: 320, minimo: 290, observacion: 260, nuevoAntiguo: 'En ruta', fechaIngreso: '10/05/2026' },
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Empaque Capuchón', dia: 2, rendimiento: 310, rendimientoEsperado: 320, meta: 320, minimo: 290, observacion: 260, nuevoAntiguo: 'En ruta', fechaIngreso: '10/05/2026' },
  
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1003', nombre: 'Ana Lucía Martínez', labor: 'Enmalle y Capuchón', dia: 1, rendimiento: 500, rendimientoEsperado: 500, meta: 500, minimo: 450, observacion: 400, nuevoAntiguo: 'Antiguo', fechaIngreso: '01/03/2023' },
  
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1004', nombre: 'Carlos Eduardo Pérez', labor: 'Empaque Cajas', dia: 1, rendimiento: 120, rendimientoEsperado: 110, meta: 110, minimo: 95, observacion: 80, nuevoAntiguo: 'En ruta', fechaIngreso: '01/04/2026' },
  
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1005', nombre: 'Diana Patricia Vargas', labor: 'Hidratación', dia: 1, rendimiento: 380, rendimientoEsperado: 400, meta: 400, minimo: 360, observacion: 320, nuevoAntiguo: 'Antiguo', fechaIngreso: '20/11/2024' },
  
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1006', nombre: 'Jorge Iván Jaramillo', labor: 'Desbotonado', dia: 1, rendimiento: 290, rendimientoEsperado: 350, meta: 350, minimo: 310, observacion: 300, nuevoAntiguo: 'En ruta', fechaIngreso: '12/06/2026' },
  
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1007', nombre: 'Sonia Esperanza Morales', labor: 'Clasificación Rosas', dia: 1, rendimiento: 430, rendimientoEsperado: 420, meta: 420, minimo: 380, observacion: 350, nuevoAntiguo: 'Antiguo', fechaIngreso: '05/08/2022' },
  
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1008', nombre: 'Andrés Felipe Castro', labor: 'Armado de Ramos', dia: 1, rendimiento: 320, rendimientoEsperado: 320, meta: 320, minimo: 290, observacion: 260, nuevoAntiguo: 'En ruta', fechaIngreso: '01/05/2026' },
  
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1009', nombre: 'Valeria Restrepo', labor: 'Capuchón', dia: 1, rendimiento: 480, rendimientoEsperado: 450, meta: 450, minimo: 400, observacion: 360, nuevoAntiguo: 'Antiguo', fechaIngreso: '10/10/2023' },
  
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1010', nombre: 'Gabriel Antonio Silva', labor: 'Empaque', dia: 1, rendimiento: 75, rendimientoEsperado: 110, meta: 110, minimo: 95, observacion: 85, nuevoAntiguo: 'En ruta', fechaIngreso: '20/06/2026' },

  // Semana 2026-27
  { ano: 2026, semana: '2026-27', fecha: '07/07/2026', codigo: '1001', nombre: 'María Camila Rodríguez', labor: 'Clasificación Rosas', dia: 1, rendimiento: 410, rendimientoEsperado: 420, meta: 420, minimo: 380, observacion: 350, nuevoAntiguo: 'Antiguo', fechaIngreso: '15/01/2024' },
  { ano: 2026, semana: '2026-27', fecha: '08/07/2026', codigo: '1002', nombre: 'Juan José Gómez', labor: 'Armado de Ramos', dia: 1, rendimiento: 320, rendimientoEsperado: 320, meta: 320, minimo: 290, observacion: 260, nuevoAntiguo: 'En ruta', fechaIngreso: '10/05/2026' },
  { ano: 2026, semana: '2026-27', fecha: '09/07/2026', codigo: '1003', nombre: 'Ana Lucía Martínez', labor: 'Enmalle y Capuchón', dia: 1, rendimiento: 460, rendimientoEsperado: 500, meta: 500, minimo: 450, observacion: 400, nuevoAntiguo: 'Antiguo', fechaIngreso: '01/03/2023' },
  { ano: 2026, semana: '2026-27', fecha: '10/07/2026', codigo: '1004', nombre: 'Carlos Eduardo Pérez', labor: 'Empaque Cajas', dia: 1, rendimiento: 105, rendimientoEsperado: 110, meta: 110, minimo: 95, observacion: 80, nuevoAntiguo: 'En ruta', fechaIngreso: '01/04/2026' }
];

export const MOCK_CONSOLIDADO_CALIDAD: EvaluacionCalidad[] = [
  // PUENTE BLANCO LUIS CARLOS (5 evaluaciones de Calidad para Semana 2026-31)
  { ano: 2026, semana: '2026-31', fecha: '28/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', dia: 1, porcentajeCalidad: 92, porcentajeProceso: 92, porcentajeProducto: 95, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026' },
  { ano: 2026, semana: '2026-31', fecha: '29/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', dia: 2, porcentajeCalidad: 94, porcentajeProceso: 94, porcentajeProducto: 96, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026' },
  { ano: 2026, semana: '2026-31', fecha: '30/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', dia: 3, porcentajeCalidad: 88, porcentajeProceso: 88, porcentajeProducto: 92, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026' },
  { ano: 2026, semana: '2026-31', fecha: '31/07/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', dia: 4, porcentajeCalidad: 96, porcentajeProceso: 96, porcentajeProducto: 98, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026' },
  { ano: 2026, semana: '2026-31', fecha: '01/08/2026', codigo: '214747', nombre: 'PUENTE BLANCO LUIS CARLOS', labor: 'Armado ramos', dia: 5, porcentajeCalidad: 98, porcentajeProceso: 98, porcentajeProducto: 100, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '27/07/2026' },

  // ALCAZAR ALCAZAR MAYBELYS (Semana 2026-31)
  { ano: 2026, semana: '2026-31', fecha: '28/07/2026', codigo: '214379', nombre: 'ALCAZAR ALCAZAR MAYBELYS', labor: 'Mesas', dia: 1, porcentajeCalidad: 90, porcentajeProceso: 90, porcentajeProducto: 92, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026' },
  { ano: 2026, semana: '2026-31', fecha: '29/07/2026', codigo: '214379', nombre: 'ALCAZAR ALCAZAR MAYBELYS', labor: 'Mesas', dia: 2, porcentajeCalidad: 93, porcentajeProceso: 93, porcentajeProducto: 95, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026' },
  { ano: 2026, semana: '2026-31', fecha: '30/07/2026', codigo: '214379', nombre: 'ALCAZAR ALCAZAR MAYBELYS', labor: 'Mesas', dia: 3, porcentajeCalidad: 95, porcentajeProceso: 95, porcentajeProducto: 98, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026' },

  // OYOLA DURANGO MISADAY (Semana 2026-31)
  { ano: 2026, semana: '2026-31', fecha: '28/07/2026', codigo: '214380', nombre: 'OYOLA DURANGO MISADAY', labor: 'Mesas', dia: 1, porcentajeCalidad: 91, porcentajeProceso: 91, porcentajeProducto: 94, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026' },
  { ano: 2026, semana: '2026-31', fecha: '29/07/2026', codigo: '214380', nombre: 'OYOLA DURANGO MISADAY', labor: 'Mesas', dia: 2, porcentajeCalidad: 96, porcentajeProceso: 96, porcentajeProducto: 96, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '14/07/2026' },

  // VILLAMIL SUAREZ JENIFER ESTER (Semana 2026-22 y 2026-23)
  { ano: 2026, semana: '2026-22', fecha: '25/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', dia: 1, porcentajeCalidad: 88, porcentajeProceso: 88, porcentajeProducto: 90, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026' },
  { ano: 2026, semana: '2026-22', fecha: '26/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', dia: 2, porcentajeCalidad: 91, porcentajeProceso: 91, porcentajeProducto: 93, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026' },
  { ano: 2026, semana: '2026-22', fecha: '27/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', dia: 3, porcentajeCalidad: 94, porcentajeProceso: 94, porcentajeProducto: 95, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026' },
  { ano: 2026, semana: '2026-22', fecha: '28/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', dia: 4, porcentajeCalidad: 95, porcentajeProceso: 95, porcentajeProducto: 96, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026' },
  { ano: 2026, semana: '2026-22', fecha: '29/05/2026', codigo: '214500', nombre: 'VILLAMIL SUAREZ JENIFER ESTER', labor: 'Clasificación Rosas', dia: 5, porcentajeCalidad: 97, porcentajeProceso: 97, porcentajeProducto: 98, metaCalidad: 90, nuevoAntiguo: 'En ruta', fechaIngreso: '25/05/2026' },

  // Ejemplo del usuario: MARTINEZ MARTINEZ LUIS MANUEL (5 evaluaciones en Alimentador, promedio 98%)
  { ano: 2026, semana: '2026-28', fecha: '13/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 1, porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '14/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 2, porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '15/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 3, porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '16/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 4, porcentajeCalidad: 100, porcentajeProceso: 100, porcentajeProducto: 100, metaCalidad: 90 },
  { ano: 2026, semana: '2026-28', fecha: '17/07/2026', codigo: '1013', nombre: 'MARTINEZ MARTINEZ LUIS MANUEL', labor: 'Alimentador', dia: 5, porcentajeCalidad: 92, porcentajeProceso: 92, porcentajeProducto: 92, metaCalidad: 90 },

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

