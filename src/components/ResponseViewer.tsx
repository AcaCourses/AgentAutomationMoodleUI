'use client';

import React, { useState } from 'react';
import { CheckCircle2, Code2, Eye, LayoutList, Building2, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

interface ResponseViewerProps {
  response: any;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'html' | 'json'>('summary');

  if (!response) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
        <LayoutList className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
        <p className="font-semibold text-slate-600">Sin datos de respuesta aún</p>
        <p className="text-xs text-slate-400 mt-1">
          La respuesta estructurada del backend (publicación Moodle y clasificación IA) aparecerá aquí.
        </p>
      </div>
    );
  }

  const datosIa = response.datos_ia || {};
  const htmlContent = datosIa.descripcion_html || response.descripcion_html || '';
  const cursosAfectados = response.cursos_afectados || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden flex flex-col">
      
      {/* Header Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Respuesta del Backend
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg text-xs font-medium overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all shrink-0 active:scale-95 ${
              activeTab === 'summary'
                ? 'bg-white text-moodle-navy font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" /> Resumen
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all shrink-0 active:scale-95 ${
              activeTab === 'html'
                ? 'bg-white text-moodle-navy font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Previsualización HTML
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all shrink-0 active:scale-95 ${
              activeTab === 'json'
                ? 'bg-white text-moodle-navy font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> JSON Raw
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            
            {/* Status Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-base">
                  ¡Publicación exitosa en Moodle!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  El recurso ha sido procesado por la IA e insertado mediante Playwright en las secciones correspondientes.
                </p>
              </div>
            </div>

            {/* Main Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Recurso Nombre */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-moodle-orange" /> Título de Recurso Generado
                </span>
                <p className="text-base font-bold text-slate-800">
                  {response.publicado || datosIa.nombre || 'N/A'}
                </p>
              </div>

              {/* Empresa & Categoría */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" /> Empresa & Categoría Moodle
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <span className="bg-sky-100 text-sky-800 font-semibold text-xs px-2.5 py-1 rounded-full border border-sky-200">
                    {response.empresa || datosIa.empresa || 'General'}
                  </span>
                  <span className="bg-moodle-orange/10 text-moodle-orange font-semibold text-xs px-2.5 py-1 rounded-full border border-moodle-orange/20">
                    {response.categoria_moodle || datosIa.categoria_moodle || 'Recursos'}
                  </span>
                </div>
              </div>

            </div>

            {/* Affected Courses List */}
            <div className="p-4 rounded-xl bg-moodle-navy/5 border border-moodle-navy/15 space-y-2">
              <span className="text-xs font-bold text-moodle-navy uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-moodle-orange" /> Cursos Moodle Actualizados
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {Array.isArray(cursosAfectados) && cursosAfectados.length > 0 ? (
                  cursosAfectados.map((cid: any) => (
                    <span
                      key={cid}
                      className="bg-moodle-navy text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1"
                    >
                      ID Curso: {cid} <ExternalLink className="w-3 h-3 text-moodle-orange" />
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No se especificaron IDs explícitos.</span>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'html' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b">
              <span>Vista previa del HTML enriquecido inyectado en TinyMCE:</span>
              <span className="font-mono text-moodle-orange">HTML Content Length: {htmlContent.length} chars</span>
            </div>
            
            {htmlContent ? (
              <div
                className="p-6 bg-slate-50 border border-slate-200 rounded-xl max-h-96 overflow-y-auto custom-scrollbar prose prose-sm max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                No hay contenido HTML retornado.
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-2">
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto custom-scrollbar max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};
