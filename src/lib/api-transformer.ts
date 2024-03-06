import * as ts from "typescript";

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile): ts.SourceFile => {
    const fileName = sourceFile.fileName;
    if (!fileName.endsWith(".api.ts")) {
      return sourceFile;
    }

    const registerBlocks: ts.Statement[] = [];

    const visitor: ts.Visitor = (node) => {
      if (
        ts.isFunctionDeclaration(node) &&
        node.modifiers?.some(ts.isExportSpecifier)
      ) {
        const functionName = node.name?.text;
        if (!functionName) {
          return node;
        }
        const handlerName = `${fileName.replace(
          ".api.ts",
          ""
        )}-${functionName}`;

        const handlerBlock = ts.factory.createBlock(
          [
            ts.factory.createVariableStatement(
              undefined,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.createVariableDeclaration(
                    ts.factory.createIdentifier("parseParams"),
                    undefined,
                    undefined,
                    ts.factory.createCallExpression(
                      ts.factory.createIdentifier("createIsParse"),
                      [
                        ts.factory.createTypeReferenceNode(
                          ts.factory.createIdentifier("Parameters"),
                          [
                            ts.factory.createTypeQueryNode(
                              ts.factory.createIdentifier(functionName),
                              undefined
                            ),
                          ]
                        ),
                      ],
                      []
                    )
                  ),
                ],
                ts.NodeFlags.Const | ts.NodeFlags.Constant
              )
            ),
            ts.factory.createVariableStatement(
              undefined,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.createVariableDeclaration(
                    ts.factory.createIdentifier("stringifyResponse"),
                    undefined,
                    undefined,
                    ts.factory.createCallExpression(
                      ts.factory.createIdentifier("createStringify"),
                      [
                        ts.factory.createTypeReferenceNode(
                          ts.factory.createIdentifier("Awaited"),
                          [
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("ReturnType"),
                              [
                                ts.factory.createTypeQueryNode(
                                  ts.factory.createIdentifier(functionName),
                                  undefined
                                ),
                              ]
                            ),
                          ]
                        ),
                      ],
                      []
                    )
                  ),
                ],
                ts.NodeFlags.Const |
                  ts.NodeFlags.Constant |
                  ts.NodeFlags.Constant
              )
            ),
            ts.factory.createExpressionStatement(
              ts.factory.createCallExpression(
                ts.factory.createIdentifier("registerHandler"),
                undefined,
                [
                  ts.factory.createIdentifier(functionName),
                  ts.factory.createStringLiteral(handlerName),
                  ts.factory.createIdentifier("parseParams"),
                  ts.factory.createIdentifier("stringifyResponse"),
                ]
              )
            ),
          ],
          true
        );

        registerBlocks.push(handlerBlock);
      }
      return ts.visitEachChild(node, visitor, context);
    };

    ts.visitNode(sourceFile, visitor);

    sourceFile = ts.factory.updateSourceFile(sourceFile, [
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier("createIsParse")
            ),
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier("createStringify")
            ),
          ])
        ),
        ts.factory.createStringLiteral("typia/lib/json"),
        undefined
      ),
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier("registerHandler")
            ),
          ])
        ),
        ts.factory.createStringLiteral("./server"),
        undefined
      ),
      // Ensures the rest of the source files statements are still defined.
      ...sourceFile.statements,
      ...registerBlocks,
    ]);

    return sourceFile;
  };
};

export default transformer;
