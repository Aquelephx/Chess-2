<?php
$conexao = new mysqli("localhost", "root", "", "chesspontocom");

if ($conexao->connect_error) {
    die("Falha na conexão: " . $conexao->connect_error);
}

// Procura o tema ativo na tabela 'temas'
$sql = "SELECT cor_clara, cor_escura FROM temas WHERE ativo = 1 LIMIT 1";
$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $tema = $resultado->fetch_assoc();
    $corClara = $tema['cor_clara'];
    $corEscura = $tema['cor_escura'];
} else {
    // Caso não exista tema ativo no banco, usa um fallback de segurança
    $corClara = '#f0d9b5';
    $corEscura = '#b58863';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xadrez</title>
    <link rel="icon" href="<?= base_url('img/rs/bingus.png') ?>" type="image/png">
    <link rel="stylesheet" href="<?= base_url('css/xadrez.css') ?>">

    <!-- Injeta EXCLUSIVAMENTE as cores vindas da consulta SQL -->
    <style>
        .casa.clara {
            background-color: <?= $corClara ?> !important;
        }
        .casa.escura {
            background-color: <?= $corEscura ?> !important;
        }
    </style>
</head>
<body>
    <main class="jogo">

        <!-- ============================== TABULEIRO ============================== -->

        <section class="tabuleiro-container">
            <div id="tabuleiro"></div>
        </section>

        <!-- ============================== HISTÓRICO DE JOGADAS ============================== -->

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

    <!-- ============================== PROMOÇÃO DE PEÃO ============================== -->

    <div id="promocao" class="promocao-overlay">
        <div class="promocao-caixa">
            <h2>Promover peão</h2>
            <p>Escolha uma peça</p>
            <div id="opcoesPromocao" class="opcoes-promocao" ></div>
        </div>
    </div>

    <!-- ============================== BASE URL ============================== -->

    <script>
        const baseUrl = "<?= base_url('/') ?>";
    </script>

    <!-- ============================== JAVASCRIPT ============================== -->

    <script src="<?= base_url('js/xadrez.js') ?>" ></script>
</body>
</html>