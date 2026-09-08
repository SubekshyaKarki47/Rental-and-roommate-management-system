import { api } from './api';

export interface RentalApplication {
  id: number;
  tenant: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone_number?: string;
    avatar?: string;
  };
  property: number;
  property_details: {
    id: number;
    title: string;
    city: string;
    area: string;
    monthly_rent: number;
    bedrooms: number;
    bathrooms: number;
    primary_image?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  move_in_date: string;
  monthly_income: number;
  employment_status: string;
  credit_score_range: string;
  message: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  guarantor_name?: string;
  guarantor_contact?: string;
  landlord_notes?: string;
  created_at: string;
  updated_at: string;
}

export const applicationService = {
  async getApplications(params?: { status?: string; property_id?: number }): Promise<RentalApplication[]> {
    const res = await api.get<RentalApplication[]>('/api/applications/', { params });
    return Array.isArray(res.data) ? res.data : (res.data as any)?.results || [];
  },

  async getApplication(id: number): Promise<RentalApplication> {
    const res = await api.get<RentalApplication>(`/api/applications/${id}/`);
    return res.data;
  },

  async submitApplication(data: {
    property: number;
    move_in_date: string;
    monthly_income: number;
    employment_status: string;
    credit_score_range: string;
    message?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
  }): Promise<RentalApplication> {
    const res = await api.post<RentalApplication>('/api/applications/', data);
    return res.data;
  },

  async withdrawApplication(id: number): Promise<any> {
    const res = await api.post(`/api/applications/${id}/withdraw/`);
    return res.data;
  },

  async updateStatus(id: number, data: { status: 'APPROVED' | 'REJECTED'; landlord_notes?: string }): Promise<RentalApplication> {
    const res = await api.patch<RentalApplication>(`/api/applications/${id}/status/`, data);
    return res.data;
  },

  async getLandlordStats(): Promise<{
    total_applications: number;
    pending_applications: number;
    approved_applications: number;
    rejected_applications: number;
    total_properties: number;
    property_breakdown: Array<{ property_id: number; title: string; total_apps: number; pending_apps: number }>;
  }> {
    const res = await api.get('/api/applications/stats/');
    return res.data;
  },
};
