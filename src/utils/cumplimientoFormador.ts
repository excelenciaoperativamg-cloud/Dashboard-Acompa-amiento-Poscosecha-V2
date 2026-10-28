import {
  ConsolidadoPriorizacion,
  RegistroBajoIndicador,
  PersonaMatricula,
  MetricasCumplimientoGlobal,
  ResumenCumplimientoFormador,
  OperarioCumplimientoDetalle
} from '../types';

/**
 * Identifica si un nombre o texto corresponde a un Supervisor (SUP. RUTA o SUP. PROC),
 * los cuales DEBEN ser totalmente excluidos de este espacio de Formador.
 */
export function esSupervisorExcluido(texto: string = ''): boolean {
  if (!texto) return false;
  const t = texto.toUpperCase().trim();
  return (
    t.includes('SUP. RUTA') ||
    t.includes('SUP.RUTA') ||
    t.includes('SUP RUTA') ||
    t.includes('SUPERVISOR DE RUTA') ||
    t.includes('SUPERVISOR RUTA') ||
    t.includes('SUP. PROC') ||
    t.includes('SUP.PROC') ||
    t.includes('SUP PROC') ||
    t.includes('SUPERVISOR DE PROCESO') ||
    t.includes('SUPERVISOR PROCESO') ||
    t.includes('SUPERVISOR DE PROCESOS') ||
    t.includes('SUP PROCESOS') ||
    t.includes('SUP. PROCESOS') ||
    t.startsWith('SUP ') ||
    t.startsWith('SUPERVISOR')
  );
}

/**
 * Normaliza los nombres de los formadores/entrenadores registrados en las bases de datos
 * para unificar variantes de digitación con su nombre estándar registrado.
 */
export function normalizarNombreFormador(name: string = ''): string {
  if (!name || esSupervisorExcluido(name)) return '';
  const n = name.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (n.includes('ROSALES')) return 'ROSALES BASTO LIDA LILI';
  if (n.includes('GOMEZ MADERO') || n.includes('NIDIA GOMEZ')) return 'GOMEZ MADERO NIDIA ROSA';
  if (n.includes('PEDROZO')) return 'PEDROZO HURTADO YULEIDYS CAROLINA';
  if (n.includes('CARRILLO PINEDA') || n.includes('EDWARD YESID')) return 'CARRILLO PINEDA EDWARD YESID';
  if (n.includes('ALBARRACIN')) return 'ALBARRACIN GOMEZ KAREN NATALIA';
  if (n.includes('PEDRAZA')) return 'PEDRAZA CARREÑO DIANA GABRIELA';
  if (n.includes('RODRIGUEZ PORTELA') || n.includes('LEYSLA')) return 'RODRIGUEZ PORTELA LEYSLA';
  if (n.includes('CELEMIN')) return 'CELEMIN CARRILLO DAVID ALEJANDRO';
  if (n.includes('ESCOBAR BENAVIDES')) return 'ESCOBAR BENAVIDES YULIETH PAOLA';
  if (n.includes('CABALLERO')) return 'CABALLERO GA';

  return name.trim();
}

/**
 * Identifica la semana previa a partir de una cadena (e.g. "2026-43" -> "2026-42", "Semana 43" -> "Semana 42")
 */
export function identificarSemanaPrevia(semana: string, todasLasSemanas: string[]): string | null {
  if (!semana || semana === 'TODAS') return null;

  // 1. Patrón YYYY-WW (ej. 2026-43 -> 2026-42)
  const matchIso = semana.match(/^(\d{4})-(\d{1,2})$/);
  if (matchIso) {
    const year = parseInt(matchIso[1], 10);
    const weekNum = parseInt(matchIso[2], 10);
    if (weekNum > 1) {
      const prevPad = `${year}-${String(weekNum - 1).padStart(2, '0')}`;
      const prevNoPad = `${year}-${weekNum - 1}`;
      if (todasLasSemanas.includes(prevPad)) return prevPad;
      if (todasLasSemanas.includes(prevNoPad)) return prevNoPad;
      return prevPad;
    }
  }

  // 2. Patrón "Semana XX" o "SXX"
  const matchTexto = semana.match(/(?:semana\s*|s)(\d{1,2})/i);
  if (matchTexto) {
    const weekNum = parseInt(matchTexto[1], 10);
    if (weekNum > 1) {
      const prevCandidate = todasLasSemanas.find((s) => {
        const m = s.match(/(?:semana\s*|s)(\d{1,2})/i);
        return m && parseInt(m[1], 10) === weekNum - 1;
      });
      if (prevCandidate) return prevCandidate;
      return `Semana ${weekNum - 1}`;
    }
  }

  // 3. Fallback: Buscar posición en lista ordenada
  const idx = todasLasSemanas.indexOf(semana);
  if (idx !== -1 && idx + 1 < todasLasSemanas.length) {
    return todasLasSemanas[idx + 1];
  }

  return null;
}

/**
 * Calcula las métricas de cumplimiento de las evaluaciones ejecutadas por cada formador.
 * 
 * Reglas de negocio:
 * 1. Las evaluaciones ejecutadas provienen DIRECTAMENTE del campo "Entrenador" en cada evaluación
 *    registrada en Rendimiento y Consolidado (Calidad), más acompañamientos en Bajos Indicadores.
 * 2. Se excluyen TOTALMENTE los supervisores (SUP. RUTA, SUP. PROC).
 * 3. NO se inventan nombres ni se asignan formadores ficticios (como CABALLERO GA) si no existen en los registros.
 * 4. La meta requerida se basa en el indicador #AF / Día Formador de la matriz de priorización
 *    multiplicado por 5 días laborales para los operarios atendidos por cada formador.
 */
export function calcularMetricasCumplimientoFormador(
  data: ConsolidadoPriorizacion[],
  semanaSeleccionada: string,
  bajosIndicadores: RegistroBajoIndicador[] = [],
  matriculas: PersonaMatricula[] = []
): MetricasCumplimientoGlobal {
  // 1. Filtrar registros de Bajos Indicadores: EXCLUYENDO ESTRICTAMENTE SUP. RUTA Y SUP. PROC
  const bajosValidos = bajosIndicadores.filter((b) => {
    if (esSupervisorExcluido(b.formador) || esSupervisorExcluido(b.tipoAcompanamiento)) {
      return false;
    }
    return true;
  });

  const bajosSemana = bajosValidos.filter((b) => {
    if (semanaSeleccionada === 'TODAS') return true;
    return b.semana === semanaSeleccionada || b.semana?.includes(semanaSeleccionada.replace('2026-', ''));
  });

  // 2. Determinar semanas disponibles y semana previa para meta
  const todasLasSemanas = Array.from(
    new Set([
      ...data.map((d) => d.semana).filter(Boolean),
      ...bajosIndicadores.map((b) => b.semana).filter(Boolean)
    ])
  ).sort().reverse();

  let semanaEstimadaOrigen = semanaSeleccionada;
  let itemsParaMeta = data;

  if (semanaSeleccionada !== 'TODAS') {
    const semanaPrevia = identificarSemanaPrevia(semanaSeleccionada, todasLasSemanas);
    if (semanaPrevia) {
      const itemsSemanaPrevia = data.filter((d) => d.semana === semanaPrevia);
      if (itemsSemanaPrevia.length > 0) {
        itemsParaMeta = itemsSemanaPrevia;
        semanaEstimadaOrigen = semanaPrevia;
      } else {
        itemsParaMeta = data.filter((d) => d.semana === semanaSeleccionada);
      }
    } else {
      itemsParaMeta = data.filter((d) => d.semana === semanaSeleccionada);
    }
  }

  // 3. Estructura de acumulación por Formador (Dinamica: solo formadores reales de la base de datos)
  interface FormadorAccumulator {
    formador: string;
    evaluacionesRequeridas: number;
    evaluacionesEjecutadas: number;
    rendimientoEjecutadas: number;
    calidadEjecutadas: number;
    acompanamientosEjecutados: number;
    operariosMap: Map<string, OperarioCumplimientoDetalle>;
  }

  const accumulators = new Map<string, FormadorAccumulator>();

  const getOrCreateAccumulator = (name: string): FormadorAccumulator | null => {
    const canonicalName = normalizarNombreFormador(name);
    if (!canonicalName || esSupervisorExcluido(canonicalName)) {
      return null;
    }
    if (!accumulators.has(canonicalName)) {
      accumulators.set(canonicalName, {
        formador: canonicalName,
        evaluacionesRequeridas: 0,
        evaluacionesEjecutadas: 0,
        rendimientoEjecutadas: 0,
        calidadEjecutadas: 0,
        acompanamientosEjecutados: 0,
        operariosMap: new Map()
      });
    }
    return accumulators.get(canonicalName)!;
  };

  // 4. Filtrar datos de ejecución de la semana seleccionada
  const dataSemanaEjecucion =
    semanaSeleccionada === 'TODAS'
      ? data
      : data.filter((d) => d.semana === semanaSeleccionada || d.semana?.includes(semanaSeleccionada.replace('2026-', '')));

  // Registrar evaluaciones reales de Rendimiento y Calidad por cada formador real
  dataSemanaEjecucion.forEach((item) => {
    const opKey = item.codigo || item.nombre;
    const afDiaOperario = typeof item.afDiaFormador === 'number' && item.afDiaFormador > 0 ? item.afDiaFormador : 2;
    const requeridasOperario = afDiaOperario * 5;

    // A. Evaluaciones de Rendimiento
    item.todasLasEvaluacionesRendimiento.forEach((r) => {
      if (!r.entrenador) return;
      const acc = getOrCreateAccumulator(r.entrenador);
      if (!acc) return;

      acc.evaluacionesEjecutadas += 1;
      acc.rendimientoEjecutadas += 1;

      if (!acc.operariosMap.has(opKey)) {
        acc.operariosMap.set(opKey, {
          codigo: item.codigo,
          nombre: item.nombre,
          labor: item.labor,
          ejecutadas: 1,
          requeridas: requeridasOperario,
          porcentaje: 0,
          rendimientoCount: 1,
          calidadCount: 0
        });
      } else {
        const op = acc.operariosMap.get(opKey)!;
        op.ejecutadas += 1;
        op.rendimientoCount += 1;
      }
    });

    // B. Evaluaciones de Calidad (Consolidado)
    item.todasLasEvaluacionesCalidad.forEach((c) => {
      if (!c.entrenador) return;
      const acc = getOrCreateAccumulator(c.entrenador);
      if (!acc) return;

      acc.evaluacionesEjecutadas += 1;
      acc.calidadEjecutadas += 1;

      if (!acc.operariosMap.has(opKey)) {
        acc.operariosMap.set(opKey, {
          codigo: item.codigo,
          nombre: item.nombre,
          labor: item.labor,
          ejecutadas: 1,
          requeridas: requeridasOperario,
          porcentaje: 0,
          rendimientoCount: 0,
          calidadCount: 1
        });
      } else {
        const op = acc.operariosMap.get(opKey)!;
        op.ejecutadas += 1;
        op.calidadCount += 1;
      }
    });
  });

  // C. Acompañamientos en Bajos Indicadores
  bajosSemana.forEach((reg) => {
    if (!reg.formador) return;
    const acc = getOrCreateAccumulator(reg.formador);
    if (!acc) return;

    acc.evaluacionesEjecutadas += 1;
    acc.acompanamientosEjecutados += 1;

    const opKey = reg.codigo || reg.nombre;
    if (!acc.operariosMap.has(opKey)) {
      acc.operariosMap.set(opKey, {
        codigo: reg.codigo,
        nombre: reg.nombre,
        labor: reg.labor,
        ejecutadas: 1,
        requeridas: 10,
        porcentaje: 0,
        rendimientoCount: reg.tipoAcompanamiento?.toLowerCase().includes('rend') ? 1 : 0,
        calidadCount: reg.tipoAcompanamiento?.toLowerCase().includes('cal') ? 1 : 0
      });
    } else {
      const op = acc.operariosMap.get(opKey)!;
      op.ejecutadas += 1;
      if (reg.tipoAcompanamiento?.toLowerCase().includes('rend')) op.rendimientoCount += 1;
      if (reg.tipoAcompanamiento?.toLowerCase().includes('cal')) op.calidadCount += 1;
    }
  });

  // 5. CÁLCULO DE LA META REQUERIDA POR FORMADOR (#AF / Día Formador * 5 días)
  // Para cada operario cubierto por el formador, calcular la meta semanal
  let totalAfDiaDiarioSum = 0;

  accumulators.forEach((acc) => {
    let metaFormador = 0;
    acc.operariosMap.forEach((op) => {
      // Buscar si el operario tiene datos en itemsParaMeta (semana previa o consolidado)
      const opPrior = itemsParaMeta.find(
        (it) => it.codigo === op.codigo || it.nombre.toLowerCase() === op.nombre.toLowerCase()
      );
      const afDia =
        opPrior && typeof opPrior.afDiaFormador === 'number' && opPrior.afDiaFormador > 0
          ? opPrior.afDiaFormador
          : 2;

      totalAfDiaDiarioSum += afDia;
      const requeridas = afDia * 5;
      op.requeridas = requeridas;
      op.porcentaje = requeridas > 0 ? Math.round((op.ejecutadas / requeridas) * 100) : 100;
      metaFormador += requeridas;
    });

    acc.evaluacionesRequeridas = metaFormador;
  });

  // 6. Construir listado de formadores que tengan evaluaciones ejecutadas o requeridas
  const desgloseFormadores: ResumenCumplimientoFormador[] = Array.from(accumulators.values())
    .filter((acc) => acc.evaluacionesEjecutadas > 0 || acc.evaluacionesRequeridas > 0)
    .map((acc) => {
      const req = Math.round(acc.evaluacionesRequeridas);
      const ejec = Math.round(acc.evaluacionesEjecutadas);
      let pct = 0;
      if (req > 0) {
        pct = Math.round((ejec / req) * 100);
      } else if (ejec > 0) {
        pct = 100;
      }

      let estado: 'Sobresaliente' | 'En meta' | 'Por reforzar' = 'Por reforzar';
      if (pct >= 90) {
        estado = 'Sobresaliente';
      } else if (pct >= 80) {
        estado = 'En meta';
      }

      return {
        formador: acc.formador,
        evaluacionesRequeridas: req,
        evaluacionesEjecutadas: ejec,
        porcentajeCumplimiento: pct,
        operariosAtendidos: acc.operariosMap.size,
        rendimientoEjecutadas: acc.rendimientoEjecutadas,
        calidadEjecutadas: acc.calidadEjecutadas,
        acompanamientosEjecutados: acc.acompanamientosEjecutados,
        estado,
        operarios: Array.from(acc.operariosMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
      };
    })
    .sort((a, b) => b.porcentajeCumplimiento - a.porcentajeCumplimiento || b.evaluacionesEjecutadas - a.evaluacionesEjecutadas);

  // 7. Totales globales reales
  const totalRequeridas = desgloseFormadores.reduce((sum, f) => sum + f.evaluacionesRequeridas, 0);
  const totalEjecutadas = desgloseFormadores.reduce((sum, f) => sum + f.evaluacionesEjecutadas, 0);
  const porcentajeCumplimiento = totalRequeridas > 0 ? Math.round((totalEjecutadas / totalRequeridas) * 100) : 100;

  const operariosCubiertosSet = new Set<string>();
  desgloseFormadores.forEach((f) => {
    f.operarios.forEach((op) => operariosCubiertosSet.add(op.codigo || op.nombre));
  });

  let estadoGlobal: 'Sobresaliente' | 'En meta' | 'Por reforzar' = 'Por reforzar';
  if (porcentajeCumplimiento >= 90) {
    estadoGlobal = 'Sobresaliente';
  } else if (porcentajeCumplimiento >= 80) {
    estadoGlobal = 'En meta';
  }

  return {
    totalEjecutadas,
    totalRequeridas,
    porcentajeCumplimiento,
    formadoresActivos: desgloseFormadores.length,
    operariosCubiertos: operariosCubiertosSet.size,
    estadoGlobal,
    desgloseFormadores,
    semanaEstimadaOrigen,
    semanaEvaluada: semanaSeleccionada,
    totalAfDiaFormadorDiario: totalAfDiaDiarioSum
  };
}
