import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('makoki.openVisualizer', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('Open a YAML or JSON file first.');
        return;
      }
      const doc = editor.document;
      const lang = doc.languageId;
      if (lang !== 'yaml' && lang !== 'yml' && lang !== 'json' && lang !== 'jsonc') {
        vscode.window.showInformationMessage('Makoki Visualizer supports YAML and JSON only.');
        return;
      }
      try {
        const panelModule = await import('./panel.js');
        panelModule.createOrShowPanel(context, doc);
      } catch (err) {
        console.error('[Makoki Visualizer] command execution failed:', err);
        void vscode.window.showErrorMessage(
          'Makoki Visualizer failed to open: ' + (err instanceof Error ? err.message : String(err))
        );
      }
    })
  );
}

export function deactivate(): void {}
