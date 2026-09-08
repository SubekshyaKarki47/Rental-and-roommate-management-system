import { api } from './api';

export interface RoommateCandidate {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  bio?: string;
  phone_number?: string;
  tenant_profile?: {
    id: number;
    occupation_status: string;
    university_or_company: string;
    min_budget: number;
    max_budget: number;
    preferred_locations: string[];
    lifestyle_type: string;
    cleanliness_level: string;
    sleep_schedule: string;
    pets_allowed: boolean;
    smoking_preference: boolean;
    bedrooms_preferred: number;
    furnishing_preference: string;
    bio: string;
    age_range?: string;
    preferred_move_in_date?: string;
  };
  compatibility: {
    score: number;
    summary: string;
    breakdown: Record<string, {
      score: number;
      max: number;
      label: string;
      description: string;
      a_value?: any;
      b_value?: any;
      is_synergy?: boolean;
    }>;
  };
  connection_status: 'CONNECTED' | 'SENT_PENDING' | 'RECEIVED_PENDING' | null;
}

export interface RoommateMatchRecord {
  id: number;
  requester: any;
  target_user: any;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  compatibility_score: number;
  match_notes: any;
  created_at: string;
}

export const roommateService = {
  async discoverRoommates(params?: {
    lifestyle?: string;
    cleanliness?: string;
    sleep?: string;
    pets?: boolean;
    smoking?: boolean;
    location?: string;
    min_score?: number;
  }): Promise<RoommateCandidate[]> {
    const res = await api.get<RoommateCandidate[]>('/api/roommates/discover/', { params });
    return Array.isArray(res.data) ? res.data : (res.data as any)?.results || [];
  },

  async sendRequest(targetUserId: number): Promise<{ detail: string; status: string; match: RoommateMatchRecord }> {
    const res = await api.post('/api/roommates/request/', { target_user_id: targetUserId });
    return res.data;
  },

  async respondToRequest(matchId: number, status: 'ACCEPTED' | 'DECLINED' | 'BLOCKED'): Promise<any> {
    const res = await api.patch(`/api/roommates/respond/${matchId}/`, { status });
    return res.data;
  },

  async getConnections(): Promise<{
    connections: RoommateMatchRecord[];
    pending_received: RoommateMatchRecord[];
    pending_sent: RoommateMatchRecord[];
  }> {
    const res = await api.get('/api/roommates/connections/');
    return res.data;
  },

  async getCompatibilityDetail(targetUserId: number): Promise<any> {
    const res = await api.get(`/api/roommates/${targetUserId}/compatibility/`);
    return res.data;
  },
};
