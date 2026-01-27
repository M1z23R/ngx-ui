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
} from '@m1z23r/ngx-ui';

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
          <h2>Table</h2>
          <ui-table [data]="users()" [columns]="columns" />
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
  `],
})
export class App {
  protected readonly sidebarService = inject(SidebarService);

  protected readonly isLoading = signal(false);
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
}
