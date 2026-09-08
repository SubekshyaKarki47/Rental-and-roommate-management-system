import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  ClipboardList,
  MessageSquare,
  Wrench,
  Check,
  ArrowRight,
} from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  type: 'RENT' | 'APPLICATION' | 'MESSAGE' | 'MAINTENANCE';
  time: string;
  unread: boolean;
  actionTab: string;
  actionLabel: string;
}

interface NotificationsSubviewProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationsSubview: React.FC<NotificationsSubviewProps> = ({
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'Upcoming Rent Payment Due',
      description: 'Your monthly rent of Rs. 15,000 for Shantinagar 2BHK is due in 5 days (Sep 15). Pay early via eSewa or Khalti.',
      type: 'RENT',
      time: '2 hours ago',
      unread: true,
      actionTab: 'rentals',
      actionLabel: 'Pay Rent Now',
    },
    {
      id: 2,
      title: 'Application Status Update',
      description: 'Landlord Suresh Shrestha is reviewing your rental application for Green Valley Apartment.',
      type: 'APPLICATION',
      time: '5 hours ago',
      unread: true,
      actionTab: 'applications',
      actionLabel: 'View Application',
    },
    {
      id: 3,
      title: 'New Message from Roommate Match',
      description: 'Aarav Sharma sent you a message: "Hey! Are you still interested in the room in Baneshwor?"',
      type: 'MESSAGE',
      time: 'Yesterday',
      unread: false,
      actionTab: 'messages',
      actionLabel: 'Open Chat',
    },
    {
      id: 4,
      title: 'Maintenance Ticket Resolved',
      description: 'Your maintenance request #104 (Kitchen sink pipe repair) has been marked resolved by your landlord.',
      type: 'MAINTENANCE',
      time: '2 days ago',
      unread: false,
      actionTab: 'maintenance',
      actionLabel: 'View Ticket',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleReadStatus = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return n.unread;
    return true;
  });

  return (
    <div className="tenant-subview-wrapper">
      <div className="tenant-subview-header">
        <div>
          <h2 className="tenant-subview-title">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Notifications Center</span>
          </h2>
          <p className="tenant-subview-subtitle">
            Stay informed about your rent schedules, application updates, and roommate inquiries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="tenant-subview-tabs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`tenant-subview-tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('UNREAD')}
              className={`tenant-subview-tab-btn ${activeFilter === 'UNREAD' ? 'active' : ''}`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-blue-500" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="tenant-content-card text-center py-16">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">You're all caught up!</h4>
          <p className="text-xs text-slate-400 mt-1">
            No unread notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item-card ${notif.unread ? 'unread' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.type === 'RENT'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                    : notif.type === 'APPLICATION'
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                    : notif.type === 'MESSAGE'
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                }`}
              >
                {notif.type === 'RENT' && <CreditCard className="w-5 h-5" />}
                {notif.type === 'APPLICATION' && <ClipboardList className="w-5 h-5" />}
                {notif.type === 'MESSAGE' && <MessageSquare className="w-5 h-5" />}
                {notif.type === 'MAINTENANCE' && <Wrench className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {notif.description}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => onNavigateTab(notif.actionTab)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{notif.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  <button
                    onClick={() => toggleReadStatus(notif.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {notif.unread ? 'Mark as read' : 'Mark as unread'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
