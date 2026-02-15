import { ChangeDetectionStrategy, Component } from '@angular/core';

type DemoState = 'loading' | 'error' | 'empty' | 'success';

interface DemoItem {
  readonly id: string;
  readonly nome: string;
  readonly local: string;
  readonly quantidade: string;
  readonly status: 'Estável' | 'Crítico';
}

@Component({
  selector: 'app-async-states-doc',
  templateUrl: './async-states-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncStatesDocComponent {
  readonly states: readonly DemoState[] = ['loading', 'error', 'empty', 'success'];
  currentState: DemoState = 'loading';

  readonly items: readonly DemoItem[] = [
    {
      id: 'item-1',
      nome: 'Válvula de oxigênio',
      local: 'Habitat',
      quantidade: '8 un',
      status: 'Estável'
    },
    {
      id: 'item-2',
      nome: 'Sensor térmico',
      local: 'Módulo técnico',
      quantidade: '2 un',
      status: 'Crítico'
    },
    {
      id: 'item-3',
      nome: 'Filtro de ar',
      local: 'Suporte de vida',
      quantidade: '14 un',
      status: 'Estável'
    },
    {
      id: 'item-4',
      nome: 'Placa de circuito',
      local: 'Laboratório',
      quantidade: '3 un',
      status: 'Crítico'
    }
  ];

  setState(state: DemoState): void {
    this.currentState = state;
  }

  trackById(_: number, item: DemoItem): string {
    return item.id;
  }
}
