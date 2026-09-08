import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  propertyContext?: string;
}

interface ChatMessage {
  id: number;
  senderId: number | 'me';
  senderName: string;
  content: string;
  time: string;
  isMe: boolean;
}

interface MessagesInboxSubviewProps {
  initialRecipientId?: number;
}

export const MessagesInboxSubview: React.FC<MessagesInboxSubviewProps> = ({
  initialRecipientId,
}) => {
  const { user } = useAuth();
  const currentUserName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || 'You';
  const contacts: Contact[] = [
    {
      id: 1,
      name: 'Aarav Sharma',
      role: 'Roommate Candidate',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      online: true,
      unreadCount: 1,
      lastMessage: 'Hey! Are you still interested in the room in Baneshwor?',
      lastTime: '10:24 AM',
      propertyContext: 'Looking for 2BHK roommate in Baneshwor',
    },
    {
      id: 2,
      name: 'Priya Shrestha',
      role: 'Roommate Candidate',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      online: false,
      unreadCount: 0,
      lastMessage: "Sure! Let's discuss tomorrow evening after work.",
      lastTime: 'Yesterday',
      propertyContext: 'Sanepa Shared Apartment',
    },
    {
      id: 3,
      name: 'Suresh Shrestha',
      role: 'Landlord (Verified)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      online: true,
      unreadCount: 1,
      lastMessage: 'Your application has been approved! Ready for contract signature.',
      lastTime: 'Sep 3',
      propertyContext: 'Modern 2BHK Apartment, Shantinagar',
    },
    {
      id: 4,
      name: 'Nisha Gurung',
      role: 'Tenant',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      online: false,
      unreadCount: 0,
      lastMessage: 'I found a great place in Thamel with a balcony.',
      lastTime: 'Sep 2',
      propertyContext: 'Thamel Studio flat inquiry',
    },
    {
      id: 5,
      name: 'Support Team',
      role: 'RoomMateHub Support',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      online: true,
      unreadCount: 1,
      lastMessage: 'Your maintenance ticket #104 status has been updated.',
      lastTime: 'Sep 1',
      propertyContext: 'Maintenance Helpdesk',
    },
  ];

  const [selectedContact, setSelectedContact] = useState<Contact>(() => {
    if (initialRecipientId) {
      return contacts.find((c) => c.id === initialRecipientId) || contacts[0];
    }
    return contacts[0];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');

  // Per-contact mock message history
  const [messagesMap, setMessagesMap] = useState<Record<number, ChatMessage[]>>({
    1: [
      {
        id: 1,
        senderId: 1,
        senderName: 'Aarav Sharma',
        content: 'Hi! I saw your roommate profile and notice we both work in tech and have matching sleep hours.',
        time: '10:15 AM',
        isMe: false,
      },
      {
        id: 2,
        senderId: 'me',
        senderName: currentUserName,
        content: 'Hi Aarav! Yes, I saw your profile too. I am looking for a 2BHK flat around Baneshwor with reliable internet.',
        time: '10:20 AM',
        isMe: true,
      },
      {
        id: 3,
        senderId: 1,
        senderName: 'Aarav Sharma',
        content: 'Hey! Are you still interested in the room in Baneshwor? We could schedule a visit this Saturday.',
        time: '10:24 AM',
        isMe: false,
      },
    ],
    2: [
      {
        id: 1,
        senderId: 2,
        senderName: 'Priya Shrestha',
        content: 'Hello! I noticed you are looking for a place near Sanepa.',
        time: 'Yesterday',
        isMe: false,
      },
      {
        id: 2,
        senderId: 'me',
        senderName: currentUserName,
        content: 'Hi Priya, yes! Does the apartment have uninterrupted 24h water?',
        time: 'Yesterday',
        isMe: true,
      },
      {
        id: 3,
        senderId: 2,
        senderName: 'Priya Shrestha',
        content: "Sure! Let's discuss tomorrow evening after work.",
        time: 'Yesterday',
        isMe: false,
      },
    ],
    3: [
      {
        id: 1,
        senderId: 3,
        senderName: 'Suresh Shrestha',
        content: 'Namaste, thank you for applying to the Shantinagar 2BHK apartment.',
        time: 'Sep 2',
        isMe: false,
      },
      {
        id: 2,
        senderId: 3,
        senderName: 'Suresh Shrestha',
        content: 'Your application has been approved! Ready for contract signature.',
        time: 'Sep 3',
        isMe: false,
      },
    ],
    4: [
      {
        id: 1,
        senderId: 4,
        senderName: 'Nisha Gurung',
        content: 'I found a great place in Thamel with a balcony.',
        time: 'Sep 2',
        isMe: false,
      },
    ],
    5: [
      {
        id: 1,
        senderId: 5,
        senderName: 'Support Team',
        content: 'Your maintenance ticket #104 status has been updated.',
        time: 'Sep 1',
        isMe: false,
      },
    ],
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedContact, messagesMap]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now(),
      senderId: 'me',
      senderName: currentUserName,
      content: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));

    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentMessages = messagesMap[selectedContact.id] || [];

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tenant-subview-wrapper">
      <div className="tenant-subview-header">
        <div>
          <h2 className="tenant-subview-title">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span>Messages & Chat Center</span>
          </h2>
          <p className="tenant-subview-subtitle">
            Chat in real-time with verified landlords, roommates, and the RoomMateHub support desk
          </p>
        </div>
      </div>

      {/* Two-Column Inbox Box */}
      <div className="messages-inbox-wrapper shadow-sm">
        {/* Left Column: Conversations List */}
        <div className="inbox-sidebar">
          <div className="inbox-search-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="inbox-list">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`inbox-item ${selectedContact.id === contact.id ? 'active' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {contact.name}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {contact.lastTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {contact.lastMessage}
                  </p>
                </div>

                {contact.unreadCount > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {contact.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Chat Active Thread */}
        <div className="inbox-chat-pane">
          {/* Active Contact Header */}
          <div className="inbox-chat-header">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                {selectedContact.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{selectedContact.name}</span>
                  {selectedContact.role.includes('Landlord') && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {selectedContact.online ? '🟢 Active now' : 'Offline'} • {selectedContact.role}
                </p>
              </div>
            </div>

            {selectedContact.propertyContext && (
              <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
                📌 {selectedContact.propertyContext}
              </div>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div ref={chatContainerRef} className="inbox-chat-messages">
            <div className="text-center my-2">
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-medium">
                🔒 End-to-end encrypted chat via RoomMateHub
              </span>
            </div>

            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.isMe ? 'sent' : 'received'}`}
              >
                <div
                  className={`chat-bubble ${
                    msg.isMe ? 'chat-bubble-sent' : 'chat-bubble-received'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div
                    className={`flex items-center gap-1 text-[9px] mt-1 ${
                      msg.isMe ? 'text-blue-100 justify-end' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {msg.isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="inbox-chat-input-bar">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Attach photo or document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={`Message ${selectedContact.name}... (Press Enter to send)`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
