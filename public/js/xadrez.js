const tabuleiro = document.getElementById('tabuleiro');

const promocaoOverlay = document.getElementById('promocao');
const opcoesPromocao = document.getElementById('opcoesPromocao');

const pecas = {
    pretas: [
        'bR', 'bN', 'bB', 'bQ',
        'bK', 'bB', 'bN', 'bR'
    ],

    brancas: [
        'wR', 'wN', 'wB', 'wQ',
        'wK', 'wB', 'wN', 'wR'
    ]
};

let casaSelecionada = null;
let turno = 'w';
let jogoEncerrado = false;
let promocaoPendente = null;

/*
|--------------------------------------------------------------------------
| ÚLTIMO MOVIMENTO
|--------------------------------------------------------------------------
*/

let ultimoMovimento = null;


/*
|--------------------------------------------------------------------------
| LIMPAR SELEÇÃO
|--------------------------------------------------------------------------
*/

function limparSelecao() {

    document.querySelectorAll('.casa').forEach(casa => {

        casa.classList.remove('selecionada');
        casa.classList.remove('movimento');
        casa.classList.remove('captura');

    });

    casaSelecionada = null;
}


/*
|--------------------------------------------------------------------------
| OBTER PEÇA
|--------------------------------------------------------------------------
*/

function obterPeca(linha, coluna) {

    const casa = pegarCasa(linha, coluna);

    if (!casa) {
        return null;
    }

    const peca = casa.querySelector('.peca');

    if (!peca) {
        return null;
    }

    return peca.dataset.peca;
}


/*
|--------------------------------------------------------------------------
| OBTER ELEMENTO DA PEÇA
|--------------------------------------------------------------------------
*/

function obterElementoPeca(linha, coluna) {

    const casa = pegarCasa(linha, coluna);

    if (!casa) {
        return null;
    }

    return casa.querySelector('.peca');
}


/*
|--------------------------------------------------------------------------
| COR DA PEÇA
|--------------------------------------------------------------------------
*/

function corDaPeca(peca) {

    if (!peca) {
        return null;
    }

    return peca[0] === 'w' ? 'w' : 'b';
}


/*
|--------------------------------------------------------------------------
| TIPO DA PEÇA
|--------------------------------------------------------------------------
*/

function tipoDaPeca(peca) {

    if (!peca) {
        return null;
    }

    return peca[1];
}


/*
|--------------------------------------------------------------------------
| COORDENADAS
|--------------------------------------------------------------------------
*/

function coordenadas(casa) {

    return {
        linha: parseInt(casa.dataset.linha),
        coluna: parseInt(casa.dataset.coluna)
    };
}


/*
|--------------------------------------------------------------------------
| PEGAR CASA
|--------------------------------------------------------------------------
*/

function pegarCasa(linha, coluna) {

    if (
        linha < 0 ||
        linha > 7 ||
        coluna < 0 ||
        coluna > 7
    ) {
        return null;
    }

    return document.querySelector(
        `.casa[data-linha="${linha}"][data-coluna="${coluna}"]`
    );
}


/*
|--------------------------------------------------------------------------
| CAMINHO LIVRE
|--------------------------------------------------------------------------
*/

function caminhoLivre(
    linhaOrigem,
    colunaOrigem,
    linhaDestino,
    colunaDestino
) {

    const passoLinha =
        Math.sign(linhaDestino - linhaOrigem);

    const passoColuna =
        Math.sign(colunaDestino - colunaOrigem);

    let linha = linhaOrigem + passoLinha;
    let coluna = colunaOrigem + passoColuna;

    while (
        linha !== linhaDestino ||
        coluna !== colunaDestino
    ) {

        if (obterPeca(linha, coluna)) {
            return false;
        }

        linha += passoLinha;
        coluna += passoColuna;
    }

    return true;
}


/*
|--------------------------------------------------------------------------
| MOVIMENTOS DESLIZANTES
|--------------------------------------------------------------------------
*/

function movimentosDeslizantes(
    linha,
    coluna,
    direcoes,
    cor
) {

    const movimentos = [];

    for (const [dl, dc] of direcoes) {

        let novaLinha = linha + dl;
        let novaColuna = coluna + dc;

        while (
            novaLinha >= 0 &&
            novaLinha <= 7 &&
            novaColuna >= 0 &&
            novaColuna <= 7
        ) {

            const pecaDestino =
                obterPeca(novaLinha, novaColuna);

            if (!pecaDestino) {

                movimentos.push([
                    novaLinha,
                    novaColuna
                ]);

            } else {

                if (
                    corDaPeca(pecaDestino) !== cor &&
                    tipoDaPeca(pecaDestino) !== 'K'
                ) {

                    movimentos.push([
                        novaLinha,
                        novaColuna
                    ]);
                }

                break;
            }

            novaLinha += dl;
            novaColuna += dc;
        }
    }

    return movimentos;
}


/*
|--------------------------------------------------------------------------
| CASA ATACADA
|--------------------------------------------------------------------------
*/

function casaAtacada(
    linhaAlvo,
    colunaAlvo,
    corAtacante
) {

    for (let linha = 0; linha < 8; linha++) {

        for (let coluna = 0; coluna < 8; coluna++) {

            const peca = obterPeca(linha, coluna);

            if (!peca) {
                continue;
            }

            if (corDaPeca(peca) !== corAtacante) {
                continue;
            }

            const tipo = tipoDaPeca(peca);

            /*
            | PEÃO
            */

            if (tipo === 'P') {

                const direcao =
                    corAtacante === 'w' ? -1 : 1;

                if (
                    linha + direcao === linhaAlvo &&
                    (
                        coluna - 1 === colunaAlvo ||
                        coluna + 1 === colunaAlvo
                    )
                ) {
                    return true;
                }

                continue;
            }


            /*
            | CAVALO
            */

            if (tipo === 'N') {

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

                for (const [dl, dc] of movimentos) {

                    if (
                        linha + dl === linhaAlvo &&
                        coluna + dc === colunaAlvo
                    ) {
                        return true;
                    }
                }

                continue;
            }


            /*
            | REI
            */

            if (tipo === 'K') {

                if (
                    Math.abs(linha - linhaAlvo) <= 1 &&
                    Math.abs(coluna - colunaAlvo) <= 1
                ) {
                    return true;
                }

                continue;
            }


            /*
            | TORRE / BISPO / RAINHA
            */

            let direcoes = [];

            if (tipo === 'R') {

                direcoes = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ];

            } else if (tipo === 'B') {

                direcoes = [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ];

            } else if (tipo === 'Q') {

                direcoes = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1],
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ];
            }

            for (const [dl, dc] of direcoes) {

                let novaLinha = linha + dl;
                let novaColuna = coluna + dc;

                while (
                    novaLinha >= 0 &&
                    novaLinha <= 7 &&
                    novaColuna >= 0 &&
                    novaColuna <= 7
                ) {

                    if (
                        novaLinha === linhaAlvo &&
                        novaColuna === colunaAlvo
                    ) {
                        return true;
                    }

                    if (
                        obterPeca(novaLinha, novaColuna)
                    ) {
                        break;
                    }

                    novaLinha += dl;
                    novaColuna += dc;
                }
            }
        }
    }

    return false;
}


/*
|--------------------------------------------------------------------------
| ENCONTRAR REI
|--------------------------------------------------------------------------
*/

function encontrarRei(cor) {

    for (let linha = 0; linha < 8; linha++) {

        for (let coluna = 0; coluna < 8; coluna++) {

            const peca = obterPeca(linha, coluna);

            if (
                peca &&
                corDaPeca(peca) === cor &&
                tipoDaPeca(peca) === 'K'
            ) {

                return {
                    linha,
                    coluna
                };
            }
        }
    }

    return null;
}


/*
|--------------------------------------------------------------------------
| ESTÁ EM XEQUE
|--------------------------------------------------------------------------
*/

function estaEmXeque(cor) {

    const rei = encontrarRei(cor);

    if (!rei) {
        return false;
    }

    const adversario =
        cor === 'w' ? 'b' : 'w';

    return casaAtacada(
        rei.linha,
        rei.coluna,
        adversario
    );
}


/*
|--------------------------------------------------------------------------
| ROQUE
|--------------------------------------------------------------------------
*/

function podeFazerRoque(
    linha,
    coluna,
    destinoColuna
) {

    const rei =
        obterElementoPeca(linha, coluna);

    if (!rei) {
        return false;
    }

    if (rei.dataset.movido === 'true') {
        return false;
    }

    const cor =
        corDaPeca(rei.dataset.peca);

    if (estaEmXeque(cor)) {
        return false;
    }

    const ladoRei =
        destinoColuna > coluna;

    const colunaTorre =
        ladoRei ? 7 : 0;

    const torre =
        obterElementoPeca(
            linha,
            colunaTorre
        );

    if (!torre) {
        return false;
    }

    if (torre.dataset.movido === 'true') {
        return false;
    }

    const inicio =
        Math.min(coluna, colunaTorre);

    const fim =
        Math.max(coluna, colunaTorre);

    for (
        let c = inicio + 1;
        c < fim;
        c++
    ) {

        if (obterPeca(linha, c)) {
            return false;
        }
    }

    const passo =
        ladoRei ? 1 : -1;

    const casaPassagem =
        coluna + passo;

    const adversario =
        cor === 'w' ? 'b' : 'w';

    if (
        casaAtacada(
            linha,
            casaPassagem,
            adversario
        )
    ) {
        return false;
    }

    if (
        casaAtacada(
            linha,
            destinoColuna,
            adversario
        )
    ) {
        return false;
    }

    return true;
}


/*
|--------------------------------------------------------------------------
| MOVIMENTOS BRUTOS
|--------------------------------------------------------------------------
*/

function obterMovimentosBrutos(
    linha,
    coluna
) {

    const peca = obterPeca(linha, coluna);

    if (!peca) {
        return [];
    }

    const cor = corDaPeca(peca);
    const tipo = tipoDaPeca(peca);

    const movimentos = [];


    /*
    |--------------------------------------------------------------------------
    | PEÃO
    |--------------------------------------------------------------------------
    */

    if (tipo === 'P') {

        const direcao =
            cor === 'w' ? -1 : 1;

        const linhaInicial =
            cor === 'w' ? 6 : 1;

        const proximaLinha =
            linha + direcao;


        /*
        | UMA CASA
        */

        if (
            proximaLinha >= 0 &&
            proximaLinha <= 7 &&
            !obterPeca(proximaLinha, coluna)
        ) {

            movimentos.push([
                proximaLinha,
                coluna
            ]);


            /*
            | DUAS CASAS
            */

            const segundaLinha =
                linha + direcao * 2;

            if (
                linha === linhaInicial &&
                !obterPeca(segundaLinha, coluna)
            ) {

                movimentos.push([
                    segundaLinha,
                    coluna
                ]);
            }
        }


        /*
        | CAPTURA NORMAL
        */

        for (const dc of [-1, 1]) {

            const novaColuna =
                coluna + dc;

            if (
                novaColuna < 0 ||
                novaColuna > 7 ||
                proximaLinha < 0 ||
                proximaLinha > 7
            ) {
                continue;
            }

            const pecaDestino =
                obterPeca(
                    proximaLinha,
                    novaColuna
                );

            if (
                pecaDestino &&
                corDaPeca(pecaDestino) !== cor &&
                tipoDaPeca(pecaDestino) !== 'K'
            ) {

                movimentos.push([
                    proximaLinha,
                    novaColuna
                ]);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | EN PASSANT
        |--------------------------------------------------------------------------
        */

        if (ultimoMovimento) {

            const origemUltimo =
                ultimoMovimento.origem;

            const destinoUltimo =
                ultimoMovimento.destino;

            const pecaUltimo =
                ultimoMovimento.peca;

            if (
                pecaUltimo &&
                tipoDaPeca(pecaUltimo) === 'P' &&
                corDaPeca(pecaUltimo) !== cor &&
                Math.abs(
                    destinoUltimo.linha -
                    origemUltimo.linha
                ) === 2 &&
                destinoUltimo.linha === linha &&
                Math.abs(
                    destinoUltimo.coluna -
                    coluna
                ) === 1
            ) {

                const casaDestinoEnPassant =
                    pegarCasa(
                        linha + direcao,
                        destinoUltimo.coluna
                    );

                if (
                    casaDestinoEnPassant &&
                    !obterPeca(
                        linha + direcao,
                        destinoUltimo.coluna
                    )
                ) {

                    movimentos.push([
                        linha + direcao,
                        destinoUltimo.coluna
                    ]);
                }
            }
        }

        return movimentos;
    }


    /*
    |--------------------------------------------------------------------------
    | CAVALO
    |--------------------------------------------------------------------------
    */

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

        for (const [dl, dc] of movimentosCavalo) {

            const novaLinha = linha + dl;
            const novaColuna = coluna + dc;

            if (
                novaLinha < 0 ||
                novaLinha > 7 ||
                novaColuna < 0 ||
                novaColuna > 7
            ) {
                continue;
            }

            const destino =
                obterPeca(
                    novaLinha,
                    novaColuna
                );

            if (
                !destino ||
                (
                    corDaPeca(destino) !== cor &&
                    tipoDaPeca(destino) !== 'K'
                )
            ) {

                movimentos.push([
                    novaLinha,
                    novaColuna
                ]);
            }
        }

        return movimentos;
    }


    /*
    |--------------------------------------------------------------------------
    | BISPO
    |--------------------------------------------------------------------------
    */

    if (tipo === 'B') {

        return movimentosDeslizantes(
            linha,
            coluna,
            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ],
            cor
        );
    }


    /*
    |--------------------------------------------------------------------------
    | TORRE
    |--------------------------------------------------------------------------
    */

    if (tipo === 'R') {

        return movimentosDeslizantes(
            linha,
            coluna,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ],
            cor
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RAINHA
    |--------------------------------------------------------------------------
    */

    if (tipo === 'Q') {

        return movimentosDeslizantes(
            linha,
            coluna,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ],
            cor
        );
    }


    /*
    |--------------------------------------------------------------------------
    | REI
    |--------------------------------------------------------------------------
    */

    if (tipo === 'K') {

        const movimentosRei = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1]
        ];

        for (const [dl, dc] of movimentosRei) {

            const novaLinha = linha + dl;
            const novaColuna = coluna + dc;

            if (
                novaLinha < 0 ||
                novaLinha > 7 ||
                novaColuna < 0 ||
                novaColuna > 7
            ) {
                continue;
            }

            const destino =
                obterPeca(
                    novaLinha,
                    novaColuna
                );

            if (
                !destino ||
                (
                    corDaPeca(destino) !== cor &&
                    tipoDaPeca(destino) !== 'K'
                )
            ) {

                movimentos.push([
                    novaLinha,
                    novaColuna
                ]);
            }
        }


        /*
        | ROQUE
        */

        if (
            podeFazerRoque(
                linha,
                coluna,
                coluna + 2
            )
        ) {

            movimentos.push([
                linha,
                coluna + 2
            ]);
        }

        if (
            podeFazerRoque(
                linha,
                coluna,
                coluna - 2
            )
        ) {

            movimentos.push([
                linha,
                coluna - 2
            ]);
        }

        return movimentos;
    }

    return movimentos;
}


/*
|--------------------------------------------------------------------------
| SIMULAR MOVIMENTO
|--------------------------------------------------------------------------
*/

function simularMovimento(
    origem,
    destino
) {

    const pecaOrigem =
        obterElementoPeca(
            origem.linha,
            origem.coluna
        );

    const casaOrigem =
        pegarCasa(
            origem.linha,
            origem.coluna
        );

    const casaDestino =
        pegarCasa(
            destino.linha,
            destino.coluna
        );

    if (
        !pecaOrigem ||
        !casaOrigem ||
        !casaDestino
    ) {
        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | PEÇA CAPTURADA NORMALMENTE
    |--------------------------------------------------------------------------
    */

    const pecaCapturada =
        casaDestino.querySelector('.peca');


    /*
    |--------------------------------------------------------------------------
    | EN PASSANT NA SIMULAÇÃO
    |--------------------------------------------------------------------------
    */

    let pecaCapturadaEnPassant = null;
    let casaCapturadaEnPassant = null;


    if (
        tipoDaPeca(pecaOrigem.dataset.peca) === 'P' &&
        origem.coluna !== destino.coluna &&
        !pecaCapturada
    ) {

        casaCapturadaEnPassant =
            pegarCasa(
                origem.linha,
                destino.coluna
            );

        if (casaCapturadaEnPassant) {

            const possivelPeao =
                casaCapturadaEnPassant.querySelector('.peca');

            if (
                possivelPeao &&
                tipoDaPeca(
                    possivelPeao.dataset.peca
                ) === 'P'
            ) {

                pecaCapturadaEnPassant =
                    possivelPeao;

                casaCapturadaEnPassant.removeChild(
                    pecaCapturadaEnPassant
                );
            }
        }
    }


    /*
    |--------------------------------------------------------------------------
    | REMOVER CAPTURA NORMAL
    |--------------------------------------------------------------------------
    */

    if (pecaCapturada) {

        casaDestino.removeChild(
            pecaCapturada
        );
    }


    /*
    |--------------------------------------------------------------------------
    | MOVER
    |--------------------------------------------------------------------------
    */

    casaDestino.appendChild(
        pecaOrigem
    );


    return {
        pecaOrigem,
        pecaCapturada,
        casaOrigem,
        casaDestino,
        pecaCapturadaEnPassant,
        casaCapturadaEnPassant
    };
}


/*
|--------------------------------------------------------------------------
| DESFAZER SIMULAÇÃO
|--------------------------------------------------------------------------
*/

function desfazerMovimento(simulacao) {

    if (!simulacao) {
        return;
    }

    const {
        pecaOrigem,
        pecaCapturada,
        casaOrigem,
        casaDestino,
        pecaCapturadaEnPassant,
        casaCapturadaEnPassant
    } = simulacao;


    /*
    | Voltar peça para origem
    */

    casaOrigem.appendChild(
        pecaOrigem
    );


    /*
    | Restaurar captura normal
    */

    if (pecaCapturada) {

        casaDestino.appendChild(
            pecaCapturada
        );
    }


    /*
    | Restaurar captura en passant
    */

    if (
        pecaCapturadaEnPassant &&
        casaCapturadaEnPassant
    ) {

        casaCapturadaEnPassant.appendChild(
            pecaCapturadaEnPassant
        );
    }
}


/*
|--------------------------------------------------------------------------
| MOVIMENTOS LEGAIS
|--------------------------------------------------------------------------
*/

function movimentosLegais(
    linha,
    coluna
) {

    const peca =
        obterPeca(linha, coluna);

    if (!peca) {
        return [];
    }

    const cor =
        corDaPeca(peca);

    const movimentosBrutos =
        obterMovimentosBrutos(
            linha,
            coluna
        );

    const movimentosLegais = [];

    for (const [destinoLinha, destinoColuna] of movimentosBrutos) {

        /*
        | ROQUE
        */

        if (
            tipoDaPeca(peca) === 'K' &&
            Math.abs(
                destinoColuna - coluna
            ) === 2
        ) {

            movimentosLegais.push([
                destinoLinha,
                destinoColuna
            ]);

            continue;
        }


        const simulacao =
            simularMovimento(
                {
                    linha,
                    coluna
                },
                {
                    linha: destinoLinha,
                    coluna: destinoColuna
                }
            );

        if (!simulacao) {
            continue;
        }

        const emXeque =
            estaEmXeque(cor);

        desfazerMovimento(simulacao);

        if (!emXeque) {

            movimentosLegais.push([
                destinoLinha,
                destinoColuna
            ]);
        }
    }

    return movimentosLegais;
}


/*
|--------------------------------------------------------------------------
| MOSTRAR MOVIMENTOS
|--------------------------------------------------------------------------
*/

function mostrarMovimentos(
    linha,
    coluna
) {

    const movimentos =
        movimentosLegais(
            linha,
            coluna
        );

    const casaOrigem =
        pegarCasa(
            linha,
            coluna
        );

    if (!casaOrigem) {
        return;
    }

    casaOrigem.classList.add(
        'selecionada'
    );

    for (const [l, c] of movimentos) {

        const casa =
            pegarCasa(l, c);

        if (!casa) {
            continue;
        }

        casa.classList.add(
            'movimento'
        );

        /*
        | Captura normal
        */

        if (obterPeca(l, c)) {

            casa.classList.add(
                'captura'
            );
        }


        /*
        | Captura en passant
        */

        const pecaOrigem =
            obterPeca(linha, coluna);

        if (
            tipoDaPeca(pecaOrigem) === 'P' &&
            coluna !== c &&
            !obterPeca(l, c)
        ) {

            casa.classList.add(
                'captura'
            );
        }
    }
}


/*
|--------------------------------------------------------------------------
| EXISTEM MOVIMENTOS
|--------------------------------------------------------------------------
*/

function existemMovimentos(cor) {

    for (let linha = 0; linha < 8; linha++) {

        for (let coluna = 0; coluna < 8; coluna++) {

            const peca =
                obterPeca(linha, coluna);

            if (!peca) {
                continue;
            }

            if (corDaPeca(peca) !== cor) {
                continue;
            }

            if (
                movimentosLegais(
                    linha,
                    coluna
                ).length > 0
            ) {

                return true;
            }
        }
    }

    return false;
}


/*
|--------------------------------------------------------------------------
| ATUALIZAR XEQUE
|--------------------------------------------------------------------------
*/

function atualizarXeque() {

    document
        .querySelectorAll('.casa')
        .forEach(casa => {

            casa.classList.remove(
                'xeque'
            );

        });

    for (const cor of ['w', 'b']) {

        if (estaEmXeque(cor)) {

            const rei =
                encontrarRei(cor);

            if (rei) {

                const casaRei =
                    pegarCasa(
                        rei.linha,
                        rei.coluna
                    );

                if (casaRei) {

                    casaRei.classList.add(
                        'xeque'
                    );
                }
            }
        }
    }
}


/*
|--------------------------------------------------------------------------
| VERIFICAR FIM DE JOGO
|--------------------------------------------------------------------------
*/

function verificarFimDeJogo() {

    if (existemMovimentos(turno)) {
        return;
    }

    jogoEncerrado = true;

    if (estaEmXeque(turno)) {

        const vencedor =
            turno === 'w'
                ? 'Pretas'
                : 'Brancas';

        alert(
            `Xeque-mate! ${vencedor} venceu.`
        );

    } else {

        alert(
            'Empate por afogamento!'
        );
    }
}


/*
|--------------------------------------------------------------------------
| PROMOÇÃO
|--------------------------------------------------------------------------
*/

function abrirPromocao(casa) {

    const peca =
        casa.querySelector('.peca');

    if (!peca) {
        return;
    }

    const tipo =
        tipoDaPeca(peca.dataset.peca);

    if (tipo !== 'P') {
        return;
    }

    const { linha } =
        coordenadas(casa);

    if (
        linha !== 0 &&
        linha !== 7
    ) {
        return;
    }

    promocaoPendente = casa;

    opcoesPromocao.innerHTML = '';

    const cor =
        corDaPeca(peca.dataset.peca);

    const opcoes = [
        'Q',
        'R',
        'B',
        'N'
    ];

    for (const tipoPromocao of opcoes) {

        const botao =
            document.createElement('button');

        botao.className =
            'opcao-promocao';

        const imagem =
            document.createElement('img');

        const nomePeca =
            cor + tipoPromocao;

        imagem.src =
            `${baseUrl}img/pecas/${nomePeca}.svg`;

        imagem.alt =
            nomePeca;

        botao.appendChild(imagem);

        botao.addEventListener(
            'click',
            () => {
                escolherPromocao(
                    tipoPromocao
                );
            }
        );

        opcoesPromocao.appendChild(
            botao
        );
    }

    promocaoOverlay.classList.add(
        'ativa'
    );
}


/*
|--------------------------------------------------------------------------
| ESCOLHER PROMOÇÃO
|--------------------------------------------------------------------------
*/

function escolherPromocao(tipo) {

    if (!promocaoPendente) {
        return;
    }

    const casa =
        promocaoPendente;

    const peca =
        casa.querySelector('.peca');

    if (!peca) {

        fecharPromocao();

        return;
    }

    const cor =
        corDaPeca(peca.dataset.peca);

    const nomePeca =
        cor + tipo;

    peca.dataset.peca =
        nomePeca;

    peca.src =
        `${baseUrl}img/pecas/${nomePeca}.svg`;

    peca.dataset.movido =
        'true';

    fecharPromocao();

    turno =
        turno === 'w'
            ? 'b'
            : 'w';

    atualizarXeque();

    verificarFimDeJogo();

    limparSelecao();
}


/*
|--------------------------------------------------------------------------
| FECHAR PROMOÇÃO
|--------------------------------------------------------------------------
*/

function fecharPromocao() {

    promocaoOverlay.classList.remove(
        'ativa'
    );

    opcoesPromocao.innerHTML = '';

    promocaoPendente = null;
}


/*
|--------------------------------------------------------------------------
| MOVER PEÇA
|--------------------------------------------------------------------------
*/

function moverPeca(
    origem,
    destino
) {

    const peca =
        obterElementoPeca(
            origem.linha,
            origem.coluna
        );

    const casaOrigem =
        pegarCasa(
            origem.linha,
            origem.coluna
        );

    const casaDestino =
        pegarCasa(
            destino.linha,
            destino.coluna
        );

    if (
        !peca ||
        !casaOrigem ||
        !casaDestino
    ) {
        return false;
    }

    const nomePeca =
        peca.dataset.peca;

    const tipo =
        tipoDaPeca(nomePeca);

    let capturaEnPassant = false;


    /*
    |--------------------------------------------------------------------------
    | EN PASSANT
    |--------------------------------------------------------------------------
    */

    if (
        tipo === 'P' &&
        origem.coluna !== destino.coluna &&
        !obterPeca(
            destino.linha,
            destino.coluna
        )
    ) {

        const casaPeao =
            pegarCasa(
                origem.linha,
                destino.coluna
            );

        if (casaPeao) {

            const peaoCapturado =
                casaPeao.querySelector('.peca');

            if (
                peaoCapturado &&
                tipoDaPeca(
                    peaoCapturado.dataset.peca
                ) === 'P' &&
                corDaPeca(
                    peaoCapturado.dataset.peca
                ) !== corDaPeca(nomePeca)
            ) {

                casaPeao.removeChild(
                    peaoCapturado
                );

                capturaEnPassant = true;
            }
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CAPTURA NORMAL
    |--------------------------------------------------------------------------
    */

    const pecaCapturada =
        casaDestino.querySelector('.peca');

    if (pecaCapturada) {

        casaDestino.removeChild(
            pecaCapturada
        );
    }


    /*
    |--------------------------------------------------------------------------
    | MOVER PEÇA
    |--------------------------------------------------------------------------
    */

    casaDestino.appendChild(
        peca
    );

    peca.dataset.movido =
        'true';


    /*
    |--------------------------------------------------------------------------
    | SALVAR ÚLTIMO MOVIMENTO
    |--------------------------------------------------------------------------
    */

    ultimoMovimento = {

        origem: {
            linha: origem.linha,
            coluna: origem.coluna
        },

        destino: {
            linha: destino.linha,
            coluna: destino.coluna
        },

        peca: nomePeca,

        capturaEnPassant
    };


    /*
    |--------------------------------------------------------------------------
    | PROMOÇÃO
    |--------------------------------------------------------------------------
    */

    if (
        tipo === 'P' &&
        (
            destino.linha === 0 ||
            destino.linha === 7
        )
    ) {

        abrirPromocao(
            casaDestino
        );

        return 'promocao';
    }


    /*
    |--------------------------------------------------------------------------
    | ROQUE
    |--------------------------------------------------------------------------
    */

    if (
        tipo === 'K' &&
        Math.abs(
            destino.coluna -
            origem.coluna
        ) === 2
    ) {

        fazerRoque(
            origem,
            destino
        );
    }

    return true;
}


/*
|--------------------------------------------------------------------------
| FAZER ROQUE
|--------------------------------------------------------------------------
*/

function fazerRoque(
    origem,
    destino
) {

    const linha =
        origem.linha;

    const ladoRei =
        destino.coluna >
        origem.coluna;

    const colunaTorreOrigem =
        ladoRei ? 7 : 0;

    const colunaTorreDestino =
        ladoRei ? 5 : 3;

    const torre =
        obterElementoPeca(
            linha,
            colunaTorreOrigem
        );

    const casaTorreDestino =
        pegarCasa(
            linha,
            colunaTorreDestino
        );

    if (
        torre &&
        casaTorreDestino
    ) {

        casaTorreDestino.appendChild(
            torre
        );

        torre.dataset.movido =
            'true';
    }
}


/*
|--------------------------------------------------------------------------
| CRIAR TABULEIRO
|--------------------------------------------------------------------------
*/

function criarTabuleiro() {

    tabuleiro.innerHTML = '';

    for (let linha = 0; linha < 8; linha++) {

        for (let coluna = 0; coluna < 8; coluna++) {

            const casa =
                document.createElement('div');

            casa.classList.add(
                'casa'
            );

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

            casa.dataset.linha =
                linha;

            casa.dataset.coluna =
                coluna;


            /*
            | PRETAS
            */

            if (linha === 0) {

                criarPeca(
                    casa,
                    pecas.pretas[coluna]
                );
            }


            /*
            | PEÕES PRETOS
            */

            if (linha === 1) {

                criarPeca(
                    casa,
                    'bP'
                );
            }


            /*
            | PEÕES BRANCOS
            */

            if (linha === 6) {

                criarPeca(
                    casa,
                    'wP'
                );
            }


            /*
            | BRANCAS
            */

            if (linha === 7) {

                criarPeca(
                    casa,
                    pecas.brancas[coluna]
                );
            }

            tabuleiro.appendChild(
                casa
            );
        }
    }
}


/*
|--------------------------------------------------------------------------
| CRIAR PEÇA
|--------------------------------------------------------------------------
*/

function criarPeca(
    casa,
    nomePeca
) {

    const imagem =
        document.createElement('img');

    imagem.classList.add(
        'peca'
    );

    imagem.src =
        `${baseUrl}img/pecas/${nomePeca}.svg`;

    imagem.alt =
        nomePeca;

    imagem.dataset.peca =
        nomePeca;

    imagem.dataset.movido =
        'false';

    casa.appendChild(
        imagem
    );
}


/*
|--------------------------------------------------------------------------
| CLIQUE NO TABULEIRO
|--------------------------------------------------------------------------
*/

tabuleiro.addEventListener(
    'click',
    function (event) {

        if (jogoEncerrado) {
            return;
        }

        if (promocaoPendente) {
            return;
        }

        const casa =
            event.target.closest('.casa');

        if (!casa) {
            return;
        }

        const { linha, coluna } =
            coordenadas(casa);

        const peca =
            obterPeca(linha, coluna);


        /*
        |--------------------------------------------------------------------------
        | NENHUMA PEÇA SELECIONADA
        |--------------------------------------------------------------------------
        */

        if (!casaSelecionada) {

            if (
                peca &&
                corDaPeca(peca) === turno
            ) {

                casaSelecionada = {
                    linha,
                    coluna
                };

                mostrarMovimentos(
                    linha,
                    coluna
                );
            }

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | MESMA CASA
        |--------------------------------------------------------------------------
        */

        if (
            casaSelecionada.linha === linha &&
            casaSelecionada.coluna === coluna
        ) {

            limparSelecao();

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | OUTRA PEÇA DA MESMA COR
        |--------------------------------------------------------------------------
        */

        if (
            peca &&
            corDaPeca(peca) === turno
        ) {

            limparSelecao();

            casaSelecionada = {
                linha,
                coluna
            };

            mostrarMovimentos(
                linha,
                coluna
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR MOVIMENTO
        |--------------------------------------------------------------------------
        */

        const movimentos =
            movimentosLegais(
                casaSelecionada.linha,
                casaSelecionada.coluna
            );

        const movimentoPermitido =
            movimentos.some(
                ([l, c]) =>
                    l === linha &&
                    c === coluna
            );

        if (!movimentoPermitido) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | MOVER
        |--------------------------------------------------------------------------
        */

        const resultado =
            moverPeca(
                casaSelecionada,
                {
                    linha,
                    coluna
                }
            );


        /*
        |--------------------------------------------------------------------------
        | PROMOÇÃO
        |--------------------------------------------------------------------------
        */

        if (resultado === 'promocao') {

            limparSelecao();

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | TROCAR TURNO
        |--------------------------------------------------------------------------
        */

        turno =
            turno === 'w'
                ? 'b'
                : 'w';

        limparSelecao();

        atualizarXeque();

        verificarFimDeJogo();
    }
);


/*
|--------------------------------------------------------------------------
| INICIAR
|--------------------------------------------------------------------------
*/

criarTabuleiro();

atualizarXeque();