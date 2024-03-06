import { test } from "uvu";
import * as assert from "uvu/assert";
import * as apiTransformer from "../src/lib/api-transformer";
import { transformFile } from "ts-transformer-testing-library";
import { JsxEmit, ModuleKind, ScriptTarget } from "typescript";

test("nominal", () => {
  const res = transformFile(
    {
      path: "./foo.api.ts",
      contents: `export function bar(arg: { baz: number }): { res: number } {
        return { res: arg.baz };
      }`,
    },
    {
      compilerOptions: {
        // outDir: "dist",
        // // lib: ["ES2023"],
        // // module: ModuleKind.Node16,
        // target: ScriptTarget.ES2022,
        // sourceMap: true,

        // strict: true,
        // esModuleInterop: true,
        // skipLibCheck: true,
        // forceConsistentCasingInFileNames: true,
        // types: ["@types/node"],
        jsx: JsxEmit.Preserve,
        // plugins: [
        //   { transform: "./src/lib/api-transformer.ts", type: "raw" },
        //   { transform: "typia/lib/transform" },
        // ],
      },
      sources: [],
      transforms: [
        () => {
          return apiTransformer.default;
        },
      ],
    }
  );

  assert.is(res, 42);
});

test.run();
