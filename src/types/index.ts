export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  amountPaid: number;
  change: number;
  timestamp: Date;
  cashierId: string;
  customerName?: string;
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'admin' | 'cashier';
}

export interface CashRegister {
  id: string;
  openedAt: Date;
  closedAt: Date | null;
  initialAmount: number;
  finalAmount: number | null;
  sales: Sale[];
  cashierId: string;
}

export interface RegisterClosing {
  id: string;
  registerId: string;
  openedAt: Date;
  closedAt: Date;
  initialAmount: number;
  finalAmount: number;
  expectedAmount: number;
  difference: number;
  totalSales: number;
  salesCount: number;
  cashierId: string;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  salesCount: number;
}