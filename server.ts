import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Papa from 'papaparse';
import {
  EvaluacionRendimiento,
  EvaluacionCalidad,
  PersonaMatricula,
  RegistroBajoIndicador,
  SheetsDataResponse
} from './src/types.js';
import { consolidarPriorizacion } from './src/utils/calculations.js';
import {
  MOCK_RENDIMIENTO,
  MOCK_CONSOLIDADO_CALIDAD,
  MOCK_MATRICULAS,
  MOCK_BAJOS_INDICADORES
} from './src/data/mockData.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const SPREADSHEET_ID_DEFAULT = '1kDg5T5Nv9UqHPRDNw2tgLNrrqMIkcjb-_aIFnE5rDV4';

/**
 * Normaliza nombres de encabezados
 */
function cleanHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convierte texto numérico con formato (ej: "92.5%", "450,0", "1.200") a number JS
 */
function parseNumber(val: any, defaultVal = 0): number {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') return val;
  let str = String(val).replace('%', '').trim();
  // Manejo de comas decimales europeas / latinoamericanas
  if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } else if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Obtiene y procesa una hoja de Google Sheets vía exportación pública CSV gviz
 */
async function fetchSheetCSV(spreadsheetId: string, sheetName: string): Promise<any[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al consultar hoja '${sheetName}' (status ${response.status})`);
  }
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return parsed.data || [];
}

/**
 * Mapea las filas CSV de 'Rendimiento' a EvaluacionRendimiento[]
 */
function mapRendimientoRows(rows: any[]): EvaluacionRendimiento[] {
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
    const rawLabor = getValGeneric(['labor', 'tarea', 'actividad']) || 'Poscosecha General';

    const rendKey = keys.find(k => {
      const cleanK = cleanHeader(k);
      if (cleanK.includes('meta') || cleanK.includes('minimo') || cleanK.includes('mínimo') || cleanK.includes('observacion') || cleanK.includes('observación')) return false;
      return cleanK === 'rendimiento' || cleanK === 'rend' || cleanK.includes('productividad');
    });
    const rawRendimiento = rendKey ? row[rendKey] : undefined;
    const rawMeta = getValGeneric(['meta', 'rendimiento meta']);
    const rawMinimo = getValGeneric(['minimo', 'rendimiento minimo', 'mínimo']);
    const rawObservacion = getValGeneric(['observacion', 'rendimiento observacion', 'observación', 'en observacion']);

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
    const minimo = parseNumber(rawMinimo, 80);
    const observacion = parseNumber(rawObservacion, Math.round(minimo * 0.9));

    return {
      ano,
      semana,
      fecha: rawFecha ? String(rawFecha).trim() : undefined,
      codigo: String(rawCodigo).trim(),
      nombre: String(rawNombre).trim(),
      labor: String(rawLabor).trim(),
      rendimiento,
      meta,
      minimo,
      observacion
    };
  }).filter(item => item.codigo !== '' || item.nombre !== '');
}

/**
 * Mapea las filas CSV de 'Consolidado' a EvaluacionCalidad[]
 */
function mapConsolidadoRows(rows: any[]): EvaluacionCalidad[] {
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

    // Búsqueda inteligente de columnas de Calidad, Proceso y Producto
    const findMetricKey = (metricName: 'proceso' | 'producto' | 'calidad'): string | undefined => {
      const cleanKeys = keys.map(k => ({ original: k, clean: cleanHeader(k) }));

      // 1. Patrones exactos con porcentaje
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

      // 2. Encabezado con % o porcentaje y el nombre de la métrica
      const pctMatch = cleanKeys.find(ck => {
        if (ck.clean.includes('meta') || ck.clean.includes('objetivo') || ck.clean.startsWith('id_') || ck.clean === 'llave') return false;
        const hasPct = ck.clean.includes('%') || ck.clean.includes('porcentaje') || ck.clean.includes('pct');
        return hasPct && ck.clean.includes(metricName);
      });
      if (pctMatch) return pctMatch.original;

      // 3. Palabra exacta (ej: "proceso", "producto", "calidad") descartando columnas de texto conocidas
      const simpleMatch = cleanKeys.find(ck => {
        if (ck.clean.includes('meta') || ck.clean.includes('objetivo') || ck.clean.startsWith('id_') || ck.clean === 'llave' || ck.clean === 'registro' || ck.clean === 'labor' || ck.clean === 'tipo' || ck.clean === 'nombre' || ck.clean === 'codigo') return false;
        return ck.clean === metricName;
      });
      if (simpleMatch) return simpleMatch.original;

      // 4. Último recurso: contiene el nombre de la métrica excluyendo columnas de texto no numéricas
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

/**
 * Mapea las filas CSV de 'Matrículas' a PersonaMatricula[]
 */
function mapMatriculasRows(rows: any[]): PersonaMatricula[] {
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

/**
 * Mapea las filas de 'Bajos_Indicadores' a RegistroBajoIndicador[]
 */
function mapBajosIndicadoresRows(rows: any[]): RegistroBajoIndicador[] {
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

// API Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint principal para consultar y consolidar datos de Google Sheets
app.get(['/api/sheets/data', '/sheets/data'], (async (req, res) => {
  const spreadsheetId = (req.query.spreadsheetId as string) || SPREADSHEET_ID_DEFAULT;

  try {
    // Intentar leer las pestañas desde Google Sheets
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

    // Si la lectura en vivo falló o no devolvió filas suficientes, usamos mock predeterminado
    if (rendimientos.length === 0 && consolidados.length === 0) {
      source = 'mock_default';
      rendimientos = MOCK_RENDIMIENTO;
      consolidados = MOCK_CONSOLIDADO_CALIDAD;
      matriculas = MOCK_MATRICULAS;
      bajosIndicadores = MOCK_BAJOS_INDICADORES;
    } else {
      // Completar matrículas y bajos indicadores si estaban vacíos
      if (matriculas.length === 0) {
        matriculas = MOCK_MATRICULAS;
      }
      if (bajosIndicadores.length === 0) {
        bajosIndicadores = MOCK_BAJOS_INDICADORES;
      }
    }

    const consolidadoPriorizado = consolidarPriorizacion(rendimientos, consolidados, matriculas);

    // Obtener lista única de semanas ordenadas descendantemente
    const semanasSet = new Set<string>();
    rendimientos.forEach((r) => r.semana && semanasSet.add(r.semana));
    consolidados.forEach((c) => c.semana && semanasSet.add(c.semana));
    bajosIndicadores.forEach((b) => b.semana && semanasSet.add(b.semana));
    const semanasDisponibles = Array.from(semanasSet).sort().reverse();

    const payload: SheetsDataResponse = {
      sheetId: spreadsheetId,
      source,
      lastUpdated: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      semanasDisponibles,
      rendimientoRaw: rendimientos,
      consolidadoRaw: consolidados,
      matriculasRaw: matriculas,
      bajosIndicadoresRaw: bajosIndicadores,
      consolidadoPriorizado
    };

    return res.json(payload);
  } catch (err: any) {
    console.error('Error procesando Google Sheets:', err);
    // Fallback gracioso a mockdata ante errores de conexión o permisos
    const fallbackConsolidado = consolidarPriorizacion(
      MOCK_RENDIMIENTO,
      MOCK_CONSOLIDADO_CALIDAD,
      MOCK_MATRICULAS
    );

    return res.json({
      sheetId: spreadsheetId,
      source: 'mock_default',
      lastUpdated: new Date().toLocaleTimeString('es-CO'),
      semanasDisponibles: ['2026-28', '2026-27'],
      rendimientoRaw: MOCK_RENDIMIENTO,
      consolidadoRaw: MOCK_CONSOLIDADO_CALIDAD,
      matriculasRaw: MOCK_MATRICULAS,
      bajosIndicadoresRaw: MOCK_BAJOS_INDICADORES,
      consolidadoPriorizado: fallbackConsolidado,
      error: `No se pudo conectar a Google Sheets en tiempo real: ${err.message}. Mostrando datos locales de respaldo.`
    });
  }
}) as express.RequestHandler);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  }
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
