# JSON Tree — Design

A Chrome DevTools-style JSON inspector built on top of the existing
`<ui-tree>`. Accepts arbitrary JSON-shaped data and renders it with proper
type-aware labels, paths, and clipboard actions — no manual `TreeNode`
construction needed.

## Goals

- One-line usage: `<ui-json-tree [json]="responsePayload" />`.
- DevTools-style labels: `companyName: "Vega IT Niš"`, `positions [4]`,
  `response {17}`.
- DevTools-style paths: `response.positions[0].companyName`.
- DevTools-style Copy actions:
  - Copy value → primitive (unquoted) or pretty JSON for objects/arrays.
  - Copy path → JSON path string.
  - Copy object → pretty JSON of the node's value.
- Reuse the existing `<ui-tree>` for rendering, expansion, context menu,
  scroll/flash. No duplication of overlay/menu plumbing.

## Non-Goals

- Editing / mutating the JSON inline.
- Filtering / searching within the tree.
- Custom type renderers beyond what JSON natively supports.
- Streaming / lazy loading of huge payloads.

## Architecture

Two layers:

1. **Base `<ui-tree>` gains formatter inputs** — three optional pure
   functions that override what Copy value / path / object emit. Generic,
   useful even outside JSON mode.
2. **New `<ui-json-tree>` component** — converts a JS value into a
   `TreeNode[]` shape on input change, attaches JSON metadata on each
   `node.data`, and passes JSON-aware default formatters to the inner
   `<ui-tree>`.

### Why two layers (not just JsonTree)

The formatter hooks have negligible cost on the base tree and unlock more
than JSON: consumers can implement protobuf trees, file-system trees,
DOM trees, etc. JsonTree becomes a thin specialization (≈ a few hundred
lines), and the customization seam is well-documented.

## Base Tree Additions

```ts
// On TreeComponent
export type TreeFormatter =
  (node: TreeNode, path: TreeNode[]) => string | null | undefined;

readonly valueFormatter  = input<TreeFormatter | null>(null);
readonly pathFormatter   = input<TreeFormatter | null>(null);
readonly objectFormatter = input<TreeFormatter | null>(null);
```

In `_runAction`, each Copy branch checks for the corresponding formatter:

```ts
case 'copyValue': {
  const fn = this.valueFormatter();
  const text = fn?.(node, path) ?? node.label;
  this.copyToClipboard(text);
  break;
}
```

A formatter returning `null`/`undefined` falls back to the current default.
This lets JsonTree provide a single formatter that handles all node kinds
without breaking the contract that the base tree still works standalone.

## JsonTree Component

### Selector & file layout

- `selector: 'ui-json-tree'`
- `projects/ngx-ui/src/lib/components/tree/json-tree.component.{ts,html,scss}`

(Co-located with `tree/` because it's an extension of the tree.)

### Public API

```ts
@Component({ selector: 'ui-json-tree', standalone: true })
export class JsonTreeComponent {
  readonly json          = input<unknown>(undefined);
  readonly rootLabel     = input<string>('');     // shown before {N}/[N]/value at root
  readonly contextMenu   = input(true);
  readonly draggable     = input(false);          // forwarded; rarely useful for JSON
  readonly indent        = input(16);
  readonly expandOnClick = input(false);
  readonly expandDepth   = input(1);              // auto-expand N levels of descendants under root (0 = only root)
  readonly pathRoot      = input<string>('');     // optional prefix for paths, e.g. '$'

  readonly nodeContextAction = output<TreeNodeContextAction>();
  readonly nodeClick         = output<TreeNode>();
}
```

### Node data shape (internal)

Each generated `TreeNode` carries `data: JsonNodeMeta`:

```ts
type JsonKind = 'object' | 'array' | 'primitive';

interface JsonNodeMeta {
  key: string | number | null;   // null = root
  value: unknown;
  kind: JsonKind;
  jsonPath: string;              // full path from root, e.g. "response.positions[0].companyName"
}
```

`label` is computed from `key` + `value` + `kind` at conversion time.

### Conversion

A pure function `jsonToTreeNodes(value, { rootLabel, pathRoot, expandDepth })`:

- Root entry:
  - object → `{ label: '${rootLabel}{N}', kind: 'object', key: null, jsonPath: pathRoot, children: [...properties] }`
  - array  → `{ label: '${rootLabel}[N]', kind: 'array',  key: null, jsonPath: pathRoot, children: [...elements] }`
  - primitive → `{ label: '${rootLabel}<pretty(value)>', kind: 'primitive', key: null, jsonPath: pathRoot }`
- Object property → label `'${key}{N}' | '${key}[N]' | '${key}: ${pretty(value)}'`
- Array element → label `'[${i}]{N}' | '[${i}][N]' | '[${i}]: ${pretty(value)}'`
- Root node: always `expanded: true`.
- Non-root nodes: `expanded` set to `depth <= expandDepth`, where root's
  direct children are at depth 1. With default `expandDepth: 1`, root +
  first level of children are expanded; deeper levels collapsed.

#### Label formatting helpers

```ts
function prettyPrimitive(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);   // quotes + escapes
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
  if (v instanceof Date) return JSON.stringify(v.toISOString());
  return String(v);   // Symbol, function, etc.
}
```

#### Path step encoding

```ts
function isIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function appendKey(path: string, key: string): string {
  return isIdentifier(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}

function appendIndex(path: string, i: number): string {
  return `${path}[${i}]`;
}
```

Root path = `pathRoot()` (default empty, so first key has no leading dot:
`response.positions[0].companyName` — *not* `.response...`). If a non-empty
`pathRoot` is provided (`$`), the first segment uses `appendKey` /
`appendIndex`, producing `$.response.positions[0]`.

#### Circular safety

The converter walks with a `WeakSet<object>` of ancestors. If a value is
re-encountered, emit `{ kind: 'primitive', value: '[Circular]', label: '<key>: "[Circular]"' }` and stop recursion. Plain `Set` is not used because
`WeakSet` allows the GC to clean up.

### Default formatters

The component creates three formatters and passes them to the inner
`<ui-tree>`:

```ts
const meta = (n: TreeNode) => n.data as JsonNodeMeta;

valueFmt = (n) => {
  const m = meta(n);
  if (m.kind === 'primitive') {
    return m.value === null || m.value === undefined
      ? String(m.value)
      : typeof m.value === 'string' ? m.value : String(m.value);
  }
  return safeStringify(m.value);
};

pathFmt = (n) => meta(n).jsonPath;

objectFmt = (n) => safeStringify(meta(n).value);

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
```

### Template

```html
<ui-tree
  [nodes]="nodes()"
  [indent]="indent()"
  [draggable]="draggable()"
  [expandOnClick]="expandOnClick()"
  [contextMenu]="contextMenu()"
  [valueFormatter]="valueFmt"
  [pathFormatter]="pathFmt"
  [objectFormatter]="objectFmt"
  (nodeClick)="nodeClick.emit($event)"
  (nodeContextAction)="nodeContextAction.emit($event)"
/>
```

`nodes()` is `computed(() => jsonToTreeNodes(this.json(), {...opts}))`. A
new conversion runs whenever `json`, `rootLabel`, `pathRoot`, or
`expandDepth` change. Conversion is `O(n)` in number of JSON nodes;
acceptable for typical payloads.

## Styling

JsonTree inherits all base tree styling. Optional small additions for
readability:

- Subtle color differentiation between key (`--ui-text`) and value
  (`--ui-text-muted`) — implemented via a small DOM tweak: the label
  span gets a `<span class="ui-json-tree__key">key</span>` /
  `<span class="ui-json-tree__value">value</span>` split.

This requires a per-node template hook. Two options:

A. **Render label as innerHTML** of a single span — simple but dangerous.
   Skipping.

B. **Add a template-projection slot on the base tree** for label rendering.
   Larger refactor than this design wants to commit to.

C. **Don't split visually in v1** — labels render as a single string, same
   color. Color refinements can come later. Selected for v1.

## Public API Exports

```ts
// public-api.ts
export { JsonTreeComponent } from './lib/components/tree/json-tree.component';
export type { JsonNodeMeta, JsonKind } from './lib/components/tree/json-tree.component';
export type { TreeFormatter } from './lib/components/tree/tree.component';
```

## Demo

Replace the existing JSON-as-tree section in the demo with:

```html
<ui-json-tree
  [json]="samplePayload"
  rootLabel="response"
  [expandDepth]="2"
  (nodeContextAction)="onTreeNodeContextAction($event)"
/>
```

`samplePayload` is the user-provided sample with `companyName: "Vega IT
Niš"` etc., so the bug they reported becomes the demo's regression test.

## Files Touched

- `projects/ngx-ui/src/lib/components/tree/tree.component.ts` — add 3
  formatter inputs, route through `_runAction`.
- `projects/ngx-ui/src/lib/components/tree/json-tree.component.{ts,html,scss}` — new.
- `projects/ngx-ui/src/lib/components/tree/json-utils.ts` — conversion +
  helpers (pure functions, easy to unit-test).
- `projects/ngx-ui/src/public-api.ts` — exports.
- `projects/demo/src/app/app.ts` — new demo section.

## Testing

Add a vitest spec for `json-utils.ts` (pure functions, no Angular):

- Object → tree shape, label, path
- Array → tree shape, label, path
- Nested mixed → composite paths
- Primitive root → single node
- Empty object/array → no children, correct label
- Identifier vs non-identifier keys → dot vs bracket path
- Circular reference → `[Circular]`, no infinite loop
- `expandDepth` correctness
- `pathRoot` prefix

JsonTreeComponent itself doesn't need a separate spec for v1 — it's wiring.

## Risks / Open Questions

- **JSON.stringify edge cases**: `BigInt` throws (we wrap in try/catch and
  fall back to `String()`). `Symbol` keys are dropped (intentional — they
  aren't JSON). Document these.
- **Identity-based expansion state**: same as base tree — replacing
  `[json]` with a structurally-equal-but-new-reference value resets
  expansion. Acceptable; consumers reusing the same reference get
  state preservation.
- **Performance on very large payloads**: full conversion on every change
  to `json`. Reasonable up to a few thousand nodes. If this becomes a
  problem, lazy conversion of child branches is a follow-up — not v1.
