import type { TreeNode } from '../types/tree.js';
import { getMatchingNodeIds } from '../utils/tree-helpers.js';
import { MvSearchEventName } from './mv-search.js';
import { MvNodeElement } from './mv-node.js';

const styles = `
  .mv-tree {
    font-family: var(--mv-font-family, var(--vscode-font-family, system-ui, sans-serif));
    font-size: var(--mv-font-size-base, var(--vscode-font-size, 14px));
    color: var(--mv-color-text, var(--vscode-editor-foreground));
    padding: 4px;
    box-sizing: border-box;
  }
  .mv-tree__list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0;
    outline: none;
    border: 1px solid var(--mv-color-border, rgba(128,128,128,0.3));
    border-radius: 8px;
    background: color-mix(in srgb, var(--mv-color-text, var(--vscode-editor-foreground)) 2%, transparent);
    padding: 6px;
  }
  .mv-tree__list:focus-visible { outline: 2px solid var(--mv-color-accent, var(--vscode-focusBorder)); outline-offset: 2px; }
  .mv-tree__empty {
    color: var(--mv-color-text-muted, var(--vscode-descriptionForeground));
    padding: 8px;
  }
`;

export class MvTreeElement extends HTMLElement {
  static readonly tagName = 'mv-tree';
  private _roots: TreeNode[] = [];
  private _readOnly = false;
  private _searchQuery = '';
  private _matchingIds: Set<string> | null = null;
  private listEl: HTMLDivElement | null = null;
  private _searchHandler = (e: Event): void => {
    const q = (e as CustomEvent<{ query?: string }>).detail?.query ?? '';
    this.searchQuery = q;
  };

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = `
      <div class="mv-tree">
        <div class="mv-tree__list" role="tree" aria-label="Tree view"></div>
      </div>
    `;
    this.listEl = root.querySelector('.mv-tree__list');
  }

  connectedCallback(): void {
    document.addEventListener(MvSearchEventName, this._searchHandler);
  }

  disconnectedCallback(): void {
    document.removeEventListener(MvSearchEventName, this._searchHandler);
  }

  get roots(): TreeNode[] {
    return this._roots;
  }

  set roots(v: TreeNode[]) {
    this._roots = Array.isArray(v) ? v : [];
    this._matchingIds = getMatchingNodeIds(this._roots, this._searchQuery);
    this.render();
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(v: string) {
    const next = typeof v === 'string' ? v : '';
    if (next === this._searchQuery) return;
    this._searchQuery = next;
    this._matchingIds = getMatchingNodeIds(this._roots, this._searchQuery);
    this.render();
  }

  get readOnly(): boolean {
    return this._readOnly;
  }

  set readOnly(v: boolean) {
    this._readOnly = !!v;
    this.render();
  }

  private render(): void {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';
    if (this._roots.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'mv-tree__empty';
      empty.textContent = 'No nodes to display.';
      this.listEl.appendChild(empty);
      return;
    }
    for (const node of this._roots) {
      const nodeEl = document.createElement(MvNodeElement.tagName) as MvNodeElement;
      nodeEl.node = node;
      nodeEl.depth = 0;
      nodeEl.readOnly = this._readOnly;
      nodeEl.searchQuery = this._searchQuery;
      nodeEl.matchingIds = this._matchingIds;
      this.listEl.appendChild(nodeEl);
    }
  }
}
