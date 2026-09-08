import { api } from './api';

export interface MaintenanceComment {
  id: number;
  user: {
    id: number;
    full_name: string;
    avatar?: string;
  };
  comment: string;
  created_at: string;
}

export interface MaintenanceTicket {
  id: number;
  property: number;
  property_details: {
    id: number;
    title: string;
    city: string;
    area: string;
  };
  tenant: {
    id: number;
    full_name: string;
    phone_number?: string;
  };
  title: string;
  description: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'APPLIANCE' | 'STRUCTURAL' | 'INTERNET' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
  photo?: string;
  resolution_notes?: string;
  resolved_at?: string;
  comments: MaintenanceComment[];
  created_at: string;
  updated_at: string;
}

export const maintenanceService = {
  async getTickets(params?: { status?: string; priority?: string }): Promise<MaintenanceTicket[]> {
    const res = await api.get<MaintenanceTicket[]>('/api/maintenance/', { params });
    return res.data;
  },

  async createTicket(data: {
    property: number;
    title: string;
    description: string;
    category: string;
    priority: string;
    photo?: File;
  }): Promise<MaintenanceTicket> {
    const formData = new FormData();
    formData.append('property', String(data.property));
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    const res = await api.post<MaintenanceTicket>('/api/maintenance/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateTicketStatus(id: number, data: { status: string; resolution_notes?: string }): Promise<MaintenanceTicket> {
    const res = await api.patch<MaintenanceTicket>(`/api/maintenance/${id}/`, data);
    return res.data;
  },

  async addComment(id: number, comment: string): Promise<MaintenanceComment> {
    const res = await api.post<MaintenanceComment>(`/api/maintenance/${id}/comment/`, { comment });
    return res.data;
  },

  async getStats(): Promise<{
    total: number;
    submitted: number;
    in_progress: number;
    resolved: number;
    emergency: number;
  }> {
    const res = await api.get('/api/maintenance/stats/');
    return res.data;
  },
};
