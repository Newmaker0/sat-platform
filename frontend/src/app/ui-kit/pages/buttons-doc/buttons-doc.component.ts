import { ChangeDetectionStrategy, Component } from '@angular/core';

type ButtonTone = 'primario' | 'secundario' | 'ghost' | 'destrutivo';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-buttons-doc',
  templateUrl: './buttons-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonsDocComponent {
  readonly tones: readonly ButtonTone[] = ['primario', 'secundario', 'ghost', 'destrutivo'];
  readonly sizes: readonly ButtonSize[] = ['sm', 'md', 'lg'];

  selectedTone: ButtonTone = 'primario';
  selectedSize: ButtonSize = 'md';
  disabled = false;

  setTone(tone: ButtonTone): void {
    this.selectedTone = tone;
  }

  setSize(size: ButtonSize): void {
    this.selectedSize = size;
  }

  toggleDisabled(): void {
    this.disabled = !this.disabled;
  }

  getPreviewClasses(): string {
    const sizeClass =
      this.selectedSize === 'sm'
        ? 'h-8 px-3 text-xs'
        : this.selectedSize === 'lg'
          ? 'h-11 px-5 text-sm'
          : 'h-9 px-4 text-sm';

    const toneClass =
      this.selectedTone === 'primario'
        ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
        : this.selectedTone === 'secundario'
          ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
          : this.selectedTone === 'ghost'
            ? 'border-transparent bg-transparent text-slate-700 hover:bg-slate-100'
            : 'border-rose-200 bg-rose-600 text-white hover:bg-rose-500';

    const disabledClass = this.disabled ? 'cursor-not-allowed opacity-50 hover:bg-inherit' : '';

    return `${sizeClass} ${toneClass} ${disabledClass}`;
  }
}
