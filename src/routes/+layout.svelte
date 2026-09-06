<script>
  import { run } from "svelte/legacy";
  import { browser } from "$app/environment";
  import { PUBLIC_DOMAIN } from "$env/static/public";
  import "../app.css";
  import { loading, t } from "$lib/translations";
  import { onMount } from "svelte";
  import { installPrompt, theme as themeStore } from "$lib/store";


const map = { light: 'light', dark: 'dark', system: 'system' };

  let { data, children } = $props();
  let { pathname, theme } = $state(data);
  $effect(() => ($themeStore = data.theme));
  $effect(() => (theme = $themeStore));
$effect(() => {
  const v = map[theme] ?? theme;
  if (!v || v === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', v);
  }
});

  let host = PUBLIC_DOMAIN.includes("localhost")
    ? `http://${PUBLIC_DOMAIN}`
    : `https://${PUBLIC_DOMAIN}`;

  function clearBadge() {
    if ("clearAppBadge" in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  }

  onMount(() => {
    if (!browser) return;

    // Handle install prompt
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      $installPrompt = event;
    });

    clearBadge(); // first load
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") clearBadge();
    });

    let hasNotch = typeof window.AndroidNotch !== "undefined";
    if (hasNotch) {
      window.AndroidNotch.getInsetTop(
        (px) => {
          document.documentElement.style.setProperty(
            "--safe-area-inset-top",
            Math.round(px) + "px",
          );
        },
        (err) => {
          console.error("Failed to get notch inset:", err);
        },
      );

      window.AndroidNotch.getInsetBottom(
        (px) => {
          document.documentElement.style.setProperty(
            "--safe-area-inset-bottom",
            24 + "px",
          );
        },
        (err) => {
          console.error("Failed to get bottom inset:", err);
        },
      );
    }
  });
</script>

<svelte:head>
  <title>SatsRoute</title>
  <meta property="og:title" content="SatsRoute" />
  <meta name="twitter:title" content="SatsRoute" />

  <meta property="og:image" content={`${host}/images/logo.webp`} />
  <meta property="og:type" content="website" />
  <meta property="og:description" content="Bitcoin, Lightning e stablecoins (USDt, DePix) numa carteira simples" />
  <meta name="description" content="Bitcoin, Lightning e stablecoins (USDt, DePix) numa carteira simples" />

  <meta name="keywords" content="satsroute bitcoin lightning liquid usdt depix carteira wallet" />
  <meta name="twitter:image" content={`${host}/images/logo.webp`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={host + pathname} />
  <meta name="twitter:site" content="@satsroute" />
  <meta name="twitter:creator" content="@satsroute" />
</svelte:head>

{#if !$loading}
  <main>
    {@render children?.()}
  </main>
{/if}

<style global>
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 8rem;
    --toastContainerLeft: calc(50vw - 8rem);
    --toastBackground: #292929;

    --safe-area-inset-top: 0px;
    --safe-area-inset-bottom: 0px;
  }

  main {
    padding-top: var(--safe-area-inset-top);
    padding-bottom: var(--safe-area-inset-bottom);
  }
</style>
