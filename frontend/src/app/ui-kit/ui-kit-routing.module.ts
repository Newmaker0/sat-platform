import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsyncStatesDocComponent } from './pages/async-states-doc/async-states-doc.component';
import { AsyncTableStatesDocComponent } from './pages/async-table-states-doc/async-table-states-doc.component';
import { ButtonsDocComponent } from './pages/buttons-doc/buttons-doc.component';
import { CardsDocComponent } from './pages/cards-doc/cards-doc.component';
import { PaginatorDocComponent } from './pages/paginator-doc/paginator-doc.component';
import { TogglesDocComponent } from './pages/toggles-doc/toggles-doc.component';
import { UiKitHomeComponent } from './pages/ui-kit-home/ui-kit-home.component';
import { UiKitLayoutComponent } from './layout/ui-kit-layout.component';

const routes: Routes = [
  {
    path: '',
    component: UiKitLayoutComponent,
    children: [
      {
        path: '',
        component: UiKitHomeComponent
      },
      {
        path: 'estados-assincronos',
        pathMatch: 'full',
        redirectTo: 'estados-assincronos/lista'
      },
      {
        path: 'estados-assincronos/lista',
        component: AsyncStatesDocComponent
      },
      {
        path: 'estados-assincronos/tabela',
        component: AsyncTableStatesDocComponent
      },
      {
        path: 'botoes',
        component: ButtonsDocComponent
      },
      {
        path: 'toggles',
        component: TogglesDocComponent
      },
      {
        path: 'cards',
        component: CardsDocComponent
      },
      {
        path: 'paginacao',
        component: PaginatorDocComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiKitRoutingModule {}
