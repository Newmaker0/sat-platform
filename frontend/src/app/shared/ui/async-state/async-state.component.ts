import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';

export type UiAsyncStatus = 'idle' | 'loading' | 'error' | 'empty' | 'success';

@Component({
  selector: 'app-async-state',
  templateUrl: './async-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncStateComponent implements OnChanges {
  @Input() status: UiAsyncStatus = 'loading';
  @Input() fill = false;

  @Input() loadingTemplate?: TemplateRef<unknown>;
  @Input() errorTemplate?: TemplateRef<unknown>;
  @Input() emptyTemplate?: TemplateRef<unknown>;
  @Input() successTemplate?: TemplateRef<unknown>;

  @Input() errorMessage = 'Não foi possível carregar os dados.';
  @Input() emptyMessage = 'Nenhum dado disponível.';
  @Input() panelMinHeightClass = 'min-h-[16rem]';
  @Input() showRetry = false;
  @Input() retryLabel = 'Tentar novamente';

  @Output() retryRequested = new EventEmitter<void>();

  displayedStatus: UiAsyncStatus = 'loading';

  @HostBinding('class.flex')
  get hostFlex(): boolean {
    return this.fill;
  }

  @HostBinding('class.min-h-0')
  get hostMinHeight(): boolean {
    return this.fill;
  }

  @HostBinding('class.flex-1')
  get hostFlexGrow(): boolean {
    return this.fill;
  }

  @HostBinding('class.flex-col')
  get hostDirection(): boolean {
    return this.fill;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('status' in changes) {
      this.displayedStatus = this.status;
    }
  }

  onRetry(): void {
    this.retryRequested.emit();
  }
}
