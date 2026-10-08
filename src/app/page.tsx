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
  Check,
  Maximize2,
  Minimize2,
  X,
  Trash2,
  Smile,
  Zap,
  Eye,
  LayoutList
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
    descripcion_html?: string;
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

  // Expandable Textarea Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Agent Avatar Animation state
  const [agentWiggle, setAgentWiggle] = useState<boolean>(false);
  const [agentSpeech, setAgentSpeech] = useState<string | null>(null);

  // Tab state for individual message preview cards
  const [previewTabMap, setPreviewTabMap] = useState<Record<string, 'summary' | 'html'>>({});

  const setMsgPreviewTab = (msgId: string, tab: 'summary' | 'html') => {
    setPreviewTabMap((prev) => ({ ...prev, [msgId]: tab }));
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-message',
      sender: 'modi',
      timestamp: '', // Se establecerá en el cliente para evitar Hydration Error
      text: `¡Hola! Soy **Modi**, tu agente autónomo de automatización en Moodle SEA Acatlán 🎓.

Para publicar una convocatoria, evento o recurso, solo envíame un mensaje. Puedes incluir:
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

  // Fix Hydration mismatch for welcome message timestamp
  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[0] && newMessages[0].id === 'welcome-message' && !newMessages[0].timestamp) {
        newMessages[0].timestamp = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      }
      return newMessages;
    });
  }, []);

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

  // Handle agent avatar click interaction
  const handleAgentClick = () => {
    setAgentWiggle(true);
    const greetings = [
      '¡Hola! Estoy listo para procesar tus publicaciones en Moodle 🚀',
      '¡Aquí estoy! Puedes pegarme textos largos usando el botón de ampliar 📝',
      'Modi versión 2.0 activo y escuchando 🤖✨',
      '¡FES Acatlán UNAM! Automatizando cursos y eventos 🎓',
    ];
    const randomSpeech = greetings[Math.floor(Math.random() * greetings.length)];
    setAgentSpeech(randomSpeech);
    setTimeout(() => setAgentWiggle(false), 600);
    setTimeout(() => setAgentSpeech(null), 4000);
  };

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

    if (isModalOpen) {
      setIsModalOpen(false);
    }

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
        body: JSON.stringify({ message: textToSend, auto_publish: false }),
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
                    if (eventData.data.status === 'pending_approval') {
                      return {
                        ...msg,
                        isWorking: false,
                        result: eventData.data,
                        text: `He preparado la publicación para **"${eventData.data.item_recurso?.nombre || 'el recurso'}"**. Por favor, revisa la información y aprueba para publicarlo en Moodle.`,
                      };
                    } else {
                      return {
                        ...msg,
                        isWorking: false,
                        result: eventData.data,
                        text: `¡Listo! He clasificado y publicado **"${eventData.data.publicado}"** en Moodle SEA Acatlán exitosamente 🚀.`,
                      };
                    }
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

  const handlePublishPrepared = async (msgId: string, itemRecurso: any, courseIds: any) => {
    const baseUrl = getCleanBaseUrl();
    
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, isWorking: true, text: `Publicando recurso en Moodle...` } : msg
      )
    );
    
    try {
      // Tomamos el primer curso si es un arreglo
      const cId = Array.isArray(courseIds) ? courseIds[0] : courseIds;
      
      const res = await fetch(`${baseUrl}/publish-prepared`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-token': apiSecret },
        body: JSON.stringify({ item_recurso: itemRecurso, course_id: cId })
      });
      if (!res.ok) throw new Error('Error al publicar en Moodle');
      const data = await res.json();
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { 
            ...msg, 
            isWorking: false, 
            result: { ...msg.result, status: 'published', cursos_afectados: [cId], publicado: itemRecurso.nombre },
            text: `¡Listo! He publicado **"${itemRecurso.nombre}"** en Moodle SEA Acatlán exitosamente 🚀.` 
          } : msg
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, isWorking: false, error: err.message, text: `❌ Ocurrió un error al publicar: ${err.message}` } : msg
        )
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-orange-100 selection:text-moodle-orange">
      {/* Header */}
      <Header
        apiBaseUrl={apiBaseUrl}
        setApiBaseUrl={setApiBaseUrl}
        apiSecret={apiSecret}
        setApiSecret={setApiSecret}
        serverStatus={serverStatus}
        onCheckStatus={checkServerStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-2.5 sm:px-6 py-3 sm:py-5 flex flex-col justify-between space-y-3 sm:space-y-4">
        
        {/* Chat Header Status Card */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-2.5 sm:gap-3.5 z-10">
            {/* Interactive Agent Avatar */}
            <div className="relative group cursor-pointer shrink-0" onClick={handleAgentClick}>
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-moodle-orange to-amber-500 flex items-center justify-center text-white shadow-md agent-ring-pulse ${agentWiggle ? 'agent-wiggle' : 'agent-float'}`}>
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ${serverStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                Modi <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-orange-100/80 border border-orange-200 text-moodle-orange font-bold font-mono">Agente Moodle</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {serverStatus === 'online' ? '🟢 En línea • listo para tus instrucciones' : '⚠️ Verificando backend...'}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shrink-0">
            <Zap className="w-3.5 h-3.5 text-moodle-orange" /> SEA Acatlán • UNAM
          </div>

          {/* Interactive Agent Speech Bubble Popup */}
          {agentSpeech && (
            <div className="absolute top-14 left-8 sm:top-16 sm:left-12 z-20 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-slate-700 animate-message-pop max-w-[240px] sm:max-w-xs flex items-center gap-2">
              <Smile className="w-4 h-4 text-moodle-orange shrink-0" />
              <span>{agentSpeech}</span>
            </div>
          )}
        </div>

        {/* Chat Feed Area */}
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 min-h-[380px] sm:min-h-[460px] max-h-[60vh] sm:max-h-[620px] shadow-xs custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-4 animate-message-pop ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Modi Avatar */}
              {msg.sender === 'modi' && (
                <div 
                  onClick={handleAgentClick}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-moodle-orange to-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs mt-1 cursor-pointer hover:scale-105 transition-transform"
                >
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}

              {/* Message Content Bubble Container */}
              <div className={`max-w-[92%] sm:max-w-[82%] space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-moodle-orange text-white rounded-tr-none font-medium'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text && (
                    <div className="whitespace-pre-wrap">
                      {msg.text.split('**').map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className={msg.sender === 'user' ? 'font-bold text-orange-100 underline decoration-orange-300/40' : 'font-bold text-slate-900'}>
                            {part}
                          </strong>
                        ) : part
                      )}
                    </div>
                  )}

                  {/* Modi Working Animation */}
                  {msg.isWorking && (
                    <div className="flex items-center gap-2.5 py-1 text-moodle-orange font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin text-moodle-orange shrink-0" />
                      <span className="text-xs">Modi está procesando tu solicitud...</span>
                    </div>
                  )}

                  {/* Error Box */}
                  {msg.error && (
                    <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Detalle del inconveniente:</p>
                        <p className="font-mono text-[11px] mt-0.5 break-all">{msg.error}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resource Preview Card with Moodle HTML Rendering Tab */}
                {(msg.preview || msg.result?.item_recurso || msg.result?.datos_ia) && (() => {
                  const htmlContent = msg.preview?.descripcion_html || msg.result?.item_recurso?.descripcion_html || msg.result?.datos_ia?.descripcion_html || msg.result?.descripcion_html || '';
                  const currentTab = previewTabMap[msg.id] || (htmlContent ? 'html' : 'summary');

                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs">
                      {/* Card Header & View Tabs */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-moodle-orange flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Previsualización Recurso Moodle
                        </span>

                        {/* View Tabs */}
                        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setMsgPreviewTab(msg.id, 'html')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                              currentTab === 'html'
                                ? 'bg-white text-moodle-navy font-bold shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 text-moodle-orange" /> Vista Moodle (HTML)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMsgPreviewTab(msg.id, 'summary')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                              currentTab === 'summary'
                                ? 'bg-white text-moodle-navy font-bold shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <LayoutList className="w-3.5 h-3.5 text-slate-500" /> Ficha Técnica
                          </button>
                        </div>
                      </div>

                      {/* Tab 1: Ficha Técnica (Summary) */}
                      {currentTab === 'summary' ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">
                              {msg.preview?.nombre || msg.result?.item_recurso?.nombre || msg.result?.publicado || msg.result?.datos_ia?.nombre || 'Generando título...'}
                            </p>
                            {(msg.preview?.categoria_moodle || msg.result?.item_recurso?.categoria_moodle || msg.result?.datos_ia?.categoria_moodle) && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-700 font-mono border border-slate-200 font-semibold shadow-2xs shrink-0">
                                {msg.preview?.categoria_moodle || msg.result?.item_recurso?.categoria_moodle || msg.result?.datos_ia?.categoria_moodle}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                            {(msg.preview?.empresa || msg.result?.item_recurso?.empresa || msg.result?.datos_ia?.empresa) && (
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">Empresa: <strong className="text-slate-900">{msg.preview?.empresa || msg.result?.item_recurso?.empresa || msg.result?.datos_ia?.empresa}</strong></span>
                              </div>
                            )}
                            {(msg.preview?.course_id || msg.result?.item_recurso?.course_id || msg.result?.cursos_afectados) && (
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-moodle-orange shrink-0" />
                                <span className="truncate">Cursos: <strong className="text-moodle-orange">{JSON.stringify(msg.preview?.course_id || msg.result?.item_recurso?.course_id || msg.result?.cursos_afectados)}</strong></span>
                              </div>
                            )}
                          </div>

                          {(msg.preview?.url || msg.result?.item_recurso?.url || msg.result?.datos_ia?.url) && (
                            <div className="pt-1">
                              <a
                                href={msg.preview?.url || msg.result?.item_recurso?.url || msg.result?.datos_ia?.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline break-all"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" /> Ver Enlace Destino
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Tab 2: Vista Moodle SEA (HTML Enriquecido) */
                        <div className="space-y-2">
                          {htmlContent ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-96 overflow-y-auto custom-scrollbar shadow-inner text-slate-800 text-xs leading-relaxed font-sans">
                              <div className="text-[10px] font-mono text-slate-400 mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                                <span>🌐 Vista previa tal como se inyecta en Moodle SEA (TinyMCE)</span>
                                <span>HTML: {htmlContent.length} chars</span>
                              </div>
                              <div
                                className="prose prose-sm max-w-none text-slate-800 [&_img]:max-h-48 [&_img]:rounded-lg [&_img]:shadow-xs [&_a]:text-sky-600 [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                              />
                            </div>
                          ) : (
                            <div className="p-4 text-center text-slate-400 italic text-xs bg-white rounded-xl border border-slate-200">
                              No hay contenido HTML retornado para previsualizar.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Banner when published */}
                      {msg.result?.status === 'pending_approval' && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, result: { ...m.result, status: 'cancelled' }, text: 'Publicación cancelada por el usuario.' } : m));
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePublishPrepared(msg.id, msg.result.item_recurso, msg.preview?.course_id || msg.result.item_recurso?.course_id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-moodle-orange hover:bg-moodle-orangeHover rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Aprobar y Publicar
                          </button>
                        </div>
                      )}
                      
                      {msg.result?.cursos_afectados && msg.result?.status !== 'pending_approval' && (
                        <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Publicado con éxito en Moodle (Cursos: {JSON.stringify(msg.result.cursos_afectados)})</span>
                        </div>
                      )}
                      
                      {msg.result?.status === 'cancelled' && (
                        <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 shrink-0" />
                          <span>Publicación descartada</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Execution Logs Dropdown */}
                {msg.logs && msg.logs.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleLogs(msg.id)}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px]">
                        <Terminal className="w-3.5 h-3.5 text-moodle-orange shrink-0" />
                        Logs ({msg.logs.length} eventos)
                      </span>
                      {msg.logsOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {msg.logsOpen && (
                      <div className="p-2.5 sm:p-3 bg-slate-900 text-slate-100 border-t border-slate-200 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[10px] sm:text-[11px] custom-scrollbar">
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

                <div className={`text-[10px] text-slate-400 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>

              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
                </div>
              )}

            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Examples */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-moodle-orange" /> Ejemplos de mensaje sugeridos:
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputMessage(ex.text)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-orange-50/60 border border-slate-200 text-slate-700 hover:text-moodle-orange text-[11px] sm:text-xs font-medium transition-all shadow-2xs active:scale-95 text-left"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-sm flex items-end gap-2 sm:gap-2.5 relative"
        >
          <div className="flex-1 relative flex flex-col">
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
              placeholder="Escribe o pega la descripción del evento, URLs y detalles..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 pr-9 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-moodle-orange/30 focus:border-moodle-orange transition-all resize-none placeholder-slate-400 font-sans"
            />
            
            {/* Expand Textarea Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              title="Ampliar pantalla de texto"
              className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-moodle-orange hover:bg-orange-50 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`min-h-[44px] sm:min-h-[48px] px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-white text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shrink-0 active:scale-95 ${
              isLoading || !inputMessage.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                : 'bg-moodle-orange hover:bg-moodle-orangeHover moodle-glow'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden xs:inline">Enviar</span>
              </>
            )}
          </button>
        </form>

      </main>

      {/* Expanded Text Editor Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-message-pop">
          <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-moodle-orange shrink-0">
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Editor Extendido de Texto</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">Espacio amplio para redactar o pegar convocatorias</p>
                </div>
              </div>

              <div className="flex items-center justify-between xs:justify-end w-full xs:w-auto gap-3 pt-1 xs:pt-0">
                <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                  {inputMessage.length} car. • {inputMessage.trim() ? inputMessage.trim().split(/\s+/).length : 0} pal.
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Presets inside Modal */}
            <div className="px-4 sm:px-6 py-2 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap custom-scrollbar">
              <span className="text-slate-500 font-semibold shrink-0 text-[11px]">Plantillas:</span>
              {PRESET_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputMessage(ex.text)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-moodle-orange text-[11px] font-medium shrink-0 shadow-2xs"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Modal Body / Large Textarea */}
            <div className="p-3 sm:p-6 flex-1 flex flex-col min-h-[220px] sm:min-h-[340px]">
              <textarea
                autoFocus
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe o pega aquí la descripción detallada del curso o convocatoria..."
                className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-moodle-orange/30 focus:border-moodle-orange font-sans leading-relaxed resize-none custom-scrollbar"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50/80 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setInputMessage('')}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Limpiar Texto
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 xs:flex-none px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-200/60 font-semibold text-xs transition-colors text-center"
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  disabled={isLoading || !inputMessage.trim()}
                  onClick={() => handleSendMessage()}
                  className={`flex-1 xs:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-white text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
                    isLoading || !inputMessage.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-moodle-orange hover:bg-moodle-orangeHover'
                  }`}
                >
                  <Send className="w-4 h-4" /> Enviar a Modi
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-600">Modi: Agente Autónomo Moodle SEA Acatlán - FES Acatlán UNAM 2026</p>
      </footer>
    </div>
  );
}

