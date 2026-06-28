import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, ChevronRight, Flame, Shield, Target, TrendingUp, Zap, Building2, DollarSign, Radio, ExternalLink, Filter, Search, MapPin, Layers, Database, X } from 'lucide-react';
import { CONCURSOS_REAIS, fetchConcursosAtivos, BACKEND_URL } from '../services/api';
import { saveSupabaseConfig } from '../services/supabase';

const CATEGORIAS_ICONS = {
  'Carreiras Policiais': { icon: Shield, color: 'from-blue-600 to-indigo-600' },
  'Tribunais & Administrativo': { icon: Target, color: 'from-purple-600 to-pink-600' },
  'Fiscais & Bancários': { icon: TrendingUp, color: 'from-emerald-600 to-teal-600' },
  'Educação & Saúde': { icon: Layers, color: 'from-amber-600 to-orange-600' }
};

export default function Dashboard({ config, onGenerateTraining }) {
  const [selectedConcursoId, setSelectedConcursoId] = useState(config.concursoId || 'pf-agente');
  const [liveNews, setLiveNews] = useState([]);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supaUrl, setSupaUrl] = useState(localStorage.getItem('supabase_url') || '');
  const [supaKey, setSupaKey] = useState(localStorage.getItem('supabase_key') || '');
  
  // Filtros de Busca e Estado
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroUF, setFiltroUF] = useState('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [scrapedConcursos, setScrapedConcursos] = useState([]);

  const listaCompleta = [...scrapedConcursos, ...CONCURSOS_REAIS];
  const concursoAtual = listaCompleta.find(c => c.id === selectedConcursoId) || listaCompleta[0] || CONCURSOS_REAIS[0];
  
  const [dataConcurso, setDataConcurso] = useState(
    config.dataConcurso || (concursoAtual?.dataPrevista !== 'Sem previsão oficial (Estudo Antecipado)' ? concursoAtual?.dataPrevista : '2026-12-31')
  );
  const [duracaoMinutos, setDuracaoMinutos] = useState(config.duracaoMinutos || 30);
  const [filtroAno, setFiltroAno] = useState(config.filtroAno || 'todos');

  useEffect(() => {
    fetchLiveNews();
  }, []);

  useEffect(() => {
    async function getLiveContests() {
      const ufParam = filtroUF === 'TODOS' ? 'BR' : filtroUF;
      const aoVivo = await fetchConcursosAtivos(ufParam);
      if (aoVivo && aoVivo.length > 0) {
        setScrapedConcursos(aoVivo);
      }
    }
    getLiveContests();
  }, [filtroUF]);

  const fetchLiveNews = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/live-feed`);
      if (res.ok) {
        const data = await res.json();
        if (data.feed) setLiveNews(data.feed);
      }
    } catch (err) {
      setLiveNews([
        { title: "IBGE abre edital de processo seletivo com mais de 8,2 mil vagas no país", link: "https://www.gov.br/ibge", pubDate: "Destaque Oficial" },
        { title: "Concurso CGU é autorizado com 60 vagas para Auditor Federal de Finanças", link: "https://www.gov.br/cgu", pubDate: "MGI Oficial" },
        { title: "Polícia Federal (PEC-PF): Portaria autoriza provimento de 789 cargos", link: "https://www.gov.br/pf", pubDate: "Diário Oficial" }
      ]);
    }
  };

  const handleSelectConcurso = (conc) => {
    setSelectedConcursoId(conc.id);
    if (conc.dataPrevista && conc.dataPrevista !== 'Sem previsão oficial (Estudo Antecipado)' && !conc.dataPrevista.startsWith('A definir')) {
      setDataConcurso(conc.dataPrevista);
    } else {
      setDataConcurso('2026-12-31');
    }
  };

  const calcularDiasRestantes = (dataStr) => {
    if (!dataStr) return 0;
    const hoje = new Date();
    const dataAlvo = new Date(dataStr);
    const diffTime = dataAlvo - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dias = calcularDiasRestantes(dataConcurso);
    onGenerateTraining({
      concursoId: concursoAtual.id,
      categoria: concursoAtual.categoria,
      cargo: concursoAtual.nome,
      banca: concursoAtual.banca,
      dataConcurso,
      diasRestantes: dias,
      duracaoMinutos: Number(duracaoMinutos),
      filtroAno
    });
  };

  const diasRestantesAtual = calcularDiasRestantes(dataConcurso);
  const isSemPrevisao = concursoAtual.dataPrevista === 'Sem previsão oficial (Estudo Antecipado)' || concursoAtual.dataPrevista.startsWith('A definir') || concursoAtual.dataPrevista.startsWith('Sem previsão');

  // Filtragem da Lista de Concursos
  const concursosFiltrados = listaCompleta.filter(c => {
    const matchUF = filtroUF === 'TODOS' || c.uf === filtroUF;
    const matchCat = filtroCategoria === 'TODOS' || c.categoria === filtroCategoria;
    const matchBusca = termoBusca === '' || 
      c.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      c.banca.toLowerCase().includes(termoBusca.toLowerCase()) ||
      c.categoria.toLowerCase().includes(termoBusca.toLowerCase());
    return matchUF && matchCat && matchBusca;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      
      {/* Botão Superior de Conexão com Supabase SQL Real */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowSupabaseModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 border border-emerald-500/30 text-xs font-extrabold text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
        >
          <Database className="w-4 h-4 text-emerald-200" />
          <span>⚡ Conectar Banco Supabase (SQL Real)</span>
        </button>
      </div>

      {/* Modal de Configuração do Supabase */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-emerald-500/40 shadow-2xl relative bg-slate-950">
            <button
              onClick={() => setShowSupabaseModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Conectar Banco Supabase</h3>
                <p className="text-xs text-emerald-400">Armazene dezenas de milhares de questões reais</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Para hospedar no <strong className="text-emerald-400">Supabase</strong> e alimentar com arquivos Open-Source (.json/.sql), cole as credenciais do seu projeto abaixo. O app irá priorizar as questões da tabela <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">questoes</code> diretamente do seu banco de dados!
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Project URL (URL do Projeto):</label>
                <input
                  type="text"
                  placeholder="https://xyzxyz.supabase.co"
                  value={supaUrl}
                  onChange={e => setSupaUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Anon / Public API Key:</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  value={supaKey}
                  onChange={e => setSupaKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-emerald-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => saveSupabaseConfig(supaUrl, supaKey)}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-lg shadow-emerald-600/30"
              >
                💾 Salvar & Conectar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Radar de Notícias ao Vivo (Agregador Legal) */}
      {liveNews.length > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Radar de Editais & Notícias em Tempo Real (Agregador 100% Legal)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {liveNews.slice(0, 3).map((news, idx) => (
              <a
                key={idx}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
              >
                <p className="text-xs font-semibold text-slate-200 group-hover:text-brand-300 transition-colors line-clamp-2">
                  {news.title}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{news.pubDate}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-10 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" /> Catálogo Nacional Completo (2026 / 2027)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Selecione seu <span className="gradient-text">Concurso Alvo</span>
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl">
              Filtre por estado, órgão ou banca em todo o Brasil. Cronogramas verídicos e salários atualizados.
            </p>
          </div>
          
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 w-full md:w-auto border-brand-500/20">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {isSemPrevisao ? 'Meta de Antecipação' : 'Data da Prova'}
              </span>
              <span className="text-2xl font-black text-white">{diasRestantesAtual} <span className="text-sm font-normal text-slate-400">dias</span></span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Filtros de Busca e Lista de Concursos Reais */}
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">1</span>
              Catálogo de Concursos Públicos do Brasil
            </h2>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-brand-400 font-semibold self-start sm:self-auto">
              Exibindo {concursosFiltrados.length} certame(s)
            </span>
          </div>

          {/* Barra de Pesquisa e Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            
            {/* Busca por texto */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cargo, órgão ou banca..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Filtro por Estado (UF) */}
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-400" />
              <select
                value={filtroUF}
                onChange={(e) => setFiltroUF(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none"
              >
                <option value="TODOS">📍 Todos os Estados (Brasil Inteiro)</option>
                <option value="BR">🏛️ BR (Nacional / Federal)</option>
                <option value="AC">AC - Acre</option>
                <option value="AL">AL - Alagoas</option>
                <option value="AP">AP - Amapá</option>
                <option value="AM">AM - Amazonas</option>
                <option value="BA">BA - Bahia</option>
                <option value="CE">CE - Ceará</option>
                <option value="DF">DF - Distrito Federal</option>
                <option value="ES">ES - Espírito Santo</option>
                <option value="GO">GO - Goiás</option>
                <option value="MA">MA - Maranhão</option>
                <option value="MT">MT - Mato Grosso</option>
                <option value="MS">MS - Mato Grosso do Sul</option>
                <option value="MG">MG - Minas Gerais</option>
                <option value="PA">PA - Pará</option>
                <option value="PB">PB - Paraíba</option>
                <option value="PR">PR - Paraná</option>
                <option value="PE">PE - Pernambuco</option>
                <option value="PI">PI - Piauí</option>
                <option value="RJ">RJ - Rio de Janeiro</option>
                <option value="RN">RN - Rio Grande do Norte</option>
                <option value="RS">RS - Rio Grande do Sul</option>
                <option value="RO">RO - Rondônia</option>
                <option value="RR">RR - Roraima</option>
                <option value="SC">SC - Santa Catarina</option>
                <option value="SP">SP - São Paulo</option>
                <option value="SE">SE - Sergipe</option>
                <option value="TO">TO - Tocantins</option>
              </select>
            </div>

            {/* Filtro por Categoria */}
            <div>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              >
                <option value="TODOS">📚 Todas as Áreas & Setores</option>
                <option value="Carreiras Policiais">🛡️ Carreiras Policiais & Forças</option>
                <option value="Tribunais & Administrativo">🎯 Tribunais & Administrativo</option>
                <option value="Fiscais & Bancários">📈 Fiscais & Bancários</option>
                <option value="Educação & Saúde">⚡ Educação & Saúde</option>
              </select>
            </div>

          </div>
          
          {concursosFiltrados.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 my-4">
              <p className="font-semibold text-white mb-1">Nenhum concurso encontrado com esses filtros.</p>
              <p className="text-xs">Tente limpar a busca ou selecionar outro estado/categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
              {concursosFiltrados.map((conc) => {
                const catInfo = CATEGORIAS_ICONS[conc.categoria] || { icon: Target, color: 'from-brand-600 to-indigo-600' };
                const Icon = conc.uf === 'BR' ? Building2 : MapPin;
                const isSelected = selectedConcursoId === conc.id;
                const concSemPrevisao = conc.dataPrevista === 'Sem previsão oficial (Estudo Antecipado)' || conc.dataPrevista.startsWith('A definir') || conc.dataPrevista.startsWith('Sem previsão');

                return (
                  <div
                    key={conc.id}
                    onClick={() => handleSelectConcurso(conc)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/95 border-brand-500 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-brand-400">
                        <CheckCircle2 className="w-5 h-5 fill-brand-500 text-slate-950" />
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center justify-between mb-3 pr-6">
                        <div className="flex items-center gap-2">
                          <span className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                            {conc.uf}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{conc.categoria}</span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-white text-base leading-snug mb-2 pr-4">{conc.nome}</h3>
                      
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Banca: {conc.banca}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Remuneração: {conc.salario}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] text-slate-400">
                      <span className="bg-slate-950/80 px-2.5 py-1 rounded text-amber-300 font-medium leading-tight">{conc.status}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-slate-500">Cronograma Oficial:</span>
                        <span className={`font-mono font-bold ${concSemPrevisao ? 'text-amber-400' : 'text-slate-300'}`}>
                          {conc.dataPrevista}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Filtro de Anos das Questões & Ajuste de Data */}
        <div className="glass-panel p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">2</span>
            Personalizar Questões (Ano/Época) & Meta de Estudo
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Bancas mudam o perfil ao longo dos anos. Filtre questões pela época para focar no estilo recente ou praticar com provas anteriores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Filtro por Ano das Questões */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand-400" /> Período das Questões
              </label>
              <select
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              >
                <option value="todos">Todos os Anos (Catálogo Completo)</option>
                <option value="recentes">Recentes (2023 - 2026)</option>
                <option value="2025">Apenas 2025 / Atualidades</option>
                <option value="2024">Apenas 2024</option>
                <option value="2023">Apenas 2023</option>
                <option value="antigos">2022 ou anteriores (Histórico)</option>
              </select>
            </div>

            {/* Data Alvo / Meta Pessoal */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" /> 
                {isSemPrevisao ? 'Sua Meta Pessoal (Sem Edital)' : 'Data Alvo da Prova'}
              </label>
              <input
                type="date"
                value={dataConcurso}
                onChange={(e) => setDataConcurso(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              {isSemPrevisao && (
                <span className="text-[10px] text-amber-400 mt-1 block font-medium">
                  💡 Como não há edital previsto, defina sua meta de término do ciclo.
                </span>
              )}
            </div>

            {/* Tempo do Simulado */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Duração do Simulado
              </label>
              <select
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              >
                <option value="15">15 Minutos (Tiro Rápido)</option>
                <option value="30">30 Minutos (Padrão)</option>
                <option value="60">1 Hora (Intenso)</option>
                <option value="120">2 Horas (Simulado Completo)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 text-white font-extrabold text-lg shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Confirmar Treino para {concursoAtual.nome}</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </form>
    </div>
  );
}
