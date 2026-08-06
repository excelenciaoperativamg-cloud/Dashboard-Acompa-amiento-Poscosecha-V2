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
  Legend
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
  AlertCircle
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
  const [semanaFiltro, setSemanaFiltro] = useState<string>('TODAS');
  const [agruparPor, setAgruparPor] = useState<'semana' | 'fecha'>('semana');

  // List of unique operarios for filter
  const operariosDisponibles = useMemo(() => {
    const map = new Map<string, string>();
    rendimientoData.forEach((r) => {
      if (r.nombre && r.nombre.trim() !== '') {
        const key = r.codigo ? `${r.nombre} (${r.codigo})` : r.nombre;
        map.set(r.nombre, key);
      }
    });
    return Array.from(map.entries())
      .map(([nombre, label]) => ({ nombre, label }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [rendimientoData]);

  // Filter raw data
  const filteredData = useMemo(() => {
    return rendimientoData.filter((item) => {
      // 1. Labor filter
      if (laborFiltro !== 'TODAS' && item.labor !== laborFiltro) {
        return false;
      }
      // 2. Operario filter
      if (operarioFiltro !== 'TODOS' && item.nombre !== operarioFiltro) {
        return false;
      }
      // 3. Semana filter
      if (semanaFiltro !== 'TODAS' && item.semana !== semanaFiltro) {
        return false;
      }
      return true;
    });
  }, [rendimientoData, laborFiltro, operarioFiltro, semanaFiltro]);

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
      const key = agruparPor === 'fecha' && item.fecha ? item.fecha : item.semana || 'Sin Semana';

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
      grp.totalMeta += item.meta;
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

    // Sort chronologically if possible
    result.sort((a, b) => a.periodo.localeCompare(b.periodo));

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
    const totalMeta = filteredData.reduce((acc, curr) => acc + curr.meta, 0);
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
    <div className="space-y-6">
      
      {/* Title Header Card */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-[#0a2958]" />
            <h2 className="text-lg font-bold font-serif text-[#0a2958]">
              Curva de Aprendizaje - Rendimiento
            </h2>
          </div>
          <p className="text-xs text-stone-600">
            Visualización evolutiva del <strong>Promedio de Rendimiento Esperado (Meta)</strong> vs el <strong>Promedio de Rendimiento Real</strong> obtenido en las evaluaciones de poscosecha.
          </p>
        </div>

        {/* Grouping switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-stone-100 p-1 rounded-lg border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 px-2 uppercase tracking-wider">Agrupar:</span>
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
          <button
            onClick={() => setAgruparPor('fecha')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              agruparPor === 'fecha'
                ? 'bg-[#0a2958] text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Por Día / Fecha
          </button>
        </div>
      </div>

      {/* Local Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Filter Labor */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-stone-400" />
            Filtrar por Labor:
          </label>
          <select
            value={laborFiltro}
            onChange={(e) => setLaborFiltro(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0a2958]/30"
          >
            <option value="TODAS">Todas las labores ({laboresDisponibles.length})</option>
            {laboresDisponibles.map((labor) => (
              <option key={labor} value={labor}>
                {labor}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Operario */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            Filtrar por Operario:
          </label>
          <select
            value={operarioFiltro}
            onChange={(e) => setOperarioFiltro(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0a2958]/30"
          >
            <option value="TODOS">Todos los operarios ({operariosDisponibles.length})</option>
            {operariosDisponibles.map((op) => (
              <option key={op.nombre} value={op.nombre}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Semana */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            Filtrar por Semana:
          </label>
          <select
            value={semanaFiltro}
            onChange={(e) => setSemanaFiltro(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0a2958]/30"
          >
            <option value="TODAS">Todas las semanas ({semanasDisponibles.length})</option>
            {semanasDisponibles.map((sem) => (
              <option key={sem} value={sem}>
                Semana {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* KPI 1: Promedio Real */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 border-t-3 border-t-[#0a2958] shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a2958]">Prom. Rendimiento</span>
            <TrendingUp className="w-4 h-4 text-[#0a2958]" />
          </div>
          <div className="text-xl font-bold font-serif text-[#0a2958]">
            {globalKPIs.promedioReal}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Rendimiento Real promedio</p>
        </div>

        {/* KPI 2: Promedio Esperado */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 border-t-3 border-t-emerald-600 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Rend. Esperado (Meta)</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-serif text-emerald-700">
            {globalKPIs.promedioEsperado}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Meta ponderada promedio</p>
        </div>

        {/* KPI 3: Promedio Mínimo */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 border-t-3 border-t-amber-500 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Rend. Mínimo</span>
            <BarChart2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-serif text-amber-800">
            {globalKPIs.promedioMinimo}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Mínimo para cumplimiento</p>
        </div>

        {/* KPI 4: Cumplimiento Meta % */}
        <div className={`bg-white p-3.5 rounded-xl border border-stone-200 border-t-3 ${
          globalKPIs.cumplimientoPct >= 100 ? 'border-t-emerald-600 text-emerald-800' : globalKPIs.cumplimientoPct >= 90 ? 'border-t-amber-500 text-amber-800' : 'border-t-rose-600 text-rose-800'
        } shadow-2xs`}>
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">% Cumplimiento Meta</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-serif">
            {globalKPIs.cumplimientoPct}%
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            {globalKPIs.brecha >= 0 ? `+${globalKPIs.brecha} sobre la meta` : `${globalKPIs.brecha} vs meta`}
          </p>
        </div>

        {/* KPI 5: Evaluaciones */}
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 border-t-3 border-t-stone-500 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">Evaluaciones</span>
            <Users className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-xl font-bold font-serif text-stone-800">
            {globalKPIs.totalEvaluaciones}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Registros analizados</p>
        </div>
      </div>

      {/* Main Line Chart Section */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold font-serif text-stone-800">
              Gráfico de Líneas - Comparativo de Rendimiento
            </h3>
            <p className="text-xs text-stone-500">
              Línea Azul: <strong>Promedio Rendimiento Real</strong> | Línea Verde Punteada: <strong>Promedio Rendimiento Esperado (Meta)</strong> | Línea Naranja: <strong>Promedio Mínimo</strong>
            </p>
          </div>
          {(laborFiltro !== 'TODAS' || operarioFiltro !== 'TODOS' || semanaFiltro !== 'TODAS') && (
            <button
              onClick={() => {
                setLaborFiltro('TODAS');
                setOperarioFiltro('TODOS');
                setSemanaFiltro('TODAS');
              }}
              className="text-xs text-[#0a2958] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {chartData.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            No se encontraron registros de rendimiento para los filtros seleccionados.
          </div>
        ) : (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="periodo"
                  stroke="#78716c"
                  tick={{ fontSize: 11 }}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  stroke="#78716c"
                  tick={{ fontSize: 11 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const diff = Math.round((data.promedioRendimiento - data.promedioEsperado) * 10) / 10;
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-lg text-xs shadow-lg border border-stone-700 space-y-1.5">
                          <p className="font-bold border-b border-stone-700 pb-1 text-stone-200">
                            Periodo: {label}
                          </p>
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span>Promedio Esperado (Meta):</span>
                            <span className="font-bold">{data.promedioEsperado}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-blue-300">
                            <span>Promedio Rendimiento Real:</span>
                            <span className="font-bold">{data.promedioRendimiento}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-amber-400">
                            <span>Promedio Mínimo:</span>
                            <span className="font-bold">{data.promedioMinimo}</span>
                          </div>
                          <div className="pt-1 border-t border-stone-800 flex items-center justify-between gap-4 text-stone-300">
                            <span>Cumplimiento:</span>
                            <span className={`font-bold ${data.cumplimiento >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {data.cumplimiento}% ({diff >= 0 ? `+${diff}` : diff})
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 pt-0.5">
                            Evaluaciones: {data.evaluacionesCount}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-stone-700 mr-4">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="promedioEsperado"
                  name="Promedio Rendimiento Esperado (Meta)"
                  stroke="#059669"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#059669' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="promedioRendimiento"
                  name="Promedio Rendimiento Real"
                  stroke="#0a2958"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0a2958' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="promedioMinimo"
                  name="Promedio Rendimiento Mínimo"
                  stroke="#d97706"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: '#d97706' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
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
