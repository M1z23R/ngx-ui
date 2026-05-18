# Tree Context Menu — Design

Right-click context menu for `<ui-tree>` nodes, modeled after Chrome DevTools'
inspector context menu. Provides built-in actions for copying node data and
bulk expanding/collapsing subtrees.

## Goals

- Right-click any node to open a per-node menu at the cursor.
- Ship five fixed built-in actions; consumers can observe via an output event.
- Recursive expand/collapse on a subtree (requires expansion state to live on
  the tree host, not per-node).
- Reuse the existing `ui-dropdown` + `ContextMenuDirective` substrate — no new
  overlay primitives.
- Single `<ui-dropdown>` instance per tree (not per node) — opened with
  `openAt(x, y)`.

## Non-Goals

- Custom/extensible menu items (consumers wanting custom menus can disable the
  built-in menu and roll their own with `<ui-dropdown>` + `[uiContextMenu]`).
- Multi-select / multi-node actions.
- Keyboard-triggered context menu (Shift+F10 etc.) — future work if needed.

## Public API

### Tree inputs/outputs

```ts
// Added to TreeComponent
readonly contextMenu   = input(false);          // enable built-in menu
readonly pathSeparator = input(' / ');          // for "Copy path"

readonly nodeContextAction = output<TreeNodeContextAction>();
```

### Types

```ts
export type TreeNodeActionType =
  | 'copyValue'
  | 'copyPath'
  | 'copyObject'
  | 'expandAll'
  | 'collapseAll'
  | 'goToParent'
  | 'collapseParent';

export interface TreeNodeContextAction {
  node: TreeNode;
  path: TreeNode[];           // root → node, inclusive
  action: TreeNodeActionType;
}
```

### Host methods (called by node components, `@internal`)

```ts
isExpanded(node: TreeNode): boolean
setExpanded(node: TreeNode, value: boolean): void
expandSubtree(node: TreeNode, value: boolean): void   // recursive
_openContextMenu(node: TreeNode, path: TreeNode[], x: number, y: number): void
```

## Built-in Menu Items

| Item | Behavior |
|---|---|
| **Copy value** | `navigator.clipboard.writeText(node.label)` |
| **Copy path** | Joins `path.map(n => n.label)` with `pathSeparator()` |
| **Copy object** | Prefers `node.data`. Falls back to a sanitized node shape: `{ label, icon, children: children?.map(sanitize) }` — children recurse, `data` is excluded to avoid duplication. Output is `JSON.stringify(value, null, 2)`. |
| **Expand all** | `expandSubtree(node, true)` — shown only when node has children. |
| **Collapse all** | `expandSubtree(node, false)` — shown only when node has children. |
| **Go to parent** | Scrolls parent's row into view and briefly flashes a highlight class on it (`.ui-tree-node__content--flash`, 1s animation). Shown only when node has a parent. |
| **Collapse parent** | `setExpanded(parent, false)` — folds the current branch up one level. Shown only when node has a parent. |

Each item, on activation, also emits `nodeContextAction` with the node, path,
and action type. Consumers can listen for telemetry or to override side
effects.

## Expansion State Refactor

Current state: `TreeNodeComponent` owns a private `_expanded = signal<boolean | null>(null)`. The chevron toggle and the `expandOnClick` path mutate this per-component signal.

Problem: recursive expand needs to flip expansion on descendant component
instances that may not be rendered yet (collapsed parents never instantiate
their children). Mutating `node.expanded` on the data object is not
signal-reactive.

Solution: move expansion state to the tree host.

```ts
// TreeComponent
private readonly _expandedNodes = signal<ReadonlySet<TreeNode>>(new Set());

isExpanded(node: TreeNode): boolean {
  // Membership in the set wins; otherwise fall back to node.expanded.
  // Track explicit "collapsed" with a second set OR encode tri-state via
  // a Map<TreeNode, boolean>.
}
```

**Decision:** use a `Map<TreeNode, boolean>` rather than a `Set`, so we can
distinguish "user explicitly collapsed" from "no opinion, use node.expanded
default". Required for recursive collapse to override `node.expanded: true`
defaults.

```ts
private readonly _expansion = signal<ReadonlyMap<TreeNode, boolean>>(new Map());

isExpanded(node: TreeNode): boolean {
  const override = this._expansion().get(node);
  return override ?? (node.expanded ?? false);
}

setExpanded(node: TreeNode, value: boolean): void {
  const next = new Map(this._expansion());
  next.set(node, value);
  this._expansion.set(next);
}

expandSubtree(node: TreeNode, value: boolean): void {
  const next = new Map(this._expansion());
  const walk = (n: TreeNode) => {
    if (!n.children?.length) return;
    next.set(n, value);
    for (const c of n.children) walk(c);
  };
  walk(node);
  this._expansion.set(next);
}
```

`TreeNodeComponent.isExpanded` becomes `computed(() => host.isExpanded(node()))`. Its private `_expanded` signal is removed. The chevron `toggle()` and `expandOnClick` path now call `host.setExpanded(node, !host.isExpanded(node))`.

## Right-Click Wiring

The tree renders one `<ui-dropdown #treeMenu>` containing five
`<ui-dropdown-item>`s. Each `TreeNodeComponent`'s content `<div>` gets:

```html
(contextmenu)="onContextMenu($event)"
```

```ts
onContextMenu(event: MouseEvent): void {
  if (!this.treeHost.contextMenu()) return;          // pass through to browser
  event.preventDefault();
  event.stopPropagation();
  this.treeHost._openContextMenu(
    this.node(),
    this.ancestorPath(),                              // see Path Tracking
    event.clientX,
    event.clientY,
  );
}
```

The host stores the currently-targeted node and path in a signal, then calls
`treeMenu.openAt(x, y)`. Menu items read from this signal to know which node
they apply to.

## Path Tracking

`TreeNodeComponent` currently knows only its `level`, not its ancestors. Add
an optional `parentPath = input<TreeNode[]>([])` input. Each node passes
`[...parentPath(), node()]` down to its rendered children. The root tree
template passes `[]`. The node's own path is `[...parentPath(), node()]`.

The path's second-to-last entry is the parent — used directly by
**Go to parent** and **Collapse parent**.

This is small additive plumbing and serves both context-menu and future
features (e.g., breadcrumbs, "expand to node").

## Parent Navigation

**Go to parent**: the host needs to locate the parent's DOM element to scroll
it into view and flash it. Approach: each `TreeNodeComponent` registers its
content element with the host on init, keyed by `TreeNode` identity:

```ts
// TreeComponent
private readonly _nodeElements = new WeakMap<TreeNode, HTMLElement>();
_registerNode(node: TreeNode, el: HTMLElement): void;
_unregisterNode(node: TreeNode): void;
```

`TreeNodeComponent` calls `_registerNode` in `ngAfterViewInit` and
`_unregisterNode` in `ngOnDestroy`. For the flash effect, the host toggles a
signal-backed `_flashNode` for ~1s; the node template binds a
`--flash` modifier class when `host._flashNode() === node()`.

**Collapse parent**: trivially `host.setExpanded(parent, false)`. The current
node disappears from view as a side effect — desirable, since "fold this
branch up" is the user intent.

## Clipboard Fallback

`navigator.clipboard.writeText` is async and may reject in non-secure
contexts. On rejection, fall back to a hidden `<textarea>` + `execCommand('copy')`. Wrap in a small `copyToClipboard(text)` helper inside the tree
component (not extracted globally for now).

## Demo

Add a section to `projects/demo/src/app/app.ts` with:

- A tree containing sample `data` payloads on a few nodes.
- `[contextMenu]="true"`
- `(nodeContextAction)` logging the action + node label to a visible panel.

## Files Touched

- `projects/ngx-ui/src/lib/components/tree/tree.component.ts` — add inputs,
  output, expansion map, menu open method, helper functions.
- `projects/ngx-ui/src/lib/components/tree/tree.component.html` — render the
  single `<ui-dropdown>` and menu items.
- `projects/ngx-ui/src/lib/components/tree/tree.component.scss` — minor menu
  spacing if needed.
- `projects/ngx-ui/src/lib/components/tree/tree-node.component.ts` — remove
  per-node `_expanded` signal, route through host; add `parentPath` input;
  add `onContextMenu` handler.
- `projects/ngx-ui/src/lib/components/tree/tree-node.component.html` — wire
  `(contextmenu)` and `parentPath` propagation.
- `projects/ngx-ui/src/public-api.ts` — export `TreeNodeActionType`,
  `TreeNodeContextAction`.
- `projects/demo/src/app/app.ts` — demo section.

## Risks / Open Questions

- **Identity of TreeNode**: the expansion map keys on `TreeNode` object
  identity. If consumers replace the `nodes` input with a fresh array, the
  expansion state is lost. Acceptable for now — matches the existing
  per-node-component behavior. Document it.
- **Clipboard in iframes**: `navigator.clipboard` requires a transient user
  activation. Right-click + menu-item-click counts as activation, so this
  should work. Verify in demo.
- **Large subtrees**: recursive expand walks every descendant. Fine for typical
  trees; not a concern unless someone drops 10k nodes in.
