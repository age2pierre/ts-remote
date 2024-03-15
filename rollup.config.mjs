import apiTransformer from "./src/lib/api-transformer.mjs";
import typescript from "rollup-plugin-typescript2";
import multi from "@rollup/plugin-multi-entry";

export default {
  input: ["src/**/*.back.ts", "src/**/*.api.ts"],
  output: {
    file: "dist/back/index.mjs",
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    multi(),
    apiTransformer({
      encoding: "seroval",
    }),
    typescript({
      tsconfig: "./tsconfig.server.json",
    }),
  ],
};
