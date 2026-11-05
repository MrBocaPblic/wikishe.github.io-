document.addEventListener('DOMContentLoaded', async function () {
    function buscar(seletor) {
        return document.querySelector(seletor);
    }

    const globo = buscar('#GloboGiratorio');
    const botoesPessoas = buscar('#botoes-mulheres');
    const estado = buscar('#estado-carregamento');
    const imagem = buscar('#imagem-mulher');
    const fallback = buscar('#retrato-fallback');

    let mulheres = [];
    let indiceSelecionado = 0;
    let marcador;
    let terra;
    let orientacaoAlvo;

    // A cena Three.js cuida da esfera, da textura, do marcador e do desenho contínuo.
    function criarGlobo() {
        if (!globo || !window.THREE) {
            buscar('#legenda-globo').textContent = 'Globo indisponível';
            return;
        }

        const cena = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.z = 6;

        const renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderizador.outputEncoding = THREE.sRGBEncoding;
        globo.appendChild(renderizador.domElement);

        cena.add(new THREE.AmbientLight(0xffffff, 1.15));
        const luzSolar = new THREE.DirectionalLight(0xffffff, 1.2);
        luzSolar.position.set(4, 3, 5);
        cena.add(luzSolar);

        terra = new THREE.Mesh(
            new THREE.SphereGeometry(2, 64, 64),
            new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 12 })
        );
        cena.add(terra);

        new THREE.TextureLoader().load(
            'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/land_ocean_ice_cloud_2048.jpg',
            function (textura) {
                textura.encoding = THREE.sRGBEncoding;
                terra.material.map = textura;
                terra.material.needsUpdate = true;
            },
            undefined,
            function () {
                buscar('#legenda-globo').textContent = 'Não foi possível carregar a textura do globo';
            }
        );

        marcador = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff3d57 })
        );
        marcador.visible = false;
        terra.add(marcador);
        orientacaoAlvo = new THREE.Quaternion();

        function ajustarTamanho() {
            const largura = globo.clientWidth;
            const altura = globo.clientHeight;

            if (!largura || !altura) return;

            renderizador.setPixelRatio(window.devicePixelRatio || 1);
            renderizador.setSize(largura, altura);
            camera.aspect = largura / altura;
            camera.updateProjectionMatrix();
        }

        ajustarTamanho();
        window.addEventListener('resize', ajustarTamanho);
        new ResizeObserver(ajustarTamanho).observe(globo);

        function desenharCena() {
            requestAnimationFrame(desenharCena);
            terra.quaternion.slerp(orientacaoAlvo, 0.045);
            renderizador.render(cena, camera);
        }

        desenharCena();
    }

    // Procura latitude e longitude no perfil sem depender do nome do campo.
    function encontrarLocal(perfil) {
        for (const chave in perfil) {
            const valor = perfil[chave];

            if (valor && typeof valor === 'object' &&
                valor.lat !== undefined && valor.lng !== undefined) {
                return valor;
            }
        }

        return null;
    }

    // Converte coordenadas em posição na esfera e aponta o local para a câmera.


    function marcarLocal(local) {
        if (!marcador) return;

        if (!local) {
            marcador.visible = false;
            return;
        }

        // Converte latitude e longitude para radianos
        const latitude = Number(local.lat) * Math.PI / 180;
        const longitude = Number(local.lng) * Math.PI / 180;

        const raio = 2.035;

        // Coordenadas compatíveis com a SphereGeometry do Three.js
        const x = raio * Math.cos(latitude) * Math.cos(longitude);
        const y = raio * Math.sin(latitude);
        const z = -raio * Math.cos(latitude) * Math.sin(longitude);

        marcador.position.set(x, y, z);
        marcador.visible = true;

        // Calcula a rotação necessária para apontar o local para a câmera
        const direcao = marcador.position.clone().normalize();

        orientacaoAlvo.setFromUnitVectors(
            direcao,
            new THREE.Vector3(0, 0, 1)
        );
    }






    function caminhoDaImagem(valor) {
        if (!valor) return '';
        if (valor.indexOf('http://') === 0 || valor.indexOf('https://') === 0) return valor;

        let nomeDoArquivo = valor.replace(/\\/g, '/');
        nomeDoArquivo = nomeDoArquivo.substring(nomeDoArquivo.lastIndexOf('/') + 1);
        return '../AssetMidia/Imagens das mulheres/' + encodeURIComponent(nomeDoArquivo);
    }

    function iniciaisDoNome(nome) {
        const partes = nome.split(' ');
        let iniciais = '';

        for (let i = 0; i < partes.length && i < 2; i += 1) {
            if (partes[i]) iniciais += partes[i][0];
        }

        return iniciais.toUpperCase();
    }

    // Atualiza os textos, o retrato, o botão ativo e o ponto no globo.
    function mostrarMulher(indice) {
        if (mulheres.length === 0) return;

        indiceSelecionado = (indice + mulheres.length) % mulheres.length;
        const perfil = mulheres[indiceSelecionado].data;
        const local = encontrarLocal(perfil);
        const nome = perfil.nome || 'Nome não informado';
        let cidade = '';
        let pais = '';

        if (local) {
            cidade = local.Cidade || local.cidade || '';
            pais = local.Pais || local['País'] || local.pais || '';
        }

        const area = perfil.area || perfil.cargo || perfil.atuacao || 'Sem informação';

        buscar('#nome-mulher').textContent = nome;
        buscar('#cidade-mulher').textContent = cidade || 'Sem informação';
        buscar('#pais-mulher').textContent = pais || 'Sem informação';
        buscar('#area-mulher').textContent = area;
        buscar('#texto-mulher').textContent =
            perfil.texto || perfil.descricao || 'Ainda não há informações para esta pessoa.';

        if (cidade && pais) {
            buscar('#legenda-globo').textContent = cidade + ' · ' + pais;
        } else {
            buscar('#legenda-globo').textContent = cidade || pais || 'Localização não informada';
        }

        marcarLocal(local);

        const caminho = caminhoDaImagem(perfil.imagem || perfil.image);
        imagem.hidden = !caminho;
        fallback.hidden = Boolean(caminho);
        fallback.textContent = iniciaisDoNome(nome);
        imagem.alt = caminho ? 'Retrato de ' + nome : '';

        imagem.onerror = function () {
            imagem.hidden = true;
            fallback.hidden = false;
        };

        if (caminho) imagem.src = caminho;

        const botoes = botoesPessoas.querySelectorAll('button');
        for (let i = 0; i < botoes.length; i += 1) {
            const selecionado = i === indiceSelecionado;
            botoes[i].setAttribute('aria-pressed', selecionado ? 'true' : 'false');
        }
    }

    // Monta a fileira de cartões a partir dos perfis carregados.
    function criarBotoes() {
        botoesPessoas.replaceChildren();

        for (let i = 0; i < mulheres.length; i += 1) {
            const perfil = mulheres[i].data;
            const nome = perfil.nome || 'Pessoa ' + (i + 1);
            const botao = document.createElement('button');
            const retrato = document.createElement('span');
            const iniciais = document.createElement('span');
            const legenda = document.createElement('span');

            botao.type = 'button';
            botao.className = 'botao-mulher';
            retrato.className = 'botao-retrato';
            legenda.className = 'botao-nome';
            iniciais.textContent = iniciaisDoNome(nome);
            retrato.appendChild(iniciais);

            const caminho = caminhoDaImagem(perfil.imagem || perfil.image);
            if (caminho) {
                const miniatura = document.createElement('img');
                miniatura.src = caminho;
                miniatura.alt = '';

                miniatura.addEventListener('load', function () {
                    iniciais.hidden = true;
                });
                miniatura.addEventListener('error', function () {
                    miniatura.remove();
                });

                retrato.appendChild(miniatura);
            }

            legenda.textContent = nome;
            botao.appendChild(retrato);
            botao.appendChild(legenda);
            botao.setAttribute('aria-label', 'Selecionar ' + nome);
            botao.setAttribute('aria-pressed', 'false');
            botao.addEventListener('click', function () {
                mostrarMulher(i);
            });
            botoesPessoas.appendChild(botao);
        }
    }

    buscar('#anterior').addEventListener('click', function () {
        mostrarMulher(indiceSelecionado - 1);
    });
    buscar('#proximo').addEventListener('click', function () {
        mostrarMulher(indiceSelecionado + 1);
    });

    criarGlobo();

    // Lê a lista do catálogo e carrega os perfis um por vez para facilitar o fluxo.
    try {
        const respostaCatalogo = await fetch('./info_mulheres/catalogo.json');
        if (!respostaCatalogo.ok) throw new Error('Não foi possível abrir info_mulheres/catalogo.json');

        const nomesArquivos = await respostaCatalogo.json();

        for (let i = 0; i < nomesArquivos.length; i += 1) {
            const nomeArquivo = nomesArquivos[i];

            try {
                const respostaPerfil = await fetch('./info_mulheres/' + encodeURIComponent(nomeArquivo));
                if (!respostaPerfil.ok) throw new Error('HTTP ' + respostaPerfil.status);

                const dados = await respostaPerfil.json();
                if (dados && dados.visivel !== false) {
                    mulheres.push({ filename: nomeArquivo, data: dados });
                }
            } catch (erroPerfil) {
                console.error('Erro ao carregar ' + nomeArquivo + ':', erroPerfil);
            }
        }

        if (mulheres.length === 0) {
            throw new Error('Nenhum perfil visível foi encontrado nos arquivos JSON.');
        }

        criarBotoes();
        mostrarMulher(0);
        estado.textContent = mulheres.length + ' perfis disponíveis';
    } catch (erro) {
        console.error(erro);
        estado.textContent = erro.message + ' Abra a página por um servidor local ou hospedagem.';
        buscar('#nome-mulher').textContent = 'Não foi possível carregar os perfis';
        buscar('#texto-mulher').textContent =
            'Os arquivos JSON precisam ser servidos por HTTP para que o navegador possa carregá-los.';
    }
});

/*
 * Guia da página Descobrir:
 * - criarGlobo, marcarLocal e os trechos Three.js formam a parte 3D. Eles criam
 *   a Terra, ajustam seu canvas, desenham cada quadro e apontam para a cidade.
 * - encontrarLocal lê coordenadas de qualquer campo do perfil. caminhoDaImagem
 *   transforma o nome da foto em um caminho válido. iniciaisDoNome cria o
 *   substituto textual para retratos ausentes.
 * - mostrarMulher atualiza as informações e sinaliza o cartão selecionado.
 *   criarBotoes monta os cartões e conecta o clique de cada um ao perfil.
 * - Os botões anterior/próximo mudam o índice atual. O bloco final busca o
 *   catálogo, lê cada perfil e ignora os que estejam marcados como invisíveis.
 * - A carga sequencial é mais simples de acompanhar que várias promessas em
 *   paralelo. JavaScript continua necessário para buscar os JSONs e atualizar
 *   os elementos quando a pessoa escolhe outro perfil.
 */
