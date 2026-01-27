# @m1z23r/ngx-ui

A modern, themeable Angular UI component library built with standalone components and signals.

## Components

- **Button** - Configurable button with variants (primary, secondary, outline, ghost) and sizes
- **Input** - Form input with label, hint, error, and validation support
- **Table** - Data table with sorting and custom cell templates
- **Layout System** - Shell, Navbar, Sidebar, Content, Footer components for building app layouts

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
