import { Order, OrderGroup, PaymentMethod } from './Order';

export interface DailyReport {
  id: string;
  date: string;
  totalAmount: number;
  targetAmount: number;
  cashAmount: number;
  cardAmount: number;
  orders: Order[];
  orderGroups: OrderGroup[];
  generatedAt: string;
  templateIds: string[];
}

export interface DailyReportGenerationParams {
  date: string;
  targetAmount: number;
  paymentMethod: PaymentMethod;
  templateIds?: string[];
  algorithmSettings?: AlgorithmSettings;
}

export interface AlgorithmSettings {
  variationFactor: number; // 0-1, how much to vary from template patterns
  roundingPrecision: number; // decimal places for rounding amounts
  preferExactMatch: boolean; // prioritize exact matches from templates
  allowNewOrderTypes: boolean; // generate order types not in templates
  maxIterations: number; // maximum algorithm iterations for optimization
  templateFidelity: number; // 0-1, how strictly to respect template frequencies

}
