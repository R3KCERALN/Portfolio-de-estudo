<?php
// api/contato_deletar.php

// Exibir erros em ambiente de desenvolvimento
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Garante que o método seja POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use POST.'
    ]);
    exit;
}

require __DIR__ . '/config.php';

// Lê o corpo da requisição (JSON enviado pelo fetch)
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!is_array($data) || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dados inválidos. Envie JSON com o campo id.'
    ]);
    exit;
}

$id = (int) $data['id'];

// Validação básica
if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ID inválido.'
    ]);
    exit;
}

try {
    $sql = "DELETE FROM contatos WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Contato não encontrado.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Contato excluído com sucesso.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao excluir contato: ' . $e->getMessage()
    ]);
}
