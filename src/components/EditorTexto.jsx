import React, { useState } from 'react';
import { CheckCircle2, FileText, Loader2, MessageSquare, PenTool, Send, Sparkles, AlertCircle } from 'lucide-react';
import { evaluateEssay } from '../services/api';

const TEMAS_POR_CARGO = {
  'Agente da PF': 'Os desafios da segurança pública na era cibernética e o combate às organizações criminosas transnacionais no Brasil.',
  'Escrivão da PF': 'A preservação da cadeia de custódia da prova digital e seu impacto na eficácia da persecução penal.',
  'Policial Rodoviário Federal (PRF)': 'O papel do policiamento ostensivo nas rodovias federais para a segurança pública e o desenvolvimento econômico nacional.',
  'Técnico do INSS': 'A digitalização dos serviços previdenciários e a garantia de acesso aos direitos fundamentais para a população idosa e vulnerável.',
  'Analista Judiciário TRT': 'O impacto das novas relações de trabalho e da inteligência artificial no Direito do Trabalho contemporâneo.',
  'Auditor Fiscal da Receita': 'A reforma tributária e a simplificação do sistema fiscal como instrumentos para a justiça social e competitividade econômica.'
};

export default function EditorTexto({ config }) {
  const cargoAtual = config.cargo || 'Agente da PF';
  const temaProposto = TEMAS_POR_CARGO[cargoAtual] || 'A importância da ética na administração pública e o compromisso com o interesse social.';

  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Contador de palavras
  const contagemPalavras = texto.trim() === '' ? 0 : texto.trim().split(/\s+/).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contagemPalavras < 10) return;
    
    setLoading(true);
    setFeedback(null);
    try {
      const resp = await evaluateEssay(texto, cargoAtual, temaProposto);
      setFeedback(resp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Banner de Cabeçalho */}
      <div className="glass-panel p-6 sm:p-8 mb-8 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">Módulo de Discursiva / Redação</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Correção Automatizada via IA</h2>
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Tema Proposto ({cargoAtual})</span>
          <p className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            "{temaProposto}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor de Texto (2 colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="glass-panel p-6 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-brand-400" /> Folha de Resposta Digital
              </span>
              <span className={`px-2.5 py-1 rounded-full font-mono ${
                contagemPalavras < 100 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {contagemPalavras} palavras
              </span>
            </div>

            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              disabled={loading}
              placeholder="Digite aqui o texto da sua redação ou questão discursiva. Desenvolva seus parágrafos com introdução, desenvolvimento e conclusão argumentativa..."
              rows={14}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-600 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none transition-all font-sans"
            ></textarea>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-500">Mínimo recomendado: 150 palavras</span>
              
              <button
                type="submit"
                disabled={loading || contagemPalavras < 10}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  loading || contagemPalavras < 10
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 text-white hover:opacity-90 shadow-purple-600/30'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Analisando com IA (3s)...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar para Correção via IA</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card de Feedback Estruturado (1 coluna) */}
        <div className="lg:col-span-1">
          {loading && (
            <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center gap-4 animate-pulse border-purple-500/30">
              <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg mb-1">Avaliando Redação</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A Inteligência Artificial está analisando coerência, coesão, norma culta e aderência ao tema...
                </p>
              </div>
            </div>
          )}

          {!loading && !feedback && (
            <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center gap-4 border-slate-800/80 text-slate-500">
              <FileText className="w-12 h-12 stroke-1" />
              <div>
                <h4 className="font-semibold text-slate-400 mb-1">Aguardando Envio</h4>
                <p className="text-xs leading-relaxed">
                  Escreva seu texto e clique no botão de enviar para receber uma avaliação detalhada com nota e dicas de melhoria.
                </p>
              </div>
            </div>
          )}

          {!loading && feedback && (
            <div className="glass-panel p-6 space-y-6 animate-fade-in border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 shadow-2xl">
              
              {/* Nota Geral */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nota Estimada</span>
                  <span className="text-xs text-emerald-400 font-semibold">Critérios Banca Examinadora</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <span className="text-2xl font-black text-slate-950">{feedback.nota}</span>
                </div>
              </div>

              {/* Estrutura */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Estrutura & Coerência
                </h5>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-5 border-l-2 border-indigo-500/50">
                  {feedback.estrutura}
                </p>
              </div>

              {/* Norma Culta */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Norma Culta
                </h5>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-5 border-l-2 border-purple-500/50">
                  {feedback.normaCulta}
                </p>
              </div>

              {/* Dicas de Melhoria */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Dicas para Gabaritar
                </h5>
                <ul className="space-y-2">
                  {feedback.dicas.map((dica, idx) => (
                    <li key={idx} className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{dica}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
