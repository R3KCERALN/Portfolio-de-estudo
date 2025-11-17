<?php
// api/config.php

// Configurações de conexão com o banco de dados
$host = 'localhost';
$db   = 'portfolio';
$user = 'root';
$pass = ''; // padrão do XAMPP: root sem senha

$dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // lança exceção em caso de erro
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // retorna resultados como array associativo
    PDO::ATTR_EMULATE_PREPARES   => false,                  // usa prepared statements nativos do MySQL
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        // Em produção você esconderia a mensagem técnica:
        // 'message' => 'Erro ao conectar ao banco de dados.'
        'message' => 'Erro ao conectar ao banco: ' . $e->getMessage()
    ]);

    exit;
}
