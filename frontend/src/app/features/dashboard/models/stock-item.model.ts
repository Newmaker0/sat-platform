export interface StockItem {
  readonly id: string;
  readonly nome: string;
  readonly categoria: string;
  readonly localizacao: string;
  readonly quantidadeAtual: number;
  readonly limiteMinimo: number;
  readonly unidade: string;
  readonly ultimaAtualizacao: string;
}
