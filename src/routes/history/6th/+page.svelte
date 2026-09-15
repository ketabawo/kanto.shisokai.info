<script lang="ts">
  import { events } from '$lib/data/events';
  import { getMembersForEvent, getMemberByUid, getNewVsReturningForEvent } from '$lib/data/members';
  import EventCharts from '$lib/components/EventCharts.svelte';
  import EventPageNav from '$lib/components/EventPageNav.svelte';

  const event = events.find(e => e.id === '6th')!;
  const rawMembers = getMembersForEvent('6');
  const { newCount, returningCount } = getNewVsReturningForEvent('6');
  // ページ表示のみの上書き（データはそのまま）
  const displayOverrides: Record<string, { displayName: string; url: string | null }> = {
    'shiraishidrea55': { displayName: '鯨師匠', url: null },
  };
  const members = rawMembers.map(m => {
    const override = displayOverrides[m.displayName];
    return override ? { ...m, ...override } : m;
  });
  const rxMembers = members.filter(m => m.type === 'GPZ1000RX');
  const zxMembers = members.filter(m => m.type === 'ZX-10');

  // 写真が用意済みのUID → 拡張子 のマップ
  const photoMap: Record<number, string> = {
    1: 'webp', 2: 'webp', 3: 'webp', 4: 'webp', 5: 'webp', 6: 'webp',
    7: 'webp', 8: 'webp', 10: 'webp', 12: 'webp', 14: 'webp', 16: 'webp',
    18: 'webp', 20: 'webp', 22: 'webp', 26: 'webp', 31: 'webp', 32: 'webp',
    34: 'webp', 36: 'webp', 38: 'webp', 45: 'webp', 46: 'webp', 52: 'webp',
    53: 'webp', 54: 'webp', 55: 'webp', 56: 'webp', 57: 'webp',
  };
  const otherPhotoExt = 'webp';

  // その他枠のUIDマッピング（写真ファイル other-N.webp に対応）
  const otherSlots: (number | null)[] = [29, 60, 59, 58];
  const otherMembers = otherSlots.map(uid => uid !== null ? getMemberByUid(uid) : null);
</script>

<svelte:head>
  <title>{event.name} | 始祖会 GPZ1000RX・ZX-10 オーナーズミーティング</title>
  <meta name="description" content="{event.date}開催、{event.name}の参加者一覧と開催情報。">
  <link rel="canonical" href="https://kanto.shisokai.info/history/6th/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://kanto.shisokai.info/history/6th/">
  <meta property="og:title" content="{event.name} | 始祖会">
  <meta property="og:description" content="{event.date}開催、{event.name}の参加者一覧と開催情報。">
  <meta property="og:image" content="https://kanto.shisokai.info/images/OGP.png">
  <meta property="og:site_name" content="始祖会 Kanto Owners Meeting">
  <meta property="og:locale" content="ja_JP">
</svelte:head>

<section class="pageHero">
  <div class="container">
    <p class="eventLabel">6TH</p>
    <h1 class="pageTitle">{event.name}</h1>
    <div class="eventMetas">
      <span class="material-icons">calendar_today</span>
      <span>{event.date}</span>
      <span class="separator">|</span>
      <span class="material-icons">location_on</span>
      <span><a href="https://riberty.re-one.net/" target="_blank" rel="noopener noreferrer" class="locationLink">{event.location}</a></span>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="eventImageArea">
      {#if event.detailImage}
        <img src={event.detailImage} alt={event.name} width="1600" height="1067">
      {:else}
        <div class="noImage">
          <span class="material-icons">photo_camera</span>
          <span>No Image</span>
        </div>
      {/if}
    </div>

    <div class="videoGrid">
      <div class="videoArea">
        <iframe
          src="https://www.youtube-nocookie.com/embed/1Gt_qFT2TKk"
          title="YouTube動画 1: 始祖会 Kanto Owners Meeting 2026 Side-A"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
      <div class="videoArea">
        <iframe
          src="https://www.youtube-nocookie.com/embed/GF6tjMo_akY"
          title="YouTube動画 2: 始祖会 Kanto Owners Meeting 2026 Side-A"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <div class="membersSection">
      <h2 class="sectionTitle">参加車両一覧 <span class="count">敬称略</span></h2>

      <div class="memberGroup">
        <h3 class="groupTitle">GPZ1000RX <span class="groupCount">{rxMembers.length}台</span></h3>
        <ul class="memberList">
          {#each rxMembers as member}
            <li class="memberItem">
              <div class="memberPhoto">
                {#if photoMap[member.uid]}
                  <img src="/images/history/6th/members/{member.uid}.{photoMap[member.uid]}" alt={member.displayName} width="400" height="300">
                {:else}
                  <div class="noPhoto">
                    <span class="material-icons">photo_camera</span>
                  </div>
                {/if}
              </div>
              <div class="memberInfo">
                {#if member.url}
                  <a href={member.url} target="_blank" rel="noopener noreferrer" class="memberLink">{member.displayName}</a>
                {:else}
                  <span class="memberName">{member.displayName}</span>
                {/if}
                <span class="memberPref">{member.pref}</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>

      <div class="memberGroup">
        <h3 class="groupTitle">ZX-10 <span class="groupCount">{zxMembers.length}台</span></h3>
        <ul class="memberList">
          {#each zxMembers as member}
            <li class="memberItem">
              <div class="memberPhoto">
                {#if photoMap[member.uid]}
                  <img src="/images/history/6th/members/{member.uid}.{photoMap[member.uid]}" alt={member.displayName} width="400" height="300">
                {:else}
                  <div class="noPhoto">
                    <span class="material-icons">photo_camera</span>
                  </div>
                {/if}
              </div>
              <div class="memberInfo">
                {#if member.url}
                  <a href={member.url} target="_blank" rel="noopener noreferrer" class="memberLink">{member.displayName}</a>
                {:else}
                  <span class="memberName">{member.displayName}</span>
                {/if}
                <span class="memberPref">{member.pref}</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>

      <div class="memberGroup">
        <h3 class="groupTitle">その他 <span class="groupCount">4台</span></h3>
        <ul class="memberList">
          {#each otherMembers as om, i}
            <li class="memberItem">
              <div class="memberPhoto">
                <img src="/images/history/6th/members/other-{i + 1}.{otherPhotoExt}" alt={om?.displayName ?? `その他 ${i + 1}`} width="400" height="300">
              </div>
              <div class="memberInfo">
                {#if om}
                  {#if om.url}
                    <a href={om.url} target="_blank" rel="noopener noreferrer" class="memberLink">{om.displayName}</a>
                  {:else}
                    <span class="memberName">{om.displayName}</span>
                  {/if}
                  <span class="memberPref">{om.pref}</span>
                {:else}
                  <span class="memberName">—</span>
                  <span class="memberPref">—</span>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <EventCharts {members} {newCount} {returningCount} />

    <EventPageNav currentId="6th" />
  </div>
</section>

<style>
  .pageHero {
    background: linear-gradient(135deg, #eb1000 0%, #c00000 100%);
    color: #fff;
    padding: 60px 0;
    text-align: center;
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
  }

  .eventMetas .material-icons {
    font-size: 1rem;
  }

  .separator {
    opacity: 0.5;
  }

  .locationLink {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .locationLink:hover {
    opacity: 0.8;
  }

  .section {
    padding: 60px 0;
    background-color: #f9f9f9;
  }

  .eventImageArea {
    max-width: 800px;
    margin: 0 auto 50px;
    aspect-ratio: 3 / 2;
    background: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
  }

  .eventImageArea img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .videoGrid {
    max-width: 800px;
    margin: 0 auto 50px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .videoArea {
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 10px;
    overflow: hidden;
  }

  .videoArea iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  @media (max-width: 767px) {
    .videoGrid {
      grid-template-columns: 1fr;
    }
  }

  .noImage {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #5e5e5e;
    font-size: 0.9rem;
  }

  .noImage .material-icons {
    font-size: 3rem;
  }

  .membersSection {
    max-width: 800px;
    margin: 0 auto;
  }

  .sectionTitle {
    font-size: 1.4rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 30px 0;
    padding-bottom: 12px;
    border-bottom: 3px solid #eb1000;
  }

  .count {
    font-size: 1rem;
    color: #666;
    font-weight: normal;
  }

  .memberGroup {
    margin-bottom: 40px;
  }

  .groupTitle {
    font-size: 1.1rem;
    font-weight: bold;
    color: #c00000;
    margin: 0 0 16px 0;
  }

  .groupCount {
    font-size: 0.9rem;
    color: #666666;
    font-weight: normal;
  }

  .memberList {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .memberItem {
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
    font-size: 0.9rem;
  }

  .memberPhoto {
    width: 100%;
    aspect-ratio: 4 / 3;
    background: #efefef;
    overflow: hidden;
  }

  .memberPhoto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .noPhoto {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #595959;
  }

  .noPhoto .material-icons {
    font-size: 2rem;
  }

  .memberInfo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
  }

  .memberLink {
    color: #0969da;
    text-decoration: none;
    font-weight: 500;
    word-break: break-all;
  }

  .memberLink:hover {
    text-decoration: underline;
  }

  .memberName {
    color: #333;
    font-weight: 500;
    word-break: break-all;
  }

  .memberPref {
    font-size: 0.75rem;
    color: #666666;
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: 8px;
  }


  @media (max-width: 767px) {
    .pageTitle {
      font-size: 1.4rem;
    }

    .memberList {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
