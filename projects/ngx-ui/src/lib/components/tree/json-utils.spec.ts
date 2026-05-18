import { describe, it, expect } from 'vitest';
import {
  jsonToTreeNodes,
  appendKey,
  appendIndex,
  isIdentifier,
  prettyPrimitive,
  safeStringify,
  type JsonNodeMeta,
} from './json-utils';

function meta(node: { data?: unknown }): JsonNodeMeta {
  return node.data as JsonNodeMeta;
}

describe('isIdentifier', () => {
  it('accepts JS identifiers', () => {
    expect(isIdentifier('foo')).toBe(true);
    expect(isIdentifier('_x')).toBe(true);
    expect(isIdentifier('$1')).toBe(true);
    expect(isIdentifier('camelCase123')).toBe(true);
  });

  it('rejects non-identifiers', () => {
    expect(isIdentifier('foo bar')).toBe(false);
    expect(isIdentifier('1foo')).toBe(false);
    expect(isIdentifier('foo-bar')).toBe(false);
    expect(isIdentifier('')).toBe(false);
  });
});

describe('appendKey / appendIndex', () => {
  it('uses dot for identifier keys, no leading dot at root', () => {
    expect(appendKey('', 'foo')).toBe('foo');
    expect(appendKey('a', 'b')).toBe('a.b');
  });

  it('uses bracket notation for non-identifier keys', () => {
    expect(appendKey('a', 'weird key')).toBe('a["weird key"]');
    expect(appendKey('', 'weird key')).toBe('["weird key"]');
    expect(appendKey('a', 'has"quote')).toBe('a["has\\"quote"]');
  });

  it('appends array indices', () => {
    expect(appendIndex('a', 0)).toBe('a[0]');
    expect(appendIndex('', 3)).toBe('[3]');
  });
});

describe('prettyPrimitive', () => {
  it('quotes strings', () => {
    expect(prettyPrimitive('hi')).toBe('"hi"');
    expect(prettyPrimitive('Vega IT Niš')).toBe('"Vega IT Niš"');
  });

  it('shows numbers/booleans/null/undefined raw', () => {
    expect(prettyPrimitive(42)).toBe('42');
    expect(prettyPrimitive(true)).toBe('true');
    expect(prettyPrimitive(null)).toBe('null');
    expect(prettyPrimitive(undefined)).toBe('undefined');
  });

  it('renders dates as ISO strings', () => {
    expect(prettyPrimitive(new Date('2026-01-01T00:00:00.000Z'))).toBe('"2026-01-01T00:00:00.000Z"');
  });
});

describe('safeStringify', () => {
  it('pretty-prints objects', () => {
    expect(safeStringify({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it('handles circular references', () => {
    const obj: Record<string, unknown> = { name: 'root' };
    obj['self'] = obj;
    const out = safeStringify(obj);
    expect(out).toContain('[Circular]');
    expect(out).toContain('"name": "root"');
  });

  it('coerces bigints to strings', () => {
    expect(safeStringify({ n: 10n })).toBe('{\n  "n": "10"\n}');
  });
});

describe('jsonToTreeNodes', () => {
  it('builds a single root node', () => {
    const [root] = jsonToTreeNodes({ a: 1 });
    expect(meta(root).kind).toBe('object');
    expect(meta(root).jsonPath).toBe('');
    expect(meta(root).key).toBeNull();
    expect(root.expanded).toBe(true);
  });

  it('labels object roots with size and rootLabel', () => {
    const [root] = jsonToTreeNodes({ a: 1, b: 2 }, { rootLabel: 'response' });
    expect(root.label).toBe('response {2}');
  });

  it('labels array roots with size', () => {
    const [root] = jsonToTreeNodes([10, 20, 30]);
    expect(root.label).toBe('[3]');
  });

  it('labels primitive root', () => {
    const [root] = jsonToTreeNodes(42, { rootLabel: 'count' });
    expect(root.label).toBe('count: 42');
  });

  it('renders nested object property paths with dot notation', () => {
    const [root] = jsonToTreeNodes({ response: { positions: [{ companyName: 'Vega IT Niš' }] } });
    const response = root.children![0];
    const positions = response.children![0];
    const first = positions.children![0];
    const companyName = first.children![0];

    expect(meta(response).jsonPath).toBe('response');
    expect(meta(positions).jsonPath).toBe('response.positions');
    expect(meta(first).jsonPath).toBe('response.positions[0]');
    expect(meta(companyName).jsonPath).toBe('response.positions[0].companyName');
    expect(companyName.label).toBe('companyName: "Vega IT Niš"');
  });

  it('uses bracket notation for non-identifier keys', () => {
    const [root] = jsonToTreeNodes({ 'weird key': 1 });
    expect(meta(root.children![0]).jsonPath).toBe('["weird key"]');
  });

  it('applies pathRoot prefix', () => {
    const [root] = jsonToTreeNodes({ a: 1 }, { pathRoot: '$' });
    expect(meta(root).jsonPath).toBe('$');
    expect(meta(root.children![0]).jsonPath).toBe('$.a');
  });

  it('honors expandDepth: 0 collapses children but keeps root expanded', () => {
    const [root] = jsonToTreeNodes({ a: { b: 1 } }, { expandDepth: 0 });
    expect(root.expanded).toBe(true);
    expect(root.children![0].expanded).toBe(false);
  });

  it('honors expandDepth: 1 expands first level of children', () => {
    const [root] = jsonToTreeNodes({ a: { b: { c: 1 } } }, { expandDepth: 1 });
    expect(root.expanded).toBe(true);                            // root
    expect(root.children![0].expanded).toBe(true);               // depth 1
    expect(root.children![0].children![0].expanded).toBe(false); // depth 2
  });

  it('renders empty object/array without children and with size 0', () => {
    const [emptyObj] = jsonToTreeNodes({});
    expect(emptyObj.label).toBe('{0}');
    expect(emptyObj.children).toBeUndefined();

    const [emptyArr] = jsonToTreeNodes([]);
    expect(emptyArr.label).toBe('[0]');
    expect(emptyArr.children).toBeUndefined();
  });

  it('handles circular references without infinite loop', () => {
    const obj: Record<string, unknown> = { name: 'root' };
    obj['self'] = obj;
    const [root] = jsonToTreeNodes(obj);
    const selfNode = root.children!.find((c) => meta(c).key === 'self')!;
    expect(meta(selfNode).value).toBe('[Circular]');
    expect(selfNode.label).toBe('self: "[Circular]"');
  });

  it('does not falsely flag shared (non-ancestor) references as circular', () => {
    const shared = { x: 1 };
    const [root] = jsonToTreeNodes({ a: shared, b: shared });
    const a = root.children!.find((c) => meta(c).key === 'a')!;
    const b = root.children!.find((c) => meta(c).key === 'b')!;
    expect(meta(a).kind).toBe('object');
    expect(meta(b).kind).toBe('object');
    expect(a.children).toHaveLength(1);
    expect(b.children).toHaveLength(1);
  });

  it('attaches correct meta for array elements', () => {
    const [root] = jsonToTreeNodes({ items: ['x', 'y'] });
    const items = root.children![0];
    const first = items.children![0];
    expect(meta(first).key).toBe(0);
    expect(meta(first).kind).toBe('primitive');
    expect(meta(first).value).toBe('x');
    expect(first.label).toBe('[0]: "x"');
  });
});
