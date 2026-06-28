import { createClient } from '@supabase/supabase-js';

// Busca credenciais das variáveis de ambiente, localStorage ou usa o banco oficial configurado
const DEFAULT_URL = 'https://ngyxgawqkctwjjapofkd.supabase.co';
const DEFAULT_KEY = 'sb_publishable_i7B6TKmT7UekMcQhg-GlBw_hQFpBAkm';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || localStorage.getItem('supabase_url') || DEFAULT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || localStorage.getItem('supabase_key') || DEFAULT_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Busca questões reais na tabela 'questoes' do Supabase.
 * Estrutura compatível com a tabela SQL padrão de concursos:
 * id, banca, orgao, ano, cargo, materia, assunto, enunciado, alternativa_a..e, gabarito_correto
 */
export async function fetchQuestionsFromSupabase({ orgao, banca, cargo, materia }) {
  if (!supabase) return null;

  try {
    let query = supabase.from('questoes').select('*');

    if (orgao) {
      // Busca flexível por parte do nome do órgão (ex: PM-PB, TJ-SP, PF)
      query = query.ilike('orgao', `%${orgao.replace(/[^a-zA-Z]/g, '')}%`);
    }
    if (banca) {
      query = query.ilike('banca', `%${banca.split('/')[0].trim()}%`);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('[Supabase] Erro ao buscar questões:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    // Formata do padrão SQL (alternativa_a, b, c...) para o formato que o React espera
    return data.map(q => {
      const alts = [
        q.alternativa_a,
        q.alternativa_b,
        q.alternativa_c,
        q.alternativa_d,
        q.alternativa_e
      ].filter(Boolean); // Remove nulas se forem só 4 alternativas

      // Converte gabarito letra ('A', 'B', 'C', 'D', 'E') em índice numérico (0, 1, 2, 3, 4)
      const gabLetra = (q.gabarito_correto || 'A').toUpperCase().trim();
      const corretaIdx = Math.max(0, gabLetra.charCodeAt(0) - 65);

      return {
        id: q.id,
        concursoId: q.orgao ? q.orgao.toLowerCase().replace(/\s+/g, '-') : 'geral',
        banca: q.banca || 'Banca Oficial',
        ano: q.ano || new Date().getFullYear(),
        origem: 'real',
        materia: q.materia || 'Conhecimentos Específicos',
        assunto: q.assunto || 'Questão de Prova Real',
        enunciado: `[${q.banca || 'Oficial'} / Prova Real / ${q.ano || ''}] ${q.enunciado}`,
        alternativas: alts.length >= 2 ? alts : ['Certo', 'Errado'],
        correta: corretaIdx < alts.length ? corretaIdx : 0,
        comentario: `Gabarito Oficial: Letra ${gabLetra}. Questão extraída do banco de dados real do certame ${q.orgao || cargo}.`
      };
    });
  } catch (err) {
    console.error('[Supabase] Exceção na consulta:', err);
    return null;
  }
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem('supabase_url', url.trim());
  localStorage.setItem('supabase_key', key.trim());
  window.location.reload();
}
