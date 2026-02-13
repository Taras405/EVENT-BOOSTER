import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import path from "path";

export default defineConfig({
  root: "src",
  base: "/EVENT-BOOSTER/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [
    handlebars({
      partialDirectory: path.resolve(__dirname, "src/partials")
    })
  ],
});
