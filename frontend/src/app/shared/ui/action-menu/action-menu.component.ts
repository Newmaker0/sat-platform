import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output
} from '@angular/core';

export type ActionMenuIcon =
  | 'sparkles'
  | 'history'
  | 'copy'
  | 'user'
  | 'activities'
  | 'notifications'
  | 'logout';

export interface ActionMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: ActionMenuIcon;
  readonly dividerBefore?: boolean;
}

@Component({
  selector: 'app-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionMenuComponent {
  @Input() items: readonly ActionMenuItem[] = [];
  @Input() triggerAriaLabel = 'Abrir menu de ações';
  @Input() useDefaultTrigger = true;
  @Input() triggerClass = '';
  @Input() xPosition: 'before' | 'after' = 'before';
  @Input() yPosition: 'above' | 'below' = 'below';
  @Input() showHeader = false;
  @Input() headerTitle = '';
  @Input() headerSubtitle = '';
  @Input() headerInitial = '';

  @Output() itemSelected = new EventEmitter<string>();
  @Output() menuOpened = new EventEmitter<void>();
  @Output() menuClosed = new EventEmitter<void>();

  @HostBinding('style.display')
  get hostDisplay(): string {
    return this.useDefaultTrigger ? 'inline-flex' : 'block';
  }

  @HostBinding('style.width')
  get hostWidth(): string {
    return this.useDefaultTrigger ? 'auto' : '100%';
  }

  onSelect(itemId: string): void {
    this.itemSelected.emit(itemId);
  }

  onOpened(): void {
    this.menuOpened.emit();
  }

  onClosed(): void {
    this.menuClosed.emit();
  }

  trackById(_: number, item: ActionMenuItem): string {
    return item.id;
  }
}
