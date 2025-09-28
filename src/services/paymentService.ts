const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface CreateOrderRequest {
  planType: 'Premium' | 'Premium Plus';
  duration: '1 month' | '3 months' | '6 months' | '12 months';
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  paymentUrl: string;
  transactionId: string;
}

interface PaymentHistoryResponse {
  success: boolean;
  subscriptions: any[];
}

interface VerifyPaymentResponse {
  success: boolean;
  paymentStatus: string;
  code: string;
  subscription: any;
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createPaymentOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create payment order');
    }

    return result;
  }

  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/verify/${transactionId}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to verify payment');
    }

    return result;
  }

  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/history`, {
      headers: this.getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get payment history');
    }

    return result;
  }

  async getSubscriptionPlans() {
    const response = await fetch(`${API_BASE_URL}/subscriptions/plans`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get subscription plans');
    }

    return result;
  }

  async getCurrentSubscription() {
    const response = await fetch(`${API_BASE_URL}/subscriptions/current`, {
      headers: this.getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get current subscription');
    }

    return result;
  }
}

export const paymentService = new PaymentService();

