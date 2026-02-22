import * as vscode from 'vscode';
import { createOrShowPanel } from './panel.js';

export function activate(context: vscode.ExtensionContext): void {
  try {
    context.subscriptions.push(
      vscode.commands.registerCommand('makoki.openVisualizer', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('Open a YAML or JSON file first.');
        return;
      }
      const doc = editor.document;
      const lang = doc.languageId;
      if (lang !== 'yaml' && lang !== 'json' && lang !== 'jsonc') {
        vscode.window.showInformationMessage('Makoki Visualizer supports YAML and JSON only.');
        return;
      }
      createOrShowPanel(context, doc);
    })
    );
  } catch (err) {
    console.error('[Makoki Visualizer] activate failed:', err);
    void vscode.window.showErrorMessage(
      'Makoki Visualizer failed to activate: ' + (err instanceof Error ? err.message : String(err))
    );
  }
}

export function deactivate(): void {}
