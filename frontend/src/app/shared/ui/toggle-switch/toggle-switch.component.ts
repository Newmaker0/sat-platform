import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type UiToggleSize = 'sm' | 'md';

@Component({
  selector: 'app-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleSwitchComponent {
  @Input() checked = false;
  @Input() disabled = false;
  @Input() size: UiToggleSize = 'md';
  @Input() ariaLabel = 'Alternar opção';

  @Output() checkedChange = new EventEmitter<boolean>();

  onToggle(): void {
    if (this.disabled) {
      return;
    }

    this.checkedChange.emit(!this.checked);
  }

  get trackClasses(): string {
    const sizeClass = this.size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
    const toneClass = this.checked ? 'bg-slate-900' : 'bg-slate-300';
    const disabledClass = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `${sizeClass} ${toneClass} ${disabledClass}`;
  }

  get thumbClasses(): string {
    const sizeClass = this.size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const moveClass =
      this.size === 'sm'
        ? this.checked
          ? 'translate-x-4'
          : 'translate-x-0'
        : this.checked
          ? 'translate-x-5'
          : 'translate-x-0';
    return `${sizeClass} ${moveClass}`;
  }
}
