import * as vscode from 'vscode';
import { parseYaml, parseJsonc, serialize, findNodeById, valueToJsonString, valueToYamlString } from 'core/node';
import type { SerializeFormat } from 'core/node';
import { subscribeToDocumentChanges } from './sync.js';

let currentPanel: vscode.WebviewPanel | undefined;
let currentDocumentUri: vscode.Uri | undefined;
let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) outputChannel = vscode.window.createOutputChannel('Makoki Visualizer');
  return outputChannel;
}

export function createOrShowPanel(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument
): void {
  const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

  if (currentPanel) {
    currentPanel.reveal(column);
    currentDocumentUri = document.uri;
    sendParsedContent(currentPanel.webview, document);
    return;
  }

  currentPanel = vscode.window.createWebviewPanel(
    'makokiVisualizer',
    'Makoki Visualizer',
    column,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'out')],
      retainContextWhenHidden: true,
    }
  );

  currentDocumentUri = document.uri;
  currentPanel.webview.html = getWebviewHtml(currentPanel.webview, context.extensionUri);
  sendParsedContent(currentPanel.webview, document);

  currentPanel.webview.onDidReceiveMessage(
    (msg: { type: string; id?: string; value?: string | number | boolean | null; message?: string }) => {
      if (msg.type === 'log' && typeof msg.message === 'string') {
        const channel = getOutputChannel();
        channel.appendLine(`[Webview] ${msg.message}`);
        channel.show(true);
      }
      if (msg.type === 'edit' && msg.id != null && msg.value !== undefined) {
        handleEditRequest(msg.id, msg.value);
      }
      if (msg.type === 'ready') {
        refreshPanelContent();
      }
    },
    undefined,
    context.subscriptions
  );

  context.subscriptions.push(
    subscribeToDocumentChanges((doc) => {
      if (currentPanel?.webview && currentDocumentUri && doc.uri.toString() === currentDocumentUri.toString()) {
        sendParsedContent(currentPanel.webview, doc);
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!currentPanel?.webview || !currentDocumentUri) return;
      const doc = editor?.document;
      if (doc && !doc.isClosed && doc.uri.toString() === currentDocumentUri.toString()) {
        sendParsedContent(currentPanel.webview, doc);
      }
    })
  );

  currentPanel.onDidChangeViewState((e) => {
    if (!e.webviewPanel.visible) return;
    refreshPanelContent();
    setTimeout(() => refreshPanelContent(), 250);
  }, null, context.subscriptions);

  currentPanel.onDidDispose(
    () => {
      currentPanel = undefined;
      currentDocumentUri = undefined;
    },
    null,
    context.subscriptions
  );
}

function refreshPanelContent(): void {
  if (!currentPanel?.webview || !currentDocumentUri) return;
  void vscode.workspace.openTextDocument(currentDocumentUri).then((doc) => {
    if (doc.isClosed) return;
    if (currentPanel?.webview && currentDocumentUri && doc.uri.toString() === currentDocumentUri.toString()) {
      sendParsedContent(currentPanel.webview, doc);
    }
  });
}

function sendParsedContent(webview: vscode.Webview, document: vscode.TextDocument): void {
  if (document.isClosed) return;
  const text = document.getText();
  const lang = document.languageId;
  const format: SerializeFormat = lang === 'yaml' ? 'yaml' : 'json';
  const result = format === 'yaml' ? parseYaml(text) : parseJsonc(text);
  const isReadonly = (document as { isReadonly?: boolean }).isReadonly ?? false;
  webview.postMessage({
    type: 'init',
    roots: result.roots,
    errors: result.errors,
    isReadonly,
  });
}

async function handleEditRequest(nodeId: string, value: string | number | boolean | null): Promise<void> {
  if (!currentDocumentUri) return;
  let doc: vscode.TextDocument;
  try {
    doc = await vscode.workspace.openTextDocument(currentDocumentUri);
  } catch {
    return;
  }
  if (doc.isClosed || (doc as { isReadonly?: boolean }).isReadonly) return;
  const text = doc.getText();
  const textLen = text.length;
  const lang = doc.languageId;
  const format: SerializeFormat = lang === 'yaml' ? 'yaml' : 'json';
  const result = format === 'yaml' ? parseYaml(text) : parseJsonc(text);
  const node = findNodeById(result.roots, nodeId);
  if (!node) return;
  node.value = value;

  const edit = new vscode.WorkspaceEdit();
  const start = node.rangeStart;
  const end = node.rangeEnd;
  const rangeValid =
    typeof start === 'number' &&
    typeof end === 'number' &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start >= 0 &&
    end <= textLen &&
    start < end;

  let useMinimalEdit = rangeValid;
  if (useMinimalEdit) {
    try {
      const startPos = doc.positionAt(start!);
      const endPos = doc.positionAt(end!);
      if (startPos.line < 0 || startPos.character < 0 || endPos.line < 0 || endPos.character < 0) {
        useMinimalEdit = false;
      } else {
        const replaceText = format === 'json' ? valueToJsonString(value, node.type) : valueToYamlString(value, node.type);
        edit.replace(currentDocumentUri, new vscode.Range(startPos, endPos), replaceText);
      }
    } catch {
      useMinimalEdit = false;
    }
  }
  if (!useMinimalEdit) {
    const newText = serialize(result.roots, format);
    edit.replace(currentDocumentUri, new vscode.Range(doc.positionAt(0), doc.positionAt(textLen)), newText);
  }

  try {
    const applied = await vscode.workspace.applyEdit(edit);
    if (applied) {
      const docAfter = await vscode.workspace.openTextDocument(currentDocumentUri);
      if (!docAfter.isClosed) await docAfter.save();
    }
  } catch {
    // Editor may be closed or save not supported; edit was still applied in memory
  }
}

function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'out', 'webview.js'));
  const csp = `default-src 'none'; script-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline';`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Makoki Visualizer</title>
  <style>
    body {
      font-family: var(--vscode-font-family, system-ui, sans-serif);
      font-size: var(--vscode-font-size, 14px);
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      margin: 0;
      padding: 14px;
      box-sizing: border-box;
    }
    .mv-shell {
      max-width: 1100px;
      margin: 0 auto;
    }
    h1 { font-size: 1.05em; margin: 0 0 4px 0; font-weight: 650; letter-spacing: 0.2px; }
    .mv-subtitle {
      margin: 0 0 10px 0;
      color: var(--vscode-descriptionForeground);
      font-size: 0.92em;
    }
    .mv-error { color: var(--vscode-editorError-foreground); }
  </style>
</head>
<body>
  <main class="mv-shell">
    <h1>Makoki Visualizer</h1>
    <p class="mv-subtitle">YAML / JSON structure view</p>
    <div id="mv-errors" class="mv-error" aria-live="polite" hidden></div>
    <div id="mv-search-wrap"><mv-search></mv-search></div>
    <div id="mv-tree-root"><mv-tree></mv-tree></div>
  </main>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
}
