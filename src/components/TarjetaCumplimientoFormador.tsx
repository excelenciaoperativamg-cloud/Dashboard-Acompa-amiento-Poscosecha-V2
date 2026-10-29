import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Users,
  Download,
  Search,
  Filter,
  BarChart2,
  FileSpreadsheet,
  Check,
  TrendingUp,
  Activity
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ConsolidadoPriorizacion,
  RegistroBajoIndicador,
  PersonaMatricula,
  ResumenCumplimientoFormador
} from '../types';
import {
  calcularMetricasCumplimientoFormador,
  calcularMetricasAcompanamientoBajosFormador
} from '../utils/cumplimientoFormador';

interface TarjetaCumplimientoFormadorProps {
  data: ConsolidadoPriorizacion[];
  semanaSeleccionada: string;
  bajosIndicadores?: RegistroBajoIndicador[];
  matriculas?: PersonaMatricula[];
  compact?: boolean;
  className?: string;
  modo?: 'evaluaciones' | 'acompanamientos_bajos';
}

export const TarjetaCumplimientoFormador: React.FC<TarjetaCumplimientoFormadorProps> = ({
  data,
  semanaSeleccionada,
  bajosIndicadores = [],
  matriculas = [],
  compact = true,
  className = '',
  modo = 'evaluaciones'
}) => {
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [formadorExpandido, setFormadorExpandido] = useState<string | null>(null);
  const [searchFormador, setSearchFormador] = useState<string>('');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');
  const [copiado, setCopiado] = useState<boolean>(false);

  const esModoBajos = modo === 'acompanamientos_bajos';

  // Calcular métricas completas según el modo
  const metricas = useMemo(() => {
    if (esModoBajos) {
      return calcularMetricasAcompanamientoBajosFormador(
        data,
        semanaSeleccionada,
        bajosIndicadores,
        matriculas
      );
    }
    return calcularMetricasCumplimientoFormador(
      data,
      semanaSeleccionada,
      bajosIndicadores,
      matriculas
    );
  }, [data, semanaSeleccionada, bajosIndicadores, matriculas, esModoBajos]);

  // Filtrar desglose en el modal
  const formadoresFiltrados = useMemo(() => {
    return metricas.desgloseFormadores.filter((f) => {
      if (estadoFiltro !== 'TODOS' && f.estado !== estadoFiltro) {
        return false;
      }
      if (searchFormador.trim() !== '') {
        const q = searchFormador.toLowerCase().trim();
        const matchFormador = f.formador.toLowerCase().includes(q);
        const matchOp = f.operarios.some(
          (op) => op.nombre.toLowerCase().includes(q) || op.codigo.toLowerCase().includes(q)
        );
        if (!matchFormador && !matchOp) return false;
      }
      return true;
    });
  }, [metricas.desgloseFormadores, estadoFiltro, searchFormador]);

  // Estilos según el estado de cumplimiento
  const getEstadoBadge = (estado: 'Sobresaliente' | 'En meta' | 'Por reforzar') => {
    switch (estado) {
      case 'Sobresaliente':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-500',
          text: 'text-emerald-700'
        };
      case 'En meta':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          bar: 'bg-amber-500',
          text: 'text-amber-700'
        };
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

  const globalStyle = getEstadoBadge(metricas.estadoGlobal);

  // Exportar a Excel
  const exportarExcelCumplimiento = () => {
    const headers = esModoBajos
      ? [
          'Semana',
          'Formador / Entrenador',
          'Operarios Asignados con Bajo Indicador',
          'Acompañamientos Indicados (Meta)',
          'Acompañamientos Ejecutados en Bajos_Indicadores',
          '% Cumplimiento',
          'Estado'
        ]
      : [
          'Semana',
          'Formador / Entrenador',
          'Operarios Asignados',
          'Evaluaciones Requeridas (Meta)',
          'Evaluaciones Ejecutadas (Total)',
          'Eval. Rendimiento',
          'Eval. Calidad',
          'Acompañamientos Bajos Indicadores',
          '% Cumplimiento',
          'Estado'
        ];

    const rows = metricas.desgloseFormadores.map((f) =>
      esModoBajos
        ? [
            semanaSeleccionada || 'Todas',
            f.formador,
            f.operariosAtendidos,
            f.evaluacionesRequeridas,
            f.evaluacionesEjecutadas,
            `${f.porcentajeCumplimiento}%`,
            f.estado
          ]
        : [
            semanaSeleccionada || 'Todas',
            f.formador,
            f.operariosAtendidos,
            f.evaluacionesRequeridas,
            f.evaluacionesEjecutadas,
            f.rendimientoEjecutadas,
            f.calidadEjecutadas,
            f.acompanamientosEjecutados,
            `${f.porcentajeCumplimiento}%`,
            f.estado
          ]
    );

    // Hoja 2: Detalle por Operario
    const headersOp = esModoBajos
      ? [
          'Semana',
          'Formador',
          'Código Operario',
          'Nombre Operario',
          'Labor',
          'Motivo Bajo Indicador',
          'Acomp. Indicados',
          'Acomp. Ejecutados en Bajos_Indicadores',
          'Detalle Acompañamiento Registrado',
          'Estado'
        ]
      : [
          'Semana',
          'Formador',
          'Código Operario',
          'Nombre Operario',
          'Labor',
          'Evaluaciones Requeridas',
          'Evaluaciones Ejecutadas',
          'Eval. Rendimiento',
          'Eval. Calidad',
          '% Cumplimiento Operario'
        ];

    const rowsOp: any[] = [];
    metricas.desgloseFormadores.forEach((f) => {
      f.operarios.forEach((op) => {
        if (esModoBajos) {
          const detalleAcomp =
            op.detallesAcompanamiento && op.detallesAcompanamiento.length > 0
              ? op.detallesAcompanamiento
                  .map(
                    (d) =>
                      `${d.fecha || ''} [${d.tipoAcompanamiento || ''}] ${d.razon || ''} ${d.compromiso || ''}`.trim()
                  )
                  .join(' | ')
              : 'Sin registro en Bajos_Indicadores';

          rowsOp.push([
            semanaSeleccionada || 'Todas',
            f.formador,
            op.codigo,
            op.nombre,
            op.labor,
            op.motivoBajoIndicador || op.tipoBajoIndicador || '-',
            op.requeridas,
            op.ejecutadas,
            detalleAcomp,
            op.ejecutadas > 0 ? 'Acompañado' : 'Pendiente'
          ]);
        } else {
          rowsOp.push([
            semanaSeleccionada || 'Todas',
            f.formador,
            op.codigo,
            op.nombre,
            op.labor,
            op.requeridas,
            op.ejecutadas,
            op.rendimientoCount,
            op.calidadCount,
            `${op.porcentaje}%`
          ]);
        }
      });
    });

    const workbook = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws1['!cols'] = [
      { wch: 12 },
      { wch: 28 },
      { wch: 22 },
      { wch: 26 },
      { wch: 26 },
      { wch: 18 },
      { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(workbook, ws1, 'Resumen Formadores');

    if (rowsOp.length > 0) {
      const ws2 = XLSX.utils.aoa_to_sheet([headersOp, ...rowsOp]);
      ws2['!cols'] = [
        { wch: 12 },
        { wch: 26 },
        { wch: 16 },
        { wch: 32 },
        { wch: 22 },
        { wch: 26 },
        { wch: 18 },
        { wch: 24 },
        { wch: 36 },
        { wch: 16 }
      ];
      XLSX.utils.book_append_sheet(workbook, ws2, 'Detalle Operarios');
    }

    XLSX.writeFile(
      workbook,
      esModoBajos
        ? `Cumplimiento_Acompanamientos_Formador_${semanaSeleccionada || 'General'}.xlsx`
        : `Cumplimiento_Evaluaciones_Formador_${semanaSeleccionada || 'General'}.xlsx`
    );
  };

  return (
    <>
      {/* TARJETA COMPACTA (Para incluir en KPICards o barras de resumen) */}
      {compact ? (
        <div
          id="kpi-card-cumplimiento-formador"
          onClick={() => setModalAbierto(true)}
          className={`bg-white px-3.5 py-2.5 rounded-xl border border-stone-200 border-t-3 border-t-emerald-600 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-emerald-500 hover:shadow-xs transition-all duration-150 group ${className}`}
          title={esModoBajos ? "Click para ver los acompañamientos indicados vs ejecutados en Bajos Indicadores por formador" : "Click para ver el desglose detallado de cumplimiento por formador"}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              {esModoBajos ? 'Acompañamientos Formador' : 'Cumplimiento Formador'}
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${globalStyle.bg}`}>
                {metricas.estadoGlobal}
              </span>
              <Award className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* Valor Principal & Subtítulo */}
          <div className="flex items-baseline justify-between mt-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold font-serif ${globalStyle.text}`}>
                {metricas.porcentajeCumplimiento}%
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {metricas.totalEjecutadas}/{metricas.totalRequeridas} {esModoBajos ? 'acomp.' : 'evals.'}
              </span>
            </div>

            <span className="text-[10px] text-stone-400 group-hover:text-emerald-700 font-medium flex items-center transition-colors">
              Detalle <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>

          <div className="text-[10px] text-stone-400 truncate mt-0.5 font-sans">
            {esModoBajos ? 'Indicados por programa vs. Bajos Indicadores' : `${metricas.formadoresActivos} formadores activos`}
          </div>

          {/* Barra de progreso micro */}
          <div className="mt-1 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${globalStyle.bar}`}
              style={{ width: `${Math.min(100, metricas.porcentajeCumplimiento)}%` }}
            />
          </div>
        </div>
      ) : (
        /* TARJETA DESTACADA COMPLETA (Para vistas ampliadas o encabezados) */
        <div className={`bg-white border border-stone-200 rounded-xl p-5 shadow-xs ${className}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    {esModoBajos ? 'Cumplimiento de Acompañamientos por Formador' : 'Cumplimiento de Evaluaciones del Formador'}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${globalStyle.bg}`}>
                    {metricas.estadoGlobal}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Semana {semanaSeleccionada || 'Todas'} • {esModoBajos ? 'Acompañamientos indicados por el programa vs. Ejecutados en Bajos Indicadores' : `${metricas.formadoresActivos} Formadores activos`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalAbierto(true)}
                className="px-3 py-1.5 bg-[#0a2958] hover:bg-[#082046] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Ver Desglose por Formador</span>
              </button>
            </div>
          </div>

          {/* Estadísticas de la tarjeta destacada */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 pt-1">
            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                % Cumplimiento Global
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-bold font-serif ${globalStyle.text}`}>
                  {metricas.porcentajeCumplimiento}%
                </span>
                <span className="text-xs text-stone-500 font-medium">{esModoBajos ? 'ejecutado' : 'de la meta'}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${globalStyle.bar}`}
                  style={{ width: `${Math.min(100, metricas.porcentajeCumplimiento)}%` }}
                />
              </div>
            </div>

            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                {esModoBajos ? 'Acompañamientos Ejecutados' : 'Evaluaciones Ejecutadas'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-serif text-stone-900">
                  {metricas.totalEjecutadas}
                </span>
                <span className="text-xs text-stone-500 font-medium">realizados</span>
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                {esModoBajos ? 'Registrados en Bajos Indicadores' : 'Solo Formadores (Excluye Supervisores)'}
              </span>
            </div>

            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                {esModoBajos ? 'Acompañamientos Indicados' : 'Evaluaciones Requeridas'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-serif text-stone-900">
                  {metricas.totalRequeridas}
                </span>
                <span className="text-xs text-stone-500 font-medium">por programa</span>
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                {esModoBajos ? 'Operarios con Bajo Indicador' : 'Solo matriz #AF/Día Formador'}
              </span>
            </div>

            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/70">
              <span className="text-[11px] font-medium text-stone-500 block uppercase tracking-wider">
                Formadores Activos
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-serif text-emerald-700">
                  {metricas.formadoresActivos}
                </span>
                <span className="text-xs text-stone-500 font-medium">entrenadores</span>
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                {metricas.operariosCubiertos} {esModoBajos ? 'operarios atendidos' : 'operarios asignados'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLADO DE CUMPLIMIENTO POR FORMADOR */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0a2958] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Award className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-2">
                    {esModoBajos
                      ? 'Cumplimiento de Acompañamientos por Formador (Entrenador)'
                      : 'Cumplimiento de Evaluaciones Ejecutadas por Formador'}
                  </h3>
                  <p className="text-xs text-stone-200">
                    {esModoBajos
                      ? `Semana ${semanaSeleccionada || 'Todas'} • Acompañamientos indicados por programa vs. Ejecutados en Bajos_Indicadores`
                      : `Semana ${semanaSeleccionada || 'Todas'}`}
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
                    <span className={`text-2xl font-bold font-serif ${globalStyle.text}`}>
                      {metricas.porcentajeCumplimiento}%
                    </span>
                    <span className="text-[10px] text-stone-500">alcanzado</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${globalStyle.bar}`}
                      style={{ width: `${Math.min(100, metricas.porcentajeCumplimiento)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase">
                    {esModoBajos ? 'Acompañamientos Ejecutados' : 'Evaluaciones Ejecutadas'}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-stone-900">
                      {metricas.totalEjecutadas}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {esModoBajos ? 'acompañamientos' : 'evaluaciones'}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {esModoBajos ? 'En tabla Bajos_Indicadores' : 'Formador (Sin Supervisores)'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase">
                    {esModoBajos ? 'Acompañamientos Indicados' : 'Meta Requerida'}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-stone-900">
                      {metricas.totalRequeridas}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {esModoBajos ? 'indicados' : 'evaluaciones'}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {esModoBajos ? 'Operarios con Bajo Indicador' : 'Solo #AF/Día Formador'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase">
                    {esModoBajos ? 'Formadores / Entrenadores' : 'Formadores / Cobertura'}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-serif text-emerald-700">
                      {metricas.formadoresActivos}
                    </span>
                    <span className="text-[10px] text-stone-500">formadores</span>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {metricas.operariosCubiertos} {esModoBajos ? 'operarios atendidos' : 'operarios cubiertos'}
                  </span>
                </div>
              </div>

              {/* Filtros dentro del modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar formador u operario..."
                      value={searchFormador}
                      onChange={(e) => setSearchFormador(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:ring-2 focus:ring-[#7C816F] focus:outline-none w-56"
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
                      <option value="Sobresaliente">Sobresaliente (≥90%)</option>
                      <option value="En meta">En meta (80-89%)</option>
                      <option value="Por reforzar">Por reforzar (&lt;80%)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportarExcelCumplimiento}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>

              {/* Listado de Formadores */}
              <div className="space-y-3">
                {formadoresFiltrados.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    No se encontraron formadores con los filtros seleccionados.
                  </div>
                ) : (
                  formadoresFiltrados.map((formador, fIdx) => {
                    const fStyle = getEstadoBadge(formador.estado);
                    const estaExpandido = formadorExpandido === formador.formador;

                    return (
                      <div
                        key={`${formador.formador}-${fIdx}`}
                        className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:border-stone-300 transition-colors"
                      >
                        {/* Cabecera del Formador */}
                        <div
                          onClick={() =>
                            setFormadorExpandido(estaExpandido ? null : formador.formador)
                          }
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-white hover:bg-stone-50/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0a2958]/10 text-[#0a2958] flex items-center justify-center font-bold text-xs font-serif shrink-0">
                              {formador.formador
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-stone-900 text-sm">
                                  {formador.formador}
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fStyle.bg}`}
                                >
                                  {formador.estado}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500">
                                {formador.operariosAtendidos} operarios {esModoBajos ? 'con bajo indicador' : 'a cargo'} •{' '}
                                {esModoBajos ? (
                                  <>
                                    <span className="font-semibold text-emerald-700">
                                      {formador.evaluacionesEjecutadas} ejecutados
                                    </span>{' '}
                                    en Bajos_Indicadores de {formador.evaluacionesRequeridas} indicados
                                  </>
                                ) : (
                                  <>
                                    {formador.rendimientoEjecutadas} Rend. • {formador.calidadEjecutadas} Cal.{' '}
                                    {formador.acompanamientosEjecutados > 0 &&
                                      `• ${formador.acompanamientosEjecutados} Acomp.`}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <div className="flex items-baseline justify-end gap-1.5">
                                <span className={`text-xl font-bold font-serif ${fStyle.text}`}>
                                  {formador.porcentajeCumplimiento}%
                                </span>
                                <span className="text-xs text-stone-500 font-medium">
                                  ({formador.evaluacionesEjecutadas}/{formador.evaluacionesRequeridas}{' '}
                                  {esModoBajos ? 'acomp.' : 'eval.'})
                                </span>
                              </div>
                              <div className="w-36 bg-stone-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${fStyle.bar}`}
                                  style={{
                                    width: `${Math.min(100, formador.porcentajeCumplimiento)}%`
                                  }}
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              className="text-stone-400 hover:text-stone-600 p-1"
                              aria-label="Expandir operarios"
                            >
                              {estaExpandido ? (
                                <ChevronDown className="w-4 h-4 text-stone-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-stone-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Operarios del Formador (Desplegable) */}
                        {estaExpandido && (
                          <div className="bg-stone-50/70 border-t border-stone-200 p-4">
                            <h5 className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                              <span>
                                {esModoBajos
                                  ? 'Operarios con Bajo Indicador y Acompañamientos Ejecutados'
                                  : 'Operarios Evaluados y Nivel de Cumplimiento'}
                              </span>
                              <span className="text-[10px] text-stone-400 font-normal">
                                {formador.operarios.length} registros
                              </span>
                            </h5>

                            <div className="overflow-x-auto">
                              {esModoBajos ? (
                                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden bg-white">
                                  <thead className="bg-stone-100/70 text-stone-600 text-[10px] uppercase font-bold border-b border-stone-200">
                                    <tr>
                                      <th className="py-2 px-3">Código</th>
                                      <th className="py-2 px-3">Operario</th>
                                      <th className="py-2 px-3">Labor</th>
                                      <th className="py-2 px-3">Motivo Bajo Indicador</th>
                                      <th className="py-2 px-3 text-center">Acomp. Ejecutados</th>
                                      <th className="py-2 px-3">Acompañamiento en Bajos_Indicadores</th>
                                      <th className="py-2 px-3 text-right">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-100">
                                    {formador.operarios.map((op, opIdx) => {
                                      const estaAcompanado = op.ejecutadas > 0;
                                      return (
                                        <tr
                                          key={`${op.codigo || ''}-${op.nombre || ''}-${opIdx}`}
                                          className="hover:bg-stone-50/50"
                                        >
                                          <td className="py-2 px-3 font-mono text-stone-600">
                                            {op.codigo || '-'}
                                          </td>
                                          <td className="py-2 px-3 font-medium text-stone-900">
                                            {op.nombre}
                                          </td>
                                          <td className="py-2 px-3 text-stone-600">
                                            {op.labor}
                                          </td>
                                          <td className="py-2 px-3">
                                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                              {op.motivoBajoIndicador || op.tipoBajoIndicador || 'Bajo Indicador'}
                                            </span>
                                          </td>
                                          <td className="py-2 px-3 text-center font-bold text-stone-900">
                                            {op.ejecutadas}
                                          </td>
                                          <td className="py-2 px-3 text-stone-600 text-[11px]">
                                            {op.detallesAcompanamiento && op.detallesAcompanamiento.length > 0 ? (
                                              <div className="space-y-1">
                                                {op.detallesAcompanamiento.map((det, dIdx) => (
                                                  <div
                                                    key={dIdx}
                                                    className="flex flex-wrap items-center gap-1.5"
                                                  >
                                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                                                      {det.fecha || 'Fecha N/D'}: {det.tipoAcompanamiento || 'Acompañamiento'}
                                                    </span>
                                                    {det.compromiso && (
                                                      <span className="text-stone-500 italic">
                                                        "{det.compromiso}"
                                                      </span>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-stone-400 italic">
                                                Pendiente de registro en Bajos_Indicadores
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-right">
                                            {estaAcompanado ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Acompañado
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                                <AlertTriangle className="w-3 h-3" />
                                                Pendiente
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden bg-white">
                                  <thead className="bg-stone-100/70 text-stone-600 text-[10px] uppercase font-bold border-b border-stone-200">
                                    <tr>
                                      <th className="py-2 px-3">Código</th>
                                      <th className="py-2 px-3">Operario</th>
                                      <th className="py-2 px-3">Labor</th>
                                      <th className="py-2 px-3 text-center">Requeridas</th>
                                      <th className="py-2 px-3 text-center">Ejecutadas</th>
                                      <th className="py-2 px-3 text-center">Rend / Cal</th>
                                      <th className="py-2 px-3 text-right">% Cumplimiento</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-100">
                                    {formador.operarios.map((op, opIdx) => {
                                      const opPct = op.porcentaje;
                                      const opColor =
                                        opPct >= 90
                                          ? 'text-emerald-700'
                                          : opPct >= 80
                                          ? 'text-amber-700'
                                          : 'text-rose-700';

                                      return (
                                        <tr
                                          key={`${op.codigo || ''}-${op.nombre || ''}-${op.labor || ''}-${opIdx}`}
                                          className="hover:bg-stone-50/50"
                                        >
                                          <td className="py-2 px-3 font-mono text-stone-600">
                                            {op.codigo || '-'}
                                          </td>
                                          <td className="py-2 px-3 font-medium text-stone-900">
                                            {op.nombre}
                                          </td>
                                          <td className="py-2 px-3 text-stone-600">
                                            {op.labor}
                                          </td>
                                          <td className="py-2 px-3 text-center text-stone-700 font-semibold">
                                            {op.requeridas}
                                          </td>
                                          <td className="py-2 px-3 text-center text-stone-900 font-bold">
                                            {op.ejecutadas}
                                          </td>
                                          <td className="py-2 px-3 text-center text-stone-500 text-[11px]">
                                            {op.rendimientoCount}R / {op.calidadCount}C
                                          </td>
                                          <td className={`py-2 px-3 text-right font-bold ${opColor}`}>
                                            {opPct}%
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>
                {esModoBajos
                  ? 'Acompañamientos indicados por el programa vs. ejecutados registrados en la tabla Bajos_Indicadores por Formador (Entrenador). Excluye supervisores.'
                  : 'Cálculo automatizado con base en matriz #AF/Día Formador y evaluaciones registradas.'}
              </span>

              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors cursor-pointer"
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
