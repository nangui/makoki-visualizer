import { MvNodeElement } from './mv-node.js';
import { MvSearchElement } from './mv-search.js';
import { MvTreeElement } from './mv-tree.js';
import { MvValueEditorElement } from './mv-value-editor.js';

export { MvNodeElement } from './mv-node.js';
export { MvSearchElement } from './mv-search.js';
export { MvTreeElement } from './mv-tree.js';
export { MvValueEditorElement } from './mv-value-editor.js';

export function registerComponents(): void {
  if (!customElements.get(MvValueEditorElement.tagName)) {
    customElements.define(MvValueEditorElement.tagName, MvValueEditorElement);
  }
  if (!customElements.get(MvSearchElement.tagName)) {
    customElements.define(MvSearchElement.tagName, MvSearchElement);
  }
  if (!customElements.get(MvNodeElement.tagName)) {
    customElements.define(MvNodeElement.tagName, MvNodeElement);
  }
  if (!customElements.get(MvTreeElement.tagName)) {
    customElements.define(MvTreeElement.tagName, MvTreeElement);
  }
}
