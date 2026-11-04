document.addEventListener('DOMContentLoaded', function () {
    const telaInicial = document.getElementById('tela-inicio');
    const telaDaPergunta = document.getElementById('tela-pergunta');
    const telaDoResultado = document.getElementById('tela-resultado');
    const seletorDeQuantidade = document.getElementById('quantidade-perguntas');
    const botaoIniciar = document.getElementById('iniciar-quiz');
    const listaDeRespostas = document.getElementById('lista-respostas');
    const feedback = document.getElementById('feedback-resposta');
    const botaoConfirmar = document.getElementById('confirmar-resposta');
    const botaoProxima = document.getElementById('proxima-pergunta');

    let perguntas = [];
    let rodada = [];
    let indiceAtual = 0;
    let acertos = 0;
    let gabaritoMostrado = [];

    function mostrarTela(telaEscolhida) {
        telaInicial.hidden = telaEscolhida !== telaInicial;
        telaDaPergunta.hidden = telaEscolhida !== telaDaPergunta;
        telaDoResultado.hidden = telaEscolhida !== telaDoResultado;
    }

    // Embaralha uma cópia da lista para não alterar a ordem original do JSON.
    function embaralhar(lista) {
        const copia = lista.slice();

        for (let i = copia.length - 1; i > 0; i -= 1) {
            const sorteado = Math.floor(Math.random() * (i + 1));
            const temporario = copia[i];
            copia[i] = copia[sorteado];
            copia[sorteado] = temporario;
        }

        return copia;
    }

    function criarAlternativa(texto, indice, permiteVarias) {
        const rotulo = document.createElement('label');
        const entrada = document.createElement('input');
        const textoDaResposta = document.createElement('span');

        rotulo.className = 'resposta';
        rotulo.htmlFor = 'resposta-' + indice;
        entrada.type = permiteVarias ? 'checkbox' : 'radio';
        entrada.name = 'resposta-quiz';
        entrada.value = texto;
        entrada.id = 'resposta-' + indice;
        textoDaResposta.textContent = texto;

        rotulo.appendChild(entrada);
        rotulo.appendChild(textoDaResposta);
        listaDeRespostas.appendChild(rotulo);
    }

    function atualizarProgresso() {
        const numeroVisivel = indiceAtual + 1;
        const porcentagem = Math.round((numeroVisivel / rodada.length) * 100);

        document.getElementById('contador-pergunta').textContent =
            'Pergunta ' + numeroVisivel + ' de ' + rodada.length;
        document.getElementById('pontuacao-atual').textContent = 'Acertos: ' + acertos;
        document.getElementById('progresso-preenchido').style.width = porcentagem + '%';
        document.querySelector('.barra-progresso').setAttribute('aria-valuenow', porcentagem);
    }

    // Prepara as alternativas e guarda só as respostas certas que foram exibidas.
    function mostrarPergunta() {
        const perguntaAtual = rodada[indiceAtual];
        let respostasCertas;

        atualizarProgresso();
        document.getElementById('tipo-resposta').textContent = perguntaAtual.MultiSelect
            ? 'Selecione todas as respostas corretas.'
            : 'Selecione uma resposta.';
        document.getElementById('enunciado-pergunta').textContent = perguntaAtual.pergunta;

        listaDeRespostas.replaceChildren();
        feedback.hidden = true;
        feedback.className = 'feedback';
        botaoConfirmar.hidden = false;
        botaoProxima.hidden = true;

        if (perguntaAtual.MultiSelect) {
            respostasCertas = perguntaAtual.respostas_corretas.slice();
        } else {
            const indiceCerto = Math.floor(Math.random() * perguntaAtual.respostas_corretas.length);
            respostasCertas = [perguntaAtual.respostas_corretas[indiceCerto]];
        }

        gabaritoMostrado = respostasCertas.slice();
        const alternativas = respostasCertas.slice();
        const alternativasErradas = embaralhar(perguntaAtual.respostas_erradas);

        for (let i = 0; i < alternativasErradas.length && alternativas.length < 4; i += 1) {
            alternativas.push(alternativasErradas[i]);
        }

        const alternativasEmbaralhadas = embaralhar(alternativas);
        for (let i = 0; i < alternativasEmbaralhadas.length; i += 1) {
            criarAlternativa(alternativasEmbaralhadas[i], i, perguntaAtual.MultiSelect);
        }
    }

    function iniciarRodada() {
        let quantidade = perguntas.length;
        const escolha = seletorDeQuantidade.value;

        if (escolha !== 'todas') {
            quantidade = Math.min(Number(escolha), perguntas.length);
        }

        rodada = embaralhar(perguntas).slice(0, quantidade);
        indiceAtual = 0;
        acertos = 0;
        mostrarTela(telaDaPergunta);
        mostrarPergunta();
    }

    // Compara as escolhas com o gabarito que a pessoa realmente viu.
    function confirmarResposta() {
        const marcadas = listaDeRespostas.querySelectorAll('input:checked');
        const escolhas = [];

        for (let i = 0; i < marcadas.length; i += 1) {
            escolhas.push(marcadas[i].value);
        }

        if (escolhas.length === 0) {
            feedback.hidden = false;
            feedback.textContent = 'Selecione uma resposta para continuar.';
            return;
        }

        let acertou = escolhas.length === gabaritoMostrado.length;
        for (let i = 0; i < escolhas.length; i += 1) {
            if (gabaritoMostrado.indexOf(escolhas[i]) === -1) acertou = false;
        }

        if (acertou) acertos += 1;

        feedback.hidden = false;
        feedback.className = acertou ? 'feedback correta' : 'feedback incorreta';
        feedback.textContent = acertou
            ? 'Resposta correta!'
            : 'Resposta correta: ' + gabaritoMostrado.join('; ');

        const todasAsAlternativas = listaDeRespostas.querySelectorAll('input');
        for (let i = 0; i < todasAsAlternativas.length; i += 1) {
            todasAsAlternativas[i].disabled = true;
        }

        botaoConfirmar.hidden = true;
        botaoProxima.hidden = false;
        botaoProxima.textContent = indiceAtual === rodada.length - 1
            ? 'Ver resultado'
            : 'Próxima pergunta';
        document.getElementById('pontuacao-atual').textContent = 'Acertos: ' + acertos;
    }

    function mostrarResultado() {
        const porcentagem = Math.round((acertos / rodada.length) * 100);

        document.getElementById('pontuacao-final').textContent =
            acertos + ' de ' + rodada.length + ' (' + porcentagem + '%)';
        document.getElementById('titulo-resultado').textContent =
            porcentagem === 100 ? 'Perfeito!' : 'Quiz concluído!';
        document.getElementById('mensagem-resultado').textContent =
            porcentagem >= 70
                ? 'Você conhece bem essas histórias. Que tal tentar outra rodada?'
                : 'Continue descobrindo essas histórias e tente novamente.';
        mostrarTela(telaDoResultado);
    }

    function atualizarSeletorDeQuantidade() {
        seletorDeQuantidade.replaceChildren();

        if (perguntas.length >= 5) {
            const opcaoCinco = document.createElement('option');
            opcaoCinco.value = '5';
            opcaoCinco.textContent = '5 perguntas';
            seletorDeQuantidade.appendChild(opcaoCinco);
        }

        if (perguntas.length >= 10) {
            const opcaoDez = document.createElement('option');
            opcaoDez.value = '10';
            opcaoDez.textContent = '10 perguntas';
            seletorDeQuantidade.appendChild(opcaoDez);
        }

        const opcaoTodas = document.createElement('option');
        opcaoTodas.value = 'todas';
        opcaoTodas.textContent = 'Todas (' + perguntas.length + ')';
        seletorDeQuantidade.appendChild(opcaoTodas);
        seletorDeQuantidade.disabled = false;
        botaoIniciar.disabled = false;
    }

    // Busca primeiro o catálogo e depois abre cada arquivo listado nele.
    async function carregarPerguntas() {
        const aviso = document.getElementById('aviso-dados');

        try {
            const respostaCatalogo = await fetch('./questoes/catalogo.json');
            if (!respostaCatalogo.ok) throw new Error('Não foi possível abrir o catálogo de questões.');

            const arquivos = await respostaCatalogo.json();

            for (let i = 0; i < arquivos.length; i += 1) {
                const respostaArquivo = await fetch('./questoes/' + arquivos[i]);
                if (!respostaArquivo.ok) throw new Error('Não foi possível abrir ' + arquivos[i] + '.');

                const pergunta = await respostaArquivo.json();
                const respostasValidas =
                    Array.isArray(pergunta.respostas_corretas) &&
                    pergunta.respostas_corretas.length > 0 &&
                    Array.isArray(pergunta.respostas_erradas);

                if (!pergunta.pergunta || !respostasValidas || typeof pergunta.MultiSelect !== 'boolean') {
                    throw new Error('Confira os campos do arquivo ' + arquivos[i] + '.');
                }

                perguntas.push(pergunta);
            }

            if (perguntas.length === 0) {
                aviso.textContent = 'Ainda não há perguntas cadastradas.';
                return;
            }

            aviso.textContent = perguntas.length + ' perguntas disponíveis.';
            atualizarSeletorDeQuantidade();
        } catch (erro) {
            console.error(erro);
            aviso.textContent = erro.message + ' Abra o site por um servidor local ou hospedagem.';
        }
    }

    botaoIniciar.addEventListener('click', iniciarRodada);
    botaoConfirmar.addEventListener('click', confirmarResposta);
    document.getElementById('sair-quiz').addEventListener('click', function () {
        mostrarTela(telaInicial);
    });
    document.getElementById('refazer-quiz').addEventListener('click', function () {
        mostrarTela(telaInicial);
    });
    botaoProxima.addEventListener('click', function () {
        indiceAtual += 1;
        if (indiceAtual >= rodada.length) {
            mostrarResultado();
        } else {
            mostrarPergunta();
        }
    });

    carregarPerguntas();
});

/*
 * Guia do Quiz:
 * - O início guarda os elementos HTML e as variáveis da rodada.
 * - mostrarTela alterna as três telas; embaralhar faz uma cópia e troca seus
 *   itens de posição para sortear perguntas e alternativas.
 * - criarAlternativa cria um botão de rádio ou uma caixa de seleção. atualizar
 *   Progresso atualiza número, placar e barra visual.
 * - mostrarPergunta escolhe uma resposta certa ou todas, completa com distratores
 *   e mostra as alternativas em ordem aleatória.
 * - iniciarRodada sorteia a quantidade escolhida. confirmarResposta verifica o
 *   gabarito exibido, mostra feedback e bloqueia as escolhas.
 * - mostrarResultado calcula a pontuação. atualizarSeletor cria as quantidades
 *   disponíveis. carregarPerguntas lê o catálogo e os JSONs.
 * - Os listeners ligam os controles às funções. Essa parte precisa de JavaScript
 *   porque sorteia dados, lê arquivos e reage às respostas da pessoa.
 */
