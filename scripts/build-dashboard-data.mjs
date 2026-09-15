import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';
const PSI_API_KEY = envContent.match(/PSI_API_KEY=(.+)/)?.[1]?.trim() || process.env.PSI_API_KEY;

const BASE_URL = 'https://kanto.shisokai.info';
const SITE_URL = `${BASE_URL}/`;
const OUT_PATH = resolve(__dirname, '..', 'data', 'dashboard-data.json');
const HISTORY_LIMIT = 12; // 直近12回分のトレンドを保持

async function getSitemapPaths() {
  const fallback = ['/', '/about/', '/voices/', '/media/', '/faqs/', '/contact/', '/history/', '/history/1st/', '/history/2nd/', '/history/3rd/', '/history/4th/', '/history/5th/', '/history/6th/'];
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
    if (paths.length === 0) throw new Error('no <loc> found');
    return paths;
  } catch (err) {
    console.warn(`[build-dashboard-data] sitemap.xml取得に失敗、フォールバック使用: ${err.message}`);
    return fallback;
  }
}

// ---- PSI ----
// PSI(Lighthouse)は「Something went wrong」的な一時的失敗を時々返すため、リトライする
async function checkPagePSI(url, strategy, attempt = 1) {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${PSI_API_KEY}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    const errText = await res.text();
    if (attempt < 3) {
      console.warn(`[PSI ${strategy}] ${url} attempt ${attempt} failed, retrying...`);
      await new Promise((r) => setTimeout(r, 5000));
      return checkPagePSI(url, strategy, attempt + 1);
    }
    return { error: errText };
  }
  const data = await res.json();
  const cats = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};

  const failures = [];
  for (const [catKey, cat] of Object.entries(cats)) {
    for (const ref of cat.auditRefs || []) {
      const audit = audits[ref.id];
      if (audit && audit.score !== null && audit.score < 1) {
        failures.push({
          cat: catKey,
          id: ref.id,
          title: audit.title,
          score: Math.round(audit.score * 100)
        });
      }
    }
  }

  return {
    performance: Math.round((cats.performance?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
    failures
  };
}

const catNames = { performance: 'Perf', accessibility: 'A11y', 'best-practices': 'BP', seo: 'SEO' };

// psi-check.mjs と同じ「こちらでは修正不可(サードパーティ/サーバー起因)」の一覧
const unfixable = new Set([
  'uses-long-cache-ttl',
  'cache-insight',
  'forced-reflow-insight',
  'critical-request-chains',
  'network-dependency-tree-insight',
  'unused-javascript',
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

function severityOf(score) {
  if (score === 0) return 'high';
  if (score < 50) return 'mid';
  if (score < 90) return 'low';
  return 'good';
}

// 同時実行数を絞った並列実行(PSIは1件あたり15〜40秒かかる実処理のため、逐次だと26回で数分〜十数分かかる)
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function fetchAllPSI(paths, strategies, concurrency = 8) {
  const jobs = strategies.flatMap((strategy) => paths.map((path) => ({ path, strategy })));
  const results = await mapWithConcurrency(jobs, concurrency, async ({ path, strategy }) => {
    const r = await checkPagePSI(`${BASE_URL}${path}`, strategy);
    if (r.error) console.warn(`[PSI ${strategy}] ${path} error: ${r.error}`);
    return { path, strategy, r };
  });
  const map = new Map();
  for (const { path, strategy, r } of results) {
    map.set(`${strategy}::${path}`, r);
  }
  return map;
}

function buildStrategyData(paths, strategy, resultsMap) {
  const latestScores = [];
  const taskMap = new Map();

  for (const path of paths) {
    const r = resultsMap.get(`${strategy}::${path}`);
    if (!r || r.error) continue;
    latestScores.push({ name: path, performance: r.performance, accessibility: r.accessibility, bestPractices: r.bestPractices, seo: r.seo });

    for (const f of r.failures) {
      const key = `${f.cat}::${f.id}`;
      if (!taskMap.has(key)) {
        taskMap.set(key, { cat: catNames[f.cat] || f.cat, severity: severityOf(f.score), fixable: unfixable.has(f.id) ? 'EXTERNAL' : 'FIXABLE', title: f.title, pages: new Set() });
      }
      taskMap.get(key).pages.add(path);
    }
  }

  const issues = [...taskMap.values()].map(t => ({
    cat: t.cat,
    severity: t.severity,
    fixable: t.fixable,
    title: t.title,
    pages: t.pages.size === paths.length ? 'all pages' : [...t.pages].join(', ')
  }));

  return { latestScores, issues };
}

// ---- Search Console URL Inspection ----
function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGscAccessToken() {
  const keyPath = resolve(__dirname, '..', 'gcp-service-account.json');
  if (!existsSync(keyPath)) {
    console.warn('[build-dashboard-data] gcp-service-account.json が無いため、インデックス状況はスキップ');
    return null;
  }
  const sa = JSON.parse(readFileSync(keyPath, 'utf-8'));
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`GSCトークン取得失敗: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function buildIndexStatus(paths) {
  const token = await getGscAccessToken();
  if (!token) return [];

  const results = [];
  for (const path of paths) {
    const url = `${BASE_URL}${path}`;
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL })
    });
    const data = await res.json();
    if (!res.ok) {
      console.warn(`[GSC] ${path} error: ${data.error?.message}`);
      results.push({ name: path, coverageState: 'エラー', lastCrawlTime: null });
    } else {
      const r = data.inspectionResult?.indexStatusResult || {};
      results.push({
        name: path,
        coverageState: r.coverageState || '不明',
        lastCrawlTime: r.lastCrawlTime ? r.lastCrawlTime.slice(0, 10) : null
      });
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}

// ---- main ----
const paths = await getSitemapPaths();

console.log('Running PSI + Search Console URL Inspection (parallel, independent data sources)...');
const [psiResults, indexStatus] = await Promise.all([
  fetchAllPSI(paths, ['mobile', 'desktop']),
  buildIndexStatus(paths),
]);
const mobile = buildStrategyData(paths, 'mobile', psiResults);
const desktop = buildStrategyData(paths, 'desktop', psiResults);

const today = new Date().toISOString().slice(0, 10);

let history = { mobile: [], desktop: [] };
if (existsSync(OUT_PATH)) {
  try {
    const prev = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));
    if (prev.history) history = prev.history;
  } catch { /* ignore, start fresh */ }
}

function pushHistory(arr, strategyData) {
  const home = strategyData.latestScores.find(s => s.name === '/');
  if (!home) {
    console.warn('[build-dashboard-data] ホームページのPSI取得に失敗したため、今回の履歴追加をスキップ');
    return arr;
  }
  const next = [...arr, {
    date: today,
    performance: home.performance,
    accessibility: home.accessibility,
    bestPractices: home.bestPractices,
    seo: home.seo
  }];
  return next.slice(-HISTORY_LIMIT);
}

history.mobile = pushHistory(history.mobile, mobile);
history.desktop = pushHistory(history.desktop, desktop);

const output = {
  generatedAt: new Date().toISOString(),
  mobile,
  desktop,
  indexStatus,
  history
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
console.log(`Wrote ${OUT_PATH}`);
