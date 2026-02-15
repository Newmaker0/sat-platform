import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiModule } from '../shared/ui/ui.module';
import { UiKitRoutingModule } from './ui-kit-routing.module';
import { AsyncStatesDocComponent } from './pages/async-states-doc/async-states-doc.component';
import { AsyncTableStatesDocComponent } from './pages/async-table-states-doc/async-table-states-doc.component';
import { ButtonsDocComponent } from './pages/buttons-doc/buttons-doc.component';
import { CardsDocComponent } from './pages/cards-doc/cards-doc.component';
import { PaginatorDocComponent } from './pages/paginator-doc/paginator-doc.component';
import { TogglesDocComponent } from './pages/toggles-doc/toggles-doc.component';
import { UiKitHomeComponent } from './pages/ui-kit-home/ui-kit-home.component';
import { UiKitLayoutComponent } from './layout/ui-kit-layout.component';

@NgModule({
  declarations: [
    UiKitLayoutComponent,
    UiKitHomeComponent,
    AsyncStatesDocComponent,
    AsyncTableStatesDocComponent,
    ButtonsDocComponent,
    TogglesDocComponent,
    CardsDocComponent,
    PaginatorDocComponent
  ],
  imports: [CommonModule, FormsModule, UiModule, UiKitRoutingModule]
})
export class UiKitModule {}
