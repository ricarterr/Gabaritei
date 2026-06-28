import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Pause, Play, RotateCcw } from 'lucide-react';

export default function Timer({ duracaoMinutos, onFinish }) {
  const [segundosRestantes, setSegundosRestantes] = useState(duracaoMinutos * 60);
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    setSegundosRestantes(duracaoMinutos * 60);
    setAtivo(true);
  }, [duracaoMinutos]);

  useEffect(() => {
    let intervalo = null;
    if (ativo && segundosRestantes > 0) {
      intervalo = setInterval(() => {
        setSegundosRestantes((prev) => prev - 1);
      }, 1000);
    } else if (segundosRestantes === 0 && ativo) {
      setAtivo(false);
      if (onFinish) onFinish();
    }
    return () => clearInterval(intervalo);
  }, [ativo, segundosRestantes, onFinish]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const tempoFormatado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  const tempoAcabando = segundosRestantes < 300 && segundosRestantes > 0; // Menos de 5 minutos

  return (
    <div className={`sticky top-16 sm:top-20 z-30 w-full px-4 py-2.5 backdrop-blur-md border-b transition-colors duration-300 ${
      tempoAcabando 
        ? 'bg-rose-950/90 border-rose-800 text-rose-200' 
        : 'bg-slate-900/90 border-slate-800 text-slate-200'
    }`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 rounded-lg ${tempoAcabando ? 'bg-rose-600 text-white animate-pulse' : 'bg-brand-600/20 text-brand-400'}`}>
            {tempoAcabando ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block sm:inline mr-2">Tempo Simulado</span>
            <span className={`font-mono text-lg sm:text-xl font-black ${tempoAcabando ? 'text-rose-400' : 'text-white'}`}>
              {tempoFormatado}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAtivo(!ativo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              ativo 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
            }`}
          >
            {ativo ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Retomar</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setSegundosRestantes(duracaoMinutos * 60);
              setAtivo(true);
            }}
            title="Reiniciar Timer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
