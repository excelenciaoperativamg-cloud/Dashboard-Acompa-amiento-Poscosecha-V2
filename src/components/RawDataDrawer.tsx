import React, { useState, useMemo } from 'react';
import { EvaluacionRendimiento, EvaluacionCalidad, PersonaMatricula } from '../types';
import { evaluarRendimiento, evaluarCalidad } from '../utils/calculations';
import { FileSpreadsheet, User, Award, Percent, Filter } from 'lucide-react';

interface RawDataDrawerProps {
  rendimientoRaw: EvaluacionRendimiento[];
  consolidadoRaw: EvaluacionCalidad[];
  matriculasRaw: PersonaMatricula[];
  semanaSeleccionada?: string;
  laboresSeleccionadas?: string[];
  laboresDisponibles?: string[];
  estadoFiltro?: string;
  searchQuery?: string;
}

export const RawDataDrawer: React.FC<RawDataDrawerProps> = ({
  rendimientoRaw,
  consolidadoRaw,
  matriculasRaw,
  semanaSeleccionada,
  laboresSeleccionadas,
  laboresDisponibles,
  estadoFiltro,
  searchQuery
}) => {
  const [subTab, setSubTab] = useState<'rendimiento' | 'consolidado' | 'matriculas'>('rendimiento');
  const [applyGlobalFilters, setApplyGlobalFilters] = useState<boolean>(true);

  // Check if any filter is active
  const isAnyFilterActive = useMemo(() => {
    return (
      (semanaSeleccionada && semanaSeleccionada !== 'TODAS') ||
      (estadoFiltro && estadoFiltro !== 'TODOS') ||
      (laboresSeleccionadas && laboresDisponibles && laboresSeleccionadas.length < laboresDisponibles.length) ||
      (searchQuery && searchQuery.trim() !== '')
    );
  }, [semanaSeleccionada, estadoFiltro, laboresSeleccionadas, laboresDisponibles, searchQuery]);

  // Filtered Rendimiento
  const filteredRendimiento = useMemo(() => {
    if (!applyGlobalFilters) return rendimientoRaw;

    return rendimientoRaw.filter((r) => {
      // 1. Semana
      if (semanaSeleccionada && semanaSeleccionada !== 'TODAS') {
        if (r.semana !== semanaSeleccionada) return false;
      }

      // 2. Labor
      if (
        laboresSeleccionadas &&
        laboresDisponibles &&
        laboresSeleccionadas.length < laboresDisponibles.length
      ) {
        if (!r.labor || !laboresSeleccionadas.includes(r.labor.trim())) {
          return false;
        }
      }

      // 3. Estado
      if (estadoFiltro && estadoFiltro !== 'TODOS') {
        const resRend = r.resultadoRendimiento || evaluarRendimiento(r.rendimiento, r.meta, r.minimo, r.observacion);
        if (resRend !== estadoFiltro) {
          return false;
        }
      }

      // 4. Búsqueda
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchNombre = (r.nombre || '').toLowerCase().includes(q);
        const matchCodigo = (r.codigo || '').toLowerCase().includes(q);
        const matchLabor = (r.labor || '').toLowerCase().includes(q);
        if (!matchNombre && !matchCodigo && !matchLabor) return false;
      }

      return true;
    });
  }, [
    rendimientoRaw,
    applyGlobalFilters,
    semanaSeleccionada,
    laboresSeleccionadas,
    laboresDisponibles,
    estadoFiltro,
    searchQuery
  ]);

  // Filtered Consolidado
  const filteredConsolidado = useMemo(() => {
    if (!applyGlobalFilters) return consolidadoRaw;

    return consolidadoRaw.filter((c) => {
      // 1. Semana
      if (semanaSeleccionada && semanaSeleccionada !== 'TODAS') {
        if (c.semana !== semanaSeleccionada) return false;
      }

      // 2. Labor
      if (
        laboresSeleccionadas &&
        laboresDisponibles &&
        laboresSeleccionadas.length < laboresDisponibles.length
      ) {
        if (!c.labor || !laboresSeleccionadas.includes(c.labor.trim())) {
          return false;
        }
      }

      // 3. Estado
      if (estadoFiltro && estadoFiltro !== 'TODOS') {
        const valCalidad = c.porcentajeCalidad ?? c.porcentajeProceso ?? 0;
        const resCal = c.resultadoCalidad || evaluarCalidad(valCalidad);
        if (resCal !== estadoFiltro) {
          return false;
        }
      }

      // 4. Búsqueda
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchNombre = (c.nombre || '').toLowerCase().includes(q);
        const matchCodigo = (c.codigo || '').toLowerCase().includes(q);
        const matchLabor = (c.labor || '').toLowerCase().includes(q);
        if (!matchNombre && !matchCodigo && !matchLabor) return false;
      }

      return true;
    });
  }, [
    consolidadoRaw,
    applyGlobalFilters,
    semanaSeleccionada,
    laboresSeleccionadas,
    laboresDisponibles,
    estadoFiltro,
    searchQuery
  ]);

  // Filtered Matriculas
  const filteredMatriculas = useMemo(() => {
    if (!applyGlobalFilters) return matriculasRaw;

    // Active operator codes from filtered Rendimiento & Consolidado
    const activeCodigos = new Set<string>();
    filteredRendimiento.forEach((r) => r.codigo && activeCodigos.add(r.codigo.trim()));
    filteredConsolidado.forEach((c) => c.codigo && activeCodigos.add(c.codigo.trim()));

    return matriculasRaw.filter((m) => {
      const q = searchQuery ? searchQuery.toLowerCase().trim() : '';

      if (isAnyFilterActive && activeCodigos.size > 0) {
        if (!activeCodigos.has(m.codigo.trim())) {
          return false;
        }
      }

      if (q !== '') {
        const matchNombre = (m.nombre || '').toLowerCase().includes(q);
        const matchCodigo = (m.codigo || '').toLowerCase().includes(q);
        const matchCargo = (m.cargo || '').toLowerCase().includes(q);
        const matchArea = (m.area || '').toLowerCase().includes(q);
        if (!matchNombre && !matchCodigo && !matchCargo && !matchArea) return false;
      }

      return true;
    });
  }, [
    matriculasRaw,
    filteredRendimiento,
    filteredConsolidado,
    applyGlobalFilters,
    isAnyFilterActive,
    searchQuery
  ]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 mb-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-lg font-serif font-medium text-stone-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0a2958]" />
            Inspección de Hojas de Google Sheets
          </h2>
          <p className="text-xs text-stone-500">
            Visualización de las pestañas fuente cargadas con los filtros globales aplicados.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSubTab('rendimiento')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'rendimiento'
                ? 'bg-[#0a2958] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Hoja Rendimiento ({filteredRendimiento.length}
            {applyGlobalFilters && isAnyFilterActive && filteredRendimiento.length !== rendimientoRaw.length ? ` / ${rendimientoRaw.length}` : ''})
          </button>

          <button
            onClick={() => setSubTab('consolidado')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'consolidado'
                ? 'bg-[#0a2958] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Hoja Consolidado ({filteredConsolidado.length}
            {applyGlobalFilters && isAnyFilterActive && filteredConsolidado.length !== consolidadoRaw.length ? ` / ${consolidadoRaw.length}` : ''})
          </button>

          <button
            onClick={() => setSubTab('matriculas')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subTab === 'matriculas'
                ? 'bg-[#0a2958] text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Hoja Matrículas ({filteredMatriculas.length}
            {applyGlobalFilters && isAnyFilterActive && filteredMatriculas.length !== matriculasRaw.length ? ` / ${matriculasRaw.length}` : ''})
          </button>
        </div>
      </div>

      {/* Active Filters Bar */}
      {isAnyFilterActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs mb-4">
          <div className="flex items-center gap-2 flex-wrap text-stone-700">
            <Filter className="w-3.5 h-3.5 text-[#0a2958]" />
            <span className="font-semibold text-stone-900">Filtros aplicados:</span>
            {semanaSeleccionada && semanaSeleccionada !== 'TODAS' && (
              <span className="bg-stone-200/80 text-stone-800 px-2 py-0.5 rounded font-mono text-[11px]">
                Semana: {semanaSeleccionada}
              </span>
            )}
            {laboresSeleccionadas && laboresDisponibles && laboresSeleccionadas.length < laboresDisponibles.length && (
              <span className="bg-stone-200/80 text-stone-800 px-2 py-0.5 rounded text-[11px]">
                Labores: ({laboresSeleccionadas.length}/{laboresDisponibles.length})
              </span>
            )}
            {estadoFiltro && estadoFiltro !== 'TODOS' && (
              <span className="bg-stone-200/80 text-stone-800 px-2 py-0.5 rounded text-[11px]">
                Estado: {estadoFiltro}
              </span>
            )}
            {searchQuery && searchQuery.trim() !== '' && (
              <span className="bg-stone-200/80 text-stone-800 px-2 py-0.5 rounded text-[11px]">
                Búsqueda: "{searchQuery}"
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setApplyGlobalFilters(!applyGlobalFilters)}
            className="text-xs text-[#0a2958] font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            {applyGlobalFilters ? 'Ver todo sin filtrar' : 'Aplicar filtros globales'}
          </button>
        </div>
      )}

      {/* Subtab Rendimiento */}
      {subTab === 'rendimiento' && (
        <div className="overflow-x-auto">
          {filteredRendimiento.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              No se encontraron registros de Rendimiento con los filtros seleccionados.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-serif font-medium">
                  <th className="p-2 border border-stone-200">Año</th>
                  <th className="p-2 border border-stone-200">Semana</th>
                  <th className="p-2 border border-stone-200">Código / Matrícula</th>
                  <th className="p-2 border border-stone-200">Nombre</th>
                  <th className="p-2 border border-stone-200">Labor</th>
                  <th className="p-2 border border-stone-200">Rendimiento</th>
                  <th className="p-2 border border-stone-200">Rend. Meta</th>
                  <th className="p-2 border border-stone-200">Rend. Mínimo</th>
                  <th className="p-2 border border-stone-200">Rend. Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredRendimiento.map((r, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="p-2 font-mono border border-stone-200">{r.ano}</td>
                    <td className="p-2 font-mono border border-stone-200">{r.semana}</td>
                    <td className="p-2 font-mono border border-stone-200 font-semibold">{r.codigo}</td>
                    <td className="p-2 border border-stone-200 font-medium text-stone-900">{r.nombre}</td>
                    <td className="p-2 border border-stone-200">{r.labor}</td>
                    <td className="p-2 font-mono font-bold border border-stone-200 text-stone-800">{r.rendimiento}</td>
                    <td className="p-2 font-mono border border-stone-200 text-stone-500">{r.meta}</td>
                    <td className="p-2 font-mono border border-stone-200 text-amber-700">{r.minimo}</td>
                    <td className="p-2 font-mono border border-stone-200 text-rose-700">{r.observacion ?? Math.round(r.minimo * 0.9)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Subtab Consolidado (% CALIDAD) */}
      {subTab === 'consolidado' && (
        <div className="overflow-x-auto">
          {filteredConsolidado.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              No se encontraron registros de Consolidado con los filtros seleccionados.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-serif font-medium">
                  <th className="p-2 border border-stone-200">Año</th>
                  <th className="p-2 border border-stone-200">Semana</th>
                  <th className="p-2 border border-stone-200">Código / Matrícula</th>
                  <th className="p-2 border border-stone-200">Nombre</th>
                  <th className="p-2 border border-stone-200">Labor</th>
                  <th className="p-2 border border-stone-200">% CALIDAD</th>
                  <th className="p-2 border border-stone-200">% Proceso</th>
                  <th className="p-2 border border-stone-200">% Producto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredConsolidado.map((c, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="p-2 font-mono border border-stone-200">{c.ano}</td>
                    <td className="p-2 font-mono border border-stone-200">{c.semana}</td>
                    <td className="p-2 font-mono border border-stone-200 font-semibold">{c.codigo}</td>
                    <td className="p-2 border border-stone-200 font-medium text-stone-900">{c.nombre}</td>
                    <td className="p-2 border border-stone-200">{c.labor}</td>
                    <td className={`p-2 font-mono border border-stone-200 ${(c.porcentajeCalidad ?? c.porcentajeProceso) !== undefined && (c.porcentajeCalidad ?? c.porcentajeProceso ?? 100) < 85 ? 'text-rose-600 font-bold' : 'font-bold text-stone-800'}`}>
                      {(c.porcentajeCalidad ?? c.porcentajeProceso) !== undefined && !isNaN(c.porcentajeCalidad ?? c.porcentajeProceso!) ? `${c.porcentajeCalidad ?? c.porcentajeProceso}%` : '-'}
                    </td>
                    <td className="p-2 font-mono border border-stone-200 text-stone-600">
                      {(c.porcentajeProceso ?? c.porcentajeProcentaje) !== undefined ? `${c.porcentajeProceso ?? c.porcentajeProcentaje}%` : '-'}
                    </td>
                    <td className="p-2 font-mono border border-stone-200 text-stone-600">
                      {c.porcentajeProducto !== undefined ? `${c.porcentajeProducto}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Subtab Matrículas */}
      {subTab === 'matriculas' && (
        <div className="overflow-x-auto">
          {filteredMatriculas.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              No se encontraron operarios en Matrículas con los filtros seleccionados.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-serif font-medium">
                  <th className="p-2 border border-stone-200">Código / Matrícula</th>
                  <th className="p-2 border border-stone-200">Nombre Operario</th>
                  <th className="p-2 border border-stone-200">Cargo</th>
                  <th className="p-2 border border-stone-200">Área / Proceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredMatriculas.map((m, i) => (
                  <tr key={i} className="hover:bg-stone-50">
                    <td className="p-2 font-mono border border-stone-200 font-bold">{m.codigo}</td>
                    <td className="p-2 border border-stone-200 font-medium text-stone-900">{m.nombre}</td>
                    <td className="p-2 border border-stone-200">{m.cargo}</td>
                    <td className="p-2 border border-stone-200 text-stone-500">{m.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};
