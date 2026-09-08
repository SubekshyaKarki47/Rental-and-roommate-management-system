import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService, type NotificationItem } from '../services/notificationService';

export const NotificationDropdown: React.FC<{ onNavigate?: (url: string) => void }> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.results || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {notifications.length === 0 ? (
              <p className="text-center py-6 text-slate-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.action_url) onNavigate?.(n.action_url);
                    setIsOpen(false);
                  }}
                  className={`py-3 px-2 rounded-xl transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !n.is_read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
