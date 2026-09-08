import { api } from './api';

export interface AdminReport {
  id: number;
  reporter: any;
  reported_user?: any;
  reported_user_details?: any;
  reported_property?: any;
  reported_property_details?: any;
  reason: string;
  details: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  admin_notes: string;
  resolved_at?: string;
  created_at: string;
}

export interface AdminMetrics {
  total_users: number;
  total_tenants: number;
  total_landlords: number;
  total_properties: number;
  active_properties: number;
  verified_properties: number;
  pending_verifications: number;
  pending_reports: number;
  total_applications: number;
}

export const moderationService = {
  async submitReport(data: {
    reported_user?: number;
    reported_property?: number;
    reason: string;
    details: string;
  }): Promise<AdminReport> {
    const res = await api.post<AdminReport>('/api/moderation/reports/', data);
    return res.data;
  },

  async getAdminMetrics(): Promise<{ metrics: AdminMetrics; recent_reports: AdminReport[] }> {
    const res = await api.get('/api/moderation/admin/metrics/');
    return res.data;
  },

  async updateReport(id: number, data: { status?: string; admin_notes?: string }): Promise<AdminReport> {
    const res = await api.patch<AdminReport>(`/api/moderation/admin/reports/${id}/`, data);
    return res.data;
  },

  async verifyLandlord(userId: number): Promise<any> {
    const res = await api.post(`/api/moderation/admin/landlords/${userId}/verify/`);
    return res.data;
  },

  async updatePropertyAction(propertyId: number, data: { is_verified?: boolean; is_featured?: boolean; is_available?: boolean }): Promise<any> {
    const res = await api.patch(`/api/moderation/admin/properties/${propertyId}/action/`, data);
    return res.data;
  },
};
