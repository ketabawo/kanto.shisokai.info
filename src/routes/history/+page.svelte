<script lang="ts">
  import { events } from '$lib/data/events';
</script>

<svelte:head>
  <title>開催履歴 | 始祖会 GPZ1000RX・ZX-10 オーナーズミーティング</title>
  <meta name="description" content="始祖会 Kanto Owners Meetingの開催履歴。GPZ1000RX・ZX-10オーナーズミーティングの各回の開催情報をご覧いただけます。">
  <link rel="canonical" href="https://kanto.shisokai.info/history/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://kanto.shisokai.info/history/">
  <meta property="og:title" content="開催履歴 | 始祖会 GPZ1000RX・ZX-10 オーナーズミーティング">
  <meta property="og:description" content="始祖会 Kanto Owners Meetingの開催履歴。GPZ1000RX・ZX-10オーナーズミーティングの各回の開催情報をご覧いただけます。">
  <meta property="og:image" content="https://kanto.shisokai.info/images/OGP.png">
  <meta property="og:site_name" content="始祖会 Kanto Owners Meeting">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="開催履歴 | 始祖会 GPZ1000RX・ZX-10 オーナーズミーティング">
  <meta name="twitter:description" content="始祖会 Kanto Owners Meetingの開催履歴。GPZ1000RX・ZX-10オーナーズミーティングの各回の開催情報をご覧いただけます。">
  <meta name="twitter:image" content="https://kanto.shisokai.info/images/OGP.png">
</svelte:head>

<section class="pageHero">
  <div class="container">
    <h1 class="pageTitle">開催履歴</h1>
    <p class="pageSubtitle">始祖会 Kanto Owners Meetingの開催履歴。<br>GPZ1000RX・ZX-10オーナーズミーティングの各回の開催情報をご覧いただけます。</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="eventGrid">
      {#each events as event}
        <a
          href="/history/{event.id}/"
          class="eventCard"
          class:cancelled={event.cancelled}
        >
          <div class="eventImage">
            {#if event.image}
              <img src={event.image} alt={event.name} width="600" height="400">
            {:else}
              <div class="noImage">
                <span class="material-icons">photo_camera</span>
                <span>No Image</span>
              </div>
            {/if}
            {#if event.cancelled}
              <div class="cancelledBadge">中止</div>
            {/if}
          </div>
          <div class="eventInfo">
            <p class="eventId">{event.id.toUpperCase()}</p>
            <h2 class="eventName">{event.name}</h2>
            <div class="eventMeta">
              <span class="material-icons">calendar_today</span>
              <span>{event.date}</span>
            </div>
            <div class="eventMeta">
              <span class="material-icons">location_on</span>
              <span>{event.location}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<style>
  .pageHero {
    background: linear-gradient(135deg, #eb1000 0%, #c00000 100%);
    color: #fff;
    padding: 60px 0;
    text-align: center;
  }

  .pageTitle {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0 0 10px 0;
  }

  .pageSubtitle {
    font-size: 1.2rem;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
  }


  .section {
    padding: 60px 0;
    background-color: #f9f9f9;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .eventGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
  }

  .eventCard {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: block;
  }

  .eventCard:not(.cancelled):hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  .eventCard.cancelled {
    opacity: 0.6;
    cursor: default;
  }

  .eventImage {
    position: relative;
    aspect-ratio: 3 / 2;
    overflow: hidden;
    background: #eee;
  }

  .eventImage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .noImage {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #aaa;
    font-size: 0.85rem;
  }

  .noImage .material-icons {
    font-size: 2.5rem;
  }

  .cancelledBadge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #666;
    color: #fff;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 4px 10px;
    border-radius: 4px;
  }

  .eventInfo {
    padding: 20px;
  }

  .eventId {
    font-size: 0.75rem;
    font-weight: bold;
    color: #eb1000;
    letter-spacing: 0.1em;
    margin: 0 0 6px 0;
    font-family: Arial, sans-serif;
  }

  .eventName {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 12px 0;
    line-height: 1.4;
  }

  .eventMeta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 6px;
  }

  .eventMeta .material-icons {
    font-size: 1rem;
    color: #999;
  }

  @media (max-width: 767px) {
    .pageTitle {
      font-size: 2rem;
    }

    .eventGrid {
      grid-template-columns: 1fr;
    }
  }
</style>
