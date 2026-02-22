/**
 * Inline value editor: input for scalar values.
 * Dispatches 'mv-edit' with { id, value } on Enter or blur (value coerced by type).
 */

import type { NodeType } from '../types/tree.js';
import { coerceScalarValue } from '../utils/tree-helpers.js';

const styles = `
  .mv-value-editor {
    flex: 1;
    min-width: 80px;
    max-width: 400px;
  }
  .mv-value-editor__input {
    width: 100%;
    font-family: var(--vscode-editor-font-family, ui-monospace, monospace);
    font-size: inherit;
    color: var(--mv-color-text, var(--vscode-editor-foreground));
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: 4px;
    padding: 2px 6px;
    box-sizing: border-box;
  }
  .mv-value-editor__input:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }
`;

export interface MvEditDetail {
  id: string;
  value: string | number | boolean | null;
}

export class MvValueEditorElement extends HTMLElement {
  static readonly tagName = 'mv-value-editor';
  static readonly editEventName = 'mv-edit';

  private input: HTMLInputElement | null = null;
  private _id = '';
  private _type: NodeType = 'string';
  private _value: string | number | boolean | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = `
      <div class="mv-value-editor">
        <input type="text" class="mv-value-editor__input" aria-label="Edit value" />
      </div>
    `;
    this.input = root.querySelector('.mv-value-editor__input');
    this.input?.addEventListener('blur', () => this.submit());
    this.input?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.cancel();
      }
    });
  }

  get id(): string {
    return this._id;
  }

  set id(v: string) {
    this._id = v;
  }

  get type(): NodeType {
    return this._type;
  }

  set type(v: NodeType) {
    this._type = v;
  }

  get value(): string | number | boolean | null {
    return this._value;
  }

  set value(v: string | number | boolean | null) {
    this._value = v ?? null;
    this.updateInput();
  }

  connectedCallback(): void {
    this.updateInput();
    requestAnimationFrame(() => this.input?.focus());
  }

  private updateInput(): void {
    if (!this.input) return;
    const v = this._value;
    if (v === null || v === undefined) {
      this.input.value = 'null';
      return;
    }
    this.input.value = String(v);
  }

  private submit(): void {
    const raw = this.input?.value ?? '';
    const value = coerceScalarValue(raw, this._type);
    this.dispatchEvent(
      new CustomEvent<MvEditDetail>(MvValueEditorElement.editEventName, {
        detail: { id: this._id, value },
        bubbles: true,
        composed: true,
      })
    );
    this.remove();
  }

  private cancel(): void {
    this.dispatchEvent(
      new CustomEvent('mv-edit-cancel', { bubbles: true, composed: true })
    );
    this.remove();
  }
}
