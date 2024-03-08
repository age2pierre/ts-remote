import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import typescript from "rollup-plugin-typescript2";
import Inspect from "vite-plugin-inspect";
// import devtools from 'solid-devtools/vite';
import clientTransformer from "./src/lib/client-transformer";

export default defineConfig({
  esbuild: false,
  plugins: [
    Inspect(),
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    clientTransformer({
      useProtoBuff: true,
    }),
    {
      ...typescript({
        tsconfig: "./tsconfig.app.json",
      }),
      enforce: "pre",
    },
    solidPlugin(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/ts-remote': {
        target: 'http://localhost:1234',
        changeOrigin: true
      }
    }
  },
  build: {
    target: "esnext",
    sourcemap: true,
    outDir: 'dist/front/'
  },
});
