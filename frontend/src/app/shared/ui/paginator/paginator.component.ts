import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent {
  @Input() length = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: readonly number[] = [10];
  @Input() showFirstLastButtons = true;
  @Input() ariaLabel = 'Paginação';
  @Input() shrink = false;

  @Output() pageChange = new EventEmitter<PageEvent>();

  onPage(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
