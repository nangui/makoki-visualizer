/**
 * Node-safe entry point for core.
 * Exports only types, parsers and serializers — no DOM/Web Component code.
 * Use this entry when running in Node.js contexts (e.g. VS Code extension host).
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

export { findNodeById, valueToJsonString, valueToYamlString } from './utils/tree-helpers.js';
