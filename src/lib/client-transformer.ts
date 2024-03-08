import ts from "typescript";
import path from "node:path";
import MagicString from "magic-string";

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

              const txt =
                `import type {${nameImports
                  .map(([pn, n]) => `${pn} as __${n}TypeAlias`)
                  .join(",")}} from ${node.moduleSpecifier.getText()};\n` +
                nameImports
                  .map(([pn, n]) =>
                    useProtoBuff
                      ? `const ${n} = factoryProtoRemoteCall<typeof __${n}TypeAlias>(\n` +
                        `  "${baseFilename}-${n}",\n` +
                        `  typiaProto.createEncode<{ params: Parameters<typeof __${n}TypeAlias>[0] }>(),\n` +
                        `  typiaProto.createIsDecode<{response: Awaited<ReturnType<typeof __${n}TypeAlias>>;}>()\n);\n`
                      : `const ${n} = factoryRemoteCall<typeof __${n}TypeAlias>(\n` +
                        `  "${baseFilename}-${n}",\n` +
                        `  typiaJson.createStringify<Parameters<typeof __${n}TypeAlias>>(),\n` +
                        `  typiaJson.createIsParse<Awaited<ReturnType<typeof __${n}TypeAlias>>>()\n);\n`
                  )
                  .join("");

              changes.push([start, width, txt]);
            }
          }
        });

        if (changes.length < 1) {
          return null;
        }
        const imports = useProtoBuff
          ? 'import * as typiaProto from "typia/lib/protobuf";\n' +
            'import { factoryProtoRemoteCall } from "./lib/client";\n'
          : 'import * as typiaJson from "typia/lib/json";\n' +
            'import { factoryRemoteCall } from "./lib/client";\n';

        const magicSource = new MagicString(source);
        magicSource.prepend(imports);

        for (const [start, width, text] of changes) {
          const end = start + width;
          magicSource.overwrite(start, end, text, { contentOnly: true });
        }

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
