import React, { useState, useRef, useEffect } from 'react';
import { Layers, ChevronDown, Check, X, Search } from 'lucide-react';

interface ProcesoMultiSelectProps {
  procesosDisponibles: string[];
  procesosSeleccionados: string[];
  onChange: (selected: string[]) => void;
  darkTheme?: boolean;
}

export const ProcesoMultiSelect: React.FC<ProcesoMultiSelectProps> = ({
  procesosDisponibles,
  procesosSeleccionados,
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
    procesosDisponibles.length > 0 &&
    procesosSeleccionados.length === procesosDisponibles.length;

  const isNoneSelected = procesosSeleccionados.length === 0;

  const toggleProceso = (proceso: string) => {
    if (procesosSeleccionados.includes(proceso)) {
      onChange(procesosSeleccionados.filter((p) => p !== proceso));
    } else {
      onChange([...procesosSeleccionados, proceso]);
    }
  };

  const handleSelectAll = () => {
    onChange([...procesosDisponibles]);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const filteredProcesos = procesosDisponibles.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  // Trigger label formatting
  let labelText = `Todos los procesos (${procesosDisponibles.length})`;
  if (isNoneSelected) {
    labelText = 'Ningún proceso seleccionado';
  } else if (!isAllSelected) {
    if (procesosSeleccionados.length === 1) {
      labelText = procesosSeleccionados[0];
    } else {
      labelText = `${procesosSeleccionados.length} procesos seleccionados`;
    }
  } else {
    labelText = 'Todos los procesos';
  }

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer shadow-2xs ${
          darkTheme
            ? 'bg-[#0e336b] hover:bg-[#123e80] text-white border-blue-800'
            : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 focus:ring-2 focus:ring-[#0a2958]/20'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Layers className={`w-3.5 h-3.5 shrink-0 ${darkTheme ? 'text-blue-200' : 'text-[#0a2958]'}`} />
          <span className="truncate">{labelText}</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {!isAllSelected && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              title="Restablecer todos"
              className={`p-0.5 rounded-full hover:bg-black/10 cursor-pointer ${
                darkTheme ? 'text-blue-200' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${darkTheme ? 'text-blue-200' : 'text-stone-400'}`} />
        </div>
      </button>

      {/* Popover Dropdown matching the screenshot exactly */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 w-72 max-w-sm rounded-xl shadow-xl border p-3 z-[100] text-xs ${
            darkTheme
              ? 'bg-[#0a2958] border-blue-800 text-white'
              : 'bg-white border-stone-200/90 text-stone-800'
          }`}
        >
          {/* Search bar inside dropdown */}
          <div className="relative mb-2.5">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${darkTheme ? 'text-blue-300' : 'text-stone-400'}`} />
            <input
              type="text"
              placeholder="Buscar proceso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className={`w-full pl-9 pr-7 py-2 rounded-lg text-xs border focus:outline-none transition-all ${
                darkTheme
                  ? 'bg-[#0e336b] border-blue-700 text-white placeholder-blue-300 focus:border-blue-400'
                  : 'bg-stone-50/80 border-stone-200 text-stone-800 placeholder-stone-400 focus:bg-white focus:border-[#0a2958] focus:ring-1 focus:ring-[#0a2958]'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Action buttons: Seleccionar todos / Desmarcar todos */}
          <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-stone-100 text-[11.5px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`font-semibold cursor-pointer hover:underline ${
                darkTheme ? 'text-blue-200' : 'text-[#0a2958]'
              }`}
            >
              Seleccionar todos
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-rose-600 font-semibold hover:underline cursor-pointer"
            >
              Desmarcar todos
            </button>
          </div>

          {/* List of Processes with checkboxes matching the image */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
            {filteredProcesos.length === 0 ? (
              <div className="py-4 text-stone-400 text-center italic text-xs">
                No se encontraron procesos
              </div>
            ) : (
              filteredProcesos.map((proceso) => {
                const isChecked = procesosSeleccionados.includes(proceso);
                return (
                  <div
                    key={proceso}
                    onClick={() => toggleProceso(proceso)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      darkTheme
                        ? 'hover:bg-[#144287]'
                        : isChecked
                        ? 'hover:bg-stone-50'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all shrink-0 ${
                        isChecked
                          ? darkTheme
                            ? 'bg-blue-500 border-blue-400 text-white'
                            : 'bg-[#0a2958] border-[#0a2958] text-white shadow-2xs'
                          : darkTheme
                          ? 'border-blue-700 bg-[#0e336b]'
                          : 'border-stone-300 bg-white hover:border-stone-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`truncate text-xs ${isChecked ? 'font-medium text-stone-900' : 'text-stone-700'}`}>
                      {proceso}
                    </span>
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
