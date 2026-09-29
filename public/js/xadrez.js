const tabuleiro = document.getElementById('tabuleiro');

const promocaoOverlay =
    document.getElementById('promocao');

const opcoesPromocao =
    document.getElementById('opcoesPromocao');


const pecas = {

    pretas: [
        'bR',
        'bN',
        'bB',
        'bQ',
        'bK',
        'bB',
        'bN',
        'bR'
    ],

    brancas: [
        'wR',
        'wN',
        'wB',
        'wQ',
        'wK',
        'wB',
        'wN',
        'wR'
    ]

};


let casaSelecionada = null;

let turno = 'w';

let jogoEncerrado = false;

let promocaoPendente = null;


// =====================================================
// UTILITÁRIOS
// =====================================================

function limparSelecao() {

    document
        .querySelectorAll('.casa')
        .forEach(casa => {

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

    const imagem =
        casa.querySelector('.peca');

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

    const casas =
        [...document.querySelectorAll('.casa')];

    const indice =
        casas.indexOf(casa);

    return {

        linha:
            Math.floor(indice / 8),

        coluna:
            indice % 8
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

    const casas =
        document.querySelectorAll('.casa');

    return casas[
        linha * 8 + coluna
    ];
}


// =====================================================
// CAMINHO LIVRE
// =====================================================

function caminhoLivre(origem, destino) {

    const origemCoord =
        coordenadas(origem);

    const destinoCoord =
        coordenadas(destino);

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

        const casa =
            pegarCasa(linha, coluna);

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

        let novaLinha =
            linha + dl;

        let novaColuna =
            coluna + dc;

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
// CASA ATACADA
// =====================================================

function casaAtacada(
    casa,
    corAtacante
) {

    if (!casa) {
        return false;
    }

    const casas =
        document.querySelectorAll('.casa');

    for (const origem of casas) {

        const peca =
            obterPeca(origem);

        if (!peca) {
            continue;
        }

        if (
            corDaPeca(peca) !== corAtacante
        ) {
            continue;
        }

        const tipo =
            tipoDaPeca(peca);

        const origemCoord =
            coordenadas(origem);

        const destinoCoord =
            coordenadas(casa);

        const dl =
            destinoCoord.linha -
            origemCoord.linha;

        const dc =
            destinoCoord.coluna -
            origemCoord.coluna;


        // PEÃO

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


        // CAVALO

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


        // REI

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


        // TORRE

        if (tipo === 'R') {

            if (
                (
                    dl === 0 ||
                    dc === 0
                ) &&
                (
                    dl !== 0 ||
                    dc !== 0
                )
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


        // BISPO

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


        // DAMA

        if (tipo === 'Q') {

            const movimentoReto =
                dl === 0 ||
                dc === 0;

            const movimentoDiagonal =
                Math.abs(dl) === Math.abs(dc);


            if (
                movimentoReto &&
                (
                    dl !== 0 ||
                    dc !== 0
                )
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
// REI EM XEQUE
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
// ROQUE
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

    if (estaEmXeque(cor)) {
        return false;
    }

    const inimigo =
        cor === 'w'
            ? 'b'
            : 'w';

    let colunaTorre;
    let colunaDestino;
    let colunaPassagem;


    if (
        lado === 'pequeno'
    ) {

        colunaTorre = 7;
        colunaDestino = 6;
        colunaPassagem = 5;

    } else {

        colunaTorre = 0;
        colunaDestino = 2;
        colunaPassagem = 3;
    }


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

        if (!pecaDestino) {

            movimentos.push(destino);
            return;
        }

        if (
            corDaPeca(pecaDestino) === cor
        ) {
            return;
        }

        if (
            tipoDaPeca(pecaDestino) === 'K'
        ) {
            return;
        }

        movimentos.push(destino);
    }


    // PEÃO

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


    // CAVALO

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


    // BISPO

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


    // TORRE

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


    // DAMA

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


    // REI

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


    if (pecaDestino) {
        pecaDestino.remove();
    }

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


        if (
            tipo === 'K' &&
            Math.abs(
                destinoCoord.coluna -
                origemCoord.coluna
            ) === 2
        ) {

            movimentos.push(destino);
            continue;
        }


        const estado =
            simularMovimento(
                casa,
                destino
            );

        if (!estado) {
            continue;
        }


        const reiAindaEmXeque =
            estaEmXeque(cor);


        desfazerMovimento(
            estado
        );


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


        if (
            pecaDestino &&
            corDaPeca(pecaDestino) !== cor
        ) {

            destino.classList.add(
                'captura'
            );
        }


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
// EXISTEM MOVIMENTOS
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
// FIM DE JOGO
// =====================================================

function verificarFimDeJogo() {

    const emXeque =
        estaEmXeque(turno);

    const temMovimentos =
        existemMovimentos(turno);


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
// ABRIR PROMOÇÃO
// =====================================================

function abrirPromocao(casa) {

    const nomePeca =
        obterPeca(casa);

    if (!nomePeca) {
        return;
    }

    if (
        tipoDaPeca(nomePeca) !== 'P'
    ) {
        return;
    }

    const cor =
        corDaPeca(nomePeca);

    const { linha } =
        coordenadas(casa);


    if (
        cor === 'w' &&
        linha !== 0
    ) {
        return;
    }

    if (
        cor === 'b' &&
        linha !== 7
    ) {
        return;
    }


    promocaoPendente = casa;

    opcoesPromocao.innerHTML = '';


    const opcoes = [
        {
            tipo: 'Q',
            nome: 'Dama'
        },
        {
            tipo: 'R',
            nome: 'Torre'
        },
        {
            tipo: 'B',
            nome: 'Bispo'
        },
        {
            tipo: 'N',
            nome: 'Cavalo'
        }
    ];


    opcoes.forEach(opcao => {

        const botao =
            document.createElement('button');

        botao.classList.add(
            'opcao-promocao'
        );

        botao.type = 'button';

        botao.title =
            opcao.nome;


        const imagem =
            document.createElement('img');

        imagem.src =
            `${baseUrl}img/pecas/${cor}${opcao.tipo}.svg`;

        imagem.alt =
            opcao.nome;


        botao.appendChild(
            imagem
        );


        botao.addEventListener(
            'click',
            () => {

                escolherPromocao(
                    opcao.tipo
                );

            }
        );


        opcoesPromocao.appendChild(
            botao
        );
    });


    promocaoOverlay.classList.add(
        'ativa'
    );
}


// =====================================================
// ESCOLHER PROMOÇÃO
// =====================================================

function escolherPromocao(tipo) {

    if (!promocaoPendente) {
        return;
    }

    const casa =
        promocaoPendente;

    const peca =
        obterElementoPeca(casa);

    if (!peca) {
        fecharPromocao();
        return;
    }

    const nomeAtual =
        obterPeca(casa);

    const cor =
        corDaPeca(nomeAtual);

    const novaPeca =
        `${cor}${tipo}`;


    peca.src =
        `${baseUrl}img/pecas/${novaPeca}.svg`;

    peca.dataset.moveu =
        'true';


    fecharPromocao();


    // Agora que a promoção terminou,
    // atualizamos o estado do jogo.

    turno =
        turno === 'w'
            ? 'b'
            : 'w';

    atualizarXeque();

    verificarFimDeJogo();

    limparSelecao();
}


// =====================================================
// FECHAR PROMOÇÃO
// =====================================================

function fecharPromocao() {

    promocaoOverlay.classList.remove(
        'ativa'
    );

    opcoesPromocao.innerHTML = '';

    promocaoPendente = null;
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


    const nomePeca =
        obterPeca(destino);


    // =================================================
    // PROMOÇÃO
    // =================================================

    if (
        tipoDaPeca(nomePeca) === 'P'
    ) {

        const cor =
            corDaPeca(nomePeca);

        const { linha } =
            coordenadas(destino);

        const chegouNoFim =
            (
                cor === 'w' &&
                linha === 0
            ) ||
            (
                cor === 'b' &&
                linha === 7
            );


        if (chegouNoFim) {

            abrirPromocao(destino);

            return 'promocao';
        }
    }

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


        // COR DA CASA

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


        // PRETAS

        if (
            linha === 0
        ) {

            nomePeca =
                pecas.pretas[coluna];
        }


        // PEÕES PRETOS

        if (
            linha === 1
        ) {

            nomePeca = 'bP';
        }


        // PEÕES BRANCOS

        if (
            linha === 6
        ) {

            nomePeca = 'wP';
        }


        // BRANCAS

        if (
            linha === 7
        ) {

            nomePeca =
                pecas.brancas[coluna];
        }


        // CRIAR IMAGEM

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


        // CLIQUE

        casa.addEventListener(
            'click',
            () => {

                if (
                    jogoEncerrado
                ) {
                    return;
                }


                // Não deixa mexer enquanto
                // a promoção está aberta.

                if (
                    promocaoPendente
                ) {
                    return;
                }


                // PRIMEIRO CLIQUE

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


                // MESMA CASA

                if (
                    casa === casaSelecionada
                ) {

                    limparSelecao();
                    return;
                }


                // OUTRA PEÇA DO MESMO JOGADOR

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


                // MOVIMENTOS PERMITIDOS

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


                // ROQUE

                if (
                    casa.classList.contains(
                        'roque'
                    )
                ) {

                    fazerRoque(
                        origem,
                        casa
                    );

                    turno =
                        turno === 'w'
                            ? 'b'
                            : 'w';

                    atualizarXeque();

                    verificarFimDeJogo();

                    limparSelecao();

                    return;
                }


                // MOVIMENTO NORMAL

                const resultado =
                    moverPeca(
                        origem,
                        casa
                    );


                // Promoção:
                // NÃO troca o turno ainda.
                //
                // O turno só muda quando o jogador
                // escolher a peça.

                if (
                    resultado === 'promocao'
                ) {

                    limparSelecao();

                    return;
                }


                // TROCAR TURNO

                turno =
                    turno === 'w'
                        ? 'b'
                        : 'w';


                atualizarXeque();

                verificarFimDeJogo();

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