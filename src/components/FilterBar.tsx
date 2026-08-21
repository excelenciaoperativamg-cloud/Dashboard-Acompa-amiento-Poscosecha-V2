import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Grid,
  Table as TableIcon,
  Briefcase,
  IdCard,
  Building2,
  UserCheck,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Layers
} from 'lucide-react';
import { LaborMultiSelect } from './LaborMultiSelect';
import { ProcesoMultiSelect } from './ProcesoMultiSelect';
import { PersonaMatricula } from '../types';

interface FilterBarProps {
  semanasDisponibles: string[];
  semanaSeleccionada: string;
  onSelectSemana: (sem: string) => void;
  
  laboresDisponibles: string[];
  laboresSeleccionadas: string[];
  onSelectLabores: (labores: string[]) => void;

  procesosDisponibles?: string[];
  procesosSeleccionados?: string[];
  onSelectProcesos?: (procesos: string[]) => void;

  matriculaSeleccionada: string;
  onSelectMatricula: (mat: string) => void;
  matriculasDisponibles: PersonaMatricula[];

  areaMatriculaSeleccionada: string;
  onSelectAreaMatricula: (area: string) => void;
  areasMatriculaDisponibles: string[];

  estadoFiltro: string;
  onSelectEstado: (estado: string) => void;
  
  searchQuery: string;
  onSearchChange: (q: string) => void;
  
  activeTab: 'tabla' | 'matriz' | 'bajos_indicadores' | 'curva_aprendizaje';
  onTabChange: (tab: 'tabla' | 'matriz' | 'bajos_indicadores' | 'curva_aprendizaje') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  semanasDisponibles,
  semanaSeleccionada,
  onSelectSemana,
  laboresDisponibles,
  laboresSeleccionadas,
  onSelectLabores,
  procesosDisponibles = [],
  procesosSeleccionados = [],
  onSelectProcesos,
  matriculaSeleccionada,
  onSelectMatricula,
  matriculasDisponibles,
  areaMatriculaSeleccionada,
  onSelectAreaMatricula,
  areasMatriculaDisponibles,
  estadoFiltro,
  onSelectEstado,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange
}) => {
  // Collapsed by default so on mobile it looks compressed like in the screenshot
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // Active filters count calculation
  const isLaborFiltered =
    laboresSeleccionadas.length > 0 &&
    laboresSeleccionadas.length < laboresDisponibles.length;

  const isProcesoFiltered =
    procesosDisponibles.length > 0 &&
    procesosSeleccionados.length > 0 &&
    procesosSeleccionados.length < procesosDisponibles.length;

  const activeFiltersCount = [
    semanaSeleccionada !== 'TODAS',
    isLaborFiltered,
    isProcesoFiltered,
    matriculaSeleccionada !== 'TODAS',
    areaMatriculaSeleccionada !== 'TODAS',
    estadoFiltro !== 'TODOS',
    searchQuery.trim() !== ''
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    onSelectSemana('TODAS');
    onSelectLabores([...laboresDisponibles]);
    if (onSelectProcesos) {
      onSelectProcesos([...procesosDisponibles]);
    }
    onSelectMatricula('TODAS');
    onSelectAreaMatricula('TODAS');
    onSelectEstado('TODOS');
    onSearchChange('');
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Top row: Tab switchers */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          id="tab-consolidado-priorizado"
          onClick={() => onTabChange('tabla')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'tabla'
              ? 'bg-[#0a2958] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          Tabla Consolidada
        </button>

        <button
          id="tab-gestion-bajos-indicadores"
          onClick={() => onTabChange('bajos_indicadores')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'bajos_indicadores'
              ? 'bg-[#0a2958] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Gestión Bajos Indicadores
        </button>

        <button
          id="tab-curva-aprendizaje"
          onClick={() => onTabChange('curva_aprendizaje')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'curva_aprendizaje'
              ? 'bg-[#0a2958] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Curva de Aprendizaje
        </button>

        <button
          id="tab-matriz-decision"
          onClick={() => onTabChange('matriz')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'matriz'
              ? 'bg-[#0a2958] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
          }`}
        >
          <Grid className="w-4 h-4" />
          Matriz de Decisión AF/Sup
        </button>
      </div>

      {/* Segment Filters Container (White background with dark blue top border) - Only visible on 'tabla' tab */}
      {activeTab === 'tabla' && (
        <div className="bg-white rounded-xl shadow-xs border border-stone-200 border-t-4 border-t-[#0a2958] overflow-visible relative z-30 transition-all">
          {/* Banner Header */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#0a2958]/10 rounded-lg text-[#0a2958] border border-[#0a2958]/20">
                <Filter className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-[#0a2958] font-sans">
                  Filtros de Segmentación
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#0a2958]/10 text-[#0a2958] border border-[#0a2958]/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && !isCollapsed && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-stone-500" />
                  Limpiar
                </button>
              )}

              <button
                id="btn-toggle-filtros"
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0a2958] hover:bg-[#071d3f] active:bg-[#051329] text-white border border-[#0a2958] rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                <span>{isCollapsed ? 'Ver filtros' : 'Ocultar filtros'}</span>
                {isCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filter Body */}
          {!isCollapsed && (
            <div className="p-3.5 sm:p-4 pt-0 border-t border-stone-100 bg-white space-y-4 overflow-visible">
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
                {/* Selector de Labores (Múltiple) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#0a2958]" />
                    Labor:
                  </label>
                  <LaborMultiSelect
                    laboresDisponibles={laboresDisponibles}
                    laboresSeleccionadas={laboresSeleccionadas}
                    onChange={onSelectLabores}
                    darkTheme={false}
                  />
                </div>

                {/* Selector de Proceso (Múltiple) */}
                {onSelectProcesos && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#0a2958]" />
                      Proceso:
                    </label>
                    <ProcesoMultiSelect
                      procesosDisponibles={procesosDisponibles}
                      procesosSeleccionados={procesosSeleccionados}
                      onChange={onSelectProcesos}
                      darkTheme={false}
                    />
                  </div>
                )}

                {/* Selector de Semana */}
                <div className="space-y-1">
                  <label htmlFor="filter-semana-select" className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0a2958]" />
                    Semana:
                  </label>
                  <select
                    id="filter-semana-select"
                    value={semanaSeleccionada}
                    onChange={(e) => onSelectSemana(e.target.value)}
                    className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#0a2958]/30 focus:border-[#0a2958] focus:outline-none shadow-2xs"
                  >
                    <option value="TODAS">Todas las semanas</option>
                    {semanasDisponibles.map((sem) => (
                      <option key={sem} value={sem}>
                        Semana {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Matrícula / Operario */}
                <div className="space-y-1">
                  <label htmlFor="filter-matricula-select" className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-[#0a2958]" />
                    Matrícula:
                  </label>
                  <select
                    id="filter-matricula-select"
                    value={matriculaSeleccionada}
                    onChange={(e) => onSelectMatricula(e.target.value)}
                    className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#0a2958]/30 focus:border-[#0a2958] focus:outline-none shadow-2xs"
                  >
                    <option value="TODAS">Todas las matrículas</option>
                    <optgroup label="Estado Registro">
                      <option value="CON_MATRICULA">Con Matrícula Registrada</option>
                      <option value="SIN_MATRICULA">Sin Matrícula Registrada</option>
                    </optgroup>
                    {matriculasDisponibles.length > 0 && (
                      <optgroup label="Operarios Registrados">
                        {matriculasDisponibles.map((m) => (
                          <option key={m.codigo} value={m.codigo}>
                            {m.codigo} - {m.nombre}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Selector de Área (Matrícula) */}
                <div className="space-y-1">
                  <label htmlFor="filter-area-select" className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0a2958]" />
                    Área:
                  </label>
                  <select
                    id="filter-area-select"
                    value={areaMatriculaSeleccionada}
                    onChange={(e) => onSelectAreaMatricula(e.target.value)}
                    className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#0a2958]/30 focus:border-[#0a2958] focus:outline-none shadow-2xs"
                  >
                    <option value="TODAS">Todas las áreas</option>
                    {areasMatriculaDisponibles.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Estado */}
                <div className="space-y-1">
                  <label htmlFor="filter-estado-select" className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#0a2958]" />
                    Estado:
                  </label>
                  <select
                    id="filter-estado-select"
                    value={estadoFiltro}
                    onChange={(e) => onSelectEstado(e.target.value)}
                    className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#0a2958]/30 focus:border-[#0a2958] focus:outline-none shadow-2xs"
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="En observación">En observación (Alta)</option>
                    <option value="En desarrollo">En desarrollo (Media)</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Sobresaliente">Sobresaliente</option>
                  </select>
                </div>

                {/* Búsqueda por texto */}
                <div className="space-y-1">
                  <label htmlFor="filter-search-input" className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-[#0a2958]" />
                    Búsqueda:
                  </label>
                  <div className="relative">
                    <input
                      id="filter-search-input"
                      type="text"
                      placeholder="Nombre, código..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#0a2958]/30 focus:border-[#0a2958] focus:outline-none shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Clear Button */}
              {activeFiltersCount > 0 && (
                <div className="pt-2 flex justify-end sm:hidden">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

