import React from 'react';
import { Award, BookOpen, PenTool, Settings, Building2 } from 'lucide-react';

export default function Header({ activeView, setActiveView, config }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('config')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/30 animate-pulse-slow">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Gabarit<span className="gradient-text">ei</span></span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">PWA</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Treino de Alta Performance</p>
            </div>
          </div>

          {/* Active Cargo Indicator */}
          {config.cargo && (
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Alvo: <strong className="text-white font-semibold">{config.cargo}</strong></span>
              {config.banca && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {config.banca.split(' ')[0]}
                  </span>
                </>
              )}
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-mono font-bold">{config.diasRestantes} dias restantes</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveView('config')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeView === 'config'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurar</span>
            </button>

            <button
              onClick={() => setActiveView('questoes')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeView === 'questoes'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Questões</span>
            </button>

            <button
              onClick={() => setActiveView('redacao')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 relative cursor-pointer ${
                activeView === 'redacao'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <PenTool className="w-4 h-4 text-purple-400" />
              <span>Redação</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 text-[8px] text-white items-center justify-center font-bold">IA</span>
              </span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
}
