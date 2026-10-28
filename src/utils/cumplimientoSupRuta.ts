import {
  ConsolidadoPriorizacion,
  RegistroBajoIndicador,
  PersonaMatricula,
  Calificacion
} from '../types';

export interface OperarioCumplimientoSupRuta {
  codigo: string;
  nombre: string;
  labor: string;
  supervisor: string;
  formador: string;
  requeridoSupRuta: number;
  ejecutadosBajosIndicadores: number;
  porcentajeCumplimiento: number;
  calidadPorcentaje?: number;
  calidadResultado?: Calificacion;
  estado: 'Cumplido' | 'En Proceso' | 'Pendiente';
  acompanamientosDetalle: RegistroBajoIndicador[];
  ultimaFecha?: string;
  tiposAcompanamiento: string[];
}

export interface SupervisorCumplimientoResumen {
  supervisor: string;
  operariosAsignados: number;
  requeridos: number;
  ejecutados: number;
  porcentaje: number;
  estado: 'Sobresaliente' | 'En meta' | 'Por reforzar';
}

export interface MetricasCumplimientoSupRuta {
  metaTotalSupRuta: number;
  realizadosTotal: number;
  operariosRequeridos: number;
  operariosAtendidos: number;
  operariosPendientes: number;
  porcentajeCumplimiento: number;
  estadoGlobal: 'Sobresaliente' | 'En meta' | 'Por reforzar';
  desgloseOperarios: OperarioCumplimientoSupRuta[];
  desgloseSupervisores: SupervisorCumplimientoResumen[];
}

/**
 * Normaliza nombres para comparar cadenas independientemente de orden (Apellidos Nombres vs Nombres Apellidos)
 */
function sonNombresEquivalentes(n1: string, n2: string): boolean {
  if (!n1 || !n2) return false;
  const clean1 = n1.toLowerCase().trim();
  const clean2 = n2.toLowerCase().trim();
  if (clean1 === clean2) return true;

  // Split por palabras
  const tokens1 = clean1.split(/\s+/).filter((w) => w.length > 2);
  const tokens2 = clean2.split(/\s+/).filter((w) => w.length > 2);
  if (tokens1.length === 0 || tokens2.length === 0) return false;

  const matches = tokens1.filter((t) => tokens2.includes(t));
  return matches.length >= Math.min(2, tokens1.length);
}

/**
 * Calcula el cumplimiento de acompañamientos de SUP. RUTA con relación
 * a los acompañamientos registrados en Bajos_Indicadores.
 */
export function calcularMetricasCumplimientoSupRuta(
  consolidadoList: ConsolidadoPriorizacion[] = [],
  bajosIndicadores: RegistroBajoIndicador[] = [],
  matriculas: PersonaMatricula[] = [],
  semanaSeleccionada: string = 'TODAS'
): MetricasCumplimientoSupRuta {
  // 1. Filtrar datos por la semana seleccionada
  const consolidadoFiltrado = consolidadoList.filter((c) => {
    if (semanaSeleccionada === 'TODAS' || !semanaSeleccionada) return true;
    return c.semana === semanaSeleccionada;
  });

  const bajosFiltrados = bajosIndicadores.filter((b) => {
    if (semanaSeleccionada === 'TODAS' || !semanaSeleccionada) return true;
    return b.semana === semanaSeleccionada;
  });

  // 2. Mapas de lookup de matrículas (código y nombre)
  const mapaMatriculaCod = new Map<string, PersonaMatricula>();
  const mapaMatriculaNom = new Map<string, PersonaMatricula>();
  matriculas.forEach((m) => {
    if (m.codigo) mapaMatriculaCod.set(m.codigo.trim().toLowerCase(), m);
    if (m.nombre) mapaMatriculaNom.set(m.nombre.trim().toLowerCase(), m);
  });

  // 3. Identificar operarios que requieren acompañamiento por SUP. RUTA
  // Según matriz: acompSemSupRuta === 1 cuando Calidad es 'En desarrollo' o 'En observación'
  // También consideramos registros numéricos > 0
  const operariosMap = new Map<string, OperarioCumplimientoSupRuta>();

  consolidadoFiltrado.forEach((item) => {
    const acompRutaNum =
      typeof item.acompSemSupRuta === 'number'
        ? item.acompSemSupRuta
        : item.acompSemSupRuta === '1'
        ? 1
        : 0;

    // Si requiere acompañamiento de Sup Ruta (o si tuvo baja calidad < 90%)
    const requiereSupRuta = acompRutaNum > 0 || item.resultadoCalidad === 'En desarrollo' || item.resultadoCalidad === 'En observación';

    const opKey = (item.codigo ? item.codigo.trim().toLowerCase() : '') || item.nombre.trim().toLowerCase();

    // Buscar supervisor en matrícula
    const matInfo =
      (item.codigo ? mapaMatriculaCod.get(item.codigo.trim().toLowerCase()) : undefined) ||
      (item.nombre ? mapaMatriculaNom.get(item.nombre.trim().toLowerCase()) : undefined) ||
      item.matriculaInfo;

    const supervisorName = matInfo?.supervisor?.trim() || 'Supervisor de Ruta';
    const formadorName = matInfo?.formador?.trim() || item.proceso || 'Poscosecha';

    if (!operariosMap.has(opKey)) {
      operariosMap.set(opKey, {
        codigo: item.codigo || matInfo?.codigo || '-',
        nombre: item.nombre || matInfo?.nombre || 'Operario',
        labor: item.labor || 'Poscosecha',
        supervisor: supervisorName,
        formador: formadorName,
        requeridoSupRuta: requiereSupRuta ? Math.max(1, acompRutaNum) : 0,
        ejecutadosBajosIndicadores: 0,
        porcentajeCumplimiento: 0,
        calidadPorcentaje: item.porcentajeProceso,
        calidadResultado: item.resultadoCalidad,
        estado: 'Pendiente',
        acompanamientosDetalle: [],
        tiposAcompanamiento: []
      });
    } else {
      const existing = operariosMap.get(opKey)!;
      if (requiereSupRuta) {
        existing.requeridoSupRuta += Math.max(1, acompRutaNum);
      }
    }
  });

  // 4. Cruzar con los acompañamientos registrados en Bajos_Indicadores
  bajosFiltrados.forEach((bajo) => {
    const bajoCod = bajo.codigo ? bajo.codigo.trim().toLowerCase() : '';
    const bajoNom = bajo.nombre ? bajo.nombre.trim().toLowerCase() : '';

    // Buscar en operariosMap por código o nombre
    let foundKey: string | undefined;
    for (const [key, op] of operariosMap.entries()) {
      if (bajoCod && op.codigo && op.codigo.trim().toLowerCase() === bajoCod) {
        foundKey = key;
        break;
      }
      if (sonNombresEquivalentes(op.nombre, bajo.nombre)) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      const op = operariosMap.get(foundKey)!;
      op.ejecutadosBajosIndicadores += 1;
      op.acompanamientosDetalle.push(bajo);
      if (bajo.tipoAcompanamiento && !op.tiposAcompanamiento.includes(bajo.tipoAcompanamiento)) {
        op.tiposAcompanamiento.push(bajo.tipoAcompanamiento);
      }
      if (bajo.fecha) {
        op.ultimaFecha = bajo.fecha;
      }
    } else {
      // Si el acompañamiento se registró en Bajos_Indicadores pero el operario no estaba en el consolidado con requerimiento
      const matInfo =
        (bajoCod ? mapaMatriculaCod.get(bajoCod) : undefined) ||
        (bajoNom ? mapaMatriculaNom.get(bajoNom) : undefined);

      const supervisorName = matInfo?.supervisor?.trim() || bajo.formador || 'Supervisor de Ruta';
      const formadorName = bajo.formador || matInfo?.formador || 'Poscosecha';

      const newKey = bajoCod || bajoNom;
      operariosMap.set(newKey, {
        codigo: bajo.codigo || matInfo?.codigo || '-',
        nombre: bajo.nombre,
        labor: bajo.labor || 'Poscosecha',
        supervisor: supervisorName,
        formador: formadorName,
        requeridoSupRuta: 1, // Se toma como 1 requerimiento al estar en Bajos Indicadores
        ejecutadosBajosIndicadores: 1,
        porcentajeCumplimiento: 100,
        calidadPorcentaje: undefined,
        calidadResultado: undefined,
        estado: 'Cumplido',
        acompanamientosDetalle: [bajo],
        tiposAcompanamiento: bajo.tipoAcompanamiento ? [bajo.tipoAcompanamiento] : [],
        ultimaFecha: bajo.fecha
      });
    }
  });

  // 5. Calcular porcentajes individuales y estados
  const desgloseOperarios: OperarioCumplimientoSupRuta[] = Array.from(operariosMap.values())
    .filter((op) => op.requeridoSupRuta > 0 || op.ejecutadosBajosIndicadores > 0)
    .map((op) => {
      let pct = 0;
      if (op.requeridoSupRuta > 0) {
        pct = Math.round((op.ejecutadosBajosIndicadores / op.requeridoSupRuta) * 100);
      } else if (op.ejecutadosBajosIndicadores > 0) {
        pct = 100;
      }

      let estado: 'Cumplido' | 'En Proceso' | 'Pendiente' = 'Pendiente';
      if (pct >= 100) {
        estado = 'Cumplido';
      } else if (op.ejecutadosBajosIndicadores > 0) {
        estado = 'En Proceso';
      }

      return {
        ...op,
        porcentajeCumplimiento: pct,
        estado
      };
    })
    .sort((a, b) => {
      // Pendientes primero, luego en proceso, luego cumplidos
      const pOrder = { Pendiente: 1, 'En Proceso': 2, Cumplido: 3 };
      if (pOrder[a.estado] !== pOrder[b.estado]) {
        return pOrder[a.estado] - pOrder[b.estado];
      }
      return a.nombre.localeCompare(b.nombre);
    });

  // 6. Agrupar por Supervisor de Ruta
  const supervisorMap = new Map<string, { requeridos: number; ejecutados: number; operarios: Set<string> }>();
  desgloseOperarios.forEach((op) => {
    const sup = op.supervisor || 'Supervisor de Ruta';
    if (!supervisorMap.has(sup)) {
      supervisorMap.set(sup, { requeridos: 0, ejecutados: 0, operarios: new Set() });
    }
    const s = supervisorMap.get(sup)!;
    s.requeridos += op.requeridoSupRuta;
    s.ejecutados += op.ejecutadosBajosIndicadores;
    s.operarios.add(op.codigo || op.nombre);
  });

  const desgloseSupervisores: SupervisorCumplimientoResumen[] = Array.from(supervisorMap.entries()).map(
    ([supervisor, data]) => {
      const pct = data.requeridos > 0 ? Math.round((data.ejecutados / data.requeridos) * 100) : (data.ejecutados > 0 ? 100 : 0);
      let estado: 'Sobresaliente' | 'En meta' | 'Por reforzar' = 'Por reforzar';
      if (pct >= 90) estado = 'Sobresaliente';
      else if (pct >= 80) estado = 'En meta';

      return {
        supervisor,
        operariosAsignados: data.operarios.size,
        requeridos: data.requeridos,
        ejecutados: data.ejecutados,
        porcentaje: pct,
        estado
      };
    }
  );

  // 7. Totales Globales
  const metaTotalSupRuta = desgloseOperarios.reduce((sum, op) => sum + op.requeridoSupRuta, 0);
  const realizadosTotal = desgloseOperarios.reduce((sum, op) => sum + op.ejecutadosBajosIndicadores, 0);

  const operariosRequeridos = desgloseOperarios.filter((op) => op.requeridoSupRuta > 0).length;
  const operariosAtendidos = desgloseOperarios.filter((op) => op.ejecutadosBajosIndicadores > 0).length;
  const operariosPendientes = desgloseOperarios.filter(
    (op) => op.requeridoSupRuta > 0 && op.ejecutadosBajosIndicadores === 0
  ).length;

  const porcentajeCumplimiento =
    metaTotalSupRuta > 0
      ? Math.round((realizadosTotal / metaTotalSupRuta) * 100)
      : (realizadosTotal > 0 ? 100 : 0);

  let estadoGlobal: 'Sobresaliente' | 'En meta' | 'Por reforzar' = 'Por reforzar';
  if (porcentajeCumplimiento >= 90) {
    estadoGlobal = 'Sobresaliente';
  } else if (porcentajeCumplimiento >= 80) {
    estadoGlobal = 'En meta';
  }

  return {
    metaTotalSupRuta,
    realizadosTotal,
    operariosRequeridos,
    operariosAtendidos,
    operariosPendientes,
    porcentajeCumplimiento,
    estadoGlobal,
    desgloseOperarios,
    desgloseSupervisores
  };
}
