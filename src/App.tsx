import { useState, useEffect, useMemo } from 'react';
import {
  ConsolidadoPriorizacion,
  SheetsDataResponse,
  EvaluacionRendimiento,
  EvaluacionCalidad,
  PersonaMatricula
} from './types';
import { consolidarPriorizacion } from './utils/calculations';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { FilterBar } from './components/FilterBar';
import { ConsolidadoTable } from './components/ConsolidadoTable';
import { DecisionMatrixSection } from './components/DecisionMatrixSection';
import { GestionBajosIndicadores } from './components/GestionBajosIndicadores';
import { MOCK_RENDIMIENTO, MOCK_CONSOLIDADO_CALIDAD, MOCK_MATRICULAS, MOCK_BAJOS_INDICADORES } from './data/mockData';
import { AlertTriangle, RefreshCw, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [spreadsheetId, setSpreadsheetId] = useState<string>(
    '1kDg5T5Nv9UqHPRDNw2tgLNrrqMIkcjb-_aIFnE5rDV4'
  );
  const [sheetsData, setSheetsData] = useState<SheetsDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Custom uploaded/overridden datasets
  const [customRendimiento, setCustomRendimiento] = useState<EvaluacionRendimiento[] | null>(null);
  const [customConsolidado, setCustomConsolidado] = useState<EvaluacionCalidad[] | null>(null);
  const [customMatriculas, setCustomMatriculas] = useState<PersonaMatricula[] | null>(null);

  // Filters & Tabs State
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>('2026-28');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');
  const [laboresSeleccionadas, setLaboresSeleccionadas] = useState<string[]>([]);
  const [laboresInicializadas, setLaboresInicializadas] = useState<boolean>(false);
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState<string>('TODAS');
  const [areaMatriculaSeleccionada, setAreaMatriculaSeleccionada] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tabla' | 'matriz' | 'bajos_indicadores'>('tabla');

  const fetchSheetsData = async (targetId: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/sheets/data?spreadsheetId=${encodeURIComponent(targetId)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: SheetsDataResponse = await res.json();
      setSheetsData(data);
      if (data.semanasDisponibles && data.semanasDisponibles.length > 0) {
        setSemanaSeleccionada(data.semanasDisponibles[0]);
      }
      setLaboresInicializadas(false);
    } catch (err) {
      console.error('Error al consultar /api/sheets/data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSheetsData(spreadsheetId);
  }, [spreadsheetId]);

  // Compute active datasets (server data overridden by custom uploads if any, with local mock fallback)
  const activeRendimientoRaw = useMemo(() => {
    if (customRendimiento && customRendimiento.length > 0) return customRendimiento;
    if (sheetsData?.rendimientoRaw && sheetsData.rendimientoRaw.length > 0) return sheetsData.rendimientoRaw;
    return MOCK_RENDIMIENTO;
  }, [customRendimiento, sheetsData]);

  const activeConsolidadoRaw = useMemo(() => {
    if (customConsolidado && customConsolidado.length > 0) return customConsolidado;
    if (sheetsData?.consolidadoRaw && sheetsData.consolidadoRaw.length > 0) return sheetsData.consolidadoRaw;
    return MOCK_CONSOLIDADO_CALIDAD;
  }, [customConsolidado, sheetsData]);

  const activeMatriculasRaw = useMemo(() => {
    if (customMatriculas && customMatriculas.length > 0) return customMatriculas;
    if (sheetsData?.matriculasRaw && sheetsData.matriculasRaw.length > 0) return sheetsData.matriculasRaw;
    return MOCK_MATRICULAS;
  }, [customMatriculas, sheetsData]);

  const activeBajosIndicadoresRaw = useMemo(() => {
    if (sheetsData?.bajosIndicadoresRaw && sheetsData.bajosIndicadoresRaw.length > 0) {
      return sheetsData.bajosIndicadoresRaw;
    }
    return MOCK_BAJOS_INDICADORES;
  }, [sheetsData]);

  // Consolidado priorizado resultante
  const consolidatedPrioritizedList = useMemo(() => {
    return consolidarPriorizacion(
      activeRendimientoRaw,
      activeConsolidadoRaw,
      activeMatriculasRaw
    );
  }, [activeRendimientoRaw, activeConsolidadoRaw, activeMatriculasRaw]);

  // Semanas disponibles únicas
  const semanasDisponibles = useMemo(() => {
    const setSem = new Set<string>();
    activeRendimientoRaw.forEach((r) => r.semana && setSem.add(r.semana));
    activeConsolidadoRaw.forEach((c) => c.semana && setSem.add(c.semana));
    const list = Array.from(setSem).sort().reverse();
    return list.length > 0 ? list : ['2026-28'];
  }, [activeRendimientoRaw, activeConsolidadoRaw]);

  // Labores disponibles únicas
  const laboresDisponibles = useMemo(() => {
    const setLab = new Set<string>();
    consolidatedPrioritizedList.forEach((item) => {
      if (item.labor && item.labor.trim() !== '') {
        setLab.add(item.labor.trim());
      }
    });
    return Array.from(setLab).sort();
  }, [consolidatedPrioritizedList]);

  // Áreas disponibles en la Tabla Matrículas
  const areasMatriculaDisponibles = useMemo(() => {
    const setAreas = new Set<string>();
    activeMatriculasRaw.forEach((m) => {
      if (m.area && m.area.trim() !== '') {
        setAreas.add(m.area.trim());
      }
    });
    return Array.from(setAreas).sort();
  }, [activeMatriculasRaw]);

  // Auto-inicializar laboresSeleccionadas con todas las labores disponibles cuando cambien o si está vacío
  useEffect(() => {
    if (laboresDisponibles.length > 0) {
      if (!laboresInicializadas || laboresSeleccionadas.length === 0) {
        setLaboresSeleccionadas(laboresDisponibles);
        setLaboresInicializadas(true);
      }
    }
  }, [laboresDisponibles, laboresInicializadas, laboresSeleccionadas.length]);

  // Filtrado final según Semana, Labor, Matrícula, Área de Matrícula, Estado y Búsqueda
  const filteredPrioritizationData = useMemo(() => {
    return consolidatedPrioritizedList.filter((item) => {
      // 1. Filtro por Semana
      if (semanaSeleccionada !== 'TODAS' && item.semana !== semanaSeleccionada) {
        return false;
      }

      // 2. Filtro por Labor (múltiple)
      if (laboresSeleccionadas.length > 0 && laboresSeleccionadas.length < laboresDisponibles.length) {
        if (!laboresSeleccionadas.includes(item.labor.trim())) {
          return false;
        }
      }

      // 3. Filtro por Matrícula
      if (matriculaSeleccionada !== 'TODAS') {
        if (matriculaSeleccionada === 'CON_MATRICULA') {
          if (!item.tieneMatricula) return false;
        } else if (matriculaSeleccionada === 'SIN_MATRICULA') {
          if (item.tieneMatricula) return false;
        } else {
          // Código de matrícula específico
          const codMatch = item.codigo === matriculaSeleccionada || item.matriculaInfo?.codigo === matriculaSeleccionada;
          if (!codMatch) return false;
        }
      }

      // 4. Filtro por Área de Matrícula
      if (areaMatriculaSeleccionada !== 'TODAS') {
        if (item.areaMatricula !== areaMatriculaSeleccionada) {
          return false;
        }
      }

      // 5. Filtro por Estado
      if (estadoFiltro !== 'TODOS') {
        if (
          item.resultadoRendimiento !== estadoFiltro &&
          item.resultadoCalidad !== estadoFiltro
        ) {
          return false;
        }
      }

      // 6. Filtro por Búsqueda (Nombre, Matrícula o Labor)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchNombre = item.nombre.toLowerCase().includes(q);
        const matchCodigo = item.codigo.toLowerCase().includes(q);
        const matchLabor = item.labor.toLowerCase().includes(q);
        const matchAreaMatricula = item.areaMatricula?.toLowerCase().includes(q) || false;
        if (!matchNombre && !matchCodigo && !matchLabor && !matchAreaMatricula) {
          return false;
        }
      }

      return true;
    });
  }, [
    consolidatedPrioritizedList,
    semanaSeleccionada,
    laboresSeleccionadas,
    laboresDisponibles,
    matriculaSeleccionada,
    areaMatriculaSeleccionada,
    estadoFiltro,
    searchQuery
  ]);

  const handleCustomDataLoaded = (customData: {
    rendimiento: EvaluacionRendimiento[];
    consolidado: EvaluacionCalidad[];
    matriculas: PersonaMatricula[];
    customSheetId?: string;
  }) => {
    if (customData.customSheetId) {
      setSpreadsheetId(customData.customSheetId);
      setCustomRendimiento(null);
      setCustomConsolidado(null);
      setCustomMatriculas(null);
      fetchSheetsData(customData.customSheetId);
    } else {
      if (customData.rendimiento.length > 0) setCustomRendimiento(customData.rendimiento);
      if (customData.consolidado.length > 0) setCustomConsolidado(customData.consolidado);
      if (customData.matriculas.length > 0) setCustomMatriculas(customData.matriculas);
      setLaboresInicializadas(false);
      setActiveTab('tabla');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-800 font-sans selection:bg-stone-200">
      
      {/* Header */}
      <Header
        sheetId={spreadsheetId}
        source={sheetsData?.source || 'mock_default'}
        lastUpdated={sheetsData?.lastUpdated || 'Reciente'}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchSheetsData(spreadsheetId)}
        email="excelenciaoperativamg@gmail.com"
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner de error o estado de respaldo si aplica */}
        {sheetsData?.error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-serif font-medium">Aviso de Sincronización:</strong> {sheetsData.error}
            </div>
          </div>
        )}

        {/* Loading Spinner State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-stone-500 animate-spin" />
            <p className="text-sm font-serif text-stone-600">Cargando informe de acompañamiento poscosecha...</p>
          </div>
        ) : (
          <>
            {/* Filter Bar & Views Switcher */}
            <FilterBar
              semanasDisponibles={semanasDisponibles}
              semanaSeleccionada={semanaSeleccionada}
              onSelectSemana={setSemanaSeleccionada}
              laboresDisponibles={laboresDisponibles}
              laboresSeleccionadas={laboresSeleccionadas}
              onSelectLabores={setLaboresSeleccionadas}
              matriculaSeleccionada={matriculaSeleccionada}
              onSelectMatricula={setMatriculaSeleccionada}
              matriculasDisponibles={activeMatriculasRaw}
              areaMatriculaSeleccionada={areaMatriculaSeleccionada}
              onSelectAreaMatricula={setAreaMatriculaSeleccionada}
              areasMatriculaDisponibles={areasMatriculaDisponibles}
              estadoFiltro={estadoFiltro}
              onSelectEstado={setEstadoFiltro}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* KPI Overview Cards - Solo se muestran en la pestaña Tabla Consolidada */}
            {activeTab === 'tabla' && (
              <KPICards
                data={filteredPrioritizationData}
                semanaSeleccionada={semanaSeleccionada}
              />
            )}

            {/* Tab 1: Tabla Consolidada (default view) */}
            {activeTab === 'tabla' && (
              <ConsolidadoTable
                data={filteredPrioritizationData}
                semanaSeleccionada={semanaSeleccionada}
                laboresDisponibles={laboresDisponibles}
                laboresSeleccionadas={laboresSeleccionadas}
                onSelectLabores={setLaboresSeleccionadas}
              />
            )}

            {/* Tab 2: Gestión Bajos Indicadores */}
            {activeTab === 'bajos_indicadores' && (
              <GestionBajosIndicadores
                bajosIndicadores={activeBajosIndicadoresRaw}
                semanasDisponibles={semanasDisponibles}
              />
            )}

            {/* Tab 3: Matriz de Decisión */}
            {activeTab === 'matriz' && <DecisionMatrixSection />}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white text-stone-600 border-t border-stone-200 py-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-400" />
            <span className="font-serif font-medium text-sm text-stone-800">Acompañamiento Poscosecha</span>
            <span className="text-stone-400">• Excelencia Operativa MG</span>
          </div>

          <div className="text-stone-500 flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              Rendimiento & Calidad Integrados
            </span>
            <span>|</span>
            <span>Matrículas Sincronizadas por Año-Semana-Código</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
