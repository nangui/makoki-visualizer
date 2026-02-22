import { describe, it, expect } from 'vitest';
import { parseYaml, parseJsonc } from './index.js';
import { treeToYaml, treeToJson } from '../serializer/index.js';

describe('round-trip', () => {
  it('YAML: parse then serialize preserves structure', () => {
    const input = 'a: 1\nb:\n  c: 2\n  d: hello';
    const { roots, errors } = parseYaml(input);
    expect(errors).toHaveLength(0);
    const out = treeToYaml(roots);
    const { roots: roots2, errors: errors2 } = parseYaml(out);
    expect(errors2).toHaveLength(0);
    expect(roots2[0].children?.find((c) => c.key === 'a')?.value).toBe(1);
    const b = roots2[0].children?.find((c) => c.key === 'b');
    expect(b?.children?.find((c) => c.key === 'c')?.value).toBe(2);
    expect(b?.children?.find((c) => c.key === 'd')?.value).toBe('hello');
  });

  it('JSON: parse then serialize preserves structure', () => {
    const input = '{"a": 1, "b": {"c": 2, "d": "hello"}}';
    const { roots, errors } = parseJsonc(input);
    expect(errors).toHaveLength(0);
    const out = treeToJson(roots);
    const parsed = JSON.parse(out);
    expect(parsed).toEqual({ a: 1, b: { c: 2, d: 'hello' } });
  });
});
