const tabuleiro = document.getElementById('tabuleiro');

for (let linha = 0; linha < 8; linha++) {

    for (let coluna = 0; coluna < 8; coluna++) {

        const casa = document.createElement('div');

        casa.classList.add('casa');

        if ((linha + coluna) % 2 === 0) {
            casa.classList.add('clara');
        } else {
            casa.classList.add('escura');
        }

        tabuleiro.appendChild(casa);
    }
}