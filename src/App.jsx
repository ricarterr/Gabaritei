import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import QuestionCard from './components/QuestionCard';
import EditorTexto from './components/EditorTexto';

export default function App() {
  const [activeView, setActiveView] = useState('config');
  const [config, setConfig] = useState({
    concursoId: 'pf-agente',
    categoria: 'Carreiras Policiais',
    cargo: 'Polícia Federal - Agente da PF',
    banca: 'CEBRASPE (Certo/Errado & Múltipla Escolha)',
    dataConcurso: '2026-11-15',
    diasRestantes: 141,
    duracaoMinutos: 30
  });

  const handleGenerateTraining = (newConfig) => {
    setConfig(newConfig);
    setActiveView('questoes');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-600 selection:text-white">
      <Header activeView={activeView} setActiveView={setActiveView} config={config} />

      <main className="flex-1">
        {activeView === 'config' && (
          <Dashboard config={config} onGenerateTraining={handleGenerateTraining} />
        )}

        {activeView === 'questoes' && (
          <QuestionCard config={config} />
        )}

        {activeView === 'redacao' && (
          <EditorTexto config={config} />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Gabaritei PWA. Alta Performance em Concursos Públicos.</p>
          <p className="mt-1">Desenvolva com consistência. O sucesso é questão de treino diário.</p>
        </div>
      </footer>
    </div>
  );
}
