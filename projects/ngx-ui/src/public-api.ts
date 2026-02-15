/*
 * Public API Surface of @m1z23r/ngx-ui
 */

// Validators
export { Validators } from './lib/validators/validators';
export type { ValidationError, ValidatorFn } from './lib/validators/validators';

// Services
export { SidebarService } from './lib/services/sidebar.service';
export { LoadingService } from './lib/loading/loading.service';
export { DialogService } from './lib/dialog/dialog.service';
export { ToastService } from './lib/toast/toast.service';
export { TabsService } from './lib/components/tabs/tabs.service';

// Toast
export { ToastRef } from './lib/toast/toast-ref';
export type { ToastConfig, ToastVariant, ToastPosition } from './lib/toast/toast.config';

// Dialog
export { DialogRef } from './lib/dialog/dialog-ref';
export { ModalComponent } from './lib/components/modal/modal.component';
export { DIALOG_DATA, DIALOG_REF } from './lib/dialog/dialog.config';
export type { DialogConfig, ModalSize } from './lib/dialog/dialog.config';

// Loading
export { LoadingDirective } from './lib/loading/loading.directive';
export type { Loadable } from './lib/loading/loadable';
export { LOADABLE } from './lib/loading/loadable';

// Components
export { ButtonComponent } from './lib/components/button/button.component';
export type { ButtonVariant, ButtonColor, ButtonSize } from './lib/components/button/button.component';

export { InputComponent } from './lib/components/input/input.component';
export type { InputType, ValidationState } from './lib/components/input/input.component';

export { TableComponent, CellTemplateDirective } from './lib/components/table/table.component';
export type { TableColumn, SortDirection, SortState } from './lib/components/table/table.component';
export { CellValuePipe } from './lib/components/table/cell-value.pipe';

export { SelectComponent } from './lib/components/select/select.component';
export type { SelectVariant, SelectSize } from './lib/components/select/select.component';
export { OptionComponent } from './lib/components/select/option.component';
export { OptionTemplateDirective } from './lib/components/select/option-template.directive';
export type { OptionTemplateContext } from './lib/components/select/option-template.directive';

export { DropdownComponent } from './lib/components/dropdown/dropdown.component';
export type { DropdownPosition, DropdownAlign } from './lib/components/dropdown/dropdown.component';
export { DropdownItemComponent } from './lib/components/dropdown/dropdown-item.component';
export { DropdownDividerComponent } from './lib/components/dropdown/dropdown-divider.component';
export { DropdownTriggerDirective } from './lib/components/dropdown/dropdown-trigger.directive';
export { ContextMenuDirective } from './lib/components/dropdown/context-menu.directive';

export { CheckboxComponent } from './lib/components/checkbox/checkbox.component';
export type { CheckboxSize } from './lib/components/checkbox/checkbox.component';

export { SwitchComponent } from './lib/components/switch/switch.component';
export type { SwitchSize } from './lib/components/switch/switch.component';

export { BadgeComponent } from './lib/components/badge/badge.component';
export type { BadgeVariant, BadgeSize } from './lib/components/badge/badge.component';

export { TextareaComponent } from './lib/components/textarea/textarea.component';
export type { TextareaResize } from './lib/components/textarea/textarea.component';

export { ProgressComponent } from './lib/components/progress/progress.component';
export type { ProgressVariant, ProgressSize } from './lib/components/progress/progress.component';

export { CircularProgressComponent } from './lib/components/progress/circular-progress.component';
export type { CircularProgressVariant, CircularProgressSize } from './lib/components/progress/circular-progress.component';

export { SpinnerComponent } from './lib/components/spinner/spinner.component';
export type { SpinnerSize, SpinnerVariant } from './lib/components/spinner/spinner.component';

export { AlertComponent } from './lib/components/alert/alert.component';
export type { AlertVariant } from './lib/components/alert/alert.component';

export { CardComponent } from './lib/components/card/card.component';
export type { CardVariant, CardPadding } from './lib/components/card/card.component';

export { TooltipDirective } from './lib/components/tooltip/tooltip.directive';
export type { TooltipPosition } from './lib/components/tooltip/tooltip.directive';

export { RadioGroupComponent } from './lib/components/radio/radio-group.component';
export type { RadioGroupOrientation, RadioGroupSize, RadioGroupVariant } from './lib/components/radio/radio-group.component';
export { RadioComponent } from './lib/components/radio/radio.component';

export { TabsComponent } from './lib/components/tabs/tabs.component';
export type { TabsVariant, TabsSize } from './lib/components/tabs/tabs.component';
export { TabComponent } from './lib/components/tabs/tab.component';
export { TabIconDirective } from './lib/components/tabs/tab-icon.directive';
export { TabActivePipe } from './lib/components/tabs/tab-active.pipe';
export { DynamicTabsComponent } from './lib/components/tabs/dynamic-tabs.component';
export type { DynamicTabsVariant, DynamicTabsSize } from './lib/components/tabs/dynamic-tabs.component';
export { TabRef } from './lib/components/tabs/tab-ref';
export { TAB_DATA, TAB_REF } from './lib/components/tabs/tab.config';
export type { DynamicTabConfig } from './lib/components/tabs/tab.config';

export { AccordionComponent } from './lib/components/accordion/accordion.component';
export type { AccordionVariant } from './lib/components/accordion/accordion.component';
export { AccordionItemComponent } from './lib/components/accordion/accordion-item.component';
export { AccordionHeaderDirective } from './lib/components/accordion/accordion-header.directive';

export { PaginationComponent } from './lib/components/pagination/pagination.component';
export type { PaginationSize } from './lib/components/pagination/pagination.component';

export { FileChooserComponent } from './lib/components/file-chooser/file-chooser.component';
export type { FileChooserVariant, FileChooserSize } from './lib/components/file-chooser/file-chooser.component';
export { FileSizePipe } from './lib/components/file-chooser/file-size.pipe';
export { FilePreviewPipe } from './lib/components/file-chooser/file-preview.pipe';

export { SliderComponent } from './lib/components/slider/slider.component';
export type { SliderSize } from './lib/components/slider/slider.component';

export { ChipInputComponent, ChipTemplateDirective } from './lib/components/chip-input/chip-input.component';
export type { ChipInputVariant, ChipInputSize, ChipTemplateContext } from './lib/components/chip-input/chip-input.component';

export { DatepickerComponent } from './lib/components/datepicker/datepicker.component';
export type { DatepickerView, DatepickerSize, DatepickerVariant, DateRange } from './lib/components/datepicker/datepicker.component';

export { TimepickerComponent } from './lib/components/timepicker/timepicker.component';
export type { TimepickerSize, TimepickerVariant, TimeFormat, TimeValue } from './lib/components/timepicker/timepicker.component';

export { DatetimepickerComponent } from './lib/components/datetimepicker/datetimepicker.component';
export type { DatetimepickerSize, DatetimepickerVariant, DatetimepickerView } from './lib/components/datetimepicker/datetimepicker.component';

// Layout Components
export { ShellComponent } from './lib/components/layout/shell/shell.component';
export type { ShellVariant } from './lib/components/layout/shell/shell.component';
export { NavbarComponent } from './lib/components/layout/navbar/navbar.component';
export { SidebarComponent } from './lib/components/layout/sidebar/sidebar.component';
export { ContentComponent } from './lib/components/layout/content/content.component';
export { FooterComponent } from './lib/components/layout/footer/footer.component';
export { SidebarToggleComponent } from './lib/components/layout/sidebar-toggle/sidebar-toggle.component';

// Split Pane
export { SplitComponent } from './lib/components/split-pane/split.component';
export type { SplitOrientation, SplitGutterSize, SplitSizeChange } from './lib/components/split-pane/split.component';
export { SplitPaneComponent } from './lib/components/split-pane/split-pane.component';

// Tree
export { TreeComponent } from './lib/components/tree/tree.component';
export type { TreeNode } from './lib/components/tree/tree.component';
export { TreeNodeComponent } from './lib/components/tree/tree-node.component';
