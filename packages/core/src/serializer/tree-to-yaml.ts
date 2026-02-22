/**
 * TreeNode[] → YAML string.
 * Builds a YAML AST from the tree and stringifies; preserves comments and anchors where set.
 */

import { Document, Scalar, YAMLMap, YAMLSeq, type Pair } from 'yaml';
import type { TreeNode } from '../types/tree.js';

/** Serialize one or more roots to a YAML string (multi-document with "---" when roots.length > 1). */
export function treeToYaml(roots: TreeNode[]): string {
  if (roots.length === 0) return '';

  const docs = roots.map((root) => rootToDocument(root));
  return docs.map((d) => String(d)).join('---\n');
}

function rootToDocument(root: TreeNode): Document {
  const doc = new Document();
  doc.contents = treeNodeToYamlNode(root, doc);
  if (root.commentBefore) {
    (doc as unknown as { commentBefore?: string }).commentBefore = root.commentBefore;
  }
  return doc;
}

function treeNodeToYamlNode(
  node: TreeNode,
  doc: Document
): ReturnType<Document['createNode']> {
  if (node.type === 'object' && node.children) {
    const map = new YAMLMap();
    setCommentProps(map, node);
    if (node.anchor) map.anchor = node.anchor;
    for (const child of node.children) {
      const valueNode = treeNodeToYamlNode(child, doc);
      const pair = doc.createPair(child.key, valueNode) as Pair;
      map.items.push(pair);
    }
    return map;
  }

  if (node.type === 'array' && node.children) {
    const seq = new YAMLSeq();
    setCommentProps(seq, node);
    if (node.anchor) seq.anchor = node.anchor;
    for (const child of node.children) {
      seq.items.push(treeNodeToYamlNode(child, doc));
    }
    return seq;
  }

  if (node.alias) {
    return doc.createNode(node.value) as Scalar;
  }

  const scalar = doc.createNode(node.value ?? null) as Scalar;
  setCommentProps(scalar, node);
  if (node.anchor) scalar.anchor = node.anchor;
  return scalar;
}

function setCommentProps(
  yamlNode: { commentBefore?: string | null; comment?: string | null },
  treeNode: TreeNode
): void {
  if (treeNode.commentBefore) yamlNode.commentBefore = treeNode.commentBefore;
  if (treeNode.commentInline) yamlNode.comment = treeNode.commentInline;
}
