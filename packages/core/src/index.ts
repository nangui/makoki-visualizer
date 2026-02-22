/**
 * Makoki Visualizer — shared core.
 * Types, parsers, serializers, and Web Components used by the extension and web app.
 */

export type { NodeType, TreeNode } from './types/tree.js';

export {
  parse,
  parseYaml,
  parseJsonc,
  type ParseFormat,
  type ParseResult,
  type ParseYamlResult,
  type ParseYamlError,
  type ParseJsoncResult,
  type ParseJsoncError,
} from './parser/index.js';

export {
  serialize,
  treeToYaml,
  treeToJson,
  type SerializeFormat,
} from './serializer/index.js';

export {
  registerComponents,
  MvNodeElement,
  MvTreeElement,
} from './components/index.js';
