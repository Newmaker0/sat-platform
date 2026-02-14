export type EventType = 'CONSUMO' | 'AJUSTE';
export type ApplicationStatus = 'APLICADO' | 'NAO_APLICADO';
export type NonAppliedReason = 'ESTOQUE_INSUFICIENTE' | 'ITEM_INVALIDO' | 'DUPLICADO';
export type EventSource = 'Offline' | 'Online' | 'Admin';

export interface ConsumptionActivity {
  readonly eventId: string;
  readonly tipoEvento: EventType;
  readonly astronauta: string;
  readonly itemNome: string;
  readonly quantidade: number;
  readonly unidade: string;
  readonly origem: EventSource;
  readonly registradoEm: string;
  readonly statusAplicacao: ApplicationStatus;
  readonly motivoNaoAplicacao?: NonAppliedReason;
  readonly referenciaEventoId?: string;
  readonly observacao?: string;
}
