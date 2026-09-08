import { api } from './api';

export interface Message {
  id: number;
  conversation: number;
  sender: {
    id: number;
    full_name: string;
    avatar?: string;
  };
  content: string;
  attachment?: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    avatar?: string;
    role: string;
  }>;
  property?: number;
  property_details?: {
    id: number;
    title: string;
    city: string;
    area: string;
    monthly_rent: number;
  };
  last_message?: {
    id: number;
    sender_id: number;
    sender_name: string;
    content: string;
    created_at: string;
  };
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get<Conversation[]>('/api/messages/conversations/');
    return res.data;
  },

  async startConversation(data: {
    recipient_id: number;
    message?: string;
    property_id?: number;
  }): Promise<Conversation> {
    const res = await api.post<Conversation>('/api/messages/conversations/start/', data);
    return res.data;
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const res = await api.get<Message[]>(`/api/messages/conversations/${conversationId}/messages/`);
    return res.data;
  },

  async sendMessage(conversationId: number, content: string): Promise<Message> {
    const res = await api.post<Message>(`/api/messages/conversations/${conversationId}/messages/`, { content });
    return res.data;
  },

  async getTotalUnread(): Promise<{ unread_count: number }> {
    const res = await api.get<{ unread_count: number }>('/api/messages/unread-count/');
    return res.data;
  },
};
