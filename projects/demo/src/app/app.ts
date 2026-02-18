import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  InputComponent,
  Validators,
  ValidatorFn,
  TableComponent,
  ShellComponent,
  NavbarComponent,
  SidebarComponent,
  SidebarToggleComponent,
  ContentComponent,
  FooterComponent,
  SidebarService,
  TableColumn,
  DialogService,
  SelectComponent,
  OptionComponent,
  DropdownComponent,
  DropdownItemComponent,
  DropdownDividerComponent,
  DropdownTriggerDirective,
  ContextMenuDirective,
  CheckboxComponent,
  SwitchComponent,
  FileChooserComponent,
  BadgeComponent,
  TextareaComponent,
  ProgressComponent,
  SpinnerComponent,
  AlertComponent,
  CardComponent,
  TooltipDirective,
  CircularProgressComponent,
  RadioGroupComponent,
  RadioComponent,
  TabsComponent,
  TabComponent,
  DynamicTabsComponent,
  TabsService,
  ToastService,
  PaginationComponent,
  AccordionComponent,
  AccordionItemComponent,
  AccordionHeaderDirective,
  SliderComponent,
  DatepickerComponent,
  DateRange,
  TimepickerComponent,
  TimeValue,
  DatetimepickerComponent,
  ShellVariant,
  ChipInputComponent,
  ChipTemplateDirective,
  SplitComponent,
  SplitPaneComponent,
  TreeComponent,
  TreeNode,
  TreeNodeDropEvent,
  TemplateInputComponent,
  TemplateVariable,
  VariablePopoverDirective,
} from '@m1z23r/ngx-ui';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';
import { SampleTabComponent, SampleTabData } from './sample-tab';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    TableComponent,
    ShellComponent,
    NavbarComponent,
    SidebarComponent,
    SidebarToggleComponent,
    ContentComponent,
    FooterComponent,
    SelectComponent,
    OptionComponent,
    DropdownComponent,
    DropdownItemComponent,
    DropdownDividerComponent,
    DropdownTriggerDirective,
    ContextMenuDirective,
    CheckboxComponent,
    SwitchComponent,
    FileChooserComponent,
    BadgeComponent,
    TextareaComponent,
    ProgressComponent,
    SpinnerComponent,
    AlertComponent,
    CardComponent,
    TooltipDirective,
    CircularProgressComponent,
    RadioGroupComponent,
    RadioComponent,
    TabsComponent,
    TabComponent,
    DynamicTabsComponent,
    PaginationComponent,
    AccordionComponent,
    AccordionItemComponent,
    AccordionHeaderDirective,
    SliderComponent,
    DatepickerComponent,
    TimepickerComponent,
    DatetimepickerComponent,
    ChipInputComponent,
    ChipTemplateDirective,
    SplitComponent,
    SplitPaneComponent,
    TreeComponent,
    TemplateInputComponent,
    VariablePopoverDirective,
  ],
  template: `
    <ui-shell [variant]="shellVariant()">
      <ui-sidebar>
        <div slot="header">
          <strong>ngx-ui Demo</strong>
        </div>
        <nav class="nav-links">
          <a href="#" class="nav-link">Dashboard</a>
          <a href="#" class="nav-link">Users</a>
          <a href="#" class="nav-link">Settings</a>
        </nav>
        <div slot="footer">
          <ui-button variant="ghost" color="secondary" size="sm" (clicked)="sidebarService.toggle()">
            {{ sidebarService.collapsed() ? '>' : '<' }} Collapse
          </ui-button>
        </div>
      </ui-sidebar>

      <ui-navbar>
        <div slot="start">
          <ui-sidebar-toggle />
        </div>
        <div slot="center">
          <span class="navbar-title">Dashboard</span>
        </div>
        <div slot="end" style="display: flex; align-items: center; gap: 0.75rem;">
          <ui-switch [(checked)]="headerVariant" size="sm">Header layout</ui-switch>
          <ui-button variant="outline" size="sm">Profile</ui-button>
        </div>
      </ui-navbar>

      <ui-content>
        <h1>Component Showcase</h1>

        <section class="section">
          <h2>Buttons</h2>
          <h3>Colors (default variant)</h3>
          <div class="button-row">
            <ui-button color="primary">Primary</ui-button>
            <ui-button color="secondary">Secondary</ui-button>
            <ui-button color="danger">Danger</ui-button>
            <ui-button color="success">Success</ui-button>
            <ui-button color="warning">Warning</ui-button>
          </div>
          <h3>Outline variant</h3>
          <div class="button-row">
            <ui-button variant="outline" color="primary">Primary</ui-button>
            <ui-button variant="outline" color="secondary">Secondary</ui-button>
            <ui-button variant="outline" color="danger">Danger</ui-button>
            <ui-button variant="outline" color="success">Success</ui-button>
            <ui-button variant="outline" color="warning">Warning</ui-button>
          </div>
          <h3>Ghost variant</h3>
          <div class="button-row">
            <ui-button variant="ghost" color="primary">Primary</ui-button>
            <ui-button variant="ghost" color="secondary">Secondary</ui-button>
            <ui-button variant="ghost" color="danger">Danger</ui-button>
            <ui-button variant="ghost" color="success">Success</ui-button>
            <ui-button variant="ghost" color="warning">Warning</ui-button>
          </div>
          <h3>Elevated variant</h3>
          <div class="button-row">
            <ui-button variant="elevated" color="primary">Primary</ui-button>
            <ui-button variant="elevated" color="secondary">Secondary</ui-button>
            <ui-button variant="elevated" color="danger">Danger</ui-button>
          </div>
          <h3>Sizes</h3>
          <div class="button-row">
            <ui-button size="sm">Small</ui-button>
            <ui-button size="md">Medium</ui-button>
            <ui-button size="lg">Large</ui-button>
          </div>
          <h3>States</h3>
          <div class="button-row">
            <ui-button [disabled]="true">Disabled</ui-button>
            <ui-button [loading]="isLoading()">
              {{ isLoading() ? 'Loading...' : 'Click to Load' }}
            </ui-button>
            <ui-button (clicked)="toggleLoading()">Toggle Loading</ui-button>
          </div>
        </section>

        <section class="section">
          <h2>Badge</h2>
          <div class="button-row">
            <ui-badge>Default</ui-badge>
            <ui-badge variant="primary">Primary</ui-badge>
            <ui-badge variant="success">Success</ui-badge>
            <ui-badge variant="warning">Warning</ui-badge>
            <ui-badge variant="danger">Danger</ui-badge>
            <ui-badge variant="info">Info</ui-badge>
          </div>
          <div class="button-row">
            <ui-badge size="sm">Small</ui-badge>
            <ui-badge size="md">Medium</ui-badge>
            <ui-badge size="lg">Large</ui-badge>
          </div>
          <div class="button-row">
            <ui-badge variant="primary" [rounded]="true">Rounded</ui-badge>
            <ui-badge variant="success" [rounded]="true" [removable]="true" (removed)="onBadgeRemoved()">Removable</ui-badge>
          </div>
        </section>

        <section class="section">
          <h2>Spinner</h2>
          <div class="button-row" style="align-items: center;">
            <ui-spinner size="sm" />
            <ui-spinner size="md" />
            <ui-spinner size="lg" />
            <ui-spinner size="xl" />
          </div>
          <div class="button-row" style="align-items: center;">
            <ui-spinner variant="primary" />
            <ui-spinner variant="secondary" />
            <span style="background: var(--ui-primary); padding: 0.5rem; border-radius: var(--ui-radius-md);">
              <ui-spinner variant="white" />
            </span>
          </div>
        </section>

        <section class="section">
          <h2>Progress</h2>
          <div class="progress-grid">
            <div>
              <p class="progress-label">Default ({{ progressValue() }}%)</p>
              <ui-progress [value]="progressValue()" />
            </div>
            <div>
              <p class="progress-label">With Label</p>
              <ui-progress [value]="progressValue()" [showLabel]="true" size="lg" />
            </div>
            <div>
              <p class="progress-label">Variants</p>
              <div class="progress-stack">
                <ui-progress [value]="75" variant="primary" />
                <ui-progress [value]="60" variant="success" />
                <ui-progress [value]="45" variant="warning" />
                <ui-progress [value]="30" variant="danger" />
              </div>
            </div>
            <div>
              <p class="progress-label">Striped & Animated</p>
              <ui-progress [value]="progressValue()" [striped]="true" [animated]="true" />
            </div>
            <div>
              <p class="progress-label">Indeterminate</p>
              <ui-progress [indeterminate]="true" />
            </div>
          </div>
          <div class="button-row" style="margin-top: 1rem;">
            <ui-button size="sm" (clicked)="decreaseProgress()">- 10%</ui-button>
            <ui-button size="sm" (clicked)="increaseProgress()">+ 10%</ui-button>
          </div>
        </section>

        <section class="section">
          <h2>Circular Progress</h2>
          <div class="button-row" style="align-items: center; gap: 1.5rem;">
            <ui-circular-progress [value]="progressValue()" size="sm" />
            <ui-circular-progress [value]="progressValue()" size="md" [showLabel]="true" />
            <ui-circular-progress [value]="progressValue()" size="lg" [showLabel]="true" />
            <ui-circular-progress [value]="progressValue()" size="xl" [showLabel]="true" [strokeWidth]="6" />
          </div>
          <div class="button-row" style="align-items: center; gap: 1.5rem; margin-top: 1rem;">
            <ui-circular-progress [value]="75" variant="primary" [showLabel]="true" />
            <ui-circular-progress [value]="60" variant="success" [showLabel]="true" />
            <ui-circular-progress [value]="45" variant="warning" [showLabel]="true" />
            <ui-circular-progress [value]="30" variant="danger" [showLabel]="true" />
            <ui-circular-progress [indeterminate]="true" />
          </div>
        </section>

        <section class="section">
          <h2>Alert</h2>
          <div class="alert-stack">
            <ui-alert variant="info" title="Information">
              This is an informational alert message.
            </ui-alert>
            <ui-alert variant="success" title="Success!">
              Your changes have been saved successfully.
            </ui-alert>
            <ui-alert variant="warning">
              Please review your input before continuing.
            </ui-alert>
            <ui-alert variant="danger" title="Error" [dismissible]="true">
              Something went wrong. Please try again later.
            </ui-alert>
            <ui-alert variant="info" [showIcon]="false">
              This alert has no icon.
            </ui-alert>
          </div>
        </section>

        <section class="section">
          <h2>Tooltip</h2>
          <div class="button-row">
            <ui-button uiTooltip="This is a tooltip on top" tooltipPosition="top">Hover me (top)</ui-button>
            <ui-button uiTooltip="Tooltip on the bottom" tooltipPosition="bottom" variant="outline">Bottom</ui-button>
            <ui-button uiTooltip="Left side tooltip" tooltipPosition="left" color="secondary">Left</ui-button>
            <ui-button uiTooltip="Right side tooltip" tooltipPosition="right" variant="ghost">Right</ui-button>
          </div>
          <div class="button-row" style="margin-top: 1rem;">
            <ui-badge uiTooltip="Badges can have tooltips too!" variant="primary">Hover this badge</ui-badge>
          </div>
        </section>

        <section class="section">
          <h2>Card</h2>
          <div class="card-grid">
            <ui-card>
              <div card-header><strong>Default Card</strong></div>
              This is a simple card with header and content.
              <div card-footer>Card footer</div>
            </ui-card>
            <ui-card variant="outlined">
              <div card-header><strong>Outlined Card</strong></div>
              This card has an outlined style with transparent background.
            </ui-card>
            <ui-card variant="elevated">
              <div card-header><strong>Elevated Card</strong></div>
              This card has a shadow and no border.
            </ui-card>
            <ui-card [clickable]="true" (clicked)="onCardClick()">
              <div card-header><strong>Clickable Card</strong></div>
              Click me! I have hover and click effects.
            </ui-card>
          </div>
        </section>

        <section class="section">
          <h2>Inputs</h2>
          <div class="input-grid">
            <ui-input
              label="Username"
              placeholder="Enter username"
              [(value)]="username"
            />
            <ui-input
              type="email"
              label="Email"
              placeholder="Enter email"
              hint="We'll never share your email"
            />
            <ui-input
              type="password"
              label="Password"
              placeholder="Enter password"
              [required]="true"
            />
            <ui-input
              label="With Error"
              error="This field is required"
              [(value)]="errorValue"
            />
            <ui-input
              label="Disabled"
              [disabled]="true"
              [(value)]="disabledValue"
            />
            <ui-input
              label="Readonly"
              [readonly]="true"
              [(value)]="readonlyValue"
            />
          </div>
          <p>Bound username: {{ username() }}</p>
        </section>

        <section class="section">
          <h2>Input Validation</h2>
          <p class="section-description">
            Built-in validators and custom validation functions with automatic error display.
          </p>
          <div class="input-grid">
            <ui-input
              #emailInput
              label="Email (required + email)"
              placeholder="Enter email"
              [(value)]="validatedEmail"
              [validators]="emailValidators"
            />
            <ui-input
              label="Username (min 3, max 20 chars)"
              placeholder="Choose a username"
              [(value)]="validatedUsername"
              [validators]="usernameValidators"
            />
            <ui-input
              type="number"
              label="Age (18-120)"
              placeholder="Enter age"
              [(value)]="validatedAge"
              [validators]="ageValidators"
            />
            <ui-input
              label="Custom Validator (no spaces)"
              placeholder="Enter value without spaces"
              [(value)]="validatedCustom"
              [validatorFn]="noSpacesValidator"
            />
            <ui-input
              type="url"
              label="Website URL"
              placeholder="https://example.com"
              [(value)]="validatedUrl"
              [validators]="urlValidators"
            />
            <ui-input
              label="Show Errors Always"
              placeholder="Errors shown immediately"
              [(value)]="validatedAlways"
              [validators]="alwaysValidators"
              showErrorsOn="always"
            />
          </div>
          <div class="validation-status">
            <p>Email valid: {{ emailInput?.isValid() }}, touched: {{ emailInput?.touched() }}, dirty: {{ emailInput?.dirty() }}</p>
          </div>
        </section>

        <section class="section">
          <h2>Textarea</h2>
          <div class="input-grid">
            <ui-textarea
              label="Description"
              placeholder="Enter a description..."
              [(value)]="textareaValue"
            />
            <ui-textarea
              label="With Character Limit"
              placeholder="Max 100 characters..."
              [maxlength]="100"
              [(value)]="limitedTextarea"
            />
            <ui-textarea
              label="With Error"
              error="This field is required"
              [(value)]="errorTextarea"
            />
            <ui-textarea
              label="No Resize"
              resize="none"
              hint="This textarea cannot be resized"
            />
          </div>
          <p>Textarea value length: {{ textareaValue().length }}</p>
        </section>

        <section class="section">
          <h2>Template Input</h2>
          <p class="section-description">
            Single-line input with highlighted {{'{{variable}}'}} tokens and hover tooltips.
          </p>
          <div class="input-grid">
            <ui-template-input
              label="API Endpoint (3 states)"
              [placeholder]="'/api/\u007B\u007Bresource\u007D\u007D/\u007B\u007Bid\u007D\u007D'"
              [(value)]="templateEndpoint"
              [(variables)]="endpointVariables"
              [hint]="'Green = resolved, Amber = unset, Red = unknown'"
            />
            <ui-template-input
              label="Email Template"
              [placeholder]="'Type a template with \u007B\u007Bvariables\u007D\u007D...'"
              [(value)]="templateValue"
              [(variables)]="templateVariables"
            />
            <ui-template-input
              label="With Error"
              error="Template contains unknown variables"
              [(value)]="templateError"
              [(variables)]="templateErrorVars"
            />
            <ui-template-input
              label="Disabled"
              [disabled]="true"
              [(value)]="templateDisabled"
              [(variables)]="templateDisabledVars"
            />
          </div>

          <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Interactive Popover (Postman-style)</h3>
          <div class="input-grid">
            <ui-template-input
              label="Editable Variables"
              [(value)]="templatePopover"
              [(variables)]="popoverVariables"
            >
              <ng-template uiVariablePopover let-key let-val="value" let-state="state" let-close="close">
                <div class="var-popover">
                  <div class="var-popover__header">
                    <span class="var-popover__name">{{ key }}</span>
                    @if (state !== 'unknown') {
                      <span class="var-popover__state" [class]="'var-popover__state--' + state">{{ state }}</span>
                    } @else {
                      <span class="var-popover__state var-popover__state--unknown">undefined</span>
                    }
                  </div>
                  <div class="var-popover__body">
                    <input
                      class="var-popover__input"
                      [value]="getPopoverVarValue(key)"
                      (input)="setPopoverVarEdit(key, $any($event.target).value)"
                      placeholder="Override value..."
                    />
                    <button class="var-popover__save" (click)="savePopoverVar(key); close()">Save</button>
                  </div>
                </div>
              </ng-template>
            </ui-template-input>
          </div>
          @if (hasPopoverValues()) {
            <p class="result-text">Variables: {{ formatPopoverVars() }}</p>
          }
          <p>Template value: {{ templateValue() }}</p>
        </section>

        <section class="section">
          <h2>Select</h2>
          <div class="input-grid">
            <ui-select [(value)]="selectedCity" placeholder="Select a city" label="City">
              @for (city of cities; track city.id) {
                <ui-option [value]="city">{{ city.name }}</ui-option>
              }
            </ui-select>
            <ui-select [(value)]="selectedCities" placeholder="Select cities" label="Multiple Cities" [multiple]="true">
              @for (city of cities; track city.id) {
                <ui-option [value]="city">{{ city.name }}</ui-option>
              }
            </ui-select>
            <ui-select [(value)]="searchableCity" placeholder="Search cities..." label="Searchable" [searchable]="true" [clearable]="true">
              @for (city of cities; track city.id) {
                <ui-option [value]="city">{{ city.name }}</ui-option>
              }
            </ui-select>
            <ui-select
              [(value)]="creatableCity"
              placeholder="Type to search or create..."
              label="Creatable"
              [searchable]="true"
              [creatable]="true"
              [clearable]="true"
              (created)="onCityCreated($event)">
              @for (city of creatableCities(); track city.id) {
                <ui-option [value]="city">{{ city.name }}</ui-option>
              }
            </ui-select>
            <ui-select
              placeholder="add new"
              label="Creatable + Deletable (Array Creator)"
              [searchable]="true"
              [creatable]="true"
              [deletable]="true"
              [selectable]="false"
              (created)="onTagCreated($event)"
              (deleted)="onTagDeleted($event)">
              @for (tag of tags(); track tag) {
                <ui-option [value]="tag">{{ tag }}</ui-option>
              }
            </ui-select>
          </div>
          <p>Selected city: {{ selectedCity()?.name || 'None' }}</p>
          <p>Creatable city: {{ creatableCity()?.name || 'None' }}</p>
          <p>Tags: {{ tags().join(', ') || 'None' }}</p>
        </section>

        <section class="section">
          <h2>Chip Input</h2>
          <div class="input-grid">
            <ui-chip-input
              label="Tags"
              placeholder="Add a tag..."
              [(value)]="chipTags"
              hint="Press Enter to add"
            />
            <ui-chip-input
              label="Skills (filled)"
              placeholder="Add skill..."
              variant="filled"
              [(value)]="chipSkills"
            />
            <ui-chip-input
              label="With Error"
              error="At least one item required"
              [(value)]="chipError"
            />
            <ui-chip-input
              label="Disabled"
              [value]="['Fixed', 'Values']"
              [disabled]="true"
            />
          </div>
          <p>Tags: {{ chipTags().join(', ') || 'None' }}</p>
          <p>Skills: {{ chipSkills().join(', ') || 'None' }}</p>

          <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Custom Template (Include/Exclude Filters)</h3>
          <div class="input-grid">
            <ui-chip-input
              label="Search Filters"
              placeholder="Add filter..."
              [(value)]="searchFilters"
              [autoAdd]="false"
              (added)="onFilterAdded($event)"
            >
              <ng-template uiChipTemplate let-filter let-remove="remove">
                <span
                  class="filter-chip"
                  [class.filter-chip--included]="filter.included"
                  [class.filter-chip--excluded]="!filter.included"
                  (click)="toggleFilterInclude(filter); $event.stopPropagation()"
                >
                  <span class="filter-chip__icon">{{ filter.included ? '+' : '−' }}</span>
                  <span class="filter-chip__label">{{ filter.label }}</span>
                  <button
                    type="button"
                    class="filter-chip__remove"
                    (click)="remove(); $event.stopPropagation()"
                  >×</button>
                </span>
              </ng-template>
            </ui-chip-input>
          </div>
          <p>Filters: {{ formatFilters() }}</p>
        </section>

        <section class="section">
          <h2>Dropdown Menu</h2>
          <div class="button-row">
            <ui-dropdown>
              <ui-button uiDropdownTrigger variant="outline">Actions</ui-button>
              <ui-dropdown-item (clicked)="handleAction('edit')">Edit</ui-dropdown-item>
              <ui-dropdown-item (clicked)="handleAction('duplicate')">Duplicate</ui-dropdown-item>
              <ui-dropdown-divider />
              <ui-dropdown-item (clicked)="handleAction('delete')">Delete</ui-dropdown-item>
            </ui-dropdown>

            <ui-dropdown position="bottom-end">
              <ui-button uiDropdownTrigger>More Options</ui-button>
              <ui-dropdown-item (clicked)="handleAction('share')">Share</ui-dropdown-item>
              <ui-dropdown-item (clicked)="handleAction('export')">Export</ui-dropdown-item>
              <ui-dropdown-item [disabled]="true">Archive (disabled)</ui-dropdown-item>
            </ui-dropdown>
          </div>

          <h3 style="margin-top: 1.5rem; margin-bottom: 0.75rem;">Context Menu</h3>
          <div class="context-menu-demo" [uiContextMenu]="contextMenu">
            <p>Right-click anywhere in this box to open context menu</p>
          </div>
          <ui-dropdown #contextMenu>
            <ui-dropdown-item (clicked)="handleAction('cut')">Cut</ui-dropdown-item>
            <ui-dropdown-item (clicked)="handleAction('copy')">Copy</ui-dropdown-item>
            <ui-dropdown-item (clicked)="handleAction('paste')">Paste</ui-dropdown-item>
            <ui-dropdown-divider />
            <ui-dropdown-item (clicked)="handleAction('select-all')">Select All</ui-dropdown-item>
          </ui-dropdown>

          @if (lastAction()) {
            <p class="result-text">Last action: <strong>{{ lastAction() }}</strong></p>
          }
        </section>

        <section class="section">
          <h2>Checkbox</h2>
          <div class="checkbox-grid">
            <ui-checkbox [(checked)]="checkbox1">Default checkbox</ui-checkbox>
            <ui-checkbox [(checked)]="checkbox2" size="sm">Small checkbox</ui-checkbox>
            <ui-checkbox [(checked)]="checkbox3" size="lg">Large checkbox</ui-checkbox>
            <ui-checkbox [checked]="true" [disabled]="true">Disabled checked</ui-checkbox>
            <ui-checkbox [indeterminate]="true">Indeterminate</ui-checkbox>
          </div>
          <p>Checkbox 1: {{ checkbox1() }}, Checkbox 2: {{ checkbox2() }}, Checkbox 3: {{ checkbox3() }}</p>
        </section>

        <section class="section">
          <h2>Switch</h2>
          <div class="checkbox-grid">
            <ui-switch [(checked)]="switch1">Enable notifications</ui-switch>
            <ui-switch [(checked)]="switch2" size="sm">Small switch</ui-switch>
            <ui-switch [(checked)]="switch3" size="lg">Large switch</ui-switch>
            <ui-switch [checked]="true" [disabled]="true">Disabled on</ui-switch>
            <ui-switch [checked]="false" [disabled]="true">Disabled off</ui-switch>
          </div>
          <p>Switch 1: {{ switch1() }}, Switch 2: {{ switch2() }}, Switch 3: {{ switch3() }}</p>
        </section>

        <section class="section">
          <h2>Radio</h2>
          <div class="radio-demo-grid">
            <div>
              <h3>Vertical (default)</h3>
              <ui-radio-group [(value)]="selectedColor" size="md">
                <ui-radio value="red">Red</ui-radio>
                <ui-radio value="green">Green</ui-radio>
                <ui-radio value="blue">Blue</ui-radio>
              </ui-radio-group>
            </div>
            <div>
              <h3>Horizontal</h3>
              <ui-radio-group [(value)]="selectedSize" orientation="horizontal">
                <ui-radio value="sm">Small</ui-radio>
                <ui-radio value="md">Medium</ui-radio>
                <ui-radio value="lg">Large</ui-radio>
              </ui-radio-group>
            </div>
            <div>
              <h3>Sizes</h3>
              <div class="radio-sizes">
                <ui-radio-group [(value)]="radioSize1" size="sm" orientation="horizontal">
                  <ui-radio value="a">Small A</ui-radio>
                  <ui-radio value="b">Small B</ui-radio>
                </ui-radio-group>
                <ui-radio-group [(value)]="radioSize2" size="lg" orientation="horizontal">
                  <ui-radio value="a">Large A</ui-radio>
                  <ui-radio value="b">Large B</ui-radio>
                </ui-radio-group>
              </div>
            </div>
            <div>
              <h3>Disabled</h3>
              <ui-radio-group [value]="'option1'" [disabled]="true">
                <ui-radio value="option1">Option 1 (selected)</ui-radio>
                <ui-radio value="option2">Option 2</ui-radio>
              </ui-radio-group>
            </div>
          </div>
          <p>Selected color: {{ selectedColor() || 'None' }}, Selected size: {{ selectedSize() || 'None' }}</p>

          <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Segmented Control</h3>
          <div class="radio-demo-grid">
            <div>
              <h3>Default</h3>
              <ui-radio-group [(value)]="segmentedView" variant="segmented">
                <ui-radio value="list">List</ui-radio>
                <ui-radio value="grid">Grid</ui-radio>
                <ui-radio value="table">Table</ui-radio>
              </ui-radio-group>
            </div>
            <div>
              <h3>Small</h3>
              <ui-radio-group [(value)]="segmentedPeriod" variant="segmented" size="sm">
                <ui-radio value="day">Day</ui-radio>
                <ui-radio value="week">Week</ui-radio>
                <ui-radio value="month">Month</ui-radio>
                <ui-radio value="year">Year</ui-radio>
              </ui-radio-group>
            </div>
            <div>
              <h3>Large</h3>
              <ui-radio-group [(value)]="segmentedMode" variant="segmented" size="lg">
                <ui-radio value="light">Light</ui-radio>
                <ui-radio value="dark">Dark</ui-radio>
                <ui-radio value="system">System</ui-radio>
              </ui-radio-group>
            </div>
            <div>
              <h3>Disabled</h3>
              <ui-radio-group [value]="'on'" variant="segmented" [disabled]="true">
                <ui-radio value="on">On</ui-radio>
                <ui-radio value="off">Off</ui-radio>
              </ui-radio-group>
            </div>
          </div>
          <p>View: {{ segmentedView() || 'None' }}, Period: {{ segmentedPeriod() || 'None' }}, Mode: {{ segmentedMode() || 'None' }}</p>
        </section>

        <section class="section">
          <h2>File Chooser</h2>
          <div class="file-chooser-grid">
            <div>
              <h3>Default</h3>
              <ui-file-chooser
                [(value)]="files"
                accept="image/*,.pdf"
                [multiple]="true"
                [maxFileSize]="5242880"
                [maxFiles]="5"
                acceptHint="Images or PDF up to 5MB (max 5 files)"
                (filesRejected)="onFilesRejected($event)"
              />
            </div>
            <div>
              <h3>Compact Variant</h3>
              <ui-file-chooser
                [(value)]="singleFile"
                variant="compact"
                accept="image/*"
                dropzoneText="Drop image here"
                browseText="or browse"
              />
            </div>
            <div>
              <h3>Minimal Variant</h3>
              <ui-file-chooser
                variant="minimal"
                browseText="Upload document"
                accept=".pdf,.doc,.docx"
                [showFileList]="false"
                (valueChange)="onMinimalFileChange($event)"
              />
            </div>
          </div>
          <p>Selected files: {{ files().length }}</p>
          @if (rejectedFiles().length > 0) {
            <p class="error-text">Rejected: {{ rejectedFiles().join(', ') }}</p>
          }
        </section>

        <section class="section">
          <h2>Tabs</h2>
          <div class="tabs-demo-grid">
            <div>
              <h3>Default</h3>
              <ui-tabs [(activeTab)]="activeTab1">
                <ui-tab label="Account">
                  <p>Manage your account settings and preferences.</p>
                </ui-tab>
                <ui-tab label="Security">
                  <p>Update your password and security options.</p>
                </ui-tab>
                <ui-tab label="Notifications">
                  <p>Configure your notification preferences.</p>
                </ui-tab>
              </ui-tabs>
            </div>
            <div>
              <h3>Pills</h3>
              <ui-tabs [(activeTab)]="activeTab2" variant="pills">
                <ui-tab label="Overview">
                  <p>Overview content panel.</p>
                </ui-tab>
                <ui-tab label="Analytics">
                  <p>Analytics and charts here.</p>
                </ui-tab>
                <ui-tab label="Reports" [disabled]="true">
                  <p>Reports content (disabled).</p>
                </ui-tab>
                <ui-tab label="Settings">
                  <p>Settings options.</p>
                </ui-tab>
              </ui-tabs>
            </div>
            <div>
              <h3>Underline (animated)</h3>
              <ui-tabs [(activeTab)]="activeTab3" variant="underline">
                <ui-tab label="Profile">
                  <p>Edit your profile information.</p>
                </ui-tab>
                <ui-tab label="Billing">
                  <p>Manage billing and invoices.</p>
                </ui-tab>
                <ui-tab label="Team">
                  <p>Manage team members.</p>
                </ui-tab>
              </ui-tabs>
            </div>
            <div>
              <h3>Attribute directive</h3>
              <ui-tabs [(activeTab)]="activeTab4" variant="pills">
                <div ui-tab label="Users">
                  <p>User management panel using attribute directive.</p>
                </div>
                <div ui-tab label="Roles">
                  <p>Role configuration using attribute directive.</p>
                </div>
                <div ui-tab label="Permissions" [disabled]="true">
                  <p>Permissions panel (disabled).</p>
                </div>
              </ui-tabs>
            </div>
            <div>
              <h3>Sizes</h3>
              <div class="tabs-sizes">
                <ui-tabs variant="pills" size="sm">
                  <ui-tab label="Small A"><p>Small tab A</p></ui-tab>
                  <ui-tab label="Small B"><p>Small tab B</p></ui-tab>
                </ui-tabs>
                <ui-tabs variant="pills" size="lg">
                  <ui-tab label="Large A"><p>Large tab A</p></ui-tab>
                  <ui-tab label="Large B"><p>Large tab B</p></ui-tab>
                </ui-tabs>
              </div>
            </div>
          </div>
          <p>Active tabs: {{ activeTab1() }}, {{ activeTab2() }}, {{ activeTab3() }}, {{ activeTab4() }}</p>
        </section>

        <section class="section">
          <h2>Dynamic Tabs</h2>
          <p class="section-description">
            Create and close tabs programmatically using TabsService, similar to how dialogs work.
          </p>
          <div class="button-row">
            <ui-button (clicked)="addDynamicTab()">Add Tab</ui-button>
            <ui-button variant="outline" (clicked)="addMultipleTabs()">Add 3 Tabs</ui-button>
            <ui-button variant="ghost" color="danger" (clicked)="closeAllTabs()">Close All</ui-button>
          </div>
          <div class="dynamic-tabs-container">
            <ui-dynamic-tabs variant="default" />
          </div>
          @if (lastTabResult()) {
            <p class="result-text">Last closed tab result: <strong>{{ lastTabResult() }}</strong></p>
          }
        </section>

        <section class="section">
          <h2>Accordion</h2>
          <div class="accordion-demo-grid">
            <div>
              <h3>Default (auto-collapse)</h3>
              <ui-accordion>
                <ui-accordion-item header="What is Angular?">
                  <p>Angular is a platform and framework for building single-page client applications using HTML and TypeScript.</p>
                </ui-accordion-item>
                <ui-accordion-item header="What are signals?">
                  <p>Signals are a reactive primitive that provide fine-grained reactivity tracking for Angular applications.</p>
                </ui-accordion-item>
                <ui-accordion-item header="What is standalone?" [expanded]="true">
                  <p>Standalone components don't need to be declared in an NgModule and can directly manage their own dependencies.</p>
                </ui-accordion-item>
                <ui-accordion-item header="Disabled item" [disabled]="true">
                  <p>This item cannot be toggled.</p>
                </ui-accordion-item>
              </ui-accordion>
            </div>
            <div>
              <h3>Multi-open</h3>
              <ui-accordion [multi]="true">
                <ui-accordion-item header="Section A" [expanded]="true">
                  <p>Multiple sections can be open at the same time when multi mode is enabled.</p>
                </ui-accordion-item>
                <ui-accordion-item header="Section B" [expanded]="true">
                  <p>This section is also expanded by default.</p>
                </ui-accordion-item>
                <ui-accordion-item header="Section C">
                  <p>Click to expand this section without closing others.</p>
                </ui-accordion-item>
              </ui-accordion>
            </div>
            <div>
              <h3>Custom header template</h3>
              <ui-accordion>
                <ui-accordion-item>
                  <ng-template uiAccordionHeader>
                    <strong style="color: var(--ui-primary);">Custom</strong>&nbsp;<em>styled header</em>
                  </ng-template>
                  <p>This item uses a custom header template via the uiAccordionHeader directive.</p>
                </ui-accordion-item>
                <ui-accordion-item header="Regular header">
                  <p>This item uses a plain string header.</p>
                </ui-accordion-item>
              </ui-accordion>
            </div>
            <div>
              <h3>Separated variant</h3>
              <ui-accordion variant="separated">
                <ui-accordion-item header="Item 1">
                  <p>Each item is visually separated with its own border and rounded corners.</p>
                </ui-accordion-item>
                <ui-accordion-item header="Item 2">
                  <p>There is a gap between each accordion item.</p>
                </ui-accordion-item>
                <ui-accordion-item header="Item 3">
                  <p>This variant works well for loosely related content.</p>
                </ui-accordion-item>
              </ui-accordion>
            </div>
            <div>
              <h3>Bordered variant</h3>
              <ui-accordion variant="bordered">
                <ui-accordion-item header="Step 1">
                  <p>The bordered variant adds a subtle background to headers and wraps content in a card-like container.</p>
                </ui-accordion-item>
                <ui-accordion-item header="Step 2">
                  <p>Content areas get their own background for visual distinction.</p>
                </ui-accordion-item>
              </ui-accordion>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Pagination</h2>
          <div class="pagination-demo">
            <div>
              <h3>Default</h3>
              <ui-pagination
                [(page)]="currentPage"
                [total]="100"
                [pageSize]="10"
              />
            </div>
            <div>
              <h3>Many Pages</h3>
              <ui-pagination
                [(page)]="currentPage2"
                [total]="500"
                [pageSize]="10"
                [maxPages]="7"
              />
            </div>
            <div>
              <h3>Sizes</h3>
              <div class="pagination-sizes">
                <ui-pagination [total]="50" [pageSize]="10" size="sm" />
                <ui-pagination [total]="50" [pageSize]="10" size="md" />
                <ui-pagination [total]="50" [pageSize]="10" size="lg" />
              </div>
            </div>
            <div>
              <h3>Without First/Last</h3>
              <ui-pagination
                [total]="100"
                [pageSize]="10"
                [showFirstLast]="false"
              />
            </div>
          </div>
          <p>Current page: {{ currentPage() }}, Page 2: {{ currentPage2() }}</p>
        </section>

        <section class="section">
          <h2>Slider</h2>
          <div class="slider-grid">
            <div>
              <h3>Default</h3>
              <ui-slider [(value)]="sliderValue" />
              <p class="slider-value-text">Value: {{ sliderValue() }}</p>
            </div>
            <div>
              <h3>Sizes</h3>
              <div class="slider-stack">
                <ui-slider size="sm" [(value)]="sliderSm" />
                <ui-slider size="md" [(value)]="sliderMd" />
                <ui-slider size="lg" [(value)]="sliderLg" />
              </div>
            </div>
            <div>
              <h3>With Label &amp; Value</h3>
              <ui-slider label="Volume" [showValue]="true" [(value)]="sliderLabeled" />
            </div>
            <div>
              <h3>Custom Range (0–1000, step 50)</h3>
              <ui-slider
                [min]="0"
                [max]="1000"
                [step]="50"
                [showValue]="true"
                label="Amount"
                [(value)]="sliderCustom"
              />
            </div>
            <div>
              <h3>Disabled</h3>
              <ui-slider [disabled]="true" [value]="40" label="Locked" [showValue]="true" />
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Datepicker</h2>
          <div class="input-grid">
            <ui-datepicker
              label="Date"
              placeholder="Pick a date"
              [(value)]="selectedDate"
              [clearable]="true"
            />
            <ui-datepicker
              label="Date Range"
              placeholder="Select range"
              [(value)]="selectedDateRange"
              [range]="true"
              [clearable]="true"
            />
            <ui-datepicker
              label="Custom Format (dd/MM/yyyy)"
              format="dd/MM/yyyy"
              [(value)]="formattedDate"
              [clearable]="true"
            />
            <ui-datepicker
              label="Min/Max Constrained"
              hint="Only dates in the current month"
              [(value)]="minMaxDate"
              [minDate]="dateConstraintMin"
              [maxDate]="dateConstraintMax"
            />
            <ui-datepicker
              label="Disabled"
              placeholder="Cannot select"
              [disabled]="true"
            />
            <ui-datepicker
              label="With Error"
              error="Date is required"
              [required]="true"
            />
          </div>
          <p>Selected date: {{ selectedDate() ? selectedDate()!.toLocaleDateString() : 'None' }}</p>
          <p>Date range: {{ formatDateRange() }}</p>
        </section>

        <section class="section">
          <h2>Timepicker</h2>
          <div class="input-grid">
            <ui-timepicker
              label="Time"
              placeholder="Pick a time"
              [(value)]="selectedTime"
              [clearable]="true"
            />
            <ui-timepicker
              label="12-Hour Format"
              placeholder="Select time"
              [(value)]="selectedTime12h"
              format="12h"
              [clearable]="true"
            />
            <ui-timepicker
              label="With Seconds"
              placeholder="HH:MM:SS"
              [(value)]="selectedTimeWithSeconds"
              [showSeconds]="true"
              [clearable]="true"
            />
            <ui-timepicker
              label="15-Minute Intervals"
              hint="Minutes in 15-minute steps"
              [(value)]="selectedTimeStep"
              [minuteStep]="15"
              [clearable]="true"
            />
            <ui-timepicker
              label="Disabled"
              placeholder="Cannot select"
              [disabled]="true"
            />
            <ui-timepicker
              label="With Error"
              error="Time is required"
              [required]="true"
            />
          </div>
          <p>Selected time: {{ formatTime(selectedTime()) }}</p>
        </section>

        <section class="section">
          <h2>Datetime Picker</h2>
          <div class="input-grid">
            <ui-datetimepicker
              label="Date & Time"
              placeholder="Pick date and time"
              [(value)]="selectedDatetime"
              [clearable]="true"
            />
            <ui-datetimepicker
              label="12-Hour Format"
              placeholder="Select datetime"
              [(value)]="selectedDatetime12h"
              timeFormat="12h"
              [clearable]="true"
            />
            <ui-datetimepicker
              label="With Seconds"
              placeholder="Full precision"
              [(value)]="selectedDatetimeSeconds"
              [showSeconds]="true"
              [clearable]="true"
            />
            <ui-datetimepicker
              label="Custom Date Format"
              dateFormat="dd/MM/yyyy"
              [(value)]="selectedDatetimeCustom"
              [clearable]="true"
            />
            <ui-datetimepicker
              label="Disabled"
              placeholder="Cannot select"
              [disabled]="true"
            />
            <ui-datetimepicker
              label="With Error"
              error="Datetime is required"
              [required]="true"
            />
          </div>
          <p>Selected datetime: {{ selectedDatetime() ? selectedDatetime()!.toLocaleString() : 'None' }}</p>
        </section>

        <section class="section">
          <h2>Table</h2>
          <ui-table [data]="users()" [columns]="columns" />
        </section>

        <section class="section">
          <h2>Tree View</h2>
          <p class="section-description">
            Display hierarchical data with expand/collapse functionality.
          </p>
          <div class="tree-demo-grid">
            <div>
              <h3>API Collection (Bruno/Postman style) — Draggable</h3>
              <div class="tree-container">
                <ui-tree
                  [nodes]="apiTreeNodes"
                  [draggable]="true"
                  (nodeClick)="onTreeNodeClick($event)"
                  (nodeExpand)="onTreeNodeExpand($event)"
                  (nodeCollapse)="onTreeNodeCollapse($event)"
                  (nodeDrop)="onTreeNodeDrop($event)"
                />
              </div>
            </div>
            <div>
              <h3>File Explorer</h3>
              <div class="tree-container">
                <ui-tree
                  [nodes]="fileTreeNodes"
                  [indent]="20"
                  (nodeClick)="onTreeNodeClick($event)"
                />
              </div>
            </div>
          </div>
          @if (lastTreeAction()) {
            <p class="result-text">{{ lastTreeAction() }}</p>
          }
        </section>

        <section class="section">
          <h2>Split Panes</h2>
          <div class="split-demo-grid">
            <div>
              <h3>Horizontal (default)</h3>
              <div class="split-container">
                <ui-split>
                  <ui-split-pane [size]="30" [minSize]="15">
                    <div class="pane-content">Left (30%)</div>
                  </ui-split-pane>
                  <ui-split-pane [size]="70">
                    <div class="pane-content">Right (70%)</div>
                  </ui-split-pane>
                </ui-split>
              </div>
            </div>
            <div>
              <h3>Vertical</h3>
              <div class="split-container">
                <ui-split orientation="vertical">
                  <ui-split-pane [size]="40" [minSize]="20">
                    <div class="pane-content">Top (40%)</div>
                  </ui-split-pane>
                  <ui-split-pane [size]="60">
                    <div class="pane-content">Bottom (60%)</div>
                  </ui-split-pane>
                </ui-split>
              </div>
            </div>
            <div>
              <h3>Three Panes</h3>
              <div class="split-container">
                <ui-split>
                  <ui-split-pane [size]="25" [minSize]="15">
                    <div class="pane-content">Left</div>
                  </ui-split-pane>
                  <ui-split-pane [size]="50" [minSize]="20">
                    <div class="pane-content">Center</div>
                  </ui-split-pane>
                  <ui-split-pane [size]="25" [minSize]="15">
                    <div class="pane-content">Right</div>
                  </ui-split-pane>
                </ui-split>
              </div>
            </div>
            <div>
              <h3>Gutter Sizes</h3>
              <div class="gutter-sizes">
                <div class="split-container-sm">
                  <ui-split gutterSize="sm">
                    <ui-split-pane [size]="50"><div class="pane-content">sm</div></ui-split-pane>
                    <ui-split-pane [size]="50"><div class="pane-content">sm</div></ui-split-pane>
                  </ui-split>
                </div>
                <div class="split-container-sm">
                  <ui-split gutterSize="md">
                    <ui-split-pane [size]="50"><div class="pane-content">md</div></ui-split-pane>
                    <ui-split-pane [size]="50"><div class="pane-content">md</div></ui-split-pane>
                  </ui-split>
                </div>
                <div class="split-container-sm">
                  <ui-split gutterSize="lg">
                    <ui-split-pane [size]="50"><div class="pane-content">lg</div></ui-split-pane>
                    <ui-split-pane [size]="50"><div class="pane-content">lg</div></ui-split-pane>
                  </ui-split>
                </div>
              </div>
            </div>
          </div>
          <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Nested (IDE-like layout)</h3>
          <div class="split-container-large">
            <ui-split>
              <ui-split-pane [size]="18" [minSize]="12" [maxSize]="30">
                <ui-split orientation="vertical">
                  <ui-split-pane [size]="50">
                    <div class="pane-content pane-sidebar">Explorer</div>
                  </ui-split-pane>
                  <ui-split-pane [size]="50">
                    <div class="pane-content pane-outline">Outline</div>
                  </ui-split-pane>
                </ui-split>
              </ui-split-pane>
              <ui-split-pane [size]="62">
                <ui-split orientation="vertical">
                  <ui-split-pane [size]="70" [minSize]="30">
                    <ui-split>
                      <ui-split-pane [size]="50">
                        <div class="pane-content pane-editor">Editor 1</div>
                      </ui-split-pane>
                      <ui-split-pane [size]="50">
                        <ui-split orientation="vertical">
                          <ui-split-pane [size]="50">
                            <div class="pane-content pane-editor">Editor 2</div>
                          </ui-split-pane>
                          <ui-split-pane [size]="50">
                            <div class="pane-content pane-editor">Editor 3</div>
                          </ui-split-pane>
                        </ui-split>
                      </ui-split-pane>
                    </ui-split>
                  </ui-split-pane>
                  <ui-split-pane [size]="30" [minSize]="15">
                    <div class="pane-content pane-terminal">Terminal</div>
                  </ui-split-pane>
                </ui-split>
              </ui-split-pane>
              <ui-split-pane [size]="20" [minSize]="10" [maxSize]="30">
                <div class="pane-content pane-sidebar">Properties</div>
              </ui-split-pane>
            </ui-split>
          </div>
        </section>

        <section class="section">
          <h2>Dialog</h2>
          <p class="section-description">
            Open modal dialogs programmatically with the DialogService.
          </p>
          <div class="button-row">
            <ui-button (clicked)="openConfirmDialog()">Open Confirm Dialog</ui-button>
            <ui-button variant="outline" (clicked)="openDeleteDialog()">Delete Item</ui-button>
          </div>
          @if (dialogResult() !== null) {
            <p class="result-text">
              Last dialog result: <strong>{{ dialogResult() ? 'Confirmed' : 'Cancelled' }}</strong>
            </p>
          }
        </section>

        <section class="section">
          <h2>Toast</h2>
          <p class="section-description">
            Show toast notifications with the ToastService.
          </p>
          <div class="button-row">
            <ui-button color="success" (clicked)="showSuccessToast()">Success</ui-button>
            <ui-button variant="outline" color="danger" (clicked)="showErrorToast()">Error</ui-button>
            <ui-button variant="outline" color="warning" (clicked)="showWarningToast()">Warning</ui-button>
            <ui-button variant="outline" (clicked)="showInfoToast()">Info</ui-button>
          </div>
          <div class="button-row">
            <ui-button variant="ghost" color="secondary" size="sm" (clicked)="showToastPosition('top-left')">Top Left</ui-button>
            <ui-button variant="ghost" color="secondary" size="sm" (clicked)="showToastPosition('top-center')">Top Center</ui-button>
            <ui-button variant="ghost" color="secondary" size="sm" (clicked)="showToastPosition('top-right')">Top Right</ui-button>
          </div>
          <div class="button-row">
            <ui-button variant="ghost" color="secondary" size="sm" (clicked)="showToastPosition('bottom-left')">Bottom Left</ui-button>
            <ui-button variant="ghost" color="secondary" size="sm" (clicked)="showToastPosition('bottom-center')">Bottom Center</ui-button>
            <ui-button variant="ghost" color="secondary" size="sm" (clicked)="showToastPosition('bottom-right')">Bottom Right</ui-button>
          </div>
          <div class="button-row" style="margin-top: 0.5rem;">
            <ui-button color="secondary" size="sm" (clicked)="toastService.dismissAll()">Dismiss All</ui-button>
          </div>
        </section>
      </ui-content>

      <ui-footer>
        &copy; 2024 ngx-ui Demo
      </ui-footer>
    </ui-shell>
  `,
  styles: [`
    .section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--ui-bg);
      border-radius: var(--ui-radius-lg);
      border: 1px solid var(--ui-border);
    }

    h1 {
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    h2 {
      margin-bottom: 1rem;
      font-size: 1.125rem;
      font-weight: 500;
    }

    .button-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .input-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .checkbox-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-link {
      padding: 0.5rem 0.75rem;
      color: var(--ui-text);
      text-decoration: none;
      border-radius: var(--ui-radius-md);
      transition: background-color var(--ui-transition-fast);
    }

    .nav-link:hover {
      background-color: var(--ui-bg-secondary);
    }

    .navbar-title {
      font-weight: 600;
    }

    .section-description {
      margin-bottom: 1rem;
      color: var(--ui-text-muted);
    }

    .result-text {
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--ui-bg-secondary);
      border-radius: var(--ui-radius-md);
    }

    .file-chooser-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .file-chooser-grid h3 {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .error-text {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: color-mix(in srgb, var(--ui-danger) 10%, var(--ui-bg));
      border-radius: var(--ui-radius-md);
      color: var(--ui-danger);
      font-size: 0.875rem;
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .progress-label {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--ui-text-muted);
    }

    .progress-stack {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .alert-stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .radio-demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .radio-demo-grid h3 {
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .radio-sizes {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .accordion-demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .accordion-demo-grid h3 {
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .tabs-demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .tabs-demo-grid h3 {
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .tabs-sizes {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .dynamic-tabs-container {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-bg-secondary);
      min-height: 150px;
    }

    .pagination-demo {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .pagination-demo h3 {
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .pagination-sizes {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .slider-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .slider-grid h3 {
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .slider-stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .slider-value-text {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--ui-text-muted);
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--ui-radius-sm);
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color var(--ui-transition-fast);
      user-select: none;
    }

    .filter-chip--included {
      background: color-mix(in srgb, var(--ui-success) 20%, transparent);
      color: var(--ui-success);
    }

    .filter-chip--included:hover {
      background: color-mix(in srgb, var(--ui-success) 30%, transparent);
    }

    .filter-chip--excluded {
      background: color-mix(in srgb, var(--ui-danger) 20%, transparent);
      color: var(--ui-danger);
    }

    .filter-chip--excluded:hover {
      background: color-mix(in srgb, var(--ui-danger) 30%, transparent);
    }

    .filter-chip__icon {
      font-weight: 600;
      font-size: 1rem;
      line-height: 1;
    }

    .filter-chip__label {
      line-height: 1.4;
    }

    .filter-chip__remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-left: 0.125rem;
      padding: 0;
      border: none;
      border-radius: var(--ui-radius-sm);
      background: transparent;
      color: inherit;
      font-size: 1rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity var(--ui-transition-fast), background-color var(--ui-transition-fast);
    }

    .filter-chip__remove:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }

    .split-demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .split-demo-grid h3 {
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .split-container {
      height: 150px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      overflow: hidden;
    }

    .split-container-sm {
      height: 60px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      overflow: hidden;
    }

    .split-container-large {
      height: 300px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      overflow: hidden;
    }

    .gutter-sizes {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .pane-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0.5rem;
      background: var(--ui-bg-secondary);
      color: var(--ui-text-muted);
      font-size: 0.875rem;
    }

    .pane-sidebar {
      background: color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg));
    }

    .pane-editor {
      background: var(--ui-bg);
    }

    .pane-terminal {
      background: color-mix(in srgb, var(--ui-secondary) 10%, var(--ui-bg));
    }

    .pane-outline {
      background: color-mix(in srgb, var(--ui-success) 8%, var(--ui-bg));
    }

    .tree-demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .tree-demo-grid h3 {
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ui-text-muted);
    }

    .tree-container {
      padding: 0.5rem;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-bg-secondary);
      max-height: 300px;
      overflow: auto;
    }

    .context-menu-demo {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      border: 2px dashed var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-bg-secondary);
      color: var(--ui-text-muted);
      cursor: context-menu;
    }

    .context-menu-demo:hover {
      border-color: var(--ui-border-hover);
    }

    .validation-status {
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--ui-bg-secondary);
      border-radius: var(--ui-radius-md);
      font-size: 0.875rem;
      color: var(--ui-text-muted);
    }

    .var-popover {
      padding: 0.5rem;
      min-width: 200px;
    }

    .var-popover__header {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      margin-bottom: 0.5rem;
    }

    .var-popover__name {
      font-weight: 600;
      font-size: 0.8125rem;
      color: var(--ui-primary);
    }

    .var-popover__desc {
      font-size: 0.75rem;
      color: var(--ui-text-muted);
    }

    .var-popover__body {
      display: flex;
      gap: 0.375rem;
    }

    .var-popover__input {
      flex: 1;
      padding: 0.25rem 0.5rem;
      font-size: 0.8125rem;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-sm);
      background: var(--ui-bg);
      color: var(--ui-text);
      outline: none;
    }

    .var-popover__input:focus {
      border-color: var(--ui-border-focus);
    }

    .var-popover__save {
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ui-primary-text);
      background: var(--ui-primary);
      border: none;
      border-radius: var(--ui-radius-sm);
      cursor: pointer;
      transition: background var(--ui-transition-fast);
    }

    .var-popover__save:hover {
      background: var(--ui-primary-hover);
    }

    .var-popover__state {
      font-size: 0.6875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .var-popover__state--resolved {
      color: var(--ui-success);
    }

    .var-popover__state--unset {
      color: var(--ui-warning);
    }

    .var-popover__state--unknown {
      color: var(--ui-danger);
    }
  `],
})
export class App {
  protected readonly sidebarService = inject(SidebarService);
  protected readonly dialogService = inject(DialogService);
  protected readonly toastService = inject(ToastService);
  protected readonly tabsService = inject(TabsService);

  protected readonly headerVariant = signal(false);
  protected readonly shellVariant = computed<ShellVariant>(() => this.headerVariant() ? 'header' : 'default');

  protected readonly isLoading = signal(false);
  protected readonly dialogResult = signal<boolean | null>(null);
  protected readonly username = signal('');
  protected readonly errorValue = signal('');
  protected readonly disabledValue = signal('Cannot edit');
  protected readonly readonlyValue = signal('Read only content');

  // Validation demo
  protected readonly emailInput = viewChild<InputComponent>('emailInput');
  protected readonly validatedEmail = signal('');
  protected readonly validatedUsername = signal('');
  protected readonly validatedAge = signal<string | number>('');
  protected readonly validatedCustom = signal('');
  protected readonly validatedUrl = signal('');
  protected readonly validatedAlways = signal('');

  protected readonly emailValidators = [Validators.required, Validators.email];
  protected readonly usernameValidators = [Validators.required, Validators.minLength(3), Validators.maxLength(20)];
  protected readonly ageValidators = [Validators.required, Validators.min(18), Validators.max(120)];
  protected readonly urlValidators = [Validators.url];
  protected readonly alwaysValidators = [Validators.required, Validators.minLength(5)];

  protected readonly noSpacesValidator: ValidatorFn = (value) => {
    if (typeof value === 'string' && value.includes(' ')) {
      return { key: 'noSpaces', message: 'Spaces are not allowed' };
    }
    return null;
  };

  protected readonly users = signal<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
  ]);

  // Select demo data
  protected readonly cities = [
    { id: 1, name: 'New York' },
    { id: 2, name: 'Los Angeles' },
    { id: 3, name: 'Chicago' },
    { id: 4, name: 'Houston' },
    { id: 5, name: 'Phoenix' },
  ];
  protected readonly selectedCity = signal<{ id: number; name: string } | null>(null);
  protected readonly selectedCities = signal<{ id: number; name: string }[]>([]);
  protected readonly searchableCity = signal<{ id: number; name: string } | null>(null);
  protected readonly creatableCity = signal<{ id: number; name: string } | null>(null);
  protected readonly creatableCities = signal([
    { id: 1, name: 'New York' },
    { id: 2, name: 'Los Angeles' },
    { id: 3, name: 'Chicago' },
    { id: 4, name: 'Houston' },
    { id: 5, name: 'Phoenix' },
  ]);
  private nextCityId = 6;

  // Tags (creatable + deletable) demo
  protected readonly tags = signal<string[]>(['Angular', 'TypeScript', 'Signals']);

  // Chip input demo
  protected readonly chipTags = signal<string[]>(['Angular', 'TypeScript']);
  protected readonly chipSkills = signal<string[]>(['JavaScript', 'CSS']);
  protected readonly chipError = signal<string[]>([]);

  // Custom chip template demo (include/exclude filters)
  protected readonly searchFilters = signal<{ label: string; included: boolean }[]>([
    { label: 'CEO', included: true },
    { label: 'Manager', included: true },
    { label: 'Intern', included: false },
  ]);

  // Dropdown demo
  protected readonly lastAction = signal<string>('');

  // Checkbox demo
  protected readonly checkbox1 = signal(false);
  protected readonly checkbox2 = signal(true);
  protected readonly checkbox3 = signal(false);

  // Switch demo
  protected readonly switch1 = signal(true);
  protected readonly switch2 = signal(false);
  protected readonly switch3 = signal(true);

  // Radio demo
  protected readonly selectedColor = signal<string | null>(null);
  protected readonly selectedSize = signal<string | null>('md');
  protected readonly radioSize1 = signal<string | null>(null);
  protected readonly radioSize2 = signal<string | null>(null);

  // Segmented control demo
  protected readonly segmentedView = signal<string | null>('list');
  protected readonly segmentedPeriod = signal<string | null>('week');
  protected readonly segmentedMode = signal<string | null>('system');

  // Tabs demo
  protected readonly activeTab1 = signal<string | number>(0);
  protected readonly activeTab2 = signal<string | number>(0);
  protected readonly activeTab3 = signal<string | number>(0);
  protected readonly activeTab4 = signal<string | number>(0);

  // Dynamic tabs demo
  private dynamicTabCounter = 0;
  protected readonly lastTabResult = signal<string>('');

  // Pagination demo
  protected readonly currentPage = signal(1);
  protected readonly currentPage2 = signal(5);

  // File chooser demo
  protected readonly files = signal<File[]>([]);
  protected readonly singleFile = signal<File[]>([]);
  protected readonly rejectedFiles = signal<string[]>([]);

  // Template input demo
  // Template with all 3 states: resolved (resource), unset (id), unknown (version)
  protected readonly templateEndpoint = signal('/api/{{resource}}/{{id}}/{{version}}');
  protected readonly endpointVariables = signal<TemplateVariable[]>([
    { key: 'resource', value: 'users' },   // resolved (has value)
    { key: 'id', value: '' },               // unset (no value)
    // version is not listed → unknown
  ]);

  protected readonly templateValue = signal('Hello {{firstName}}, welcome to {{company}}!');
  protected readonly templateVariables = signal<TemplateVariable[]>([
    { key: 'firstName', value: 'John' },
    { key: 'company', value: 'Acme Corp' },
  ]);

  protected readonly templateError = signal('Dear {{name}}, your {{unknownVar}} is ready');
  protected readonly templateErrorVars = signal<TemplateVariable[]>([]);

  protected readonly templateDisabled = signal('Hello {{user}}, this is read-only');
  protected readonly templateDisabledVars = signal<TemplateVariable[]>([
    { key: 'user', value: '' },
  ]);

  // Popover demo — username is set, role is unset, unknownField is unknown
  protected readonly templatePopover = signal('Hello {{username}}, role={{role}}, flag={{unknownField}}');
  protected readonly popoverVariables = signal<TemplateVariable[]>([
    { key: 'username', value: 'admin' },
    { key: 'role', value: '' },
  ]);
  private popoverEdits = new Map<string, string>();

  protected readonly hasPopoverValues = computed(() =>
    this.popoverVariables().some(v => v.value),
  );

  protected getPopoverVarValue(key: string): string {
    return this.popoverEdits.get(key)
      ?? this.popoverVariables().find(v => v.key === key)?.value
      ?? '';
  }

  protected setPopoverVarEdit(key: string, value: string): void {
    this.popoverEdits.set(key, value);
  }

  protected savePopoverVar(key: string): void {
    const value = this.popoverEdits.get(key) ?? '';
    this.popoverVariables.update(vars => {
      const exists = vars.some(v => v.key === key);
      if (exists) {
        return vars.map(v => v.key === key ? { ...v, value } : v);
      }
      return [...vars, { key, value }];
    });
    this.popoverEdits.delete(key);
  }

  protected formatPopoverVars(): string {
    return this.popoverVariables()
      .filter(v => v.value)
      .map(v => `${v.key}="${v.value}"`)
      .join(', ');
  }

  // Textarea demo
  protected readonly textareaValue = signal('');
  protected readonly limitedTextarea = signal('');
  protected readonly errorTextarea = signal('');

  // Slider demo
  protected readonly sliderValue = signal(50);
  protected readonly sliderSm = signal(25);
  protected readonly sliderMd = signal(50);
  protected readonly sliderLg = signal(75);
  protected readonly sliderLabeled = signal(60);
  protected readonly sliderCustom = signal(500);

  // Datepicker demo
  protected readonly selectedDate = signal<Date | null>(null);
  protected readonly selectedDateRange = signal<DateRange | null>({ start: null, end: null });
  protected readonly formattedDate = signal<Date | null>(null);
  protected readonly minMaxDate = signal<Date | null>(null);
  protected readonly dateConstraintMin = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  protected readonly dateConstraintMax = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  // Timepicker demo
  protected readonly selectedTime = signal<TimeValue | null>(null);
  protected readonly selectedTime12h = signal<TimeValue | null>(null);
  protected readonly selectedTimeWithSeconds = signal<TimeValue | null>(null);
  protected readonly selectedTimeStep = signal<TimeValue | null>(null);

  // Datetimepicker demo
  protected readonly selectedDatetime = signal<Date | null>(null);
  protected readonly selectedDatetime12h = signal<Date | null>(null);
  protected readonly selectedDatetimeSeconds = signal<Date | null>(null);
  protected readonly selectedDatetimeCustom = signal<Date | null>(null);

  // Progress demo
  protected readonly progressValue = signal(35);

  // Tree demo
  protected readonly lastTreeAction = signal<string>('');
  protected apiTreeNodes: TreeNode[] = [
    {
      label: 'Users API',
      icon: '\uD83D\uDCC1',
      expanded: true,
      children: [
        { label: 'GET /users', icon: '\uD83D\uDFE2', data: { method: 'GET' } },
        { label: 'POST /users', icon: '\uD83D\uDFE1', data: { method: 'POST' } },
        { label: 'GET /users/:id', icon: '\uD83D\uDFE2', data: { method: 'GET' } },
        {
          label: 'Auth',
          icon: '\uD83D\uDCC1',
          children: [
            { label: 'POST /login', icon: '\uD83D\uDFE1', data: { method: 'POST' } },
            { label: 'POST /logout', icon: '\uD83D\uDFE1', data: { method: 'POST' } },
            { label: 'POST /refresh', icon: '\uD83D\uDFE1', data: { method: 'POST' } },
          ],
        },
      ],
    },
    {
      label: 'Products API',
      icon: '\uD83D\uDCC1',
      children: [
        { label: 'GET /products', icon: '\uD83D\uDFE2', data: { method: 'GET' } },
        { label: 'POST /products', icon: '\uD83D\uDFE1', data: { method: 'POST' } },
        { label: 'DELETE /products/:id', icon: '\uD83D\uDD34', data: { method: 'DELETE' } },
      ],
    },
  ];

  protected readonly fileTreeNodes: TreeNode[] = [
    {
      label: 'src',
      icon: '\uD83D\uDCC2',
      expanded: true,
      children: [
        {
          label: 'app',
          icon: '\uD83D\uDCC2',
          expanded: true,
          children: [
            { label: 'app.component.ts', icon: '\uD83D\uDCDD' },
            { label: 'app.component.html', icon: '\uD83C\uDF10' },
            { label: 'app.component.scss', icon: '\uD83C\uDFA8' },
          ],
        },
        {
          label: 'assets',
          icon: '\uD83D\uDCC2',
          children: [
            { label: 'logo.png', icon: '\uD83D\uDDBC\uFE0F' },
            { label: 'styles.css', icon: '\uD83C\uDFA8' },
          ],
        },
        { label: 'main.ts', icon: '\uD83D\uDCDD' },
        { label: 'index.html', icon: '\uD83C\uDF10' },
      ],
    },
    { label: 'package.json', icon: '\uD83D\uDCE6' },
    { label: 'tsconfig.json', icon: '\u2699\uFE0F' },
  ];

  protected readonly columns: TableColumn<User>[] = [
    { key: 'id', header: 'ID', width: '60px', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
  ];

  protected toggleLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 2000);
  }

  protected handleAction(action: string): void {
    this.lastAction.set(action);
  }

  protected onFilesRejected(rejected: { file: File; reason: string }[]): void {
    this.rejectedFiles.set(rejected.map(r => `${r.file.name}: ${r.reason}`));
    setTimeout(() => this.rejectedFiles.set([]), 5000);
  }

  protected onMinimalFileChange(files: File[]): void {
    if (files.length > 0) {
      console.log('Minimal file selected:', files[0].name);
    }
  }

  protected onCityCreated(name: string): void {
    const newCity = { id: this.nextCityId++, name };
    this.creatableCities.update((cities) => [...cities, newCity]);
    // Select the newly created city after options update
    setTimeout(() => this.creatableCity.set(newCity));
  }

  protected onTagCreated(name: string): void {
    if (!this.tags().includes(name)) {
      this.tags.update((tags) => [...tags, name]);
    }
  }

  protected onTagDeleted(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  protected onFilterAdded(label: string): void {
    // When adding via input, create as included by default
    this.searchFilters.update((filters) => [...filters, { label, included: true }]);
  }

  protected toggleFilterInclude(filter: { label: string; included: boolean }): void {
    filter.included = !filter.included;
    // Trigger signal update
    this.searchFilters.update((filters) => [...filters]);
  }

  protected formatFilters(): string {
    const filters = this.searchFilters();
    if (filters.length === 0) return 'None';
    return filters.map((f) => `${f.included ? '+' : '-'}${f.label}`).join(', ');
  }

  protected onBadgeRemoved(): void {
    console.log('Badge removed!');
  }

  protected increaseProgress(): void {
    this.progressValue.update(v => Math.min(100, v + 10));
  }

  protected decreaseProgress(): void {
    this.progressValue.update(v => Math.max(0, v - 10));
  }

  protected formatDateRange(): string {
    const range = this.selectedDateRange() as DateRange | null;
    if (!range || (!range.start && !range.end)) return 'None';
    const start = range.start ? range.start.toLocaleDateString() : '...';
    const end = range.end ? range.end.toLocaleDateString() : '...';
    return `${start} — ${end}`;
  }

  protected formatTime(time: TimeValue | null): string {
    if (!time) return 'None';
    const h = time.hours.toString().padStart(2, '0');
    const m = time.minutes.toString().padStart(2, '0');
    if (time.seconds !== undefined) {
      const s = time.seconds.toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return `${h}:${m}`;
  }

  protected onCardClick(): void {
    console.log('Card clicked!');
  }

  protected onTreeNodeClick(node: TreeNode): void {
    this.lastTreeAction.set(`Clicked: ${node.label}`);
  }

  protected onTreeNodeExpand(node: TreeNode): void {
    this.lastTreeAction.set(`Expanded: ${node.label}`);
  }

  protected onTreeNodeCollapse(node: TreeNode): void {
    this.lastTreeAction.set(`Collapsed: ${node.label}`);
  }

  protected onTreeNodeDrop(event: TreeNodeDropEvent): void {
    this.lastTreeAction.set(
      `Dropped "${event.node.label}" ${event.position} "${event.target.label}"`
    );

    // Helper: remove a node from a tree array (returns true if found & removed)
    const removeNode = (nodes: TreeNode[], target: TreeNode): boolean => {
      const idx = nodes.indexOf(target);
      if (idx !== -1) { nodes.splice(idx, 1); return true; }
      for (const n of nodes) {
        if (n.children && removeNode(n.children, target)) return true;
      }
      return false;
    };

    // Helper: find the parent array and index of a node
    const findContainer = (nodes: TreeNode[], target: TreeNode): { arr: TreeNode[]; idx: number } | null => {
      const idx = nodes.indexOf(target);
      if (idx !== -1) return { arr: nodes, idx };
      for (const n of nodes) {
        if (n.children) {
          const result = findContainer(n.children, target);
          if (result) return result;
        }
      }
      return null;
    };

    // Clone top-level array reference so Angular picks up the change
    const roots = [...this.apiTreeNodes];

    // Remove dragged node from its current position
    removeNode(roots, event.node);

    if (event.position === 'inside') {
      if (!event.target.children) event.target.children = [];
      event.target.children.push(event.node);
    } else {
      const container = findContainer(roots, event.target);
      if (container) {
        const insertIdx = event.position === 'before' ? container.idx : container.idx + 1;
        container.arr.splice(insertIdx, 0, event.node);
      }
    }

    this.apiTreeNodes = roots;
  }

  protected async openConfirmDialog(): Promise<void> {
    const dialogRef = this.dialogService.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed with this action?',
        confirmText: 'Yes, proceed',
        cancelText: 'No, cancel',
      },
    });

    const result = await dialogRef.afterClosed();
    this.dialogResult.set(result ?? false);
  }

  protected async openDeleteDialog(): Promise<void> {
    const dialogRef = this.dialogService.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete Item',
        message: 'This action cannot be undone. Are you sure you want to delete this item?',
        confirmText: 'Delete',
        cancelText: 'Keep it',
      },
    });

    const result = await dialogRef.afterClosed();
    this.dialogResult.set(result ?? false);
  }

  protected addDynamicTab(): void {
    this.dynamicTabCounter++;
    const tabRef = this.tabsService.open<SampleTabComponent, SampleTabData, string>(
      SampleTabComponent,
      {
        label: `Tab ${this.dynamicTabCounter}`,
        data: {
          title: `Tab ${this.dynamicTabCounter}`,
          content: `This is the content for dynamically created tab #${this.dynamicTabCounter}. You can edit the title and save it.`,
        },
        closable: true,
      }
    );

    tabRef.afterClosed().then((result) => {
      if (result) {
        this.lastTabResult.set(result);
      }
    });
  }

  protected addMultipleTabs(): void {
    for (let i = 0; i < 3; i++) {
      this.addDynamicTab();
    }
  }

  protected closeAllTabs(): void {
    this.tabsService.closeAll();
    this.lastTabResult.set('');
  }

  protected showSuccessToast(): void {
    this.toastService.success('Your changes have been saved successfully.', 'Success', 200);
  }

  protected showErrorToast(): void {
    this.toastService.error('Something went wrong. Please try again.', 'Error');
  }

  protected showWarningToast(): void {
    this.toastService.warning('Please review your input before continuing.');
  }

  protected showInfoToast(): void {
    this.toastService.info('This is an informational message.');
  }

  protected showToastPosition(position: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'): void {
    this.toastService.show({
      message: `Toast at ${position}`,
      variant: 'info',
      position,
    });
  }
}
