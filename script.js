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
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Monta fotos suficientes para a tela e para o trecho que o parallax vai percorrer.
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

// Troca algumas fotos por outras sem reconstruir todo o mosaico.
function trocarAlgumasFotos() {
    if (!fundo || movimentoReduzido) return;

    const fotos = fundo.querySelectorAll('.img-animada');
    const quantidade = Math.max(3, Math.ceil(fotos.length * 0.04));

    for (let i = 0; i < quantidade; i += 1) {
        const indiceAleatorio = Math.floor(Math.random() * fotos.length);
        const foto = fotos[indiceAleatorio];
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
window.setInterval(trocarAlgumasFotos, 3000);

/*
 * Guia do fundo:
 * - A lista imagens contém somente as seis mulheres que continuam no site.
 * - montarFundo calcula quantas fotos cabem e cria a grade para cobrir a tela
 *   durante a rolagem; ao redimensionar, ajusta o número de fotos.
 * - moverFundo desloca as imagens a 60% da velocidade da página. Assim, o
 *   conteúdo parece passar mais rápido que o fundo, criando o efeito parallax.
 * - Os eventos scroll, resize e load movem o fundo ou recalculam a grade.
 * - trocarAlgumasFotos escolhe alguns quadrados e troca cada foto por outra a
 *   cada três segundos. A preferência por movimento reduzido pausa essas trocas.
 */
