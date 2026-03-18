---
title: Node.jsスクリプト1本で全ページのLighthouseスコアを一括チェックするCLIツールを作った
tags: PageSpeedInsights Lighthouse Node.js SEO パフォーマンス
---

## はじめに

サイトのパフォーマンスやSEOスコアを定期的にチェックしたいけど、毎回PageSpeed Insightsを開いて1ページずつ確認するのは面倒。

そこで、**PSI（PageSpeed Insights）APIをNode.jsから叩いて、全ページのスコアを一括取得するCLIツール**を作りました。

### できること

- 全ページのPerf / A11y / BP / SEOスコアを一括取得
- モバイル / デスクトップの切り替え
- 指摘項目を重要度アイコン付きでリスト化
- `[FIXABLE]` / `[EXTERNAL]` タグで対応可否を判別
- `--details` フラグで指摘の詳細を表示
- 外部URLの指定にも対応（他サイトのチェックも可能）

### 出力イメージ

```
PageSpeed Insights (mobile)

/          | 🟢 Perf:  92 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
/about/    | 🟠 Perf:  78 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
/contact/  | 🟠 Perf:  65 | 🟢 A11y: 100 | 🟢 BP: 100 | 🟢 SEO: 100
---
Average    |    Perf:  78 |    A11y: 100 |    BP: 100 |    SEO: 100


Tasks (5)

[Perf]
   1. 🔴 [EXTERNAL] Reduce unused JavaScript (0) — all pages
   2. 🟠 [FIXABLE] First Contentful Paint (49) — /contact/
   3. 🟡 [FIXABLE] Largest Contentful Paint (51) — /, /about/
   4. 🟡 [EXTERNAL] Total Blocking Time (65) — /contact/
   5. 🟢 [EXTERNAL] Max Potential First Input Delay (95) — all pages
```

## 準備

### 1. PSI APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成（または既存のものを使用）
2. 「APIとサービス」→「ライブラリ」→ **PageSpeed Insights API** を有効化
3. 「認証情報」→「認証情報を作成」→「APIキー」でキーを発行
4. 必要に応じてAPIキーの制限を設定（PageSpeed Insights APIのみに制限を推奨）

### 2. プロジェクトセットアップ

```bash
mkdir psi-checker && cd psi-checker
npm init -y
```

`.env.local` にAPIキーを保存:

```
PSI_API_KEY=your_api_key_here
```

`package.json` に npm script を追加:

```json
{
  "scripts": {
    "checkpsi": "node scripts/psi-check.mjs"
  }
}
```

## スクリプト本体

`scripts/psi-check.mjs` を作成します。

### APIキーの読み込み

dotenvなどの外部パッケージは使わず、`.env.local`を直接パースしています。依存ゼロで動きます。

```js
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const API_KEY = envContent.match(/PSI_API_KEY=(.+)/)?.[1]?.trim();

if (!API_KEY) {
  console.error('PSI_API_KEY not found in .env.local');
  process.exit(1);
}
```

### 対象ページの設定と引数パース

デフォルトのチェック対象を定義しつつ、コマンドライン引数で柔軟に変更できるようにしています。

```js
const BASE_URL = 'https://example.com';
const PATHS = ['/', '/about/', '/contact/'];
const PAGES = PATHS.map(p => ({ name: p, url: `${BASE_URL}${p}` }));

// Usage: node psi-check.mjs [mobile|desktop] [--details] [/path ... | https://...]
const args = process.argv.slice(2);
const strategy = (args[0] === 'mobile' || args[0] === 'desktop') ? args.shift() : 'mobile';
const showDetails = args.includes('--details');
const restArgs = args.filter(a => a !== '--details');

const externalUrls = restArgs.filter(a => /^https?:\/\//.test(a));
const pageFilter = restArgs.filter(a => !/^https?:\/\//.test(a)).map(a => a.toLowerCase());

const normalize = (s) => s === '/' ? '/' : s.replace(/\/+$/, '');

let pages;
if (externalUrls.length > 0) {
  // 外部URL指定 → そのURLをチェック
  pages = externalUrls.map(url => {
    const u = new URL(url);
    return { name: u.pathname || '/', url };
  });
} else if (pageFilter.length > 0) {
  // パス指定 → デフォルトからフィルタ
  pages = PAGES.filter(p => pageFilter.some(f => normalize(p.name) === normalize(f)));
} else {
  // 指定なし → 全ページ
  pages = PAGES;
}
```

ポイント:
- 第1引数が `mobile` / `desktop` ならstrategyとして取得、省略時は `mobile`
- `https://` で始まる引数は外部URLとして扱う
- `/about` のようなパスは、デフォルトページからフィルタ
- trailing slashの有無を `normalize()` で吸収

### 対応不可な指摘を分類する

Lighthouseの指摘には、サーバーやサードパーティに起因するものが含まれます。これらは自分では対処できないため、`[EXTERNAL]` タグで明示します。

```js
const unfixable = new Set([
  'uses-long-cache-ttl',
  'cache-insight',
  'forced-reflow-insight',
  'critical-request-chains',
  'network-dependency-tree-insight',
  'unused-javascript',           // GA / reCAPTCHA等のバンドル
  'total-byte-weight',
  'mainthread-work-breakdown',
  'bootup-time',
  'total-blocking-time',
  'max-potential-fid',
  'font-display',
  'font-display-insight',
  'server-response-time',
  'redirects',
  'document-request-latency',
]);
```

> **注意**: Lighthouseのバージョンアップでaudit IDが変わることがあります（例: `font-display` → `font-display-insight`）。新旧どちらのIDも入れておくと安全です。

### 重要度アイコン

スコアに応じて視覚的に重要度を表現します。

```js
const taskIcon = (score) => {
  const s = score !== null ? Math.round(score * 100) : 0;
  if (s === 0) return '🔴';
  if (s < 50) return '🟠';
  if (s < 90) return '🟡';
  return '🟢';
};
```

### PSI APIの呼び出し

```js
async function checkPage(page) {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?` +
    `url=${encodeURIComponent(page.url)}&key=${API_KEY}&strategy=${strategy}` +
    `&category=performance&category=accessibility&category=best-practices&category=seo`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    const err = await res.text();
    return { name: page.name, url: page.url, error: err };
  }
  const data = await res.json();
  const cats = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};

  // スコア未達のauditを抽出
  const failures = {};
  for (const [catKey, cat] of Object.entries(cats)) {
    const failed = (cat.auditRefs || [])
      .filter(ref => {
        const audit = audits[ref.id];
        return audit && audit.score !== null && audit.score < 1;
      })
      .map(ref => {
        const audit = audits[ref.id];
        const rawItems = Array.isArray(audit.details?.items) ? audit.details.items : [];
        const details = rawItems.map(item => {
          const parts = [];
          if (item.node?.selector) parts.push(`selector: ${item.node.selector}`);
          if (item.node?.snippet) parts.push(`html: ${item.node.snippet.slice(0, 120)}`);
          if (item.url) parts.push(`url: ${item.url.slice(0, 100)}`);
          if (item.totalBytes) parts.push(`size: ${(item.totalBytes / 1024).toFixed(1)}KB`);
          if (item.wastedMs) parts.push(`wasted: ${Math.round(item.wastedMs)}ms`);
          if (item.wastedBytes) parts.push(`wasted: ${(item.wastedBytes / 1024).toFixed(1)}KB`);
          return parts.length > 0 ? parts.join(' | ') : null;
        }).filter(Boolean);
        return { id: ref.id, title: audit.title, score: audit.score, details };
      })
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    if (failed.length > 0) failures[catKey] = failed;
  }

  return {
    name: page.name,
    url: page.url,
    performance: Math.round((cats.performance?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
    failures,
  };
}
```

`audit.details.items` は配列でない場合があるため、`Array.isArray()` でガードしています。ここを `(audit.details?.items || [])` としていると `TypeError` が出ることがあるので注意。

### 結果の出力

```js
const icon = (score) => score >= 90 ? '🟢' : score >= 50 ? '🟠' : '🔴';
const catNames = { performance: 'Perf', accessibility: 'A11y', 'best-practices': 'BP', seo: 'SEO' };

console.log(`\nPageSpeed Insights (${strategy})\n`);
console.log('Checking...\n');

const results = [];
for (const page of pages) {
  const result = await checkPage(page);
  if (result.error) {
    console.log(`X ${result.name}: Error - ${result.error}`);
  } else {
    console.log(
      `${result.name.padEnd(10)} | ` +
      `${icon(result.performance)} Perf: ${String(result.performance).padStart(3)} | ` +
      `${icon(result.accessibility)} A11y: ${String(result.accessibility).padStart(3)} | ` +
      `${icon(result.bestPractices)} BP: ${String(result.bestPractices).padStart(3)} | ` +
      `${icon(result.seo)} SEO: ${String(result.seo).padStart(3)}`
    );
  }
  results.push(result);
}
```

### タスクの集約と表示

複数ページで共通する指摘をまとめて、影響範囲を一覧化します。

```js
const taskMap = new Map();
for (const result of results) {
  if (!result.failures) continue;
  for (const [cat, items] of Object.entries(result.failures)) {
    for (const item of items) {
      const key = `${cat}::${item.id}`;
      if (!taskMap.has(key)) {
        taskMap.set(key, { cat, id: item.id, title: item.title, score: item.score, pages: [], details: [] });
      }
      const task = taskMap.get(key);
      task.pages.push(result.name);
      if (item.score < task.score) task.score = item.score;
      if (item.details?.length > 0) {
        task.details.push({ page: result.name, items: item.details });
      }
    }
  }
}

if (taskMap.size > 0) {
  console.log(`\n\nTasks (${taskMap.size})\n`);

  const byCat = {};
  for (const task of taskMap.values()) {
    const cn = catNames[task.cat] || task.cat;
    if (!byCat[cn]) byCat[cn] = [];
    byCat[cn].push(task);
  }

  let i = 1;
  for (const [cn, tasks] of Object.entries(byCat)) {
    console.log(`[${cn}]`);
    for (const task of tasks) {
      const score = task.score !== null ? ` (${Math.round(task.score * 100)})` : '';
      const affected = task.pages.length === pages.length ? 'all pages' : task.pages.join(', ');
      const sev = taskIcon(task.score);
      const fix = unfixable.has(task.id) ? ' [EXTERNAL]' : ' [FIXABLE]';
      console.log(`  ${String(i++).padStart(2)}. ${sev}${fix} ${task.title}${score} — ${affected}`);
      if (showDetails) {
        for (const d of task.details) {
          const prefix = task.details.length > 1 ? `      [${d.page}]` : '     ';
          for (const line of d.items) {
            console.log(`${prefix} - ${line}`);
          }
        }
      }
    }
  }
}
```

## 使い方

```bash
# モバイル（デフォルト）で全ページチェック
npm run checkpsi

# デスクトップで全ページチェック
npm run checkpsi -- desktop

# 特定ページだけチェック
npm run checkpsi -- mobile /about/

# 指摘の詳細を表示
npm run checkpsi -- mobile --details

# 外部サイトをチェック
npm run checkpsi -- mobile https://example.com/

# 外部サイトの複数ページをチェック
npm run checkpsi -- desktop https://example.com/ https://example.com/about/
```

> `npm run` 経由で引数を渡す場合は `--` が必要です。

## ハマりポイント

### audit.details.items が配列でないことがある

PSI APIのレスポンスで `audit.details.items` がオブジェクトや `undefined` の場合があります。

```js
// NG: TypeErrorが出る
const items = (audit.details?.items || []).map(...)

// OK: Array.isArray()でガード
const rawItems = Array.isArray(audit.details?.items) ? audit.details.items : [];
```

### Lighthouse audit IDがバージョンで変わる

Lighthouseのメジャーバージョンアップでaudit IDが変更されることがあります。

| 旧ID | 新ID |
|---|---|
| `font-display` | `font-display-insight` |
| `uses-long-cache-ttl` | `cache-insight` |

unfixableリストには新旧両方のIDを入れておくと安全です。

### URLのtrailing slash

PSI APIに渡すURLで、trailing slashの有無でリダイレクトが発生するとスコアが下がります。実際のサイトのURL構成に合わせて統一しましょう。

## まとめ

- 外部パッケージ **依存ゼロ** で動く（Node.js 18+のfetch対応が前提）
- `npm run checkpsi` 一発で全ページのスコアを確認できる
- `[FIXABLE]` / `[EXTERNAL]` の分類で「何に手をつけるべきか」が明確になる
- 外部URL対応で、他のプロジェクトでもそのまま使い回せる

定期的にチェックしてスコアの推移を見るだけでも、サイト品質の維持に役立ちます。
