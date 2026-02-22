import { describe, it, expect } from 'vitest';
import { parseYaml } from './yaml-to-tree.js';

describe('parseYaml', () => {
  it('parses a simple object', () => {
    const { roots, errors } = parseYaml('a: 1\nb: hello');
    expect(errors).toHaveLength(0);
    expect(roots).toHaveLength(1);
    const root = roots[0];
    expect(root.type).toBe('object');
    expect(root.children).toHaveLength(2);
    const a = root.children!.find((c) => c.key === 'a');
    const b = root.children!.find((c) => c.key === 'b');
    expect(a?.type).toBe('number');
    expect(a?.value).toBe(1);
    expect(b?.type).toBe('string');
    expect(b?.value).toBe('hello');
  });

  it('parses an array', () => {
    const { roots, errors } = parseYaml('- 1\n- 2\n- 3');
    expect(errors).toHaveLength(0);
    expect(roots[0].type).toBe('array');
    expect(roots[0].children).toHaveLength(3);
    expect(roots[0].children!.map((c) => c.value)).toEqual([1, 2, 3]);
  });

  it('parses nested structures', () => {
    const { roots, errors } = parseYaml('server:\n  host: localhost\n  port: 8080');
    expect(errors).toHaveLength(0);
    const server = roots[0].children!.find((c) => c.key === 'server');
    expect(server?.type).toBe('object');
    const host = server!.children!.find((c) => c.key === 'host');
    const port = server!.children!.find((c) => c.key === 'port');
    expect(host?.value).toBe('localhost');
    expect(port?.value).toBe(8080);
  });

  it('parses multiple documents', () => {
    const { roots, errors } = parseYaml('a: 1\n---\nb: 2');
    expect(errors).toHaveLength(0);
    expect(roots).toHaveLength(2);
    expect(roots[0].children?.find((c) => c.key === 'a')?.value).toBe(1);
    expect(roots[1].children?.find((c) => c.key === 'b')?.value).toBe(2);
  });

  it('returns roots with stable ids', () => {
    const { roots } = parseYaml('x: 1\ny: 2');
    const x = roots[0].children!.find((c) => c.key === 'x');
    const y = roots[0].children!.find((c) => c.key === 'y');
    expect(x?.id).toBe('x');
    expect(y?.id).toBe('y');
  });
});
