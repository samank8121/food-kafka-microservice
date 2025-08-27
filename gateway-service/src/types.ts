export interface Payment {
  paymentId: string;
  orderId: string;
  amount: number;
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  status: "pending" | "completed" | "failed";
}

export interface Order {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  timestamp: string;
}