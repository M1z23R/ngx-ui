import type { TreeNode } from './tree.component';

export type JsonKind = 'object' | 'array' | 'primitive';

export interface JsonNodeMeta {
  /** null for the root; string for object keys; number for array indices */
  key: string | number | null;
  value: unknown;
  kind: JsonKind;
  /** Full path from root, e.g. `response.positions[0].companyName` */
  jsonPath: string;
}

export interface JsonToTreeOptions {
  /** Display text prepended before the root's `{N}` / `[N]` / primitive value. */
  rootLabel?: string;
  /** Optional prefix for paths (e.g. `'$'` produces `$.response.x`). */
  pathRoot?: string;
  /** How many descendant levels below the root to auto-expand. Root is always expanded. */
  expandDepth?: number;
}

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function isIdentifier(key: string): boolean {
  return IDENT_RE.test(key);
}

export function appendKey(path: string, key: string): string {
  return isIdentifier(key) ? (path ? `${path}.${key}` : key) : `${path}[${JSON.stringify(key)}]`;
}

export function appendIndex(path: string, i: number): string {
  return `${path}[${i}]`;
}

export function prettyPrimitive(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
  if (v instanceof Date) return JSON.stringify(v.toISOString());
  return String(v);
}

export function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, replacer(), 2);
  } catch {
    return String(v);
  }
}

function replacer(): (this: unknown, key: string, value: unknown) => unknown {
  const seen = new WeakSet<object>();
  return function (_key, value) {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value as object)) return '[Circular]';
      seen.add(value as object);
    }
    return value;
  };
}

function kindOf(v: unknown): JsonKind {
  if (Array.isArray(v)) return 'array';
  if (v !== null && typeof v === 'object') return 'object';
  return 'primitive';
}

function sizeLabel(kind: JsonKind, value: unknown): string {
  if (kind === 'array') return `[${(value as unknown[]).length}]`;
  if (kind === 'object') return `{${Object.keys(value as Record<string, unknown>).length}}`;
  return prettyPrimitive(value);
}

function makeLabel(keyPart: string, kind: JsonKind, value: unknown, isRoot: boolean): string {
  const size = sizeLabel(kind, value);
  if (kind === 'primitive') {
    if (isRoot) return keyPart ? `${keyPart}: ${size}` : size;
    return keyPart ? `${keyPart}: ${size}` : size;
  }
  // object / array
  return keyPart ? `${keyPart} ${size}` : size;
}

/**
 * Convert an arbitrary JSON-shaped value into a TreeNode array suitable for
 * `<ui-tree [nodes]>`. Each generated node carries a `data: JsonNodeMeta`.
 *
 * Returns a single-element array containing the root node.
 */
export function jsonToTreeNodes(value: unknown, options: JsonToTreeOptions = {}): TreeNode[] {
  const rootLabel = options.rootLabel ?? '';
  const pathRoot = options.pathRoot ?? '';
  const expandDepth = options.expandDepth ?? 1;
  const ancestors = new WeakSet<object>();

  const root = build(value, null, rootLabel, pathRoot, 0, expandDepth, ancestors, true);
  return [root];
}

function build(
  value: unknown,
  key: string | number | null,
  keyPart: string,
  path: string,
  depth: number,
  expandDepth: number,
  ancestors: WeakSet<object>,
  isRoot: boolean,
): TreeNode {
  // Detect cycles: only if `value` is one of our ancestors in this DFS path.
  if (value !== null && typeof value === 'object' && ancestors.has(value as object)) {
    const placeholder = '[Circular]';
    return {
      label: keyPart ? `${keyPart}: "${placeholder}"` : `"${placeholder}"`,
      data: {
        key,
        value: placeholder,
        kind: 'primitive',
        jsonPath: path,
      } satisfies JsonNodeMeta,
    };
  }

  const kind = kindOf(value);
  const label = makeLabel(keyPart, kind, value, isRoot);
  const expanded = isRoot ? true : depth <= expandDepth;

  const node: TreeNode = {
    label,
    expanded,
    data: { key, value, kind, jsonPath: path } satisfies JsonNodeMeta,
  };

  if (kind === 'object' || kind === 'array') {
    ancestors.add(value as object);
    if (kind === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (keys.length > 0) {
        node.children = keys.map((k) =>
          build(obj[k], k, k, appendKey(path, k), depth + 1, expandDepth, ancestors, false),
        );
      }
    } else {
      const arr = value as unknown[];
      if (arr.length > 0) {
        node.children = arr.map((v, i) =>
          build(v, i, `[${i}]`, appendIndex(path, i), depth + 1, expandDepth, ancestors, false),
        );
      }
    }
    ancestors.delete(value as object);
  }

  return node;
}
