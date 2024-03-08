import ts from "typescript";
import path from "node:path";

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
                `registerProtobufHandler(${functionName},"${handlerName}",typiaProto.createIsDecode<{params: Parameters<typeof ${functionName}>[0];}>(),typiaProto.createEncode<{response: Awaited<ReturnType<typeof ${functionName}>>;}>());`
              );
            } else {
              registrations.push(
                `registerHandler(${functionName},"${handlerName}",typiaJson.createIsParse<Parameters<typeof ${functionName}>>(),typiaJson.createStringify<Awaited<ReturnType<typeof ${functionName}>>>());`
              );
            }
          }
        });

        const imports = useProtoBuff
          ? 'import typiaProto from "typia/lib/protobuf";\nimport { registerProtobufHandler } from "./lib/register-handlers";'
          : 'import typiaJson from "typia/lib/json";\nimport { registerHandler } from "./lib/register-handlers";';

        const modifiedSource = `${imports}\n${source}\n${registrations.join(
          "\n"
        )}`;
        return modifiedSource;
      }
      return null;
    },
  };
}
