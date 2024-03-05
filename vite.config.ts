import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import typescript from "rollup-plugin-typescript2";
import Inspect from "vite-plugin-inspect";
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  esbuild: false,
  plugins: [
    Inspect(),
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    { ...typescript(), enforce: "pre" },
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
