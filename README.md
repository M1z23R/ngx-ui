# @m1z23r/ngx-ui

A modern, themeable Angular UI component library built with standalone components and signals.

## Components

### Form Controls
- **Button** - Variants (primary, secondary, outline, ghost) with loading state
- **Input** - Text input with label, hint, error support
- **Textarea** - Multi-line input with character counter
- **Select** - Single/multi-select dropdown with search
- **Checkbox** - Checkbox with indeterminate state
- **Switch** - Toggle switch
- **File Chooser** - Drag-and-drop file upload

### Feedback
- **Alert** - Contextual feedback messages (info, success, warning, danger)
- **Badge** - Status indicators and labels
- **Progress** - Linear progress bar (animated, striped, indeterminate)
- **Circular Progress** - Ring progress with configurable stroke
- **Spinner** - Loading spinner
- **Tooltip** - Hover tooltips (directive)

### Layout
- **Card** - Content container with header/footer
- **Table** - Data table with sorting
- **Dropdown** - Context menu
- **Dialog/Modal** - Modal dialogs via service

### App Shell
- **Shell** - Main layout container
- **Navbar** - Top navigation bar
- **Sidebar** - Collapsible side navigation
- **Content** - Main content area
- **Footer** - Page footer

### Services
- **DialogService** - Programmatic modal dialogs
- **LoadingService** - Centralized loading state
- **SidebarService** - Sidebar state management

## Quick Start

```bash
npm install @m1z23r/ngx-ui
```

```typescript
import { ButtonComponent, InputComponent } from '@m1z23r/ngx-ui';

@Component({
  imports: [ButtonComponent, InputComponent],
  template: `
    <ui-button variant="primary" (clicked)="save()">Save</ui-button>
    <ui-input label="Name" [(value)]="name" />
  `
})
```

See the [full documentation](./projects/ngx-ui/README.md) for detailed usage and API reference.

## Development

```bash
# Install dependencies
yarn install

# Start demo app
yarn start

# Build library
yarn build:lib

# Publish to npm
yarn publish:lib
```

## Requirements

- Angular 21.0.0+
- TypeScript 5.9+

## License

MIT
