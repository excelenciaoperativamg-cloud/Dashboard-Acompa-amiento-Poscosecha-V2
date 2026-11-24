import React, { useState, useMemo } from 'react';
import { RegistroDestreza } from '../types';
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
  Calendar,
  Filter,
  User,
  UserCheck,
  RotateCcw,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DestrezasViewProps {
  destrezas: RegistroDestreza[];
}

const CHART_PALETTE = [
  '#0a2958',
  '#2563eb',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#0891b2'
];

export const DestrezasView: React.FC<DestrezasViewProps> = ({ destrezas }) => {
  const [anoFiltro, setAnoFiltro] = useState<string>('TODOS');
  const [semanaFiltro, setSemanaFiltro] = useState<string>('TODAS');
  const [nombreFiltro, setNombreFiltro] = useState<string>('TODOS');
  const [entrenadorFiltro, setEntrenadorFiltro] = useState<string>('TODOS');
  const [modoMenorTiempo, setModoMenorTiempo] = useState<'puesto' | 'operario'>('puesto');

  // Opciones únicas para los 4 filtros solicitados: Año, Semana, Nombre, Entrenador
  const anosDisponibles = useMemo(() => {
    const setA = new Set<number>();
    destrezas.forEach((d) => {
      if (d.ano && !isNaN(d.ano)) setA.add(d.ano);
    });
    return Array.from(setA).sort((a, b) => b - a);
  }, [destrezas]);

  const semanasDisponibles = useMemo(() => {
    const setS = new Set<string>();
    destrezas.forEach((d) => {
      if (anoFiltro !== 'TODOS' && String(d.ano) !== anoFiltro) return;
      if (d.semana && d.semana.trim() !== '') setS.add(d.semana.trim());
    });
    return Array.from(setS).sort().reverse();
  }, [destrezas, anoFiltro]);

  const nombresDisponibles = useMemo(() => {
    const map = new Map<string, { nombre: string; codigo: string }>();
    destrezas.forEach((d) => {
      const nom = (d.nombre || '').trim();
      if (nom && !map.has(nom)) {
        map.set(nom, { nombre: nom, codigo: (d.codigo || '').trim() });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [destrezas]);

  const entrenadoresDisponibles = useMemo(() => {
    const setE = new Set<string>();
    destrezas.forEach((d) => {
      const ent = (d.entrenador || '').trim();
      if (ent) setE.add(ent);
    });
    return Array.from(setE).sort((a, b) => a.localeCompare(b));
  }, [destrezas]);

  // Datos filtrados según Año, Semana, Nombre y Entrenador
  const registrosFiltrados = useMemo(() => {
    return destrezas.filter((d) => {
      if (anoFiltro !== 'TODOS' && String(d.ano) !== anoFiltro) return false;
      if (semanaFiltro !== 'TODAS' && d.semana !== semanaFiltro) return false;
      if (nombreFiltro !== 'TODOS' && d.nombre.trim() !== nombreFiltro) return false;
      if (entrenadorFiltro !== 'TODOS' && d.entrenador.trim() !== entrenadorFiltro) return false;
      return true;
    });
  }, [destrezas, anoFiltro, semanaFiltro, nombreFiltro, entrenadorFiltro]);

  const hayFiltrosActivos =
    anoFiltro !== 'TODOS' ||
    semanaFiltro !== 'TODAS' ||
    nombreFiltro !== 'TODOS' ||
    entrenadorFiltro !== 'TODOS';

  const handleResetFiltros = () => {
    setAnoFiltro('TODOS');
    setSemanaFiltro('TODAS');
    setNombreFiltro('TODOS');
    setEntrenadorFiltro('TODOS');
  };

  // GRÁFICA 1: Puesto de destreza o simulado (Cantidad de evaluaciones y operarios únicos)
  const dataPorPuesto = useMemo(() => {
    const map = new Map<
      string,
      { puesto: string; cantidad: number; operarios: Set<string>; aprobados: number }
    >();

    registrosFiltrados.forEach((r) => {
      const puesto = (r.puestoDestreza || 'No especificado').trim();
      if (!map.has(puesto)) {
        map.set(puesto, { puesto, cantidad: 0, operarios: new Set(), aprobados: 0 });
      }
      const entry = map.get(puesto)!;
      entry.cantidad += 1;
      entry.operarios.add(r.codigo || r.nombre);
      if (r.puestoAprobado === 'Sí') entry.aprobados += 1;
    });

    return Array.from(map.values())
      .map((item) => ({
        puesto: item.puesto,
        cantidad: item.cantidad,
        operariosUnicos: item.operarios.size,
        aprobados: item.aprobados
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [registrosFiltrados]);

  // GRÁFICA 2: % Cumplimiento (Promedio por Puesto de destreza o simulado)
  const dataCumplimiento = useMemo(() => {
    const map = new Map<
      string,
      { puesto: string; suma: number; count: number; min: number; max: number }
    >();

    registrosFiltrados.forEach((r) => {
      const puesto = (r.puestoDestreza || 'No especificado').trim();
      const val = typeof r.porcentajeCumplimiento === 'number' ? r.porcentajeCumplimiento : 0;
      if (!map.has(puesto)) {
        map.set(puesto, { puesto, suma: 0, count: 0, min: val, max: val });
      }
      const entry = map.get(puesto)!;
      entry.suma += val;
      entry.count += 1;
      if (val < entry.min) entry.min = val;
      if (val > entry.max) entry.max = val;
    });

    return Array.from(map.values())
      .map((item) => ({
        puesto: item.puesto,
        promedio: item.count > 0 ? Math.round(item.suma / item.count) : 0,
        min: Math.round(item.min),
        max: Math.round(item.max),
        evaluaciones: item.count
      }))
      .sort((a, b) => b.promedio - a.promedio);
  }, [registrosFiltrados]);

  // GRÁFICA 3: Puesto Aprobado (Sí vs No)
  const dataPuestoAprobado = useMemo(() => {
    let siCount = 0;
    let noCount = 0;

    registrosFiltrados.forEach((r) => {
      const norm = (r.puestoAprobado || '').trim().toLowerCase();
      if (norm === 'sí' || norm === 'si') {
        siCount += 1;
      } else {
        noCount += 1;
      }
    });

    const total = siCount + noCount;
    const result = [];
    if (siCount > 0) {
      result.push({
        estado: 'Aprobado (Sí)',
        cantidad: siCount,
        porcentaje: total > 0 ? Math.round((siCount / total) * 100) : 0,
        color: '#059669'
      });
    }
    if (noCount > 0) {
      result.push({
        estado: 'No aprobado (No)',
        cantidad: noCount,
        porcentaje: total > 0 ? Math.round((noCount / total) * 100) : 0,
        color: '#e11d48'
      });
    }

    return {
      items: result,
      total,
      siCount,
      noCount,
      tasaAprobacion: total > 0 ? Math.round((siCount / total) * 100) : 0
    };
  }, [registrosFiltrados]);

  // GRÁFICA 4: Tiempo por Intento (Menor Tiempo)
  const dataMenorTiempo = useMemo(() => {
    if (modoMenorTiempo === 'operario') {
      const mapOp = new Map<
        string,
        {
          etiqueta: string;
          nombre: string;
          puesto: string;
          menorTiempo: number;
          sumaTiempo: number;
          count: number;
        }
      >();

      registrosFiltrados.forEach((r) => {
        if (typeof r.tiempoPorIntento !== 'number' || r.tiempoPorIntento <= 0) return;
        const key = `${r.nombre}||${r.puestoDestreza}`;
        if (!mapOp.has(key)) {
          mapOp.set(key, {
            etiqueta: `${r.nombre.split(' ').slice(0, 2).join(' ')} · ${r.puestoDestreza}`,
            nombre: r.nombre,
            puesto: r.puestoDestreza,
            menorTiempo: r.tiempoPorIntento,
            sumaTiempo: 0,
            count: 0
          });
        }
        const entry = mapOp.get(key)!;
        if (r.tiempoPorIntento < entry.menorTiempo) {
          entry.menorTiempo = r.tiempoPorIntento;
        }
        entry.sumaTiempo += r.tiempoPorIntento;
        entry.count += 1;
      });

      return Array.from(mapOp.values())
        .map((item) => ({
          etiqueta: item.etiqueta,
          nombre: item.nombre,
          puesto: item.puesto,
          menorTiempo: Number(item.menorTiempo.toFixed(1)),
          promedioTiempo: Number((item.sumaTiempo / item.count).toFixed(1)),
          intentos: item.count,
          mejorOperario: item.nombre
        }))
        .sort((a, b) => a.menorTiempo - b.menorTiempo)
        .slice(0, 12);
    }

    const mapPuesto = new Map<
      string,
      {
        puesto: string;
        menorTiempo: number;
        maxTiempo: number;
        sumaTiempo: number;
        count: number;
        mejorOperario: string;
      }
    >();

    registrosFiltrados.forEach((r) => {
      if (typeof r.tiempoPorIntento !== 'number' || r.tiempoPorIntento <= 0) return;
      const puesto = (r.puestoDestreza || 'No especificado').trim();
      if (!mapPuesto.has(puesto)) {
        mapPuesto.set(puesto, {
          puesto,
          menorTiempo: r.tiempoPorIntento,
          maxTiempo: r.tiempoPorIntento,
          sumaTiempo: 0,
          count: 0,
          mejorOperario: r.nombre
        });
      }
      const entry = mapPuesto.get(puesto)!;
      if (r.tiempoPorIntento < entry.menorTiempo) {
        entry.menorTiempo = r.tiempoPorIntento;
        entry.mejorOperario = r.nombre;
      }
      if (r.tiempoPorIntento > entry.maxTiempo) {
        entry.maxTiempo = r.tiempoPorIntento;
      }
      entry.sumaTiempo += r.tiempoPorIntento;
      entry.count += 1;
    });

    return Array.from(mapPuesto.values())
      .map((item) => ({
        etiqueta: item.puesto,
        puesto: item.puesto,
        menorTiempo: Number(item.menorTiempo.toFixed(1)),
        promedioTiempo: Number((item.sumaTiempo / item.count).toFixed(1)),
        maxTiempo: Number(item.maxTiempo.toFixed(1)),
        intentos: item.count,
        mejorOperario: item.mejorOperario
      }))
      .sort((a, b) => a.menorTiempo - b.menorTiempo);
  }, [registrosFiltrados, modoMenorTiempo]);

  // Exportar a Excel
  const exportarExcelDestrezas = () => {
    if (registrosFiltrados.length === 0) return;

    const headers = [
      'Año',
      'Semana',
      'Fecha',
      'Proceso',
      'Entrenador',
      'Código',
      'Nombre',
      'Labor',
      'Puesto de destreza o simulado',
      'Nivel de dificultad',
      'Intento',
      'Tiempo por intento (s)',
      '% Cumplimiento',
      'Siguiente nivel',
      'Puesto aprobado',
      'Criterios incumplidos'
    ];

    const rows = registrosFiltrados.map((r) => [
      r.ano,
      r.semana,
      r.fecha || '-',
      r.proceso || '-',
      r.entrenador,
      r.codigo,
      r.nombre,
      r.labor,
      r.puestoDestreza,
      r.nivelDificultad ?? '-',
      r.intento ?? '-',
      r.tiempoPorIntento,
      `${r.porcentajeCumplimiento}%`,
      r.siguienteNivel || '-',
      r.puestoAprobado,
      r.criteriosIncumplidos || '-'
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 11 },
      { wch: 12 },
      { wch: 14 },
      { wch: 28 },
      { wch: 12 },
      { wch: 32 },
      { wch: 16 },
      { wch: 30 },
      { wch: 16 },
      { wch: 10 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 24 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Destrezas');
    XLSX.writeFile(wb, `Destrezas_Poscosecha_${semanaFiltro !== 'TODAS' ? semanaFiltro : 'General'}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado y barra de filtros solicitados: Año, Semana, Nombre, Entrenador */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0a2958] text-white rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Evaluación de Destrezas
              </h2>
              <p className="text-xs text-stone-500">
                Hoja Destrezas · {registrosFiltrados.length} registros mostrados de {destrezas.length} totales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={handleResetFiltros}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            )}
            <button
              type="button"
              onClick={exportarExcelDestrezas}
              disabled={registrosFiltrados.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* 4 Filtros: Año, Semana, Nombre, Entrenador */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100">
          {/* Filtro 1: Año */}
          <div className="space-y-1">
            <label
              htmlFor="destrezas-filter-ano"
              className="block text-[11px] font-semibold text-stone-600 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0a2958]" />
              Año
            </label>
            <select
              id="destrezas-filter-ano"
              value={anoFiltro}
              onChange={(e) => {
                setAnoFiltro(e.target.value);
                setSemanaFiltro('TODAS');
              }}
              className="w-full bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#0a2958]/20 focus:border-[#0a2958] focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los años</option>
              {anosDisponibles.map((ano) => (
                <option key={ano} value={String(ano)}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 2: Semana */}
          <div className="space-y-1">
            <label
              htmlFor="destrezas-filter-semana"
              className="block text-[11px] font-semibold text-stone-600 flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-[#0a2958]" />
              Semana
            </label>
            <select
              id="destrezas-filter-semana"
              value={semanaFiltro}
              onChange={(e) => setSemanaFiltro(e.target.value)}
              className="w-full bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#0a2958]/20 focus:border-[#0a2958] focus:outline-none cursor-pointer"
            >
              <option value="TODAS">Todas las semanas</option>
              {semanasDisponibles.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 3: Nombre */}
          <div className="space-y-1">
            <label
              htmlFor="destrezas-filter-nombre"
              className="block text-[11px] font-semibold text-stone-600 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#0a2958]" />
              Nombre
            </label>
            <select
              id="destrezas-filter-nombre"
              value={nombreFiltro}
              onChange={(e) => setNombreFiltro(e.target.value)}
              className="w-full bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#0a2958]/20 focus:border-[#0a2958] focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los nombres</option>
              {nombresDisponibles.map((item) => (
                <option key={item.nombre} value={item.nombre}>
                  {item.nombre}{item.codigo ? ` (${item.codigo})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 4: Entrenador */}
          <div className="space-y-1">
            <label
              htmlFor="destrezas-filter-entrenador"
              className="block text-[11px] font-semibold text-stone-600 flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#0a2958]" />
              Entrenador
            </label>
            <select
              id="destrezas-filter-entrenador"
              value={entrenadorFiltro}
              onChange={(e) => setEntrenadorFiltro(e.target.value)}
              className="w-full bg-stone-50 hover:bg-stone-100/70 border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#0a2958]/20 focus:border-[#0a2958] focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los entrenadores</option>
              {entrenadoresDisponibles.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de 4 Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICA 1: Puesto de destreza o simulado */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-[#0a2958] text-white py-2.5 px-4 font-bold text-sm tracking-wide flex items-center justify-between">
              <span>Puesto de destreza o simulado</span>
              <span className="text-[11px] font-normal text-stone-200 tabular-nums">
                {dataPorPuesto.length} puestos
              </span>
            </div>
            <div className="p-4">
              <div className="h-72 w-full">
                {dataPorPuesto.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={dataPorPuesto}
                      margin={{ top: 10, right: 36, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" allowDecimals={false} stroke="#78716c" fontSize={11} />
                      <YAxis
                        dataKey="puesto"
                        type="category"
                        stroke="#44403c"
                        fontSize={11}
                        fontWeight={500}
                        width={165}
                        tickFormatter={(val: string) =>
                          val.length > 24 ? `${val.slice(0, 22)}...` : val
                        }
                      />
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val} evaluaciones (${item.payload.operariosUnicos} operarios · ${item.payload.aprobados} aprobados)`,
                          'Registros'
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e7e5e4',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="cantidad" name="Evaluaciones" radius={[0, 4, 4, 0]}>
                        {dataPorPuesto.map((_, idx) => (
                          <Cell
                            key={`puesto-cell-${idx}`}
                            fill={CHART_PALETTE[idx % CHART_PALETTE.length]}
                          />
                        ))}
                        <LabelList
                          dataKey="cantidad"
                          position="right"
                          fill="#292524"
                          fontWeight="bold"
                          fontSize={11}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    No hay registros para los filtros seleccionados
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Cantidad de evaluaciones registradas por cada puesto de destreza o simulado.</span>
          </div>
        </div>

        {/* GRÁFICA 2: % Cumplimiento */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-[#0a2958] text-white py-2.5 px-4 font-bold text-sm tracking-wide flex items-center justify-between">
              <span>% Cumplimiento</span>
              <span className="text-[11px] font-normal text-stone-200">
                Promedio por puesto
              </span>
            </div>
            <div className="p-4">
              <div className="h-72 w-full">
                {dataCumplimiento.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={dataCumplimiento}
                      margin={{ top: 10, right: 44, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        unit="%"
                        stroke="#78716c"
                        fontSize={11}
                      />
                      <YAxis
                        dataKey="puesto"
                        type="category"
                        stroke="#44403c"
                        fontSize={11}
                        fontWeight={500}
                        width={165}
                        tickFormatter={(val: string) =>
                          val.length > 24 ? `${val.slice(0, 22)}...` : val
                        }
                      />
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val}% promedio (Mín: ${item.payload.min}% · Máx: ${item.payload.max}% · ${item.payload.evaluaciones} eval.)`,
                          '% Cumplimiento'
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e7e5e4',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="promedio" name="% Cumplimiento" radius={[0, 4, 4, 0]}>
                        {dataCumplimiento.map((entry, idx) => (
                          <Cell
                            key={`cumpl-cell-${idx}`}
                            fill={
                              entry.promedio >= 90
                                ? '#059669'
                                : entry.promedio >= 80
                                ? '#d97706'
                                : '#e11d48'
                            }
                          />
                        ))}
                        <LabelList
                          dataKey="promedio"
                          position="right"
                          formatter={(val: any) => `${val}%`}
                          fill="#292524"
                          fontWeight="bold"
                          fontSize={11}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    No hay registros para los filtros seleccionados
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Verde ≥ 90% · Ámbar 80–89% · Rojo &lt; 80% de cumplimiento promedio.</span>
          </div>
        </div>

        {/* GRÁFICA 3: Puesto Aprobado */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-[#0a2958] text-white py-2.5 px-4 font-bold text-sm tracking-wide flex items-center justify-between">
              <span>Puesto Aprobado</span>
              <span className="text-[11px] font-normal text-stone-200 tabular-nums">
                {dataPuestoAprobado.tasaAprobacion}% aprobación
              </span>
            </div>
            <div className="p-4">
              <div className="h-72 w-full relative">
                {dataPuestoAprobado.items.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataPuestoAprobado.items}
                        dataKey="cantidad"
                        nameKey="estado"
                        cx="42%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={92}
                        paddingAngle={3}
                        label={({ percent }) =>
                          percent > 0.03 ? `${Math.round(percent * 100)}%` : ''
                        }
                        labelLine={false}
                      >
                        {dataPuestoAprobado.items.map((entry, idx) => (
                          <Cell key={`aprob-cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val} registros (${item.payload.porcentaje}%)`,
                          item.payload.estado
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e7e5e4',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        iconSize={10}
                        formatter={(value: string, entry: any) => (
                          <span className="text-xs font-medium text-stone-700 tabular-nums">
                            {value}: {entry?.payload?.cantidad ?? 0}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    No hay registros para los filtros seleccionados
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between tabular-nums">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              Distribución de intentos aprobados (Sí) vs. no aprobados (No).
            </span>
            <span className="font-semibold text-stone-700">
              Sí: {dataPuestoAprobado.siCount} / No: {dataPuestoAprobado.noCount}
            </span>
          </div>
        </div>

        {/* GRÁFICA 4: Tiempo por Intento (Menor Tiempo) */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-[#0a2958] text-white py-2 px-4 font-bold text-sm tracking-wide flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-300" />
                Tiempo por Intento (Menor Tiempo)
              </span>
              <div className="flex items-center bg-white/10 rounded-md p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setModoMenorTiempo('puesto')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    modoMenorTiempo === 'puesto'
                      ? 'bg-white text-[#0a2958] font-bold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Por Puesto
                </button>
                <button
                  type="button"
                  onClick={() => setModoMenorTiempo('operario')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    modoMenorTiempo === 'operario'
                      ? 'bg-white text-[#0a2958] font-bold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Por Operario
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="h-72 w-full">
                {dataMenorTiempo.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={dataMenorTiempo}
                      margin={{ top: 10, right: 48, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" unit="s" stroke="#78716c" fontSize={11} />
                      <YAxis
                        dataKey="etiqueta"
                        type="category"
                        stroke="#44403c"
                        fontSize={11}
                        fontWeight={500}
                        width={175}
                        tickFormatter={(val: string) =>
                          val.length > 26 ? `${val.slice(0, 24)}...` : val
                        }
                      />
                      <Tooltip
                        formatter={(val: any, _name: any, item: any) => [
                          `${val} seg (Promedio: ${item.payload.promedioTiempo}s · Mejor: ${item.payload.mejorOperario})`,
                          'Menor Tiempo'
                        ]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e7e5e4',
                          fontSize: '12px'
                        }}
                      />
                      <Bar
                        dataKey="menorTiempo"
                        name="Menor Tiempo (s)"
                        fill="#0891b2"
                        radius={[0, 4, 4, 0]}
                      >
                        <LabelList
                          dataKey="menorTiempo"
                          position="right"
                          formatter={(val: any) => `${val}s`}
                          fill="#292524"
                          fontWeight="bold"
                          fontSize={11}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    No hay tiempos registrados para los filtros seleccionados
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Ordenado de menor a mayor tiempo registrado por intento (en segundos).</span>
          </div>
        </div>
      </div>

      {/* Tabla de detalle de Destrezas */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-[#0a2958] text-white py-2.5 px-5 font-bold text-sm tracking-wide flex items-center justify-between">
          <span>Detalle de Evaluaciones de Destrezas</span>
          <span className="text-[11px] font-normal text-stone-200 tabular-nums">
            {registrosFiltrados.length} registros
          </span>
        </div>

        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-stone-100 shadow-2xs">
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                <th className="py-2.5 px-3">Año / Sem</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Entrenador</th>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Nombre</th>
                <th className="py-2.5 px-3">Labor</th>
                <th className="py-2.5 px-3">Puesto de destreza</th>
                <th className="py-2.5 px-3 text-center">Nivel</th>
                <th className="py-2.5 px-3 text-center">Intento</th>
                <th className="py-2.5 px-3 text-right">Tiempo</th>
                <th className="py-2.5 px-3 text-right">% Cumpl.</th>
                <th className="py-2.5 px-3">Siguiente nivel</th>
                <th className="py-2.5 px-3 text-center">Aprobado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 tabular-nums">
              {registrosFiltrados.length > 0 ? (
                registrosFiltrados.map((r, idx) => {
                  const aprobado =
                    r.puestoAprobado.toLowerCase() === 'sí' ||
                    r.puestoAprobado.toLowerCase() === 'si';
                  const cumColor =
                    r.porcentajeCumplimiento >= 90
                      ? 'text-emerald-700'
                      : r.porcentajeCumplimiento >= 80
                      ? 'text-amber-700'
                      : 'text-rose-700';

                  return (
                    <tr
                      key={`${r.id}-${idx}`}
                      className={
                        idx % 2 === 1
                          ? 'bg-stone-50/70 hover:bg-stone-100/70 transition-colors'
                          : 'hover:bg-stone-100/70 transition-colors'
                      }
                    >
                      <td className="py-2.5 px-3 font-medium text-stone-700 whitespace-nowrap">
                        {r.semana}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                        {r.fecha || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-700">
                        {r.entrenador}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-600">
                        {r.codigo || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {r.nombre}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {r.labor}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-stone-800">
                        {r.puestoDestreza}
                      </td>
                      <td className="py-2.5 px-3 text-center text-stone-700">
                        {r.nivelDificultad ?? '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-stone-700">
                        {r.intento ?? '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-800 whitespace-nowrap">
                        {r.tiempoPorIntento}s
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${cumColor}`}>
                        {r.porcentajeCumplimiento}%
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {r.siguienteNivel || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {aprobado ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-stone-400">
                    <div className="space-y-2">
                      <p>No se encontraron evaluaciones de destrezas con los filtros seleccionados.</p>
                      {hayFiltrosActivos && (
                        <button
                          type="button"
                          onClick={handleResetFiltros}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Restablecer filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
