/*
 * Public API Surface of @m1z23r/ngx-ui
 */

// Services
export { SidebarService } from './lib/services/sidebar.service';
export { LoadingService } from './lib/loading/loading.service';
export { DialogService } from './lib/dialog/dialog.service';

// Dialog
export { DialogRef } from './lib/dialog/dialog-ref';
export { ModalComponent } from './lib/dialog/modal.component';
export { DIALOG_DATA, DIALOG_REF } from './lib/dialog/dialog.config';
export type { DialogConfig, ModalSize } from './lib/dialog/dialog.config';

// Loading
export { LoadingDirective } from './lib/loading/loading.directive';
export type { Loadable } from './lib/loading/loadable';
export { LOADABLE } from './lib/loading/loadable';

// Components
export { ButtonComponent } from './lib/components/button/button.component';
export type { ButtonVariant, ButtonSize } from './lib/components/button/button.component';

export { InputComponent } from './lib/components/input/input.component';
export type { InputType } from './lib/components/input/input.component';

export { TableComponent, CellTemplateDirective } from './lib/components/table/table.component';
export type { TableColumn, SortDirection, SortState } from './lib/components/table/table.component';

// Layout Components
export { ShellComponent } from './lib/components/layout/shell/shell.component';
export { NavbarComponent } from './lib/components/layout/navbar/navbar.component';
export { SidebarComponent } from './lib/components/layout/sidebar/sidebar.component';
export { ContentComponent } from './lib/components/layout/content/content.component';
export { FooterComponent } from './lib/components/layout/footer/footer.component';
export { SidebarToggleComponent } from './lib/components/layout/sidebar-toggle/sidebar-toggle.component';
