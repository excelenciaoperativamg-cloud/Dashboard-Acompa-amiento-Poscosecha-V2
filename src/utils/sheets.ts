import Papa from 'papaparse';
import {
  EvaluacionRendimiento,
  EvaluacionCalidad,
  PersonaMatricula,
  RegistroBajoIndicador,
  SheetsDataResponse
} from '../types';
import { consolidarPriorizacion } from './calculations';
import {
  MOCK_RENDIMIENTO,
  MOCK_CONSOLIDADO_CALIDAD,
  MOCK_MATRICULAS,
  MOCK_BAJOS_INDICADORES
} from '../data/mockData';

export function cleanHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function parseNumber(val: any, defaultVal = 0): number {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') return val;
  let str = String(val).replace('%', '').trim();
  if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } else if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? defaultVal : parsed;
}

export async function fetchSheetCSV(spreadsheetId: string, sheetName: string): Promise<any[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al consultar hoja '${sheetName}' (status ${response.status})`);
  }
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return parsed.data || [];
}

export function mapRendimientoRows(rows: any[]): EvaluacionRendimiento[] {
  return rows.map((row) => {
    const keys = Object.keys(row);

    const getValCode = () => {
      const codeKey = keys.find(k => {
        const cleanK = cleanHeader(k);
        if (cleanK.startsWith('id_') || cleanK === 'id_consolidado' || cleanK === 'id_rendimiento' || cleanK === 'llave') return false;
        return cleanK === 'codigo' || cleanK === 'matricula' || cleanK === 'documento' || cleanK === 'cedula' || cleanK.includes('codigo');
      });
      return codeKey ? row[codeKey] : undefined;
    };

    const getValName = () => {
      const nameKey = keys.find(k => {
        const cleanK = cleanHeader(k);
        return cleanK === 'nombre' || cleanK === 'operario' || cleanK === 'empleado' || cleanK === 'persona' || (cleanK.includes('nombre') && !cleanK.includes('ingreso'));
      });
      return nameKey ? row[nameKey] : undefined;
    };

    const getValGeneric = (possibleNames: string[]) => {
      const matchKey = keys.find((k) => {
        const cleanK = cleanHeader(k);
        return possibleNames.some((p) => cleanK.includes(p));
      });
      return matchKey ? row[matchKey] : undefined;
    };

    const rawIdRendimiento = getValGeneric(['id_rendimiento', 'idrendimiento', 'id_rend']);
    const rawLlave = getValGeneric(['llave', 'key']);
    const rawAno = getValGeneric(['ano', 'year']);
    const rawSemana = getValGeneric(['semana', 'sem', 'week']) || '2026-28';
    const rawFecha = getValGeneric(['fecha', 'date', 'f. evaluacion', 'f.evaluacion', 'fecha registro', 'fecha evaluacion']) || '';
    const rawCodigo = getValCode() || '';
    const rawNombre = getValName() || '';
    const rawLabor = getValGeneric(['labor', 'tarea', 'actividad']) || 'Poscosecha General';

    const rendKey = keys.find(k => {
      const cleanK = cleanHeader(k);
      if (cleanK.includes('meta') || cleanK.includes('esperado') || cleanK.includes('minimo') || cleanK.includes('mínimo') || cleanK.includes('observacion') || cleanK.includes('observación')) return false;
      return cleanK === 'rendimiento' || cleanK === 'rend' || cleanK.includes('productividad');
    });
    const rawRendimiento = rendKey ? row[rendKey] : undefined;
    const rawMeta = getValGeneric(['meta', 'rendimiento meta']);
    const rawEsperado = getValGeneric(['rendimiento o esperado', 'rendimiento esperado', 'esperado', 'rend.esperado', 'rend. esperado']);
    const rawMinimo = getValGeneric(['minimo', 'rendimiento minimo', 'mínimo']);
    const rawObservacion = getValGeneric(['observacion', 'rendimiento observacion', 'observación', 'en observacion']);
    const rawNuevoAntiguo = getValGeneric(['nuevo/antiguo', 'nuevo_antiguo', 'nuevo o antiguo', 'condicion', 'clasificacion', 'antiguedad', 'antigued', 'nuevo']);
    const rawFechaIngreso = getValGeneric(['fecha de ingreso', 'fecha_ingreso', 'f.ingreso', 'f. ingreso', 'fingreso', 'ingreso']);
    const rawDia = getValGeneric(['dia', 'día']);
    const rawProceso = getValGeneric(['proceso', 'proc']);
    const rawEntrenador = getValGeneric(['entrenador', 'formador', 'instructor']);
    const rawRegistro = getValGeneric(['registro']);

    let semana = String(rawSemana).trim();
    if (semana && !semana.includes('-')) {
      const numSem = parseInt(semana, 10);
      if (!isNaN(numSem)) {
        semana = `2026-${numSem.toString().padStart(2, '0')}`;
      }
    }

    const ano = parseNumber(rawAno, parseInt(semana.split('-')[0]) || 2026);
    const rendimiento = parseNumber(rawRendimiento, 0);
    const meta = parseNumber(rawMeta, 100);
    const rendimientoEsperado = rawEsperado !== undefined ? parseNumber(rawEsperado, meta) : meta;
    const minimo = parseNumber(rawMinimo, 80);
    const observacion = parseNumber(rawObservacion, Math.round(minimo * 0.9));

    return {
      idRendimiento: rawIdRendimiento ? String(rawIdRendimiento).trim() : undefined,
      llave: rawLlave ? String(rawLlave).trim() : undefined,
      ano,
      semana,
      fecha: rawFecha ? String(rawFecha).trim() : undefined,
      codigo: String(rawCodigo).trim(),
      nombre: String(rawNombre).trim(),
      labor: String(rawLabor).trim(),
      rendimiento,
      meta: rendimientoEsperado > 0 ? rendimientoEsperado : meta,
      rendimientoEsperado,
      minimo,
      observacion,
      nuevoAntiguo: rawNuevoAntiguo ? String(rawNuevoAntiguo).trim() : undefined,
      fechaIngreso: rawFechaIngreso ? String(rawFechaIngreso).trim() : undefined,
      dia: rawDia !== undefined && rawDia !== '' ? (isNaN(Number(rawDia)) ? String(rawDia).trim() : Number(rawDia)) : undefined,
      proceso: rawProceso ? String(rawProceso).trim() : undefined,
      entrenador: rawEntrenador ? String(rawEntrenador).trim() : undefined,
      registro: rawRegistro ? String(rawRegistro).trim() : undefined
    };
  }).filter(item => item.codigo !== '' || item.nombre !== '');
}

export function mapConsolidadoRows(rows: any[]): EvaluacionCalidad[] {
  return rows.map((row) => {
    const keys = Object.keys(row);

    const getValCode = () => {
      const codeKey = keys.find(k => {
        const cleanK = cleanHeader(k);
        if (cleanK.startsWith('id_') || cleanK === 'id_consolidado' || cleanK === 'id_rendimiento' || cleanK === 'llave') return false;
        return cleanK === 'codigo' || cleanK === 'matricula' || cleanK === 'documento' || cleanK === 'cedula' || cleanK.includes('codigo');
      });
      return codeKey ? row[codeKey] : undefined;
    };

    const getValName = () => {
      const nameKey = keys.find(k => {
        const cleanK = cleanHeader(k);
        return cleanK === 'nombre' || cleanK === 'operario' || cleanK === 'empleado' || cleanK === 'persona' || (cleanK.includes('nombre') && !cleanK.includes('ingreso'));
      });
      return nameKey ? row[nameKey] : undefined;
    };

    const getValGeneric = (possibleNames: string[]) => {
      const matchKey = keys.find((k) => {
        const cleanK = cleanHeader(k);
        return possibleNames.some((p) => cleanK.includes(p));
      });
      return matchKey ? row[matchKey] : undefined;
    };

    const rawAno = getValGeneric(['ano', 'year']);
    const rawSemana = getValGeneric(['semana', 'sem', 'week']) || '2026-28';
    const rawFecha = getValGeneric(['fecha', 'date', 'dia', 'f. evaluacion', 'f.evaluacion', 'fecha registro', 'fecha evaluacion']) || '';
    const rawCodigo = getValCode() || '';
    const rawNombre = getValName() || '';
    const rawLabor = getValGeneric(['labor', 'tarea', 'actividad']) || 'Calidad Poscosecha';

    const findMetricKey = (metricName: 'proceso' | 'producto' | 'calidad'): string | undefined => {
      const cleanKeys = keys.map(k => ({ original: k, clean: cleanHeader(k) }));

      const exactPatterns = [
        `% ${metricName}`,
        `%${metricName}`,
        `porcentaje ${metricName}`,
        `porcentaje de ${metricName}`,
        `pct ${metricName}`,
        `pct_${metricName}`,
        `${metricName} (%)`,
        `${metricName}%`
      ];

      for (const pattern of exactPatterns) {
        const match = cleanKeys.find(ck => ck.clean === pattern);
        if (match) return match.original;
      }

      const pctMatch = cleanKeys.find(ck => {
        if (ck.clean.includes('meta') || ck.clean.includes('objetivo') || ck.clean.startsWith('id_') || ck.clean === 'llave') return false;
        const hasPct = ck.clean.includes('%') || ck.clean.includes('porcentaje') || ck.clean.includes('pct');
        return hasPct && ck.clean.includes(metricName);
      });
      if (pctMatch) return pctMatch.original;

      const simpleMatch = cleanKeys.find(ck => {
        if (ck.clean.includes('meta') || ck.clean.includes('objetivo') || ck.clean.startsWith('id_') || ck.clean === 'llave' || ck.clean === 'registro' || ck.clean === 'labor' || ck.clean === 'tipo' || ck.clean === 'nombre' || ck.clean === 'codigo') return false;
        return ck.clean === metricName;
      });
      if (simpleMatch) return simpleMatch.original;

      const lastResort = cleanKeys.find(ck => {
        if (ck.clean.includes('meta') || ck.clean.includes('objetivo') || ck.clean.startsWith('id_') || ck.clean === 'llave' || ck.clean.includes('registro') || ck.clean.includes('labor') || ck.clean.includes('tipo') || ck.clean.includes('nombre') || ck.clean.includes('codigo') || ck.clean.includes('fecha') || ck.clean.includes('dia') || ck.clean.includes('ingreso') || ck.clean.includes('semana')) return false;
        return ck.clean.includes(metricName);
      });

      return lastResort ? lastResort.original : undefined;
    };

    const calKey = findMetricKey('calidad');
    const procKey = findMetricKey('proceso');
    const prodKey = findMetricKey('producto');

    const rawMetaCalidad = getValGeneric(['meta calidad', 'calidad meta', 'meta proceso', 'meta']);

    let semana = String(rawSemana).trim();
    if (semana && !semana.includes('-')) {
      const numSem = parseInt(semana, 10);
      if (!isNaN(numSem)) {
        semana = `2026-${numSem.toString().padStart(2, '0')}`;
      }
    }

    const ano = parseNumber(rawAno, parseInt(semana.split('-')[0]) || 2026);

    let valCalidad = calKey ? parseNumber(row[calKey], NaN) : NaN;
    let valProceso = procKey ? parseNumber(row[procKey], NaN) : NaN;
    let valProducto = prodKey ? parseNumber(row[prodKey], NaN) : NaN;

    if (!isNaN(valCalidad) && valCalidad <= 1 && valCalidad > 0) valCalidad = valCalidad * 100;
    if (!isNaN(valProceso) && valProceso <= 1 && valProceso > 0) valProceso = valProceso * 100;
    if (!isNaN(valProducto) && valProducto <= 1 && valProducto > 0) valProducto = valProducto * 100;

    let finalCalidad: number | undefined = undefined;
    if (!isNaN(valProceso) && !isNaN(valProducto)) {
      finalCalidad = Math.min(valProceso, valProducto);
    } else if (!isNaN(valProceso)) {
      finalCalidad = valProceso;
    } else if (!isNaN(valProducto)) {
      finalCalidad = valProducto;
    } else if (!isNaN(valCalidad)) {
      finalCalidad = valCalidad;
    } else {
      finalCalidad = undefined;
    }

    const metaCal = parseNumber(rawMetaCalidad, 90);

    return {
      ano,
      semana,
      fecha: rawFecha ? String(rawFecha).trim() : undefined,
      codigo: String(rawCodigo).trim(),
      nombre: String(rawNombre).trim(),
      labor: String(rawLabor).trim(),
      porcentajeProcentaje: isNaN(valProceso) ? finalCalidad : valProceso,
      porcentajeProceso: isNaN(valProceso) ? undefined : valProceso,
      porcentajeProducto: isNaN(valProducto) ? undefined : valProducto,
      porcentajeCalidad: finalCalidad,
      metaCalidad: metaCal
    };
  }).filter(item => item.codigo !== '' || item.nombre !== '');
}

export function mapMatriculasRows(rows: any[]): PersonaMatricula[] {
  return rows.map((row) => {
    const keys = Object.keys(row);
    const getVal = (possibleNames: string[]) => {
      const matchKey = keys.find((k) => {
        const cleanK = cleanHeader(k);
        return possibleNames.some((p) => cleanK.includes(p));
      });
      return matchKey ? row[matchKey] : undefined;
    };

    const rawCodigo = getVal(['codigo', 'matricula', 'id', 'documento']) || '';
    const rawNombre = getVal(['nombre', 'empleado', 'operario', 'persona']) || '';
    const rawCargo = getVal(['cargo', 'rol', 'puesto']) || 'Operario Poscosecha';
    const rawArea = getVal(['area', 'seccion', 'labor']) || 'Poscosecha';

    return {
      codigo: String(rawCodigo).trim(),
      nombre: String(rawNombre).trim(),
      cargo: String(rawCargo).trim(),
      area: String(rawArea).trim()
    };
  }).filter(item => item.codigo !== '');
}

export function mapBajosIndicadoresRows(rows: any[]): RegistroBajoIndicador[] {
  return rows.map((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (possibleNames: string[]) => {
      const matchKey = keys.find((k) => {
        const cleanK = cleanHeader(k);
        return possibleNames.some((p) => cleanK.includes(p));
      });
      return matchKey ? String(row[matchKey]).trim() : '';
    };

    const codigo = getVal(['codigo', 'matricula', 'documento', 'cedula']) || '';
    const nombre = getVal(['nombre', 'operario', 'persona', 'empleado']) || '';
    const labor = getVal(['labor', 'area', 'proceso']) || 'Poscosecha';
    const formador = getVal(['entrenador', 'formador', 'facilitador', 'evaluador', 'instructor']) || 'Entrenador General';
    const tipoAcompanamiento = getVal(['tipo', 'acompanamiento', 'modalidad']) || 'Acompañamiento Formador';
    const rawPorc = getVal(['porcentaje', 'cumplimiento', '%', 'valor']);
    const porcentajeAcompanamiento = parseNumber(rawPorc, 100);
    const semana = getVal(['semana', 'sem', 'week']) || '2026-28';
    const fecha = getVal(['fecha', 'date']) || '';

    return {
      id: `bi-${idx + 1}`,
      semana,
      codigo,
      nombre,
      labor,
      formador,
      tipoAcompanamiento,
      porcentajeAcompanamiento,
      metaAcompanamiento: 100,
      indicadorOrigen: 'Bajo Rendimiento',
      estadoAcompanamiento: porcentajeAcompanamiento >= 100 ? 'Completado' : 'En Proceso',
      fecha
    };
  }).filter(item => item.nombre !== '' || item.codigo !== '');
}

export async function fetchSheetsDataFromGoogle(spreadsheetId: string): Promise<SheetsDataResponse> {
  const [rawRendimiento, rawConsolidado, rawMatriculas, rawBajosIndicadores] = await Promise.all([
    fetchSheetCSV(spreadsheetId, 'Rendimiento').catch(() => null),
    fetchSheetCSV(spreadsheetId, 'Consolidado').catch(() => null),
    fetchSheetCSV(spreadsheetId, 'Matrículas').catch(() => fetchSheetCSV(spreadsheetId, 'Matriculas').catch(() => null)),
    fetchSheetCSV(spreadsheetId, 'Bajos_Indicadores').catch(() => fetchSheetCSV(spreadsheetId, 'Bajos Indicadores').catch(() => null))
  ]);

  let rendimientos: EvaluacionRendimiento[] = [];
  let consolidados: EvaluacionCalidad[] = [];
  let matriculas: PersonaMatricula[] = [];
  let bajosIndicadores: RegistroBajoIndicador[] = [];
  let source: 'google_sheets_live' | 'mock_default' = 'google_sheets_live';

  if (rawRendimiento && rawRendimiento.length > 0) {
    rendimientos = mapRendimientoRows(rawRendimiento);
  }
  if (rawConsolidado && rawConsolidado.length > 0) {
    consolidados = mapConsolidadoRows(rawConsolidado);
  }
  if (rawMatriculas && rawMatriculas.length > 0) {
    matriculas = mapMatriculasRows(rawMatriculas);
  }
  if (rawBajosIndicadores && rawBajosIndicadores.length > 0) {
    bajosIndicadores = mapBajosIndicadoresRows(rawBajosIndicadores);
  }

  if (rendimientos.length === 0 && consolidados.length === 0) {
    source = 'mock_default';
    rendimientos = MOCK_RENDIMIENTO;
    consolidados = MOCK_CONSOLIDADO_CALIDAD;
    matriculas = MOCK_MATRICULAS;
    bajosIndicadores = MOCK_BAJOS_INDICADORES;
  } else {
    if (matriculas.length === 0) matriculas = MOCK_MATRICULAS;
    if (bajosIndicadores.length === 0) bajosIndicadores = MOCK_BAJOS_INDICADORES;
  }

  const consolidadoPriorizado = consolidarPriorizacion(rendimientos, consolidados, matriculas);

  const semanasSet = new Set<string>();
  rendimientos.forEach((r) => r.semana && semanasSet.add(r.semana));
  consolidados.forEach((c) => c.semana && semanasSet.add(c.semana));
  bajosIndicadores.forEach((b) => b.semana && semanasSet.add(b.semana));
  const semanasDisponibles = Array.from(semanasSet).sort().reverse();

  return {
    sheetId: spreadsheetId,
    rendimientoRaw: rendimientos,
    consolidadoRaw: consolidados,
    matriculasRaw: matriculas,
    bajosIndicadoresRaw: bajosIndicadores,
    consolidadoPriorizado,
    semanasDisponibles,
    source,
    lastUpdated: new Date().toISOString()
  };
}
