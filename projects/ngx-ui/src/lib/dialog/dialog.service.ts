import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  StaticProvider,
  Type,
} from '@angular/core';
import { DialogRef } from './dialog-ref';
import { DIALOG_DATA, DIALOG_REF, DialogConfig, DEFAULT_DIALOG_CONFIG } from './dialog.config';

/**
 * Service for opening modal dialogs.
 *
 * @example
 * ```typescript
 * @Component({ ... })
 * export class MyDialog {
 *   private dialogRef = inject(DIALOG_REF) as DialogRef<string>;
 *   private data = inject(DIALOG_DATA) as { message: string };
 *
 *   confirm() {
 *     this.dialogRef.close('confirmed');
 *   }
 * }
 *
 * // Usage:
 * const dialogRef = this.dialogService.open(MyDialog, {
 *   data: { message: 'Hello' },
 *   size: 'md'
 * });
 *
 * const result = await dialogRef.afterClosed();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  /**
   * Opens a dialog with the specified component.
   *
   * @param component - The component to render inside the dialog
   * @param config - Configuration options for the dialog
   * @returns A DialogRef that can be used to close the dialog and get results
   */
  open<TComponent, TData = unknown, TResult = unknown>(
    component: Type<TComponent>,
    config: DialogConfig<TData> = {}
  ): DialogRef<TResult> {
    const mergedConfig = { ...DEFAULT_DIALOG_CONFIG, ...config };
    const dialogRef = new DialogRef<TResult>(() => this.destroy(componentRef));

    const injector = this.createInjector(config.data, dialogRef);
    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
      elementInjector: injector,
    });

    // Store config on the host element for the component to access
    const hostElement = componentRef.location.nativeElement as HTMLElement;
    hostElement.dataset['dialogConfig'] = JSON.stringify(mergedConfig);

    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(hostElement);

    return dialogRef;
  }

  private destroy(componentRef: ComponentRef<unknown>): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }

  private createInjector<TData, TResult>(data: TData | undefined, dialogRef: DialogRef<TResult>): Injector {
    const providers: StaticProvider[] = [
      { provide: DIALOG_DATA, useValue: data },
      { provide: DIALOG_REF, useValue: dialogRef },
    ];

    return Injector.create({
      providers,
      parent: this.injector,
    });
  }
}
