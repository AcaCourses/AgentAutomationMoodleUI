'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { LogEntry } from '@/components/LogTerminal';
import { ResponseViewer } from '@/components/ResponseViewer';
import { performPreClean } from '@/lib/sanitizer';
import {
  Sparkles,
  Send,
  RefreshCw,
  Wand2,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  BookOpen,
  Globe,
  Layers,
  Terminal,
  Copy,
  Check
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'modi';
  timestamp: string;
  text?: string;
  isWorking?: boolean;
  logs?: LogEntry[];
  logsOpen?: boolean;
  preview?: {
    nombre?: string;
    empresa?: string;
    categoria_moodle?: string;
    url?: string;
    linkedin_url?: string;
    course_id?: any;
    seccion?: number;
  };
  result?: any;
  error?: string;
}

const PRESET_EXAMPLES = [
  {
    label: '✨ Taller Google (Estructurado)',
    text: `Formulario de Recurso
Contenido / Texto Descriptivo: Taller presencial de Inteligencia Artificial Generativa y Python en el laboratorio MAC FES Acatlán este Viernes a las 11am.
URL Destino / Registro: https://airtable.com/appnhBCVc9hDgR8mz/paghP08IdSWBkI1Zj/form
Publicación LinkedIn: https://www.linkedin.com/feed/update/urn:li:activity:7495395360992010241
Empresa Organizadora: Google`,
  },
  {
    label: '🎓 Curso Inglés Santander',
    text: `Hola Modi, publica el curso gratuito de Inglés Santander British Council https://www.santanderopenacademy.com/es/skills/english.html para mis grupos de la facultad.`,
  },
  {
    label: '🎨 Tarea Canva',
    text: `Descripcion: Plantilla oficial para la Tarea de Laboratorio de C++ y Estructuras de Datos
Registro: https://canva.link/0yg17mek4a9umqq
Empresa que lo organiza: Canva`,
  },
];

export default function Home() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agentautomationmoodle.onrender.com'
  );
  const [apiSecret, setApiSecret] = useState<string>(
    process.env.NEXT_PUBLIC_API_SECRET || 'seacatlan2026'
  );
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Input chat state
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      sender: 'modi',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      text: `¡Hola! Soy **Modi**, tu agente de automatización en Moodle SEA Acatlán 🎓.

Para publicar una convocatoria, evento o recurso, solo envíame un mensaje en el chat. Puedes incluir:
- 📌 **Descripción del evento o curso**
- 🔗 **URL de Registro / Destino**
- 🌐 **Enlace de LinkedIn (Opcional)**
- 🏢 **Empresa Organizadora** *(ej. Google, IBM, Canva, Santander, AWS)*

Si no especificas el curso o la sección, ¡yo me encargaré de clasificarlo e inferir los cursos automáticamente!`,
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper to get clean base URL
  const getCleanBaseUrl = () => apiBaseUrl.trim().replace(/\/+$/, '');

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check backend server status
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
      } else {
        setServerStatus('offline');
      }
    } catch {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, [apiBaseUrl]);

  // Toggle log accordion for a specific message
  const toggleLogs = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, logsOpen: !msg.logsOpen } : msg
      )
    );
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Handler: Send message to Modi
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    // Add user message
    const userMsgId = Math.random().toString(36).substring(2, 9);
    const modiMsgId = Math.random().toString(36).substring(2, 9);
    const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const userMessageObj: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: nowTime,
      text: textToSend,
    };

    const modiWorkingObj: ChatMessage = {
      id: modiMsgId,
      sender: 'modi',
      timestamp: nowTime,
      isWorking: true,
      logs: [{
        id: '1',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour12: false }),
        message: '🤖 Modi está iniciando el procesamiento del mensaje...',
        level: 'info'
      }],
      logsOpen: false,
    };

    setMessages((prev) => [...prev, userMessageObj, modiWorkingObj]);
    setInputMessage('');
    setIsLoading(true);

    const baseUrl = getCleanBaseUrl();
    const streamEndpoint = `${baseUrl}/webhook-chat-stream`;

    try {
      const response = await fetch(streamEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': apiSecret,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errData.detail || `Error HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('No se pudo abrir el lector SSE del backend.');
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

              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== modiMsgId) return msg;

                  if (eventData.type === 'log') {
                    const newLog: LogEntry = {
                      id: Math.random().toString(36).substring(2, 9),
                      timestamp: new Date().toLocaleTimeString('es-MX', { hour12: false }),
                      message: eventData.message,
                      level: eventData.level || 'info',
                    };
                    return {
                      ...msg,
                      logs: [...(msg.logs || []), newLog],
                    };
                  } else if (eventData.type === 'preview') {
                    return {
                      ...msg,
                      preview: eventData.data,
                    };
                  } else if (eventData.type === 'result') {
                    return {
                      ...msg,
                      isWorking: false,
                      result: eventData.data,
                      text: `¡Listo! He clasificado y publicado **"${eventData.data.publicado}"** en Moodle SEA Acatlán exitosamente 🚀.`,
                    };
                  } else if (eventData.type === 'error') {
                    return {
                      ...msg,
                      isWorking: false,
                      error: eventData.detail,
                      text: `⚠️ Modi encontró un inconveniente al procesar tu solicitud.`,
                    };
                  }
                  return msg;
                })
              );
            } catch (err) {
              console.error('Error al procesar mensaje SSE:', err);
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modiMsgId
            ? {
                ...msg,
                isWorking: false,
                error: err.message,
                text: `❌ Ocurrió un error al conectar con el servidor: ${err.message}`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <Header
        apiBaseUrl={apiBaseUrl}
        setApiBaseUrl={setApiBaseUrl}
        apiSecret={apiSecret}
        setApiSecret={setApiSecret}
        serverStatus={serverStatus}
        onCheckStatus={checkServerStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col justify-between space-y-4">
        
        {/* Chat Feed Header */}
        <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-3 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-moodle-orange to-amber-400 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-6 h-6" />
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${serverStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Modi <span className="text-xs px-2 py-0.5 rounded-full bg-moodle-orange/20 border border-moodle-orange/40 text-moodle-orange font-semibold">Agente Moodle Acatlán</span>
              </h2>
              <p className="text-xs text-slate-400">
                {serverStatus === 'online' ? '🟢 Conectado y listo para recibir órdenes' : '⚠️ Verificando backend...'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block font-mono">
            SEA Acatlán • UNAM
          </div>
        </div>

        {/* Chat Messages Feed Area */}
        <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6 min-h-[460px] max-h-[620px] shadow-inner">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Modi Avatar */}
              {msg.sender === 'modi' && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-moodle-orange to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`max-w-[88%] sm:max-w-[80%] space-y-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-moodle-orange text-white rounded-tr-none font-medium'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  {msg.text && (
                    <div className="whitespace-pre-wrap">
                      {msg.text.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="font-bold text-amber-300">{part}</strong> : part
                      )}
                    </div>
                  )}

                  {/* Modi Working Spinner State */}
                  {msg.isWorking && (
                    <div className="flex items-center gap-3 py-1 text-moodle-orange font-semibold animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-moodle-orange" />
                      <span>Estoy trabajando en ello... Modi está procesando y publicando en Moodle</span>
                    </div>
                  )}

                  {/* Error display */}
                  {msg.error && (
                    <div className="mt-2 p-3 bg-rose-950/80 border border-rose-700/80 text-rose-200 rounded-xl text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Detalle del error:</p>
                        <p className="font-mono text-[11px] mt-0.5">{msg.error}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pre-visualization Card (Early or Final) */}
                {(msg.preview || msg.result?.datos_ia) && (
                  <div className="bg-slate-900 border border-slate-700/90 rounded-2xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-moodle-orange flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Previsualización del Recurso
                      </span>
                      {msg.preview?.categoria_moodle && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                          {msg.preview.categoria_moodle}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="font-bold text-slate-100 text-sm">
                        {msg.preview?.nombre || msg.result?.publicado || 'Generando título...'}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px] pt-1">
                        {msg.preview?.empresa && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Empresa: <strong className="text-white">{msg.preview.empresa}</strong></span>
                          </div>
                        )}
                        {msg.preview?.course_id && (
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-moodle-orange" />
                            <span>Cursos: <strong className="text-amber-300">{JSON.stringify(msg.preview.course_id)}</strong></span>
                          </div>
                        )}
                      </div>

                      {msg.preview?.url && (
                        <div className="pt-1">
                          <a
                            href={msg.preview.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver Enlace Destino
                          </a>
                        </div>
                      )}
                    </div>

                    {msg.result?.cursos_afectados && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Publicado correctamente en Moodle (Cursos: {JSON.stringify(msg.result.cursos_afectados)})</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Dropdown Accordion for Execution Logs */}
                {msg.logs && msg.logs.length > 0 && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                    <button
                      type="button"
                      onClick={() => toggleLogs(msg.id)}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2 font-mono text-[11px]">
                        <Terminal className="w-3.5 h-3.5 text-moodle-orange" />
                        Ver logs de ejecución ({msg.logs.length} eventos)
                      </span>
                      {msg.logsOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {msg.logsOpen && (
                      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
                        {msg.logs.map((log) => (
                          <div key={log.id} className="flex items-start gap-2">
                            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                            <span
                              className={
                                log.level === 'success'
                                  ? 'text-emerald-400 font-semibold'
                                  : log.level === 'error'
                                  ? 'text-rose-400 font-semibold'
                                  : log.level === 'warn'
                                  ? 'text-amber-400'
                                  : 'text-slate-300'
                              }
                            >
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={`text-[10px] text-slate-500 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>

              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 shadow-md mt-1">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              )}

            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Examples */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-moodle-orange" /> Ejemplos de mensajes para probar:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputMessage(ex.text)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95 text-left"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-end gap-2"
        >
          <textarea
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe o pega aquí la descripción del evento, URLs de registro/LinkedIn y empresa..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-moodle-orange focus:border-transparent transition-all resize-none placeholder-slate-500 font-sans"
          />

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`min-h-[48px] px-4 py-3 rounded-xl font-bold text-white text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 ${
              isLoading || !inputMessage.trim()
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                : 'bg-moodle-orange hover:bg-moodle-orangeHover moodle-glow'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar a Modi</span>
              </>
            )}
          </button>
        </form>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">Modi: Agente Autónomo Moodle SEA Acatlán - FES Acatlán UNAM 2026</p>
      </footer>
    </div>
  );
}
