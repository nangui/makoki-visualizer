import { describe, it, expect } from 'vitest';
import { treeToJson } from './tree-to-json.js';
import type { TreeNode } from '../types/tree.js';

describe('treeToJson', () => {
  it('serializes a single object root', () => {
    const roots: TreeNode[] = [
      {
        id: '',
        key: '',
        type: 'object',
        children: [
          { id: 'a', key: 'a', type: 'number', value: 1 },
          { id: 'b', key: 'b', type: 'string', value: 'hello' },
        ],
      },
    ];
    const out = treeToJson(roots);
    const parsed = JSON.parse(out);
    expect(parsed).toEqual({ a: 1, b: 'hello' });
  });

  it('serializes an array root', () => {
    const roots: TreeNode[] = [
      {
        id: '',
        key: '',
        type: 'array',
        children: [
          { id: '0', key: '[0]', type: 'number', value: 1 },
          { id: '1', key: '[1]', type: 'string', value: 'two' },
        ],
      },
    ];
    const out = treeToJson(roots);
    expect(JSON.parse(out)).toEqual([1, 'two']);
  });

  it('uses first root only', () => {
    const roots: TreeNode[] = [
      { id: '', key: '', type: 'object', children: [{ id: 'a', key: 'a', type: 'number', value: 1 }] },
      { id: '1', key: '', type: 'object', children: [{ id: '1.b', key: 'b', type: 'number', value: 2 }] },
    ];
    const out = treeToJson(roots);
    expect(JSON.parse(out)).toEqual({ a: 1 });
  });

  it('returns empty string for no roots', () => {
    expect(treeToJson([])).toBe('');
  });
});
