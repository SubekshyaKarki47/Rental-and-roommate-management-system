import { api } from './api';

export interface RentPayment {
  id: number;
  lease: number;
  amount: number;
  month_for: string;
  due_date: string;
  paid_date?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED';
  payment_method: string;
  transaction_reference?: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
}

export interface Lease {
  id: number;
  property: number;
  property_details: {
    id: number;
    title: string;
    city: string;
    area: string;
    monthly_rent: number;
    primary_image?: string;
  };
  landlord: {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  tenant: {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  room_number?: string;
  monthly_rent: number;
  security_deposit: number;
  start_date: string;
  end_date: string;
  rent_due_day: number;
  status: 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
  terms?: string;
  payments: RentPayment[];
  next_payment?: {
    id: number;
    amount: number;
    month_for: string;
    due_date: string;
    days_left: number;
    is_overdue: boolean;
  };
  created_at: string;
}

export const rentalService = {
  async getLeases(): Promise<Lease[]> {
    const res = await api.get<Lease[]>('/api/rentals/leases/');
    return Array.isArray(res.data) ? res.data : (res.data as any)?.results || [];
  },

  async getLease(id: number): Promise<Lease> {
    const res = await api.get<Lease>(`/api/rentals/leases/${id}/`);
    return res.data;
  },

  async createLease(data: {
    property: number;
    tenant: number;
    room_number?: string;
    monthly_rent: number;
    security_deposit: number;
    start_date: string;
    end_date: string;
    rent_due_day?: number;
    terms?: string;
  }): Promise<Lease> {
    const res = await api.post<Lease>('/api/rentals/leases/', data);
    return res.data;
  },

  async simulatePayment(paymentId: number, data: {
    payment_method: 'ESEWA' | 'KHALTI' | 'BANK_TRANSFER' | 'CASH' | 'SIMULATED';
    notes?: string;
  }): Promise<any> {
    const res = await api.post(`/api/rentals/payments/${paymentId}/pay/`, data);
    return res.data;
  },

  async getLandlordStats(): Promise<{
    active_leases_count: number;
    total_collected: number;
    pending_amount: number;
    recent_payments: RentPayment[];
    monthly_chart: Array<{ month: string; revenue: number; collected: number }>;
  }> {
    const res = await api.get('/api/rentals/stats/');
    return res.data;
  },
};
