---
title: GitHub Actionsで毎週自動でPageSpeed Insightsのスコアをメール通知する
tags: GitHubActions PageSpeedInsights Lighthouse Gmail CI
---

## はじめに

前回の記事では、[PSI APIを使ってCLIで全ページのLighthouseスコアを一括チェックするツール](※前回記事のURLに差し替え)を作りました。

今回はこれを**GitHub Actionsで毎週自動実行**して、結果を**Gmailで受け取る**仕組みを作ります。

### 完成イメージ

毎週日曜0:00にこんなメールが届きます:

```
Weekly PSI Report for example.com
Generated: 2026-03-18 00:00 JST
================================================

PageSpeed Insights (mobile)

Checking...

/          | 🟠 Perf:  80 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
/about/    | 🟠 Perf:  78 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
/contact/  | 🟠 Perf:  65 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100

================================================

PageSpeed Insights (desktop)

Checking...

/          | 🟢 Perf:  96 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
/about/    | 🟢 Perf:  98 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
/contact/  | 🟢 Perf:  92 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
```

PCの電源に依存せず、放っておけば毎週スコアの定点観測ができます。

## 前提

- 前回の記事で作った `scripts/psi-check.mjs` がリポジトリにある
- PSI APIキーを取得済み
- GitHubリポジトリがある

## 準備

### 1. Gmailのアプリパスワードを発行

GitHub ActionsからGmail SMTPでメールを送るため、アプリパスワードが必要です。

1. [Googleアカウント](https://myaccount.google.com/) にアクセス
2. 「セキュリティ」→「2段階認証プロセス」（未設定なら先に有効化）
3. 「アプリパスワード」→ アプリ名を入力（例: `psi-report`）→ 生成
4. 表示された16文字のパスワードを控える

### 2. GitHub Secretsに登録

リポジトリの Settings → Secrets and variables → Actions → 「New repository secret」で以下の3つを追加します。

| Secret名 | 値 |
|---|---|
| `PSI_API_KEY` | PageSpeed Insights APIキー |
| `GMAIL_ADDRESS` | 送信元＆送信先のGmailアドレス |
| `GMAIL_APP_PASSWORD` | 手順1で発行したアプリパスワード |

> APIキーやパスワードをコードに直書きせず、Secretsで管理することでセキュリティを担保します。

## ワークフローの作成

`.github/workflows/psi-report.yml` を作成します。

```yaml
name: Weekly PSI Report

on:
  schedule:
    - cron: '0 15 * * 6'  # 毎週日曜 0:00 JST（土曜 15:00 UTC）
  workflow_dispatch:  # 手動実行ボタン

jobs:
  psi-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Create .env.local
        run: echo "PSI_API_KEY=${{ secrets.PSI_API_KEY }}" > .env.local

      - name: Run PSI Check (Mobile)
        run: node scripts/psi-check.mjs mobile > mobile-result.txt 2>&1

      - name: Run PSI Check (Desktop)
        run: node scripts/psi-check.mjs desktop > desktop-result.txt 2>&1

      - name: Build email body
        run: |
          DATE=$(TZ=Asia/Tokyo date '+%Y-%m-%d %H:%M JST')
          {
            echo "Weekly PSI Report for example.com"
            echo "Generated: ${DATE}"
            echo "================================================"
            echo ""
            cat mobile-result.txt
            echo ""
            echo "================================================"
            echo ""
            cat desktop-result.txt
          } > email-body.txt

      - name: Send Report Email
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          secure: true
          username: ${{ secrets.GMAIL_ADDRESS }}
          password: ${{ secrets.GMAIL_APP_PASSWORD }}
          subject: "[PSI] Weekly Report - example.com"
          to: ${{ secrets.GMAIL_ADDRESS }}
          from: ${{ secrets.GMAIL_ADDRESS }}
          body: file://email-body.txt
```

## ポイント解説

### cronのタイムゾーン

GitHub Actionsのcronは**UTC基準**です。日本時間（JST = UTC+9）で日曜0:00に実行したい場合:

```
日曜 0:00 JST = 土曜 15:00 UTC
```

```yaml
cron: '0 15 * * 6'  # 6 = Saturday(UTC) → Sunday 0:00(JST)
```

よくある間違いとして `0 0 * * 0`（UTC日曜0:00）にすると、JST日曜9:00の実行になります。

### workflow_dispatch

```yaml
on:
  workflow_dispatch:
```

これを入れておくと、GitHubのActionsタブから「Run workflow」ボタンで**手動実行**できます。セットアップ直後の動作確認に便利です。

### .env.localの動的生成

```yaml
- name: Create .env.local
  run: echo "PSI_API_KEY=${{ secrets.PSI_API_KEY }}" > .env.local
```

`.env.local` はリポジトリに含めない（`.gitignore`対象）ため、ワークフロー内でSecretsから動的に生成しています。

### メール送信アクション

[dawidd6/action-send-mail](https://github.com/dawidd6/action-send-mail) を使用しています。Gmail SMTPの設定:

| 項目 | 値 |
|---|---|
| server_address | smtp.gmail.com |
| server_port | 465 |
| secure | true |

`body: file://email-body.txt` でファイルの内容をそのままメール本文にできます。

## 動作確認

1. ワークフローファイルをcommit & push
2. GitHubのリポジトリ → Actionsタブ
3. 「Weekly PSI Report」→「Run workflow」→「Run workflow」
4. 数分後にGmailに結果が届く

## カスタマイズ例

### 実行頻度を変える

```yaml
# 毎日0:00 JST
cron: '0 15 * * *'

# 月曜と木曜の0:00 JST
cron: '0 15 * * 0,3'

# 毎月1日の0:00 JST
cron: '0 15 1 * *'
```

### 送信先を複数にする

```yaml
to: user1@example.com, user2@example.com
```

### モバイルだけにする

Desktop不要なら該当stepを削除するだけです。

## 費用

すべて無料枠で運用できます。

| サービス | 無料枠 |
|---|---|
| GitHub Actions | 2,000分/月（publicリポジトリは無制限） |
| PSI API | 25,000回/日 |
| Gmail SMTP | 500通/日 |

週1回の実行なら余裕です。

## まとめ

- GitHub Actions + Gmail SMTPで**完全自動のPSIレポート**を実現
- Secretsで認証情報を安全に管理
- `workflow_dispatch` で手動実行もできる
- 費用ゼロで運用可能
- 前回作ったCLIツールをそのまま再利用

定期的にスコアを確認する習慣がなくても、メールが届けば嫌でも目に入ります。サイト品質の劣化に早く気づけるのが最大のメリットです。
