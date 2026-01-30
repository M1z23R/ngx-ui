import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filePreview',
  standalone: true,
  pure: true,
})
export class FilePreviewPipe implements PipeTransform {
  private url: string | null = null;

  transform(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      this.cleanup();
      return null;
    }

    this.cleanup();
    this.url = URL.createObjectURL(file);
    return this.url;
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.url) {
      URL.revokeObjectURL(this.url);
      this.url = null;
    }
  }
}
