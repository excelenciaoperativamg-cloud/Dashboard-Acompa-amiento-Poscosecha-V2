import React, { useState, useMemo } from 'react';
import { EvaluacionRendimiento } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  Users,
  Briefcase,
  Calendar,
  Filter,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Clock,
  Search,
  FilterX
} from 'lucide-react';

interface CurvaAprendizajeProps {
  rendimientoData: EvaluacionRendimiento[];
  semanasDisponibles: string[];
  laboresDisponibles: string[];
}

export const CurvaAprendizaje: React.FC<CurvaAprendizajeProps> = ({
  rendimientoData,
  semanasDisponibles,
  laboresDisponibles
}) => {
  // Local filters inside Curva de Aprendizaje
  const [laborFiltro, setLaborFiltro] = useState<string>('TODAS');
  const [operarioFiltro, setOperarioFiltro] = useState<string>('TODOS');
  const [operarioBusqueda, setOperarioBusqueda] = useState<string>('');
  const [semanaFiltro, setSemanaFiltro] = useState<string>('TODAS');
  const [nuevoAntiguoFiltro, setNuevoAntiguoFiltro] = useState<string>('En ruta');
  const [fechaIngresoFiltro, setFechaIngresoFiltro] = useState<string>('TODAS');
  const [agruparPor, setAgruparPor] = useState<'dia' | 'semana' | 'fecha'>('dia');

  // List of unique operarios (Nombres) for filter - ONLY records with 'En ruta'
  const operariosDisponibles = useMemo(() => {
    const map = new Map<string, string>();
    rendimientoData.forEach((r) => {
      const isEnRuta = (r.nuevoAntiguo || '').trim().toLowerCase() === 'en ruta';
      if (isEnRuta && r.nombre && r.nombre.trim() !== '') {
        const key = r.codigo ? `${r.nombre} (${r.codigo})` : r.nombre;
        map.set(r.nombre, key);
      }
    });
    return Array.from(map.entries())
      .map(([nombre, label]) => ({ nombre, label }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [rendimientoData]);

  // Filtered operarios for Slicer search box
  const operariosFiltradosBusqueda = useMemo(() => {
    if (!operarioBusqueda.trim()) return operariosDisponibles;
    const query = operarioBusqueda.toLowerCase();
    return operariosDisponibles.filter(op => 
      op.nombre.toLowerCase().includes(query) || op.label.toLowerCase().includes(query)
    );
  }, [operariosDisponibles, operarioBusqueda]);

  // Unique values for Nuevo/Antiguo
  const opcionesNuevoAntiguo = useMemo(() => {
    const setVals = new Set<string>();
    rendimientoData.forEach((r) => {
      if (r.nuevoAntiguo && r.nuevoAntiguo.trim() !== '') {
        setVals.add(r.nuevoAntiguo.trim());
      }
    });
    setVals.add('En ruta');
    return Array.from(setVals).sort();
  }, [rendimientoData]);

  // Unique values for Fecha de Ingreso - ONLY records with 'En ruta'
  const opcionesFechaIngreso = useMemo(() => {
    const setVals = new Set<string>();
    rendimientoData.forEach((r) => {
      const isEnRuta = (r.nuevoAntiguo || '').trim().toLowerCase() === 'en ruta';
      if (isEnRuta && r.fechaIngreso && r.fechaIngreso.trim() !== '') {
        setVals.add(r.fechaIngreso.trim());
      }
    });
    return Array.from(setVals).sort((a, b) => a.localeCompare(b));
  }, [rendimientoData]);

  // Filter raw data
  const filteredData = useMemo(() => {
    return rendimientoData.filter((item) => {
      // 1. Labor filter
      if (
        laborFiltro !== 'TODAS' &&
        (!item.labor || item.labor.trim().toLowerCase() !== laborFiltro.trim().toLowerCase())
      ) {
        return false;
      }
      // 2. Operario filter
      if (
        operarioFiltro !== 'TODOS' &&
        (!item.nombre || item.nombre.trim().toLowerCase() !== operarioFiltro.trim().toLowerCase())
      ) {
        return false;
      }
      // 3. Semana filter
      if (
        semanaFiltro !== 'TODAS' &&
        (!item.semana || item.semana.trim() !== semanaFiltro.trim())
      ) {
        return false;
      }
      // 4. Nuevo/Antiguo filter
      if (
        nuevoAntiguoFiltro !== 'TODOS' &&
        (!item.nuevoAntiguo || item.nuevoAntiguo.trim().toLowerCase() !== nuevoAntiguoFiltro.trim().toLowerCase())
      ) {
        return false;
      }
      // 5. Fecha de Ingreso filter
      if (
        fechaIngresoFiltro !== 'TODAS' &&
        (!item.fechaIngreso || item.fechaIngreso.trim() !== fechaIngresoFiltro.trim())
      ) {
        return false;
      }
      return true;
    });
  }, [rendimientoData, laborFiltro, operarioFiltro, semanaFiltro, nuevoAntiguoFiltro, fechaIngresoFiltro]);

  // Aggregated data for Chart
  const chartData = useMemo(() => {
    const grouped = new Map<
      string,
      {
        totalRend: number;
        totalMeta: number;
        totalMin: number;
        totalObs: number;
        count: number;
        items: EvaluacionRendimiento[];
      }
    >();

    filteredData.forEach((item) => {
      let key = '';
      if (agruparPor === 'dia') {
        key = item.dia !== undefined && item.dia !== '' ? `${item.dia}` : (item.fecha ? `${item.fecha}` : item.semana);
      } else if (agruparPor === 'fecha') {
        key = item.fecha || item.semana || 'Sin Fecha';
      } else {
        key = item.semana ? `Semana ${item.semana}` : 'Sin Semana';
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          totalRend: 0,
          totalMeta: 0,
          totalMin: 0,
          totalObs: 0,
          count: 0,
          items: []
        });
      }

      const grp = grouped.get(key)!;
      grp.totalRend += item.rendimiento;
      grp.totalMeta += item.rendimientoEsperado !== undefined ? item.rendimientoEsperado : item.meta;
      grp.totalMin += item.minimo;
      grp.totalObs += item.observacion || Math.round(item.minimo * 0.9);
      grp.count += 1;
      grp.items.push(item);
    });

    // Convert to sorted array
    const result = Array.from(grouped.entries()).map(([periodo, data]) => {
      const promedioRendimiento = Math.round((data.totalRend / data.count) * 10) / 10;
      const promedioEsperado = Math.round((data.totalMeta / data.count) * 10) / 10;
      const promedioMinimo = Math.round((data.totalMin / data.count) * 10) / 10;
      const promedioObservacion = Math.round((data.totalObs / data.count) * 10) / 10;
      const cumplimiento = Math.round((promedioRendimiento / (promedioEsperado || 1)) * 100);

      return {
        periodo,
        promedioRendimiento,
        promedioEsperado,
        promedioMinimo,
        promedioObservacion,
        cumplimiento,
        evaluacionesCount: data.count
      };
    });

    // Sort appropriately
    result.sort((a, b) => {
      if (agruparPor === 'dia') {
        const numA = Number(a.periodo);
        const numB = Number(b.periodo);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        const cleanA = parseInt(a.periodo.replace(/\D/g, ''), 10);
        const cleanB = parseInt(b.periodo.replace(/\D/g, ''), 10);
        if (!isNaN(cleanA) && !isNaN(cleanB)) return cleanA - cleanB;
      }
      return a.periodo.localeCompare(b.periodo, undefined, { numeric: true });
    });

    return result;
  }, [filteredData, agruparPor]);

  // General KPI metrics
  const globalKPIs = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        promedioReal: 0,
        promedioEsperado: 0,
        promedioMinimo: 0,
        cumplimientoPct: 0,
        brecha: 0,
        totalEvaluaciones: 0
      };
    }

    const totalRend = filteredData.reduce((acc, curr) => acc + curr.rendimiento, 0);
    const totalMeta = filteredData.reduce((acc, curr) => acc + (curr.rendimientoEsperado !== undefined ? curr.rendimientoEsperado : curr.meta), 0);
    const totalMin = filteredData.reduce((acc, curr) => acc + curr.minimo, 0);
    const count = filteredData.length;

    const promedioReal = Math.round((totalRend / count) * 10) / 10;
    const promedioEsperado = Math.round((totalMeta / count) * 10) / 10;
    const promedioMinimo = Math.round((totalMin / count) * 10) / 10;
    const cumplimientoPct = Math.round((promedioReal / (promedioEsperado || 1)) * 100);
    const brecha = Math.round((promedioReal - promedioEsperado) * 10) / 10;

    return {
      promedioReal,
      promedioEsperado,
      promedioMinimo,
      cumplimientoPct,
      brecha,
      totalEvaluaciones: count
    };
  }, [filteredData]);

  return (
    <div className="space-y-5">
      
      {/* Title Header Card matching user screenshot style */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingUp className="w-5 h-5 text-[#0a2958]" />
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#0a2958] font-sans">
              CURVA DE APRENDIZAJE
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-medium pl-7">
            (varios elementos) &bull; Evolución del Rendimiento por Día de acuerdo a la meta esperada
          </p>
        </div>

        {/* Grouping switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-stone-100 p-1 rounded-lg border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 px-2 uppercase tracking-wider">Eje X:</span>
          <button
            onClick={() => setAgruparPor('dia')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              agruparPor === 'dia'
                ? 'bg-[#0a2958] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Por Día
          </button>
          <button
            onClick={() => setAgruparPor('fecha')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              agruparPor === 'fecha'
                ? 'bg-[#0a2958] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Por Fecha
          </button>
          <button
            onClick={() => setAgruparPor('semana')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              agruparPor === 'semana'
                ? 'bg-[#0a2958] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Por Semana
          </button>
        </div>
      </div>

      {/* Local Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Filter Labor */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-stone-400" />
            Labor:
          </label>
          <select
            value={laborFiltro}
            onChange={(e) => setLaborFiltro(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0a2958]/30 font-medium"
          >
            <option value="TODAS">Todas las labores ({laboresDisponibles.length})</option>
            {laboresDisponibles.map((labor) => (
              <option key={labor} value={labor}>
                {labor}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Semana */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-stone-400" />
            Semana:
          </label>
          <select
            value={semanaFiltro}
            onChange={(e) => setSemanaFiltro(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0a2958]/30 font-medium"
          >
            <option value="TODAS">Todas las semanas ({semanasDisponibles.length})</option>
            {semanasDisponibles.map((sem) => (
              <option key={sem} value={sem}>
                Semana {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Nuevo / Antiguo */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-stone-400" />
            Nuevo / Antiguo:
          </label>
          <select
            value={nuevoAntiguoFiltro}
            onChange={(e) => setNuevoAntiguoFiltro(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0a2958]/30 font-medium"
          >
            <option value="TODOS">Todos ({opcionesNuevoAntiguo.length})</option>
            {opcionesNuevoAntiguo.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Reset */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setLaborFiltro('TODAS');
              setOperarioFiltro('TODOS');
              setSemanaFiltro('TODAS');
              setNuevoAntiguoFiltro('En ruta');
              setFechaIngresoFiltro('TODAS');
              setOperarioBusqueda('');
            }}
            className="w-full py-2 px-3 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
          >
            <FilterX className="w-3.5 h-3.5 text-stone-500" />
            Restablecer Filtros
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-stone-200 border-t-3 border-t-[#ea580c] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">Prom. Rendimiento</span>
            <TrendingUp className="w-4 h-4 text-[#ea580c]" />
          </div>
          <div className="text-xl font-bold font-serif text-[#ea580c]">
            {globalKPIs.promedioReal}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Rendimiento Real promedio</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 border-t-3 border-t-blue-600 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Rend. Esperado (Meta)</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-serif text-blue-700">
            {globalKPIs.promedioEsperado}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Meta esperada promedio</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 border-t-3 border-t-amber-500 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Rend. Mínimo</span>
            <BarChart2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-serif text-amber-800">
            {globalKPIs.promedioMinimo}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Mínimo para cumplimiento</p>
        </div>

        <div className={`bg-white p-3 rounded-xl border border-stone-200 border-t-3 ${
          globalKPIs.cumplimientoPct >= 100 ? 'border-t-emerald-600 text-emerald-800' : globalKPIs.cumplimientoPct >= 90 ? 'border-t-amber-500 text-amber-800' : 'border-t-rose-600 text-rose-800'
        } shadow-2xs`}>
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">% Cumplimiento Meta</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-serif">
            {globalKPIs.cumplimientoPct}%
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {globalKPIs.brecha >= 0 ? `+${globalKPIs.brecha} sobre la meta` : `${globalKPIs.brecha} vs meta`}
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-stone-200 border-t-3 border-t-stone-500 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">Evaluaciones</span>
            <Users className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-xl font-bold font-serif text-stone-800">
            {globalKPIs.totalEvaluaciones}
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5">Registros analizados</p>
        </div>
      </div>

      {/* Main Section: Chart on Left (75%), Slicers on Right (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left Column: Chart Card */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-center mb-2 pb-2 border-b border-stone-100">
            <h3 className="text-xl font-extrabold uppercase tracking-tight text-[#0a2958] font-sans text-center">
              Rendimiento
            </h3>
          </div>

          {chartData.length === 0 ? (
            <div className="py-24 text-center text-stone-400 text-xs">
              No se encontraron registros de rendimiento para los filtros seleccionados.
            </div>
          ) : (
            <div className="h-96 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 25, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="periodo"
                    stroke="#525252"
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    padding={{ left: 25, right: 25 }}
                  />
                  <YAxis
                    stroke="#525252"
                    tick={{ fontSize: 11 }}
                    domain={[0, 'dataMax + 150']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const diff = Math.round((data.promedioRendimiento - data.promedioEsperado) * 10) / 10;
                        return (
                          <div className="bg-stone-900 text-white p-3 rounded-lg text-xs shadow-lg border border-stone-700 space-y-1.5">
                            <p className="font-bold border-b border-stone-700 pb-1 text-stone-200">
                              {agruparPor === 'dia' ? `Día ${label}` : `Periodo: ${label}`}
                            </p>
                            <div className="flex items-center justify-between gap-4 text-blue-400">
                              <span>Promedio de Rendimiento esperado:</span>
                              <span className="font-bold">{data.promedioEsperado}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-orange-400">
                              <span>Promedio de Rendimiento:</span>
                              <span className="font-bold">{data.promedioRendimiento}</span>
                            </div>
                            <div className="pt-1 border-t border-stone-800 flex items-center justify-between gap-4 text-stone-300">
                              <span>Cumplimiento:</span>
                              <span className={`font-bold ${data.cumplimiento >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {data.cumplimiento}% ({diff >= 0 ? `+${diff}` : diff})
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400 pt-0.5">
                              Registros: {data.evaluacionesCount}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-stone-700 mr-4">{value}</span>
                    )}
                  />
                  
                  {/* Line 1: Promedio de Rendimiento esperado (Azul) */}
                  <Line
                    type="monotone"
                    dataKey="promedioEsperado"
                    name="Promedio de Rendimiento esperado"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 1.5 }}
                    activeDot={{ r: 7 }}
                  >
                    <LabelList dataKey="promedioEsperado" position="top" offset={10} fill="#1d4ed8" fontSize={10} fontWeight={700} />
                  </Line>

                  {/* Line 2: Promedio de Rendimiento (Naranja / Marrón) */}
                  <Line
                    type="monotone"
                    dataKey="promedioRendimiento"
                    name="Promedio de Rendimiento"
                    stroke="#ea580c"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#ea580c', stroke: '#ffffff', strokeWidth: 1.5 }}
                    activeDot={{ r: 7 }}
                  >
                    <LabelList dataKey="promedioRendimiento" position="top" offset={10} fill="#c2410c" fontSize={10} fontWeight={700} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Excel Slicers */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Slicer 1: Fecha de ingreso */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="bg-[#0a2958] text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-blue-200" />
                <span>Fecha de ingreso</span>
              </div>
              {fechaIngresoFiltro !== 'TODAS' && (
                <button
                  onClick={() => setFechaIngresoFiltro('TODAS')}
                  className="text-[10px] text-blue-200 hover:text-white underline cursor-pointer font-medium"
                >
                  Borrar
                </button>
              )}
            </div>
            <div className="p-2 max-h-48 overflow-y-auto divide-y divide-stone-100">
              <button
                onClick={() => setFechaIngresoFiltro('TODAS')}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  fechaIngresoFiltro === 'TODAS'
                    ? 'bg-blue-50 text-[#0a2958] font-bold border-l-3 border-[#0a2958]'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>(Todas las fechas)</span>
                {fechaIngresoFiltro === 'TODAS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0a2958]" />}
              </button>
              {opcionesFechaIngreso.map((fecha) => {
                const isSelected = fechaIngresoFiltro === fecha;
                return (
                  <button
                    key={fecha}
                    onClick={() => setFechaIngresoFiltro(isSelected ? 'TODAS' : fecha)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#0a2958] font-bold border-l-3 border-[#0a2958]'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{fecha}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0a2958]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slicer 2: Nombre */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="bg-[#0a2958] text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-blue-200" />
                <span>Nombre</span>
              </div>
              {operarioFiltro !== 'TODOS' && (
                <button
                  onClick={() => setOperarioFiltro('TODOS')}
                  className="text-[10px] text-blue-200 hover:text-white underline cursor-pointer font-medium"
                >
                  Borrar
                </button>
              )}
            </div>

            {/* Nombre Search Input */}
            <div className="p-2 border-b border-stone-100 bg-stone-50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={operarioBusqueda}
                  onChange={(e) => setOperarioBusqueda(e.target.value)}
                  className="w-full text-xs pl-8 pr-2 py-1.5 bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0a2958]"
                />
              </div>
            </div>

            <div className="p-2 max-h-64 overflow-y-auto space-y-0.5">
              <button
                onClick={() => setOperarioFiltro('TODOS')}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  operarioFiltro === 'TODOS'
                    ? 'bg-blue-50 text-[#0a2958] font-bold border-l-3 border-[#0a2958]'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>(Todos los nombres)</span>
                {operarioFiltro === 'TODOS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0a2958]" />}
              </button>
              {operariosFiltradosBusqueda.map((op) => {
                const isSelected = operarioFiltro === op.nombre;
                return (
                  <button
                    key={op.nombre}
                    onClick={() => {
                      if (isSelected) {
                        setOperarioFiltro('TODOS');
                      } else {
                        setOperarioFiltro(op.nombre);
                        setFechaIngresoFiltro('TODAS');
                      }
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-[#0a2958] font-bold border-l-3 border-[#0a2958]'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate pr-1">{op.nombre}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0a2958] shrink-0" />}
                  </button>
                );
              })}
              {operariosFiltradosBusqueda.length === 0 && (
                <div className="p-3 text-center text-xs text-stone-400">
                  No se encontraron coincidencias.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Detailed Table Breakdown */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#0a2958]" />
            Detalle por Periodo ({agruparPor === 'semana' ? 'Semanas' : 'Fechas'})
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            {chartData.length} periodos analizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-stone-700">
            <thead className="bg-stone-100/70 uppercase text-[10px] tracking-wider text-stone-500 font-bold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-4">Periodo ({agruparPor === 'semana' ? 'Semana' : 'Fecha'})</th>
                <th className="py-2.5 px-4 text-center">Evaluaciones</th>
                <th className="py-2.5 px-4 text-right">Prom. Rend. Real</th>
                <th className="py-2.5 px-4 text-right">Prom. Esperado (Meta)</th>
                <th className="py-2.5 px-4 text-right">Prom. Mínimo</th>
                <th className="py-2.5 px-4 text-right">Brecha (Real - Meta)</th>
                <th className="py-2.5 px-4 text-center">% Cumplimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {chartData.map((row) => {
                const diff = Math.round((row.promedioRendimiento - row.promedioEsperado) * 10) / 10;
                return (
                  <tr key={row.periodo} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[#0a2958]">
                      {agruparPor === 'semana' ? `Semana ${row.periodo}` : row.periodo}
                    </td>
                    <td className="py-2.5 px-4 text-center text-stone-600 font-medium">
                      {row.evaluacionesCount}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-stone-900">
                      {row.promedioRendimiento}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-700 font-medium">
                      {row.promedioEsperado}
                    </td>
                    <td className="py-2.5 px-4 text-right text-amber-700 font-medium">
                      {row.promedioMinimo}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {diff >= 0 ? `+${diff}` : diff}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        row.cumplimiento >= 100
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.cumplimiento >= 90
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {row.cumplimiento}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
