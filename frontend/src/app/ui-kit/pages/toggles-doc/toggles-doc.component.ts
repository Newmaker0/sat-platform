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
}
