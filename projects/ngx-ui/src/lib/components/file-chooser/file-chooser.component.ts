import {
  Component,
  input,
  output,
  model,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  OnDestroy,
} from '@angular/core';

export type FileChooserVariant = 'default' | 'compact' | 'minimal';
export type FileChooserSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-file-chooser',
  standalone: true,
  templateUrl: './file-chooser.component.html',
  styleUrl: './file-chooser.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileChooserComponent implements OnDestroy {
  readonly variant = input<FileChooserVariant>('default');
  readonly size = input<FileChooserSize>('md');
  readonly accept = input<string>('');
  readonly multiple = input(false);
  readonly disabled = input(false);
  readonly maxFileSize = input<number | null>(null);
  readonly maxFiles = input<number | null>(null);
  readonly showFileList = input(true);
  readonly showPreviews = input(true);

  readonly dropzoneText = input('Drag and drop files here');
  readonly browseText = input('or click to browse');
  readonly acceptHint = input<string>('');

  readonly error = input<string>('');

  readonly value = model<File[]>([]);

  readonly fileAdded = output<File>();
  readonly fileRemoved = output<File>();
  readonly filesRejected = output<{ file: File; reason: string }[]>();

  protected dragOver = false;
  private readonly previews = new Map<File, string>();
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly containerClasses = computed(() => {
    return `ui-file-chooser--${this.variant()} ui-file-chooser--${this.size()}`;
  });

  protected readonly ariaLabel = computed(() => {
    const base = this.multiple() ? 'Choose files' : 'Choose file';
    return this.accept() ? `${base} (${this.accept()})` : base;
  });

  ngOnDestroy(): void {
    this.previews.forEach(url => URL.revokeObjectURL(url));
    this.previews.clear();
  }

  protected fileKey(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }

  protected getPreview(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      return null;
    }

    if (!this.previews.has(file)) {
      this.previews.set(file, URL.createObjectURL(file));
    }
    return this.previews.get(file)!;
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled()) {
      this.dragOver = true;
    }
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    if (this.disabled()) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  protected openFilePicker(): void {
    if (!this.disabled()) {
      this.fileInput().nativeElement.click();
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  protected removeFile(file: File): void {
    const preview = this.previews.get(file);
    if (preview) {
      URL.revokeObjectURL(preview);
      this.previews.delete(file);
    }

    this.value.update(files => files.filter(f => f !== file));
    this.fileRemoved.emit(file);
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private processFiles(newFiles: File[]): void {
    const accepted: File[] = [];
    const rejected: { file: File; reason: string }[] = [];
    const currentCount = this.value().length;
    const maxFiles = this.maxFiles();
    const maxFileSize = this.maxFileSize();
    const acceptPattern = this.accept();

    for (const file of newFiles) {
      if (maxFiles !== null && currentCount + accepted.length >= maxFiles) {
        rejected.push({ file, reason: `Maximum ${maxFiles} file(s) allowed` });
        continue;
      }

      if (acceptPattern && !this.isFileTypeAccepted(file, acceptPattern)) {
        rejected.push({ file, reason: 'File type not accepted' });
        continue;
      }

      if (maxFileSize !== null && file.size > maxFileSize) {
        rejected.push({ file, reason: `File exceeds maximum size of ${this.formatFileSize(maxFileSize)}` });
        continue;
      }

      accepted.push(file);
      this.fileAdded.emit(file);
    }

    if (accepted.length > 0) {
      if (this.multiple()) {
        this.value.update(files => [...files, ...accepted]);
      } else {
        this.value().forEach(f => {
          const preview = this.previews.get(f);
          if (preview) {
            URL.revokeObjectURL(preview);
            this.previews.delete(f);
          }
        });
        this.value.set([accepted[0]]);
      }
    }

    if (rejected.length > 0) {
      this.filesRejected.emit(rejected);
    }
  }

  private isFileTypeAccepted(file: File, accept: string): boolean {
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());

    for (const type of acceptedTypes) {
      if (type === file.type.toLowerCase()) return true;

      if (type.endsWith('/*')) {
        const category = type.slice(0, -2);
        if (file.type.toLowerCase().startsWith(category + '/')) return true;
      }

      if (type.startsWith('.')) {
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        if (ext === type) return true;
      }
    }

    return false;
  }
}
