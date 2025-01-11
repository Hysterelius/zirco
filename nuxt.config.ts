import Aura from "@primevue/themes/aura";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  hub: {
    database: true,
  },

  devServer: { port: 3897 },
  ssr: false,
  modules: [
    "@primevue/nuxt-module",
    "@nuxt/fonts",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@nuxthub/core",
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },
  css: ["~/assets/css/main.css", "primeicons/primeicons.css"],
  fonts: {
    families: [{ name: "Inter", provider: "local" }],
    defaults: {
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
});