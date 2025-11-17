<?php
// api/contato.php

// Exibir erros em desenvolvimento (útil enquanto está local)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Só aceita POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use POST.'
    ]);
    exit;
}

require __DIR__ . '/config.php';

// Lê o JSON enviado pelo fetch do main.js
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dados inválidos. Envie um JSON.'
    ]);
    exit;
}

$nome     = isset($data['nome']) ? trim($data['nome']) : '';
$email    = isset($data['email']) ? trim($data['email']) : '';
$telefone = isset($data['telefone']) ? trim($data['telefone']) : '';
$mensagem = isset($data['mensagem']) ? trim($data['mensagem']) : '';

// Validação básica
if ($nome === '' || $email === '' || $mensagem === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Nome, e-mail e mensagem são obrigatórios.'
    ]);
    exit;
}

try {
    $sql = "INSERT INTO contatos (nome, email, telefone, mensagem)
            VALUES (:nome, :email, :telefone, :mensagem)";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':nome', $nome);
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':telefone', $telefone);
    $stmt->bindValue(':mensagem', $mensagem);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Contato enviado com sucesso! Em breve entrarei em contato.'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        // Em produção você poderia ocultar o erro técnico:
        // 'message' => 'Erro ao salvar contato. Tente novamente mais tarde.'
        'message' => 'Erro ao salvar contato: ' . $e->getMessage()
    ]);
}
