import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-paginator-doc',
  templateUrl: './paginator-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorDocComponent {
  length = 127;
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions: readonly number[] = [5, 10, 15, 20];

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
