/**
 * TreeNode[] → JSON string.
 * Converts the tree to a plain value and stringifies. Comment/trailing-comma (JSONC) not preserved.
 */

import type { TreeNode } from '../types/tree.js';

/** Serialize roots to a JSON string. First root only (single document). */
export function treeToJson(roots: TreeNode[]): string {
  if (roots.length === 0) return '';

  const value = treeNodeToValue(roots[0]);
  return JSON.stringify(value, null, 2);
}

function treeNodeToValue(node: TreeNode): unknown {
  if (node.type === 'object' && node.children) {
    const obj: Record<string, unknown> = {};
    for (const child of node.children) {
      obj[child.key] = treeNodeToValue(child);
    }
    return obj;
  }

  if (node.type === 'array' && node.children) {
    return node.children.map((child) => treeNodeToValue(child));
  }

  return node.value ?? null;
}
