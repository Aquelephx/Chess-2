const tabuleiro = document.getElementById('tabuleiro');

const pecas = {
    pretas: ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    brancas: ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
};

for (let linha = 0; linha < 8; linha++) {
    for (let coluna = 0; coluna < 8; coluna++) {

        const casa = document.createElement('div');
        casa.classList.add('casa');

        if ((linha + coluna) % 2 === 0) {
            casa.classList.add('clara');
        } else {
            casa.classList.add('escura');
        }

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

        // Coloca a peça na casa
        if (nomePeca) {
            const imagem = document.createElement('img');

            imagem.src = `${baseUrl}img/pecas/${nomePeca}.svg`;
            imagem.classList.add('peca');

            casa.appendChild(imagem);
        }

        tabuleiro.appendChild(casa);
    }
}