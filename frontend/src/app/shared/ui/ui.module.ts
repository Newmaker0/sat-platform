import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { ActionMenuComponent } from './action-menu/action-menu.component';
import { AsyncStateComponent } from './async-state/async-state.component';
import { ButtonComponent } from './button/button.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { StatePanelComponent } from './state-panel/state-panel.component';
import { StatusPillComponent } from './status-pill/status-pill.component';
import { ToggleSwitchComponent } from './toggle-switch/toggle-switch.component';

@NgModule({
  declarations: [
    ActionMenuComponent,
    AsyncStateComponent,
    ButtonComponent,
    PageHeaderComponent,
    PaginatorComponent,
    StatePanelComponent,
    StatusPillComponent,
    ToggleSwitchComponent
  ],
  imports: [CommonModule, MaterialModule],
  exports: [
    ActionMenuComponent,
    AsyncStateComponent,
    ButtonComponent,
    PageHeaderComponent,
    PaginatorComponent,
    StatePanelComponent,
    StatusPillComponent,
    ToggleSwitchComponent
  ]
})
export class UiModule {}
