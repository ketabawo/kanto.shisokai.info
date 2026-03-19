<script lang="ts">
  import { events } from '$lib/data/events';
  import EventPageNav from '$lib/components/EventPageNav.svelte';

  const event = events.find(e => e.id === '5th')!;
</script>

<svelte:head>
  <title>{event.name} | 始祖会 GPZ1000RX・ZX-10 オーナーズミーティング</title>
  <meta name="description" content="{event.date}開催予定、{event.name}。雨天のため中止。">
  <link rel="canonical" href="https://kanto.shisokai.info/history/5th/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://kanto.shisokai.info/history/5th/">
  <meta property="og:title" content="{event.name} | 始祖会">
  <meta property="og:description" content="{event.date}開催予定、{event.name}。雨天のため中止。">
  <meta property="og:image" content="https://kanto.shisokai.info/images/OGP.png">
  <meta property="og:site_name" content="始祖会 Kanto Owners Meeting">
  <meta property="og:locale" content="ja_JP">
</svelte:head>

<section class="pageHero cancelled">
  <div class="container">
    <p class="eventLabel">5TH</p>
    <h1 class="pageTitle">{event.name}</h1>
    <div class="eventMetas">
      <span class="material-icons">calendar_today</span>
      <span>{event.date}</span>
      <span class="separator">|</span>
      <span class="material-icons">location_on</span>
      <span>{event.location}</span>
    </div>
    <div class="cancelledBadge">雨天中止</div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cancelledMessage">
      <span class="material-icons">umbrella</span>
      <p>当日の悪天候により、本イベントは中止となりました。</p>
    </div>

    <EventPageNav currentId="5th" />
  </div>
</section>

<style>
  .pageHero {
    background: linear-gradient(135deg, #eb1000 0%, #c00000 100%);
    color: #fff;
    padding: 60px 0;
    text-align: center;
  }

  .pageHero.cancelled {
    background: linear-gradient(135deg, #666 0%, #444 100%);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .eventLabel {
    font-size: 0.85rem;
    font-weight: bold;
    letter-spacing: 0.2em;
    font-family: Arial, sans-serif;
    margin: 0 0 8px 0;
    opacity: 0.8;
  }

  .pageTitle {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0 0 16px 0;
    line-height: 1.3;
  }

  .eventMetas {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.95rem;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .eventMetas .material-icons {
    font-size: 1rem;
  }

  .separator {
    opacity: 0.5;
  }

  .cancelledBadge {
    display: inline-block;
    background: rgba(255,255,255,0.2);
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
  }

  .section {
    padding: 60px 0;
    background-color: #f9f9f9;
  }

  .cancelledMessage {
    max-width: 800px;
    margin: 0 auto 40px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: #fff;
    border-radius: 10px;
    padding: 30px;
    border-left: 4px solid #666;
    color: #666;
    font-size: 1rem;
  }

  .cancelledMessage .material-icons {
    font-size: 2rem;
    flex-shrink: 0;
  }


  @media (max-width: 767px) {
    .pageTitle {
      font-size: 1.4rem;
    }
  }
</style>
