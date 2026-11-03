const imagens = [
  'ada-lovelace.jpg.jpeg',
  'cleopatra.jpg.jpeg',
  'frida-kahlo.jpg.jpeg',
  'joana-darc.jpg.jpeg',
  'malala.jpg.jpeg',
  'marie-curie.jpg.jpeg'
];

const container = document.getElementById('container-imagens');
const tamanhoBloco = 120;
const espacamento = 8;
const velocidadeParallax = 0.3;

function atualizarFundo() {
  const larguraUtil = window.innerWidth - 16;
  const colunas = Math.max(1, Math.ceil(larguraUtil / (tamanhoBloco + espacamento)));

  // O fundo fica alto o bastante para continuar cobrindo a tela durante a rolagem.
  const deslocamentoMaximo = Math.max(0, document.documentElement.scrollHeight - window.innerHeight) * velocidadeParallax;
  const alturaNecessaria = window.innerHeight + deslocamentoMaximo + 16;
  const linhas = Math.max(1, Math.ceil(alturaNecessaria / (tamanhoBloco + espacamento)));
  const quantidade = colunas * linhas;

  container.style.gridTemplateColumns = `repeat(${colunas}, ${tamanhoBloco}px)`;
  container.style.gridAutoRows = `${tamanhoBloco}px`;
  container.style.height = `${linhas * tamanhoBloco + (linhas - 1) * espacamento + 16}px`;

  const imagensAtuais = container.querySelectorAll('.img-animada');
  if (imagensAtuais.length !== quantidade) {
    const html = Array.from({ length: quantidade }, () => {
      const imagem = imagens[Math.floor(Math.random() * imagens.length)];
      return `<img src="./AssetMidia/Imagens das mulheres/${imagem}" alt="${imagem}" class="img-animada">`;
    }).join('');

    container.innerHTML = html;
  }

  atualizarPosicaoFundo();
}

function atualizarPosicaoFundo() {
  container.style.transform = `translateY(${-window.scrollY * velocidadeParallax}px)`;
}

window.addEventListener('scroll', atualizarPosicaoFundo, { passive: true });
window.addEventListener('resize', atualizarFundo);

// Recalcula também se o conteúdo da página mudar de altura.
const observador = new ResizeObserver(atualizarFundo);
observador.observe(document.body);

atualizarFundo();

// Troca uma imagem aleatória a cada 1,2 segundos.
let filaImagens = [];
let ultimaImagemSorteada = null;

function sortearProximaImagem() {
  if (filaImagens.length === 0) {
    filaImagens = [...imagens].sort(() => Math.random() - 0.5);
    if (filaImagens[0] === ultimaImagemSorteada) {
      [filaImagens[0], filaImagens[1]] = [filaImagens[1], filaImagens[0]];
    }
  }

  ultimaImagemSorteada = filaImagens.pop();
  return ultimaImagemSorteada;
}

setInterval(() => {
  const todasAsImagens = [...container.querySelectorAll('.img-animada')];
  if (todasAsImagens.length === 0) return;

  const quantidadeParaTrocar = Math.min(
    todasAsImagens.length,
    Math.max(4, Math.ceil(todasAsImagens.length * 0.05))
  );

  todasAsImagens.sort(() => Math.random() - 0.5);

  for (const imagemSelecionada of todasAsImagens.slice(0, quantidadeParaTrocar)) {
    let novaImagem = sortearProximaImagem();
    const imagemAtual = imagemSelecionada.src.split('/').pop();

    while (novaImagem === imagemAtual) {
      novaImagem = sortearProximaImagem();
    }

    imagemSelecionada.src = `./AssetMidia/Imagens das mulheres/${novaImagem}`;
  }
}, 800);
