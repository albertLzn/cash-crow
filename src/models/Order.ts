export type PaymentMethod = 'cash' | 'card' | 'both';

export interface Order {
  id: string;
  amount: number;
  timestamp: string;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface OrderGroup {
  amount: number;
  count: number;
  paymentMethod: PaymentMethod;
  description?: string;
}
