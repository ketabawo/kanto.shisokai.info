<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { DisplayMember } from '$lib/data/members';

  export let members: DisplayMember[];

  let prefCanvas: HTMLCanvasElement;
  let vehicleCanvas: HTMLCanvasElement;
  let prefChart: any;
  let vehicleChart: any;

  onMount(async () => {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    // Prefecture distribution (sorted by count desc)
    const prefCounts = members.reduce((acc, m) => {
      acc[m.pref] = (acc[m.pref] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sortedPrefs = Object.entries(prefCounts).sort((a, b) => b[1] - a[1]);

    prefChart = new Chart(prefCanvas, {
      type: 'bar',
      data: {
        labels: sortedPrefs.map(([p]) => p),
        datasets: [{
          data: sortedPrefs.map(([, c]) => c),
          backgroundColor: '#eb100099',
          borderColor: '#eb1000',
          borderWidth: 1,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { stepSize: 1, precision: 0 }, grid: { display: false } },
          y: { grid: { display: false } },
        }
      }
    });

    // Vehicle ratio
    const rxCount = members.filter(m => m.type === 'GPZ1000RX').length;
    const zxCount = members.filter(m => m.type === 'ZX-10').length;

    vehicleChart = new Chart(vehicleCanvas, {
      type: 'doughnut',
      data: {
        labels: ['GPZ1000RX', 'ZX-10'],
        datasets: [{
          data: [rxCount, zxCount],
          backgroundColor: ['#eb1000', '#333'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 13 } } },
        }
      }
    });
  });

  onDestroy(() => {
    prefChart?.destroy();
    vehicleChart?.destroy();
  });
</script>

<div class="appendixHeader">
  <h2 class="appendixTitle">統計データ</h2>
</div>

<div class="chartsSection">
  <div class="chartCard">
    <h3 class="chartTitle">生息地分布</h3>
    <div class="chartWrap prefChartWrap">
      <canvas bind:this={prefCanvas}></canvas>
    </div>
  </div>
  <div class="chartCard">
    <h3 class="chartTitle">参加車両</h3>
    <div class="chartWrap vehicleChartWrap">
      <canvas bind:this={vehicleCanvas}></canvas>
    </div>
  </div>
</div>

<style>
  .appendixHeader {
    max-width: 800px;
    margin: 0 auto 24px;
  }

  .appendixTitle {
    font-size: 1.4rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 30px 0;
    padding-bottom: 12px;
    border-bottom: 3px solid #eb1000;
  }

  .chartsSection {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;
    max-width: 800px;
    margin: 0 auto 50px;
  }

  .chartCard {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px 24px;
  }

  .chartTitle {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #eb1000;
  }

  .prefChartWrap {
    position: relative;
  }

  .vehicleChartWrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
  }

  @media (max-width: 767px) {
    .chartsSection {
      grid-template-columns: 1fr;
    }

    .vehicleChartWrap {
      max-width: 240px;
      margin: 0 auto;
    }
  }
</style>
