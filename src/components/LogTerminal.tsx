'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Trash2, Check, AlertCircle, Info, CheckCircle2, ShieldAlert, ArrowDown } from 'lucide-react';

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
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => filter === 'all' || log.level === filter);

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return (
          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.5 rounded text-[11px]">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> ERROR
          </span>
        );
      case 'warn':
        return (
          <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded text-[11px]">
            <AlertCircle className="w-3 h-3 text-amber-400" /> WARN
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-sky-400 font-medium bg-sky-950/60 border border-sky-800/60 px-1.5 py-0.5 rounded text-[11px]">
            <Info className="w-3 h-3 text-sky-400" /> INFO
          </span>
        );
    }
  };

  return (
    <div className="bg-moodle-darkNavy rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col h-[520px]">
      
      {/* Terminal Header Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 text-slate-200 font-mono text-sm font-semibold pl-2 border-l border-slate-700">
            <Terminal className="w-4 h-4 text-moodle-orange" /> Consola de Logs Moodi (Playwright / Moodle)
          </div>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-moodle-orange bg-moodle-orange/10 border border-moodle-orange/30 px-2 py-0.5 rounded-full font-sans font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-moodle-orange animate-ping" /> Ejecutando automatización...
            </span>
          )}
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors capitalize ${
                  filter === lvl
                    ? 'bg-moodle-orange text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {lvl === 'all' ? 'Todos' : lvl}
              </button>
            ))}
          </div>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title="Alternar desplazamiento automático"
            className={`p-1.5 rounded-lg border transition-colors ${
              autoScroll
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
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

          {/* Clear Button */}
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/50 text-rose-300 transition-colors"
            title="Limpiar consola"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>

        </div>

      </div>

      {/* Log Terminal Screen */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2 bg-[#090D16]">
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

      {/* Footer Info */}
      <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Total Registros: {logs.length}</span>
        <span className="text-slate-500 font-mono">FastAPI Stream SSE Endpoint Enabled</span>
      </div>

    </div>
  );
};
