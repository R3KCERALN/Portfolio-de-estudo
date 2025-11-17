<?php
// api/contato_atualizar.php

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

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dados inválidos. Envie JSON.'
    ]);
    exit;
}

$id       = isset($data['id']) ? (int) $data['id'] : 0;
$nome     = isset($data['nome']) ? trim($data['nome']) : '';
$email    = isset($data['email']) ? trim($data['email']) : '';
$telefone = isset($data['telefone']) ? trim($data['telefone']) : '';
$mensagem = isset($data['mensagem']) ? trim($data['mensagem']) : '';

// Validação básica
if ($id <= 0 || $nome === '' || $email === '' || $mensagem === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ID, nome, e-mail e mensagem são obrigatórios.'
    ]);
    exit;
}

try {
    $sql = "UPDATE contatos
            SET nome = :nome,
                email = :email,
                telefone = :telefone,
                mensagem = :mensagem
            WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':nome', $nome);
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':telefone', $telefone);
    $stmt->bindValue(':mensagem', $mensagem);
    $stmt->execute();

    // rowCount() pode ser 0 se:
    // - o ID não existir, ou
    // - os dados enviados forem exatamente iguais aos que já estavam no banco
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Nenhuma alteração realizada (dados iguais ou ID inexistente).'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Contato atualizado com sucesso.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao atualizar contato: ' . $e->getMessage()
    ]);
}
