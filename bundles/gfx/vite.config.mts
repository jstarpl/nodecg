import { defineConfig } from "vite";
import NodeCGPlugin from "vite-plugin-nodecg";
import { resolve } from "path";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: [{ find: "common", replacement: resolve(__dirname, "src/common") }],
  },
  plugins: [
    NodeCGPlugin({
      inputs: {
        "./src/graphics/*.{js,ts,jsx,tsx}": "./src/graphics/template.html",
        "./src/dashboard/*.{js,ts,jsx,tsx}": "./src/dashboard/template.html",
      },
    }),
  ],
});
