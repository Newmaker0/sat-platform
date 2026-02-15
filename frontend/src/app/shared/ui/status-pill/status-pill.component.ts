import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type UiPillTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info';
export type UiPillSize = 'xs' | 'sm';

@Component({
  selector: 'app-status-pill',
  templateUrl: './status-pill.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusPillComponent {
  @Input() label = '';
  @Input() tone: UiPillTone = 'neutral';
  @Input() size: UiPillSize = 'xs';

  get classes(): string {
    const base = 'inline-flex rounded-full font-semibold';
    const sizeClass = this.size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2 py-0.5 text-[0.68rem]';
    const toneClass =
      this.tone === 'success'
        ? 'bg-emerald-100 text-emerald-700'
        : this.tone === 'danger'
          ? 'bg-rose-100 text-rose-700'
          : this.tone === 'warning'
            ? 'bg-amber-100 text-amber-700'
            : this.tone === 'info'
              ? 'bg-sky-100 text-sky-700'
              : 'bg-slate-200 text-slate-700';

    return `${base} ${sizeClass} ${toneClass}`;
  }
}
