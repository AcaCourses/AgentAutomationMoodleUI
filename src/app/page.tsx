'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { LogTerminal, LogEntry } from '@/components/LogTerminal';
import { ResponseViewer } from '@/components/ResponseViewer';
import { performPreClean } from '@/lib/sanitizer';
import { Sparkles, Send, RefreshCw, Wand2, Link2, Globe, Building2, BookOpen, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agentautomationmoodle.onrender.com'
  );
  const [apiSecret, setApiSecret] = useState<string>(
    process.env.NEXT_PUBLIC_API_SECRET || 'seacatlan2026'
  );
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Form state
  const [texto, setTexto] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('');
  const [empresa, setEmpresa] = useState<string>('');
  const [courseIdOption, setCourseIdOption] = useState<string>('both'); // 'both', '22841', '22842'
  const [seccion, setSeccion] = useState<number>(0);
  const [useStreaming, setUseStreaming] = useState<boolean>(true);

  // Execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Helper to get normalized base URL
  const getCleanBaseUrl = () => apiBaseUrl.trim().replace(/\/+$/, '');

  // Helper to add log entries
  const addLog = (message: string, level: LogEntry['level'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('es-MX', { hour12: false }),
      message,
      level,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Check backend server status on mount or when API URL changes
  const checkServerStatus = async () => {
    setServerStatus('checking');
    const baseUrl = getCleanBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (res.ok) {
        setServerStatus('online');
        addLog(`✅ Conexión con el Backend en ${baseUrl} establecida.`, 'success');
      } else {
        setServerStatus('offline');
        addLog(`⚠️ El backend en ${baseUrl} respondió pero con estado de error (${res.status}).`, 'warn');
      }
    } catch {
      setServerStatus('offline');
      addLog(`❌ No se pudo conectar al Backend (${baseUrl}). Verifica tu túnel ngrok o servidor.`, 'error');
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, [apiBaseUrl]);

  // Pre-clean handler
  const handlePreClean = () => {
    if (!texto.trim()) {
      setNotification({ type: 'info', message: 'Por favor pega un texto antes de ejecutar la pre-limpieza.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const result = performPreClean(texto, url, linkedinUrl, empresa);

    setTexto(result.cleanedText);
    if (result.extractedUrl) setUrl(result.extractedUrl);
    if (result.extractedLinkedinUrl) setLinkedinUrl(result.extractedLinkedinUrl);
    if (result.detectedCompany) setEmpresa(result.detectedCompany);

    result.logs.forEach((msg) => addLog(msg, 'info'));
    setNotification({ type: 'success', message: '¡Pre-limpieza y auto-detección realizadas exitosamente!' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Preset company click
  const handleSelectCompany = (comp: string) => {
    setEmpresa(comp);
    addLog(`🏢 Empresa seleccionada: ${comp}`, 'info');
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setNotification({ type: 'error', message: 'La URL de destino es obligatoria.' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    if (!texto.trim()) {
      setNotification({ type: 'error', message: 'El texto descriptivo es obligatorio.' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setIsLoading(true);
    setBackendResponse(null);
    const baseUrl = getCleanBaseUrl();
    addLog(`🚀 Iniciando petición hacia ${baseUrl}...`, 'info');

    // Pre-limpieza final automática si no se ha hecho
    const preClean = performPreClean(texto, url, linkedinUrl, empresa);

    // Resolve course_id
    let targetCourseId: any = null;
    if (courseIdOption === '22841') targetCourseId = 22841;
    else if (courseIdOption === '22842') targetCourseId = 22842;
    else targetCourseId = [22841, 22842];

    const payload = {
      texto: preClean.cleanedText,
      url: preClean.extractedUrl || url,
      linkedin_url: preClean.extractedLinkedinUrl || linkedinUrl || null,
      empresa: preClean.detectedCompany || empresa || null,
      seccion: Number(seccion) || 0,
      course_id: targetCourseId,
    };

    if (useStreaming) {
      // SSE Real-time Streaming Logs Execution
      try {
        const streamEndpoint = `${baseUrl}/webhook-linkedin-stream`;
        addLog(`📡 Conectando endpoint SSE ${streamEndpoint}...`, 'info');

        const response = await fetch(streamEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-token': apiSecret,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ detail: response.statusText }));
          throw new Error(errData.detail || `Error HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
          throw new Error('No se pudo abrir el lector de stream SSE.');
        }

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.replace('data: ', ''));
                if (eventData.type === 'log') {
                  addLog(eventData.message, eventData.level || 'info');
                } else if (eventData.type === 'result') {
                  setBackendResponse(eventData.data);
                  addLog('🎉 Proceso completado exitosamente en Moodle.', 'success');
                  setNotification({ type: 'success', message: '¡Recurso publicado con éxito en Moodle!' });
                } else if (eventData.type === 'error') {
                  addLog(`❌ Error del backend: ${eventData.detail}`, 'error');
                  setNotification({ type: 'error', message: `Error: ${eventData.detail}` });
                }
              } catch (err) {
                console.error('Error al parsear SSE:', err);
              }
            }
          }
        }
      } catch (err: any) {
        addLog(`❌ Falló la solicitud streaming: ${err.message}`, 'error');
        setNotification({ type: 'error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Standard HTTP POST request
      try {
        const webhookEndpoint = `${baseUrl}/webhook-linkedin`;
        const response = await fetch(webhookEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-token': apiSecret,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || `Error HTTP ${response.status}`);
        }

        setBackendResponse(data);

        if (data.logs && Array.isArray(data.logs)) {
          data.logs.forEach((l: any) => addLog(l.message, l.level || 'info'));
        }

        addLog(`✅ Recurso '${data.publicado}' publicado exitosamente.`, 'success');
        setNotification({ type: 'success', message: '¡Publicación realizada con éxito!' });
      } catch (err: any) {
        addLog(`❌ Error HTTP: ${err.message}`, 'error');
        setNotification({ type: 'error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Header */}
      <Header
        apiBaseUrl={apiBaseUrl}
        setApiBaseUrl={setApiBaseUrl}
        apiSecret={apiSecret}
        setApiSecret={setApiSecret}
        serverStatus={serverStatus}
        onCheckStatus={checkServerStatus}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold ${notification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : notification.type === 'error'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-sky-600 text-white border-sky-500'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">

        {/* Intro Hero Card (Compact on Mobile) */}
        <div className="bg-gradient-to-r from-moodle-navy via-slate-900 to-moodle-darkNavy text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-moodle-orange/20 border border-moodle-orange/40 text-moodle-orange text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Automatización Playwright + IA
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              🤖 Moodi - Publicador Inteligente Moodle
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Conectado a <span className="font-mono text-moodle-orange">{getCleanBaseUrl()}</span>. Publica contenido automáticamente en Moodle SEA Acatlán.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => setUseStreaming(!useStreaming)}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all w-full sm:w-auto ${useStreaming
                  ? 'bg-moodle-orange text-white border-moodle-orange shadow-lg moodle-glow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${useStreaming ? 'animate-spin' : ''}`} />
              {useStreaming ? 'Streaming SSE Activo' : 'Modo HTTP Estándar'}
            </button>
          </div>
        </div>

        {/* Dashboard Main Grid: Form + Terminal */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

          {/* Left Column: Form Controls (5 cols on XL) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-6 space-y-5">

              <div className="flex items-center justify-between border-b border-slate-200 pb-3 sm:pb-4">
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-moodle-orange shrink-0" /> Formulario de Recurso
                </h3>
                <button
                  type="button"
                  onClick={handlePreClean}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-moodle-lightOrange border border-moodle-orange/30 text-moodle-orange hover:bg-moodle-orange hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 touch-manipulation"
                  title="Limpiar saltos de línea y extraer URLs automáticamente"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Pre-Limpieza
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Texto Input */}
                <div className="space-y-1">
                  <label htmlFor="textoInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contenido / Texto Descriptivo: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="textoInput"
                    rows={3}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Pega el post de LinkedIn o resumen del evento aquí..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-moodle-orange focus:border-moodle-orange transition-all font-sans bg-slate-50/50"
                    required
                  />
                </div>

                {/* Destination URL */}
                <div className="space-y-1">
                  <label htmlFor="urlInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-moodle-orange" /> URL Destino / Registro: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="urlInput"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://airtable.com/form... o enlace oficial"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-moodle-orange focus:border-moodle-orange transition-all bg-slate-50/50"
                    required
                  />
                </div>

                {/* LinkedIn URL Optional */}
                <div className="space-y-1">
                  <label htmlFor="linkedinUrlInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-sky-600" /> Publicación LinkedIn (Opcional):
                  </label>
                  <input
                    id="linkedinUrlInput"
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/feed/update/..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-moodle-orange focus:border-moodle-orange transition-all bg-slate-50/50"
                  />
                </div>

                {/* Dropdown Selection for Empresa */}
                <div className="space-y-1.5">
                  <label htmlFor="empresaSelect" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-600" /> Empresa Organizadora:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      id="empresaSelect"
                      value={['Canva', 'IBM', 'Santander', 'Google', 'Microsoft', 'AWS', 'Oracle', 'UNAM'].includes(empresa) ? empresa : (empresa ? 'custom' : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') setEmpresa(val);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50/50 focus:ring-2 focus:ring-moodle-orange focus:border-moodle-orange min-h-[42px]"
                    >
                      <option value="">-- Seleccionar Empresa --</option>
                      <option value="Canva">Canva</option>
                      <option value="IBM">IBM</option>
                      <option value="Santander">Santander</option>
                      <option value="Google">Google</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="AWS">AWS</option>
                      <option value="Oracle">Oracle</option>
                      <option value="UNAM">UNAM</option>
                      <option value="custom">Personalizada / Otra...</option>
                    </select>

                    <input
                      id="empresaInput"
                      type="text"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Nombre de empresa..."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-moodle-orange focus:border-moodle-orange transition-all bg-slate-50/50 min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Course Selection & Section Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Course Select Dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="courseIdOptionSelect" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-moodle-orange" /> Cursos Moodle:
                    </label>
                    <select
                      id="courseIdOptionSelect"
                      value={courseIdOption}
                      onChange={(e) => setCourseIdOption(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50/50 focus:ring-2 focus:ring-moodle-orange focus:border-moodle-orange min-h-[42px]"
                    >
                      <option value="both">Ambos Cursos (22841 y 22842)</option>
                      <option value="22841">Solo Curso 22841</option>
                      <option value="22842">Solo Curso 22842</option>
                    </select>
                  </div>

                  {/* Section Select Dropdown */}
                  <div className="space-y-1">
                    <label htmlFor="seccionSelect" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-600" /> Sección Moodle:
                    </label>
                    <select
                      id="seccionSelect"
                      value={seccion}
                      onChange={(e) => setSeccion(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50/50 focus:ring-2 focus:ring-moodle-orange focus:border-moodle-orange min-h-[42px]"
                    >
                      <option value={0}>Sección 0 (General / Inicio)</option>
                      <option value={1}>Sección 1</option>
                      <option value={2}>Sección 2</option>
                      <option value={3}>Sección 3</option>
                      <option value={4}>Sección 4</option>
                      <option value={5}>Sección 5</option>
                      <option value={6}>Sección 6</option>
                      <option value={7}>Sección 7</option>
                      <option value={8}>Sección 8</option>
                      <option value={9}>Sección 9</option>
                      <option value={10}>Sección 10</option>
                    </select>
                  </div>

                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full min-h-[48px] py-3.5 px-6 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] touch-manipulation ${isLoading
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-moodle-orange hover:bg-moodle-orangeHover moodle-glow'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando con Playwright e IA...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publicar Recurso en Moodle</span>
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

          {/* Right Column: Live Log Terminal (Dropdown preview on Mobile, full on XL) */}
          <div className="xl:col-span-7 space-y-6">
            <LogTerminal
              logs={logs}
              onClearLogs={() => setLogs([])}
              isRunning={isLoading}
            />
          </div>

        </div>

        {/* Bottom Section: Response Visualizer */}
        <div className="pt-2">
          <ResponseViewer response={backendResponse} />
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs space-y-1">
          <p className="font-semibold text-slate-300">Moodi: Agente Inteligente Moodle SEA Acatlán - FES Acatlán UNAM 2026</p>
          <p className="text-slate-500 font-mono">Backend API: {getCleanBaseUrl()}</p>
        </div>
      </footer>

    </div>
  );
}
