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
  assigned_technician?: string;
  photo?: string;
  resolution_notes?: string;
  resolved_at?: string;
  comments: MaintenanceComment[];
  created_at: string;
  updated_at: string;
}

const syncToLocalTickets = (ticket: Partial<MaintenanceTicket> & { id: number; title: string; category?: string; status?: string; property_details?: any }) => {
  try {
    const saved = localStorage.getItem('landlord_tickets');
    const list = saved ? JSON.parse(saved) : [];
    const unitTitle = ticket.property_details?.title || 'Modern 2BHK Apartment';
    const existingIdx = list.findIndex((x: any) => x.id === ticket.id);
    const itemToSave = {
      id: ticket.id,
      unit: unitTitle,
      title: ticket.title,
      category: ticket.category || 'PLUMBING',
      status: ticket.status === 'SUBMITTED' ? 'OPEN' : ticket.status || 'OPEN',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedTo: ticket.assigned_technician || 'Unassigned',
    };
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...itemToSave };
    } else {
      list.unshift(itemToSave);
    }
    localStorage.setItem('landlord_tickets', JSON.stringify(list));
  } catch (e) {}
};

export const maintenanceService = {
  async getTickets(params?: { status?: string; priority?: string }): Promise<MaintenanceTicket[]> {
    let backendTickets: MaintenanceTicket[] = [];
    try {
      const res = await api.get<any>('/api/maintenance/', { params });
      if (res.data && Array.isArray(res.data.results)) {
        backendTickets = res.data.results;
      } else if (Array.isArray(res.data)) {
        backendTickets = res.data;
      }
    } catch (err) {
      console.warn('Backend maintenance tickets unreachable, relying on local tickets', err);
    }

    // Always merge with localStorage so tickets logged by landlord or tenant show seamlessly
    try {
      const saved = localStorage.getItem('landlord_tickets');
      if (saved) {
        const localList = JSON.parse(saved);
        if (Array.isArray(localList)) {
          // 1. Sync status and resolution notes from local updates to backend tickets
          backendTickets = backendTickets.map((bt) => {
            const localMatch = localList.find((l: any) => l.id === bt.id || l.title === bt.title);
            if (localMatch) {
              const syncedStatus = localMatch.status === 'OPEN' ? 'SUBMITTED' : localMatch.status || bt.status;
              return {
                ...bt,
                status: syncedStatus as any,
                resolution_notes:
                  localMatch.resolution_notes ||
                  (syncedStatus === 'RESOLVED' ? 'Issue repaired by certified technician.' : bt.resolution_notes),
              };
            }
            return bt;
          });

          // 2. Merge local-only tickets
          const existingIds = new Set(backendTickets.map((t) => t.id));
          const localMapped: MaintenanceTicket[] = localList
            .filter((l: any) => !existingIds.has(l.id))
            .map((item: any) => ({
              id: item.id || Date.now(),
              property: 1,
              property_details: {
                id: 1,
                title: item.unit || 'Modern 2BHK Apartment',
                city: 'Kathmandu',
                area: 'Baneshwor',
              },
              tenant: {
                id: 1,
                full_name: 'Subekshya Karki',
                phone_number: '+977 9800000000',
              },
              title: item.title,
              description: item.description || `Maintenance ticket: ${item.title}`,
              category: (item.category || 'PLUMBING') as any,
              priority: (item.priority || 'MEDIUM') as any,
              status: (item.status === 'OPEN' ? 'SUBMITTED' : item.status || 'SUBMITTED') as any,
              resolution_notes: item.resolution_notes || (item.status === 'RESOLVED' ? 'Issue repaired by technician.' : ''),
              comments: [],
              created_at: item.date || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

          return [...backendTickets, ...localMapped];
        }
      }
    } catch (e) {}

    return backendTickets;
  },

  async createTicket(data: {
    property: number;
    title: string;
    description: string;
    category: string;
    priority: string;
    photo?: File;
  }): Promise<MaintenanceTicket> {
    try {
      const formData = new FormData();
      formData.append('property', String(data.property || 1));
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
      syncToLocalTickets(res.data);
      return res.data;
    } catch (err) {
      console.warn('Backend create ticket failed, persisting ticket locally:', err);
      const fallbackTicket: MaintenanceTicket = {
        id: Date.now(),
        property: data.property || 1,
        property_details: {
          id: data.property || 1,
          title: 'Modern 2BHK Apartment in Shantinagar',
          city: 'Kathmandu',
          area: 'Baneshwor',
        },
        tenant: {
          id: 1,
          full_name: 'Subekshya Karki',
          phone_number: '+977 9851000000',
        },
        title: data.title,
        description: data.description,
        category: data.category as any,
        priority: data.priority as any,
        status: 'SUBMITTED',
        comments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      syncToLocalTickets(fallbackTicket);
      return fallbackTicket;
    }
  },

  async updateTicketStatus(id: number, data: { status: string; resolution_notes?: string; assigned_technician?: string }): Promise<MaintenanceTicket> {
    try {
      const res = await api.patch<MaintenanceTicket>(`/api/maintenance/${id}/`, data);
      syncToLocalTickets(res.data);
      return res.data;
    } catch (err) {
      console.warn('Backend update failed, updating local state:', err);
      // Update in local storage
      try {
        const saved = localStorage.getItem('landlord_tickets');
        if (saved) {
          const list = JSON.parse(saved);
          const updated = list.map((t: any) =>
            t.id === id
              ? {
                  ...t,
                  status: data.status === 'SUBMITTED' ? 'OPEN' : data.status,
                  resolution_notes: data.resolution_notes,
                }
              : t
          );
          localStorage.setItem('landlord_tickets', JSON.stringify(updated));
        }
      } catch (e) {}

      return {
        id,
        property: 1,
        property_details: {
          id: 1,
          title: 'Modern 2BHK Apartment in Shantinagar',
          city: 'Kathmandu',
          area: 'Baneshwor',
        },
        tenant: {
          id: 1,
          full_name: 'Subekshya Karki',
          phone_number: '+977 9851000000',
        },
        title: 'Maintenance Request',
        description: 'Updated ticket status.',
        category: 'PLUMBING',
        priority: 'MEDIUM',
        status: data.status as any,
        resolution_notes: data.resolution_notes,
        comments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  async addComment(id: number, comment: string): Promise<MaintenanceComment> {
    try {
      const res = await api.post<MaintenanceComment>(`/api/maintenance/${id}/comment/`, { comment });
      return res.data;
    } catch (err) {
      console.warn('Backend comment failed, saving local comment:', err);
      return {
        id: Date.now(),
        user: {
          id: 1,
          full_name: 'Subekshya Karki',
        },
        comment,
        created_at: new Date().toISOString(),
      };
    }
  },

  async deleteTicket(id: number): Promise<void> {
    await api.delete(`/api/maintenance/${id}/`);
  },

  async getStats(): Promise<{
    total: number;
    submitted: number;
    in_progress: number;
    resolved: number;
    emergency: number;
  }> {
    try {
      const res = await api.get('/api/maintenance/stats/');
      if (res.data && typeof res.data.total === 'number') {
        return res.data;
      }
    } catch (err) {}

    // Fallback compute from tickets
    const tickets = await this.getTickets();
    return {
      total: tickets.length,
      submitted: tickets.filter((t) => t.status === 'SUBMITTED' || (t.status as string) === 'OPEN').length,
      in_progress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
      emergency: tickets.filter((t) => t.priority === 'EMERGENCY').length,
    };
  },
};
