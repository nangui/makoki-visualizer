import type { TreeNode } from '../types/tree.js';

const styles = `
  .mv-node {
    font-family: var(--mv-font-family, var(--vscode-font-family, system-ui, sans-serif));
    font-size: var(--mv-font-size-base, var(--vscode-font-size, 14px));
    color: var(--mv-color-text, var(--vscode-editor-foreground));
  }
  .mv-node__row {
    display: flex;
    align-items: center;
    gap: var(--mv-spacing-sm, 6px);
    min-height: 24px;
    padding: 2px 6px;
    border-radius: 6px;
  }
  .mv-node__row:hover {
    background: color-mix(in srgb, var(--mv-color-text, var(--vscode-editor-foreground)) 8%, transparent);
  }
  .mv-node__toggle {
    width: 18px;
    height: 18px;
    padding: 0;
    border: 1px solid var(--mv-color-border, rgba(128,128,128,0.3));
    border-radius: 4px;
    background: color-mix(in srgb, var(--mv-color-text, var(--vscode-editor-foreground)) 4%, transparent);
    cursor: pointer;
    color: var(--mv-color-text-muted, var(--vscode-descriptionForeground));
    font-size: 11px;
    line-height: 1;
    flex-shrink: 0;
  }
  .mv-node__toggle:disabled {
    cursor: default;
    opacity: 0.45;
  }
  .mv-node__toggle:hover { color: var(--mv-color-text, var(--vscode-editor-foreground)); }
  .mv-node__toggle:focus-visible { outline: 2px solid var(--mv-color-accent, var(--vscode-focusBorder)); outline-offset: 2px; }
  .mv-node__key {
    font-weight: 600;
    flex-shrink: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mv-node__hint {
    font-size: 11px;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 999px;
    border: 1px solid var(--mv-color-border, rgba(128,128,128,0.3));
    color: var(--mv-color-text-muted, var(--vscode-descriptionForeground));
    flex-shrink: 0;
  }
  .mv-node__value-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .mv-node__value-wrap.mv-node__value-wrap--readonly { cursor: default; }
  .mv-node__value {
    color: var(--mv-color-text-muted, var(--vscode-descriptionForeground));
    font-family: var(--vscode-editor-font-family, var(--mv-font-family, ui-monospace, SFMono-Regular, Menlo, monospace));
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mv-node__children {
    margin-left: 14px;
    border-left: 1px solid var(--mv-color-border, rgba(128,128,128,0.3));
    padding-left: 8px;
  }
  .mv-node--collapsed .mv-node__children { display: none; }
  .mv-node--hidden { display: none !important; }
  .mv-node__row.mv-node__row--match {
    background: color-mix(in srgb, var(--vscode-editor-findMatchHighlight-background, rgba(255, 200, 0, 0.3)) 60%, transparent);
  }
`;

import { MvValueEditorElement } from './mv-value-editor.js';

export class MvNodeElement extends HTMLElement {
  static readonly tagName = 'mv-node';
  private _node: TreeNode | null = null;
  private _depth = 0;
  private _readOnly = false;
  private _searchQuery = '';
  private _matchingIds: Set<string> | null = null;
  private toggleBtn: HTMLButtonElement | null = null;
  private keySpan: HTMLSpanElement | null = null;
  private hintSpan: HTMLSpanElement | null = null;
  private valueWrap: HTMLDivElement | null = null;
  private valueSpan: HTMLSpanElement | null = null;
  private childrenSlot: HTMLDivElement | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = `
      <div class="mv-node" role="treeitem" aria-expanded="true">
        <div class="mv-node__row">
          <button type="button" class="mv-node__toggle" aria-label="Collapse" tabindex="0"></button>
          <span class="mv-node__key"></span>
          <span class="mv-node__hint" hidden></span>
          <div class="mv-node__value-wrap">
            <span class="mv-node__value"></span>
          </div>
        </div>
        <div class="mv-node__children" role="group"></div>
      </div>
    `;
    const wrap = root.querySelector('.mv-node') as HTMLDivElement;
    this.toggleBtn = root.querySelector('.mv-node__toggle');
    this.keySpan = root.querySelector('.mv-node__key');
    this.hintSpan = root.querySelector('.mv-node__hint');
    this.valueWrap = root.querySelector('.mv-node__value-wrap');
    this.valueSpan = root.querySelector('.mv-node__value');
    this.childrenSlot = root.querySelector('.mv-node__children');
    this.toggleBtn?.addEventListener('click', () => this.toggle());
    this.toggleBtn?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
    this.valueWrap?.addEventListener('dblclick', (e: Event) => this.onValueDoubleClick(e));
  }

  private onValueDoubleClick(e: Event): void {
    if (this._readOnly || !this._node) return;
    const n = this._node;
    const isScalar = n.type !== 'object' && n.type !== 'array';
    if (!isScalar || this.valueSpan?.hidden) return;
    e.stopPropagation();
    this.openValueEditor();
  }

  private openValueEditor(): void {
    const n = this._node;
    if (!n || !this.valueWrap || !this.valueSpan) return;
    const editor = document.createElement(MvValueEditorElement.tagName) as MvValueEditorElement;
    editor.id = n.id;
    editor.type = n.type;
    editor.value = n.value ?? null;
    const onDone = (): void => {
      editor.removeEventListener(MvValueEditorElement.editEventName, onEdit);
      editor.removeEventListener('mv-edit-cancel', onDone);
      this.valueSpan!.hidden = false;
    };
    const onEdit = (): void => onDone();
    editor.addEventListener(MvValueEditorElement.editEventName, onEdit);
    editor.addEventListener('mv-edit-cancel', onDone);
    this.valueSpan.hidden = true;
    this.valueWrap.appendChild(editor);
  }

  get node(): TreeNode | null {
    return this._node;
  }

  set node(v: TreeNode | null) {
    this._node = v ?? null;
    this.render();
  }

  get depth(): number {
    return this._depth;
  }

  set depth(v: number) {
    this._depth = v;
  }

  get readOnly(): boolean {
    return this._readOnly;
  }

  set readOnly(v: boolean) {
    this._readOnly = !!v;
    this.valueWrap?.classList.toggle('mv-node__value-wrap--readonly', this._readOnly);
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(v: string) {
    const next = typeof v === 'string' ? v : '';
    if (next === this._searchQuery) return;
    this._searchQuery = next;
    if (this._node) this.render();
  }

  get matchingIds(): Set<string> | null {
    return this._matchingIds;
  }

  set matchingIds(v: Set<string> | null) {
    const next = v ?? null;
    if (next === this._matchingIds) return;
    this._matchingIds = next;
    if (this._node) this.render();
  }

  private toggle(): void {
    if (!this._node || !this.hasChildren) return;
    this._node.collapsed = !this._node.collapsed;
    this.render();
  }

  private get hasChildren(): boolean {
    return !!this._node?.children?.length;
  }

  private nodeMatchesQuery(): boolean {
    const n = this._node;
    const q = this._searchQuery.trim().toLowerCase();
    if (!n || !q) return false;
    const keyMatch = (n.key ?? '').toLowerCase().includes(q);
    const valueStr = n.value !== undefined && n.value !== null ? String(n.value) : '';
    return keyMatch || valueStr.toLowerCase().includes(q);
  }

  private render(): void {
    const n = this._node;
    if (!n || !this.keySpan || !this.hintSpan || !this.valueSpan || !this.childrenSlot || !this.toggleBtn) return;
    const wrap = this.shadowRoot?.querySelector('.mv-node') as HTMLDivElement;
    const row = this.shadowRoot?.querySelector('.mv-node__row') as HTMLDivElement;
    if (!wrap || !row) return;

    const hidden = this._searchQuery.length > 0 && this._matchingIds !== null && !this._matchingIds.has(n.id);
    const match = this._searchQuery.length > 0 && this.nodeMatchesQuery();
    wrap.classList.toggle('mv-node--hidden', hidden);
    row.classList.toggle('mv-node__row--match', match);

    const displayKey = n.key || '(root)';
    this.keySpan.textContent = displayKey;
    this.keySpan.setAttribute('title', displayKey);

    const isCollapsible = this.hasChildren;
    this.toggleBtn.disabled = !isCollapsible;
    this.toggleBtn.setAttribute('aria-label', n.collapsed ? 'Expand' : 'Collapse');
    this.toggleBtn.textContent = isCollapsible ? (n.collapsed ? '▸' : '▾') : '·';

    if (n.type === 'object' || n.type === 'array') {
      const count = n.children?.length ?? 0;
      this.hintSpan.textContent = `${n.type} (${count})`;
      this.hintSpan.hidden = false;
      this.valueSpan.textContent = '';
      this.valueSpan.hidden = true;
    } else {
      this.hintSpan.textContent = '';
      this.hintSpan.hidden = true;
      if (n.value !== undefined) {
        this.valueSpan.textContent = n.type === 'string' ? `"${String(n.value)}"` : String(n.value);
        this.valueSpan.hidden = false;
      } else {
        this.valueSpan.textContent = '';
        this.valueSpan.hidden = true;
      }
    }

    wrap.setAttribute('aria-expanded', isCollapsible ? String(!n.collapsed) : 'false');
    wrap.classList.toggle('mv-node--collapsed', !!n.collapsed);

    this.childrenSlot.hidden = !isCollapsible || !!n.collapsed;
    this.childrenSlot.innerHTML = '';
    if (isCollapsible && !n.collapsed && n.children) {
      for (const child of n.children) {
        const childEl = document.createElement(MvNodeElement.tagName) as MvNodeElement;
        childEl.node = child;
        childEl.depth = this._depth + 1;
        childEl.readOnly = this._readOnly;
        childEl.searchQuery = this._searchQuery;
        childEl.matchingIds = this._matchingIds;
        this.childrenSlot.appendChild(childEl);
      }
    }

    this.valueWrap?.classList.toggle('mv-node__value-wrap--readonly', this._readOnly);
  }
}
