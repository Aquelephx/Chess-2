const tabuleiro = document.getElementById('tabuleiro');
const promocaoOverlay = document.getElementById('promocao');
const opcoesPromocao = document.getElementById('opcoesPromocao');

const pecas = {
    pretas: ['bR','bN','bB','bQ','bK','bB','bN','bR'],
    brancas: ['wR','wN','wB','wQ','wK','wB','wN','wR']
};

let casaSelecionada = null;
let turno = 'w';
let jogoEncerrado = false;
let promocaoPendente = null;
let ultimoMovimento = null;
let historicoMovimentos = [];
let pilhaDesfazer = [];

/* ==================== INTERFACE ==================== */

function criarInterface() {
    let areaTabuleiro = tabuleiro.parentElement;

    if (!areaTabuleiro.classList.contains('area-tabuleiro')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'area-tabuleiro';
        tabuleiro.parentNode.insertBefore(wrapper, tabuleiro);
        wrapper.appendChild(tabuleiro);
        areaTabuleiro = wrapper;
    }

    let container = areaTabuleiro.parentElement;

    if (!container.classList.contains('xadrez-container')) {
        const novoContainer = document.createElement('div');
        novoContainer.className = 'xadrez-container';
        areaTabuleiro.parentNode.insertBefore(novoContainer, areaTabuleiro);
        novoContainer.appendChild(areaTabuleiro);
    }

    let turnoElemento = document.getElementById('turno');

    if (!turnoElemento) {
        turnoElemento = document.createElement('div');
        turnoElemento.id = 'turno';
        turnoElemento.className = 'turno';
        areaTabuleiro.insertBefore(turnoElemento, tabuleiro);
    }

    let controles = document.getElementById('controles');

    if (!controles) {
        controles = document.createElement('div');
        controles.id = 'controles';
        controles.className = 'controles';
        areaTabuleiro.appendChild(controles);
    }

    let botaoDesfazer = document.getElementById('desfazer');

    if (!botaoDesfazer) {
        botaoDesfazer = document.createElement('button');
        botaoDesfazer.id = 'desfazer';
        botaoDesfazer.className = 'controle-botao';
        botaoDesfazer.textContent = 'Desfazer';
        controles.appendChild(botaoDesfazer);
    }

    let botaoNova = document.getElementById('novaPartida');

    if (!botaoNova) {
        botaoNova = document.createElement('button');
        botaoNova.id = 'novaPartida';
        botaoNova.className = 'controle-botao';
        botaoNova.textContent = 'Nova partida';
        controles.appendChild(botaoNova);
    }

    botaoDesfazer.onclick = desfazerJogada;
    botaoNova.onclick = novaPartida;

    criarTelaFimDeJogo();
    atualizarTurno();
    atualizarBotaoDesfazer();
}

/* ==================== FIM DE JOGO ==================== */

function criarTelaFimDeJogo() {
    if (document.getElementById('fimJogo')) return;

    const overlay = document.createElement('div');
    overlay.id = 'fimJogo';
    overlay.className = 'fim-jogo';
    overlay.innerHTML = `
        <div class="fim-jogo-caixa">
            <h2 id="fimJogoTitulo"></h2>
            <p id="fimJogoTexto"></p>
            <button id="botaoNovaPartidaFim" class="botao-nova-partida">Nova partida</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById('botaoNovaPartidaFim').addEventListener('click', novaPartida);
}

function mostrarFimDeJogo(titulo, texto) {
    const overlay = document.getElementById('fimJogo');
    if (!overlay) return;
    document.getElementById('fimJogoTitulo').textContent = titulo;
    document.getElementById('fimJogoTexto').textContent = texto;
    overlay.classList.add('ativo');
}

function fecharFimDeJogo() {
    const overlay = document.getElementById('fimJogo');
    if (overlay) overlay.classList.remove('ativo');
}

/* ==================== CONTROLES ==================== */

function atualizarTurno() {
    const elemento = document.getElementById('turno');
    if (elemento) elemento.textContent = turno === 'w' ? 'Vez das Brancas' : 'Vez das Pretas';
}

function atualizarBotaoDesfazer() {
    const botao = document.getElementById('desfazer');
    if (botao) botao.disabled = pilhaDesfazer.length === 0;
}

function salvarEstado() {
    pilhaDesfazer.push({
        tabuleiro: tabuleiro.innerHTML,
        turno,
        jogoEncerrado,
        ultimoMovimento: ultimoMovimento ? JSON.parse(JSON.stringify(ultimoMovimento)) : null,
        historicoMovimentos: JSON.parse(JSON.stringify(historicoMovimentos))
    });
    atualizarBotaoDesfazer();
}

function desfazerJogada() {
    if (!pilhaDesfazer.length || promocaoPendente) return;

    const estado = pilhaDesfazer.pop();
    tabuleiro.innerHTML = estado.tabuleiro;
    turno = estado.turno;
    jogoEncerrado = estado.jogoEncerrado;
    ultimoMovimento = estado.ultimoMovimento;
    historicoMovimentos = estado.historicoMovimentos;

    limparSelecao();
    fecharFimDeJogo();
    atualizarXeque();
    atualizarTurno();
    atualizarHistorico();
    atualizarUltimoMovimentoVisual();
    atualizarBotaoDesfazer();
}

function novaPartida() {
    fecharFimDeJogo();
    promocaoPendente = null;
    turno = 'w';
    jogoEncerrado = false;
    ultimoMovimento = null;
    historicoMovimentos = [];
    pilhaDesfazer = [];

    criarTabuleiro();
    limparSelecao();
    atualizarXeque();
    atualizarTurno();
    atualizarHistorico();
    atualizarUltimoMovimentoVisual();
    atualizarBotaoDesfazer();
}

function limparSelecao() {
    document.querySelectorAll('.casa').forEach(casa => {
        casa.classList.remove('selecionada','movimento','captura');
    });
    casaSelecionada = null;
}

/* ==================== CASAS E PEÇAS ==================== */

function obterPeca(linha, coluna) {
    const casa = pegarCasa(linha, coluna);
    const peca = casa?.querySelector('.peca');
    return peca?.dataset.peca || null;
}

function obterElementoPeca(linha, coluna) {
    return pegarCasa(linha, coluna)?.querySelector('.peca') || null;
}

function corDaPeca(peca) {
    return peca ? peca[0] : null;
}

function tipoDaPeca(peca) {
    return peca ? peca[1] : null;
}

function coordenadas(casa) {
    return {
        linha: parseInt(casa.dataset.linha),
        coluna: parseInt(casa.dataset.coluna)
    };
}

function pegarCasa(linha, coluna) {
    if (linha < 0 || linha > 7 || coluna < 0 || coluna > 7) return null;
    return document.querySelector(`.casa[data-linha="${linha}"][data-coluna="${coluna}"]`);
}

function caminhoLivre(linhaOrigem, colunaOrigem, linhaDestino, colunaDestino) {
    const passoLinha = Math.sign(linhaDestino - linhaOrigem);
    const passoColuna = Math.sign(colunaDestino - colunaOrigem);
    let linha = linhaOrigem + passoLinha;
    let coluna = colunaOrigem + passoColuna;

    while (linha !== linhaDestino || coluna !== colunaDestino) {
        if (obterPeca(linha, coluna)) return false;
        linha += passoLinha;
        coluna += passoColuna;
    }

    return true;
}

/* ==================== MOVIMENTOS ==================== */

function movimentosDeslizantes(linha, coluna, direcoes, cor) {
    const movimentos = [];

    for (const [dl, dc] of direcoes) {
        let novaLinha = linha + dl;
        let novaColuna = coluna + dc;

        while (novaLinha >= 0 && novaLinha <= 7 && novaColuna >= 0 && novaColuna <= 7) {
            const pecaDestino = obterPeca(novaLinha, novaColuna);

            if (!pecaDestino) {
                movimentos.push([novaLinha, novaColuna]);
            } else {
                if (corDaPeca(pecaDestino) !== cor && tipoDaPeca(pecaDestino) !== 'K') {
                    movimentos.push([novaLinha, novaColuna]);
                }
                break;
            }

            novaLinha += dl;
            novaColuna += dc;
        }
    }

    return movimentos;
}

function casaAtacada(linhaAlvo, colunaAlvo, corAtacante) {
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = obterPeca(linha, coluna);
            if (!peca || corDaPeca(peca) !== corAtacante) continue;

            const tipo = tipoDaPeca(peca);

            if (tipo === 'P') {
                const direcao = corAtacante === 'w' ? -1 : 1;
                if (linha + direcao === linhaAlvo && (coluna - 1 === colunaAlvo || coluna + 1 === colunaAlvo)) return true;
                continue;
            }

            if (tipo === 'N') {
                const movimentos = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
                for (const [dl, dc] of movimentos) {
                    if (linha + dl === linhaAlvo && coluna + dc === colunaAlvo) return true;
                }
                continue;
            }

            if (tipo === 'K') {
                if (Math.abs(linha - linhaAlvo) <= 1 && Math.abs(coluna - colunaAlvo) <= 1) return true;
                continue;
            }

            let direcoes = [];

            if (tipo === 'R') direcoes = [[-1,0],[1,0],[0,-1],[0,1]];
            else if (tipo === 'B') direcoes = [[-1,-1],[-1,1],[1,-1],[1,1]];
            else if (tipo === 'Q') direcoes = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];

            for (const [dl, dc] of direcoes) {
                let novaLinha = linha + dl;
                let novaColuna = coluna + dc;

                while (novaLinha >= 0 && novaLinha <= 7 && novaColuna >= 0 && novaColuna <= 7) {
                    if (novaLinha === linhaAlvo && novaColuna === colunaAlvo) return true;
                    if (obterPeca(novaLinha, novaColuna)) break;
                    novaLinha += dl;
                    novaColuna += dc;
                }
            }
        }
    }

    return false;
}

function encontrarRei(cor) {
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = obterPeca(linha, coluna);
            if (peca && corDaPeca(peca) === cor && tipoDaPeca(peca) === 'K') return { linha, coluna };
        }
    }
    return null;
}

function estaEmXeque(cor) {
    const rei = encontrarRei(cor);
    if (!rei) return false;
    return casaAtacada(rei.linha, rei.coluna, cor === 'w' ? 'b' : 'w');
}

/* ==================== ROQUE ==================== */

function podeFazerRoque(linha, coluna, destinoColuna) {
    const rei = obterElementoPeca(linha, coluna);
    if (!rei || rei.dataset.movido === 'true') return false;

    const cor = corDaPeca(rei.dataset.peca);
    if (estaEmXeque(cor)) return false;

    const ladoRei = destinoColuna > coluna;
    const colunaTorre = ladoRei ? 7 : 0;
    const torre = obterElementoPeca(linha, colunaTorre);

    if (!torre || torre.dataset.movido === 'true') return false;

    const inicio = Math.min(coluna, colunaTorre);
    const fim = Math.max(coluna, colunaTorre);

    for (let c = inicio + 1; c < fim; c++) {
        if (obterPeca(linha, c)) return false;
    }

    const passo = ladoRei ? 1 : -1;
    const adversario = cor === 'w' ? 'b' : 'w';

    return !casaAtacada(linha, coluna + passo, adversario) &&
           !casaAtacada(linha, destinoColuna, adversario);
}

/* ==================== MOVIMENTOS BRUTOS ==================== */

function obterMovimentosBrutos(linha, coluna) {
    const peca = obterPeca(linha, coluna);
    if (!peca) return [];

    const cor = corDaPeca(peca);
    const tipo = tipoDaPeca(peca);
    const movimentos = [];

    if (tipo === 'P') {
        const direcao = cor === 'w' ? -1 : 1;
        const linhaInicial = cor === 'w' ? 6 : 1;
        const proximaLinha = linha + direcao;

        if (proximaLinha >= 0 && proximaLinha <= 7 && !obterPeca(proximaLinha, coluna)) {
            movimentos.push([proximaLinha, coluna]);
            const segundaLinha = linha + direcao * 2;

            if (linha === linhaInicial && !obterPeca(segundaLinha, coluna)) {
                movimentos.push([segundaLinha, coluna]);
            }
        }

        for (const dc of [-1, 1]) {
            const novaColuna = coluna + dc;

            if (novaColuna < 0 || novaColuna > 7 || proximaLinha < 0 || proximaLinha > 7) continue;

            const pecaDestino = obterPeca(proximaLinha, novaColuna);

            if (pecaDestino && corDaPeca(pecaDestino) !== cor && tipoDaPeca(pecaDestino) !== 'K') {
                movimentos.push([proximaLinha, novaColuna]);
            }
        }

        if (ultimoMovimento) {
            const { origem, destino, peca: pecaUltimo } = ultimoMovimento;

            if (
                pecaUltimo &&
                tipoDaPeca(pecaUltimo) === 'P' &&
                corDaPeca(pecaUltimo) !== cor &&
                Math.abs(destino.linha - origem.linha) === 2 &&
                destino.linha === linha &&
                Math.abs(destino.coluna - coluna) === 1
            ) {
                const linhaDestino = linha + direcao;
                const casaDestino = pegarCasa(linhaDestino, destino.coluna);

                if (casaDestino && !obterPeca(linhaDestino, destino.coluna)) {
                    movimentos.push([linhaDestino, destino.coluna]);
                }
            }
        }

        return movimentos;
    }

    if (tipo === 'N') {
        const movimentosCavalo = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

        for (const [dl, dc] of movimentosCavalo) {
            const novaLinha = linha + dl;
            const novaColuna = coluna + dc;

            if (novaLinha < 0 || novaLinha > 7 || novaColuna < 0 || novaColuna > 7) continue;

            const destino = obterPeca(novaLinha, novaColuna);

            if (!destino || (corDaPeca(destino) !== cor && tipoDaPeca(destino) !== 'K')) {
                movimentos.push([novaLinha, novaColuna]);
            }
        }

        return movimentos;
    }

    if (tipo === 'B') return movimentosDeslizantes(linha, coluna, [[-1,-1],[-1,1],[1,-1],[1,1]], cor);

    if (tipo === 'R') return movimentosDeslizantes(linha, coluna, [[-1,0],[1,0],[0,-1],[0,1]], cor);

    if (tipo === 'Q') {
        return movimentosDeslizantes(linha, coluna, [
            [-1,0],[1,0],[0,-1],[0,1],
            [-1,-1],[-1,1],[1,-1],[1,1]
        ], cor);
    }

    if (tipo === 'K') {
        const movimentosRei = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

        for (const [dl, dc] of movimentosRei) {
            const novaLinha = linha + dl;
            const novaColuna = coluna + dc;

            if (novaLinha < 0 || novaLinha > 7 || novaColuna < 0 || novaColuna > 7) continue;

            const destino = obterPeca(novaLinha, novaColuna);

            if (!destino || (corDaPeca(destino) !== cor && tipoDaPeca(destino) !== 'K')) {
                movimentos.push([novaLinha, novaColuna]);
            }
        }

        if (podeFazerRoque(linha, coluna, coluna + 2)) movimentos.push([linha, coluna + 2]);
        if (podeFazerRoque(linha, coluna, coluna - 2)) movimentos.push([linha, coluna - 2]);

        return movimentos;
    }

    return movimentos;
}

/* ==================== SIMULAÇÃO ==================== */

function simularMovimento(origem, destino) {
    const pecaOrigem = obterElementoPeca(origem.linha, origem.coluna);
    const casaOrigem = pegarCasa(origem.linha, origem.coluna);
    const casaDestino = pegarCasa(destino.linha, destino.coluna);

    if (!pecaOrigem || !casaOrigem || !casaDestino) return null;

    const pecaCapturada = casaDestino.querySelector('.peca');
    let pecaCapturadaEnPassant = null;
    let casaCapturadaEnPassant = null;

    if (tipoDaPeca(pecaOrigem.dataset.peca) === 'P' && origem.coluna !== destino.coluna && !pecaCapturada) {
        casaCapturadaEnPassant = pegarCasa(origem.linha, destino.coluna);

        if (casaCapturadaEnPassant) {
            const possivelPeao = casaCapturadaEnPassant.querySelector('.peca');

            if (possivelPeao && tipoDaPeca(possivelPeao.dataset.peca) === 'P') {
                pecaCapturadaEnPassant = possivelPeao;
                casaCapturadaEnPassant.removeChild(pecaCapturadaEnPassant);
            }
        }
    }

    if (pecaCapturada) casaDestino.removeChild(pecaCapturada);
    casaDestino.appendChild(pecaOrigem);

    return { pecaOrigem, pecaCapturada, casaOrigem, casaDestino, pecaCapturadaEnPassant, casaCapturadaEnPassant };
}

function desfazerMovimento(simulacao) {
    if (!simulacao) return;

    const {
        pecaOrigem,
        pecaCapturada,
        casaOrigem,
        casaDestino,
        pecaCapturadaEnPassant,
        casaCapturadaEnPassant
    } = simulacao;

    casaOrigem.appendChild(pecaOrigem);
    if (pecaCapturada) casaDestino.appendChild(pecaCapturada);
    if (pecaCapturadaEnPassant && casaCapturadaEnPassant) casaCapturadaEnPassant.appendChild(pecaCapturadaEnPassant);
}

/* ==================== MOVIMENTOS LEGAIS ==================== */

function movimentosLegais(linha, coluna) {
    const peca = obterPeca(linha, coluna);
    if (!peca) return [];

    const cor = corDaPeca(peca);
    const movimentosLegais = [];

    for (const [destinoLinha, destinoColuna] of obterMovimentosBrutos(linha, coluna)) {
        if (tipoDaPeca(peca) === 'K' && Math.abs(destinoColuna - coluna) === 2) {
            movimentosLegais.push([destinoLinha, destinoColuna]);
            continue;
        }

        const simulacao = simularMovimento(
            { linha, coluna },
            { linha: destinoLinha, coluna: destinoColuna }
        );

        if (!simulacao) continue;

        const emXeque = estaEmXeque(cor);
        desfazerMovimento(simulacao);

        if (!emXeque) movimentosLegais.push([destinoLinha, destinoColuna]);
    }

    return movimentosLegais;
}

function mostrarMovimentos(linha, coluna) {
    const movimentos = movimentosLegais(linha, coluna);
    const casaOrigem = pegarCasa(linha, coluna);
    if (!casaOrigem) return;

    casaOrigem.classList.add('selecionada');

    for (const [l, c] of movimentos) {
        const casa = pegarCasa(l, c);
        if (!casa) continue;

        casa.classList.add('movimento');

        if (obterPeca(l, c)) casa.classList.add('captura');

        const pecaOrigem = obterPeca(linha, coluna);

        if (tipoDaPeca(pecaOrigem) === 'P' && coluna !== c && !obterPeca(l, c)) {
            casa.classList.add('captura');
        }
    }
}

function existemMovimentos(cor) {
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const peca = obterPeca(linha, coluna);
            if (peca && corDaPeca(peca) === cor && movimentosLegais(linha, coluna).length) return true;
        }
    }
    return false;
}

/* ==================== XEQUE ==================== */

function atualizarXeque() {
    document.querySelectorAll('.casa').forEach(casa => casa.classList.remove('xeque'));

    for (const cor of ['w','b']) {
        if (estaEmXeque(cor)) {
            const rei = encontrarRei(cor);
            const casaRei = rei && pegarCasa(rei.linha, rei.coluna);
            if (casaRei) casaRei.classList.add('xeque');
        }
    }
}

/* ==================== HISTÓRICO ==================== */

function nomePeca(tipo) {
    return { P:'', N:'C', B:'B', R:'T', Q:'D', K:'R' }[tipo] || '';
}

function casaAlgebrica(linha, coluna) {
    return 'abcdefgh'[coluna] + (8 - linha);
}

function registrarMovimento(origem, destino, peca, captura, roque, promocao) {
    const tipo = tipoDaPeca(peca);
    let anotacao = '';

    if (roque) {
        anotacao = destino.coluna > origem.coluna ? 'O-O' : 'O-O-O';
    } else {
        const nome = nomePeca(tipo);

        if (tipo === 'P') {
            if (captura) anotacao = casaAlgebrica(origem.linha, origem.coluna)[0] + 'x';
        } else {
            anotacao = nome + (captura ? 'x' : '');
        }

        anotacao += casaAlgebrica(destino.linha, destino.coluna);
        if (promocao) anotacao += '=' + nomePeca(promocao);
    }

    historicoMovimentos.push({ cor: corDaPeca(peca), anotacao });
    atualizarHistorico();
}

function atualizarHistorico() {
    const lista = document.querySelector('.lista-historico');
    if (!lista) return;

    lista.innerHTML = '';

    for (let i = 0; i < historicoMovimentos.length; i += 2) {
        const linha = document.createElement('div');
        linha.className = 'linha-historico';

        const numero = document.createElement('div');
        numero.className = 'numero-movimento';
        numero.textContent = i / 2 + 1 + '.';

        const branco = document.createElement('div');
        branco.className = 'movimento-branco';
        branco.textContent = historicoMovimentos[i]?.anotacao || '';

        const preto = document.createElement('div');
        preto.className = 'movimento-preto';
        preto.textContent = historicoMovimentos[i + 1]?.anotacao || '';

        linha.append(numero, branco, preto);
        lista.appendChild(linha);
    }

    lista.scrollTop = lista.scrollHeight;
}

function atualizarUltimoMovimentoVisual() {
    document.querySelectorAll('.ultimo-movimento').forEach(casa => casa.classList.remove('ultimo-movimento'));

    if (!ultimoMovimento) return;

    const origem = pegarCasa(ultimoMovimento.origem.linha, ultimoMovimento.origem.coluna);
    const destino = pegarCasa(ultimoMovimento.destino.linha, ultimoMovimento.destino.coluna);

    if (origem) origem.classList.add('ultimo-movimento');
    if (destino) destino.classList.add('ultimo-movimento');
}

/* ==================== FIM DE JOGO ==================== */

function verificarFimDeJogo() {
    if (existemMovimentos(turno)) return;

    jogoEncerrado = true;

    if (estaEmXeque(turno)) {
        const vencedor = turno === 'w' ? 'Pretas' : 'Brancas';

        if (historicoMovimentos.length) {
            historicoMovimentos.at(-1).anotacao += '#';
            atualizarHistorico();
        }

        mostrarFimDeJogo('Xeque-mate!', vencedor + ' venceram a partida.');
    } else {
        mostrarFimDeJogo('Empate!', 'A partida terminou por afogamento.');
    }
}

/* ==================== PROMOÇÃO ==================== */

function abrirPromocao(casa) {
    const peca = casa.querySelector('.peca');
    if (!peca || tipoDaPeca(peca.dataset.peca) !== 'P') return;

    const { linha } = coordenadas(casa);
    if (linha !== 0 && linha !== 7) return;

    promocaoPendente = casa;
    opcoesPromocao.innerHTML = '';

    const cor = corDaPeca(peca.dataset.peca);

    for (const tipoPromocao of ['Q','R','B','N']) {
        const botao = document.createElement('button');
        botao.className = 'opcao-promocao';

        const imagem = document.createElement('img');
        const nome = cor + tipoPromocao;

        imagem.src = `${baseUrl}img/pecas/${nome}.svg`;
        imagem.alt = nome;

        botao.appendChild(imagem);
        botao.addEventListener('click', () => escolherPromocao(tipoPromocao));
        opcoesPromocao.appendChild(botao);
    }

    promocaoOverlay.classList.add('ativa');
}

function escolherPromocao(tipo) {
    if (!promocaoPendente) return;

    const casa = promocaoPendente;
    const peca = casa.querySelector('.peca');

    if (!peca) {
        fecharPromocao();
        return;
    }

    const cor = corDaPeca(peca.dataset.peca);
    const nome = cor + tipo;

    peca.dataset.peca = nome;
    peca.src = `${baseUrl}img/pecas/${nome}.svg`;
    peca.dataset.movido = 'true';

    if (historicoMovimentos.length) {
        historicoMovimentos.at(-1).anotacao += '=' + nomePeca(tipo);
    }

    fecharPromocao();

    turno = turno === 'w' ? 'b' : 'w';

    atualizarXeque();
    adicionarIndicadorXeque();
    atualizarTurno();
    atualizarHistorico();
    verificarFimDeJogo();
    limparSelecao();
    atualizarUltimoMovimentoVisual();
}

function adicionarIndicadorXeque() {
    if (estaEmXeque(turno) && historicoMovimentos.length) {
        historicoMovimentos.at(-1).anotacao += '+';
        atualizarHistorico();
    }
}

function fecharPromocao() {
    promocaoOverlay.classList.remove('ativa');
    opcoesPromocao.innerHTML = '';
    promocaoPendente = null;
}

/* ==================== MOVER PEÇA ==================== */

function moverPeca(origem, destino) {
    const peca = obterElementoPeca(origem.linha, origem.coluna);
    const casaOrigem = pegarCasa(origem.linha, origem.coluna);
    const casaDestino = pegarCasa(destino.linha, destino.coluna);

    if (!peca || !casaOrigem || !casaDestino) return false;

    salvarEstado();

    const nome = peca.dataset.peca;
    const tipo = tipoDaPeca(nome);
    let capturaEnPassant = false;
    let captura = false;
    let roque = false;
    let promocao = null;

    if (tipo === 'P' && origem.coluna !== destino.coluna && !obterPeca(destino.linha, destino.coluna)) {
        const casaPeao = pegarCasa(origem.linha, destino.coluna);
        const peaoCapturado = casaPeao?.querySelector('.peca');

        if (peaoCapturado && tipoDaPeca(peaoCapturado.dataset.peca) === 'P' && corDaPeca(peaoCapturado.dataset.peca) !== corDaPeca(nome)) {
            casaPeao.removeChild(peaoCapturado);
            capturaEnPassant = true;
            captura = true;
        }
    }

    const pecaCapturada = casaDestino.querySelector('.peca');

    if (pecaCapturada) {
        casaDestino.removeChild(pecaCapturada);
        captura = true;
    }

    casaDestino.appendChild(peca);
    peca.dataset.movido = 'true';

    if (tipo === 'K' && Math.abs(destino.coluna - origem.coluna) === 2) {
        roque = true;
        fazerRoque(origem, destino);
    }

    ultimoMovimento = {
        origem: { linha: origem.linha, coluna: origem.coluna },
        destino: { linha: destino.linha, coluna: destino.coluna },
        peca: nome,
        capturaEnPassant
    };

    registrarMovimento(origem, destino, nome, captura, roque, promocao);

    if (tipo === 'P' && (destino.linha === 0 || destino.linha === 7)) {
        abrirPromocao(casaDestino);
        atualizarUltimoMovimentoVisual();
        return 'promocao';
    }

    turno = turno === 'w' ? 'b' : 'w';

    atualizarXeque();
    adicionarIndicadorXeque();
    atualizarTurno();
    atualizarUltimoMovimentoVisual();
    verificarFimDeJogo();

    return true;
}

/* ==================== ROQUE ==================== */

function fazerRoque(origem, destino) {
    const linha = origem.linha;
    const ladoRei = destino.coluna > origem.coluna;
    const colunaTorreOrigem = ladoRei ? 7 : 0;
    const colunaTorreDestino = ladoRei ? 5 : 3;
    const torre = obterElementoPeca(linha, colunaTorreOrigem);
    const casaTorreDestino = pegarCasa(linha, colunaTorreDestino);

    if (torre && casaTorreDestino) {
        casaTorreDestino.appendChild(torre);
        torre.dataset.movido = 'true';
    }
}

/* ==================== TABULEIRO ==================== */

function criarTabuleiro() {
    tabuleiro.innerHTML = '';
    const letras = 'abcdefgh';

    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            const casa = document.createElement('div');

            casa.classList.add('casa', (linha + coluna) % 2 === 0 ? 'clara' : 'escura');
            casa.dataset.linha = linha;
            casa.dataset.coluna = coluna;

            if (linha === 7) {
                const coordenadaColuna = document.createElement('span');
                coordenadaColuna.className = 'coordenada-coluna';
                coordenadaColuna.textContent = letras[coluna];
                casa.appendChild(coordenadaColuna);
            }

            if (coluna === 0) {
                const coordenadaLinha = document.createElement('span');
                coordenadaLinha.className = 'coordenada-linha';
                coordenadaLinha.textContent = 8 - linha;
                casa.appendChild(coordenadaLinha);
            }

            if (linha === 0) criarPeca(casa, pecas.pretas[coluna]);
            if (linha === 1) criarPeca(casa, 'bP');
            if (linha === 6) criarPeca(casa, 'wP');
            if (linha === 7) criarPeca(casa, pecas.brancas[coluna]);

            tabuleiro.appendChild(casa);
        }
    }
}

function criarPeca(casa, nomePeca) {
    const imagem = document.createElement('img');
    imagem.classList.add('peca');
    imagem.src = `${baseUrl}img/pecas/${nomePeca}.svg`;
    imagem.alt = nomePeca;
    imagem.dataset.peca = nomePeca;
    imagem.dataset.movido = 'false';
    casa.appendChild(imagem);
}

/* ==================== CLIQUE ==================== */

tabuleiro.addEventListener('click', function(event) {
    if (jogoEncerrado || promocaoPendente) return;

    const casa = event.target.closest('.casa');
    if (!casa) return;

    const { linha, coluna } = coordenadas(casa);
    const peca = obterPeca(linha, coluna);

    if (!casaSelecionada) {
        if (peca && corDaPeca(peca) === turno) {
            casaSelecionada = { linha, coluna };
            mostrarMovimentos(linha, coluna);
        }
        return;
    }

    if (casaSelecionada.linha === linha && casaSelecionada.coluna === coluna) {
        limparSelecao();
        return;
    }

    if (peca && corDaPeca(peca) === turno) {
        limparSelecao();
        casaSelecionada = { linha, coluna };
        mostrarMovimentos(linha, coluna);
        return;
    }

    const movimentos = movimentosLegais(casaSelecionada.linha, casaSelecionada.coluna);
    const movimentoPermitido = movimentos.some(([l, c]) => l === linha && c === coluna);

    if (!movimentoPermitido) return;

    const resultado = moverPeca(casaSelecionada, { linha, coluna });

    if (resultado === 'promocao') {
        limparSelecao();
        return;
    }

    limparSelecao();
});

/* ==================== INICIAR ==================== */

criarInterface();
criarTabuleiro();
atualizarXeque();
atualizarTurno();
atualizarHistorico();
atualizarUltimoMovimentoVisual();
atualizarBotaoDesfazer();