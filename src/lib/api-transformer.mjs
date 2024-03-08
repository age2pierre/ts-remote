import ts from "typescript";
import path from "node:path";
import MagicString from "magic-string";

export default function apiTransformer({ useProtoBuff = false }) {
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

            if (useProtoBuff) {
              registrations.push(
                `registerProtobufHandler(\n  ${functionName},\n  "${handlerName}",\n` +
                  `  typiaProto.createIsDecode<{params: Parameters<typeof ${functionName}>[0];}>(),\n` +
                  `  typiaProto.createEncode<{response: Awaited<ReturnType<typeof ${functionName}>>;}>()\n);`
              );
            } else {
              registrations.push(
                `registerHandler(\n  ${functionName},\n  "${handlerName}",\n` +
                  `  typiaJson.createIsParse<Parameters<typeof ${functionName}>>(),\n` +
                  `  typiaJson.createStringify<Awaited<ReturnType<typeof ${functionName}>>>()\n);`
              );
            }
          }
        });

        const imports = useProtoBuff
          ? 'import typiaProto from "typia/lib/protobuf";\nimport { registerProtobufHandler } from "./lib/register-handlers";\n'
          : 'import typiaJson from "typia/lib/json";\nimport { registerHandler } from "./lib/register-handlers";\n';

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
