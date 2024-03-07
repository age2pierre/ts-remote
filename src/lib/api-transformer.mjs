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
        const blocks = [];
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
              blocks.push(`{
                const parseParams = typiaProto.createIsDecode<{
                  params: Parameters<typeof ${functionName}>[0];
                }>();
                const bufferizeResponse = typiaProto.createEncode<{
                  response: Awaited<ReturnType<typeof ${functionName}>>;
                }>();
              
                registerProtobufHandler(
                  ${functionName},
                  "${handlerName}",
                  parseParams,
                  bufferizeResponse
                );
              }`);
            } else {
              blocks.push(`{
                const parseParams = createIsParse<Parameters<typeof ${functionName}>>();
                const stringifyResponse =
                  createStringify<Awaited<ReturnType<typeof ${functionName}>>>();
                registerHandler(greet, "${handlerName}", parseParams, stringifyResponse);
              }`);
            }
          }
        });

        const imports = useProtoBuff
          ? 'import typiaProto from "typia/lib/protobuf";\n\
        import { registerProtobufHandler } from "./server";'
          : 'import { createIsParse, createStringify } from "typia/lib/json";\n\
        import { registerHandler } from "./server";';

        const modifiedSource = `${imports}\n${source}\n${blocks.join("\n")}`;
        console.log(modifiedSource);
        return modifiedSource;
      }
      return null;
    },
  };
}
