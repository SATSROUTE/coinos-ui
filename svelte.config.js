// import adapter from '@sveltejs/adapter-node';
import adapter from "svelte-adapter-bun";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    // A verificacao de origem e feita em src/hooks.server.ts, nao aqui: atras do
    // Caddy o svelte-adapter-bun so reescreve a URL quando a origem reconstruida
    // difere de ORIGIN, e como o Caddy preserva o Host elas ficam iguais - a URL
    // mantem o esquema http interno e o checkOrigin nativo recusaria todo POST.
    csrf: {
      checkOrigin: false,
    },
    prerender: {
      crawl: false,
      entries: [],
    },
  },
  onwarn: (warning, handler) => {
    if (warning.code.includes("caption") || warning.filename.includes("Toast"))
      return;
    handler(warning);
  },
};

export default config;
