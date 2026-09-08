import { api } from './api';

export interface ExpenseParticipant {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
  share_amount: number;
  is_settled: boolean;
  settled_at?: string;
}

export interface Expense {
  id: number;
  title: string;
  total_amount: number;
  paid_by: {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
  property?: number;
  category: 'GROCERIES' | 'UTILITIES' | 'INTERNET' | 'HOUSEHOLD' | 'ENTERTAINMENT' | 'OTHER';
  split_type: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  receipt_image?: string;
  date: string;
  notes: string;
  participants: ExpenseParticipant[];
  created_at: string;
}

export interface SettlementRecord {
  id: number;
  payer: { id: number; full_name: string; email: string };
  receiver: { id: number; full_name: string; email: string };
  amount: number;
  method: string;
  notes?: string;
  created_at: string;
}

export interface SimplifiedDebt {
  from_user_id: number;
  to_user_id: number;
  from_user_name: string;
  to_user_name: string;
  amount: number;
  is_current_user_payer: boolean;
  is_current_user_receiver: boolean;
}

export const expenseService = {
  async getExpenses(): Promise<Expense[]> {
    const res = await api.get<Expense[]>('/api/expenses/');
    return Array.isArray(res.data) ? res.data : (res.data as any)?.results || [];
  },

  async createExpense(data: {
    title: string;
    total_amount: number;
    category: string;
    split_type?: string;
    participant_ids: number[];
    custom_shares?: Record<number, number>;
    notes?: string;
    property?: number;
  }): Promise<Expense> {
    const res = await api.post<Expense>('/api/expenses/', data);
    return res.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/api/expenses/${id}/`);
  },

  async getDashboardStats(): Promise<{
    total_spent: number;
    you_owe: number;
    others_owe_you: number;
    net_balance: number;
    simplified_settlements: SimplifiedDebt[];
    recent_settlements: SettlementRecord[];
  }> {
    const res = await api.get('/api/expenses/stats/');
    return res.data;
  },

  async settleUp(data: {
    receiver: number;
    amount: number;
    method?: 'ESEWA' | 'KHALTI' | 'BANK' | 'CASH';
    notes?: string;
  }): Promise<any> {
    const res = await api.post('/api/expenses/settle/', data);
    return res.data;
  },
};
