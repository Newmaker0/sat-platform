import { ChangeDetectionStrategy, Component } from '@angular/core';

interface UiKitNavItem {
  readonly path: string;
  readonly label: string;
}

interface UiKitNavSection {
  readonly title: string;
  readonly items: readonly UiKitNavItem[];
}

@Component({
  selector: 'app-ui-kit-layout',
  templateUrl: './ui-kit-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiKitLayoutComponent {
  readonly navSections: readonly UiKitNavSection[] = [
    {
      title: 'Catálogo',
      items: [
        { path: '/ui-kit', label: 'Visão geral' },
        { path: '/ui-kit/botoes', label: 'Botões' },
        { path: '/ui-kit/toggles', label: 'Toggles' },
        { path: '/ui-kit/cards', label: 'Cards' },
        { path: '/ui-kit/paginacao', label: 'Paginação' }
      ]
    },
    {
      title: 'Estados assíncronos',
      items: [
        { path: '/ui-kit/estados-assincronos/lista', label: 'Lista' },
        { path: '/ui-kit/estados-assincronos/tabela', label: 'Tabela' }
      ]
    }
  ];
}
