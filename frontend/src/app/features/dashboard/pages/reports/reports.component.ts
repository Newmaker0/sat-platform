import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

interface ReportRow {
  readonly id: string;
  readonly nome: string;
  readonly categoria: string;
  readonly atualizadoEm: string;
  readonly status: 'Pronto' | 'Agendado' | 'Processando';
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  readonly displayedColumns: string[] = ['nome', 'categoria', 'atualizadoEm', 'status'];
  readonly pageSizeOptions: readonly number[] = [5, 10, 20];
  readonly reports: readonly ReportRow[] = [
    {
      id: 'inventario-mensal',
      nome: 'Inventário mensal',
      categoria: 'Estoque',
      atualizadoEm: 'Hoje, 09:15',
      status: 'Pronto'
    },
    {
      id: 'ruptura-de-pecas',
      nome: 'Ruptura de peças',
      categoria: 'Estoque',
      atualizadoEm: 'Hoje, 06:50',
      status: 'Processando'
    },
    {
      id: 'produtividade-dos-tecnicos',
      nome: 'Produtividade dos técnicos',
      categoria: 'Operações',
      atualizadoEm: 'Ontem, 18:40',
      status: 'Pronto'
    },
    {
      id: 'previsao-de-consumo',
      nome: 'Previsão de consumo',
      categoria: 'Planejamento',
      atualizadoEm: 'Há 3 dias',
      status: 'Pronto'
    },
    {
      id: 'pendencias-por-regional',
      nome: 'Pendências por regional',
      categoria: 'Operações',
      atualizadoEm: 'Hoje, 08:00',
      status: 'Agendado'
    },
    {
      id: 'tempo-medio-de-atendimento',
      nome: 'Tempo médio de atendimento',
      categoria: 'Performance',
      atualizadoEm: 'Hoje, 07:30',
      status: 'Pronto'
    },
    {
      id: 'conciliacao-de-sincronizacoes',
      nome: 'Conciliação de sincronizações',
      categoria: 'Offline',
      atualizadoEm: 'Ontem, 23:10',
      status: 'Agendado'
    }
  ];

  pageSize = this.pageSizeOptions[0];
  pageIndex = 0;

  get totalReports(): number {
    return this.reports.length;
  }

  get pagedReports(): readonly ReportRow[] {
    const start = this.pageIndex * this.pageSize;
    return this.reports.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  trackByReportId(_: number, row: ReportRow): string {
    return row.id;
  }

  getStatusClasses(status: ReportRow['status']): string {
    if (status === 'Pronto') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (status === 'Agendado') {
      return 'bg-amber-100 text-amber-700';
    }
    return 'bg-sky-100 text-sky-700';
  }
}
