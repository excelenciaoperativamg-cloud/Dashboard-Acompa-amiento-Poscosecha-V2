import React, { useState, useMemo } from 'react';
import {
  Route,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Users,
  Download,
  Search,
  Filter,
  Activity,
  Calendar,
  FileSpreadsheet,
  Clock,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ConsolidadoPriorizacion,
  RegistroBajoIndicador,
  PersonaMatricula
} from '../types';
import {
  calcularMetricasCumplimientoSupRuta,
  OperarioCumplimientoSupRuta
} from '../utils/cumplimientoSupRuta';

interface TarjetaCumplimientoSupRutaProps {
  consolidadoList: ConsolidadoPriorizacion[];
  bajosIndicadores: RegistroBajoIndicador[];
  matriculas?: PersonaMatricula[];
  semanaSeleccionada: string;
  compact?: boolean;
  className?: string;
}

export const TarjetaCumplimientoSupRuta: React.FC<TarjetaCumplimientoSupRutaProps> = ({
  consolidadoList,
  bajosIndicadores,
  matriculas = [],
  semanaSeleccionada,
  compact = false,
  className = ''
}) => {
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');
  const [operarioExpandido, setOperarioExpandido] = useState<string | null>(null);

  // Calcular métricas
  const metricas = useMemo(() => {
    return calcularMetricasCumplimientoSupRuta(
      consolidadoList,
      bajosIndicadores,
      matriculas,
      semanaSeleccionada
    );
  }, [consolidadoList, bajosIndicadores, matriculas, semanaSeleccionada]);

  // Filtrar operarios dentro del modal
  const operariosFiltrados = useMemo(() => {
    return metricas.desgloseOperarios.filter((op) => {
      if (estadoFiltro !== 'TODOS' && op.estado !== estadoFiltro) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchNom = op.nombre.toLowerCase().includes(q);
        const matchCod = op.codigo.toLowerCase().includes(q);
        const matchLab = op.labor.toLowerCase().includes(q);
        const matchSup = op.supervisor.toLowerCase().includes(q);
        if (!matchNom && !matchCod && !matchLab && !matchSup) return false;
      }
      return true;
    });
  }, [metricas.desgloseOperarios, estadoFiltro, searchQuery]);

  // Regla de color: En rojo cuando es menor a la meta, si es mayor o igual dejar el dato en negro
  const esCumplido = metricas.porcentajeCumplimiento >= 100;
  const porcentajeColor = esCumplido ? 'text-black font-semibold' : 'text-red-600 font-bold';

  const getEstadoBadge = (estado: 'Cumplido' | 'En Proceso' | 'Pendiente' | 'Sobresaliente' | 'En meta' | 'Por reforzar') => {
    switch (estado) {
      case 'Cumplido':
      case 'Sobresaliente':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500',
          text: 'text-emerald-700'
        };
      case 'En Proceso':
      case 'En meta':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          bar: 'bg-amber-500',
          text: 'text-amber-700'
        };
      case 'Pendiente':
      case 'Por reforzar':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          bar: 'bg-rose-500',
          text: 'text-rose-700'
        };
    }
  };

  const globalBadge = getEstadoBadge(metricas.estadoGlobal);

  // Exportar detalle a Excel
  const exportarExcel = () => {
    const headers = [
      'Semana',
      'Código',
      'Nombre Operario',
      'Labor',
      'Supervisor de Ruta',
      'Formador / Proceso',
      '% Calidad Consolidada',
      'Meta Requerida (Sup. Ruta)',
      'Acompañamientos Ejecutados (Bajos Indicadores)',
      '% Cumplimiento',
      'Estado',
      'Última Fecha Acompañamiento',
      'Tipos de Acompañamiento Recibidos'
    ];

    const rows = metricas.desgloseOperarios.map((op) => [
      semanaSeleccionada || 'Todas',
      op.codigo,
      op.nombre,
      op.labor,
      op.supervisor,
      op.formador,
      op.calidadPorcentaje !== undefined ? `${op.calidadPorcentaje}%` : 'S/D',
      op.requeridoSupRuta,
      op.ejecutadosBajosIndicadores,
      `${op.porcentajeCumplimiento}%`,
      op.estado,
      op.ultimaFecha || '-',
      op.tiposAcompanamiento.join(', ') || 'Sin registro'
    ]);

    // Hoja 2: Supervisores
    const headersSup = [
      'Semana',
      'Supervisor',
      'Operarios Asignados',
      'Acompañamientos Requeridos (Meta)',
      'Acompañamientos Realizados (Bajos Indicadores)',
      '% Cumplimiento',
      'Estado'
    ];

    const rowsSup = metricas.desgloseSupervisores.map((s) => [
      semanaSeleccionada || 'Todas',
      s.supervisor,
      s.operariosAsignados,
      s.requeridos,
      s.ejecutados,
      `${s.porcentaje}%`,
      s.estado
    ]);

    const workbook = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws1['!cols'] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 30 },
      { wch: 22 },
      { wch: 24 },
      { wch: 22 },
      { wch: 18 },
      { wch: 24 },
      { wch: 30 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 35 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws1, 'Detalle Operarios');

    if (rowsSup.length > 0) {
      const ws2 = XLSX.utils.aoa_to_sheet([headersSup, ...rowsSup]);
      ws2['!cols'] = [
        { wch: 12 },
        { wch: 28 },
        { wch: 18 },
        { wch: 28 },
        { wch: 30 },
        { wch: 16 },
        { wch: 16 }
      ];
      XLSX.utils.book_append_sheet(workbook, ws2, 'Resumen Supervisores');
    }

    XLSX.writeFile(
      workbook,
      `Cumplimiento_SupRuta_BajosIndicadores_${semanaSeleccionada || 'General'}.xlsx`
    );
  };

  return (
    <>
      {/* MODO COMPACTO (Para integrarse en la barra de tarjetas KPI) */}
      {compact ? (
        <div
          id="kpi-card-cumplimiento-sup-ruta"
          onClick={() => setModalAbierto(true)}
          className={`bg-white border border-stone-200 border-t-3 border-t-[#0a2958] rounded-xl p-4 flex items-center gap-3 shadow-xs hover:border-[#0a2958] hover:shadow-xs transition-all cursor-pointer group ${className}`}
          title="Click para ver la relación entre acompañamientos SUP. RUTA y Bajos Indicadores"
        >
          <div className="p-3 bg-[#0a2958]/10 text-[#0a2958] rounded-xl group-hover:scale-105 transition-transform shrink-0">
            <Route className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#0a2958] truncate">Cumplimiento SUP. RUTA</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${globalBadge.bg}`}>
                {metricas.estadoGlobal}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <p className={`text-xl font-serif ${porcentajeColor}`}>
                {metricas.porcentajeCumplimiento}%
              </p>
              <span className="text-[11px] text-stone-500 font-medium">
                {metricas.realizadosTotal}/{metricas.metaTotalSupRuta} acomp.
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  esCumplido ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, metricas.porcentajeCumplimiento)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* MODO DESTACADO COMPLETO (Banner / Tarjeta destacada en Gestión Bajos Indicadores) */
        <div className={`bg-white border border-stone-200 rounded-xl p-5 shadow-xs ${className}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0a2958]/10 text-[#0a2958] rounded-xl border border-[#0a2958]/20">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    Cumplimiento Acompañamientos: SUP. RUTA vs Bajos Indicadores
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${globalBadge.bg}`}>
                    {metricas.estadoGlobal}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Semana {semanaSeleccionada || 'Todas'} • Relación entre metas de acompañamiento (SUP. RUTA) e intervenciones ejecutadas en Bajos Indicadores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalAbierto(true)}
                className="px-3 py-1.5 bg-[#0a2958] hover:bg-[#082046] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Ver Relación Detallada</span>
              </button>
            </div>
          </div>

          {/* Estadísticas de 4 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 pt-1">
            
            {/* KPI 1: % Cumplimiento Global (Regla de color: rojo si menor a meta, negro si >= meta) */}
            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                % Cumplimiento Global
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-serif ${porcentajeColor}`}>
                  {metricas.porcentajeCumplimiento}%
                </span>
                <span className="text-xs text-stone-500 font-medium">alcanzado</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    esCumplido ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, metricas.porcentajeCumplimiento)}%` }}
                />
              </div>
            </div>

            {/* KPI 2: Realizados en Bajos Indicadores */}
            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                Acompañamientos Realizados
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-serif text-stone-900">
                  {metricas.realizadosTotal}
                </span>
                <span className="text-xs text-stone-500 font-medium">ejecutados</span>
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Registrados en Bajos_Indicadores
              </span>
            </div>

            {/* KPI 3: Meta Requerida SUP. RUTA */}
            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                Meta SUP. RUTA Requerida
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-serif text-stone-900">
                  {metricas.metaTotalSupRuta}
                </span>
                <span className="text-xs text-stone-500 font-medium">requeridos</span>
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Operarios Calidad &lt; 90% (En desarrollo/obs)
              </span>
            </div>

            {/* KPI 4: Operarios Atendidos vs Pendientes */}
            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                Cobertura de Operarios
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-serif text-stone-900">
                  {metricas.operariosAtendidos}/{metricas.operariosRequeridos}
                </span>
                <span className="text-xs text-stone-500 font-medium">atendidos</span>
              </div>
              <span className={`text-[11px] mt-1 block font-semibold ${metricas.operariosPendientes > 0 ? 'text-red-600' : 'text-stone-500'}`}>
                {metricas.operariosPendientes > 0
                  ? `${metricas.operariosPendientes} pendiente(s) de acompañamiento`
                  : '100% de operarios con intervención'}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DETALLADO DE CUMPLIMIENTO SUP. RUTA VS BAJOS INDICADORES */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0a2958] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Route className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif">
                    Cumplimiento de Acompañamientos: SUP. RUTA vs Bajos Indicadores
                  </h3>
                  <p className="text-xs text-stone-200">
                    Semana {semanaSeleccionada || 'Todas'} • Contraste entre Meta de Acompañamiento SUP. RUTA y Acompañamientos Registrados en Bajos_Indicadores
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalAbierto(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              
              {/* Banner de resumen global */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Cumplimiento Global</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    {/* Regla de color: rojo si menor a meta, negro si >= meta */}
                    <span className={`text-2xl font-serif ${porcentajeColor}`}>
                      {metricas.porcentajeCumplimiento}%
                    </span>
                    <span className="text-[10px] text-stone-500">alcanzado</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        esCumplido ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, metricas.porcentajeCumplimiento)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Acomp. Realizados</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-stone-900">
                      {metricas.realizadosTotal}
                    </span>
                    <span className="text-[10px] text-stone-500">sesiones</span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">En Bajos_Indicadores</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Meta SUP. RUTA</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-stone-900">
                      {metricas.metaTotalSupRuta}
                    </span>
                    <span className="text-[10px] text-stone-500">programados</span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">Acomp/sem requeridos</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase">Estado Cobertura</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-stone-900">
                      {metricas.operariosAtendidos}/{metricas.operariosRequeridos}
                    </span>
                    <span className="text-[10px] text-stone-500">operarios</span>
                  </div>
                  <span className={`text-[11px] mt-1 block font-semibold ${metricas.operariosPendientes > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {metricas.operariosPendientes > 0
                      ? `${metricas.operariosPendientes} pendiente(s)`
                      : 'Todos acompañados'}
                  </span>
                </div>
              </div>

              {/* Filtros dentro del modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar operario, código, labor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:ring-2 focus:ring-[#0a2958] focus:outline-none w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-stone-400" />
                    <select
                      value={estadoFiltro}
                      onChange={(e) => setEstadoFiltro(e.target.value)}
                      className="bg-transparent font-medium text-stone-700 focus:outline-none cursor-pointer"
                    >
                      <option value="TODOS">Todos los estados</option>
                      <option value="Cumplido">Cumplidos (≥100%)</option>
                      <option value="En Proceso">En Proceso (&gt;0% y &lt;100%)</option>
                      <option value="Pendiente">Pendientes (Sin Acompañamiento)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportarExcel}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>

              {/* Tabla Detallada de Operarios */}
              <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0a2958]/5 text-stone-700 uppercase font-bold text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Operario</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Labor</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px]">% Calidad</th>
                        <th className="py-2.5 px-3 text-center min-w-[90px]">Meta SUP. RUTA</th>
                        <th className="py-2.5 px-3 text-center min-w-[120px]">Realizados Bajos Ind.</th>
                        <th className="py-2.5 px-3 text-center min-w-[100px]">% Cumplimiento</th>
                        <th className="py-2.5 px-3 text-center min-w-[100px]">Estado</th>
                        <th className="py-2.5 px-3 min-w-[160px]">Último Acompañamiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {operariosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-stone-400 text-xs">
                            No se encontraron operarios con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        operariosFiltrados.map((op, idx) => {
                          const opBadge = getEstadoBadge(op.estado);
                          // Regla de color del usuario: Si es menor a la meta en rojo, si es mayor o igual en negro
                          const opCumplido = op.porcentajeCumplimiento >= 100;
                          const opColorPct = opCumplido ? 'text-black font-semibold' : 'text-red-600 font-bold';

                          return (
                            <tr
                              key={`${op.codigo}-${op.nombre}-${op.labor}-${idx}`}
                              className={`hover:bg-stone-50/80 transition-colors ${
                                op.estado === 'Pendiente' ? 'bg-rose-50/20' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 font-mono text-stone-600 font-semibold">
                                {op.codigo}
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="font-bold text-stone-900">{op.nombre}</div>
                                <div className="text-[10px] text-stone-400">
                                  Sup: {op.supervisor}
                                </div>
                              </td>

                              <td className="py-2.5 px-3 text-stone-600">
                                {op.labor}
                              </td>

                              {/* % Calidad (en rojo si < 90%) */}
                              <td className="py-2.5 px-3 text-center">
                                {op.calidadPorcentaje !== undefined ? (
                                  <span
                                    className={`font-mono ${
                                      op.calidadPorcentaje < 90
                                        ? 'text-red-600 font-bold'
                                        : 'text-black font-semibold'
                                    }`}
                                  >
                                    {op.calidadPorcentaje}%
                                  </span>
                                ) : (
                                  <span className="text-stone-400">-</span>
                                )}
                              </td>

                              {/* Meta SUP. RUTA */}
                              <td className="py-2.5 px-3 text-center font-bold text-stone-900 font-serif">
                                {op.requeridoSupRuta}
                              </td>

                              {/* Realizados en Bajos Indicadores */}
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold font-serif ${
                                    op.ejecutadosBajosIndicadores > 0
                                      ? 'bg-stone-100 text-stone-900'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {op.ejecutadosBajosIndicadores}
                                </span>
                              </td>

                              {/* % Cumplimiento (Regla de color: rojo si menor a meta, negro si >= meta) */}
                              <td className="py-2.5 px-3 text-center font-mono">
                                <span className={opColorPct}>
                                  {op.porcentajeCumplimiento}%
                                </span>
                              </td>

                              {/* Estado Badge */}
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${opBadge.bg}`}
                                >
                                  {op.estado}
                                </span>
                              </td>

                              {/* Último acompañamiento registrado */}
                              <td className="py-2.5 px-3 text-[11px] text-stone-600">
                                {op.acompanamientosDetalle.length > 0 ? (
                                  <div>
                                    <div className="font-medium text-stone-800">
                                      {op.tiposAcompanamiento.join(', ') || 'Acompañamiento'}
                                    </div>
                                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {op.ultimaFecha || 'Fecha reciente'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-stone-400 italic">Sin acompañamiento</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0a2958]" />
                <span>
                  Relación calculada entre los operarios que requieren acompañamiento de ruta (Calidad &lt; 90%) y los registros en la hoja Bajos_Indicadores.
                </span>
              </span>

              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors cursor-pointer self-end"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
