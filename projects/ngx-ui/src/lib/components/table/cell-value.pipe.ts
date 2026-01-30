import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cellValue',
  standalone: true,
  pure: true,
})
export class CellValuePipe implements PipeTransform {
  transform(row: object, key: string): unknown {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      if (value == null) return undefined;
      value = (value as Record<string, unknown>)[k];
    }
    return value;
  }
}
