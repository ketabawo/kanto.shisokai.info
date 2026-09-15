<?php
// 「最新情報を反映」ボタンから叩かれるエンドポイント。
// GitHub Actions の workflow_dispatch を起動するだけの薄いプロキシ。
// トークンは同ディレクトリの config.php (git管理外) に保管する。

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'config.php not found']);
    exit;
}

$config = require $configPath;

$url = sprintf(
    'https://api.github.com/repos/%s/%s/actions/workflows/%s/dispatches',
    $config['github_owner'],
    $config['github_repo'],
    $config['workflow_file']
);

$payload = json_encode(['ref' => 'main']);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Accept: application/vnd.github+json',
        'Authorization: Bearer ' . $config['github_token'],
        'X-GitHub-Api-Version: 2022-11-28',
        'User-Agent: shisokai-dashboard',
        'Content-Type: application/json',
    ],
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'curl error: ' . $curlError]);
    exit;
}

// GitHubのdispatchは成功時 204 No Content
if ($httpCode === 204) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code($httpCode ?: 500);
    echo json_encode(['error' => 'GitHub API error', 'status' => $httpCode, 'body' => $response]);
}
