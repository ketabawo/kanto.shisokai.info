<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  let trendCanvas: HTMLCanvasElement;
  let trendChart: Chart;
  let strategy: 'mobile' | 'desktop' = 'mobile';

  const DATA_URL = 'https://raw.githubusercontent.com/ketabawo/kanto.shisokai.info/main/data/dashboard-data.json';

  let loading = true;
  let loadError = '';
  let generatedAt = '';
  let dashboardData: any = null;

  let refreshing = false;
  let refreshMessage = '';
  let polling = false;

  async function loadData() {
    loading = true;
    loadError = '';
    try {
      const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      dashboardData = await res.json();
      generatedAt = dashboardData.generatedAt;
    } catch (err: any) {
      loadError = `データの取得に失敗しました: ${err.message}`;
    } finally {
      loading = false;
    }
  }

  // ワークフロー完了で generatedAt が更新されるまでポーリングし、検知したら自動反映する
  async function pollForUpdate(prevGeneratedAt: string) {
    polling = true;
    const start = Date.now();
    const timeoutMs = 5 * 60 * 1000;
    const intervalMs = 20 * 1000;
    while (Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, intervalMs));
      try {
        const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.generatedAt !== prevGeneratedAt) {
            dashboardData = data;
            generatedAt = data.generatedAt;
            renderChart();
            refreshMessage = '✅ 最新データを反映しました。';
            polling = false;
            return;
          }
        }
      } catch {
        // 一時的な取得失敗は無視してポーリング継続
      }
    }
    refreshMessage = '⚠️ 反映確認がタイムアウトしました。手動で再読み込みしてください。';
    polling = false;
  }

  async function requestRefresh() {
    refreshing = true;
    refreshMessage = '';
    const prevGeneratedAt = generatedAt;
    try {
      const res = await fetch('/dashboards/refresh.php', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        refreshMessage = '✅ リクエストしました。反映を自動で確認しています…';
        pollForUpdate(prevGeneratedAt);
      } else {
        refreshMessage = `❌ リクエスト失敗: ${data.error || res.status}`;
      }
    } catch (err: any) {
      refreshMessage = `❌ リクエスト失敗: ${err.message}`;
    } finally {
      refreshing = false;
    }
  }

  $: indexStatus = dashboardData?.indexStatus ?? [];

  function indexIcon(state: string) {
    const s = (state || '').toLowerCase();
    if (s.includes('unknown')) return '❌';
    if (s.includes('not indexed') || s.includes('excluded')) return '🔴';
    if (s.includes('indexed')) return '🟢';
    return '🟡';
  }

  $: indexedCount = indexStatus.filter((r: any) => r.coverageState.toLowerCase().includes('indexed') && !r.coverageState.toLowerCase().includes('not indexed')).length;

  function historyForChart(strategyKey: 'mobile' | 'desktop') {
    const arr = dashboardData?.history?.[strategyKey] ?? [];
    return {
      dates: arr.map((h: any) => h.date),
      performance: arr.map((h: any) => h.performance),
      accessibility: arr.map((h: any) => h.accessibility),
      bestPractices: arr.map((h: any) => h.bestPractices),
      seo: arr.map((h: any) => h.seo)
    };
  }

  $: latestScores = dashboardData?.[strategy]?.latestScores ?? [];

  let scorePage = 0;
  const scoresPerPage = 10;

  type SortKey = 'name' | 'performance' | 'accessibility' | 'bestPractices' | 'seo';
  let sortKey: SortKey = 'name';
  let sortDir: 1 | -1 = 1;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 1 ? -1 : 1;
    } else {
      sortKey = key;
      sortDir = 1;
    }
    scorePage = 0;
  }

  $: sortedScores = [...latestScores].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === 'string' || typeof bv === 'string') {
      return String(av).localeCompare(String(bv)) * sortDir;
    }
    return ((av as number) - (bv as number)) * sortDir;
  });
  $: scorePageCount = Math.ceil(sortedScores.length / scoresPerPage);
  $: pagedScores = sortedScores.slice(scorePage * scoresPerPage, (scorePage + 1) * scoresPerPage);

  $: issues = dashboardData?.[strategy]?.issues ?? [];

  const severityIcon = (s: string) => s === 'high' ? '🔴' : s === 'mid' ? '🟠' : s === 'good' ? '🟢' : '🟡';
  const severityRank: Record<string, number> = { high: 0, mid: 1, low: 2, good: 3 };
  const severityLabel: Record<string, string> = { high: '深刻', mid: '要改善', low: 'やや不足', good: '良好' };

  // 表示フィルタ(チェックが入ってるものだけ表示)。良好・EXTERNALはデフォルト非表示。
  let filters = {
    high: true,
    mid: true,
    low: true,
    good: false,
    FIXABLE: true,
    EXTERNAL: false
  };

  $: sortedIssues = [...issues]
    .filter(i => filters[i.severity] && filters[i.fixable])
    .sort((a, b) => {
      const fixDiff = (a.fixable === 'FIXABLE' ? 0 : 1) - (b.fixable === 'FIXABLE' ? 0 : 1);
      if (fixDiff !== 0) return fixDiff;
      return severityRank[a.severity] - severityRank[b.severity];
    });
  $: fixableCount = issues.filter(i => i.fixable === 'FIXABLE').length;

  function scoreClass(score: number) {
    if (score >= 90) return 'good';
    if (score >= 50) return 'mid';
    return 'bad';
  }

  function renderChart() {
    if (!trendCanvas) return;
    const data = historyForChart(strategy);
    if (trendChart) trendChart.destroy();
    const ctx = trendCanvas.getContext('2d');
    if (!ctx) return;
    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.dates,
        datasets: [
          { label: 'Perf', data: data.performance, borderColor: '#eb1000', backgroundColor: 'rgba(235,16,0,0.1)', tension: 0.3 },
          { label: 'A11y', data: data.accessibility, borderColor: '#0969da', backgroundColor: 'rgba(9,105,218,0.1)', tension: 0.3 },
          { label: 'BP', data: data.bestPractices, borderColor: '#2da44e', backgroundColor: 'rgba(45,164,78,0.1)', tension: 0.3 },
          { label: 'SEO', data: data.seo, borderColor: '#9a6700', backgroundColor: 'rgba(154,103,0,0.1)', tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } },
        plugins: { legend: { position: 'top' } }
      }
    });
  }

  function setStrategy(s: 'mobile' | 'desktop') {
    strategy = s;
    scorePage = 0;
    renderChart();
  }

  onMount(async () => {
    await loadData();
    renderChart();
  });
</script>

<svelte:head>
  <title>サイトヘルスダッシュボード（管理用）</title>
  <meta name="robots" content="noindex, nofollow">
</svelte:head>

<section class="dashboard">
  <div class="container">
    <h1>サイトヘルスダッシュボード</h1>
    <p class="note">
      このページは <code>noindex</code> 指定・ナビ非掲載の非公開URLです。
    </p>

    <div class="refreshRow">
      <button on:click={requestRefresh} disabled={refreshing || polling}>
        {refreshing ? '⏳ リクエスト中…' : polling ? '⏳ 反映確認中…' : '🔄 最新情報を反映'}
      </button>
      {#if generatedAt}
        <span class="generatedAt">最終更新: {new Date(generatedAt).toLocaleString('ja-JP')}</span>
      {/if}
      {#if refreshMessage}
        <span class="refreshMessage">{refreshMessage}</span>
      {/if}
    </div>

    {#if loading}
      <p class="note">読み込み中…</p>
    {:else if loadError}
      <p class="note errorNote">{loadError}</p>
    {/if}

    <div class="indexCard">
      <h2>Googleインデックス状況（登録済み {indexedCount} / {indexStatus.length}ページ）</h2>
      <ul class="indexList">
        {#each indexStatus as row}
          <li>
            <span class="indexIcon">{indexIcon(row.coverageState)}</span>
            <span class="indexName">{row.name}</span>
            <span class="indexState">{row.coverageState}</span>
            <span class="indexCrawl">前回クロール: {row.lastCrawlTime || 'なし'}</span>
          </li>
        {/each}
      </ul>
      <p class="filterNote">❌ 未発見（クロールされたことがない）／🔴 クロール済みだが未登録／🟢 インデックス登録済み</p>
    </div>

    <div class="toggleRow">
      <button class:active={strategy === 'mobile'} on:click={() => setStrategy('mobile')}>📱 Mobile</button>
      <button class:active={strategy === 'desktop'} on:click={() => setStrategy('desktop')}>🖥 Desktop</button>
    </div>

    <div class="issuesCard">
      <h2>指摘事項（表示中 {sortedIssues.length}件 / 全{issues.length}件）</h2>
      <div class="filterRow">
        <label><input type="checkbox" bind:checked={filters.high} /> 🔴 深刻（スコア0）</label>
        <label><input type="checkbox" bind:checked={filters.mid} /> 🟠 要改善（1〜49）</label>
        <label><input type="checkbox" bind:checked={filters.low} /> 🟡 やや不足（50〜89）</label>
        <label><input type="checkbox" bind:checked={filters.good} /> 🟢 良好（90〜100）</label>
        <span class="legendDivider">|</span>
        <label><input type="checkbox" bind:checked={filters.FIXABLE} /> <span class="issueTag">FIXABLE</span></label>
        <label><input type="checkbox" bind:checked={filters.EXTERNAL} /> <span class="issueTag external">EXTERNAL</span></label>
      </div>
      <p class="filterNote">FIXABLE=こちらで修正可能／EXTERNAL=サードパーティ起因で修正不可。表示中はFIXABLE→深刻度の順に並びます。</p>
      <ul class="issueList">
        {#each sortedIssues as issue}
          <li>
            <span class="issueIcon">{severityIcon(issue.severity)}</span>
            <span class="issueTag" class:external={issue.fixable === 'EXTERNAL'}>{issue.fixable}</span>
            <span class="issueCat">[{issue.cat}]</span>
            <span class="issueTitle">{issue.title}</span>
            <span class="issuePages">— {issue.pages}</span>
          </li>
        {/each}
      </ul>
    </div>

    <div class="chartCard">
      <h2>ホームページ（/）のスコア推移</h2>
      <div class="chartWrapper">
        <canvas bind:this={trendCanvas}></canvas>
      </div>
    </div>

    <div class="tableCard">
      <h2>最新の全ページスコア（{strategy} / 全{latestScores.length}ページ）</h2>
      <table>
        <thead>
          <tr>
            <th class="sortable" on:click={() => toggleSort('name')}>ページ{sortKey === 'name' ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}</th>
            <th class="sortable" on:click={() => toggleSort('performance')}>Perf{sortKey === 'performance' ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}</th>
            <th class="sortable" on:click={() => toggleSort('accessibility')}>A11y{sortKey === 'accessibility' ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}</th>
            <th class="sortable" on:click={() => toggleSort('bestPractices')}>BP{sortKey === 'bestPractices' ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}</th>
            <th class="sortable" on:click={() => toggleSort('seo')}>SEO{sortKey === 'seo' ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedScores as row}
            <tr>
              <td class="pageName">{row.name}</td>
              <td class={scoreClass(row.performance)}>{row.performance}</td>
              <td class={scoreClass(row.accessibility)}>{row.accessibility}</td>
              <td class={scoreClass(row.bestPractices)}>{row.bestPractices}</td>
              <td class={scoreClass(row.seo)}>{row.seo}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if scorePageCount > 1}
        <div class="pagination">
          <button disabled={scorePage === 0} on:click={() => scorePage--}>← 前へ</button>
          <span>{scorePage + 1} / {scorePageCount}</span>
          <button disabled={scorePage === scorePageCount - 1} on:click={() => scorePage++}>次へ →</button>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .dashboard {
    min-height: 100vh;
    background: #f4f4f5;
    padding: 40px 0 80px;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }

  h1 {
    font-size: 1.6rem;
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .draftBadge {
    font-size: 0.7rem;
    font-weight: normal;
    background: #fff3cd;
    color: #7a5c00;
    border: 1px solid #f0d98c;
    border-radius: 999px;
    padding: 3px 10px;
  }

  .note {
    font-size: 0.85rem;
    color: #666;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 12px 16px;
    line-height: 1.7;
  }

  .errorNote {
    color: #cf222e;
    border-color: #f2c0c0;
    background: #fff5f5;
  }

  .refreshRow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin: 16px 0;
  }

  .refreshRow button {
    padding: 8px 18px;
    border: 1px solid #eb1000;
    border-radius: 6px;
    background: #eb1000;
    color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .refreshRow button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .generatedAt {
    font-size: 0.8rem;
    color: #888;
  }

  .refreshMessage {
    font-size: 0.82rem;
    color: #333;
  }

  .note code {
    background: #eee;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.85em;
  }

  .toggleRow {
    display: flex;
    gap: 10px;
    margin: 20px 0;
  }

  .toggleRow button {
    padding: 8px 18px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .toggleRow button.active {
    background: #eb1000;
    color: #fff;
    border-color: #eb1000;
  }

  .chartCard,
  .tableCard,
  .issuesCard,
  .indexCard {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    padding: 24px;
    margin-bottom: 24px;
  }

  .indexCard h2 {
    font-size: 1.05rem;
    margin: 0 0 16px;
  }

  .indexList {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .indexList li {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 0.85rem;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .indexList li:last-child {
    border-bottom: none;
  }

  .indexIcon {
    display: inline-block;
    width: 18px;
    flex-shrink: 0;
    text-align: center;
  }

  .indexName {
    font-family: monospace;
    min-width: 130px;
    color: #333;
  }

  .indexState {
    color: #555;
    flex: 1;
  }

  .indexCrawl {
    color: #999;
    font-size: 0.78rem;
  }

  .issuesCard h2 {
    font-size: 1.05rem;
    margin: 0 0 16px;
  }

  .filterRow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    font-size: 0.82rem;
    color: #444;
    background: #fafafa;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px 12px;
    margin: 0 0 8px;
  }

  .filterRow label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    white-space: nowrap;
  }

  .filterNote {
    font-size: 0.75rem;
    color: #999;
    margin: 0 0 16px;
  }

  .legendDivider {
    color: #ccc;
  }

  .issueList {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .issueList li {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 0.88rem;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .issueList li:last-child {
    border-bottom: none;
  }

  .issueTag {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    background: #ddf4dd;
    color: #1a7f37;
  }

  .issueTag.external {
    background: #eee;
    color: #666;
  }

  .issueCat {
    font-weight: 700;
    color: #555;
  }

  .issueTitle {
    color: #24292f;
  }

  .issuePages {
    color: #888;
    font-size: 0.82rem;
  }

  .chartCard h2,
  .tableCard h2 {
    font-size: 1.05rem;
    margin: 0 0 16px;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
  }

  th.sortable:hover {
    color: #eb1000;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
    font-size: 0.85rem;
    color: #555;
  }

  .pagination button {
    padding: 6px 14px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .chartWrapper {
    position: relative;
    height: 320px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th, td {
    padding: 8px 10px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  th {
    color: #666;
    font-weight: 600;
  }

  .pageName {
    text-align: left;
    font-family: monospace;
    color: #333;
  }

  td.good { color: #2da44e; font-weight: 600; }
  td.mid { color: #9a6700; font-weight: 600; }
  td.bad { color: #cf222e; font-weight: 600; }

  @media (max-width: 600px) {
    table { font-size: 0.78rem; }
    th, td { padding: 6px 4px; }
  }
</style>
