const tabuleiro = document.getElementById('tabuleiro');

const pecas = {
    pretas: ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    brancas: ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
};

let casaSelecionada = null;
let turno = 'w';


// =========================
// LIMPAR SELEÇÃO
// =========================

function limparSelecao() {

    document.querySelectorAll('.casa').forEach(casa => {
        casa.classList.remove('selecionada');
        casa.classList.remove('movimento');
        casa.classList.remove('captura');
    });

    casaSelecionada = null;
}


// =========================
// PEGAR PEÇA
// =========================

function obterPeca(casa) {

    const imagem = casa.querySelector('.peca');

    if (!imagem) {
        return null;
    }

    return imagem.src
        .split('/')
        .pop()
        .replace('.svg', '');
}


// =========================
// COR DA PEÇA
// =========================

function corDaPeca(nomePeca) {

    if (!nomePeca) {
        return null;
    }

    return nomePeca.charAt(0);
}


// =========================
// COORDENADAS
// =========================

function coordenadas(casa) {

    const casas = [...document.querySelectorAll('.casa')];

    const indice = casas.indexOf(casa);

    return {
        linha: Math.floor(indice / 8),
        coluna: indice % 8
    };
}


// =========================
// PEGAR CASA
// =========================

function pegarCasa(linha, coluna) {

    if (linha < 0 || linha > 7 || coluna < 0 || coluna > 7) {
        return null;
    }

    const casas = document.querySelectorAll('.casa');

    return casas[linha * 8 + coluna];
}


// =========================
// ADICIONAR MOVIMENTO
// =========================

function adicionarMovimento(casa, cor) {

    if (!casa) {
        return false;
    }

    const pecaDestino = obterPeca(casa);

    if (!pecaDestino) {

        casa.classList.add('movimento');

        return true;
    }

    if (corDaPeca(pecaDestino) !== cor) {

        casa.classList.add('movimento');
        casa.classList.add('captura');
    }

    return false;
}


// =========================
// PEÃO
// =========================

function movimentosPeao(casa, cor) {

    const { linha, coluna } = coordenadas(casa);

    const direcao = cor === 'w' ? -1 : 1;

    const linhaInicial = cor === 'w' ? 6 : 1;


    // Uma casa para frente

    const frente = pegarCasa(
        linha + direcao,
        coluna
    );

    if (frente && !obterPeca(frente)) {

        frente.classList.add('movimento');


        // Duas casas no primeiro movimento

        if (linha === linhaInicial) {

            const frenteDois = pegarCasa(
                linha + direcao * 2,
                coluna
            );

            if (frenteDois && !obterPeca(frenteDois)) {
                frenteDois.classList.add('movimento');
            }
        }
    }


    // Captura esquerda

    const diagonalEsquerda = pegarCasa(
        linha + direcao,
        coluna - 1
    );

    if (
        diagonalEsquerda &&
        obterPeca(diagonalEsquerda) &&
        corDaPeca(obterPeca(diagonalEsquerda)) !== cor
    ) {

        diagonalEsquerda.classList.add('movimento');
        diagonalEsquerda.classList.add('captura');
    }


    // Captura direita

    const diagonalDireita = pegarCasa(
        linha + direcao,
        coluna + 1
    );

    if (
        diagonalDireita &&
        obterPeca(diagonalDireita) &&
        corDaPeca(obterPeca(diagonalDireita)) !== cor
    ) {

        diagonalDireita.classList.add('movimento');
        diagonalDireita.classList.add('captura');
    }
}


// =========================
// CAVALO
// =========================

function movimentosCavalo(casa, cor) {

    const { linha, coluna } = coordenadas(casa);

    const movimentos = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]
    ];

    movimentos.forEach(([dl, dc]) => {

        const destino = pegarCasa(
            linha + dl,
            coluna + dc
        );

        if (!destino) {
            return;
        }

        const peca = obterPeca(destino);

        if (!peca) {

            destino.classList.add('movimento');

        } else if (corDaPeca(peca) !== cor) {

            destino.classList.add('movimento');
            destino.classList.add('captura');
        }
    });
}


// =========================
// BISPO
// =========================

function movimentosBispo(casa, cor) {

    const { linha, coluna } = coordenadas(casa);

    const direcoes = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
    ];

    movimentosDeslizantes(
        linha,
        coluna,
        cor,
        direcoes
    );
}


// =========================
// TORRE
// =========================

function movimentosTorre(casa, cor) {

    const { linha, coluna } = coordenadas(casa);

    const direcoes = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    movimentosDeslizantes(
        linha,
        coluna,
        cor,
        direcoes
    );
}


// =========================
// DAMA
// =========================

function movimentosDama(casa, cor) {

    const { linha, coluna } = coordenadas(casa);

    const direcoes = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    movimentosDeslizantes(
        linha,
        coluna,
        cor,
        direcoes
    );
}


// =========================
// MOVIMENTOS DESLIZANTES
// =========================

function movimentosDeslizantes(
    linha,
    coluna,
    cor,
    direcoes
) {

    direcoes.forEach(([dl, dc]) => {

        let novaLinha = linha + dl;
        let novaColuna = coluna + dc;

        while (
            novaLinha >= 0 &&
            novaLinha < 8 &&
            novaColuna >= 0 &&
            novaColuna < 8
        ) {

            const destino = pegarCasa(
                novaLinha,
                novaColuna
            );

            const peca = obterPeca(destino);


            if (!peca) {

                destino.classList.add('movimento');

            } else {

                if (corDaPeca(peca) !== cor) {

                    destino.classList.add('movimento');
                    destino.classList.add('captura');
                }

                break;
            }

            novaLinha += dl;
            novaColuna += dc;
        }
    });
}


// =========================
// REI
// =========================

function movimentosRei(casa, cor) {

    const { linha, coluna } = coordenadas(casa);

    const direcoes = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];

    direcoes.forEach(([dl, dc]) => {

        const destino = pegarCasa(
            linha + dl,
            coluna + dc
        );

        if (!destino) {
            return;
        }

        const peca = obterPeca(destino);

        if (!peca) {

            destino.classList.add('movimento');

        } else if (corDaPeca(peca) !== cor) {

            destino.classList.add('movimento');
            destino.classList.add('captura');
        }
    });
}


// =========================
// MOSTRAR MOVIMENTOS
// =========================

function mostrarMovimentos(casa) {

    const nomePeca = obterPeca(casa);

    if (!nomePeca) {
        return;
    }

    const cor = corDaPeca(nomePeca);
    const tipo = nomePeca.charAt(1);


    if (tipo === 'P') {
        movimentosPeao(casa, cor);
    }

    if (tipo === 'N') {
        movimentosCavalo(casa, cor);
    }

    if (tipo === 'B') {
        movimentosBispo(casa, cor);
    }

    if (tipo === 'R') {
        movimentosTorre(casa, cor);
    }

    if (tipo === 'Q') {
        movimentosDama(casa, cor);
    }

    if (tipo === 'K') {
        movimentosRei(casa, cor);
    }
}


// =========================
// CRIAR TABULEIRO
// =========================

for (let linha = 0; linha < 8; linha++) {

    for (let coluna = 0; coluna < 8; coluna++) {

        const casa = document.createElement('div');

        casa.classList.add('casa');


        // Cor da casa

        if ((linha + coluna) % 2 === 0) {
            casa.classList.add('clara');
        } else {
            casa.classList.add('escura');
        }


        let nomePeca = null;


        // Pretas

        if (linha === 0) {
            nomePeca = pecas.pretas[coluna];
        }


        // Peões pretos

        if (linha === 1) {
            nomePeca = 'bP';
        }


        // Peões brancos

        if (linha === 6) {
            nomePeca = 'wP';
        }


        // Brancas

        if (linha === 7) {
            nomePeca = pecas.brancas[coluna];
        }


        // Criar imagem

        if (nomePeca) {

            const imagem = document.createElement('img');

            imagem.src =
                `${baseUrl}img/pecas/${nomePeca}.svg`;

            imagem.classList.add('peca');

            casa.appendChild(imagem);
        }


        // =========================
        // CLIQUE
        // =========================

        casa.addEventListener('click', () => {


            // PRIMEIRO CLIQUE

            if (casaSelecionada === null) {

                const nomePeca = obterPeca(casa);

                if (!nomePeca) {
                    return;
                }

                const cor = corDaPeca(nomePeca);


                // Só pode jogar no próprio turno

                if (cor !== turno) {
                    return;
                }


                casaSelecionada = casa;

                casa.classList.add('selecionada');

                mostrarMovimentos(casa);

                return;
            }


            // Clicou na mesma casa

            if (casa === casaSelecionada) {

                limparSelecao();

                return;
            }


            // =========================
            // OUTRA PEÇA
            // =========================

            const pecaClicada = obterPeca(casa);

            if (
                pecaClicada &&
                corDaPeca(pecaClicada) === turno
            ) {

                limparSelecao();

                casaSelecionada = casa;

                casa.classList.add('selecionada');

                mostrarMovimentos(casa);

                return;
            }


            // =========================
            // MOVIMENTO
            // =========================

            if (
                casa.classList.contains('movimento')
            ) {

                const peca =
                    casaSelecionada.querySelector('.peca');

                if (peca) {

                    const pecaDestino =
                        casa.querySelector('.peca');


                    // Captura

                    if (pecaDestino) {
                        pecaDestino.remove();
                    }


                    // Move

                    casa.appendChild(peca);


                    // Troca turno

                    turno =
                        turno === 'w'
                            ? 'b'
                            : 'w';
                }
            }


            limparSelecao();
        });


        tabuleiro.appendChild(casa);
    }
}