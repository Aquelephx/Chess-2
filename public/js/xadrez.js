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
let ultimoMovimento = null;
let historicoMovimentos = [];
let pilhaDesfazer = [];


/* =====================================================
   CONFIGURAÇÃO DA INTERFACE
   ===================================================== */

function criarInterface() {
    let areaTabuleiro =
        tabuleiro.parentElement;

    if (!areaTabuleiro.classList.contains('area-tabuleiro')) {
        const wrapper =
            document.createElement('div');

        wrapper.className =
            'area-tabuleiro';

        tabuleiro.parentNode.insertBefore(
            wrapper,
            tabuleiro
        );

        wrapper.appendChild(tabuleiro);

        areaTabuleiro = wrapper;
    }

    let container =
        areaTabuleiro.parentElement;

    if (!container.classList.contains('xadrez-container')) {
        const novoContainer =
            document.createElement('div');

        novoContainer.className =
            'xadrez-container';

        areaTabuleiro.parentNode.insertBefore(
            novoContainer,
            areaTabuleiro
        );

        novoContainer.appendChild(
            areaTabuleiro
        );

        container = novoContainer;
    }

    let turnoElemento =
        document.getElementById('turno');

    if (!turnoElemento) {
        turnoElemento =
            document.createElement('div');

        turnoElemento.id =
            'turno';

        turnoElemento.className =
            'turno';

        areaTabuleiro.insertBefore(
            turnoElemento,
            tabuleiro
        );
    }

    let controles =
        document.getElementById('controles');

    if (!controles) {
        controles =
            document.createElement('div');

        controles.id =
            'controles';

        controles.className =
            'controles';

        areaTabuleiro.appendChild(
            controles
        );
    }

    let botaoDesfazer =
        document.getElementById('desfazer');

    if (!botaoDesfazer) {
        botaoDesfazer =
            document.createElement('button');

        botaoDesfazer.id =
            'desfazer';

        botaoDesfazer.className =
            'controle-botao';

        botaoDesfazer.textContent =
            'Desfazer';

        controles.appendChild(
            botaoDesfazer
        );
    }

    let botaoNova =
        document.getElementById('novaPartida');

    if (!botaoNova) {
        botaoNova =
            document.createElement('button');

        botaoNova.id =
            'novaPartida';

        botaoNova.className =
            'controle-botao';

        botaoNova.textContent =
            'Nova partida';

        controles.appendChild(
            botaoNova
        );
    }

    botaoDesfazer.onclick =
        desfazerJogada;

    botaoNova.onclick =
        novaPartida;

    criarTelaFimDeJogo();
    atualizarTurno();
    atualizarBotaoDesfazer();
}


/* =====================================================
   TELA DE FIM DE JOGO
   ===================================================== */

function criarTelaFimDeJogo() {
    if (document.getElementById('fimJogo')) {
        return;
    }

    const overlay =
        document.createElement('div');

    overlay.id =
        'fimJogo';

    overlay.className =
        'fim-jogo';

    overlay.innerHTML = `
        <div class="fim-jogo-caixa">
            <h2 id="fimJogoTitulo"></h2>

            <p id="fimJogoTexto"></p>

            <button
                id="botaoNovaPartidaFim"
                class="botao-nova-partida"
            >
                Nova partida
            </button>
        </div>
    `;

    document.body.appendChild(
        overlay
    );

    document
        .getElementById('botaoNovaPartidaFim')
        .addEventListener(
            'click',
            novaPartida
        );
}


/* =====================================================
   MOSTRAR FIM DE JOGO
   ===================================================== */

function mostrarFimDeJogo(
    titulo,
    texto
) {
    const overlay =
        document.getElementById('fimJogo');

    const tituloElemento =
        document.getElementById('fimJogoTitulo');

    const textoElemento =
        document.getElementById('fimJogoTexto');

    if (!overlay) {
        return;
    }

    tituloElemento.textContent =
        titulo;

    textoElemento.textContent =
        texto;

    overlay.classList.add(
        'ativo'
    );
}


/* =====================================================
   FECHAR FIM DE JOGO
   ===================================================== */

function fecharFimDeJogo() {
    const overlay =
        document.getElementById('fimJogo');

    if (overlay) {
        overlay.classList.remove(
            'ativo'
        );
    }
}


/* =====================================================
   TURNO
   ===================================================== */

function atualizarTurno() {
    const elemento =
        document.getElementById('turno');

    if (!elemento) {
        return;
    }

    elemento.textContent =
        turno === 'w'
            ? 'Vez das Brancas'
            : 'Vez das Pretas';
}


/* =====================================================
   BOTÃO DESFAZER
   ===================================================== */

function atualizarBotaoDesfazer() {
    const botao =
        document.getElementById('desfazer');

    if (!botao) {
        return;
    }

    botao.disabled =
        pilhaDesfazer.length === 0;
}


/* =====================================================
   SALVAR ESTADO
   ===================================================== */

function salvarEstado() {
    pilhaDesfazer.push({
        tabuleiro:
            tabuleiro.innerHTML,

        turno,

        jogoEncerrado,

        ultimoMovimento:
            ultimoMovimento
                ? JSON.parse(
                    JSON.stringify(
                        ultimoMovimento
                    )
                )
                : null,

        historicoMovimentos:
            JSON.parse(
                JSON.stringify(
                    historicoMovimentos
                )
            )
    });

    atualizarBotaoDesfazer();
}


/* =====================================================
   DESFAZER
   ===================================================== */

function desfazerJogada() {
    if (
        pilhaDesfazer.length === 0 ||
        promocaoPendente
    ) {
        return;
    }

    const estado =
        pilhaDesfazer.pop();

    tabuleiro.innerHTML =
        estado.tabuleiro;

    turno =
        estado.turno;

    jogoEncerrado =
        estado.jogoEncerrado;

    ultimoMovimento =
        estado.ultimoMovimento;

    historicoMovimentos =
        estado.historicoMovimentos;

    limparSelecao();

    fecharFimDeJogo();

    atualizarXeque();

    atualizarTurno();

    atualizarHistorico();

    atualizarUltimoMovimentoVisual();

    atualizarBotaoDesfazer();
}


/* =====================================================
   NOVA PARTIDA
   ===================================================== */

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


/* =====================================================
   LIMPAR SELEÇÃO
   ===================================================== */

function limparSelecao() {
    document
        .querySelectorAll('.casa')
        .forEach(casa => {
            casa.classList.remove(
                'selecionada'
            );

            casa.classList.remove(
                'movimento'
            );

            casa.classList.remove(
                'captura'
            );
        });

    casaSelecionada = null;
}


/* =====================================================
   OBTER PEÇA
   ===================================================== */

function obterPeca(
    linha,
    coluna
) {
    const casa =
        pegarCasa(
            linha,
            coluna
        );

    if (!casa) {
        return null;
    }

    const peca =
        casa.querySelector(
            '.peca'
        );

    if (!peca) {
        return null;
    }

    return peca.dataset.peca;
}


/* =====================================================
   OBTER ELEMENTO DA PEÇA
   ===================================================== */

function obterElementoPeca(
    linha,
    coluna
) {
    const casa =
        pegarCasa(
            linha,
            coluna
        );

    if (!casa) {
        return null;
    }

    return casa.querySelector(
        '.peca'
    );
}


/* =====================================================
   COR DA PEÇA
   ===================================================== */

function corDaPeca(peca) {
    if (!peca) {
        return null;
    }

    return peca[0] === 'w'
        ? 'w'
        : 'b';
}


/* =====================================================
   TIPO DA PEÇA
   ===================================================== */

function tipoDaPeca(peca) {
    if (!peca) {
        return null;
    }

    return peca[1];
}


/* =====================================================
   COORDENADAS
   ===================================================== */

function coordenadas(casa) {
    return {
        linha:
            parseInt(
                casa.dataset.linha
            ),

        coluna:
            parseInt(
                casa.dataset.coluna
            )
    };
}


/* =====================================================
   PEGAR CASA
   ===================================================== */

function pegarCasa(
    linha,
    coluna
) {
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


/* =====================================================
   CAMINHO LIVRE
   ===================================================== */

function caminhoLivre(
    linhaOrigem,
    colunaOrigem,
    linhaDestino,
    colunaDestino
) {
    const passoLinha =
        Math.sign(
            linhaDestino -
            linhaOrigem
        );

    const passoColuna =
        Math.sign(
            colunaDestino -
            colunaOrigem
        );

    let linha =
        linhaOrigem +
        passoLinha;

    let coluna =
        colunaOrigem +
        passoColuna;

    while (
        linha !== linhaDestino ||
        coluna !== colunaDestino
    ) {
        if (
            obterPeca(
                linha,
                coluna
            )
        ) {
            return false;
        }

        linha += passoLinha;
        coluna += passoColuna;
    }

    return true;
}


/* =====================================================
   MOVIMENTOS DESLIZANTES
   ===================================================== */

function movimentosDeslizantes(
    linha,
    coluna,
    direcoes,
    cor
) {
    const movimentos = [];

    for (
        const [dl, dc]
        of direcoes
    ) {
        let novaLinha =
            linha + dl;

        let novaColuna =
            coluna + dc;

        while (
            novaLinha >= 0 &&
            novaLinha <= 7 &&
            novaColuna >= 0 &&
            novaColuna <= 7
        ) {
            const pecaDestino =
                obterPeca(
                    novaLinha,
                    novaColuna
                );

            if (!pecaDestino) {
                movimentos.push([
                    novaLinha,
                    novaColuna
                ]);
            } else {
                if (
                    corDaPeca(
                        pecaDestino
                    ) !== cor &&
                    tipoDaPeca(
                        pecaDestino
                    ) !== 'K'
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


/* =====================================================
   CASA ATACADA
   ===================================================== */

function casaAtacada(
    linhaAlvo,
    colunaAlvo,
    corAtacante
) {
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
            const peca =
                obterPeca(
                    linha,
                    coluna
                );

            if (!peca) {
                continue;
            }

            if (
                corDaPeca(peca) !==
                corAtacante
            ) {
                continue;
            }

            const tipo =
                tipoDaPeca(peca);

            if (tipo === 'P') {
                const direcao =
                    corAtacante === 'w'
                        ? -1
                        : 1;

                if (
                    linha + direcao ===
                        linhaAlvo &&
                    (
                        coluna - 1 ===
                            colunaAlvo ||
                        coluna + 1 ===
                            colunaAlvo
                    )
                ) {
                    return true;
                }

                continue;
            }

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

                for (
                    const [dl, dc]
                    of movimentos
                ) {
                    if (
                        linha + dl ===
                            linhaAlvo &&
                        coluna + dc ===
                            colunaAlvo
                    ) {
                        return true;
                    }
                }

                continue;
            }

            if (tipo === 'K') {
                if (
                    Math.abs(
                        linha -
                        linhaAlvo
                    ) <= 1 &&
                    Math.abs(
                        coluna -
                        colunaAlvo
                    ) <= 1
                ) {
                    return true;
                }

                continue;
            }

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

            for (
                const [dl, dc]
                of direcoes
            ) {
                let novaLinha =
                    linha + dl;

                let novaColuna =
                    coluna + dc;

                while (
                    novaLinha >= 0 &&
                    novaLinha <= 7 &&
                    novaColuna >= 0 &&
                    novaColuna <= 7
                ) {
                    if (
                        novaLinha ===
                            linhaAlvo &&
                        novaColuna ===
                            colunaAlvo
                    ) {
                        return true;
                    }

                    if (
                        obterPeca(
                            novaLinha,
                            novaColuna
                        )
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


/* =====================================================
   ENCONTRAR REI
   ===================================================== */

function encontrarRei(cor) {
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
            const peca =
                obterPeca(
                    linha,
                    coluna
                );

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


/* =====================================================
   XEQUE
   ===================================================== */

function estaEmXeque(cor) {
    const rei =
        encontrarRei(cor);

    if (!rei) {
        return false;
    }

    const adversario =
        cor === 'w'
            ? 'b'
            : 'w';

    return casaAtacada(
        rei.linha,
        rei.coluna,
        adversario
    );
}


/* =====================================================
   ROQUE
   ===================================================== */

function podeFazerRoque(
    linha,
    coluna,
    destinoColuna
) {
    const rei =
        obterElementoPeca(
            linha,
            coluna
        );

    if (!rei) {
        return false;
    }

    if (
        rei.dataset.movido ===
        'true'
    ) {
        return false;
    }

    const cor =
        corDaPeca(
            rei.dataset.peca
        );

    if (
        estaEmXeque(cor)
    ) {
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

    if (
        torre.dataset.movido ===
        'true'
    ) {
        return false;
    }

    const inicio =
        Math.min(
            coluna,
            colunaTorre
        );

    const fim =
        Math.max(
            coluna,
            colunaTorre
        );

    for (
        let c = inicio + 1;
        c < fim;
        c++
    ) {
        if (
            obterPeca(
                linha,
                c
            )
        ) {
            return false;
        }
    }

    const passo =
        ladoRei ? 1 : -1;

    const casaPassagem =
        coluna + passo;

    const adversario =
        cor === 'w'
            ? 'b'
            : 'w';

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


/* =====================================================
   MOVIMENTOS BRUTOS
   ===================================================== */

function obterMovimentosBrutos(
    linha,
    coluna
) {
    const peca =
        obterPeca(
            linha,
            coluna
        );

    if (!peca) {
        return [];
    }

    const cor =
        corDaPeca(peca);

    const tipo =
        tipoDaPeca(peca);

    const movimentos = [];


    /* PEÃO */

    if (tipo === 'P') {
        const direcao =
            cor === 'w'
                ? -1
                : 1;

        const linhaInicial =
            cor === 'w'
                ? 6
                : 1;

        const proximaLinha =
            linha + direcao;

        if (
            proximaLinha >= 0 &&
            proximaLinha <= 7 &&
            !obterPeca(
                proximaLinha,
                coluna
            )
        ) {
            movimentos.push([
                proximaLinha,
                coluna
            ]);

            const segundaLinha =
                linha +
                direcao * 2;

            if (
                linha === linhaInicial &&
                !obterPeca(
                    segundaLinha,
                    coluna
                )
            ) {
                movimentos.push([
                    segundaLinha,
                    coluna
                ]);
            }
        }

        for (
            const dc of [-1, 1]
        ) {
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
                corDaPeca(
                    pecaDestino
                ) !== cor &&
                tipoDaPeca(
                    pecaDestino
                ) !== 'K'
            ) {
                movimentos.push([
                    proximaLinha,
                    novaColuna
                ]);
            }
        }


        /* EN PASSANT */

        if (ultimoMovimento) {
            const origemUltimo =
                ultimoMovimento.origem;

            const destinoUltimo =
                ultimoMovimento.destino;

            const pecaUltimo =
                ultimoMovimento.peca;

            if (
                pecaUltimo &&
                tipoDaPeca(
                    pecaUltimo
                ) === 'P' &&
                corDaPeca(
                    pecaUltimo
                ) !== cor &&
                Math.abs(
                    destinoUltimo.linha -
                    origemUltimo.linha
                ) === 2 &&
                destinoUltimo.linha ===
                    linha &&
                Math.abs(
                    destinoUltimo.coluna -
                    coluna
                ) === 1
            ) {
                const casaDestino =
                    pegarCasa(
                        linha + direcao,
                        destinoUltimo.coluna
                    );

                if (
                    casaDestino &&
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


    /* CAVALO */

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

        for (
            const [dl, dc]
            of movimentosCavalo
        ) {
            const novaLinha =
                linha + dl;

            const novaColuna =
                coluna + dc;

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


    /* BISPO */

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


    /* TORRE */

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


    /* RAINHA */

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


    /* REI */

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

        for (
            const [dl, dc]
            of movimentosRei
        ) {
            const novaLinha =
                linha + dl;

            const novaColuna =
                coluna + dc;

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


/* =====================================================
   SIMULAR MOVIMENTO
   ===================================================== */

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

    const pecaCapturada =
        casaDestino.querySelector(
            '.peca'
        );

    let pecaCapturadaEnPassant =
        null;

    let casaCapturadaEnPassant =
        null;

    if (
        tipoDaPeca(
            pecaOrigem.dataset.peca
        ) === 'P' &&
        origem.coluna !==
            destino.coluna &&
        !pecaCapturada
    ) {
        casaCapturadaEnPassant =
            pegarCasa(
                origem.linha,
                destino.coluna
            );

        if (
            casaCapturadaEnPassant
        ) {
            const possivelPeao =
                casaCapturadaEnPassant
                    .querySelector('.peca');

            if (
                possivelPeao &&
                tipoDaPeca(
                    possivelPeao.dataset.peca
                ) === 'P'
            ) {
                pecaCapturadaEnPassant =
                    possivelPeao;

                casaCapturadaEnPassant
                    .removeChild(
                        pecaCapturadaEnPassant
                    );
            }
        }
    }

    if (pecaCapturada) {
        casaDestino.removeChild(
            pecaCapturada
        );
    }

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


/* =====================================================
   DESFAZER SIMULAÇÃO
   ===================================================== */

function desfazerMovimento(
    simulacao
) {
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

    casaOrigem.appendChild(
        pecaOrigem
    );

    if (pecaCapturada) {
        casaDestino.appendChild(
            pecaCapturada
        );
    }

    if (
        pecaCapturadaEnPassant &&
        casaCapturadaEnPassant
    ) {
        casaCapturadaEnPassant.appendChild(
            pecaCapturadaEnPassant
        );
    }
}


/* =====================================================
   MOVIMENTOS LEGAIS
   ===================================================== */

function movimentosLegais(
    linha,
    coluna
) {
    const peca =
        obterPeca(
            linha,
            coluna
        );

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

    for (
        const [
            destinoLinha,
            destinoColuna
        ]
        of movimentosBrutos
    ) {
        if (
            tipoDaPeca(peca) === 'K' &&
            Math.abs(
                destinoColuna -
                coluna
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
                    linha:
                        destinoLinha,

                    coluna:
                        destinoColuna
                }
            );

        if (!simulacao) {
            continue;
        }

        const emXeque =
            estaEmXeque(cor);

        desfazerMovimento(
            simulacao
        );

        if (!emXeque) {
            movimentosLegais.push([
                destinoLinha,
                destinoColuna
            ]);
        }
    }

    return movimentosLegais;
}


/* =====================================================
   MOSTRAR MOVIMENTOS
   ===================================================== */

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

    for (
        const [l, c]
        of movimentos
    ) {
        const casa =
            pegarCasa(l, c);

        if (!casa) {
            continue;
        }

        casa.classList.add(
            'movimento'
        );

        if (
            obterPeca(l, c)
        ) {
            casa.classList.add(
                'captura'
            );
        }

        const pecaOrigem =
            obterPeca(
                linha,
                coluna
            );

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


/* =====================================================
   EXISTEM MOVIMENTOS
   ===================================================== */

function existemMovimentos(cor) {
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
            const peca =
                obterPeca(
                    linha,
                    coluna
                );

            if (!peca) {
                continue;
            }

            if (
                corDaPeca(peca) !== cor
            ) {
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


/* =====================================================
   ATUALIZAR XEQUE
   ===================================================== */

function atualizarXeque() {
    document
        .querySelectorAll('.casa')
        .forEach(casa => {
            casa.classList.remove(
                'xeque'
            );
        });

    for (
        const cor of ['w', 'b']
    ) {
        if (
            estaEmXeque(cor)
        ) {
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


/* =====================================================
   NOME DA PEÇA
   ===================================================== */

function nomePeca(
    tipo
) {
    const nomes = {
        P: '',
        N: 'C',
        B: 'B',
        R: 'T',
        Q: 'D',
        K: 'R'
    };

    return nomes[tipo] || '';
}


/* =====================================================
   CASA PARA ALGÉBRICA
   ===================================================== */

function casaAlgebrica(
    linha,
    coluna
) {
    const letras =
        'abcdefgh';

    return (
        letras[coluna] +
        (8 - linha)
    );
}


/* =====================================================
   REGISTRAR MOVIMENTO
   ===================================================== */

function registrarMovimento(
    origem,
    destino,
    peca,
    captura,
    roque,
    promocao
) {
    const tipo =
        tipoDaPeca(peca);

    let anotacao = '';

    if (roque) {
        if (
            destino.coluna >
            origem.coluna
        ) {
            anotacao = 'O-O';
        } else {
            anotacao = 'O-O-O';
        }
    } else {
        const nome =
            nomePeca(tipo);

        if (tipo === 'P') {
            if (captura) {
                anotacao =
                    casaAlgebrica(
                        origem.linha,
                        origem.coluna
                    )[0] +
                    'x';
            }
        } else {
            anotacao = nome;

            if (captura) {
                anotacao += 'x';
            }
        }

        anotacao +=
            casaAlgebrica(
                destino.linha,
                destino.coluna
            );

        if (promocao) {
            anotacao +=
                '=' +
                nomePeca(
                    promocao
                );
        }
    }

    historicoMovimentos.push({
        cor:
            corDaPeca(peca),

        anotacao
    });

    atualizarHistorico();
}


/* =====================================================
   ATUALIZAR HISTÓRICO
   ===================================================== */

function atualizarHistorico() {
    const lista =
        document.querySelector(
            '.lista-historico'
        );

    if (!lista) {
        return;
    }

    lista.innerHTML = '';

    for (
        let i = 0;
        i < historicoMovimentos.length;
        i += 2
    ) {
        const linha =
            document.createElement(
                'div'
            );

        linha.className =
            'linha-historico';

        const numero =
            document.createElement(
                'div'
            );

        numero.className =
            'numero-movimento';

        numero.textContent =
            (i / 2 + 1) + '.';

        const branco =
            document.createElement(
                'div'
            );

        branco.className =
            'movimento-branco';

        branco.textContent =
            historicoMovimentos[i]
                ?.anotacao || '';

        const preto =
            document.createElement(
                'div'
            );

        preto.className =
            'movimento-preto';

        preto.textContent =
            historicoMovimentos[i + 1]
                ?.anotacao || '';

        linha.appendChild(numero);
        linha.appendChild(branco);
        linha.appendChild(preto);

        lista.appendChild(linha);
    }

    lista.scrollTop =
        lista.scrollHeight;
}


/* =====================================================
   ÚLTIMO MOVIMENTO VISUAL
   ===================================================== */

function atualizarUltimoMovimentoVisual() {
    document
        .querySelectorAll('.ultimo-movimento')
        .forEach(casa => {
            casa.classList.remove(
                'ultimo-movimento'
            );
        });

    if (!ultimoMovimento) {
        return;
    }

    const origem =
        pegarCasa(
            ultimoMovimento.origem.linha,
            ultimoMovimento.origem.coluna
        );

    const destino =
        pegarCasa(
            ultimoMovimento.destino.linha,
            ultimoMovimento.destino.coluna
        );

    if (origem) {
        origem.classList.add(
            'ultimo-movimento'
        );
    }

    if (destino) {
        destino.classList.add(
            'ultimo-movimento'
        );
    }
}


/* =====================================================
   VERIFICAR FIM DE JOGO
   ===================================================== */

function verificarFimDeJogo() {
    if (
        existemMovimentos(turno)
    ) {
        return;
    }

    jogoEncerrado = true;

    if (
        estaEmXeque(turno)
    ) {
        const vencedor =
            turno === 'w'
                ? 'Pretas'
                : 'Brancas';

        const perdedor =
            turno === 'w'
                ? 'Brancas'
                : 'Pretas';

        if (
            historicoMovimentos.length > 0
        ) {
            historicoMovimentos[
                historicoMovimentos.length - 1
            ].anotacao += '#';

            atualizarHistorico();
        }

        mostrarFimDeJogo(
            'Xeque-mate!',
            vencedor +
            ' venceram a partida.'
        );
    } else {
        mostrarFimDeJogo(
            'Empate!',
            'A partida terminou por afogamento.'
        );
    }
}


/* =====================================================
   PROMOÇÃO
   ===================================================== */

function abrirPromocao(casa) {
    const peca =
        casa.querySelector(
            '.peca'
        );

    if (!peca) {
        return;
    }

    const tipo =
        tipoDaPeca(
            peca.dataset.peca
        );

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

    promocaoPendente =
        casa;

    opcoesPromocao.innerHTML =
        '';

    const cor =
        corDaPeca(
            peca.dataset.peca
        );

    const opcoes = [
        'Q',
        'R',
        'B',
        'N'
    ];

    for (
        const tipoPromocao
        of opcoes
    ) {
        const botao =
            document.createElement(
                'button'
            );

        botao.className =
            'opcao-promocao';

        const imagem =
            document.createElement(
                'img'
            );

        const nome =
            cor +
            tipoPromocao;

        imagem.src =
            `${baseUrl}img/pecas/${nome}.svg`;

        imagem.alt =
            nome;

        botao.appendChild(
            imagem
        );

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


/* =====================================================
   ESCOLHER PROMOÇÃO
   ===================================================== */

function escolherPromocao(
    tipo
) {
    if (!promocaoPendente) {
        return;
    }

    const casa =
        promocaoPendente;

    const peca =
        casa.querySelector(
            '.peca'
        );

    if (!peca) {
        fecharPromocao();
        return;
    }

    const cor =
        corDaPeca(
            peca.dataset.peca
        );

    const nome =
        cor + tipo;

    peca.dataset.peca =
        nome;

    peca.src =
        `${baseUrl}img/pecas/${nome}.svg`;

    peca.dataset.movido =
        'true';

    if (
        historicoMovimentos.length > 0
    ) {
        historicoMovimentos[
            historicoMovimentos.length - 1
        ].anotacao +=
            '=' +
            nomePeca(tipo);
    }

    fecharPromocao();

    turno =
        turno === 'w'
            ? 'b'
            : 'w';

    atualizarXeque();

    adicionarIndicadorXeque();

    atualizarTurno();

    atualizarHistorico();

    verificarFimDeJogo();

    limparSelecao();

    atualizarUltimoMovimentoVisual();
}


/* =====================================================
   INDICADOR DE XEQUE
   ===================================================== */

function adicionarIndicadorXeque() {
    const cor =
        turno;

    if (
        estaEmXeque(cor)
    ) {
        if (
            historicoMovimentos.length > 0
        ) {
            historicoMovimentos[
                historicoMovimentos.length - 1
            ].anotacao += '+';

            atualizarHistorico();
        }
    }
}


/* =====================================================
   FECHAR PROMOÇÃO
   ===================================================== */

function fecharPromocao() {
    promocaoOverlay.classList.remove(
        'ativa'
    );

    opcoesPromocao.innerHTML =
        '';

    promocaoPendente =
        null;
}


/* =====================================================
   MOVER PEÇA
   ===================================================== */

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

    salvarEstado();

    const nome =
        peca.dataset.peca;

    const tipo =
        tipoDaPeca(nome);

    let capturaEnPassant =
        false;

    let captura =
        false;

    let roque =
        false;

    let promocao =
        null;


    /* EN PASSANT */

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
                casaPeao.querySelector(
                    '.peca'
                );

            if (
                peaoCapturado &&
                tipoDaPeca(
                    peaoCapturado.dataset.peca
                ) === 'P' &&
                corDaPeca(
                    peaoCapturado.dataset.peca
                ) !==
                    corDaPeca(nome)
            ) {
                casaPeao.removeChild(
                    peaoCapturado
                );

                capturaEnPassant =
                    true;

                captura =
                    true;
            }
        }
    }


    /* CAPTURA NORMAL */

    const pecaCapturada =
        casaDestino.querySelector(
            '.peca'
        );

    if (pecaCapturada) {
        casaDestino.removeChild(
            pecaCapturada
        );

        captura =
            true;
    }


    /* MOVER */

    casaDestino.appendChild(
        peca
    );

    peca.dataset.movido =
        'true';


    /* ROQUE */

    if (
        tipo === 'K' &&
        Math.abs(
            destino.coluna -
            origem.coluna
        ) === 2
    ) {
        roque = true;

        fazerRoque(
            origem,
            destino
        );
    }


    /* ÚLTIMO MOVIMENTO */

    ultimoMovimento = {
        origem: {
            linha:
                origem.linha,

            coluna:
                origem.coluna
        },

        destino: {
            linha:
                destino.linha,

            coluna:
                destino.coluna
        },

        peca: nome,

        capturaEnPassant
    };


    /* HISTÓRICO */

    registrarMovimento(
        origem,
        destino,
        nome,
        captura,
        roque,
        promocao
    );


    /* PROMOÇÃO */

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

        atualizarUltimoMovimentoVisual();

        return 'promocao';
    }


    /* XEQUE */

    turno =
        turno === 'w'
            ? 'b'
            : 'w';

    atualizarXeque();

    adicionarIndicadorXeque();

    atualizarTurno();

    atualizarUltimoMovimentoVisual();

    verificarFimDeJogo();

    return true;
}


/* =====================================================
   FAZER ROQUE
   ===================================================== */

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
        ladoRei
            ? 7
            : 0;

    const colunaTorreDestino =
        ladoRei
            ? 5
            : 3;

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


/* =====================================================
   CRIAR TABULEIRO
   ===================================================== */

function criarTabuleiro() {
    tabuleiro.innerHTML =
        '';

    const letras =
        'abcdefgh';

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
                document.createElement(
                    'div'
                );

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


            /* COORDENADA DA COLUNA */

            if (
                linha === 7
            ) {
                const coordenadaColuna =
                    document.createElement(
                        'span'
                    );

                coordenadaColuna.className =
                    'coordenada-coluna';

                coordenadaColuna.textContent =
                    letras[coluna];

                casa.appendChild(
                    coordenadaColuna
                );
            }


            /* COORDENADA DA LINHA */

            if (
                coluna === 0
            ) {
                const coordenadaLinha =
                    document.createElement(
                        'span'
                    );

                coordenadaLinha.className =
                    'coordenada-linha';

                coordenadaLinha.textContent =
                    8 - linha;

                casa.appendChild(
                    coordenadaLinha
                );
            }


            /* PRETAS */

            if (
                linha === 0
            ) {
                criarPeca(
                    casa,
                    pecas.pretas[coluna]
                );
            }


            /* PEÕES PRETOS */

            if (
                linha === 1
            ) {
                criarPeca(
                    casa,
                    'bP'
                );
            }


            /* PEÕES BRANCOS */

            if (
                linha === 6
            ) {
                criarPeca(
                    casa,
                    'wP'
                );
            }


            /* BRANCAS */

            if (
                linha === 7
            ) {
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


/* =====================================================
   CRIAR PEÇA
   ===================================================== */

function criarPeca(
    casa,
    nomePeca
) {
    const imagem =
        document.createElement(
            'img'
        );

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


/* =====================================================
   CLIQUE NO TABULEIRO
   ===================================================== */

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
            event.target.closest(
                '.casa'
            );

        if (!casa) {
            return;
        }

        const {
            linha,
            coluna
        } = coordenadas(casa);

        const peca =
            obterPeca(
                linha,
                coluna
            );


        /* NENHUMA SELECIONADA */

        if (!casaSelecionada) {
            if (
                peca &&
                corDaPeca(peca) ===
                    turno
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


        /* MESMA CASA */

        if (
            casaSelecionada.linha ===
                linha &&
            casaSelecionada.coluna ===
                coluna
        ) {
            limparSelecao();

            return;
        }


        /* OUTRA PEÇA DA MESMA COR */

        if (
            peca &&
            corDaPeca(peca) ===
                turno
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


        /* VERIFICAR MOVIMENTO */

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


        /* MOVER */

        const resultado =
            moverPeca(
                casaSelecionada,
                {
                    linha,
                    coluna
                }
            );


        /* PROMOÇÃO */

        if (
            resultado ===
            'promocao'
        ) {
            limparSelecao();

            return;
        }

        limparSelecao();
    }
);


/* =====================================================
   INICIAR
   ===================================================== */

criarInterface();

criarTabuleiro();

atualizarXeque();

atualizarTurno();

atualizarHistorico();

atualizarUltimoMovimentoVisual();

atualizarBotaoDesfazer();