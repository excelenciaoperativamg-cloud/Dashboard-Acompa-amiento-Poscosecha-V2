import React from 'react';
import { Users, AlertTriangle, UserCheck, Route, Activity } from 'lucide-react';
import { ConsolidadoPriorizacion } from '../types';

interface KPICardsProps {
  data: ConsolidadoPriorizacion[];
  semanaSeleccionada: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ data, semanaSeleccionada }) => {
  const totalOperarios = data.length;

  const enObservacion = data.filter(
    (d) => d.resultadoRendimiento === 'En observación' || d.resultadoCalidad === 'En observación'
  ).length;

  const enDesarrollo = data.filter(
    (d) =>
      (d.resultadoRendimiento === 'En desarrollo' || d.resultadoCalidad === 'En desarrollo') &&
      d.resultadoRendimiento !== 'En observación' &&
      d.resultadoCalidad !== 'En observación'
  ).length;

  const totalAfFormador = data.reduce((acc, curr) => acc + curr.afDiaFormador, 0);
  const totalAcompRuta = data.reduce((acc, curr) => acc + (typeof curr.acompSemSupRuta === 'number' ? curr.acompSemSupRuta : 0), 0);
  const totalAcompProceso = data.reduce((acc, curr) => acc + (typeof curr.acompSemSupProceso === 'number' ? curr.acompSemSupProceso : 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
      
      {/* Card 1: Total Operarios Evaluados */}
      <div id="kpi-card-total-operarios" className="bg-white px-3.5 py-2.5 rounded-xl border border-stone-200 border-t-3 border-t-[#0a2958] shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-600 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a2958]">Evaluados</span>
          <Users className="w-4 h-4 text-[#0a2958]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-serif text-[#0a2958]">{totalOperarios}</span>
          <span className="text-xs text-stone-500 font-medium truncate">Operarios en semana {semanaSeleccionada || 'Todas'}</span>
        </div>
      </div>

      {/* Card 2: En Observación (Prioridad Urgente - Rojo) */}
      <div id="kpi-card-en-observacion" className="bg-white px-3.5 py-2.5 rounded-xl border border-stone-200 border-t-3 border-t-rose-600 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">En Observación</span>
          <AlertTriangle className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-serif text-rose-700">{enObservacion}</span>
          <span className="text-xs text-stone-500 font-medium truncate">Prioridad Alta de acompañamiento</span>
        </div>
      </div>

      {/* Card 3: En Desarrollo (Amber / Ámbar) */}
      <div id="kpi-card-en-desarrollo" className="bg-white px-3.5 py-2.5 rounded-xl border border-stone-200 border-t-3 border-t-amber-500 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">En Desarrollo</span>
          <Activity className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-serif text-amber-700">{enDesarrollo}</span>
          <span className="text-xs text-stone-500 font-medium truncate">Prioridad Media de acompañamiento</span>
        </div>
      </div>

      {/* Card 4: #AF/Día Formador (Sobresaliente - Emerald / Verde) */}
      <div id="kpi-card-af-formador" className="bg-white px-3.5 py-2.5 rounded-xl border border-stone-200 border-t-3 border-t-emerald-500 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">#AF / Día Formador</span>
          <UserCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-serif text-emerald-700">{totalAfFormador}</span>
          <span className="text-xs text-stone-500 font-medium truncate">Evaluaciones requeridas / día</span>
        </div>
      </div>

      {/* Card 5: Acompañamientos Sup. Ruta & Proceso (Sobresaliente - Emerald / Verde) */}
      <div id="kpi-card-acomp-supervisores" className="bg-white px-3.5 py-2.5 rounded-xl border border-stone-200 border-t-3 border-t-emerald-500 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Acompañamientos Sup.</span>
          <Route className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="truncate"><span className="text-stone-500">Ruta: </span><span className="font-bold text-emerald-700">{totalAcompRuta}</span><span className="text-[10px] text-stone-400">/sem</span></div>
          <div className="truncate"><span className="text-stone-500">Proc: </span><span className="font-bold text-emerald-700">{totalAcompProceso}</span><span className="text-[10px] text-stone-400">/sem</span></div>
        </div>
      </div>

    </div>
  );
};
