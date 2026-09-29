<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xadrez</title>
    <link rel="icon" href="<?= base_url('img/rs/bingus.png') ?>" type="image/png">
    <link rel="stylesheet" href="<?= base_url('css/xadrez.css') ?>">
</head>

<body>
    <main class="jogo">

        <!-- ==============================
             TABULEIRO
             ============================== -->

        <section class="tabuleiro-container">
            <div id="tabuleiro"></div>
        </section>

        <!-- ==============================
             HISTÓRICO DE JOGADAS
             ============================== -->

        <section id="historico">
            <div class="historico-titulo">
                Histórico de jogadas
            </div>
            <div
                id="listaHistorico"
                class="lista-historico"
            ></div>
        </section>
    </main>

    <!-- ==============================
         PROMOÇÃO DE PEÃO
         ============================== -->

    <div id="promocao" class="promocao-overlay">
        <div class="promocao-caixa">
            <h2>Promover peão</h2>
            <p>Escolha uma peça</p>
            <div id="opcoesPromocao" class="opcoes-promocao" ></div>
        </div>
    </div>

    <!-- ==============================
         BASE URL
         ============================== -->

    <script>
        const baseUrl = "<?= base_url('/') ?>";
    </script>

    <!-- ==============================
         JAVASCRIPT
         ============================== -->

    <script
        src="<?= base_url('js/xadrez.js') ?>"
    ></script>
</body>
</html>
