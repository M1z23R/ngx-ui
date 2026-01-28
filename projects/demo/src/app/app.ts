import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  InputComponent,
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
  ToastService,
  PaginationComponent,
} from '@m1z23r/ngx-ui';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

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
    PaginationComponent,
  ],
  template: `
    <ui-shell>
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
          <ui-button variant="ghost" size="sm" (clicked)="sidebarService.toggle()">
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
        <div slot="end">
          <ui-button variant="outline" size="sm">Profile</ui-button>
        </div>
      </ui-navbar>

      <ui-content>
        <h1>Component Showcase</h1>

        <section class="section">
          <h2>Buttons</h2>
          <div class="button-row">
            <ui-button variant="primary">Primary</ui-button>
            <ui-button variant="secondary">Secondary</ui-button>
            <ui-button variant="outline">Outline</ui-button>
            <ui-button variant="ghost">Ghost</ui-button>
          </div>
          <div class="button-row">
            <ui-button size="sm">Small</ui-button>
            <ui-button size="md">Medium</ui-button>
            <ui-button size="lg">Large</ui-button>
          </div>
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
            <ui-button uiTooltip="Left side tooltip" tooltipPosition="left" variant="secondary">Left</ui-button>
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
          </div>
          <p>Selected city: {{ selectedCity()?.name || 'None' }}</p>
        </section>

        <section class="section">
          <h2>Dropdown Menu</h2>
          <div class="button-row">
            <ui-dropdown>
              <button uiDropdownTrigger ui-button variant="outline">Actions</button>
              <ui-dropdown-item (clicked)="handleAction('edit')">Edit</ui-dropdown-item>
              <ui-dropdown-item (clicked)="handleAction('duplicate')">Duplicate</ui-dropdown-item>
              <ui-dropdown-divider />
              <ui-dropdown-item (clicked)="handleAction('delete')">Delete</ui-dropdown-item>
            </ui-dropdown>

            <ui-dropdown position="bottom-end">
              <button uiDropdownTrigger ui-button>More Options</button>
              <ui-dropdown-item (clicked)="handleAction('share')">Share</ui-dropdown-item>
              <ui-dropdown-item (clicked)="handleAction('export')">Export</ui-dropdown-item>
              <ui-dropdown-item [disabled]="true">Archive (disabled)</ui-dropdown-item>
            </ui-dropdown>
          </div>
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
          <p>Active tabs: {{ activeTab1() }}, {{ activeTab2() }}, {{ activeTab3() }}</p>
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
          <h2>Table</h2>
          <ui-table [data]="users()" [columns]="columns" />
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
            <ui-button variant="primary" (clicked)="showSuccessToast()">Success</ui-button>
            <ui-button variant="outline" (clicked)="showErrorToast()">Error</ui-button>
            <ui-button variant="outline" (clicked)="showWarningToast()">Warning</ui-button>
            <ui-button variant="outline" (clicked)="showInfoToast()">Info</ui-button>
          </div>
          <div class="button-row">
            <ui-button variant="ghost" size="sm" (clicked)="showToastPosition('top-left')">Top Left</ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="showToastPosition('top-center')">Top Center</ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="showToastPosition('top-right')">Top Right</ui-button>
          </div>
          <div class="button-row">
            <ui-button variant="ghost" size="sm" (clicked)="showToastPosition('bottom-left')">Bottom Left</ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="showToastPosition('bottom-center')">Bottom Center</ui-button>
            <ui-button variant="ghost" size="sm" (clicked)="showToastPosition('bottom-right')">Bottom Right</ui-button>
          </div>
          <div class="button-row" style="margin-top: 0.5rem;">
            <ui-button variant="secondary" size="sm" (clicked)="toastService.dismissAll()">Dismiss All</ui-button>
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
  `],
})
export class App {
  protected readonly sidebarService = inject(SidebarService);
  protected readonly dialogService = inject(DialogService);
  protected readonly toastService = inject(ToastService);

  protected readonly isLoading = signal(false);
  protected readonly dialogResult = signal<boolean | null>(null);
  protected readonly username = signal('');
  protected readonly errorValue = signal('');
  protected readonly disabledValue = signal('Cannot edit');
  protected readonly readonlyValue = signal('Read only content');

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

  // Pagination demo
  protected readonly currentPage = signal(1);
  protected readonly currentPage2 = signal(5);

  // File chooser demo
  protected readonly files = signal<File[]>([]);
  protected readonly singleFile = signal<File[]>([]);
  protected readonly rejectedFiles = signal<string[]>([]);

  // Textarea demo
  protected readonly textareaValue = signal('');
  protected readonly limitedTextarea = signal('');
  protected readonly errorTextarea = signal('');

  // Progress demo
  protected readonly progressValue = signal(35);

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

  protected onBadgeRemoved(): void {
    console.log('Badge removed!');
  }

  protected increaseProgress(): void {
    this.progressValue.update(v => Math.min(100, v + 10));
  }

  protected decreaseProgress(): void {
    this.progressValue.update(v => Math.max(0, v - 10));
  }

  protected onCardClick(): void {
    console.log('Card clicked!');
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
