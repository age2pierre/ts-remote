import ts from "typescript";
import path from "node:path";

function replaceInString(
  input: string,
  changes: Array<[start: number, width: number, txt: string]>
): string {
  return changes.reduce((result, change) => {
    const [start, width, txt] = change;
    return result.substring(0, start) + txt + input.substring(start + width);
  }, input);
}

function trimQuotesAndWhitespace(input: string): string {
  const quotesRegex = /^['"](.*)['"]$/;
  const trimmed = input.trim().replace(quotesRegex, "$1");
  return trimmed;
}

export default function clientTransformer({ useProtoBuff = false }) {
  return {
    name: "client-transformer",
    enforce: "pre" as const,
    async transform(source: string, id: string) {
      if (id.endsWith(".tsx")) {
        const changes: Array<[start: number, width: number, txt: string]> = [];
        const sourceFile = ts.createSourceFile(
          id,
          source,
          ts.ScriptTarget.Latest,
          true
        );

        ts.forEachChild(sourceFile, (node) => {
          if (
            ts.isImportDeclaration(node) &&
            trimQuotesAndWhitespace(node.moduleSpecifier.getText()).endsWith(
              ".api"
            )
          ) {
            // TODO
            const start = node.getStart();
            const width = node.getWidth();
            const baseFilename = path.basename(
              trimQuotesAndWhitespace(node.moduleSpecifier.getText()),
              ".api"
            );

            if (
              node.importClause?.namedBindings &&
              ts.isNamedImports(node.importClause.namedBindings)
            ) {
              const nameImports = node.importClause.namedBindings.elements.map(
                (el) =>
                  [
                    el.propertyName?.getText() ?? el.name.getText(),
                    el.name.getText(),
                  ] as const
              );

              const txt = `import type {
                ${nameImports
                  .map(([pn, n]) => `${pn} as __${n}TypeAlias,`)
                  .join("\n")}
              } from ${node.moduleSpecifier.getText()};
              ${nameImports
                .map(([pn, n]) =>
                  useProtoBuff
                    ? `const ${n} = factoryProtoRemoteCall<typeof __${n}TypeAlias>("${baseFilename}-${n}",typiaProto.createEncode<{ params: Parameters<typeof __${n}TypeAlias>[0] }>(),typiaProto.createIsDecode<{response: Awaited<ReturnType<typeof __${n}TypeAlias>>;}>());`
                    : `const ${n} = factoryRemoteCall<typeof __${n}TypeAlias>("${baseFilename}-${n}",typiaJson.createStringify<Parameters<typeof __${n}TypeAlias>>(),typiaJson.createIsParse<Awaited<ReturnType<typeof __${n}TypeAlias>>>());`
                )
                .join("\n")}
              `;

              changes.push([start, width, txt]);
            }
          }
        });

        if (changes.length < 1) {
          return null;
        }
        const imports = useProtoBuff
          ? 'import * as typiaProto from "typia/lib/protobuf";\nimport { factoryProtoRemoteCall } from "./lib/client";'
          : 'import * as typiaJson from "typia/lib/json";\nimport { factoryRemoteCall } from "./lib/client";';

        const modifiedSource = replaceInString(source, changes);
        const result = `${imports}\n${modifiedSource}`;
        return result;
      }
      return null;
    },
  };
}
