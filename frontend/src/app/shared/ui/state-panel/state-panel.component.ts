import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type UiStatePanelTone = 'default' | 'error';

@Component({
  selector: 'app-state-panel',
  templateUrl: './state-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatePanelComponent {
  @Input() message = '';
  @Input() tone: UiStatePanelTone = 'default';
  @Input() minHeightClass = 'min-h-[16rem]';
  @Input() actionLabel: string | null = null;

  @Output() actionClicked = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClicked.emit();
  }

  get classes(): string {
    const base =
      'flex items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-medium';
    const toneClass =
      this.tone === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-slate-200 bg-slate-50 text-slate-600';
    return `${base} ${this.minHeightClass} ${toneClass}`;
  }
}
