export interface OrderTemplate {
    id: string;
    amount: number;
    frequency: number;
    description?: string;
  }
  
  export interface Template {
    id: string;
    name: string;
    date: string;
    paymentMethod: 'cash' | 'card' | 'both';
    totalAmount: number;
    orders: OrderTemplate[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TemplateStats {
    averageOrderValue: number;
    orderCountDistribution: Record<number, number>;
    frequencyByAmount: Record<number, number>;
    totalOrders: number;
  }
  