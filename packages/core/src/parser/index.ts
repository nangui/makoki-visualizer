/**
 * Parsers: YAML and JSON/JSONC → TreeNode[].
 * Single entry point for the core package.
 */

import type { TreeNode } from '../types/tree.js';
import { parseYaml } from './yaml-to-tree.js';
import { parseJsonc } from './jsonc-to-tree.js';

export {
  parseYaml,
  type ParseYamlResult,
  type ParseYamlError,
} from './yaml-to-tree.js';

export {
  parseJsonc,
  type ParseJsoncResult,
  type ParseJsoncError,
} from './jsonc-to-tree.js';

export type { TreeNode } from '../types/tree.js';

/** Supported parse formats. */
export type ParseFormat = 'yaml' | 'json';

/** Union result: roots + errors (line + message). */
export interface ParseResult {
  roots: TreeNode[];
  errors: Array<{ line?: number; message: string }>;
}

/**
 * Parse content as YAML or JSON/JSONC. Delegates to parseYaml or parseJsonc.
 */
export function parse(content: string, format: ParseFormat): ParseResult {
  return format === 'yaml' ? parseYaml(content) : parseJsonc(content);
}
