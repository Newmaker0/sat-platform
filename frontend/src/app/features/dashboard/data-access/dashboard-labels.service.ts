import { Injectable } from '@angular/core';
import {
  ApplicationStatus,
  EventType,
  NonAppliedReason
} from '../models/consumption-activity.model';

@Injectable({ providedIn: 'root' })
export class DashboardLabelsService {
  getApplicationStatusLabel(status: ApplicationStatus): string {
    return status === 'APLICADO' ? 'Aplicado' : 'Não aplicado';
  }

  getReasonLabel(reason?: NonAppliedReason): string {
    if (reason === 'ESTOQUE_INSUFICIENTE') {
      return 'Estoque insuficiente';
    }

    if (reason === 'ITEM_INVALIDO') {
      return 'Item inválido';
    }

    if (reason === 'DUPLICADO') {
      return 'Evento duplicado';
    }

    return 'Sem motivo informado';
  }

  getEventTypeLabel(type: EventType): string {
    return type === 'AJUSTE' ? 'Ajuste' : 'Consumo';
  }
}
