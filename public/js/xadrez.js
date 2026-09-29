const tabuleiro = document.getElementById('tabuleiro');

const pecas = {
    pretas: ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    brancas: ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
};

let casaSelecionada = null;
let turno = 'w';
let jogoEncerrado = false;


// =====================================================
// UTILITÁRIOS
// =====================================================

function limparSelecao() {

    document.querySelectorAll('.casa').forEach(casa => {

        casa.classList.remove('selecionada');
        casa.classList.remove('movimento');
        casa.classList.remove('captura');
        casa.classList.remove('roque');

    });

    casaSelecionada = null;
}


function obterPeca(casa) {

    if (!casa) {
        return null;
    }

    const imagem = casa.querySelector('.peca');

    if (!imagem) {
        return null;
    }

    return imagem.src
        .split('/')
        .pop()
        .replace('.svg', '');
}


function obterElementoPeca(casa) {

    if (!casa) {
        return null;
    }

    return casa.querySelector('.peca');
}


function corDaPeca(nomePeca) {

    if (!nomePeca) {
        return null;
    }

    return nomePeca.charAt(0);
}


function tipoDaPeca(nomePeca) {

    if (!nomePeca) {
        return null;
    }

    return nomePeca.charAt(1);
}


function coordenadas(casa) {

    const casas = [...document.querySelectorAll('.casa')];

    const indice = casas.indexOf(casa);

    return {
        linha: Math.floor(indice / 8),
        coluna: indice % 8
    };
}


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


// =====================================================
// CAMINHO LIVRE
// =====================================================

function caminhoLivre(origem, destino) {

    const origemCoord = coordenadas(origem);
    const destinoCoord = coordenadas(destino);

    const dl =
        destinoCoord.linha -
        origemCoord.linha;

    const dc =
        destinoCoord.coluna -
        origemCoord.coluna;

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

    while (
        linha !== destinoCoord.linha ||
        coluna !== destinoCoord.coluna
    ) {

        const casa = pegarCasa(linha, coluna);

        if (obterPeca(casa)) {
            return false;
        }

        linha += passoLinha;
        coluna += passoColuna;
    }

    return true;
}


// =====================================================
// MOVIMENTOS DESLIZANTES
// =====================================================

function movimentosDeslizantes(
    linha,
    coluna,
    cor,
    direcoes,
    resultado
) {

    for (const [dl, dc] of direcoes) {

        let novaLinha = linha + dl;
        let novaColuna = coluna + dc;

        while (
            novaLinha >= 0 &&
            novaLinha < 8 &&
            novaColuna >= 0 &&
            novaColuna < 8
        ) {

            const destino =
                pegarCasa(
                    novaLinha,
                    novaColuna
                );

            const peca =
                obterPeca(destino);

            if (!peca) {

                resultado.push(destino);

            } else {

                const corDestino =
                    corDaPeca(peca);

                const tipoDestino =
                    tipoDaPeca(peca);

                // Nunca podemos capturar o rei.
                if (
                    corDestino !== cor &&
                    tipoDestino !== 'K'
                ) {
                    resultado.push(destino);
                }

                break;
            }

            novaLinha += dl;
            novaColuna += dc;
        }
    }
}


// =====================================================
// CASA É ATACADA
// =====================================================

function casaAtacada(casa, corAtacante) {

    if (!casa) {
        return false;
    }

    const casas = document.querySelectorAll('.casa');

    for (const origem of casas) {

        const peca = obterPeca(origem);

        if (!peca) {
            continue;
        }

        if (corDaPeca(peca) !== corAtacante) {
            continue;
        }

        const tipo = tipoDaPeca(peca);

        const origemCoord = coordenadas(origem);
        const destinoCoord = coordenadas(casa);

        const dl =
            destinoCoord.linha -
            origemCoord.linha;

        const dc =
            destinoCoord.coluna -
            origemCoord.coluna;


        // =================================================
        // PEÃO
        // =================================================

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

            continue;
        }


        // =================================================
        // CAVALO
        // =================================================

        if (tipo === 'N') {

            if (
                (
                    Math.abs(dl) === 2 &&
                    Math.abs(dc) === 1
                ) ||
                (
                    Math.abs(dl) === 1 &&
                    Math.abs(dc) === 2
                )
            ) {
                return true;
            }

            continue;
        }


        // =================================================
        // REI
        // =================================================

        if (tipo === 'K') {

            if (
                Math.abs(dl) <= 1 &&
                Math.abs(dc) <= 1 &&
                (
                    dl !== 0 ||
                    dc !== 0
                )
            ) {
                return true;
            }

            continue;
        }


        // =================================================
        // TORRE
        // =================================================

        if (tipo === 'R') {

            if (
                dl === 0 ||
                dc === 0
            ) {

                if (
                    dl !== 0 ||
                    dc !== 0
                ) {

                    if (
                        caminhoLivre(
                            origem,
                            casa
                        )
                    ) {
                        return true;
                    }
                }
            }

            continue;
        }


        // =================================================
        // BISPO
        // =================================================

        if (tipo === 'B') {

            if (
                Math.abs(dl) === Math.abs(dc) &&
                dl !== 0
            ) {

                if (
                    caminhoLivre(
                        origem,
                        casa
                    )
                ) {
                    return true;
                }
            }

            continue;
        }


        // =================================================
        // DAMA
        // =================================================

        if (tipo === 'Q') {

            const movimentoReto =
                dl === 0 ||
                dc === 0;

            const movimentoDiagonal =
                Math.abs(dl) === Math.abs(dc);


            // Dama andando como torre

            if (
                movimentoReto &&
                (dl !== 0 || dc !== 0)
            ) {

                if (
                    caminhoLivre(
                        origem,
                        casa
                    )
                ) {
                    return true;
                }
            }


            // Dama andando como bispo

            if (
                movimentoDiagonal &&
                dl !== 0
            ) {

                if (
                    caminhoLivre(
                        origem,
                        casa
                    )
                ) {
                    return true;
                }
            }

            continue;
        }
    }

    return false;
}
// =====================================================
// ENCONTRAR REI
// =====================================================

function encontrarRei(cor) {

    const casas =
        document.querySelectorAll('.casa');

    for (const casa of casas) {

        const peca =
            obterPeca(casa);

        if (
            peca === cor + 'K'
        ) {
            return casa;
        }
    }

    return null;
}


// =====================================================
// REI ESTÁ EM XEQUE?
// =====================================================

function estaEmXeque(cor) {

    const rei =
        encontrarRei(cor);

    if (!rei) {
        return false;
    }

    const inimigo =
        cor === 'w'
            ? 'b'
            : 'w';

    return casaAtacada(
        rei,
        inimigo
    );
}


// =====================================================
// PODE FAZER ROQUE?
// =====================================================

function podeFazerRoque(
    casa,
    cor,
    lado
) {

    const rei =
        obterElementoPeca(casa);

    if (!rei) {
        return false;
    }

    if (
        tipoDaPeca(obterPeca(casa)) !== 'K'
    ) {
        return false;
    }

    if (
        rei.dataset.moveu === 'true'
    ) {
        return false;
    }

    const {
        linha,
        coluna
    } = coordenadas(casa);

    const linhaInicial =
        cor === 'w'
            ? 7
            : 0;

    if (
        linha !== linhaInicial ||
        coluna !== 4
    ) {
        return false;
    }


    // Rei não pode estar em xeque.

    if (
        estaEmXeque(cor)
    ) {
        return false;
    }

    const inimigo =
        cor === 'w'
            ? 'b'
            : 'w';

    let colunaTorre;
    let colunaDestino;
    let colunaPassagem;


    // =================================================
    // ROQUE PEQUENO
    // =================================================

    if (
        lado === 'pequeno'
    ) {

        colunaTorre = 7;
        colunaDestino = 6;
        colunaPassagem = 5;

    }


    // =================================================
    // ROQUE GRANDE
    // =================================================

    else {

        colunaTorre = 0;
        colunaDestino = 2;
        colunaPassagem = 3;
    }


    // =================================================
    // TORRE
    // =================================================

    const casaTorre =
        pegarCasa(
            linha,
            colunaTorre
        );

    if (!casaTorre) {
        return false;
    }

    const nomeTorre =
        obterPeca(casaTorre);

    if (
        nomeTorre !== cor + 'R'
    ) {
        return false;
    }

    const torre =
        obterElementoPeca(casaTorre);

    if (
        torre.dataset.moveu === 'true'
    ) {
        return false;
    }


    // =================================================
    // CASAS VAZIAS
    // =================================================

    if (
        lado === 'pequeno'
    ) {

        if (
            obterPeca(
                pegarCasa(linha, 5)
            ) ||
            obterPeca(
                pegarCasa(linha, 6)
            )
        ) {
            return false;
        }

    } else {

        if (
            obterPeca(
                pegarCasa(linha, 1)
            ) ||
            obterPeca(
                pegarCasa(linha, 2)
            ) ||
            obterPeca(
                pegarCasa(linha, 3)
            )
        ) {
            return false;
        }
    }


    // =================================================
    // CASAS ATACADAS
    // =================================================

    const casaPassagem =
        pegarCasa(
            linha,
            colunaPassagem
        );

    const destino =
        pegarCasa(
            linha,
            colunaDestino
        );

    if (
        casaAtacada(
            casaPassagem,
            inimigo
        )
    ) {
        return false;
    }

    if (
        casaAtacada(
            destino,
            inimigo
        )
    ) {
        return false;
    }

    return true;
}


// =====================================================
// MOVIMENTOS BRUTOS
// =====================================================

function obterMovimentosBrutos(casa) {

    const nomePeca =
        obterPeca(casa);

    if (!nomePeca) {
        return [];
    }

    const cor =
        corDaPeca(nomePeca);

    const tipo =
        tipoDaPeca(nomePeca);

    const {
        linha,
        coluna
    } = coordenadas(casa);

    const movimentos = [];


    function adicionar(l, c) {

        const destino =
            pegarCasa(l, c);

        if (!destino) {
            return;
        }

        const pecaDestino =
            obterPeca(destino);


        // Casa vazia.

        if (!pecaDestino) {

            movimentos.push(destino);

            return;
        }


        // Peça própria bloqueia.

        if (
            corDaPeca(pecaDestino) === cor
        ) {
            return;
        }


        // Nunca capturar rei.

        if (
            tipoDaPeca(pecaDestino) === 'K'
        ) {
            return;
        }

        movimentos.push(destino);
    }


    // =================================================
    // PEÃO
    // =================================================

    if (tipo === 'P') {

        const direcao =
            cor === 'w'
                ? -1
                : 1;

        const linhaInicial =
            cor === 'w'
                ? 6
                : 1;

        const frente =
            pegarCasa(
                linha + direcao,
                coluna
            );

        if (
            frente &&
            !obterPeca(frente)
        ) {

            movimentos.push(frente);

            if (
                linha === linhaInicial
            ) {

                const frenteDois =
                    pegarCasa(
                        linha + direcao * 2,
                        coluna
                    );

                if (
                    frenteDois &&
                    !obterPeca(frenteDois)
                ) {
                    movimentos.push(
                        frenteDois
                    );
                }
            }
        }


        // Capturas diagonais.

        for (
            const dc of [-1, 1]
        ) {

            const destino =
                pegarCasa(
                    linha + direcao,
                    coluna + dc
                );

            if (!destino) {
                continue;
            }

            const pecaDestino =
                obterPeca(destino);

            if (!pecaDestino) {
                continue;
            }

            if (
                corDaPeca(pecaDestino) === cor
            ) {
                continue;
            }

            if (
                tipoDaPeca(pecaDestino) === 'K'
            ) {
                continue;
            }

            movimentos.push(destino);
        }
    }


    // =================================================
    // CAVALO
    // =================================================

    if (tipo === 'N') {

        const movimentosCavalo = [

            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]

        ];

        movimentosCavalo.forEach(
            ([dl, dc]) => {

                adicionar(
                    linha + dl,
                    coluna + dc
                );

            }
        );
    }


    // =================================================
    // BISPO
    // =================================================

    if (tipo === 'B') {

        movimentosDeslizantes(

            linha,
            coluna,
            cor,

            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ],

            movimentos
        );
    }


    // =================================================
    // TORRE
    // =================================================

    if (tipo === 'R') {

        movimentosDeslizantes(

            linha,
            coluna,
            cor,

            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ],

            movimentos
        );
    }


    // =================================================
    // DAMA
    // =================================================

    if (tipo === 'Q') {

        movimentosDeslizantes(

            linha,
            coluna,
            cor,

            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1],
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ],

            movimentos
        );
    }


    // =================================================
    // REI
    // =================================================

    if (tipo === 'K') {

        for (
            let dl = -1;
            dl <= 1;
            dl++
        ) {

            for (
                let dc = -1;
                dc <= 1;
                dc++
            ) {

                if (
                    dl === 0 &&
                    dc === 0
                ) {
                    continue;
                }

                adicionar(
                    linha + dl,
                    coluna + dc
                );
            }
        }


        // Roque pequeno.

        if (
            podeFazerRoque(
                casa,
                cor,
                'pequeno'
            )
        ) {

            movimentos.push(
                pegarCasa(
                    linha,
                    coluna + 2
                )
            );
        }


        // Roque grande.

        if (
            podeFazerRoque(
                casa,
                cor,
                'grande'
            )
        ) {

            movimentos.push(
                pegarCasa(
                    linha,
                    coluna - 2
                )
            );
        }
    }

    return movimentos;
}


// =====================================================
// SIMULAR MOVIMENTO
// =====================================================

function simularMovimento(
    origem,
    destino
) {

    const pecaOrigem =
        obterElementoPeca(origem);

    if (!pecaOrigem) {
        return null;
    }

    const pecaDestino =
        obterElementoPeca(destino);

    const moveuAntes =
        pecaOrigem.dataset.moveu;

    const estado = {

        origem,
        destino,
        pecaOrigem,
        pecaDestino,
        moveuAntes

    };


    // Remove a peça capturada.

    if (pecaDestino) {
        pecaDestino.remove();
    }


    // Move temporariamente.

    destino.appendChild(
        pecaOrigem
    );

    return estado;
}


// =====================================================
// DESFAZER SIMULAÇÃO
// =====================================================

function desfazerMovimento(estado) {

    estado.origem.appendChild(
        estado.pecaOrigem
    );

    estado.pecaOrigem.dataset.moveu =
        estado.moveuAntes;

    if (
        estado.pecaDestino
    ) {

        estado.destino.appendChild(
            estado.pecaDestino
        );
    }
}


// =====================================================
// MOVIMENTOS LEGAIS
// =====================================================

function movimentosLegais(casa) {

    const nomePeca =
        obterPeca(casa);

    if (!nomePeca) {
        return [];
    }

    const cor =
        corDaPeca(nomePeca);

    const tipo =
        tipoDaPeca(nomePeca);

    const movimentosBrutos =
        obterMovimentosBrutos(casa);

    const movimentos = [];


    for (
        const destino of movimentosBrutos
    ) {

        const origemCoord =
            coordenadas(casa);

        const destinoCoord =
            coordenadas(destino);


        // =================================================
        // ROQUE
        // =================================================

        if (
            tipo === 'K' &&
            Math.abs(
                destinoCoord.coluna -
                origemCoord.coluna
            ) === 2
        ) {

            /*
             * O roque já foi completamente
             * validado por podeFazerRoque().
             */

            movimentos.push(destino);

            continue;
        }


        // =================================================
        // SIMULAR MOVIMENTO
        // =================================================

        const estado =
            simularMovimento(
                casa,
                destino
            );

        if (!estado) {
            continue;
        }


        // =================================================
        // VERIFICAR SE O PRÓPRIO REI
        // CONTINUA EM XEQUE
        // =================================================

        const reiAindaEmXeque =
            estaEmXeque(cor);


        // =================================================
        // DESFAZER MOVIMENTO
        // =================================================

        desfazerMovimento(
            estado
        );


        // =================================================
        // MOVIMENTO LEGAL
        // =================================================

        if (!reiAindaEmXeque) {

            movimentos.push(
                destino
            );
        }
    }

    return movimentos;
}


// =====================================================
// MOSTRAR MOVIMENTOS
// =====================================================

function mostrarMovimentos(casa) {

    const movimentos =
        movimentosLegais(casa);

    const nomePeca =
        obterPeca(casa);

    if (!nomePeca) {
        return;
    }

    const cor =
        corDaPeca(nomePeca);

    const colunaOrigem =
        coordenadas(casa).coluna;


    for (
        const destino of movimentos
    ) {

        const pecaDestino =
            obterPeca(destino);

        destino.classList.add(
            'movimento'
        );


        // =================================================
        // CAPTURA
        // =================================================

        if (
            pecaDestino &&
            corDaPeca(pecaDestino) !== cor
        ) {

            destino.classList.add(
                'captura'
            );
        }


        // =================================================
        // ROQUE
        // =================================================

        const colunaDestino =
            coordenadas(destino).coluna;

        if (
            tipoDaPeca(nomePeca) === 'K' &&
            Math.abs(
                colunaDestino -
                colunaOrigem
            ) === 2
        ) {

            destino.classList.add(
                'roque'
            );
        }
    }
}


// =====================================================
// EXISTEM MOVIMENTOS LEGAIS?
// =====================================================

function existemMovimentos(cor) {

    const casas =
        document.querySelectorAll('.casa');

    for (
        const casa of casas
    ) {

        const peca =
            obterPeca(casa);

        if (!peca) {
            continue;
        }

        if (
            corDaPeca(peca) !== cor
        ) {
            continue;
        }

        const movimentos =
            movimentosLegais(casa);

        if (
            movimentos.length > 0
        ) {
            return true;
        }
    }

    return false;
}


// =====================================================
// ATUALIZAR XEQUE
// =====================================================

function atualizarXeque() {

    document
        .querySelectorAll('.casa')
        .forEach(casa => {

            casa.classList.remove(
                'xeque'
            );

        });


    const reiBranco =
        encontrarRei('w');

    const reiPreto =
        encontrarRei('b');


    if (
        reiBranco &&
        estaEmXeque('w')
    ) {

        reiBranco.classList.add(
            'xeque'
        );
    }


    if (
        reiPreto &&
        estaEmXeque('b')
    ) {

        reiPreto.classList.add(
            'xeque'
        );
    }
}


// =====================================================
// VERIFICAR FIM DE JOGO
// =====================================================

function verificarFimDeJogo() {

    const emXeque =
        estaEmXeque(turno);

    const temMovimentos =
        existemMovimentos(turno);


    // =================================================
    // XEQUE-MATE
    // =================================================

    if (
        emXeque &&
        !temMovimentos
    ) {

        jogoEncerrado = true;

        const vencedor =
            turno === 'w'
                ? 'Pretas'
                : 'Brancas';

        atualizarXeque();

        alert(
            `Xeque-mate! ${vencedor} venceram.`
        );

        return;
    }


    // =================================================
    // AFOGAMENTO
    // =================================================

    if (
        !emXeque &&
        !temMovimentos
    ) {

        jogoEncerrado = true;

        alert(
            'Afogamento! Empate.'
        );

        return;
    }
}


// =====================================================
// MOVER PEÇA
// =====================================================

function moverPeca(
    origem,
    destino
) {

    const peca =
        obterElementoPeca(origem);

    if (!peca) {
        return false;
    }

    const pecaDestino =
        obterElementoPeca(destino);


    if (pecaDestino) {
        pecaDestino.remove();
    }


    destino.appendChild(
        peca
    );

    peca.dataset.moveu =
        'true';

    return true;
}


// =====================================================
// FAZER ROQUE
// =====================================================

function fazerRoque(
    rei,
    destino
) {

    const origemCoord =
        coordenadas(rei);

    const destinoCoord =
        coordenadas(destino);

    const diferenca =
        destinoCoord.coluna -
        origemCoord.coluna;


    // =================================================
    // ROQUE PEQUENO
    // =================================================

    if (
        diferenca === 2
    ) {

        const casaTorre =
            pegarCasa(
                origemCoord.linha,
                7
            );

        const destinoTorre =
            pegarCasa(
                origemCoord.linha,
                5
            );

        moverPeca(
            casaTorre,
            destinoTorre
        );
    }


    // =================================================
    // ROQUE GRANDE
    // =================================================

    else if (
        diferenca === -2
    ) {

        const casaTorre =
            pegarCasa(
                origemCoord.linha,
                0
            );

        const destinoTorre =
            pegarCasa(
                origemCoord.linha,
                3
            );

        moverPeca(
            casaTorre,
            destinoTorre
        );
    }


    // Move o rei.

    moverPeca(
        rei,
        destino
    );
}


// =====================================================
// CRIAR TABULEIRO
// =====================================================

for (
    let linha = 0;
    linha < 8;
    linha++
) {

    for (
        let coluna = 0;
        coluna < 8;
        coluna++
    ) {

        const casa =
            document.createElement('div');

        casa.classList.add(
            'casa'
        );


        // =================================================
        // COR DA CASA
        // =================================================

        if (
            (linha + coluna) % 2 === 0
        ) {

            casa.classList.add(
                'clara'
            );

        } else {

            casa.classList.add(
                'escura'
            );
        }


        let nomePeca = null;


        // =================================================
        // PRETAS
        // =================================================

        if (
            linha === 0
        ) {

            nomePeca =
                pecas.pretas[coluna];
        }


        // =================================================
        // PEÕES PRETOS
        // =================================================

        if (
            linha === 1
        ) {

            nomePeca = 'bP';
        }


        // =================================================
        // PEÕES BRANCOS
        // =================================================

        if (
            linha === 6
        ) {

            nomePeca = 'wP';
        }


        // =================================================
        // BRANCAS
        // =================================================

        if (
            linha === 7
        ) {

            nomePeca =
                pecas.brancas[coluna];
        }


        // =================================================
        // CRIAR IMAGEM
        // =================================================

        if (nomePeca) {

            const imagem =
                document.createElement('img');

            imagem.src =
                `${baseUrl}img/pecas/${nomePeca}.svg`;

            imagem.classList.add(
                'peca'
            );

            imagem.dataset.moveu =
                'false';

            casa.appendChild(
                imagem
            );
        }


        // =================================================
        // CLIQUE
        // =================================================

        casa.addEventListener(
            'click',
            () => {

                if (
                    jogoEncerrado
                ) {
                    return;
                }


                // =================================================
                // PRIMEIRO CLIQUE
                // =================================================

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

                    if (
                        cor !== turno
                    ) {
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


                // =================================================
                // MESMA CASA
                // =================================================

                if (
                    casa === casaSelecionada
                ) {

                    limparSelecao();

                    return;
                }


                // =================================================
                // OUTRA PEÇA DO MESMO JOGADOR
                // =================================================

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


                // =================================================
                // MOVIMENTOS PERMITIDOS
                // =================================================

                const movimentosPermitidos =
                    movimentosLegais(
                        casaSelecionada
                    );

                if (
                    !movimentosPermitidos.includes(
                        casa
                    )
                ) {

                    return;
                }


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


                // =================================================
                // ROQUE
                // =================================================

                if (
                    casa.classList.contains(
                        'roque'
                    )
                ) {

                    fazerRoque(
                        origem,
                        casa
                    );

                } else {

                    // =================================================
                    // MOVIMENTO NORMAL
                    // =================================================

                    moverPeca(
                        origem,
                        casa
                    );
                }


                // =================================================
                // TROCAR TURNO
                // =================================================

                turno =
                    turno === 'w'
                        ? 'b'
                        : 'w';


                // =================================================
                // ATUALIZAR XEQUE
                // =================================================

                atualizarXeque();


                // =================================================
                // VERIFICAR FIM DE JOGO
                // =================================================

                verificarFimDeJogo();


                // =================================================
                // LIMPAR SELEÇÃO
                // =================================================

                limparSelecao();
            }
        );


        tabuleiro.appendChild(
            casa
        );
    }
}


// =====================================================
// VERIFICAÇÃO INICIAL
// =====================================================

atualizarXeque();