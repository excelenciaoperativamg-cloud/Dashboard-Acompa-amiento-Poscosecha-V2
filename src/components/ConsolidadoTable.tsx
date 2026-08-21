import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, ArrowUpDown, FileSpreadsheet, Printer, X, ExternalLink, Download, Copy, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ConsolidadoPriorizacion, Calificacion } from '../types';
import { LaborMultiSelect } from './LaborMultiSelect';
import { ProcesoMultiSelect } from './ProcesoMultiSelect';

interface ConsolidadoTableProps {
  data: ConsolidadoPriorizacion[];
  semanaSeleccionada: string;
  laboresDisponibles?: string[];
  laboresSeleccionadas?: string[];
  onSelectLabores?: (labores: string[]) => void;
  procesosDisponibles?: string[];
  procesosSeleccionados?: string[];
  onSelectProcesos?: (procesos: string[]) => void;
}

export const ConsolidadoTable: React.FC<ConsolidadoTableProps> = ({
  data,
  semanaSeleccionada,
  laboresDisponibles = [],
  laboresSeleccionadas = [],
  onSelectLabores,
  procesosDisponibles = [],
  procesosSeleccionados = [],
  onSelectProcesos
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<keyof ConsolidadoPriorizacion>('nivelPrioridad');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field: keyof ConsolidadoPriorizacion) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'nivelPrioridad') {
      const pRank = { Alta: 1, Media: 2, Baja: 3 };
      valA = pRank[a.nivelPrioridad];
      valB = pRank[b.nivelPrioridad];
    } else {
      if (valA === '-' || valA === undefined) valA = -1;
      if (valB === '-' || valB === undefined) valB = -1;
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const getBadgeStyle = (calificacion: Calificacion) => {
    switch (calificacion) {
      case 'Sobresaliente':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      case 'Bueno':
        return 'bg-stone-100 text-stone-700 border-stone-200 font-medium';
      case 'En desarrollo':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      case 'En observación':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
      case '-':
      default:
        return 'bg-stone-100/60 text-stone-400 border-stone-200 font-normal';
    }
  };

  const exportExcel = () => {
    const headers = [
      'Semana',
      'Código',
      'Nombre',
      'Labor',
      'Rendimiento',
      'Meta Rendimiento',
      '% CALIDAD',
      'Meta Calidad',
      'Resultado Rendimiento',
      'Resultado Calidad',
      'Nivel Prioridad',
      '#AF/Día Formador',
      'Acompañamiento/sem Sup Ruta',
      'Acompañamiento/sem Sup Proceso'
    ];

    const rows = sortedData.map((d) => [
      d.semana,
      d.codigo,
      d.nombre,
      d.labor,
      d.rendimiento,
      d.metaRendimiento,
      d.porcentajeProceso !== undefined && !isNaN(d.porcentajeProceso) ? `${d.porcentajeProceso.toFixed(1)}%` : '-',
      `${d.metaCalidad || 90}%`,
      d.resultadoRendimiento,
      d.resultadoCalidad,
      d.nivelPrioridad,
      d.afDiaFormador,
      d.acompSemSupRuta,
      d.acompSemSupProceso
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Ancho de columnas optimizado
    worksheet['!cols'] = [
      { wch: 10 }, // Semana
      { wch: 12 }, // Código
      { wch: 32 }, // Nombre
      { wch: 22 }, // Labor
      { wch: 14 }, // Rendimiento
      { wch: 12 }, // Meta Rend
      { wch: 18 }, // Calidad
      { wch: 12 }, // Meta Calidad
      { wch: 22 }, // Resultado Rendimiento
      { wch: 20 }, // Resultado Calidad
      { wch: 15 }, // Nivel Prioridad
      { wch: 18 }, // #AF/Día Formador
      { wch: 28 }, // Sup Ruta
      { wch: 30 }  // Sup Proceso
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidado Priorización');

    const fileName = `Consolidado_Acompanamiento_Semana_${semanaSeleccionada || 'Todas'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const generatePrintHTML = () => {
    const rowsHtml = sortedData.map((d) => {
      const isCalidadBaja = d.porcentajeProceso !== undefined && d.porcentajeProceso < 85;
      const calidadText = d.porcentajeProceso !== undefined && !isNaN(d.porcentajeProceso) ? `${d.porcentajeProceso.toFixed(1)}%` : '-';
      return `
        <tr>
          <td>${d.semana}</td>
          <td style="font-family: monospace;">${d.codigo}</td>
          <td><strong>${d.nombre}</strong></td>
          <td>${d.labor}</td>
          <td style="font-family: monospace;">${d.rendimiento} / ${d.metaRendimiento}</td>
          <td style="font-family: monospace; ${isCalidadBaja ? 'color: #dc2626; font-weight: bold;' : ''}">${calidadText}</td>
          <td>${d.resultadoRendimiento}</td>
          <td>${d.resultadoCalidad}</td>
          <td style="font-weight: bold; ${d.nivelPrioridad === 'Alta' ? 'color: #dc2626;' : d.nivelPrioridad === 'Media' ? 'color: #d97706;' : 'color: #16a34a;'}">${d.nivelPrioridad}</td>
          <td>${d.afDiaFormador}</td>
          <td>${d.acompSemSupRuta}</td>
          <td>${d.acompSemSupProceso}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consolidado de Priorización - Semana ${semanaSeleccionada || 'Todas'}</title>
          <style>
            @page { size: landscape; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; font-size: 11px; color: #1c1917; margin: 0; padding: 15px; }
            h1 { font-size: 18px; margin: 0 0 4px 0; color: #0a2958; font-family: Georgia, serif; }
            p.sub { font-size: 11px; color: #57534e; margin: 0 0 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
            th, td { border: 1px solid #d6d3d1; padding: 6px 8px; text-align: left; }
            th { background-color: #f5f5f4; font-weight: 600; text-transform: uppercase; font-size: 9px; color: #44403c; }
            tr:nth-child(even) { background-color: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Consolidado de Priorización de Acompañamiento</h1>
          <p class="sub">Semana: ${semanaSeleccionada || 'Todas'} | Total Registros: ${sortedData.length}</p>
          <table>
            <thead>
              <tr>
                <th>Semana</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Labor</th>
                <th>Rendimiento / Meta</th>
                <th>% CALIDAD</th>
                <th>Res. Rend.</th>
                <th>Res. Calidad</th>
                <th>Prioridad</th>
                <th>#AF/Día Form.</th>
                <th>Acomp. Sup Ruta</th>
                <th>Acomp. Sup Proc</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const handleOpenNewTab = () => {
    try {
      const htmlContent = generatePrintHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url, '_blank');
      if (newWin) {
        newWin.focus();
        setTimeout(() => {
          try {
            newWin.print();
          } catch (e) {
            console.log('Auto print in new window failed:', e);
          }
        }, 500);
      } else {
        alert('El navegador bloqueó la ventana emergente. Por favor permite popups para esta página o usa "Descargar HTML".');
      }
    } catch (e) {
      console.error('Error opening new tab:', e);
    }
  };

  const handleDownloadHTML = () => {
    const htmlContent = generatePrintHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Consolidado_Priorizacion_Semana_${semanaSeleccionada || 'Todas'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTSV = () => {
    const headers = ['Semana', 'Código', 'Nombre', 'Labor', 'Rendimiento', 'Meta', '% CALIDAD', 'Res. Rendimiento', 'Res. Calidad', 'Nivel Prioridad', '#AF/Día Formador', 'Acomp Sup Ruta', 'Acomp Sup Proceso'];
    const rows = sortedData.map(d => [
      d.semana, d.codigo, d.nombre, d.labor, d.rendimiento, d.metaRendimiento, d.porcentajeProceso !== undefined && !isNaN(d.porcentajeProceso) ? `${d.porcentajeProceso.toFixed(1)}%` : '-', d.resultadoRendimiento, d.resultadoCalidad, d.nivelPrioridad, d.afDiaFormador, d.acompSemSupRuta, d.acompSemSupProceso
    ].join('\t'));
    const text = [headers.join('\t'), ...rows].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-visible relative mb-8">
      
      {/* Table Header Controls */}
      <div className="p-4 bg-[#0a2958] text-white border-b border-[#0f3875] rounded-t-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 overflow-visible relative z-20">
        <div>
          <h2 className="text-lg font-serif font-medium text-white flex items-center gap-2">
            Consolidado de Priorización de Acompañamiento
          </h2>
          <p className="text-xs text-blue-100/80">
            Se priorizan las evaluaciones más bajas de la semana para definir la frecuencia de acompañamiento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Labor multi-select filter inside table bar if available */}
          {onSelectLabores && (
            <div className="w-52">
              <LaborMultiSelect
                laboresDisponibles={laboresDisponibles}
                laboresSeleccionadas={laboresSeleccionadas}
                onChange={onSelectLabores}
                darkTheme={true}
              />
            </div>
          )}

          {/* Proceso multi-select filter inside table bar if available */}
          {onSelectProcesos && (
            <div className="w-52">
              <ProcesoMultiSelect
                procesosDisponibles={procesosDisponibles}
                procesosSeleccionados={procesosSeleccionados}
                onChange={onSelectProcesos}
                darkTheme={true}
              />
            </div>
          )}

          <button
            id="btn-export-excel"
            onClick={exportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#144287] hover:bg-[#1a50a3] text-white transition-colors border border-blue-400/30 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exportar Excel (.xlsx)
          </button>
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#0e336b] hover:bg-[#154287] text-blue-100 border border-blue-800 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table id="tabla-consolidado-priorizacion" className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100 text-stone-700 font-serif font-medium uppercase tracking-wider text-[11px] border-b border-stone-200">
              <th className="px-1 py-2 w-6"></th>
              <th className="px-1.5 py-2 text-left cursor-pointer hover:bg-stone-200/60 whitespace-nowrap" onClick={() => handleSort('nombre')}>
                <div className="flex items-center gap-1">
                  Nombre <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-left cursor-pointer hover:bg-stone-200/60 whitespace-nowrap" onClick={() => handleSort('labor')}>
                <div className="flex items-center gap-1">
                  Labor <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-left cursor-pointer hover:bg-stone-200/60 whitespace-nowrap" onClick={() => handleSort('rendimiento')}>
                <div className="flex items-center gap-1">
                  Rend. <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-left cursor-pointer hover:bg-stone-200/60 whitespace-nowrap" onClick={() => handleSort('porcentajeProceso')}>
                <div className="flex items-center gap-1">
                  % CALIDAD <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-left cursor-pointer hover:bg-stone-200/60 whitespace-nowrap" onClick={() => handleSort('resultadoRendimiento')}>
                <div className="flex items-center gap-1">
                  Res. Rend. <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-left cursor-pointer hover:bg-stone-200/60 whitespace-nowrap" onClick={() => handleSort('resultadoCalidad')}>
                <div className="flex items-center gap-1">
                  Res. Calidad <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-center bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 whitespace-nowrap" onClick={() => handleSort('afDiaFormador')}>
                <div className="flex items-center justify-center gap-1 font-sans">
                  #AF/Día Form. <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-center bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 whitespace-nowrap" onClick={() => handleSort('acompSemSupRuta')}>
                <div className="flex items-center justify-center gap-1 font-sans">
                  Sup. Ruta <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th className="px-1.5 py-2 text-center bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 whitespace-nowrap" onClick={() => handleSort('acompSemSupProceso')}>
                <div className="flex items-center justify-center gap-1 font-sans">
                  Sup. Proc. <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-stone-500">
                  No se encontraron registros para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const isExpanded = !!expandedRows[row.id];
                const hasMultipleEvaluations =
                  row.todasLasEvaluacionesRendimiento.length > 1 ||
                  row.todasLasEvaluacionesCalidad.length > 1;

                // Estilo de fila según nivel de prioridad
                let rowBgClass = 'hover:bg-stone-50';
                if (row.nivelPrioridad === 'Alta') {
                  rowBgClass = 'bg-rose-50/40 hover:bg-rose-50/70';
                } else if (row.nivelPrioridad === 'Media') {
                  rowBgClass = 'bg-amber-50/30 hover:bg-amber-50/60';
                }

                const isBelowMinRendimiento =
                  (row.minimoRendimiento && row.minimoRendimiento > 0)
                    ? row.rendimiento < row.minimoRendimiento
                    : (row.resultadoRendimiento === 'En observación' || (row.metaRendimiento > 0 && row.rendimiento < row.metaRendimiento));

                return (
                  <React.Fragment key={row.id}>
                    <tr className={`transition-colors ${rowBgClass}`}>
                      <td className="px-1 py-1.5 text-center">
                        {hasMultipleEvaluations && (
                          <button
                            onClick={() => toggleRow(row.id)}
                            className="p-0.5 rounded hover:bg-stone-200 text-stone-500"
                            title="Ver desglose de todas las evaluaciones de la semana"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-stone-800" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-1.5 py-1.5 font-medium text-stone-900 whitespace-nowrap text-left">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <span>{row.nombre}</span>
                          {row.nivelPrioridad === 'Alta' && (
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" title="Prioridad Alta de acompañamiento" />
                          )}
                        </div>
                      </td>
                      <td className="px-1.5 py-1.5 font-medium text-stone-600 whitespace-nowrap text-left">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <span>{row.labor}</span>
                          {hasMultipleEvaluations && (
                            <span
                              className="inline-flex items-center px-1 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-[#0a2958] border border-blue-200 shrink-0"
                              title={`Promedio consolidado de ${Math.max(row.todasLasEvaluacionesRendimiento.length, row.todasLasEvaluacionesCalidad.length)} evaluaciones`}
                            >
                              {Math.max(row.todasLasEvaluacionesRendimiento.length, row.todasLasEvaluacionesCalidad.length)} ev.
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-1.5 py-1.5 text-left text-[11px] whitespace-nowrap">
                        <div className="leading-snug">
                          <div className={`font-mono ${isBelowMinRendimiento ? 'text-rose-600 font-bold' : 'text-stone-900 font-semibold'}`}>
                            {Math.round(row.rendimiento)}
                          </div>
                          <span className="text-[10px] text-stone-400 font-normal block">
                            (Meta: {Math.round(row.metaRendimiento)})
                          </span>
                        </div>
                      </td>
                      <td className={`px-1.5 py-1.5 font-mono text-[11px] whitespace-nowrap text-left ${row.porcentajeProceso !== undefined && row.porcentajeProceso < 85 ? 'text-rose-600 font-bold' : 'font-semibold text-[#0a2958]'}`}>
                        {row.porcentajeProceso !== undefined && !isNaN(row.porcentajeProceso) ? `${row.porcentajeProceso.toFixed(1)}%` : '-'}
                      </td>
                      
                      {/* Resultado Rendimiento Badge */}
                      <td className="px-1.5 py-1.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] border whitespace-nowrap ${getBadgeStyle(
                            row.resultadoRendimiento
                          )}`}
                        >
                          {row.resultadoRendimiento}
                        </span>
                      </td>

                      {/* Resultado Calidad Badge */}
                      <td className="px-1.5 py-1.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] border whitespace-nowrap ${getBadgeStyle(
                            row.resultadoCalidad
                          )}`}
                        >
                          {row.resultadoCalidad}
                        </span>
                      </td>

                      {/* #AF/Día Formador */}
                      <td className="px-1 py-1.5 text-center bg-blue-50/20 font-mono font-bold text-xs text-stone-800 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0a2958] text-white text-[11px] shadow-2xs">
                          {row.afDiaFormador}
                        </span>
                      </td>

                      {/* Acompañamiento/sem Sup Ruta */}
                      <td className="px-1 py-1.5 text-center bg-blue-50/20 font-mono font-bold text-xs whitespace-nowrap">
                        {row.acompSemSupRuta === '-' ? (
                          <span className="text-stone-400 font-normal">-</span>
                        ) : typeof row.acompSemSupRuta === 'number' && row.acompSemSupRuta > 0 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#0a2958] text-white text-[11px] shadow-2xs">
                            {row.acompSemSupRuta}
                          </span>
                        ) : (
                          <span className="text-stone-300">0</span>
                        )}
                      </td>

                      {/* Acompañamiento/sem Sup Proceso */}
                      <td className="px-1 py-1.5 text-center bg-blue-50/20 font-mono font-bold text-xs whitespace-nowrap">
                        {row.acompSemSupProceso === '-' ? (
                          <span className="text-stone-400 font-normal">-</span>
                        ) : typeof row.acompSemSupProceso === 'number' && row.acompSemSupProceso > 0 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#0a2958] text-white text-[11px] shadow-2xs">
                            {row.acompSemSupProceso}
                          </span>
                        ) : (
                          <span className="text-stone-300">0</span>
                        )}
                      </td>
                    </tr>

                    {/* Row Expansion: All evaluations for this operator during the week */}
                    {isExpanded && (
                      <tr className="bg-stone-50/80">
                        <td colSpan={10} className="p-4 border-t border-b border-stone-200">
                          <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-3">
                            <h4 className="text-xs font-serif font-medium text-stone-800">
                              Detalle de Evaluaciones Evaluadas en Semana {row.semana} para {row.nombre} ({row.codigo}):
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Evaluaciones de Rendimiento */}
                              <div>
                                <h5 className="text-[11px] font-medium text-stone-600 mb-1">
                                  Evaluaciones de Rendimiento ({row.todasLasEvaluacionesRendimiento.length}):
                                </h5>
                                <div className="space-y-1">
                                  {row.todasLasEvaluacionesRendimiento.map((r, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 bg-stone-50 rounded border border-stone-100 text-[11px] flex items-center justify-between"
                                    >
                                      <span><strong>Labor:</strong> {r.labor}</span>
                                      <span className="font-mono">
                                        Rend: {r.rendimiento} | Meta: {r.meta} | Mín: {r.minimo} | Obs: {r.observacion ?? Math.round(r.minimo * 0.9)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Evaluaciones de Calidad */}
                              <div>
                                <h5 className="text-[11px] font-medium text-stone-600 mb-1">
                                  Evaluaciones de Calidad ({row.todasLasEvaluacionesCalidad.length}):
                                </h5>

                                {/* Resumen de Promedios % Proceso y % Producto (tomando el menor) */}
                                {row.todasLasEvaluacionesCalidad.length > 0 && (() => {
                                  const calConProc = row.todasLasEvaluacionesCalidad.filter(c => (c.porcentajeProceso !== undefined && !isNaN(c.porcentajeProceso)) || (c.porcentajeProcentaje !== undefined && !isNaN(c.porcentajeProcentaje)));
                                  const sumProc = calConProc.reduce((acc, c) => acc + (c.porcentajeProceso ?? c.porcentajeProcentaje ?? 0), 0);
                                  const promProc = calConProc.length > 0 ? Math.round((sumProc / calConProc.length) * 10) / 10 : row.promedioProceso;

                                  const calConProd = row.todasLasEvaluacionesCalidad.filter(c => c.porcentajeProducto !== undefined && !isNaN(c.porcentajeProducto));
                                  const sumProd = calConProd.reduce((acc, c) => acc + (c.porcentajeProducto ?? 0), 0);
                                  const promProd = calConProd.length > 0 ? Math.round((sumProd / calConProd.length) * 10) / 10 : row.promedioProducto;

                                  let promCalidadMenor: number | undefined = undefined;
                                  if (promProc !== undefined && promProd !== undefined) {
                                    promCalidadMenor = Math.min(promProc, promProd);
                                  } else if (promProc !== undefined) {
                                    promCalidadMenor = promProc;
                                  } else if (promProd !== undefined) {
                                    promCalidadMenor = promProd;
                                  } else {
                                    promCalidadMenor = row.porcentajeProceso;
                                  }

                                  return (
                                    <div className="p-2.5 mb-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between gap-3 flex-wrap shadow-2xs">
                                      <div className="flex items-center gap-3 font-mono text-stone-700">
                                        <span>
                                          <strong>Promedio % Proceso:</strong> {promProc !== undefined && !isNaN(promProc) ? `${promProc}%` : '-'}
                                        </span>
                                        <span className="text-stone-300">|</span>
                                        <span>
                                          <strong>Promedio % Producto:</strong> {promProd !== undefined && !isNaN(promProd) ? `${promProd}%` : '-'}
                                        </span>
                                      </div>
                                      <div className="font-mono bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs flex items-center gap-1.5">
                                        <span className="text-stone-600 font-medium">Resultado % Calidad (Menor):</span>
                                        <span className={`font-bold text-xs ${promCalidadMenor !== undefined && promCalidadMenor < 85 ? 'text-rose-600' : 'text-[#0a2958]'}`}>
                                          {promCalidadMenor !== undefined && !isNaN(promCalidadMenor) ? `${promCalidadMenor}%` : '-'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}

                                <div className="space-y-1">
                                  {row.todasLasEvaluacionesCalidad.map((c, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 bg-stone-50 rounded border border-stone-100 text-[11px] flex items-center justify-between gap-2 flex-wrap"
                                    >
                                      <span><strong>Labor:</strong> {c.labor}</span>
                                      <div className="flex items-center gap-2.5 font-mono text-[10px]">
                                        <span className="text-stone-600 bg-stone-200/60 px-1.5 py-0.5 rounded">
                                          % Proceso: {(c.porcentajeProceso ?? c.porcentajeProcentaje) !== undefined ? `${c.porcentajeProceso ?? c.porcentajeProcentaje}%` : '-'}
                                        </span>
                                        <span className="text-stone-600 bg-stone-200/60 px-1.5 py-0.5 rounded">
                                          % Producto: {c.porcentajeProducto !== undefined ? `${c.porcentajeProducto}%` : '-'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Impresión / Reporte Generado */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#0a2958] text-white flex items-center justify-between shrink-0 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-200" />
                <div>
                  <h3 className="font-serif font-medium text-base text-white">Vista Previa de Impresión / Reporte</h3>
                  <p className="text-xs text-blue-100/80">
                    Semana: {semanaSeleccionada || 'Todas'} | Total Operadores: {sortedData.length}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar inside Modal */}
            <div className="p-3 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs no-print">
              <span className="text-stone-600 font-medium">Elige la opción que prefieras para imprimir o guardar:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a2958] hover:bg-[#103874] text-white font-medium shadow-2xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Directo (Ctrl+P)
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-2xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir en Pestaña Nueva
                </button>
                <button
                  type="button"
                  onClick={handleDownloadHTML}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar Reporte HTML
                </button>
                <button
                  type="button"
                  onClick={handleCopyTSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar Tabla'}
                </button>
              </div>
            </div>

            {/* Printable Report Document Body */}
            <div className="p-6 overflow-y-auto grow bg-stone-50/50" id="printable-area">
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs max-w-4xl mx-auto space-y-4">
                
                {/* Header Documento */}
                <div className="border-b border-stone-200 pb-3 flex justify-between items-end">
                  <div>
                    <h1 className="text-xl font-serif font-bold text-[#0a2958]">
                      Consolidado de Priorización de Acompañamiento
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                      Reporte Oficial de Frecuencia de Acompañamientos Formador / Supervisores
                    </p>
                  </div>
                  <div className="text-right text-xs text-stone-600 font-mono">
                    <p><strong>Semana:</strong> {semanaSeleccionada || 'Todas'}</p>
                    <p><strong>Fecha Impresión:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                  </div>
                </div>

                {/* Printable Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-stone-100 text-stone-800 font-semibold border-b border-stone-300">
                        <th className="p-2 border border-stone-300">Semana</th>
                        <th className="p-2 border border-stone-300">Código</th>
                        <th className="p-2 border border-stone-300">Nombre</th>
                        <th className="p-2 border border-stone-300">Labor</th>
                        <th className="p-2 border border-stone-300">Rend / Meta</th>
                        <th className="p-2 border border-stone-300">% CALIDAD</th>
                        <th className="p-2 border border-stone-300">Res. Rend</th>
                        <th className="p-2 border border-stone-300">Res. Calidad</th>
                        <th className="p-2 border border-stone-300">Prioridad</th>
                        <th className="p-2 border border-stone-300 text-center">#AF/Día</th>
                        <th className="p-2 border border-stone-300 text-center">Sup. Ruta</th>
                        <th className="p-2 border border-stone-300 text-center">Sup. Proc</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((d, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                          <td className="p-2 border border-stone-200">{d.semana}</td>
                          <td className="p-2 border border-stone-200 font-mono">{d.codigo}</td>
                          <td className="p-2 border border-stone-200 font-medium text-stone-900">{d.nombre}</td>
                          <td className="p-2 border border-stone-200">{d.labor}</td>
                          <td className="p-2 border border-stone-200 font-mono">{d.rendimiento} / {d.metaRendimiento}</td>
                          <td className={`p-2 border border-stone-200 font-mono ${d.porcentajeProceso !== undefined && d.porcentajeProceso < 85 ? 'text-rose-600 font-bold' : 'font-semibold'}`}>
                            {d.porcentajeProceso !== undefined && !isNaN(d.porcentajeProceso) ? `${d.porcentajeProceso.toFixed(1)}%` : '-'}
                          </td>
                          <td className="p-2 border border-stone-200">{d.resultadoRendimiento}</td>
                          <td className="p-2 border border-stone-200">{d.resultadoCalidad}</td>
                          <td className={`p-2 border border-stone-200 font-bold ${
                            d.nivelPrioridad === 'Alta' ? 'text-rose-600' : d.nivelPrioridad === 'Media' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {d.nivelPrioridad}
                          </td>
                          <td className="p-2 border border-stone-200 text-center font-bold font-mono">{d.afDiaFormador}</td>
                          <td className="p-2 border border-stone-200 text-center font-bold font-mono">{d.acompSemSupRuta}</td>
                          <td className="p-2 border border-stone-200 text-center font-bold font-mono">{d.acompSemSupProceso}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 text-[10px] text-stone-400 flex justify-between items-center border-t border-stone-100">
                  <span>Total Registros: {sortedData.length}</span>
                  <span>Sistema de Gestión de Acompañamiento Operativo</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end shrink-0 no-print">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
