'use client';

import React from 'react';
import { Shield, Server, Key, Sparkles, BookOpen, Globe } from 'lucide-react';

interface HeaderProps {
  apiBaseUrl: string;
  setApiBaseUrl: (val: string) => void;
  apiSecret: string;
  setApiSecret: (val: string) => void;
  serverStatus: 'online' | 'offline' | 'checking';
  onCheckStatus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiBaseUrl,
  setApiBaseUrl,
  apiSecret,
  setApiSecret,
  serverStatus,
  onCheckStatus,
}) => {
  return (
    <header className="bg-moodle-navy text-white shadow-lg border-b-4 border-moodle-orange">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-row items-center justify-between gap-3">

          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-moodle-orange to-amber-600 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-md moodle-glow shrink-0 tracking-tighter">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Moodi <span className="text-moodle-orange text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-moodle-orange/20 border border-moodle-orange/30 font-semibold font-mono">AGENTE IA</span>
                </h1>
                <span className="hidden sm:flex bg-moodle-orange/20 text-moodle-orange border border-moodle-orange/30 text-xs font-semibold px-2 py-0.5 rounded-full items-center gap-1">
                  <Sparkles className="w-3 h-3" /> v2.0 AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-moodle-orange" /> Agente Inteligente Moodle
              </p>
            </div>
          </div>

          {/* Configuration & Status Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Status Badge - ALWAYS VISIBLE (Mobile & Desktop) */}
            <button
              onClick={onCheckStatus}
              title="Haz clic para volver a comprobar la conexión"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-colors text-xs shrink-0"
            >
              <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              {serverStatus === 'checking' && (
                <span className="flex items-center gap-1 text-amber-400 font-medium text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> Comprobando...
                </span>
              )}
              {serverStatus === 'online' && (
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
                </span>
              )}
              {serverStatus === 'offline' && (
                <span className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Desconectado
                </span>
              )}
            </button>

            {/* API Base URL Input - HIDDEN ON MOBILE (< md) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <Globe className="w-4 h-4 text-sky-400" />
              <label htmlFor="apiBaseUrlHeader" className="text-slate-300 font-medium hidden sm:inline">Backend API:</label>
              <input
                id="apiBaseUrlHeader"
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://..."
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2 py-0.5 w-44 md:w-56 focus:outline-none focus:border-moodle-orange transition-colors font-mono text-[11px]"
              />
            </div>

            {/* Token Input - HIDDEN ON MOBILE (< md) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <Key className="w-4 h-4 text-moodle-orange" />
              <label htmlFor="apiSecretHeader" className="text-slate-300 font-medium hidden sm:inline">Token:</label>
              <input
                id="apiSecretHeader"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="x-token"
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2 py-0.5 w-28 focus:outline-none focus:border-moodle-orange transition-colors"
              />
            </div>

            {/* Moodle Quick Badge */}
            <div className="hidden xl:flex items-center gap-1 bg-moodle-orange/10 border border-moodle-orange/20 text-moodle-orange text-xs px-3 py-1.5 rounded-lg font-medium">
              <Shield className="w-3.5 h-3.5" /> FES Acatlán
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
