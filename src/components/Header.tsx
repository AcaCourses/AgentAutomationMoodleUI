'use client';

import React, { useState } from 'react';
import { Shield, Server, Key, Sparkles, BookOpen, Globe, Settings } from 'lucide-react';

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
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  return (
    <header className="bg-white text-slate-800 shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-3">

          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-moodle-orange to-amber-500 flex items-center justify-center text-white font-extrabold text-lg sm:text-2xl shadow-md agent-ring-pulse shrink-0 tracking-tighter">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Modi <span className="text-moodle-orange text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 font-semibold font-mono">AGENTE IA</span>
                </h1>
                <span className="hidden sm:flex bg-orange-50 text-moodle-orange border border-orange-200 text-xs font-semibold px-2 py-0.5 rounded-full items-center gap-1">
                  <Sparkles className="w-3 h-3 text-moodle-orange" /> v2.0 SEA
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                <BookOpen className="w-3 h-3 text-moodle-orange shrink-0" /> <span className="truncate">Automatización Moodle • FES Acatlán</span>
              </p>
            </div>
          </div>

          {/* Configuration & Status Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">

            {/* Status Badge */}
            <button
              onClick={onCheckStatus}
              title="Haz clic para volver a comprobar la conexión"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200/70 transition-all text-xs font-medium text-slate-700 shrink-0 shadow-2xs"
            >
              <Server className="w-3.5 h-3.5 text-slate-500" />
              {serverStatus === 'checking' && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold text-[11px] sm:text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> <span className="hidden xs:inline">Comprobando</span>
                </span>
              )}
              {serverStatus === 'online' && (
                <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] sm:text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
                </span>
              )}
              {serverStatus === 'offline' && (
                <span className="flex items-center gap-1 text-rose-600 font-bold text-[11px] sm:text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Offline
                </span>
              )}
            </button>

            {/* Mobile Settings Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title="Configuración de Backend"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* API Base URL Input - DESKTOP (>= md) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Globe className="w-4 h-4 text-sky-500" />
              <label htmlFor="apiBaseUrlHeader" className="text-slate-600 font-medium hidden lg:inline">Backend:</label>
              <input
                id="apiBaseUrlHeader"
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://..."
                className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-0.5 w-40 lg:w-56 focus:outline-none focus:ring-2 focus:ring-moodle-orange/30 focus:border-moodle-orange transition-colors font-mono text-[11px]"
              />
            </div>

            {/* Token Input - DESKTOP (>= md) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Key className="w-4 h-4 text-moodle-orange" />
              <label htmlFor="apiSecretHeader" className="text-slate-600 font-medium hidden lg:inline">Token:</label>
              <input
                id="apiSecretHeader"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="x-token"
                className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-0.5 w-24 focus:outline-none focus:ring-2 focus:ring-moodle-orange/30 focus:border-moodle-orange transition-colors"
              />
            </div>

            {/* Moodle Quick Badge */}
            <div className="hidden xl:flex items-center gap-1 bg-orange-50 border border-orange-200 text-moodle-orange text-xs px-3 py-1.5 rounded-xl font-semibold shadow-2xs">
              <Shield className="w-3.5 h-3.5" /> FES Acatlán
            </div>

          </div>

        </div>

        {/* Mobile Settings Collapsible Drawer */}
        {showMobileSettings && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 md:hidden flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-message-pop text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-500 shrink-0" />
              <label htmlFor="apiBaseUrlMobile" className="text-slate-600 font-semibold w-16">Backend:</label>
              <input
                id="apiBaseUrlMobile"
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none focus:border-moodle-orange"
              />
            </div>

            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-moodle-orange shrink-0" />
              <label htmlFor="apiSecretMobile" className="text-slate-600 font-semibold w-16">Token:</label>
              <input
                id="apiSecretMobile"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="x-token"
                className="flex-1 bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-moodle-orange"
              />
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
