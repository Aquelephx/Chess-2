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
        casa.classList.remove('roque');
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
// PEGAR ELEMENTO DA PEÇA
// =========================

function obterElementoPeca(casa) {

    return casa.querySelector('.peca');
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

    if (
        linha < 0 ||
        linha > 7 ||
        coluna < 0 ||
        coluna > 7
    ) {
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

            if (
                frenteDois &&
                !obterPeca(frenteDois)
            ) {
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


// =====================================================
// CASA É ATACADA?
// =====================================================

function casaAtacada(casa, corAtacante) {

    const casas = document.querySelectorAll('.casa');

    for (const origem of casas) {

        const peca = obterPeca(origem);

        if (!peca) {
            continue;
        }

        if (corDaPeca(peca) !== corAtacante) {
            continue;
        }

        const tipo = peca.charAt(1);

        const origemCoord = coordenadas(origem);
        const destinoCoord = coordenadas(casa);

        const dl =
            destinoCoord.linha -
            origemCoord.linha;

        const dc =
            destinoCoord.coluna -
            origemCoord.coluna;


        // =========================
        // PEÃO
        // =========================

        if (tipo === 'P') {

            const direcao =
                corAtacante === 'w'
                    ? -1
                    : 1;

            if (
                dl === direcao &&
                Math.abs(dc) === 1
            ) {
                return true;
            }
        }


        // =========================
        // CAVALO
        // =========================

        if (tipo === 'N') {

            const movimentoCavalo =
                (Math.abs(dl) === 2 &&
                 Math.abs(dc) === 1) ||

                (Math.abs(dl) === 1 &&
                 Math.abs(dc) === 2);

            if (movimentoCavalo) {
                return true;
            }
        }


        // =========================
        // REI
        // =========================

        if (tipo === 'K') {

            if (
                Math.abs(dl) <= 1 &&
                Math.abs(dc) <= 1
            ) {
                return true;
            }
        }


        // =========================
        // TORRE / DAMA
        // =========================

        if (
            tipo === 'R' ||
            tipo === 'Q'
        ) {

            const movimentoReto =
                dl === 0 ||
                dc === 0;

            if (!movimentoReto) {
                continue;
            }

            const passoLinha =
                dl === 0
                    ? 0
                    : dl > 0
                        ? 1
                        : -1;

            const passoColuna =
                dc === 0
                    ? 0
                    : dc > 0
                        ? 1
                        : -1;

            let linha =
                origemCoord.linha +
                passoLinha;

            let coluna =
                origemCoord.coluna +
                passoColuna;

            let caminhoLivre = true;

            while (
                linha !== destinoCoord.linha ||
                coluna !== destinoCoord.coluna
            ) {

                const casaEntre =
                    pegarCasa(linha, coluna);

                if (obterPeca(casaEntre)) {

                    caminhoLivre = false;
                    break;
                }

                linha += passoLinha;
                coluna += passoColuna;
            }

            if (caminhoLivre) {
                return true;
            }
        }


        // =========================
        // BISPO / DAMA
        // =========================

        if (
            tipo === 'B' ||
            tipo === 'Q'
        ) {

            if (
                Math.abs(dl) !== Math.abs(dc)
            ) {
                continue;
            }

            const passoLinha =
                dl > 0 ? 1 : -1;

            const passoColuna =
                dc > 0 ? 1 : -1;

            let linha =
                origemCoord.linha +
                passoLinha;

            let coluna =
                origemCoord.coluna +
                passoColuna;

            let caminhoLivre = true;

            while (
                linha !== destinoCoord.linha ||
                coluna !== destinoCoord.coluna
            ) {

                const casaEntre =
                    pegarCasa(linha, coluna);

                if (obterPeca(casaEntre)) {

                    caminhoLivre = false;
                    break;
                }

                linha += passoLinha;
                coluna += passoColuna;
            }

            if (caminhoLivre) {
                return true;
            }
        }
    }

    return false;
}


// =====================================================
// PODE FAZER ROQUE?
// =====================================================

function podeFazerRoque(casa, cor, lado) {

    const rei = obterElementoPeca(casa);

    if (!rei) {
        return false;
    }


    // Rei já se moveu?

    if (rei.dataset.moveu === 'true') {
        return false;
    }


    const { linha, coluna } =
        coordenadas(casa);


    // Cor adversária

    const corInimiga =
        cor === 'w'
            ? 'b'
            : 'w';


    // =====================================
    // REI ESTÁ EM XEQUE?
    // =====================================

    if (
        casaAtacada(
            casa,
            corInimiga
        )
    ) {
        return false;
    }


    let colunaTorre;
    let colunaDestinoRei;
    let casasEntre;


    // =====================================
    // ROQUE PEQUENO
    // =====================================

    if (lado === 'pequeno') {

        colunaTorre =
            coluna + 3;

        colunaDestinoRei =
            coluna + 2;

        casasEntre = [
            coluna + 1,
            coluna + 2
        ];
    }


    // =====================================
    // ROQUE GRANDE
    // =====================================

    else {

        colunaTorre =
            coluna - 4;

        colunaDestinoRei =
            coluna - 2;

        casasEntre = [
            coluna - 1,
            coluna - 2,
            coluna - 3
        ];
    }


    // =====================================
    // PEGAR TORRE
    // =====================================

    const casaTorre =
        pegarCasa(
            linha,
            colunaTorre
        );

    if (!casaTorre) {
        return false;
    }


    const torre =
        obterElementoPeca(casaTorre);

    if (!torre) {
        return false;
    }


    const nomeTorre =
        obterPeca(casaTorre);


    // Tem que ser torre da mesma cor

    if (
        corDaPeca(nomeTorre) !== cor
    ) {
        return false;
    }


    // Tem que ser realmente uma torre

    if (nomeTorre.charAt(1) !== 'R') {
        return false;
    }


    // Torre já se moveu?

    if (torre.dataset.moveu === 'true') {
        return false;
    }


    // =====================================
    // CASAS ENTRE REI E TORRE
    // PRECISAM ESTAR VAZIAS
    // =====================================

    for (const colunaCasa of casasEntre) {

        const casaEntre =
            pegarCasa(
                linha,
                colunaCasa
            );

        if (!casaEntre) {
            return false;
        }

        if (obterPeca(casaEntre)) {
            return false;
        }
    }


    // =====================================
    // CASA QUE O REI ATRAVESSA
    // =====================================

    const casaPassagem =
        pegarCasa(
            linha,
            coluna +
                (
                    lado === 'pequeno'
                        ? 1
                        : -1
                )
        );


    // =====================================
    // CASA FINAL DO REI
    // =====================================

    const destinoRei =
        pegarCasa(
            linha,
            colunaDestinoRei
        );


    // =====================================
    // REI NÃO PODE PASSAR POR ATAQUE
    // =====================================

    if (
        casaAtacada(
            casaPassagem,
            corInimiga
        )
    ) {
        return false;
    }


    // =====================================
    // REI NÃO PODE TERMINAR EM ATAQUE
    // =====================================

    if (
        casaAtacada(
            destinoRei,
            corInimiga
        )
    ) {
        return false;
    }


    return true;
}


// =====================================================
// MOVIMENTOS DO REI
// =====================================================

function movimentosRei(casa, cor) {

    const { linha, coluna } =
        coordenadas(casa);

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


    // =====================================
    // MOVIMENTO NORMAL
    // =====================================

    direcoes.forEach(([dl, dc]) => {

        const destino =
            pegarCasa(
                linha + dl,
                coluna + dc
            );

        if (!destino) {
            return;
        }

        const peca =
            obterPeca(destino);

        if (!peca) {

            destino.classList.add(
                'movimento'
            );

        } else if (
            corDaPeca(peca) !== cor
        ) {

            destino.classList.add(
                'movimento'
            );

            destino.classList.add(
                'captura'
            );
        }
    });


    // =====================================
    // ROQUE PEQUENO
    // =====================================

    if (
        podeFazerRoque(
            casa,
            cor,
            'pequeno'
        )
    ) {

        const destino =
            pegarCasa(
                linha,
                coluna + 2
            );

        destino.classList.add(
            'movimento'
        );

        destino.classList.add(
            'roque'
        );
    }


    // =====================================
    // ROQUE GRANDE
    // =====================================

    if (
        podeFazerRoque(
            casa,
            cor,
            'grande'
        )
    ) {

        const destino =
            pegarCasa(
                linha,
                coluna - 2
            );

        destino.classList.add(
            'movimento'
        );

        destino.classList.add(
            'roque'
        );
    }
}


// =========================
// MOSTRAR MOVIMENTOS
// =========================

function mostrarMovimentos(casa) {

    const nomePeca =
        obterPeca(casa);

    if (!nomePeca) {
        return;
    }

    const cor =
        corDaPeca(nomePeca);

    const tipo =
        nomePeca.charAt(1);


    if (tipo === 'P') {
        movimentosPeao(
            casa,
            cor
        );
    }

    if (tipo === 'N') {
        movimentosCavalo(
            casa,
            cor
        );
    }

    if (tipo === 'B') {
        movimentosBispo(
            casa,
            cor
        );
    }

    if (tipo === 'R') {
        movimentosTorre(
            casa,
            cor
        );
    }

    if (tipo === 'Q') {
        movimentosDama(
            casa,
            cor
        );
    }

    if (tipo === 'K') {
        movimentosRei(
            casa,
            cor
        );
    }
}


// =====================================================
// MOVER PEÇA
// =====================================================

function moverPeca(origem, destino) {

    const peca =
        obterElementoPeca(origem);

    if (!peca) {
        return;
    }


    // Captura

    const pecaDestino =
        obterElementoPeca(destino);

    if (pecaDestino) {
        pecaDestino.remove();
    }


    // Mover

    destino.appendChild(peca);


    // =====================================
    // MARCAR QUE A PEÇA JÁ SE MOVEU
    // =====================================

    peca.dataset.moveu = 'true';
}


// =====================================================
// FAZER ROQUE
// =====================================================

function fazerRoque(rei, destino) {

    const origemCoord =
        coordenadas(rei);

    const destinoCoord =
        coordenadas(destino);

    const diferenca =
        destinoCoord.coluna -
        origemCoord.coluna;


    // =====================================
    // ROQUE PEQUENO
    // =====================================

    if (diferenca === 2) {

        const casaTorre =
            pegarCasa(
                origemCoord.linha,
                origemCoord.coluna + 3
            );

        const destinoTorre =
            pegarCasa(
                origemCoord.linha,
                origemCoord.coluna + 1
            );

        moverPeca(
            casaTorre,
            destinoTorre
        );
    }


    // =====================================
    // ROQUE GRANDE
    // =====================================

    else if (diferenca === -2) {

        const casaTorre =
            pegarCasa(
                origemCoord.linha,
                origemCoord.coluna - 4
            );

        const destinoTorre =
            pegarCasa(
                origemCoord.linha,
                origemCoord.coluna - 1
            );

        moverPeca(
            casaTorre,
            destinoTorre
        );
    }


    // Mover o rei

    moverPeca(
        rei,
        destino
    );
}


// =====================================================
// CRIAR TABULEIRO
// =====================================================

for (let linha = 0; linha < 8; linha++) {

    for (let coluna = 0; coluna < 8; coluna++) {

        const casa =
            document.createElement('div');

        casa.classList.add('casa');


        // Cor da casa

        if (
            (linha + coluna) % 2 === 0
        ) {

            casa.classList.add('clara');

        } else {

            casa.classList.add('escura');
        }


        let nomePeca = null;


        // Pretas

        if (linha === 0) {
            nomePeca =
                pecas.pretas[coluna];
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
            nomePeca =
                pecas.brancas[coluna];
        }


        // =====================================
        // CRIAR IMAGEM DA PEÇA
        // =====================================

        if (nomePeca) {

            const imagem =
                document.createElement('img');

            imagem.src =
                `${baseUrl}img/pecas/${nomePeca}.svg`;

            imagem.classList.add('peca');

            // Começa como não movimentada
            imagem.dataset.moveu = 'false';

            casa.appendChild(imagem);
        }


        // =================================================
        // CLIQUE
        // =================================================

        casa.addEventListener(
            'click',
            () => {


                // =========================================
                // PRIMEIRO CLIQUE
                // =========================================

                if (
                    casaSelecionada === null
                ) {

                    const nomePeca =
                        obterPeca(casa);

                    if (!nomePeca) {
                        return;
                    }

                    const cor =
                        corDaPeca(nomePeca);


                    // Só joga no próprio turno

                    if (cor !== turno) {
                        return;
                    }


                    casaSelecionada =
                        casa;

                    casa.classList.add(
                        'selecionada'
                    );

                    mostrarMovimentos(
                        casa
                    );

                    return;
                }


                // =========================================
                // CLICOU NA MESMA CASA
                // =========================================

                if (
                    casa === casaSelecionada
                ) {

                    limparSelecao();

                    return;
                }


                // =========================================
                // OUTRA PEÇA
                // =========================================

                const pecaClicada =
                    obterPeca(casa);

                if (
                    pecaClicada &&
                    corDaPeca(
                        pecaClicada
                    ) === turno
                ) {

                    limparSelecao();

                    casaSelecionada =
                        casa;

                    casa.classList.add(
                        'selecionada'
                    );

                    mostrarMovimentos(
                        casa
                    );

                    return;
                }


                // =========================================
                // MOVIMENTO
                // =========================================

                if (
                    casa.classList.contains(
                        'movimento'
                    )
                ) {

                    const origem =
                        casaSelecionada;

                    const peca =
                        obterElementoPeca(
                            origem
                        );

                    if (!peca) {
                        limparSelecao();
                        return;
                    }


                    // =====================================
                    // ROQUE
                    // =====================================

                    if (
                        casa.classList.contains(
                            'roque'
                        )
                    ) {

                        fazerRoque(
                            origem,
                            casa
                        );

                    }

                    // =====================================
                    // MOVIMENTO NORMAL
                    // =====================================

                    else {

                        moverPeca(
                            origem,
                            casa
                        );
                    }


                    // =====================================
                    // TROCAR TURNO
                    // =====================================

                    turno =
                        turno === 'w'
                            ? 'b'
                            : 'w';
                }


                limparSelecao();
            }
        );


        tabuleiro.appendChild(casa);
    }
}
