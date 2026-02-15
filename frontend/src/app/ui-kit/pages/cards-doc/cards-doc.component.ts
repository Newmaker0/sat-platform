import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionMenuItem } from '../../../shared/ui/action-menu/action-menu.component';

type CardDensity = 'compacto' | 'confortavel';

@Component({
  selector: 'app-cards-doc',
  templateUrl: './cards-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsDocComponent {
  readonly densities: readonly CardDensity[] = ['compacto', 'confortavel'];
  readonly exampleMenuItems: readonly ActionMenuItem[] = [
    { id: 'OPEN', label: 'Abrir detalhes', icon: 'activities' },
    { id: 'EDIT', label: 'Editar card', icon: 'sparkles' },
    { id: 'ARCHIVE', label: 'Arquivar', icon: 'copy', dividerBefore: true }
  ];
  density: CardDensity = 'confortavel';
  menuFeedback: string | null = null;

  setDensity(density: CardDensity): void {
    this.density = density;
  }

  getCardPadding(): string {
    return this.density === 'compacto' ? 'p-4' : 'p-5';
  }

  getGap(): string {
    return this.density === 'compacto' ? 'gap-3' : 'gap-4';
  }

  onMenuSelect(actionId: string): void {
    this.menuFeedback = `Ação selecionada: ${actionId}`;
  }
}
