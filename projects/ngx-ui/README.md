# @m1z23r/ngx-ui

A modern, themeable Angular UI component library built with standalone components and signals. Designed for Angular 21+.

## Features

- Standalone components (no NgModule required)
- Signal-based reactive state management
- CSS custom properties for easy theming
- Responsive layout system with mobile support
- OnPush change detection for optimal performance
- Accessible by default (ARIA attributes, focus management)

## Installation

```bash
npm install @m1z23r/ngx-ui
# or
yarn add @m1z23r/ngx-ui
```

## Setup

Import the base styles in your global stylesheet:

```scss
@use '@m1z23r/ngx-ui/styles';
```

Or import specific style files:

```scss
@use '@m1z23r/ngx-ui/lib/styles/variables';
```

## Components

### Button

A configurable button component with multiple variants and sizes.

```typescript
import { ButtonComponent } from '@m1z23r/ngx-ui';

@Component({
  imports: [ButtonComponent],
  template: `
    <ui-button variant="primary" size="md" (clicked)="handleClick($event)">
      Click me
    </ui-button>

    <ui-button variant="outline" [loading]="isLoading">
      Submit
    </ui-button>
  `
})
```

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `disabled` | `boolean` | `false` | Disable the button |
| `loading` | `boolean` | `false` | Show loading spinner |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `clicked` | `MouseEvent` | Emitted when button is clicked |

---

### Input

A form input component with label, hint, and error support.

```typescript
import { InputComponent } from '@m1z23r/ngx-ui';

@Component({
  imports: [InputComponent],
  template: `
    <ui-input
      label="Email"
      type="email"
      placeholder="Enter your email"
      [(value)]="email"
      [error]="emailError"
      hint="We'll never share your email"
    />
  `
})
```

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url'` | `'text'` | Input type |
| `label` | `string` | `''` | Label text |
| `placeholder` | `string` | `''` | Placeholder text |
| `hint` | `string` | `''` | Hint text below input |
| `error` | `string` | `''` | Error message (shows error state) |
| `disabled` | `boolean` | `false` | Disable the input |
| `readonly` | `boolean` | `false` | Make input read-only |
| `required` | `boolean` | `false` | Mark as required (shows asterisk) |
| `id` | `string` | auto-generated | Custom input ID |

#### Two-way Binding

| Model | Type | Description |
|-------|------|-------------|
| `value` | `string \| number` | The input value |

---

### Table

A data table component with sorting and custom cell templates.

```typescript
import { TableComponent, CellTemplateDirective, TableColumn } from '@m1z23r/ngx-ui';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

@Component({
  imports: [TableComponent, CellTemplateDirective],
  template: `
    <ui-table [data]="users" [columns]="columns" [trackByFn]="trackById">
      <!-- Custom cell template -->
      <ng-template uiCellTemplate="status" let-value="value">
        <span [class]="value === 'active' ? 'text-green' : 'text-red'">
          {{ value }}
        </span>
      </ng-template>

      <!-- Empty state -->
      <div slot="empty">No users found</div>
    </ui-table>
  `
})
export class MyComponent {
  users: User[] = [...];

  columns: TableColumn<User>[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'status', header: 'Status' }
  ];

  trackById = (user: User) => user.id;
}
```

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `data` | `T[]` | `[]` | Array of data items |
| `columns` | `TableColumn<T>[]` | `[]` | Column definitions |
| `trackByFn` | `(item: T) => unknown` | `item => item` | Track by function |

#### TableColumn Interface

```typescript
interface TableColumn<T> {
  key: keyof T | string;  // Property key or dot-notation path
  header: string;         // Column header text
  sortable?: boolean;     // Enable sorting
  width?: string;         // Column width (CSS value)
}
```

#### Custom Cell Templates

Use `uiCellTemplate` directive to customize cell rendering:

```html
<ng-template uiCellTemplate="columnKey" let-row let-value="value" let-index="index">
  <!-- Template content -->
</ng-template>
```

Template context:
- `$implicit` / `row` - The row data object
- `value` - The cell value
- `index` - Row index

---

## Layout Components

A complete layout system for building application shells with responsive sidebar.

### Quick Start

```typescript
import {
  ShellComponent,
  NavbarComponent,
  SidebarComponent,
  ContentComponent,
  FooterComponent,
  SidebarToggleComponent,
  SidebarService
} from '@m1z23r/ngx-ui';

@Component({
  imports: [
    ShellComponent,
    NavbarComponent,
    SidebarComponent,
    ContentComponent,
    FooterComponent,
    SidebarToggleComponent
  ],
  template: `
    <ui-shell>
      <ui-sidebar>
        <div slot="header">
          <img src="logo.svg" alt="Logo" />
        </div>

        <!-- Navigation items -->
        <a href="/dashboard">Dashboard</a>
        <a href="/settings">Settings</a>

        <div slot="footer">
          <button (click)="logout()">Logout</button>
        </div>
      </ui-sidebar>

      <ui-navbar>
        <div slot="start">
          <ui-sidebar-toggle />
        </div>
        <div slot="center">
          <h1>Page Title</h1>
        </div>
        <div slot="end">
          <button>Profile</button>
        </div>
      </ui-navbar>

      <ui-content>
        <!-- Main content -->
        <router-outlet />
      </ui-content>

      <ui-footer>
        &copy; 2024 My App
      </ui-footer>
    </ui-shell>
  `
})
```

### Shell Component

Container component that manages the grid layout.

```html
<ui-shell>
  <!-- ui-sidebar, ui-navbar, ui-content, ui-footer -->
</ui-shell>
```

### Sidebar Component

Collapsible sidebar with header, navigation, and footer slots.

```html
<ui-sidebar>
  <div slot="header">Logo/Brand</div>
  <!-- Default slot: navigation items -->
  <div slot="footer">Footer content</div>
</ui-sidebar>
```

### Navbar Component

Top navigation bar with start, center, and end slots.

```html
<ui-navbar>
  <div slot="start">Left content</div>
  <div slot="center">Center content</div>
  <div slot="end">Right content</div>
</ui-navbar>
```

### Sidebar Toggle Component

Button to toggle sidebar collapse/expand state.

```html
<ui-sidebar-toggle [mobileOnly]="true" />
```

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `mobileOnly` | `boolean` | `true` | Only show on mobile devices |

### SidebarService

Injectable service to programmatically control the sidebar.

```typescript
import { SidebarService } from '@m1z23r/ngx-ui';

@Component({...})
export class MyComponent {
  private sidebarService = inject(SidebarService);

  // Signals
  isCollapsed = this.sidebarService.collapsed;
  isMobileOpen = this.sidebarService.mobileOpen;
  isMobile = this.sidebarService.isMobile;

  // Methods
  toggle() { this.sidebarService.toggle(); }
  expand() { this.sidebarService.expand(); }
  collapse() { this.sidebarService.collapse(); }
  openMobile() { this.sidebarService.openMobile(); }
  closeMobile() { this.sidebarService.closeMobile(); }
}
```

---

## Theming

All components use CSS custom properties for styling. Override these in your global stylesheet:

```scss
:root {
  // Primary colors
  --ui-primary: #3b82f6;
  --ui-primary-hover: #2563eb;
  --ui-primary-active: #1d4ed8;
  --ui-primary-text: #ffffff;

  // Secondary colors
  --ui-secondary: #64748b;
  --ui-secondary-hover: #475569;
  --ui-secondary-active: #334155;
  --ui-secondary-text: #ffffff;

  // Semantic colors
  --ui-success: #22c55e;
  --ui-danger: #ef4444;
  --ui-warning: #f59e0b;

  // Background colors
  --ui-bg: #ffffff;
  --ui-bg-secondary: #f8fafc;
  --ui-bg-tertiary: #f1f5f9;
  --ui-bg-hover: rgba(0, 0, 0, 0.05);

  // Text colors
  --ui-text: #1e293b;
  --ui-text-muted: #64748b;
  --ui-text-disabled: #94a3b8;

  // Border colors
  --ui-border: #e2e8f0;
  --ui-border-hover: #cbd5e1;
  --ui-border-focus: var(--ui-primary);

  // Border radius
  --ui-radius-sm: 0.25rem;
  --ui-radius-md: 0.375rem;
  --ui-radius-lg: 0.5rem;

  // Spacing
  --ui-spacing-xs: 0.25rem;
  --ui-spacing-sm: 0.5rem;
  --ui-spacing-md: 1rem;
  --ui-spacing-lg: 1.5rem;
  --ui-spacing-xl: 2rem;

  // Layout dimensions
  --ui-sidebar-width: 16rem;
  --ui-sidebar-collapsed-width: 4rem;
  --ui-navbar-height: 4rem;
  --ui-footer-height: 3rem;

  // Shadows
  --ui-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --ui-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --ui-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  // Transitions
  --ui-transition-fast: 150ms ease;
  --ui-transition-normal: 200ms ease;
  --ui-transition-slow: 300ms ease;

  // Font sizes
  --ui-font-xs: 0.75rem;
  --ui-font-sm: 0.875rem;
  --ui-font-md: 1rem;
  --ui-font-lg: 1.125rem;
}
```

### Dark Theme Example

```scss
[data-theme="dark"] {
  --ui-bg: #0f172a;
  --ui-bg-secondary: #1e293b;
  --ui-bg-tertiary: #334155;
  --ui-text: #f1f5f9;
  --ui-text-muted: #94a3b8;
  --ui-border: #334155;
  --ui-border-hover: #475569;
}
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Requirements

- Angular 21.0.0 or higher
- TypeScript 5.9 or higher

## License

MIT
