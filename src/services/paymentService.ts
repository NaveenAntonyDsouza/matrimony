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
    console.log('🔄 Payment Service: Creating order with data:', data);
    console.log('🔄 Payment Service: API URL:', `${API_BASE_URL}/payments/create-order`);
    
    const headers = this.getAuthHeaders();
    console.log('🔄 Payment Service: Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer [TOKEN]' : 'No token' });

    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('📥 Payment Service: Response status:', response.status);
    console.log('📥 Payment Service: Response data:', result);

    if (!response.ok) {
      const errorMessage = result.message || `HTTP ${response.status}: Failed to create payment order`;
      console.error('❌ Payment Service: Error:', errorMessage);
      throw new Error(errorMessage);
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

  async verifyPaymentPublic(transactionId: string): Promise<VerifyPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/verify-public/${transactionId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
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

