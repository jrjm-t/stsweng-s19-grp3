import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // IMPORTANT: modify baseUrl as per your server's address and port
    baseUrl: "http://localhost:4173",

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
