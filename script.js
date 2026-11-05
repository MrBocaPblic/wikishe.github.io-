const imagens = [
    'ada-lovelace.jpg.jpeg',
    'grace.jpg',
    'hipatia.jpg',
    'katherine.jpg',
    'marie-curie.jpg.jpeg',
    'rosalind.jpg'
];

const fundo = document.getElementById('container-imagens');
const tamanhoImagem = 120;
const passoDaGrade = 128;

// Monta fotos suficientes para a tela e para o trecho que o parallax percorre.
function montarFundo() {
    if (!fundo) return;

    const colunas = Math.max(1, Math.ceil((window.innerWidth - 16) / passoDaGrade));
    const rolagemMaxima = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const alturaFundo = window.innerHeight + (rolagemMaxima * 0.6) + 16;
    const linhas = Math.max(1, Math.ceil(alturaFundo / passoDaGrade));
    const totalDeFotos = colunas * linhas;

    fundo.style.gridTemplateColumns = 'repeat(' + colunas + ', ' + tamanhoImagem + 'px)';
    fundo.style.height = alturaFundo + 'px';

    while (fundo.children.length > totalDeFotos) {
        fundo.removeChild(fundo.lastElementChild);
    }

    while (fundo.children.length < totalDeFotos) {
        const foto = document.createElement('img');
        const indiceAleatorio = Math.floor(Math.random() * imagens.length);
        foto.src = './AssetMidia/Imagens das mulheres/' + imagens[indiceAleatorio];
        foto.alt = '';
        foto.className = 'img-animada';
        fundo.appendChild(foto);
    }
}

// Move o mosaico a 60% da velocidade da página para criar o efeito de distância.
function moverFundo() {
    if (!fundo) return;
    fundo.style.transform = 'translateY(' + (-window.scrollY * 0.6) + 'px)';
}

// Troca vários quadrados por fotos diferentes a cada ciclo.
function trocarAlgumasFotos() {
    if (!fundo) return;

    const fotos = fundo.querySelectorAll('.img-animada');
    const quantidade = Math.min(fotos.length, Math.max(6, Math.ceil(fotos.length * 0.12)));
    const indicesTrocados = [];

    while (indicesTrocados.length < quantidade) {
        const indice = Math.floor(Math.random() * fotos.length);

        if (indicesTrocados.indexOf(indice) !== -1) continue;
        indicesTrocados.push(indice);

        const foto = fotos[indice];
        const nomeAtual = foto.src.split('/').pop();
        let novoIndice = Math.floor(Math.random() * imagens.length);

        while (imagens[novoIndice] === nomeAtual) {
            novoIndice = Math.floor(Math.random() * imagens.length);
        }

        foto.src = './AssetMidia/Imagens das mulheres/' + imagens[novoIndice];
    }
}

montarFundo();
moverFundo();

window.addEventListener('scroll', moverFundo, { passive: true });
window.addEventListener('resize', function () {
    montarFundo();
    moverFundo();
});
window.addEventListener('load', function () {
    montarFundo();
    moverFundo();
});
function agendarProximaTroca() {
    const tempoMinimo = 1200;
    const tempoMaximo = 4200;
    const espera = Math.floor(Math.random() * (tempoMaximo - tempoMinimo + 1)) + tempoMinimo;

    window.setTimeout(function () {
        trocarAlgumasFotos();
        agendarProximaTroca();
    }, espera);
}

agendarProximaTroca();

/*
 * Guia do fundo:
 * - A lista imagens guarda os retratos que aparecem no mosaico.
 * - montarFundo cria ou remove quadrados conforme o tamanho da janela e do
 *   trecho de página que pode rolar.
 * - moverFundo posiciona as fotos a 60% da velocidade do conteúdo.
 * - trocarAlgumasFotos escolhe quadrados diferentes e troca cada arquivo por
 *   uma imagem distinta. O número muda conforme o tamanho da grade.
 * - Os eventos scroll, resize e load movem o fundo ou ajustam sua grade. O agendador escolhe um intervalo aleatório entre 1,2 e 4,2 segundos.
 */

