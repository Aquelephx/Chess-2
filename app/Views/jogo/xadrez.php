<!DOCTYPE html>
<html lang="pt-br">

<head>

    <link
        rel="stylesheet"
        href="<?= base_url('css/xadrez.css') ?>"
    >

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Xadrez</title>

    <link
        rel="icon"
        href="<?= base_url('img/rs/bingus.png') ?>"
        type="image/png"
    >

</head>

<body>

    <div id="tabuleiro"></div>


    <!-- =================================================
         INTERFACE DE PROMOÇÃO
         ================================================= -->

    <div
        id="promocao"
        class="promocao-overlay"
    >

        <div class="promocao-caixa">

            <h2>Promover peão</h2>

            <p>Escolha uma peça</p>

            <div
                id="opcoesPromocao"
                class="opcoes-promocao"
            ></div>

        </div>

    </div>


    <script>
        const baseUrl = "<?= base_url('/') ?>";
    </script>

    <script
        src="<?= base_url('js/xadrez.js') ?>"
    ></script>

</body>

</html>