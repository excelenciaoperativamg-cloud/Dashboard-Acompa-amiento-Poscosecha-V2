import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, ChevronDown, Check, X, Search } from 'lucide-react';

interface LaborMultiSelectProps {
  laboresDisponibles: string[];
  laboresSeleccionadas: string[];
  onChange: (selected: string[]) => void;
  darkTheme?: boolean;
}

export const LaborMultiSelect: React.FC<LaborMultiSelectProps> = ({
  laboresDisponibles,
  laboresSeleccionadas,
  onChange,
  darkTheme = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected =
    laboresDisponibles.length > 0 &&
    laboresSeleccionadas.length === laboresDisponibles.length;

  const isNoneSelected = laboresSeleccionadas.length === 0;

  const toggleLabor = (labor: string) => {
    if (laboresSeleccionadas.includes(labor)) {
      onChange(laboresSeleccionadas.filter((l) => l !== labor));
    } else {
      onChange([...laboresSeleccionadas, labor]);
    }
  };

  const handleSelectAll = () => {
    onChange([...laboresDisponibles]);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const filteredLabores = laboresDisponibles.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  // Trigger label formatting
  let labelText = 'Todas las labores';
  if (isNoneSelected) {
    labelText = 'Ninguna labor seleccionada';
  } else if (!isAllSelected) {
    if (laboresSeleccionadas.length === 1) {
      labelText = laboresSeleccionadas[0];
    } else {
      labelText = `${laboresSeleccionadas.length} labores seleccionadas`;
    }
  }

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
          darkTheme
            ? 'bg-[#0e336b] hover:bg-[#123e80] text-white border-blue-800'
            : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <Briefcase className={`w-3.5 h-3.5 shrink-0 ${darkTheme ? 'text-blue-200' : 'text-stone-400'}`} />
          <span className="truncate">{labelText}</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {!isAllSelected && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              title="Restablecer todas"
              className={`p-0.5 rounded-full hover:bg-black/10 cursor-pointer ${
                darkTheme ? 'text-blue-200' : 'text-stone-500'
              }`}
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 ${darkTheme ? 'text-blue-200' : 'text-stone-400'}`} />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1 w-64 max-w-xs rounded-xl shadow-lg border p-2 z-50 text-xs ${
            darkTheme
              ? 'bg-[#0a2958] border-blue-800 text-white'
              : 'bg-white border-stone-200 text-stone-800'
          }`}
        >
          {/* Search bar inside dropdown if > 5 labors */}
          {laboresDisponibles.length > 5 && (
            <div className="relative mb-2">
              <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${darkTheme ? 'text-blue-300' : 'text-stone-400'}`} />
              <input
                type="text"
                placeholder="Buscar labor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-8 pr-2 py-1.5 rounded-md text-xs border focus:outline-none ${
                  darkTheme
                    ? 'bg-[#0e336b] border-blue-700 text-white placeholder-blue-300'
                    : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                }`}
              />
            </div>
          )}

          {/* Action buttons: Seleccionar todas / Desmarcar todas */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200/20 text-[11px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`font-medium hover:underline ${
                isAllSelected
                  ? darkTheme ? 'text-blue-200 font-bold' : 'text-[#0a2958] font-bold'
                  : darkTheme ? 'text-blue-300' : 'text-stone-600'
              }`}
            >
              Seleccionar todas
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-rose-500 hover:underline font-medium"
            >
              Desmarcar todas
            </button>
          </div>

          {/* List of Labors */}
          <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
            {filteredLabores.length === 0 ? (
              <div className="p-2 text-stone-400 text-center italic">No se encontraron labores</div>
            ) : (
              filteredLabores.map((labor) => {
                const isChecked = laboresSeleccionadas.includes(labor);
                return (
                  <div
                    key={labor}
                    onClick={() => toggleLabor(labor)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      darkTheme
                        ? 'hover:bg-[#144287]'
                        : 'hover:bg-stone-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isChecked
                          ? darkTheme
                            ? 'bg-blue-500 border-blue-400 text-white'
                            : 'bg-[#0a2958] border-[#0a2958] text-white'
                          : darkTheme
                          ? 'border-blue-700 bg-[#0e336b]'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{labor}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
