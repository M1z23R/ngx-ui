# ngx-ui Component Implementation Plan

## Status Overview

| # | Component | Status | Notes |
|---|-----------|--------|-------|
| 1 | Badge | Done | Variants, sizes, removable, rounded |
| 2 | Textarea | Done | Character counter, resize options |
| 3 | Progress Bar | Done | Animated, striped, indeterminate |
| 4 | Circular Progress | Done | Configurable stroke width |
| 5 | Spinner | Done | Size and color variants |
| 6 | Alert | Done | Dismissible, icons, variants |
| 7 | Tooltip | Done | Directive-based, positioning |
| 8 | Card | Done | Header/footer slots, clickable |
| 9 | Radio/RadioGroup | Done | Default + segmented control variant |
| 10 | Tabs | Done | Default, pills, underline variants |
| 11 | Toast/Notification | Done | Service-based, positions, auto-dismiss |
| 12 | Pagination | Done | Page buttons, truncation, sizes |

---

## Pending Components

### 9. Radio/RadioGroup
**Status: Done**

```typescript
// radio-group.component.ts
Model:
- value: model<T | null>(null)

Inputs:
- name: input<string>('')
- disabled: input<boolean>(false)
- orientation: input<'horizontal' | 'vertical'>('vertical')

// radio.component.ts
Inputs:
- value: input.required<T>()
- disabled: input<boolean>(false)
```

Features:
- RadioGroup manages selected value via model()
- Individual Radio components
- Keyboard navigation (arrow keys)
- Custom styled radio circles

---

### 10. Tabs
**Status: Done**

```typescript
// tabs.component.ts
Model:
- activeTab: model<string | number>(0)

Inputs:
- variant: input<'default' | 'pills' | 'underline'>('default')

// tab.component.ts
Inputs:
- id: input<string | number>('')
- label: input.required<string>()
- disabled: input<boolean>(false)
```

Features:
- Tab headers with content panels
- Animated indicator (underline variant)
- Keyboard navigation

---

### 11. Toast/Notification
**Status: Done**

```typescript
// toast.service.ts
Methods:
- show(config): ToastRef
- success(message, title?): ToastRef
- error(message, title?): ToastRef
- warning(message, title?): ToastRef
- info(message, title?): ToastRef
- dismiss(id): void
- dismissAll(): void
```

Features:
- Service-based API
- Stacking multiple toasts
- Auto-dismiss with countdown
- Position variants (top-right, bottom-left, etc.)

---

### 12. Pagination
**Status: Done**

```typescript
// pagination.component.ts
Model:
- page: model<number>(1)

Inputs:
- total: input.required<number>()
- pageSize: input<number>(10)
- maxPages: input<number>(5)
- showFirstLast: input<boolean>(true)
```

Features:
- Page number buttons
- First/Last/Prev/Next navigation
- Responsive truncation

---

## Completed Components Summary

### Phase 1 (Simple)
- **Badge** - Color variants, sizes, removable, pill/rounded style
- **Textarea** - model() binding, character counter, resize control
- **Progress** - Linear bar, variants, striped, animated, indeterminate
- **Circular Progress** - SVG-based, configurable stroke, indeterminate
- **Spinner** - Simple loading indicator, size/color variants

### Phase 2 (Medium)
- **Alert** - Info/success/warning/danger, dismissible, icons
- **Tooltip** - Directive, position options, delay, viewport-aware
- **Card** - Header/body/footer, variants, clickable

---

## File Structure

```
projects/ngx-ui/src/lib/components/
├── alert/
├── badge/
├── button/
├── card/
├── checkbox/
├── dropdown/
├── file-chooser/
├── input/
├── layout/
├── progress/
│   ├── progress.component.ts
│   └── circular-progress.component.ts
├── radio/          # pending
├── select/
├── spinner/
├── switch/
├── table/
├── tabs/           # pending
├── textarea/
└── tooltip/

projects/ngx-ui/src/lib/
├── dialog/
├── loading/
├── services/
├── styles/
└── toast/          # pending
```
