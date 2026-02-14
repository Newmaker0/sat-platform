import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ToggleSetting {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
}

const DEFAULT_SETTINGS: readonly ToggleSetting[] = [
  {
    id: 'ajuste-manual',
    label: 'Permitir ajuste manual',
    description: 'Admin pode registrar compensação para corrigir consumo aplicado.',
    enabled: true
  },
  {
    id: 'vinculo-obrigatorio',
    label: 'Exigir vínculo com evento original',
    description: 'Todo ajuste deve referenciar o eventId que motivou a correção.',
    enabled: true
  },
  {
    id: 'observacao-excecao',
    label: 'Exigir observação em exceções',
    description: 'Eventos não aplicados devem registrar motivo operacional.',
    enabled: true
  }
];

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  settings = this.cloneSettings(DEFAULT_SETTINGS);
  feedbackMessage: string | null = null;

  trackBySettingId(_: number, setting: ToggleSetting): string {
    return setting.id;
  }

  toggleSetting(id: string): void {
    this.settings = this.settings.map((setting) => {
      if (setting.id !== id) {
        return setting;
      }

      return { ...setting, enabled: !setting.enabled };
    });

    this.feedbackMessage = null;
  }

  saveMock(): void {
    const now = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.feedbackMessage = `Configurações salvas no ambiente de simulação às ${now}.`;
  }

  restoreDefaults(): void {
    this.settings = this.cloneSettings(DEFAULT_SETTINGS);
    this.feedbackMessage = 'Padrões restaurados no ambiente de simulação.';
  }

  getEnabledCount(): number {
    return this.settings.filter((setting) => setting.enabled).length;
  }

  private cloneSettings(source: readonly ToggleSetting[]): ToggleSetting[] {
    return source.map((setting) => ({ ...setting }));
  }
}
