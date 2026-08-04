import React, { useState } from 'react';
import { Upload, Link as LinkIcon, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { EvaluacionRendimiento, EvaluacionCalidad, PersonaMatricula } from '../types';

interface CustomCSVUploaderProps {
  currentSheetId: string;
  onCustomDataLoaded: (data: {
    rendimiento: EvaluacionRendimiento[];
    consolidado: EvaluacionCalidad[];
    matriculas: PersonaMatricula[];
    customSheetId?: string;
  }) => void;
}

export const CustomCSVUploader: React.FC<CustomCSVUploaderProps> = ({
  currentSheetId,
  onCustomDataLoaded
}) => {
  const [sheetInput, setSheetInput] = useState<string>(currentSheetId);
  const [pastedCSV, setPastedCSV] = useState<string>('');
  const [csvType, setCsvType] = useState<'rendimiento' | 'consolidado' | 'matriculas'>('rendimiento');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorStatus, setErrorStatus] = useState<string>('');

  const handleApplySheetId = () => {
    setErrorStatus('');
    let cleanId = sheetInput.trim();
    // Extraer ID si el usuario pegó la URL completa
    if (cleanId.includes('/spreadsheets/d/')) {
      const match = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    if (!cleanId) {
      setErrorStatus('Por favor ingrese un ID o enlace válido de Google Sheets.');
      return;
    }

    onCustomDataLoaded({
      rendimiento: [],
      consolidado: [],
      matriculas: [],
      customSheetId: cleanId
    });
    setUploadStatus(`Conectando a Google Sheets ID: ${cleanId}...`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorStatus('');
    setUploadStatus('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setErrorStatus('El archivo Excel/CSV no contiene hojas válidas.');
          return;
        }

        // Buscar una hoja relevante por nombre o tomar la primera
        let sheetName = workbook.SheetNames[0];
        if (csvType === 'rendimiento') {
          const match = workbook.SheetNames.find(s => s.toLowerCase().includes('rendimiento'));
          if (match) sheetName = match;
        } else if (csvType === 'consolidado') {
          const match = workbook.SheetNames.find(s => s.toLowerCase().includes('consolidado') || s.toLowerCase().includes('calidad'));
          if (match) sheetName = match;
        } else if (csvType === 'matriculas') {
          const match = workbook.SheetNames.find(s => s.toLowerCase().includes('matricula'));
          if (match) sheetName = match;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
        
        if (rows.length === 0) {
          setErrorStatus(`La hoja "${sheetName}" no contiene datos.`);
          return;
        }

        processParsedRows(rows);
      } catch (err: any) {
        setErrorStatus(`Error al procesar archivo Excel/CSV: ${err?.message || err}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleParsePastedCSV = () => {
    setErrorStatus('');
    setUploadStatus('');
    if (!pastedCSV.trim()) {
      setErrorStatus('Pegue el contenido o filas copiadas de Excel o CSV.');
      return;
    }

    const parsed = Papa.parse(pastedCSV, { header: true, skipEmptyLines: true });
    processParsedRows(parsed.data);
  };

  const processParsedRows = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setErrorStatus('No se encontraron filas válidas en los datos.');
      return;
    }

    const cleanHeader = (header: string) =>
      header.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const parseNumber = (val: any, defaultVal = 0) => {
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
    };

    if (csvType === 'rendimiento') {
      const mapped: EvaluacionRendimiento[] = rows.map((r) => {
        const keys = Object.keys(r);
        const codeKey = keys.find(k => {
          const cleanK = cleanHeader(k);
          if (cleanK.startsWith('id_') || cleanK === 'id_consolidado' || cleanK === 'id_rendimiento' || cleanK === 'llave') return false;
          return cleanK === 'codigo' || cleanK === 'matricula' || cleanK === 'documento' || cleanK === 'cedula' || cleanK.includes('codigo');
        });
        const nameKey = keys.find(k => {
          const cleanK = cleanHeader(k);
          return cleanK === 'nombre' || cleanK === 'operario' || cleanK === 'empleado' || cleanK === 'persona' || (cleanK.includes('nombre') && !cleanK.includes('ingreso'));
        });
        const laborKey = keys.find(k => cleanHeader(k).includes('labor') || cleanHeader(k).includes('tarea'));
        const rendKey = keys.find(k => {
          const cleanK = cleanHeader(k);
          if (cleanK.includes('meta') || cleanK.includes('minimo') || cleanK.includes('observacion') || cleanK.includes('observación')) return false;
          return cleanK === 'rendimiento' || cleanK === 'rend' || cleanK.includes('productividad');
        });
        const metaKey = keys.find(k => cleanHeader(k).includes('meta'));
        const minKey = keys.find(k => cleanHeader(k).includes('minimo') || cleanHeader(k).includes('mínimo'));
        const obsKey = keys.find(k => cleanHeader(k).includes('observacion') || cleanHeader(k).includes('observación'));
        const semKey = keys.find(k => cleanHeader(k).includes('semana') || cleanHeader(k).includes('sem'));

        const rawCodigo = codeKey ? r[codeKey] : (r.Código || r.Codigo || '');
        const rawNombre = nameKey ? r[nameKey] : (r.Nombre || '');
        const rawLabor = laborKey ? r[laborKey] : (r.Labor || 'Poscosecha');
        const rawSemana = semKey ? r[semKey] : (r.Semana || '2026-28');

        let semana = String(rawSemana).trim();
        if (semana && !semana.includes('-')) {
          const numSem = parseInt(semana, 10);
          if (!isNaN(numSem)) semana = `2026-${numSem.toString().padStart(2, '0')}`;
        }

        const minimoVal = parseNumber(minKey ? r[minKey] : r.Minimo, 80);

        return {
          ano: parseInt(r.Año || r.Ano || '2026') || 2026,
          semana,
          codigo: String(rawCodigo).trim(),
          nombre: String(rawNombre).trim(),
          labor: String(rawLabor).trim(),
          rendimiento: parseNumber(rendKey ? r[rendKey] : r.Rendimiento, 0),
          meta: parseNumber(metaKey ? r[metaKey] : r.Meta, 100),
          minimo: minimoVal,
          observacion: parseNumber(obsKey ? r[obsKey] : r.Observacion, Math.round(minimoVal * 0.9))
        };
      }).filter((x) => x.codigo !== '' || x.nombre !== '');

      onCustomDataLoaded({ rendimiento: mapped, consolidado: [], matriculas: [] });
      setUploadStatus(`Cargadas ${mapped.length} evaluaciones de Rendimiento correctamente.`);
    } else if (csvType === 'consolidado') {
      const mapped: EvaluacionCalidad[] = rows.map((r) => {
        const keys = Object.keys(r);
        const codeKey = keys.find(k => {
          const cleanK = cleanHeader(k);
          if (cleanK.startsWith('id_') || cleanK === 'id_consolidado' || cleanK === 'id_rendimiento' || cleanK === 'llave') return false;
          return cleanK === 'codigo' || cleanK === 'matricula' || cleanK === 'documento' || cleanK === 'cedula' || cleanK.includes('codigo');
        });
        const nameKey = keys.find(k => {
          const cleanK = cleanHeader(k);
          return cleanK === 'nombre' || cleanK === 'operario' || cleanK === 'empleado' || cleanK === 'persona' || (cleanK.includes('nombre') && !cleanK.includes('ingreso'));
        });
        const laborKey = keys.find(k => cleanHeader(k).includes('labor') || cleanHeader(k).includes('tarea'));

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

        const semKey = keys.find(k => cleanHeader(k).includes('semana') || cleanHeader(k).includes('sem'));

        const rawCodigo = codeKey ? r[codeKey] : (r.Código || r.Codigo || '');
        const rawNombre = nameKey ? r[nameKey] : (r.Nombre || '');
        const rawLabor = laborKey ? r[laborKey] : (r.Labor || 'Calidad');
        const rawSemana = semKey ? r[semKey] : (r.Semana || '2026-28');

        let semana = String(rawSemana).trim();
        if (semana && !semana.includes('-')) {
          const numSem = parseInt(semana, 10);
          if (!isNaN(numSem)) semana = `2026-${numSem.toString().padStart(2, '0')}`;
        }

        let valCalidad = calKey ? parseNumber(r[calKey], NaN) : NaN;
        let valProceso = procKey ? parseNumber(r[procKey], NaN) : NaN;
        let valProducto = prodKey ? parseNumber(r[prodKey], NaN) : NaN;

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

        return {
          ano: parseInt(r.Año || r.Ano || '2026') || 2026,
          semana,
          codigo: String(rawCodigo).trim(),
          nombre: String(rawNombre).trim(),
          labor: String(rawLabor).trim(),
          porcentajeProcentaje: isNaN(valProceso) ? finalCalidad : valProceso,
          porcentajeProceso: isNaN(valProceso) ? undefined : valProceso,
          porcentajeProducto: isNaN(valProducto) ? undefined : valProducto,
          porcentajeCalidad: finalCalidad,
          metaCalidad: 90
        };
      }).filter((x) => x.codigo !== '' || x.nombre !== '');

      onCustomDataLoaded({ rendimiento: [], consolidado: mapped, matriculas: [] });
      setUploadStatus(`Cargadas ${mapped.length} evaluaciones de Calidad correctamente.`);
    } else if (csvType === 'matriculas') {
      const mapped: PersonaMatricula[] = rows.map((r) => ({
        codigo: String(r.Código || r.Codigo || r.Matrícula || r.Matricula || '').trim(),
        nombre: String(r.Nombre || '').trim(),
        cargo: String(r.Cargo || 'Operario Poscosecha').trim(),
        area: String(r.Área || r.Area || 'Poscosecha').trim()
      })).filter((x) => x.codigo !== '');

      onCustomDataLoaded({ rendimiento: [], consolidado: [], matriculas: mapped });
      setUploadStatus(`Cargadas ${mapped.length} matrículas correctamente.`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 mb-8 space-y-6">
      
      <div>
        <h2 className="text-lg font-serif font-medium text-stone-800 flex items-center gap-2">
          <Upload className="w-5 h-5 text-stone-600" />
          Conexión y Carga Personalizada de Datos
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Modifique el ID de Google Sheets o cargue archivos CSV/Excel directamente para actualizar el informe de priorización.
        </p>
      </div>

      {/* Option 1: Google Sheets URL / ID Input */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
        <label className="block text-xs font-serif font-medium text-stone-800 flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4 text-stone-500" />
          Enlace o ID de Google Spreadsheet:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={sheetInput}
            onChange={(e) => setSheetInput(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/1kDg5T5Nv9UqHPRDNw2tgLNrrqMIkcjb-_aIFnE5rDV4/..."
            className="flex-1 bg-white border border-stone-200 text-xs font-mono rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-[#7C816F] focus:outline-none"
          />
          <button
            onClick={handleApplySheetId}
            className="px-4 py-2 bg-[#0a2958] hover:bg-[#144287] text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            Conectar Hoja
          </button>
        </div>
      </div>

      {/* Option 2: Upload Excel / CSV / Paste Data */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-serif font-medium text-stone-800 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-stone-500" />
            Cargar o Pegar Archivo Excel / CSV
          </label>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500">Tipo de hoja:</span>
            <select
              value={csvType}
              onChange={(e) => setCsvType(e.target.value as any)}
              className="bg-white border border-stone-200 text-xs rounded px-2 py-1 text-stone-800 font-medium"
            >
              <option value="rendimiento">Hoja Rendimiento</option>
              <option value="consolidado">Hoja Consolidado (% Proceso)</option>
              <option value="matriculas">Hoja Matrículas</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-stone-300 p-4 rounded-xl text-center bg-white flex flex-col items-center justify-center space-y-2">
            <FileSpreadsheet className="w-6 h-6 text-stone-400" />
            <p className="text-xs text-stone-600">
              Seleccione un archivo Excel (.xlsx, .xls) o CSV (.csv) de su equipo
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#0a2958] file:text-white hover:file:bg-[#144287]"
            />
          </div>

          {/* Paste CSV text area */}
          <div className="space-y-2">
            <textarea
              rows={4}
              value={pastedCSV}
              onChange={(e) => setPastedCSV(e.target.value)}
              placeholder="Pegue filas copiadas de Excel o CSV aquí..."
              className="w-full bg-white border border-stone-200 text-xs font-mono rounded-lg p-2 text-stone-800 focus:ring-2 focus:ring-[#0a2958] focus:outline-none"
            />
            <button
              onClick={handleParsePastedCSV}
              className="w-full py-1.5 bg-[#0a2958] hover:bg-[#144287] text-white text-xs font-medium rounded-lg transition-colors"
            >
              Procesar Texto Pegado
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {uploadStatus && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {uploadStatus}
        </div>
      )}

      {errorStatus && (
        <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {errorStatus}
        </div>
      )}

    </div>
  );
};
