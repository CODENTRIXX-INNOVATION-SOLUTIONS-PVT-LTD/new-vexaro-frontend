export type PaymentStatus = 'Success' | 'Failed' | 'Pending';

export interface Payment {
  id: string;
  orderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  userId: string;
  userName: string;
  createdAt: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentParams {
  status?: PaymentStatus;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaymentResponse {
  success: boolean;
  data: {
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface PaymentDetailResponse {
  success: boolean;
  data: Payment;
  message?: string;
}
