import * as vscode from 'vscode';

/**
 * Subscribes to text document changes and calls the handler when the active
 * document is a YAML or JSON file that we might be visualizing.
 */
export function subscribeToDocumentChanges(
  handler: (document: vscode.TextDocument) => void
): vscode.Disposable {
  return vscode.workspace.onDidChangeTextDocument((e) => {
    const doc = e.document;
    if (doc.languageId === 'yaml' || doc.languageId === 'json' || doc.languageId === 'jsonc') {
      handler(doc);
    }
  });
}
