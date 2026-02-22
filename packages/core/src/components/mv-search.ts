/**
 * Search filter bar: filters tree by key/value in real time.
 * Dispatches 'mv-search' with { query: string } on input.
 */

const styles = `
  .mv-search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .mv-search__label {
    font-size: 0.9em;
    color: var(--mv-color-text-muted, var(--vscode-descriptionForeground));
    flex-shrink: 0;
  }
  .mv-search__input {
    flex: 1;
    min-width: 120px;
    max-width: 320px;
    font-family: inherit;
    font-size: inherit;
    color: var(--mv-color-text, var(--vscode-editor-foreground));
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: 6px;
    padding: 6px 10px;
    box-sizing: border-box;
  }
  .mv-search__input::placeholder {
    color: var(--vscode-input-placeholderForeground);
  }
  .mv-search__input:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }
`;

export const MvSearchEventName = 'mv-search';

export class MvSearchElement extends HTMLElement {
  static readonly tagName = 'mv-search';
  private input: HTMLInputElement | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    root.adoptedStyleSheets = [sheet];
    root.innerHTML = `
      <div class="mv-search">
        <span class="mv-search__label" aria-hidden="true">Search</span>
        <input type="search" class="mv-search__input" placeholder="Filter keys or values…" aria-label="Filter tree by key or value" autocomplete="off" />
      </div>
    `;
    this.input = root.querySelector('.mv-search__input');
    const emit = () => this.emitSearch();
    this.input?.addEventListener('input', emit);
    this.input?.addEventListener('keyup', emit);
    this.input?.addEventListener('change', emit);
    this.input?.addEventListener('search', emit);
  }

  private emitSearch(): void {
    const query = this.input?.value?.trim() ?? '';
    this.dispatchEvent(
      new CustomEvent(MvSearchEventName, {
        detail: { query },
        bubbles: true,
        composed: true,
      })
    );
  }
}
