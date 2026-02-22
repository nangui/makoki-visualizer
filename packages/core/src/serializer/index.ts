/**
 * Serializers: TreeNode[] → YAML/JSON string.
 */

import type { TreeNode } from '../types/tree.js';
import { treeToYaml } from './tree-to-yaml.js';
import { treeToJson } from './tree-to-json.js';

export { treeToYaml } from './tree-to-yaml.js';
export { treeToJson } from './tree-to-json.js';

/** Format for serialization (matches ParseFormat). */
export type SerializeFormat = 'yaml' | 'json';

/** Serialize roots to YAML or JSON string. */
export function serialize(roots: TreeNode[], format: SerializeFormat): string {
  return format === 'yaml' ? treeToYaml(roots) : treeToJson(roots);
}
