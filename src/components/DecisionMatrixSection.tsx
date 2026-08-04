import React from 'react';
import { Grid, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DecisionMatrixSection: React.FC = () => {
  return (
    <div className="space-y-6 mb-8">
      
      {/* Intro Box */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 border-t-4 border-t-[#0a2958] shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#0a2958]/10 text-[#0a2958] mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-medium text-[#0a2958]">
              Tablas de Decisión y Parámetros de Priorización
            </h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Reglas operativas utilizadas para determinar la frecuencia de evaluaciones diarias por la formadora (#AF/Día Formador) y las visitas semanales requeridas por la supervisora de ruta y de proceso.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Decision Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabla 1: #AF/Día Formador */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
            <h3 className="text-sm font-serif font-medium text-stone-800 flex items-center gap-2">
              <Grid className="w-4 h-4 text-stone-500" />
              Tabla 1: #AF / Día Formador (Evaluaciones Diarias)
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
              Matriz Calidad vs Rendimiento
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-serif">
                  <th className="p-2.5 text-left border border-stone-200">CALIDAD \ RENDIMIENTO</th>
                  <th className="p-2.5 border border-stone-200 bg-stone-100">Sobresaliente</th>
                  <th className="p-2.5 border border-stone-200 bg-stone-100">Bueno</th>
                  <th className="p-2.5 border border-stone-200 bg-amber-50/50 text-amber-900">En desarrollo</th>
                  <th className="p-2.5 border border-stone-200 bg-rose-50/50 text-rose-900">En observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="p-2.5 text-left font-medium border border-stone-200 bg-stone-50">Sobresaliente (&gt;90%)</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-stone-800">1</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-stone-800">2</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-amber-700 bg-amber-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-rose-700 bg-rose-50/20">3</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-medium border border-stone-200 bg-stone-50">Bueno (90%)</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-stone-800">2</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-stone-800">2</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-amber-700 bg-amber-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-rose-700 bg-rose-50/20">3</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-medium border border-stone-200 bg-amber-50/30">En desarrollo (85% - 89%)</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-amber-700 bg-amber-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-amber-700 bg-amber-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-amber-700 bg-amber-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-rose-700 bg-rose-50/20">3</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-medium border border-stone-200 bg-rose-50/30">En observación (&lt;85%)</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-rose-700 bg-rose-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-rose-700 bg-rose-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-rose-700 bg-rose-50/20">3</td>
                  <td className="p-2.5 border border-stone-200 font-bold text-rose-700 bg-rose-50/20">3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla 2 y 3: Acompañamiento Supervisoras */}
        <div className="space-y-6">
          
          {/* Tabla Sup Ruta */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <h3 className="text-sm font-serif font-medium text-stone-800 mb-3 pb-2 border-b border-stone-200">
              Acompañamiento/sem Sup Ruta (Calidad)
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-serif">
                  <th className="p-2 border border-stone-200">CALIDAD (% Proceso)</th>
                  <th className="p-2 border border-stone-200 text-center">Acompañamientos / Sem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="p-2 border border-stone-200">Sobresaliente (&gt;90%)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-stone-800">0</td>
                </tr>
                <tr>
                  <td className="p-2 border border-stone-200">Bueno (=90%)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-stone-800">0</td>
                </tr>
                <tr className="bg-amber-50/30">
                  <td className="p-2 border border-stone-200 text-amber-800">En desarrollo (85% - 89%)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-amber-800">1</td>
                </tr>
                <tr className="bg-rose-50/30">
                  <td className="p-2 border border-stone-200 text-rose-800">En observación (&lt;85%)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-rose-800">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabla Sup Proceso */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <h3 className="text-sm font-serif font-medium text-stone-800 mb-3 pb-2 border-b border-stone-200">
              Acompañamiento/sem Sup Proceso (Rendimientos)
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-serif">
                  <th className="p-2 border border-stone-200">RENDIMIENTOS</th>
                  <th className="p-2 border border-stone-200 text-center">Acompañamientos / Sem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="p-2 border border-stone-200">Sobresaliente (&gt; Rendimiento Meta)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-stone-800">0</td>
                </tr>
                <tr>
                  <td className="p-2 border border-stone-200">Bueno (Entre Meta y Mínimo)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-stone-800">0</td>
                </tr>
                <tr className="bg-amber-50/30">
                  <td className="p-2 border border-stone-200 text-amber-800">En desarrollo (Mínimo a Observación)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-amber-800">1</td>
                </tr>
                <tr className="bg-rose-50/30">
                  <td className="p-2 border border-stone-200 text-rose-800">En observación (&lt; Rendimiento en Observación)</td>
                  <td className="p-2 border border-stone-200 text-center font-bold text-rose-800">1</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Reglas explicativas del negocio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-2 shadow-xs">
          <h4 className="font-serif font-medium text-stone-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Criterios Hoja Rendimiento
          </h4>
          <ul className="list-disc list-inside text-stone-600 space-y-1">
            <li><strong>Sobresaliente:</strong> Rendimiento &gt; Rendimiento Meta</li>
            <li><strong>Bueno:</strong> Rendimiento entre Rendimiento Meta y Rendimiento Mínimo</li>
            <li><strong>En desarrollo:</strong> Rendimiento igual al Mínimo y mayor a Rendimiento en Observación</li>
            <li><strong>En observación:</strong> Rendimiento &lt; Rendimiento en Observación</li>
            <li className="text-[11px] text-stone-400 pt-1">
              <em>Nota: Si una persona tiene múltiples rendimientos durante la semana, se prioriza el más bajo.</em>
            </li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-2 shadow-xs">
          <h4 className="font-serif font-medium text-stone-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Criterios Hoja Consolidado (% CALIDAD)
          </h4>
          <ul className="list-disc list-inside text-stone-600 space-y-1">
            <li><strong>Sobresaliente:</strong> % Calidad &gt; 90%</li>
            <li><strong>Bueno:</strong> % Calidad == 90%</li>
            <li><strong>En desarrollo:</strong> 85% &lt;= % Calidad &lt; 90%</li>
            <li><strong>En observación:</strong> % Calidad &lt; 85%</li>
            <li className="text-[11px] text-stone-500 pt-1">
              <em>Nota: Se calcula el promedio individual de % Proceso y % Producto, priorizando el menor valor entre ambos para % Calidad. Si no hay dato de calidad se muestra un guión (-).</em>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};
