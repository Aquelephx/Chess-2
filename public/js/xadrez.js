const tabuleiro = document.getElementById('tabuleiro');

const pecas = {
    pretas: ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    brancas: ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
};

let casaSelecionada = null;


// Limpar seleção e movimentos
function limparSelecao() {
    document.querySelectorAll('.casa').forEach(casa => {
        casa.classList.remove('selecionada');
        casa.classList.remove('movimento');
    });

    casaSelecionada = null;
}


// Criar tabuleiro
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


        // Identificar peça
        let nomePeca = null;


        // Peças pretas
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


        // Peças brancas
        if (linha === 7) {
            nomePeca = pecas.brancas[coluna];
        }


        // Criar imagem da peça
        if (nomePeca) {

            const imagem = document.createElement('img');

            imagem.src = `${baseUrl}img/pecas/${nomePeca}.svg`;

            imagem.classList.add('peca');

            casa.appendChild(imagem);
        }


        // Clique na casa
        casa.addEventListener('click', () => {


            // PRIMEIRO CLIQUE
            if (casaSelecionada === null) {

                const peca = casa.querySelector('.peca');

                // Só seleciona se existir uma peça
                if (peca) {

                    casaSelecionada = casa;

                    casa.classList.add('selecionada');


                    // Mostrar movimentos
                    document.querySelectorAll('.casa').forEach(casaDestino => {

                        if (casaDestino !== casaSelecionada) {
                            casaDestino.classList.add('movimento');
                        }

                    });
                }

                return;
            }


            // Clicou novamente na mesma casa
            if (casa === casaSelecionada) {

                limparSelecao();

                return;
            }


            // SEGUNDO CLIQUE
            const peca = casaSelecionada.querySelector('.peca');


            if (peca) {

                // Se tiver peça no destino, remove
                const pecaDestino = casa.querySelector('.peca');

                if (pecaDestino) {
                    pecaDestino.remove();
                }


                // Move a peça
                casa.appendChild(peca);
            }


            // Limpa seleção
            limparSelecao();

        });


        // Adiciona casa ao tabuleiro
        tabuleiro.appendChild(casa);
    }
}