<script lang="ts">
  import { events } from '$lib/data/events';

  export let currentId: string;
</script>

<nav class="eventPageNav">
  <a href="/history/" class="navBack">← 一覧</a>
  <div class="navLinks">
    {#each events as event}
      <a
        href="/history/{event.id}/"
        class="navItem"
        class:active={event.id === currentId}
        class:cancelled={event.cancelled}
      >
        {event.id.toUpperCase()}
      </a>
    {/each}
  </div>
</nav>

<style>
  .eventPageNav {
    max-width: 800px;
    margin: 40px auto 0;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .navBack {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #ddd;
    font-size: 0.8rem;
    font-weight: bold;
    font-family: Arial, sans-serif;
    color: #555;
    text-decoration: none;
    white-space: nowrap;
    transition: border-color 0.15s, color 0.15s;
  }

  .navBack:hover {
    border-color: #eb1000;
    color: #eb1000;
  }

  .navLinks {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .navItem {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #ddd;
    font-size: 0.8rem;
    font-weight: bold;
    font-family: Arial, sans-serif;
    letter-spacing: 0.05em;
    color: #555;
    text-decoration: none;
    transition: border-color 0.15s, color 0.15s;
  }

  .navItem:hover {
    border-color: #eb1000;
    color: #eb1000;
  }

  .navItem.active {
    background: #eb1000;
    border-color: #eb1000;
    color: #fff;
  }

  .navItem.cancelled {
    text-decoration: line-through;
    opacity: 0.5;
  }

  .navItem.active.cancelled {
    background: #888;
    border-color: #888;
    color: #fff;
    opacity: 1;
  }
</style>
