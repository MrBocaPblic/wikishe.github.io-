const container = document.getElementById('globo-3d');
const globo = Globe()
    (container)
    .width(container.clientWidth)
    .height(container.clientHeight)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundColor('rgba(0,0,0,0)');

// Configurações do Globo Estático
globo.controls().enableRotate = false;
globo.controls().enableZoom = false;
globo.controls().enablePan = false;

window.addEventListener('resize', () => {
    globo.width(container.clientWidth);
    globo.height(container.clientHeight);
});

function ApontarGloboPara(lat, lng, alt, tempoms) {
    globo.pointOfView({
        lat: lat,
        lng: lng,
        altitude: alt
    }, tempoms);
}

// Lista de arquivos JSON; Altere caso seja adicionado mais alguém.
const arquivosJson = [
    './Informacoes_Mulheres/ada.json',
    './Informacoes_Mulheres/cleopatra.json',
    './Informacoes_Mulheres/frida.json',
    './Informacoes_Mulheres/joana.json',
    './Informacoes_Mulheres/malala.json',
    './Informacoes_Mulheres/marie.json'
];

const containerBotoes = document.getElementById('LocalBotoes');
const templateBotao = document.getElementById('Template1');

Promise.all(
    arquivosJson.map(arquivo => 
        fetch(arquivo).then(resposta => {
            if (!resposta.ok) {
                throw new Error(`Erro ao carregar o arquivo ${arquivo}: ${resposta.statusText}`);
            }
            return resposta.json();
        })
    )
)
.then(listaDeMulheres => {
    const mulheresAtivas = listaDeMulheres.filter(m => m.visivel !== false);
    //EFEITOS VISUAIS

    // Ponto Central
    globo
        .pointsData(mulheresAtivas)
        .pointLat(d => d.localização.lat)
        .pointLng(d => d.localização.lng)
        .pointColor(() => '#ffaa00') // Cor dourada central
        .pointAltitude(0.015)       // Levemente flutuando
        .pointRadius(0.9)          // Tamanho do núcleo central
        // Interatividade: Clique direto no ponto do globo
        .onPointClick(d => { 
            document.getElementById('ImagemDaMulher').src = d.imagem;
            document.querySelector('#INFO p').textContent = d.texto;
            ApontarGloboPara(d.localização.lat, d.localização.lng, 1.2, 2000);
        });

    // Anel
    globo
        .ringsData(mulheresAtivas)
        .ringLat(d => d.localização.lat)
        .ringLng(d => d.localização.lng)
        // Cor do anel
        .ringColor(() => (t => `rgba(255, 170, 0, ${1 - t})`))
        .ringMaxRadius(3.5)        // Alcance da pulsação
        .ringPropagationSpeed(1.2) // Velocidade da pulsação
        .ringRepeatPeriod(1000)    // Tempo de repetição (1 segundo)
        .ringAltitude(0.012);      // Logo abaixo do núcleo para criar profundidade

    //
    listaDeMulheres.forEach(mulher => {
        if (mulher.visivel === false) return;

        const novoBotao = templateBotao.cloneNode(true);
        novoBotao.removeAttribute('id');
        novoBotao.style.display = 'flex'; 

        novoBotao.setAttribute('data-mulher', mulher.nome);
        novoBotao.querySelector('.img_botao_base').src = mulher.imagem;
        novoBotao.querySelector('.img_botao_base').alt = mulher.nome;
        novoBotao.querySelector('.texto-botao_base').textContent = mulher.nome;

        novoBotao.addEventListener('click', () => {
            document.getElementById('ImagemDaMulher').src = mulher.imagem;
            document.querySelector('#INFO p').textContent = mulher.texto;

            document.getElementById('cidadesel').textContent = `Cidade: ${mulher.localização.Cidade}`;
            document.getElementById('paissel').textContent = `Páis: ${mulher.localização.Pais}`;

            ApontarGloboPara(mulher.localização.lat, mulher.localização.lng, 1.2, 2000);
        });

        containerBotoes.appendChild(novoBotao);
    });

})
.catch(erro => {
    console.error("Erro ao carregar os perfis:", erro);
});