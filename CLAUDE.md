# CLAUDE.md - @m1z23r/ngx-ui

## Project Overview

Angular 21+ standalone component library published to npm as `@m1z23r/ngx-ui`. Monorepo with the library source (`projects/ngx-ui/`) and a demo app (`projects/demo/`).

## Commands

```bash
yarn install          # Install dependencies
yarn start            # Serve demo app (localhost:4200)
yarn build            # Dev build of library
yarn build:lib        # Production build to dist/ngx-ui
yarn watch            # Watch mode rebuild
yarn test             # Run tests (Vitest)
yarn publish:lib      # Publish dist/ngx-ui to npm
```

## Architecture

- **100% standalone components** - no NgModules anywhere
- **Signal-based reactivity** - uses `input()`, `output()`, `model()`, `computed()`, `signal()` (Angular 20+ APIs). No RxJS in components.
- **OnPush change detection** on every component
- **CSS custom properties** for theming - all colors/spacing use `var(--ui-*)` tokens
- **BEM-like class naming** - `.ui-component--variant--modifier`
- **Selector prefix** - all components use `ui-` prefix (e.g. `<ui-button>`, `<ui-input>`)
- **Services** for cross-cutting concerns: `DialogService`, `ToastService`, `LoadingService`, `SidebarService` (all `providedIn: 'root'`)

## Directory Structure

```
projects/ngx-ui/src/lib/
  components/          # All UI components, one folder each
    button/            # Example: button.component.ts, .html, .scss
    input/
    layout/            # Shell, Navbar, Sidebar, Content, Footer, SidebarToggle
    ...
  services/            # SidebarService
  loading/             # LoadingService, LoadingDirective, Loadable interface
  dialog/              # DialogService, DialogRef, ModalComponent, DIALOG_DATA/DIALOG_REF tokens
  toast/               # ToastService, ToastRef, ToastConfig
  styles/              # _variables.scss (CSS custom property definitions)
projects/ngx-ui/src/public-api.ts   # All exports (barrel file)
projects/demo/src/app/app.ts        # Demo/showcase app
```

## Conventions When Adding/Modifying Components

- Place in `projects/ngx-ui/src/lib/components/{name}/`
- File naming: `{name}.component.ts`, `{name}.component.html`, `{name}.component.scss`
- Always use `standalone: true` and `changeDetection: ChangeDetectionStrategy.OnPush`
- Use `input()` for inputs, `model()` for two-way bindings, `output()` for events
- Style with CSS custom properties from `_variables.scss` - never hardcode colors
- Export from `projects/ngx-ui/src/public-api.ts`
- Export types (variants, sizes) alongside the component: `export type ButtonVariant = 'primary' | 'secondary' | ...`
- Add usage example to the demo app in `projects/demo/src/app/app.ts`

## Theming Variables

Defined in `projects/ngx-ui/src/lib/styles/_variables.scss`. Key tokens:
- Colors: `--ui-primary`, `--ui-secondary`, `--ui-success`, `--ui-danger`, `--ui-warning`
- Backgrounds: `--ui-bg`, `--ui-bg-secondary`, `--ui-bg-hover`
- Text: `--ui-text`, `--ui-text-secondary`, `--ui-text-muted`
- Borders: `--ui-border`, `--ui-border-hover`
- Spacing: `--ui-spacing-{xs,sm,md,lg,xl}`
- Radius: `--ui-radius-{sm,md,lg,xl}`
- Shadows: `--ui-shadow-{sm,md,lg}`
- Transitions: `--ui-transition-{fast,normal,slow}` (150ms/200ms/300ms)

## Key Patterns

**Loading system**: `LoadingService.start(id)` / `.stop(id)` + `LoadingDirective` on components implementing `Loadable` interface.

**Dialog system**: `DialogService.open(Component, { data })` returns `DialogRef` with `.afterClosed()` promise. Components inject `DIALOG_DATA` and `DIALOG_REF`.

**Toast system**: `ToastService.show({ message, variant, position, duration })` returns `ToastRef`.

## Tech Stack

- Angular 21.0.0+, TypeScript 5.9+, SCSS
- Package manager: yarn
- Build: ng-packagr (via `@angular/build:ng-packagr`)
- Test runner: Vitest
- Path alias: `@m1z23r/ngx-ui` maps to `./dist/ngx-ui` (in root tsconfig)
