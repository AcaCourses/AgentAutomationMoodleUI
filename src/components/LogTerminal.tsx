'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2, Check, AlertCircle, Info, CheckCircle2, ShieldAlert, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warn' | 'error';
}

interface LogTerminalProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  isRunning: boolean;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({ logs, onClearLogs, isRunning }) => {
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warn' | 'error'>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Latest log entry for mobile preview
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && terminalEndRef.current && isMobileExpanded) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isMobileExpanded]);

  const filteredLogs = logs.filter((log) => filter === 'all' || log.level === filter);

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClearLogs();
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return (
          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded text-[11px] shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.5 rounded text-[11px] shrink-0">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> ERROR
          </span>
        );
      case 'warn':
        return (
          <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded text-[11px] shrink-0">
            <AlertCircle className="w-3 h-3 text-amber-400" /> WARN
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-sky-400 font-medium bg-sky-950/60 border border-sky-800/60 px-1.5 py-0.5 rounded text-[11px] shrink-0">
            <Info className="w-3 h-3 text-sky-400" /> INFO
          </span>
        );
    }
  };

  return (
    <div className="bg-moodle-darkNavy rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col transition-all">
      
      {/* Terminal Header Bar (Clickable on Mobile to Toggle Dropdown) */}
      <div 
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="bg-slate-900 px-4 py-3 border-b border-slate-700/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 cursor-pointer md:cursor-default select-none"
      >
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 text-slate-200 font-mono text-xs sm:text-sm font-semibold pl-2 border-l border-slate-700">
              <Terminal className="w-4 h-4 text-moodle-orange shrink-0" />
              <span className="hidden sm:inline">Consola de Logs Moodi</span>
            </div>
            {isRunning && (
              <span className="flex items-center gap-1.5 text-[11px] text-moodle-orange bg-moodle-orange/10 border border-moodle-orange/30 px-2 py-0.5 rounded-full font-sans font-medium animate-pulse shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-moodle-orange animate-ping" /> Ejecutando...
              </span>
            )}
          </div>

          {/* Mobile Dropdown Chevron Indicator */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-[11px] font-sans text-slate-400 font-medium">
              {isMobileExpanded ? 'Ocultar' : 'Ver logs'}
            </span>
            <button 
              type="button" 
              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle terminal logs"
            >
              {isMobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Latest Log Preview (Visible ONLY when collapsed on mobile) */}
        {!isMobileExpanded && (
          <div className="md:hidden mt-1 p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono flex items-center gap-2 overflow-hidden">
            {latestLog ? (
              <>
                <span className="text-slate-500 text-[10px] shrink-0">[{latestLog.timestamp}]</span>
                {getLevelBadge(latestLog.level)}
                <span className="text-slate-200 truncate flex-1">{latestLog.message}</span>
              </>
            ) : (
              <span className="text-slate-500 text-xs font-sans italic">Esperando ejecucion... sin registros aún.</span>
            )}
          </div>
        )}

        {/* Action Controls (In mobile only Copy & Clear are shown) */}
        <div className={`${isMobileExpanded ? 'flex' : 'hidden md:flex'} flex-wrap items-center gap-2 text-xs pt-2 md:pt-0 border-t md:border-t-0 border-slate-800`}>
          
          {/* Level Filter Dropdown (Hidden on mobile < md) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 overflow-x-auto">
            {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter(lvl);
                }}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all capitalize min-h-[30px] flex items-center active:scale-95 ${
                  filter === lvl
                    ? 'bg-moodle-orange text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {lvl === 'all' ? 'Todos' : lvl}
              </button>
            ))}
          </div>

          {/* Auto Scroll Toggle (Hidden on mobile < md) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAutoScroll(!autoScroll);
            }}
            title="Alternar desplazamiento automático"
            className={`hidden md:block p-1.5 rounded-lg border transition-colors ${
              autoScroll
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button (Always visible) */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Copiar logs al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {/* Clear Button (Always visible) */}
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/50 text-rose-300 transition-colors"
            title="Limpiar consola"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>

        </div>

      </div>

      {/* Log Terminal Screen (Hidden on mobile when collapsed, visible on desktop always) */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden md:block'} h-[380px] md:h-[500px] p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2 bg-[#090D16]`}>
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
            <Terminal className="w-10 h-10 stroke-[1.5] text-slate-600" />
            <p className="text-sm font-sans">No hay registros en la consola.</p>
            <p className="text-xs font-sans text-slate-600">
              Envía una publicación para ver la ejecución de Playwright en tiempo real.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 py-1 px-2 rounded hover:bg-slate-800/40 transition-colors border-l-2 border-transparent hover:border-slate-600"
            >
              <span className="text-slate-500 select-none text-[11px] shrink-0 pt-0.5">
                [{log.timestamp}]
              </span>
              <div className="shrink-0 pt-0.5">{getLevelBadge(log.level)}</div>
              <span
                className={`flex-1 break-words leading-relaxed ${
                  log.level === 'error'
                    ? 'text-rose-300 font-semibold'
                    : log.level === 'success'
                    ? 'text-emerald-300 font-medium'
                    : log.level === 'warn'
                    ? 'text-amber-300'
                    : 'text-slate-200'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Footer Info (Hidden on mobile when collapsed) */}
      <div className={`${isMobileExpanded ? 'flex' : 'hidden md:flex'} bg-slate-900/90 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 items-center justify-between`}>
        <span>Total Registros: {logs.length}</span>
        <span className="text-slate-500 font-mono">FastAPI Stream SSE Endpoint Enabled</span>
      </div>

    </div>
  );
};

