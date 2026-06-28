import React, { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle, ChevronLeft, ChevronRight, Eye, Layers, Lightbulb, RefreshCw, XCircle, Building2, Download } from 'lucide-react';
import { fetchQuestions, BACKEND_URL } from '../services/api';
import { gerarCadernoPDF } from '../utils/generatePDF';
import Timer from './Timer';

export default function QuestionCard({ config }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [modoLista, setModoLista] = useState(false);
  const [filtroOrigem, setFiltroOrigem] = useState('todas'); // 'todas' | 'real' | 'inedita'
  const [extraindo, setExtraindo] = useState(false);

  useEffect(() => {
    loadData();
  }, [config.concursoId]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchQuestions(config.concursoId, config.cargo, config.banca);
    setQuestions(data);
    setLoading(false);
  };

  const handleExtrairWeb = async () => {
    setExtraindo(true);
    try {
      const url = `${BACKEND_URL}/api/extrair-provas?concursoId=${encodeURIComponent(config.concursoId)}&cargo=${encodeURIComponent(config.cargo)}&banca=${encodeURIComponent(config.banca || 'CEBRASPE/FGV')}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(prev => {
            const ids = new Set(prev.map(p => p.id));
            const novos = data.questions.filter(q => !ids.has(q.id));
            return [...prev, ...novos];
          });
          setFiltroOrigem('real');
          setCurrentIndex(0);
        }
      }
    } catch (e) {
      console.log('Erro ao extrair da web:', e);
    }
    setExtraindo(false);
  };

  const filteredQuestions = questions.filter(q => {
    if (filtroOrigem === 'todas') return true;
    const isReal = q.enunciado.includes('Prova Real') || q.origem === 'real';
    if (filtroOrigem === 'real') return isReal;
    if (filtroOrigem === 'inedita') return !isReal;
    return true;
  });

  const handleSelectOption = (qId, optionIdx) => {
    if (respostas[qId] !== undefined) return;
    setRespostas(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let acertos = 0;
    let respondidas = 0;
    filteredQuestions.forEach(q => {
      if (respostas[q.id] !== undefined) {
        respondidas++;
        if (respostas[q.id] === q.correta) acertos++;
      }
    });
    return { acertos, respondidas, total: filteredQuestions.length };
  };

  const handleDownloadPDF = () => {
    if (filteredQuestions.length === 0) return;
    gerarCadernoPDF(config, filteredQuestions);
  };

  const score = calculateScore();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-500" />
        <p className="font-semibold">Buscando questões da banca <strong className="text-white">{config.banca || 'CEBRASPE/FGV'}</strong> para <span className="text-brand-400 font-bold">{config.cargo}</span>...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 glass-panel p-8 text-center">
        <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Nenhuma questão encontrada</h3>
        <p className="text-slate-400 text-sm mb-6">Não encontramos questões específicas para este concurso no modo offline. Tente outro concurso na aba Configurar.</p>
        <button onClick={loadData} className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold">Tentar Novamente</button>
      </div>
    );
  }

  const renderQuestionItem = (q, idx) => {
    const respondida = respostas[q.id] !== undefined;
    const selecionada = respostas[q.id];
    const acertou = selecionada === q.correta;

    return (
      <div key={q.id} className="glass-panel p-6 sm:p-8 mb-6 animate-fade-in border-slate-800">
        
        {/* Cabeçalho da Questão com Banca */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-black text-brand-400 border border-slate-700">
              #{idx + 1}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-800/40">
              {q.materia}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-800/40 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {q.banca} ({q.ano})
            </span>
          </div>

          {respondida && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              acertou 
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' 
                : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
            }`}>
              {acertou ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              <span>{acertou ? 'RESPOSTA CORRETA' : 'RESPOSTA INCORRETA'}</span>
            </div>
          )}
        </div>

        {/* Enunciado */}
        <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed mb-6">
          {q.enunciado}
        </p>

        {/* Alternativas */}
        <div className="space-y-3 mb-6">
          {q.alternativas.map((alt, altIdx) => {
            const letra = String.fromCharCode(65 + altIdx);
            let btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';
            
            if (respondida) {
              if (altIdx === q.correta) {
                btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950';
              } else if (altIdx === selecionada) {
                btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 line-through opacity-80';
              } else {
                btnStyle = 'bg-slate-900/30 border-slate-800/50 text-slate-500 opacity-50';
              }
            }

            return (
              <button
                key={altIdx}
                disabled={respondida}
                onClick={() => handleSelectOption(q.id, altIdx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                  respondida && altIdx === q.correta
                    ? 'bg-emerald-500 text-slate-950'
                    : respondida && altIdx === selecionada
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {letra}
                </span>
                <span className="text-sm sm:text-base leading-snug pt-0.5">{alt}</span>
              </button>
            );
          })}
        </div>

        {/* Comentário do Professor */}
        {respondida && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-inner animate-fade-in">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-sm mb-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>Comentário do Professor (Gabarito Comentado)</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pl-7">
              {q.comentario}
            </p>
          </div>
        )}

      </div>
    );
  };

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  return (
    <div className="pb-16 animate-fade-in">
      <Timer duracaoMinutos={config.duracaoMinutos || 30} />

      <div className="max-w-4xl mx-auto px-4 pt-6">
        
        {/* Seletor de Abas: Questões Reais de Provas vs Questões Inéditas IA */}
        <div className="glass-panel p-3 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-3 border-slate-800 shadow-xl">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => { setFiltroOrigem('todas'); setCurrentIndex(0); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroOrigem === 'todas'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>📚 Todas ({questions.length})</span>
            </button>
            <button
              onClick={() => { setFiltroOrigem('real'); setCurrentIndex(0); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroOrigem === 'real'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>📜 Provas Reais Anteriores ({questions.filter(q => q.enunciado.includes('Prova Real') || q.origem === 'real').length})</span>
            </button>
            <button
              onClick={() => { setFiltroOrigem('inedita'); setCurrentIndex(0); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filtroOrigem === 'inedita'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>🤖 Previsão IA (O que vai cair) ({questions.filter(q => !q.enunciado.includes('Prova Real') && q.origem !== 'real').length})</span>
            </button>
          </div>

          {/* Botão de Extrair Provas Reais da Internet */}
          <button
            onClick={handleExtrairWeb}
            disabled={extraindo}
            title="Conecta aos servidores de provas (PCI/QConcursos) e extrai para o banco local"
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 disabled:opacity-50 text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${extraindo ? 'animate-spin' : ''}`} />
            <span>{extraindo ? 'Extraindo Prova da Web...' : '📥 Baixar Prova Real da Web'}</span>
          </button>
        </div>

        <div className="glass-panel p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-300">
                Respondidas: <strong className="text-white font-bold">{score.respondidas} / {score.total}</strong>
              </span>
            </div>
            {score.respondidas > 0 && (
              <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
                <span className="text-xs sm:text-sm text-emerald-400 font-bold">
                  {score.acertos} Acerto(s) ({Math.round((score.acertos / score.respondidas) * 100)}%)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              title="Baixar Caderno de Simulado em PDF"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 border border-emerald-500/30 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar PDF ({filteredQuestions.length} questões)</span>
            </button>

            <button
              onClick={() => setModoLista(!modoLista)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-brand-400" />
              <span>{modoLista ? 'Modo Focado (1 por vez)' : 'Modo Lista Rolável'}</span>
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="glass-panel p-8 text-center my-8">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Nenhuma questão nesta aba</h3>
            <p className="text-slate-400 text-sm mb-4">Clique no botão "📥 Baixar Prova Real da Web" acima para extrair provas deste concurso!</p>
            <button onClick={() => setFiltroOrigem('todas')} className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs">Ver Todas as Questões</button>
          </div>
        ) : modoLista ? (
          <div>{filteredQuestions.map((q, idx) => renderQuestionItem(q, idx))}</div>
        ) : (
          <div>
            {currentQ && renderQuestionItem(currentQ, currentIndex)}
            <div className="flex items-center justify-between gap-4 mt-6">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className={`px-5 py-3 rounded-xl border flex items-center gap-2 font-bold text-sm transition-all ${
                  currentIndex === 0
                    ? 'bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white cursor-pointer shadow-md'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <span className="text-sm font-bold text-slate-400 font-mono">
                {currentIndex + 1} de {filteredQuestions.length}
              </span>

              <button
                disabled={currentIndex === filteredQuestions.length - 1}
                onClick={() => setCurrentIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                className={`px-5 py-3 rounded-xl border flex items-center gap-2 font-bold text-sm transition-all ${
                  currentIndex === filteredQuestions.length - 1
                    ? 'bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-500 border-brand-500 text-white cursor-pointer shadow-lg shadow-brand-600/30'
                }`}
              >
                Próxima <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
