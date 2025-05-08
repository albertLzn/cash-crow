import { PaymentMethod } from "./Order";

export interface OrderTemplate {
    id: string;
    amount: number;
    frequency: number;
    description?: string;
    paymentMethod: PaymentMethod;
  
  }
  
  export interface Template {
    id: string;
    name: string;
    date: string;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    orders: OrderTemplate[];
    createdAt: string;
    updatedAt: string;
    maxCashAmount?: number;
    minCardAmount?: number;
    maxOperationsPerDay?: number;
    isProRepro?: boolean;
  }
  
  export interface TemplateStats {
    averageOrderValue: number;
    orderCountDistribution: Record<number, number>;
    frequencyByAmount: Record<number, number>;
    totalOrders: number;
  }
  