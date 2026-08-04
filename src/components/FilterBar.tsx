import React from 'react';
import { Search, Filter, Calendar, Grid, Table as TableIcon, Briefcase, IdCard, Building2, UserCheck } from 'lucide-react';
import { LaborMultiSelect } from './LaborMultiSelect';
import { PersonaMatricula } from '../types';

interface FilterBarProps {
  semanasDisponibles: string[];
  semanaSeleccionada: string;
  onSelectSemana: (sem: string) => void;
  
  laboresDisponibles: string[];
  laboresSeleccionadas: string[];
  onSelectLabores: (labores: string[]) => void;

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
  
  activeTab: 'tabla' | 'matriz' | 'bajos_indicadores';
  onTabChange: (tab: 'tabla' | 'matriz' | 'bajos_indicadores') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  semanasDisponibles,
  semanaSeleccionada,
  onSelectSemana,
  laboresDisponibles,
  laboresSeleccionadas,
  onSelectLabores,
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
  return (
    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs mb-6 space-y-4">
      
      {/* Top row: Tab switchers */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="tab-consolidado-priorizado"
            onClick={() => onTabChange('tabla')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'tabla'
                ? 'bg-[#0a2958] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            Tabla Consolidada
          </button>

          <button
            id="tab-gestion-bajos-indicadores"
            onClick={() => onTabChange('bajos_indicadores')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'bajos_indicadores'
                ? 'bg-[#0a2958] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Gestión Bajos Indicadores
          </button>

          <button
            id="tab-matriz-decision"
            onClick={() => onTabChange('matriz')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'matriz'
                ? 'bg-[#0a2958] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            Matriz de Decisión AF/Sup
          </button>
        </div>
      </div>

      {/* Bottom row: Filters for Week, Labor, Matrículas, Area, Rating, Search */}
      {activeTab === 'tabla' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* Selector de Semana */}
        <div className="space-y-1">
          <label htmlFor="filter-semana-select" className="block text-xs font-medium text-stone-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            Filtrar por Semana:
          </label>
          <select
            id="filter-semana-select"
            value={semanaSeleccionada}
            onChange={(e) => onSelectSemana(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#7C816F] focus:outline-none"
          >
            <option value="TODAS">Todas las semanas</option>
            {semanasDisponibles.map((sem) => (
              <option key={sem} value={sem}>
                Semana {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Labores (Múltiple) */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-stone-600 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-stone-400" />
            Filtrar por Labores:
          </label>
          <LaborMultiSelect
            laboresDisponibles={laboresDisponibles}
            laboresSeleccionadas={laboresSeleccionadas}
            onChange={onSelectLabores}
          />
        </div>

        {/* Selector de Matrícula / Operario */}
        <div className="space-y-1">
          <label htmlFor="filter-matricula-select" className="block text-xs font-medium text-stone-600 flex items-center gap-1.5">
            <IdCard className="w-3.5 h-3.5 text-stone-400" />
            Filtrar por Matrícula:
          </label>
          <select
            id="filter-matricula-select"
            value={matriculaSeleccionada}
            onChange={(e) => onSelectMatricula(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#7C816F] focus:outline-none"
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
          <label htmlFor="filter-area-select" className="block text-xs font-medium text-stone-600 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-stone-400" />
            Área (Matrículas):
          </label>
          <select
            id="filter-area-select"
            value={areaMatriculaSeleccionada}
            onChange={(e) => onSelectAreaMatricula(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#7C816F] focus:outline-none"
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
          <label htmlFor="filter-estado-select" className="block text-xs font-medium text-stone-600 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            Filtrar por Estado:
          </label>
          <select
            id="filter-estado-select"
            value={estadoFiltro}
            onChange={(e) => onSelectEstado(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-[#7C816F] focus:outline-none"
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
          <label htmlFor="filter-search-input" className="block text-xs font-medium text-stone-600 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-stone-400" />
            Buscar Operario o Labor:
          </label>
          <div className="relative">
            <input
              id="filter-search-input"
              type="text"
              placeholder="Nombre, código o labor..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#7C816F] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
