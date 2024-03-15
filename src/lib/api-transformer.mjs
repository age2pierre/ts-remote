import ts from "typescript";
import path from "node:path";
import MagicString from "magic-string";

/**
 * @param {{ encoding?: "json" | "proto" | "seroval"}} param0
 */
export default function apiTransformer({ encoding = "proto" }) {
  if (encoding !== "json" && encoding !== "proto" && encoding !== "seroval") {
    throw Error("apiTransformer: invalid encoding params");
  }

  return {
    name: "api-transformer",
    /**
     * @param {string} source
     * @param {string} id
     */
    async transform(source, id) {
      if (id.endsWith(".api.ts")) {
        /**
         * @type {string[]}
         */
        const registrations = [];
        const sourceFile = ts.createSourceFile(
          id,
          source,
          ts.ScriptTarget.Latest,
          true
        );

        ts.forEachChild(sourceFile, (node) => {
          if (
            ts.isFunctionDeclaration(node) &&
            node.modifiers?.some(
              (mod) => mod.kind === ts.SyntaxKind.ExportKeyword
            )
          ) {
            const functionName = node.name?.getText() ?? "anonymous";
            const handlerName = `${path.basename(
              sourceFile.fileName,
              ".api.ts"
            )}-${functionName}`;

            if (encoding === "proto") {
              registrations.push(
                `registerHandler(\n` +
                  `  ${functionName},\n` +
                  ` "${handlerName}",\n` +
                  `  typia.protobuf.createIsDecode<{params: Parameters<typeof ${functionName}>[0];}>(),\n` +
                  `  typia.protobuf.createEncode<{response: Awaited<ReturnType<typeof ${functionName}>>;}>()\n` +
                  `);`
              );
            } else if (encoding === "json") {
              registrations.push(
                `registerHandler(\n` +
                  `  ${functionName},\n` +
                  `  "${handlerName}",\n` +
                  `  typia.json.createIsParse<Parameters<typeof ${functionName}>>(),\n` +
                  `  typia.json.createStringify<Awaited<ReturnType<typeof ${functionName}>>>()\n` +
                  `);`
              );
            } else if (encoding === "seroval") {
              registrations.push(
                `registerHandler(\n` +
                  `  ${functionName},\n` +
                  `  "${handlerName}",\n` +
                  `  typia.createIs<Parameters<typeof ${functionName}>>()\n` +
                  `);`
              );
            }
          }
        });

        const imports =
          'import typia from "typia";\n' +
          `import { registerHandler } from "./lib/handler-${encoding}";\n`;

        const magicSource = new MagicString(source);
        magicSource.prepend(imports);
        magicSource.append(registrations.join("\n"));

        const codeWithMap = {
          code: magicSource.toString(),
          map: magicSource.generateMap({
            hires: "boundary",
          }),
        };
        return codeWithMap;
      }
      return null;
    },
  };
}
