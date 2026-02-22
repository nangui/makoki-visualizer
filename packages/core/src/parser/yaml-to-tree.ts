/**
 * YAML → TreeNode[] (one root per document).
 * Uses the `yaml` package AST; preserves comments, anchors, aliases.
 */

import {
  parseAllDocuments,
  isMap,
  isSeq,
  isScalar,
  isPair,
  isAlias,
  type Document,
  type Pair,
  type Scalar,
  type YAMLMap,
  type YAMLSeq,
} from 'yaml';
import type { NodeType, TreeNode } from '../types/tree.js';

/** Result of parsing YAML: roots (one per document) and optional parse errors. */
export interface ParseYamlResult {
  roots: TreeNode[];
  errors: ParseYamlError[];
}

export interface ParseYamlError {
  line?: number;
  message: string;
}

/** Parses YAML string; supports multi-document. Returns roots and errors (partial AST on error). */
export function parseYaml(content: string): ParseYamlResult {
  const errors: ParseYamlError[] = [];
  const docs = parseAllDocuments(content, { strict: false, keepSourceTokens: true });

  for (const doc of docs) {
    for (const err of doc.errors) {
      const linePos = (err as { linePos?: Array<{ line: number }> }).linePos?.[0];
      errors.push({
        line: linePos !== undefined ? linePos.line : undefined,
        message: err.message,
      });
    }
  }

  const roots: TreeNode[] = docs.map((doc, docIndex) => {
    const id = docs.length > 1 ? String(docIndex) : '';
    return documentToRoot(doc, id);
  });

  return { roots, errors };
}

function documentToRoot(doc: Document, rootId: string): TreeNode {
  const contents = doc.contents;
  if (!contents) {
    return {
      id: rootId,
      key: '',
      type: 'object',
      children: [],
    };
  }

  const node = anyNodeToTreeNode(contents, rootId, '');
  return {
    ...node,
    id: rootId,
    key: '',
  };
}

type YamlNode = Parameters<typeof isScalar>[0];

function anyNodeToTreeNode(
  node: YamlNode,
  parentId: string,
  key: string
): TreeNode {
  const id = parentId ? `${parentId}.${key}` : key;

  if (isAlias(node)) {
    const aliasNode = node as { source?: string; toJSON?: () => unknown };
    const source = typeof aliasNode.source === 'string' ? aliasNode.source : undefined;
    const value = typeof aliasNode.toJSON === 'function' ? aliasNode.toJSON() : undefined;
    const nodeType = scalarTypeOf(value);
    return {
      id,
      key,
      type: nodeType,
      value: value as string | number | boolean | null | undefined,
      alias: source,
    };
  }

  if (isScalar(node)) {
    const scalar = node as Scalar;
    const value = scalar.toJSON();
    const nodeType = scalarTypeOf(value);
    const comment = (scalar as unknown as { comment?: string }).comment;
    const commentBefore = (scalar as unknown as { commentBefore?: string }).commentBefore;
    const range = (scalar as unknown as { range?: [number, number, number] }).range;
    const out: TreeNode = {
      id,
      key,
      type: nodeType,
      value: value as string | number | boolean | null,
      commentInline: comment,
      commentBefore,
      tag: scalar.tag ? String(scalar.tag) : undefined,
      anchor: scalar.anchor ? String(scalar.anchor) : undefined,
    };
    if (range && Array.isArray(range) && range.length >= 3 && typeof range[0] === 'number' && typeof range[2] === 'number') {
      out.rangeStart = range[0];
      out.rangeEnd = range[2];
    }
    return out;
  }

  if (isMap(node)) {
    const map = node as YAMLMap;
    const commentBefore = (map as unknown as { commentBefore?: string }).commentBefore;
    const comment = (map as unknown as { comment?: string }).comment;
    const children = map.items
      .filter((item): item is Pair => isPair(item))
      .map((pair) => pairToChildTreeNode(pair, id));
    return {
      id,
      key,
      type: 'object',
      children,
      commentBefore,
      commentInline: comment,
      anchor: map.anchor ? String(map.anchor) : undefined,
    };
  }

  if (isSeq(node)) {
    const seq = node as YAMLSeq;
    const commentBefore = (seq as unknown as { commentBefore?: string }).commentBefore;
    const comment = (seq as unknown as { comment?: string }).comment;
    const children = seq.items.map((item, i) => {
      const k = `[${i}]`;
      return anyNodeToTreeNode(item as YamlNode, id, k);
    });
    return {
      id,
      key,
      type: 'array',
      children,
      commentBefore,
      commentInline: comment,
      anchor: seq.anchor ? String(seq.anchor) : undefined,
    };
  }

  return { id, key, type: 'null', value: null };
}

function pairToChildTreeNode(pair: Pair, parentId: string): TreeNode {
  const keyNode = pair.key;
  const keyStr = isScalar(keyNode)
    ? String((keyNode as Scalar).value ?? (keyNode as Scalar).toJSON())
    : String((keyNode as unknown as { toJSON?: () => unknown })?.toJSON?.() ?? '');
  return anyNodeToTreeNode(pair.value as YamlNode, parentId, keyStr);
}

function scalarTypeOf(value: unknown): NodeType {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  return 'string';
}
