import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  base: "/EVENT-BOOSTER/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
