import * as ts from "typescript";

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile): ts.SourceFile => {
    const handleBlocks: ts.Block[] = [];

    const visitor: ts.Visitor = (node) => {
      if (
        ts.isFunctionDeclaration(node) &&
        node.modifiers?.some(
          (mod) => mod.kind === ts.SyntaxKind.ExportKeyword
        ) &&
        ts.isSourceFile(node.parent) &&
        node.parent.fileName.endsWith(".api.ts")
      ) {
        const functionName = node.name?.text;
        if (!functionName) {
          return node;
        }
        const handlerName = `${node.parent.fileName.replace(
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
                      ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("typiaJson"),
                        ts.factory.createIdentifier("createIsParse")
                      ),
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
                      ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("typiaJson"),
                        ts.factory.createIdentifier("createStringify")
                      ),
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
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("tsRemoteServer"),
                  ts.factory.createIdentifier("registerHandler")
                ),
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

        handleBlocks.push(handlerBlock);
        return node;
      }

      return ts.visitEachChild(node, visitor, context);
    };

    ts.visitNode(sourceFile, visitor);

    if (
      ts.isSourceFile(sourceFile) &&
      sourceFile.fileName.endsWith(".api.ts")
    ) {
      // Create a new SourceFile with the desired changes
      const updatedSourceFile = ts.factory.updateSourceFile(sourceFile, [
        ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamespaceImport(
              ts.factory.createIdentifier("typiaJson")
            )
          ),
          ts.factory.createStringLiteral("typia/lib/json"),
          undefined
        ),
        ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamespaceImport(
              ts.factory.createIdentifier("tsRemoteServer")
            )
          ),
          ts.factory.createStringLiteral("./server"),
          undefined
        ),
        ...sourceFile.statements,
        ...handleBlocks,
      ]);

      return updatedSourceFile;
    }

    return sourceFile;
  };
};

export default transformer;
