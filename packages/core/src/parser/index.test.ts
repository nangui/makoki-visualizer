import { describe, it, expect, vi } from 'vitest';
import { parse } from './index.js';
import * as yamlModule from './yaml-to-tree.js';
import * as jsoncModule from './jsonc-to-tree.js';

describe('parse', () => {
  it("dispatches to parseYaml when format is 'yaml'", () => {
    const spy = vi.spyOn(yamlModule, 'parseYaml');
    parse('a: 1', 'yaml');
    expect(spy).toHaveBeenCalledWith('a: 1');
    spy.mockRestore();
  });

  it("dispatches to parseJsonc when format is 'json'", () => {
    const spy = vi.spyOn(jsoncModule, 'parseJsonc');
    parse('{"a": 1}', 'json');
    expect(spy).toHaveBeenCalledWith('{"a": 1}');
    spy.mockRestore();
  });

  it("handles empty content for 'yaml' format", () => {
    const { roots, errors } = parse('', 'yaml');
    expect(errors).toHaveLength(0);
    expect(roots).toBeDefined();
  });

  it("handles empty content for 'json' format", () => {
    const { roots, errors } = parse('', 'json');
    expect(roots).toBeDefined();
  });

  it('returns errors for invalid YAML content', () => {
    const { errors } = parse('a: 1\n  bad indent: broken', 'yaml');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toBeDefined();
  });
});
