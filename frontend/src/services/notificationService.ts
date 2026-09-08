import { api } from './api';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  async getNotifications(): Promise<{ unread_count: number; results: NotificationItem[] }> {
    const res = await api.get('/api/notifications/');
    return res.data;
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/api/notifications/${id}/read/`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/api/notifications/mark-all-read/');
  },
};
