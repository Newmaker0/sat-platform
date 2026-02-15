import { ChangeDetectionStrategy, Component } from '@angular/core';

type ToggleSize = 'sm' | 'md';

@Component({
  selector: 'app-toggles-doc',
  templateUrl: './toggles-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TogglesDocComponent {
  readonly sizes: readonly ToggleSize[] = ['sm', 'md'];

  selectedSize: ToggleSize = 'md';
  enabled = true;
  disabled = false;

  setSize(size: ToggleSize): void {
    this.selectedSize = size;
  }

  toggleEnabled(): void {
    this.enabled = !this.enabled;
  }

  toggleDisabled(): void {
    this.disabled = !this.disabled;
  }

  getTrackClasses(active: boolean): string {
    const sizeClass = this.selectedSize === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
    const toneClass = active ? 'bg-slate-900' : 'bg-slate-300';
    const disabledClass = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `${sizeClass} ${toneClass} ${disabledClass}`;
  }

  getThumbClasses(active: boolean): string {
    const sizeClass = this.selectedSize === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    const moveClass =
      this.selectedSize === 'sm'
        ? active
          ? 'translate-x-4'
          : 'translate-x-0'
        : active
          ? 'translate-x-5'
          : 'translate-x-0';
    return `${sizeClass} ${moveClass}`;
  }
}
