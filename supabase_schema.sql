-- ====================================================================
-- SCRIPT SQL PARA CRIAR A TABELA NO SUPABASE (POSTGRESQL)
-- Copie e cole este script no "SQL Editor" do seu painel do Supabase.
-- ====================================================================

-- 1. Criação da Tabela Principal de Questões
CREATE TABLE IF NOT EXISTS questoes (
    id SERIAL PRIMARY KEY,
    banca VARCHAR(100),       -- Ex: FGV, IBFC, CEBRASPE, VUNESP
    orgao VARCHAR(150),       -- Ex: TJ-PB, PM-PB, PF, PC-DF
    ano INT,                  -- Ex: 2024, 2023, 2025
    cargo VARCHAR(150),       -- Ex: Soldado, Agente, Técnico Judiciário
    materia VARCHAR(100),     -- Ex: Língua Portuguesa, Direito Constitucional
    assunto VARCHAR(150),     -- Ex: Concordância Verbal, Inquérito Policial
    enunciado TEXT NOT NULL,  -- O texto da pergunta da prova real
    alternativa_a TEXT NOT NULL,
    alternativa_b TEXT NOT NULL,
    alternativa_c TEXT,
    alternativa_d TEXT,
    alternativa_e TEXT,
    gabarito_correto CHAR(1) NOT NULL -- Ex: 'A', 'B', 'C', 'D' ou 'E'
);

-- 2. Permite leitura pública (Para o app consultar as questões via chave Anon)
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de questões" 
ON questoes FOR SELECT 
USING (true);

-- 3. Exemplo de inserção inicial de questões de provas reais (Para testar no seu app!)
INSERT INTO questoes (banca, orgao, ano, cargo, materia, assunto, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, gabarito_correto)
VALUES 
('CEBRASPE', 'PM-PB', 2023, 'Soldado da Polícia Militar', 'Direito Constitucional', 'Direitos e Garantias Fundamentais', 'Conforme a Constituição Federal de 1988, a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, SALVO em caso de:', 'flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial.', 'determinação de autoridade policial a qualquer hora do dia ou da noite.', 'mandado judicial executado exclusivamente durante o período noturno.', 'decisão administrativa fundamentada do Governador do Estado.', 'A'),

('IBFC', 'PC-PB', 2022, 'Agente de Investigação', 'Língua Portuguesa', 'Crase e Regência', 'Assinale a alternativa em que o emprego do acento indicativo de crase está de acordo com a norma-padrão da Língua Portuguesa:', 'O delegado encaminhou o inquérito à Justiça dentro do prazo legal.', 'Solicitamos a todos os candidatos que apresentem o documento.', 'As viaturas começaram a patrulhar a região central a partir das dez horas.', 'O suspeito ficou frente a frente com a vítima durante o reconhecimento.', 'A'),

('VUNESP', 'PM-SP', 2024, 'Soldado PM de 2ª Classe', 'Matemática e Raciocínio Lógico', 'Porcentagem', 'Em um batalhão com 250 policiais, 40% possuem curso de especialização tática. O número de policiais que NÃO possuem esse curso é igual a:', '150.', '100.', '120.', '180.', 'A');
