import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";

export default defineConfig({
  base: "/event-booster/",
  plugins: [handlebars()],
});
