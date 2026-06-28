import { jsPDF } from 'jspdf';

export function gerarCadernoPDF(config, questions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margemEsq = 15;
  const larguraUtil = 180;
  let cursorY = 20;

  // Função auxiliar para verificar quebra de página
  const verificarQuebraPagina = (espacoNecessario = 20) => {
    if (cursorY + espacoNecessario > 280) {
      doc.addPage();
      cursorY = 20;
    }
  };

  // Cabeçalho Principal do Caderno
  doc.setFillColor(30, 27, 75); // #1e1b4b (Indigo Dark)
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("GABARITEI - CADERNO DE SIMULADO OFICIAL", margemEsq, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Alvo: ${config.cargo || 'Concurso Público'} | Banca: ${config.banca || 'Oficial'}`, margemEsq, 23);
  doc.text(`Tempo Simulado: ${config.duracaoMinutos} minutos | Total de Questões: ${questions.length}`, margemEsq, 29);

  cursorY = 45;
  doc.setTextColor(30, 41, 59); // Slate 800

  // Título da Seção de Questões
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PARTE 1: QUESTÕES DO SIMULADO", margemEsq, cursorY);
  cursorY += 10;

  // Listar Questões
  questions.forEach((q, idx) => {
    verificarQuebraPagina(35);

    // Cabeçalho da Questão
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Brand color
    doc.text(`Questão ${idx + 1} [${q.materia}] - ${q.banca} (${q.ano || 'Real'})`, margemEsq, cursorY);
    cursorY += 6;

    // Enunciado
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Slate 900
    
    const linhasEnunciado = doc.splitTextToSize(q.enunciado, larguraUtil);
    verificarQuebraPagina(linhasEnunciado.length * 5);
    doc.text(linhasEnunciado, margemEsq, cursorY);
    cursorY += linhasEnunciado.length * 5 + 3;

    // Alternativas
    q.alternativas.forEach((alt, altIdx) => {
      const letra = String.fromCharCode(65 + altIdx); // A, B, C, D
      const textoAlt = `${letra}) ${alt}`;
      const linhasAlt = doc.splitTextToSize(textoAlt, larguraUtil - 5);
      
      verificarQuebraPagina(linhasAlt.length * 4.5);
      doc.text(linhasAlt, margemEsq + 5, cursorY);
      cursorY += linhasAlt.length * 4.5 + 2;
    });

    cursorY += 6; // Espaço entre questões
  });

  // Nova Página para o Gabarito Comentado
  doc.addPage();
  cursorY = 20;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PARTE 2: GABARITO OFICIAL E COMENTÁRIOS DA IA", margemEsq, 18);

  cursorY = 40;

  questions.forEach((q, idx) => {
    verificarQuebraPagina(40);

    const letraCorreta = String.fromCharCode(65 + q.correta);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text(`Questão ${idx + 1} - Gabarito: Letra ${letraCorreta}`, margemEsq, cursorY);
    cursorY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // Slate 700

    const linhasComent = doc.splitTextToSize(q.comentario || "Gabarito confirmado pela banca examinadora.", larguraUtil);
    verificarQuebraPagina(linhasComent.length * 4.5);
    doc.text(linhasComent, margemEsq, cursorY);
    
    cursorY += linhasComent.length * 4.5 + 8;
  });

  // Salvar Arquivo
  const nomeArquivo = `Simulado_${config.cargo ? config.cargo.replace(/[^a-zA-Z0-9]/g, '_') : 'ConcursoPro'}.pdf`;
  doc.save(nomeArquivo);
}
