import React, { useState, useMemo } from 'react';
import { RegistroBajoIndicador } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LabelList
} from 'recharts';
import {
  UserCheck,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Info
} from 'lucide-react';

interface GestionBajosIndicadoresProps {
  bajosIndicadores: RegistroBajoIndicador[];
  semanasDisponibles: string[];
}

const COLOR_PALETTE = [
  '#0a2958', // Deep Navy
  '#7C816F', // Sage/Olive
  '#2563eb', // Blue
  '#059669', // Emerald Green
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed'  // Purple
];

export const GestionBajosIndicadores: React.FC<GestionBajosIndicadoresProps> = ({
  bajosIndicadores,
  semanasDisponibles
}) => {
  const [semanaFiltro, setSemanaFiltro] = useState<string>('TODAS');
  const [formadorFiltro, setFormadorFiltro] = useState<string>('TODOS');
  const [searchPerson, setSearchPerson] = useState<string>('');
  const [graficaFormadorTipo, setGraficaFormadorTipo] = useState<'barras' | 'donut'>('barras');

  // 1. Filtrar registros según Semana, Formador y Búsqueda
  const registrosFiltrados = useMemo(() => {
    return bajosIndicadores.filter((reg) => {
      if (semanaFiltro !== 'TODAS' && reg.semana !== semanaFiltro) {
        return false;
      }
      if (formadorFiltro !== 'TODOS' && reg.formador !== formadorFiltro) {
        return false;
      }
      if (searchPerson.trim() !== '') {
        const q = searchPerson.toLowerCase().trim();
        const matchNombre = reg.nombre.toLowerCase().includes(q);
        const matchCodigo = reg.codigo.toLowerCase().includes(q);
        const matchFormador = reg.formador.toLowerCase().includes(q);
        if (!matchNombre && !matchCodigo && !matchFormador) return false;
      }
      return true;
    });
  }, [bajosIndicadores, semanaFiltro, formadorFiltro, searchPerson]);

  // Lista de semanas disponibles exclusivamente de la hoja Bajos_Indicadores
  const semanasBajosIndicadores = useMemo(() => {
    const setS = new Set<string>();
    bajosIndicadores.forEach((r) => r.semana && setS.add(r.semana));
    return Array.from(setS).sort().reverse();
  }, [bajosIndicadores]);

  // Lista de formadores disponibles
  const formadoresDisponibles = useMemo(() => {
    const setF = new Set<string>();
    bajosIndicadores.forEach((r) => r.formador && setF.add(r.formador));
    return Array.from(setF).sort();
  }, [bajosIndicadores]);

  // Lista de tipos de acompañamiento disponibles
  const tiposAcompanamientoDisponibles = useMemo(() => {
    const setT = new Set<string>();
    bajosIndicadores.forEach((r) => r.tipoAcompanamiento && setT.add(r.tipoAcompanamiento));
    return Array.from(setT).sort();
  }, [bajosIndicadores]);

  // KPI STATS
  const stats = useMemo(() => {
    const totalRegistros = registrosFiltrados.length;
    const personasUnicas = new Set(registrosFiltrados.map((r) => r.codigo || r.nombre)).size;
    const formadoresUnicos = new Set(registrosFiltrados.map((r) => r.formador)).size;
    
    const sumaPorcentajes = registrosFiltrados.reduce((acc, r) => acc + (r.porcentajeAcompanamiento || 0), 0);
    const promCumplimiento = totalRegistros > 0 ? Math.round(sumaPorcentajes / totalRegistros) : 0;

    const completados = registrosFiltrados.filter((r) => (r.porcentajeAcompanamiento || 0) >= 100 || r.estadoAcompanamiento === 'Completado').length;
    const porcentajeCompletado = totalRegistros > 0 ? Math.round((completados / totalRegistros) * 100) : 0;

    return {
      totalRegistros,
      personasUnicas,
      formadoresUnicos,
      promCumplimiento,
      completados,
      porcentajeCompletado
    };
  }, [registrosFiltrados]);

  // DATA PARA GRÁFICA 1: Barras horizontales por Tipo de Acompañamiento (con conteos)
  const dataTipoAcompanamiento = useMemo(() => {
    const mapCount: Record<string, { cantidad: number; sumaCumplimiento: number }> = {};

    registrosFiltrados.forEach((reg) => {
      const tipo = reg.tipoAcompanamiento || 'Otro';
      if (!mapCount[tipo]) {
        mapCount[tipo] = { cantidad: 0, sumaCumplimiento: 0 };
      }
      mapCount[tipo].cantidad += 1;
      mapCount[tipo].sumaCumplimiento += (reg.porcentajeAcompanamiento || 0);
    });

    return Object.entries(mapCount)
      .map(([tipo, val]) => ({
        tipo,
        cantidad: val.cantidad,
        promedio: val.cantidad > 0 ? Math.round(val.sumaCumplimiento / val.cantidad) : 0
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [registrosFiltrados]);

  // DATA PARA GRÁFICA 2: % Acompañamiento por Formador / Entrenador
  const dataPorFormador = useMemo(() => {
    const mapFormador: Record<string, number> = {};
    let totalSesiones = 0;

    registrosFiltrados.forEach((reg) => {
      const formador = reg.formador || 'Sin Asignar';
      mapFormador[formador] = (mapFormador[formador] || 0) + 1;
      totalSesiones += 1;
    });

    return Object.entries(mapFormador)
      .map(([formador, cantidad]) => ({
        formador,
        cantidad,
        porcentaje: totalSesiones > 0 ? (cantidad / totalSesiones) * 100 : 0
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [registrosFiltrados]);

  // DATA PARA TABLA 3: Matriz Persona (Filas/Vertical) vs Tipo de Acompañamiento (Columnas/Horizontal)
  const matrixData = useMemo(() => {
    const personsMap: Record<string, {
      codigo: string;
      nombre: string;
      labor: string;
      formadorPrincipal: string;
      countsByTipo: Record<string, number>;
      totalSesiones: number;
      sumaCumplimiento: number;
    }> = {};

    registrosFiltrados.forEach((reg) => {
      const key = reg.codigo ? `${reg.codigo}_${reg.nombre}` : reg.nombre;
      if (!personsMap[key]) {
        personsMap[key] = {
          codigo: reg.codigo || '-',
          nombre: reg.nombre,
          labor: reg.labor || 'Poscosecha',
          formadorPrincipal: reg.formador || '-',
          countsByTipo: {},
          totalSesiones: 0,
          sumaCumplimiento: 0
        };
      }

      const tipo = reg.tipoAcompanamiento || 'Otro';
      personsMap[key].countsByTipo[tipo] = (personsMap[key].countsByTipo[tipo] || 0) + 1;
      personsMap[key].totalSesiones += 1;
      personsMap[key].sumaCumplimiento += (reg.porcentajeAcompanamiento || 0);
    });

    return Object.values(personsMap).map((p) => {
      const promTotal = p.totalSesiones > 0 ? Math.round(p.sumaCumplimiento / p.totalSesiones) : 0;
      return {
        ...p,
        promedioGeneral: promTotal
      };
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [registrosFiltrados]);

  // Totales de la tabla por columna (para fila 'Total' al final de la tabla)
  const tableTotals = useMemo(() => {
    const columnSums: Record<string, number> = {};
    let grandTotal = 0;

    matrixData.forEach((row) => {
      tiposAcompanamientoDisponibles.forEach((tipo) => {
        const count = row.countsByTipo[tipo] || 0;
        columnSums[tipo] = (columnSums[tipo] || 0) + count;
      });
      grandTotal += row.totalSesiones;
    });

    return { columnSums, grandTotal };
  }, [matrixData, tiposAcompanamientoDisponibles]);

  // Exportar matriz a CSV
  const exportarMatrizCSV = () => {
    if (matrixData.length === 0) return;

    const headers = [
      'Código/Matrícula',
      'Nombre Operario',
      'Labor',
      'Entrenador Principal',
      ...tiposAcompanamientoDisponibles,
      '% Cumplimiento Promedio Total'
    ];

    const rows = matrixData.map((row) => {
      const cals = tiposAcompanamientoDisponibles.map((tipo) => {
        const count = row.countsByTipo[tipo];
        return count ? `${count}` : '-';
      });

      return [
        `"${row.codigo}"`,
        `"${row.nombre}"`,
        `"${row.labor}"`,
        `"${row.formadorPrincipal}"`,
        ...cals.map((c) => `"${c}"`),
        `"${row.totalSesiones}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Acompanamiento_Persona_BajosIndicadores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner / Title */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0a2958]/10 text-[#0a2958] rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Gestión Bajos Indicadores
              </h2>
              <p className="text-xs text-stone-500">
                Informe de Acompañamiento Poscosecha y seguimiento por Operario
              </p>
            </div>
          </div>
        </div>

        {/* Global Filters inside tab */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Semana */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-stone-500 font-medium">Semana:</span>
            <select
              value={semanaFiltro}
              onChange={(e) => setSemanaFiltro(e.target.value)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="TODAS">Todas las semanas</option>
              {semanasBajosIndicadores.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Entrenador */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500 font-medium">Entrenador:</span>
            <select
              value={formadorFiltro}
              onChange={(e) => setFormadorFiltro(e.target.value)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los entrenadores</option>
              {formadoresDisponibles.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar operario o código..."
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:ring-2 focus:ring-[#7C816F] focus:outline-none w-48"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Total Acompañamientos realizados</p>
            <p className="text-xl font-bold text-stone-900">{stats.totalRegistros}</p>
            <p className="text-[11px] text-stone-400">{stats.completados} completados ({stats.porcentajeCompletado}%)</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Operarios Acompañados</p>
            <p className="text-xl font-bold text-stone-900">{stats.personasUnicas}</p>
            <p className="text-[11px] text-stone-400">Operarios en registro</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">Entrenadores Evaluando</p>
            <p className="text-xl font-bold text-stone-900">{stats.formadoresUnicos}</p>
            <p className="text-[11px] text-stone-400">Poscosecha / Facilitadores</p>
          </div>
        </div>
      </div>

      {/* Row with Charts 1 and 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Tipo Acompañamiento (Barras Horizontales Verdes) */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-[#4a73a3] text-white py-2.5 px-4 font-bold text-center text-sm tracking-wide">
              Tipo Acompañamiento
            </div>

            <div className="p-4">
              <div className="h-72 w-full">
                {dataTipoAcompanamiento.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={dataTipoAcompanamiento}
                      margin={{ top: 20, right: 35, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" allowDecimals={false} stroke="#a8a29e" fontSize={11} domain={[0, 'dataMax + 2']} />
                      <YAxis
                        dataKey="tipo"
                        type="category"
                        stroke="#44403c"
                        fontSize={11}
                        fontWeight={500}
                        width={120}
                        tickFormatter={(val) => val.length > 18 ? val.slice(0, 16) + '...' : val}
                      />
                      <Tooltip
                        formatter={(val: any) => [`${val} acompañamientos`, 'Cantidad']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="center"
                        wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={() => <span className="text-stone-700 font-bold uppercase tracking-wider text-[11px]">ACOMPAÑAMIENTO</span>}
                      />
                      <Bar dataKey="cantidad" name="ACOMPAÑAMIENTO" fill="#388e3c" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="cantidad" position="insideRight" fill="#ffffff" fontWeight="bold" fontSize={11} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    No hay datos registrados para los filtros seleccionados
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Muestra el total de intervenciones clasificadas por cada tipo de acompañamiento poscosecha.</span>
          </div>
        </div>

        {/* CHART 2: % Acompañamiento por Formador (Pie Chart) */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-[#4a73a3] text-white py-2.5 px-4 font-bold text-center text-sm tracking-wide">
              % Acompañamiento por Formador
            </div>

            <div className="p-4">
              <div className="h-72 w-full">
                {dataPorFormador.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataPorFormador}
                        dataKey="cantidad"
                        nameKey="formador"
                        cx="42%"
                        cy="50%"
                        outerRadius={95}
                        fill="#8884d8"
                        label={({ percent }) => percent > 0.04 ? `${(percent * 100).toFixed(1).replace('.', ',')}%` : ''}
                        labelLine={false}
                      >
                        {dataPorFormador.map((_, index) => (
                          <Cell
                            key={`pie-cell-${index}`}
                            fill={['#2563eb', '#3b82f6', '#f59e0b', '#10b981', '#7c3aed', '#ec4899', '#06b6d4'][index % 7]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${val} sesiones (${item.payload.porcentaje.toFixed(1)}%)`,
                          'Acompañamientos'
                        ]}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ fontSize: '11px', lineHeight: '22px', color: '#292524' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    No hay datos registrados para los filtros seleccionados
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              Proporción (%) de acompañamientos realizados por cada entrenador/formador.
            </span>
          </div>
        </div>

      </div>

      {/* TABLE 3: Acompañamiento por persona */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Card Header Banner */}
        <div className="bg-[#4a73a3] text-white py-2.5 px-5 font-bold text-sm tracking-wide flex items-center justify-between">
          <span>Acompañamiento por persona</span>
          <span className="text-[11px] font-normal uppercase opacity-90">ACOMPAÑAMIENTO / ACOMPAÑAMIENTO</span>
        </div>

        {/* Action bar above table */}
        <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/60">
          <p className="text-xs text-stone-600 font-medium">
            Detalle por operario y desglose de tipo de acompañamiento recibido:
          </p>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
                <th className="py-2.5 px-4 min-w-[240px] uppercase text-[11px]">
                  NOMBRE
                </th>

                {/* Tipos de Acompañamiento en Horizontal */}
                {tiposAcompanamientoDisponibles.map((tipo) => (
                  <th key={tipo} className="py-2.5 px-3 text-center min-w-[120px] font-bold text-[11px]">
                    {tipo}
                  </th>
                ))}

                <th className="py-2.5 px-4 text-center font-bold text-[11px] bg-stone-200/70 text-stone-900 min-w-[90px]">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-200">
              {matrixData.length > 0 ? (
                <>
                  {matrixData.map((row, idx) => (
                    <tr
                      key={row.codigo + row.nombre + idx}
                      className={idx % 2 === 1 ? 'bg-stone-100/40 hover:bg-stone-100/80 transition-colors' : 'hover:bg-stone-100/80 transition-colors'}
                    >
                      {/* NOMBRE en Mayúsculas */}
                      <td className="py-2.5 px-4 font-bold text-stone-800 tracking-wide uppercase">
                        {row.nombre}
                      </td>

                      {/* Conteos por Tipo de Acompañamiento */}
                      {tiposAcompanamientoDisponibles.map((tipo) => {
                        const count = row.countsByTipo[tipo] || 0;
                        return (
                          <td key={tipo} className="py-2.5 px-3 text-center font-medium text-stone-700">
                            {count > 0 ? count : '-'}
                          </td>
                        );
                      })}

                      {/* Total por Persona */}
                      <td className="py-2.5 px-4 text-center font-bold text-stone-900 bg-stone-100/50">
                        {row.totalSesiones}
                      </td>
                    </tr>
                  ))}

                  {/* Summary Row at Bottom (Total) */}
                  <tr className="bg-stone-200/90 font-bold border-t-2 border-stone-300 text-stone-900">
                    <td className="py-3 px-4 font-bold text-stone-900 uppercase">
                      Total
                    </td>
                    {tiposAcompanamientoDisponibles.map((tipo) => (
                      <td key={`total-${tipo}`} className="py-3 px-3 text-center font-bold text-stone-900">
                        {tableTotals.columnSums[tipo] || 0}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center font-extrabold text-stone-900 bg-stone-300/60">
                      {tableTotals.grandTotal}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={2 + tiposAcompanamientoDisponibles.length} className="py-8 text-center text-stone-400">
                    No se encontraron registros de acompañamiento para los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <div>
            Mostrando <strong className="text-stone-800">{matrixData.length}</strong> operarios con registro de acompañamiento poscosecha.
          </div>
          <div className="text-[11px] text-stone-400 font-medium">
            Actualizado según filtros seleccionados
          </div>
        </div>

      </div>
    </div>
  );
};
