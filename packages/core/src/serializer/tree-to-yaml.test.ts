import { describe, it, expect } from 'vitest';
import { treeToYaml } from './tree-to-yaml.js';
import type { TreeNode } from '../types/tree.js';

describe('treeToYaml', () => {
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
    const out = treeToYaml(roots);
    expect(out).toContain('a: 1');
    expect(out).toContain('b: hello');
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
    const out = treeToYaml(roots);
    expect(out).toContain('- 1');
    expect(out).toContain('- two');
  });

  it('serializes multiple roots with document separator', () => {
    const roots: TreeNode[] = [
      { id: '', key: '', type: 'object', children: [{ id: 'x', key: 'x', type: 'number', value: 1 }] },
      { id: '1', key: '', type: 'object', children: [{ id: '1.y', key: 'y', type: 'string', value: '2' }] },
    ];
    const out = treeToYaml(roots);
    expect(out).toContain('x: 1');
    expect(out).toContain('---');
    expect(out).toContain('y: "2"');
  });

  it('returns empty string for no roots', () => {
    expect(treeToYaml([])).toBe('');
  });
});
