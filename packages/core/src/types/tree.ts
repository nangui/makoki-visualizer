/**
 * Shared data model for YAML/JSON visualization and round-trip editing.
 * Single source of truth: PRD §7 Internal Data Model.
 */

/** Discriminated union of node kinds; used for type narrowing. */
export type NodeType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null';

/**
 * Normalized tree node. Framework-agnostic; carries all metadata needed
 * for faithful round-trip (comments, anchors, key order, style).
 */
export interface TreeNode {
  /** Unique dot-path, e.g. "server.host". */
  id: string;
  /** Display key; for array items use "[0]", "[1]", etc. */
  key: string;
  type: NodeType;
  /** Present for scalar types only. */
  value?: string | number | boolean | null;
  /** Present for object and array types. */
  children?: TreeNode[];
  /** UI state: node collapsed in tree view. */
  collapsed?: boolean;
  /** Source line number for round-trip mapping. */
  line?: number;

  // --- Round-trip preservation (YAML/JSONC) ---
  /** Comment(s) above the key (YAML). */
  commentBefore?: string;
  /** End-of-line comment (YAML). */
  commentInline?: string;
  /** Comment after last child (YAML). */
  commentAfter?: string;
  /** YAML anchor name (&anchor). */
  anchor?: string;
  /** YAML alias name (*alias). */
  alias?: string;
  /** Explicit YAML tag (!!str, !!int, …). */
  tag?: string;
  /** Raw key if quoted or multi-line. */
  originalKey?: string;
  /** Trailing comma before next token (JSONC). */
  jsoncTrailingComma?: boolean;
}
