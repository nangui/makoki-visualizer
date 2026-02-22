import { describe, it, expect } from 'vitest';
import { parseJsonc } from './jsonc-to-tree.js';

describe('parseJsonc', () => {
  it('parses a simple object', () => {
    const { roots, errors } = parseJsonc('{"a": 1, "b": "hello"}');
    expect(errors).toHaveLength(0);
    expect(roots).toHaveLength(1);
    const root = roots[0];
    expect(root.type).toBe('object');
    const a = root.children!.find((c) => c.key === 'a');
    const b = root.children!.find((c) => c.key === 'b');
    expect(a?.value).toBe(1);
    expect(b?.value).toBe('hello');
  });

  it('parses an array', () => {
    const { roots, errors } = parseJsonc('[1, 2, 3]');
    expect(errors).toHaveLength(0);
    expect(roots[0].type).toBe('array');
    expect(roots[0].children!.map((c) => c.value)).toEqual([1, 2, 3]);
  });

  it('accepts trailing comma (JSONC)', () => {
    const { roots, errors } = parseJsonc('{"a": 1,}');
    expect(errors).toHaveLength(0);
    expect(roots[0].children!.find((c) => c.key === 'a')?.value).toBe(1);
  });

  it('accepts line comments (JSONC)', () => {
    const { roots, errors } = parseJsonc('{ "a": 1 // comment\n}');
    expect(errors).toHaveLength(0);
    expect(roots[0].children!.find((c) => c.key === 'a')?.value).toBe(1);
  });

  it('returns one root', () => {
    const { roots } = parseJsonc('{"x": true}');
    expect(roots).toHaveLength(1);
    expect(roots[0].children!.find((c) => c.key === 'x')?.value).toBe(true);
  });

  it('returns empty roots and errors on invalid content', () => {
    const { roots, errors } = parseJsonc('{ invalid }');
    expect(errors.length).toBeGreaterThan(0);
    expect(roots.length).toBeLessThanOrEqual(1);
  });
});
