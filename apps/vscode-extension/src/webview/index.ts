/**
 * Webview entry: registers MV components and listens for init messages.
 * Loaded by the panel HTML via script src (asWebviewUri).
 */
declare function acquireVsCodeApi(): { postMessage(msg: unknown): void; getState(): unknown; setState(state: unknown): void };

import { registerComponents } from 'core';

registerComponents();

const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

function getTreeEl(): HTMLElement | null {
  return document.getElementById('mv-tree-root');
}

function getErrorsEl(): HTMLElement | null {
  return document.getElementById('mv-errors');
}

function renderErrors(errors: Array<{ line?: number; message: string }>): void {
  const el = getErrorsEl();
  if (!el) return;
  if (!errors || errors.length === 0) {
    el.textContent = '';
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.textContent = errors.map((e) => (e.line ? `Line ${e.line}: ` : '') + e.message).join(' ');
}

function getTree(): { roots?: unknown[]; readOnly?: boolean; searchQuery?: string } | null {
  return getTreeEl()?.querySelector('mv-tree') as { roots?: unknown[]; readOnly?: boolean; searchQuery?: string } | null;
}

function renderRoots(roots: unknown[], isReadonly?: boolean): void {
  const tree = getTree();
  if (tree) {
    if (typeof tree.roots !== 'undefined') tree.roots = Array.isArray(roots) ? roots : [];
    if (typeof tree.readOnly !== 'undefined') tree.readOnly = !!isReadonly;
  }
}

function onSearch(e: Event): void {
  const detail = (e as CustomEvent<{ query?: string }>).detail;
  const query = detail?.query ?? '';
  const tree = getTree();
  if (tree && 'searchQuery' in tree) {
    (tree as { searchQuery: string }).searchQuery = query;
  }
}

document.addEventListener('mv-search', onSearch);

if (vscode) {
  window.addEventListener('message', (event: MessageEvent) => {
    const msg = event.data;
    if (msg?.type === 'init') {
      renderErrors(msg.errors ?? []);
      renderRoots(msg.roots ?? [], msg.isReadonly);
    }
  });

  document.addEventListener('mv-edit', ((e: CustomEvent<{ id: string; value: string | number | boolean | null }>) => {
    if (!e.detail?.id) return;
    vscode.postMessage({ type: 'edit', id: e.detail.id, value: e.detail.value });
  }) as EventListener);

  vscode.postMessage({ type: 'ready' });
}
