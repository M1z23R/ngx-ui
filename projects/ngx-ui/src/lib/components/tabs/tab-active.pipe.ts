import { Pipe, PipeTransform } from '@angular/core';
import { TabComponent } from './tab.component';

@Pipe({
  name: 'tabActive',
  standalone: true,
  pure: true,
})
export class TabActivePipe implements PipeTransform {
  transform(tab: TabComponent, index: number, activeTab: string | number): boolean {
    const tabId = tab.id();
    if (tabId !== '' && tabId !== undefined) {
      return activeTab === tabId;
    }
    return activeTab === index;
  }
}
