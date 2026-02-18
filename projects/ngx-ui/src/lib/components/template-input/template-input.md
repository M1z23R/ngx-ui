# Template Input

Postman-style single-line input that detects `{{variable}}` tokens and highlights them based on their state.

## Import

```ts
import {
  TemplateInputComponent,
  TemplateVariable,
  VariablePopoverDirective,
} from '@m1z23r/ngx-ui';
```

## API

### Inputs

| Name          | Type                 | Default | Description                    |
|---------------|----------------------|---------|--------------------------------|
| `value`       | `model<string>`      | —       | **Required.** Two-way bound template string. |
| `variables`   | `model<TemplateVariable[]>` | — | **Required.** Two-way bound variable definitions. |
| `label`       | `string`             | `''`    | Label text above the input.    |
| `placeholder` | `string`             | `''`    | Placeholder text.              |
| `hint`        | `string`             | `''`    | Hint text below the input.     |
| `error`       | `string`             | `''`    | Error text (replaces hint).    |
| `disabled`    | `boolean`            | `false` | Disables the input.            |
| `readonly`    | `boolean`            | `false` | Makes the input read-only.     |
| `required`    | `boolean`            | `false` | Adds required indicator.       |

### Outputs

| Name            | Type                | Description                              |
|-----------------|---------------------|------------------------------------------|
| `variableHover` | `string \| null`    | Emits variable key on hover, `null` on leave. |

### Variable State

Each `{{key}}` in the value is colored by its state:

| State        | Condition                          | Default Color |
|--------------|------------------------------------|---------------|
| **resolved** | Key exists in `variables` with a truthy `value` | Green (`--ui-success`) |
| **unset**    | Key exists in `variables` with empty `value`     | Amber (`--ui-warning`) |
| **unknown**  | Key not found in `variables`                     | Red (`--ui-danger`)    |

## Basic Usage

```ts
templateUrl = signal('/api/{{resource}}/{{id}}');
templateVars = signal<TemplateVariable[]>([
  { key: 'resource', value: 'users' },  // resolved (green)
  { key: 'id', value: '' },             // unset (amber)
  // any {{other}} token → unknown (red)
]);
```

```html
<ui-template-input
  label="API Endpoint"
  [(value)]="templateUrl"
  [(variables)]="templateVars"
  hint="Green = resolved, Amber = unset, Red = unknown"
/>
```

## Custom Popover

Use `uiVariablePopover` to provide a custom hover template:

```html
<ui-template-input [(value)]="url" [(variables)]="vars">
  <ng-template
    uiVariablePopover
    let-key
    let-val="value"
    let-state="state"
    let-close="close"
  >
    <div class="my-popover">
      <strong>{{ key }}</strong> ({{ state }})
      <p>{{ val || 'No value set' }}</p>
      <button (click)="close()">Close</button>
    </div>
  </ng-template>
</ui-template-input>
```

### Popover Context (`VariablePopoverContext`)

| Property     | Type              | Description                    |
|--------------|-------------------|--------------------------------|
| `$implicit`  | `string`          | Variable key (for `let-x`).    |
| `key`        | `string`          | Variable key.                  |
| `value`      | `string`          | Current value, or `''`.        |
| `state`      | `VariableState`   | `'resolved'`, `'unset'`, or `'unknown'`. |
| `close`      | `() => void`      | Closes the popover.            |

## Theming

Override these CSS custom properties to change variable highlight colors:

```css
:root {
  /* Resolved — key exists and has a value */
  --ui-tmpl-resolved-color: var(--ui-success);
  --ui-tmpl-resolved-bg: color-mix(in srgb, var(--ui-success) 12%, transparent);

  /* Unset — key exists but value is empty */
  --ui-tmpl-unset-color: var(--ui-warning);
  --ui-tmpl-unset-bg: color-mix(in srgb, var(--ui-warning) 12%, transparent);

  /* Unknown — key not in variables array */
  --ui-tmpl-unknown-color: var(--ui-danger);
  --ui-tmpl-unknown-bg: color-mix(in srgb, var(--ui-danger) 12%, transparent);
}
```
