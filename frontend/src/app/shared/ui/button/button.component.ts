import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type UiButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: UiButtonVariant = 'secondary';
  @Input() size: UiButtonSize = 'xs';
  @Input() disabled = false;
  @Input() fullWidth = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }

  get classes(): string {
    const base =
      'rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';

    const sizeClass =
      this.size === 'xs'
        ? 'px-3 py-1.5 text-xs'
        : this.size === 'sm'
          ? 'px-3 py-2 text-sm'
          : this.size === 'lg'
            ? 'h-11 px-5 text-sm'
            : 'h-9 px-4 text-sm';

    const variantClass =
      this.variant === 'primary'
        ? 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
        : this.variant === 'ghost'
          ? 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100'
          : this.variant === 'danger'
            ? 'border border-rose-200 bg-rose-600 text-white hover:bg-rose-500'
            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100';

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${base} ${sizeClass} ${variantClass} ${widthClass}`;
  }
}
