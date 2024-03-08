import apiTransformer from "./src/lib/api-transformer.mjs";
import typescript from "rollup-plugin-typescript2";
import multi from "@rollup/plugin-multi-entry";

export default {
  input: ["src/**/*.back.ts", "src/**/*.api.ts"],
  output: {
    dir: "dist/back/",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    multi(),
    apiTransformer({
      useProtoBuff: true,
    }),
    typescript({
      tsconfig: "./tsconfig.server.json",
    }),
  ],
};
