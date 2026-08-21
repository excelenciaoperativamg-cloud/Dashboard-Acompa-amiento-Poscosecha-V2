import {
  Calificacion,
  EvaluacionRendimiento,
  EvaluacionCalidad,
  PersonaMatricula,
  ConsolidadoPriorizacion
} from '../types';

export const RANKING_SCORE: Record<Calificacion, number> = {
  'En observación': 1,
  'En desarrollo': 2,
  'Bueno': 3,
  'Sobresaliente': 4,
  '-': 0
};

/**
 * Evalúa el rendimiento según los parámetros actualizados:
 * - Sobresaliente: es mayor o igual a la meta
 * - Bueno: es menor a la meta y mayor al mínimo
 * - En Desarrollo: igual o menor al mínimo y mayor en Observación
 * - En Observación: menor o igual a En Observación
 */
export function evaluarRendimiento(
  rendimiento: number,
  meta: number,
  minimo: number,
  observacion?: number
): Calificacion {
  if (rendimiento === undefined || rendimiento === null || isNaN(rendimiento) || rendimiento <= 0) {
    return '-';
  }
  const obsThreshold = (observacion !== undefined && observacion > 0)
    ? observacion
    : Math.round(minimo * 0.9);

  if (rendimiento >= meta) {
    return 'Sobresaliente';
  }
  if (rendimiento < meta && rendimiento > minimo) {
    return 'Bueno';
  }
  if (rendimiento <= minimo && rendimiento > obsThreshold) {
    return 'En desarrollo';
  }
  return 'En observación';
}

/**
 * Evalúa la calidad (% Calidad):
 * > 90% -> Sobresaliente
 * == 90% -> Bueno
 * < 90% y >= 85% -> En desarrollo
 * < 85% -> En observación
 * Sin dato (undefined / NaN) -> '-'
 */
export function evaluarCalidad(porcentajeCalidad?: number): Calificacion {
  if (porcentajeCalidad === undefined || porcentajeCalidad === null || isNaN(porcentajeCalidad)) {
    return '-';
  }
  // Aseguramos que el valor esté en escala 0-100 (si viene en 0.90 -> 90)
  const val = porcentajeCalidad <= 1 ? porcentajeCalidad * 100 : porcentajeCalidad;
  if (val > 90) {
    return 'Sobresaliente';
  }
  if (val === 90) {
    return 'Bueno';
  }
  if (val < 90 && val >= 85) {
    return 'En desarrollo';
  }
  return 'En observación';
}

/**
 * Matriz de Decisión para #AF/Día Formador
 */
export function calcularAfDiaFormador(calidad: Calificacion, rendimiento: Calificacion): number {
  if (calidad === 'Sobresaliente') {
    if (rendimiento === 'Sobresaliente') return 1;
    if (rendimiento === 'Bueno') return 2;
    if (rendimiento === 'En desarrollo') return 3;
    if (rendimiento === 'En observación') return 3;
  }
  if (calidad === 'Bueno') {
    if (rendimiento === 'Sobresaliente') return 2;
    if (rendimiento === 'Bueno') return 2;
    if (rendimiento === 'En desarrollo') return 3;
    if (rendimiento === 'En observación') return 3;
  }
  if (calidad === 'En desarrollo') {
    return 3;
  }
  if (calidad === 'En observación') {
    return 3;
  }
  return 3;
}

/**
 * Acompañamiento/sem Sup Ruta (Basado en Calidad)
 */
export function calcularAcompSupRuta(calidad: Calificacion): number {
  switch (calidad) {
    case 'Sobresaliente':
    case 'Bueno':
      return 0;
    case 'En desarrollo':
    case 'En observación':
      return 1;
  }
}

/**
 * Acompañamiento/sem Sup Proceso (Basado en Rendimientos)
 */
export function calcularAcompSupProceso(rendimiento: Calificacion): number {
  switch (rendimiento) {
    case 'Sobresaliente':
    case 'Bueno':
      return 0;
    case 'En desarrollo':
    case 'En observación':
      return 1;
  }
}

export function formatFechaFallback(semana: string, fechaActual?: string): string {
  if (fechaActual && fechaActual.trim() !== '') {
    return fechaActual.trim();
  }
  if (semana && semana.includes('-')) {
    const parts = semana.split('-');
    const year = parseInt(parts[0], 10) || 2026;
    const week = parseInt(parts[1], 10) || 28;
    const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
    const day = String(simpleDate.getDate()).padStart(2, '0');
    const month = String(simpleDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  return '15/07/2026';
}

/**
 * Integra y consolida las hojas Rendimiento, Consolidado y Matrículas
 * agrupando por Llave: Semana + Trabajador (Código/Nombre) + Labor.
 * 
 * Si un trabajador tiene múltiples evaluaciones para la misma labor en la semana,
 * se promedian sus valores de rendimiento y calidad (% Proceso) y se evalúan
 * contra las Tablas de Decisión.
 */
export function consolidarPriorizacion(
  rendimientoList: EvaluacionRendimiento[],
  consolidadoList: EvaluacionCalidad[],
  matriculasList: PersonaMatricula[]
): ConsolidadoPriorizacion[] {
  // Mapa de Matrículas para lookup rápido por código
  const mapaMatriculas = new Map<string, PersonaMatricula>();
  // Mapa de Nombres a Matrícula para fallback
  const mapaNombresMatricula = new Map<string, PersonaMatricula>();
  matriculasList.forEach((m) => {
    if (m.codigo) {
      mapaMatriculas.set(m.codigo.trim().toLowerCase(), m);
    }
    if (m.nombre) {
      mapaNombresMatricula.set(m.nombre.trim().toLowerCase(), m);
    }
  });

  // Agrupamiento por Semana + Trabajador + Labor
  type GroupKey = string; // e.g., "2026-28__1013__alimentador"
  interface UserLaborGroup {
    semana: string;
    codigo: string;
    nombre: string;
    labor: string;
    matriculaInfo?: PersonaMatricula;
    rendimientos: EvaluacionRendimiento[];
    calidades: EvaluacionCalidad[];
  }

  const grupos = new Map<GroupKey, UserLaborGroup>();

  const getOrCreateGroup = (
    semana: string,
    codigo: string,
    rawNombre: string,
    labor: string
  ) => {
    const semClean = semana.trim();
    const codClean = codigo ? codigo.trim().toLowerCase() : '';
    const nomClean = rawNombre ? rawNombre.trim() : '';
    const laborClean = labor && labor.trim() !== '' ? labor.trim().replace(/\s+/g, ' ') : 'Poscosecha General';

    // Resolver matrícula si sólo tenemos código o nombre
    const matricula = (codClean ? mapaMatriculas.get(codClean) : undefined) ||
                      (nomClean ? mapaNombresMatricula.get(nomClean.toLowerCase()) : undefined);

    const codigoFinal = codigo ? codigo.trim() : (matricula?.codigo || '');
    const nombreFinal = matricula?.nombre || nomClean || `Operario ${codigoFinal}`;

    // Identificador único del trabajador (código oficial o nombre normalizado)
    const workerId = (codigoFinal ? codigoFinal.toLowerCase() : nombreFinal.toLowerCase());
    const key = `${semClean}__${workerId}__${laborClean.toLowerCase()}`;

    if (!grupos.has(key)) {
      grupos.set(key, {
        semana: semClean,
        codigo: codigoFinal,
        nombre: nombreFinal,
        labor: laborClean,
        matriculaInfo: matricula,
        rendimientos: [],
        calidades: []
      });
    }
    return grupos.get(key)!;
  };

  // 1. Clasificar Evaluaciones de Rendimiento por Trabajador + Labor
  rendimientoList.forEach((ren) => {
    if (!ren.semana) return;
    const group = getOrCreateGroup(ren.semana, ren.codigo, ren.nombre, ren.labor);
    group.rendimientos.push(ren);
  });

  // 2. Clasificar Evaluaciones de Calidad (% Proceso) por Trabajador + Labor
  consolidadoList.forEach((cal) => {
    if (!cal.semana) return;
    const group = getOrCreateGroup(cal.semana, cal.codigo, cal.nombre, cal.labor);
    group.calidades.push(cal);
  });

  // Fallback: Si un grupo de Rendimiento no tiene calidades con el nombre exacto de la labor,
  // buscar si el trabajador tiene calidades asociadas en esa semana
  grupos.forEach((group) => {
    if (group.calidades.length === 0) {
      const workerId = (group.codigo ? group.codigo.trim().toLowerCase() : '') || group.nombre.trim().toLowerCase();
      const workerCalidades = consolidadoList.filter((cal) => {
        if (cal.semana.trim() !== group.semana) return false;
        const calWorkerId = (cal.codigo ? cal.codigo.trim().toLowerCase() : '') || cal.nombre.trim().toLowerCase();
        return calWorkerId === workerId;
      });
      if (workerCalidades.length > 0) {
        group.calidades.push(...workerCalidades);
      }
    }
  });

  // 3. Procesar cada grupo para calcular promedios de rendimiento y calidad por trabajador por labor
  const resultados: ConsolidadoPriorizacion[] = [];

  grupos.forEach((group, key) => {
    // Rendimiento Promedio
    let promedioRendimiento = 0;
    let metaRendimiento = 100;
    let minimoRendimiento = 80;
    let observacionRendimiento = 72;

    if (group.rendimientos.length > 0) {
      const sumRend = group.rendimientos.reduce((acc, r) => acc + (r.rendimiento || 0), 0);
      promedioRendimiento = Math.round((sumRend / group.rendimientos.length) * 10) / 10;
      const sumMeta = group.rendimientos.reduce((acc, r) => acc + (r.meta || 0), 0);
      metaRendimiento = Math.round((sumMeta / group.rendimientos.length) * 10) / 10;
      const sumMin = group.rendimientos.reduce((acc, r) => acc + (r.minimo || 0), 0);
      minimoRendimiento = Math.round((sumMin / group.rendimientos.length) * 10) / 10;
      const sumObs = group.rendimientos.reduce(
        (acc, r) => acc + (r.observacion ?? Math.round((r.minimo || 80) * 0.9)),
        0
      );
      observacionRendimiento = Math.round((sumObs / group.rendimientos.length) * 10) / 10;
    }

    // Calidad Promedio (% CALIDAD)
    // Regla del usuario:
    // Promedio de % Proceso y Promedio de % Producto
    // % Calidad = dato menor entre promedioProceso y promedioProducto
    let promedioCalidad: number | undefined = undefined;
    let promedioProceso: number | undefined = undefined;
    let promedioProducto: number | undefined = undefined;
    let metaCalidad = 90;

    if (group.calidades.length > 0) {
      // 1. Promedio % Proceso
      const calConProceso = group.calidades.filter(
        c => (c.porcentajeProceso !== undefined && !isNaN(c.porcentajeProceso)) ||
             (c.porcentajeProcentaje !== undefined && !isNaN(c.porcentajeProcentaje))
      );
      if (calConProceso.length > 0) {
        const sumProc = calConProceso.reduce(
          (acc, c) => acc + (c.porcentajeProceso ?? c.porcentajeProcentaje ?? 0), 0
        );
        promedioProceso = Math.round((sumProc / calConProceso.length) * 10) / 10;
      }

      // 2. Promedio % Producto
      const calConProducto = group.calidades.filter(
        c => c.porcentajeProducto !== undefined && !isNaN(c.porcentajeProducto)
      );
      if (calConProducto.length > 0) {
        const sumProd = calConProducto.reduce(
          (acc, c) => acc + (c.porcentajeProducto ?? 0), 0
        );
        promedioProducto = Math.round((sumProd / calConProducto.length) * 10) / 10;
      }

      // 3. Resultado % Calidad: priorizar el dato menor entre % Proceso y % Producto
      if (promedioProceso !== undefined && promedioProducto !== undefined) {
        promedioCalidad = Math.min(promedioProceso, promedioProducto);
      } else if (promedioProceso !== undefined) {
        promedioCalidad = promedioProceso;
      } else if (promedioProducto !== undefined) {
        promedioCalidad = promedioProducto;
      } else {
        const calConDirecto = group.calidades.filter(
          c => c.porcentajeCalidad !== undefined && !isNaN(c.porcentajeCalidad)
        );
        if (calConDirecto.length > 0) {
          const sumDir = calConDirecto.reduce((acc, c) => acc + (c.porcentajeCalidad ?? 0), 0);
          promedioCalidad = Math.round((sumDir / calConDirecto.length) * 10) / 10;
        } else {
          promedioCalidad = undefined;
        }
      }

      const sumMetaCal = group.calidades.reduce((acc, c) => acc + (c.metaCalidad || 90), 0);
      metaCalidad = Math.round((sumMetaCal / group.calidades.length) * 10) / 10;
    }

    // Evaluar con respecto a las Tablas de Decisión
    const resRendimiento = evaluarRendimiento(
      promedioRendimiento,
      metaRendimiento,
      minimoRendimiento,
      observacionRendimiento
    );
    const resCalidad = evaluarCalidad(promedioCalidad);

    const afDiaFormador = calcularAfDiaFormador(resCalidad, resRendimiento);
    let acompSupRuta: number | string = calcularAcompSupRuta(resCalidad);
    let acompSupProceso: number | string = calcularAcompSupProceso(resRendimiento);

    // Si calidad está en 0, con guión (undefined) o sin evaluaciones, semSup Ruta es '-'
    if (promedioCalidad === undefined || promedioCalidad === 0 || group.calidades.length === 0) {
      acompSupRuta = '-';
    }

    // Si rendimiento está en 0, con guión (0) o sin evaluaciones, sem Sup Proceso es '-'
    if (promedioRendimiento === 0 || group.rendimientos.length === 0) {
      acompSupProceso = '-';
    }

    // Definir nivel de prioridad global
    let nivelPrioridad: 'Alta' | 'Media' | 'Baja' = 'Baja';
    if (resRendimiento === 'En observación' || resCalidad === 'En observación') {
      nivelPrioridad = 'Alta';
    } else if (resRendimiento === 'En desarrollo' || resCalidad === 'En desarrollo') {
      nivelPrioridad = 'Media';
    }

    // Determinar la fecha más reciente
    const todasFechas = [
      ...group.rendimientos.map((r) => r.fecha),
      ...group.calidades.map((c) => c.fecha)
    ].filter(Boolean) as string[];

    let fechaFinal = '15/07/2026';
    if (todasFechas.length > 0) {
      fechaFinal = todasFechas[todasFechas.length - 1];
    } else {
      fechaFinal = formatFechaFallback(group.semana);
    }

    // Tomar dato de PROCESO EXCLUSIVAMENTE de la hoja Consolidado (calidades)
    const procesoDetectado =
      group.calidades.find((c) => c.proceso && c.proceso.trim() !== '')?.proceso?.trim() ||
      '';

    resultados.push({
      id: key,
      semana: group.semana,
      fecha: fechaFinal,
      codigo: group.codigo,
      nombre: group.nombre,
      labor: group.labor,
      proceso: procesoDetectado,
      rendimiento: promedioRendimiento,
      metaRendimiento,
      minimoRendimiento,
      observacionRendimiento,
      promedioProceso,
      promedioProducto,
      porcentajeProceso: promedioCalidad,
      porcentajeProducto: promedioProducto,
      metaCalidad,
      resultadoRendimiento: resRendimiento,
      resultadoCalidad: resCalidad,
      afDiaFormador,
      acompSemSupRuta: acompSupRuta,
      acompSemSupProceso: acompSupProceso,
      matriculaInfo: group.matriculaInfo,
      areaMatricula: group.matriculaInfo?.area,
      cargoMatricula: group.matriculaInfo?.cargo,
      tieneMatricula: !!group.matriculaInfo,
      todasLasEvaluacionesRendimiento: group.rendimientos,
      todasLasEvaluacionesCalidad: group.calidades,
      nivelPrioridad
    });
  });

  // Ordenar resultados por nivel de prioridad (Alta -> Media -> Baja) y luego por nombre
  return resultados.sort((a, b) => {
    const pRank = { Alta: 1, Media: 2, Baja: 3 };
    if (pRank[a.nivelPrioridad] !== pRank[b.nivelPrioridad]) {
      return pRank[a.nivelPrioridad] - pRank[b.nivelPrioridad];
    }
    return a.nombre.localeCompare(b.nombre);
  });
}
