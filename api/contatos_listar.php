<?php
// api/contatos_listar.php

// Exibir erros em ambiente de desenvolvimento
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Só aceita GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use GET.'
    ]);
    exit;
}

require __DIR__ . '/config.php';

try {
    $sql = "SELECT id, nome, email, telefone, mensagem, criado_em
            FROM contatos
            ORDER BY criado_em DESC";

    $stmt = $pdo->query($sql);
    $contatos = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $contatos
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar contatos: ' . $e->getMessage()
    ]);
}
