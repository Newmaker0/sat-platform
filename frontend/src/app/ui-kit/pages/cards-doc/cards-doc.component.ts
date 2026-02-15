import { ChangeDetectionStrategy, Component } from '@angular/core';

type CardDensity = 'compacto' | 'confortavel';

@Component({
  selector: 'app-cards-doc',
  templateUrl: './cards-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsDocComponent {
  readonly densities: readonly CardDensity[] = ['compacto', 'confortavel'];
  density: CardDensity = 'confortavel';

  setDensity(density: CardDensity): void {
    this.density = density;
  }

  getCardPadding(): string {
    return this.density === 'compacto' ? 'p-4' : 'p-5';
  }

  getGap(): string {
    return this.density === 'compacto' ? 'gap-3' : 'gap-4';
  }
}
