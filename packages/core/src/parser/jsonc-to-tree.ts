/**
 * JSON/JSONC → TreeNode[] (single root).
 * Uses `jsonc-parser` parseTree; supports comments and trailing commas.
 */

import { parseTree, getNodePath, getNodeValue, type Node as JsoncNode, type ParseError } from 'jsonc-parser';
import type { NodeType, TreeNode } from '../types/tree.js';

/** Result of parsing JSON/JSONC: one root and optional parse errors. */
export interface ParseJsoncResult {
  roots: TreeNode[];
  errors: ParseJsoncError[];
}

export interface ParseJsoncError {
  line?: number;
  message: string;
}

const JSONC_OPTIONS = { allowTrailingComma: true, allowEmptyContent: false };

/** Parses JSON or JSONC string. Returns one root (or empty) and errors. */
export function parseJsonc(content: string): ParseJsoncResult {
  const parseErrors: ParseError[] = [];
  const root = parseTree(content, parseErrors, JSONC_OPTIONS);

  const errors: ParseJsoncError[] = parseErrors.map((e) => {
    const line = (e as { line?: number }).line;
    return {
      line: line !== undefined ? line + 1 : undefined,
      message: String(e.error),
    };
  });

  if (!root) {
    return { roots: [], errors };
  }

  const treeRoot = jsoncNodeToTreeNode(root, '', '');
  return { roots: [treeRoot], errors };
}

function pathToId(path: (string | number)[]): string {
  return path.map((s) => (typeof s === 'number' ? String(s) : s)).join('.');
}

function jsoncNodeToTreeNode(
  node: JsoncNode,
  parentId: string,
  key: string
): TreeNode {
  const path = getNodePath(node);
  const id = path.length > 0 ? pathToId(path) : '';

  switch (node.type) {
    case 'object': {
      const children = (node.children ?? [])
        .filter((c): c is JsoncNode => c.type === 'property')
        .map((prop) => propertyToTreeNode(prop, id));
      return {
        id,
        key,
        type: 'object',
        children,
        line: lineFromOffset(node.offset, node.offset + node.length),
      };
    }
    case 'array': {
      const children = (node.children ?? []).map((child, i) =>
        jsoncNodeToTreeNode(child, id, `[${i}]`)
      );
      return {
        id,
        key,
        type: 'array',
        children,
        line: lineFromOffset(node.offset, node.offset + node.length),
      };
    }
    case 'property': {
      const keyNode = node.children?.[0];
      const valueNode = node.children?.[1];
      const keyName = keyNode?.type === 'string' && typeof keyNode.value === 'string' ? keyNode.value : '';
      if (!valueNode) {
        return { id, key: keyName, type: 'null', value: null };
      }
      return jsoncNodeToTreeNode(valueNode, parentId, keyName);
    }
    case 'string':
    case 'number':
    case 'boolean':
    case 'null': {
      const value = getNodeValue(node);
      const type = node.type as NodeType;
      return {
        id,
        key,
        type,
        value: value as string | number | boolean | null,
        line: lineFromOffset(node.offset, node.offset + node.length),
        rangeStart: node.offset,
        rangeEnd: node.offset + node.length,
      };
    }
    default:
      return { id, key, type: 'null', value: null };
  }
}

function propertyToTreeNode(prop: JsoncNode, parentId: string): TreeNode {
  const keyNode = prop.children?.[0];
  const valueNode = prop.children?.[1];
  const keyName = keyNode?.type === 'string' && typeof keyNode.value === 'string' ? keyNode.value : '';
  const path = getNodePath(prop);
  const id = path.length > 0 ? pathToId(path) : keyName;

  if (!valueNode) {
    return { id, key: keyName, type: 'null', value: null };
  }
  return jsoncNodeToTreeNode(valueNode, parentId, keyName);
}

/** Derive a single line number from offset range (optional; for round-trip hint). */
function lineFromOffset(_start: number, _end: number): number | undefined {
  return undefined;
}
