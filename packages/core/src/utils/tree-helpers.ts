/**
 * Tree helpers: find node by id, coerce scalar value for editing, format value for JSON replace.
 * Used by the extension when applying edits and by the UI for validation.
 */

import type { NodeType, TreeNode } from '../types/tree.js';

/** Format a scalar value as it should appear in a JSON/JSONC document (for minimal edit). */
export function valueToJsonString(
  value: string | number | boolean | null,
  type: NodeType
): string {
  if (type === 'string') return JSON.stringify(value);
  if (value === null || type === 'null') return 'null';
  if (type === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

/** Format a scalar value for YAML (for minimal edit). Quotes strings when needed. */
export function valueToYamlString(
  value: string | number | boolean | null,
  type: NodeType
): string {
  if (value === null || type === 'null') return 'null';
  if (type === 'boolean') return value ? 'true' : 'false';
  if (type === 'number') return String(value);
  const s = String(value);
  if (/[\n\r:#\[\]{}|>*&!%'",\s]|^[-?]|\s$/.test(s) || s === '') return JSON.stringify(s);
  return s;
}

/**
 * Returns the set of node ids that are visible for the given search query:
 * a node is visible if it matches (key or value contains query, case-insensitive)
 * or has any visible descendant. Returns null when query is empty (no filter).
 */
export function getMatchingNodeIds(roots: TreeNode[], query: string): Set<string> | null {
  const q = query.trim().toLowerCase();
  if (q === '') return null;

  const visible = new Set<string>();

  function nodeMatches(node: TreeNode): boolean {
    const keyMatch = (node.key ?? '').toLowerCase().includes(q);
    const valueStr = node.value !== undefined && node.value !== null ? String(node.value) : '';
    const valueMatch = valueStr.toLowerCase().includes(q);
    return keyMatch || valueMatch;
  }

  function walk(node: TreeNode): boolean {
    let childVisible = false;
    if (node.children) {
      for (const child of node.children) {
        if (walk(child)) childVisible = true;
      }
    }
    const matches = nodeMatches(node);
    if (matches || childVisible) {
      visible.add(node.id);
      return true;
    }
    return false;
  }

  for (const root of roots) walk(root);
  return visible;
}

/** Find a node by its id in a forest of roots. Returns null if not found. */
export function findNodeById(roots: TreeNode[], id: string): TreeNode | null {
  for (const root of roots) {
    const found = findInNode(root, id);
    if (found) return found;
  }
  return null;
}

function findInNode(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findInNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Coerce a string (from an inline input) to the target scalar type.
 * Preserves type: no implicit coercion that would change the kind of value.
 */
export function coerceScalarValue(
  raw: string,
  type: NodeType
): string | number | boolean | null {
  switch (type) {
    case 'string':
      return raw;
    case 'number': {
      const trimmed = raw.trim();
      if (trimmed === '') return 0;
      const n = Number(raw);
      return Number.isNaN(n) ? 0 : n;
    }
    case 'boolean': {
      const lower = raw.toLowerCase().trim();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0' || lower === '') return false;
      return raw as unknown as boolean;
    }
    case 'null':
      if (raw.trim() === '' || raw.toLowerCase().trim() === 'null') return null;
      return raw;
    default:
      return raw;
  }
}
