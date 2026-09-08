import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { messageService, type Conversation, type Message } from '../../services/messageService';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipientId?: number;
  initialPropertyId?: number;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  initialRecipientId,
  initialPropertyId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialRecipientId && conversations.length > 0) {
      const match = conversations.find((c) =>
        c.participants.some((p) => p.id === initialRecipientId)
      );
      if (match) {
        selectConversation(match);
      } else {
        // Start conversation
        startNewConversation(initialRecipientId, initialPropertyId);
      }
    }
  }, [initialRecipientId, conversations]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        selectConversation(data[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const startNewConversation = async (recipientId: number, propId?: number) => {
    try {
      const conv = await messageService.startConversation({
        recipient_id: recipientId,
        property_id: propId,
      });
      setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
      selectConversation(conv);
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setLoadingMessages(true);
    try {
      const msgs = await messageService.getMessages(conv.id);
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const msg = await messageService.sendMessage(activeConv.id, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
      loadConversations();
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Conversation List */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" /> Messages
            </h3>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loadingConvs ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                <p className="text-xs">Loading chats...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 p-4">
                <p className="text-xs">No active conversations. Reach out to a landlord or compatible roommate to begin chatting.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.participants?.[0];
                const isSelected = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 text-left transition flex items-start gap-3 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 ${
                      isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="relative">
                      {other?.avatar ? (
                        <img src={other.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">
                          {other?.first_name?.[0] || 'U'}
                        </div>
                      )}
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {other?.full_name || 'Conversation'}
                        </p>
                        {conv.last_message && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {conv.property_details && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block truncate">
                          Re: {conv.property_details.title}
                        </span>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {conv.last_message?.content || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Thread */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                    {activeConv.participants?.[0]?.first_name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {activeConv.participants?.[0]?.full_name || 'Chat'}
                    </h4>
                    {activeConv.property_details && (
                      <p className="text-[11px] text-slate-400">
                        {activeConv.property_details.title} • {activeConv.property_details.city}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {loadingMessages ? (
                  <div className="py-20 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <p className="text-xs">Loading thread...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-slate-400">
                    <p className="text-xs">Say hi! Start your conversation below.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender?.full_name === 'Anuj Dahal' || m.sender?.id === 2; // sample check or based on current user

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
