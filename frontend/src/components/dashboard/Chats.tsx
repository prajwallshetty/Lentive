'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { MessageSquare, RefreshCw, Check, X, Send } from 'lucide-react';

interface ChatsProps {
  chatRecipientId?: string | null;
  onClearChatRecipient?: () => void;
}

export default function Chats({ chatRecipientId, onClearChatRecipient }: ChatsProps) {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [chatsLoading, setChatsLoading] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [mobileShowHistory, setMobileShowHistory] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRecipientId) {
      setMobileShowHistory(true);
    }
  }, [chatRecipientId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const loadChatThreads = async () => {
    if (!user) return;
    setChatsLoading(true);
    try {
      const threadsRes = await api.chats.getAll();
      const threadsList = threadsRes.chats || threadsRes.data || [];
      setChatThreads(threadsList);
      
      let targetRecipientId = chatRecipientId;
      if (!targetRecipientId && !activeChatThreadId && threadsList.length > 0) {
        const firstRecipient = threadsList[0].participants.find((p: any) => p._id !== user.id && p._id !== user._id);
        if (firstRecipient) {
          targetRecipientId = firstRecipient._id;
        }
      }

      if (targetRecipientId) {
        setActiveChatThreadId(targetRecipientId);
        try {
          const historyRes = await api.chats.getHistory(targetRecipientId);
          setChatMessages(historyRes.messages || historyRes.data?.messages || []);
        } catch {
          setChatMessages([]);
        }
      }
    } catch (err) {
      console.error('Error loading chat threads:', err);
    } finally {
      setChatsLoading(false);
    }
  };

  useEffect(() => {
    loadChatThreads();
  }, [chatRecipientId, user]);

  const handleSelectThread = async (recipientId: string) => {
    setActiveChatThreadId(recipientId);
    setChatMessages([]);
    try {
      const historyRes = await api.chats.getHistory(recipientId);
      setChatMessages(historyRes.messages || historyRes.data?.messages || []);
      if (onClearChatRecipient) onClearChatRecipient();
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatThreadId) return;
    setSendingMessage(true);
    try {
      const res = await api.chats.sendMessage(activeChatThreadId, newMessage.trim());
      setNewMessage('');
      if (res.success) {
        const historyRes = await api.chats.getHistory(activeChatThreadId);
        setChatMessages(historyRes.messages || historyRes.data?.messages || []);
        const threadsRes = await api.chats.getAll();
        setChatThreads(threadsRes.chats || threadsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden h-[600px] shadow-lg flex flex-col md:flex-row animate-in fade-in duration-300">
      
      {/* Thread List Sidebar */}
      <div className={`w-full md:w-80 border-r border-border/40 flex flex-col h-full bg-card/50 backdrop-blur-xs ${activeChatThreadId && mobileShowHistory ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="h-4.5 w-4.5 text-primary" />
            Messages
          </h3>
          <button 
            type="button" 
            onClick={loadChatThreads} 
            title="Refresh Inbox"
            className="p-1.5 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${chatsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/20 hide-scrollbar">
          {chatsLoading && chatThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <RefreshCw className="h-5 w-5 animate-spin text-primary mb-2" />
              <span className="text-[10px] font-bold">Loading chats...</span>
            </div>
          ) : chatThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
              <MessageSquare className="h-8 w-8 text-primary/30 mb-2" />
              <p className="text-xs font-bold text-foreground">No conversations yet</p>
              <p className="text-[10px] text-muted-foreground max-w-[160px] leading-relaxed mt-1">
                Start a chat by clicking "Message Owner" on any item detail modal.
              </p>
            </div>
          ) : (
            chatThreads.map((thread) => {
              if (!user) return null;
              const recipient = thread.participants.find((p: any) => p._id !== user.id && p._id !== user._id);
              if (!recipient) return null;
              const lastMsg = thread.messages && thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
              const isSelected = activeChatThreadId === recipient._id;
              
              // Count unread messages from this thread
              const unreadCount = thread.messages.filter((msg: any) => {
                const msgSenderId = msg.sender?._id || msg.sender;
                return msgSenderId !== user.id && msgSenderId !== user._id && !msg.isRead;
              }).length;

              return (
                <button
                  key={thread._id}
                  type="button"
                  onClick={() => {
                    handleSelectThread(recipient._id);
                    setMobileShowHistory(true);
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/5 border-l-4 border-l-primary' 
                      : 'hover:bg-muted/30 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={recipient.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-border/35"
                    />
                    {recipient.verificationStatus === 'approved' && (
                      <span className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border border-white dark:border-card">
                        <Check className="h-2 w-2" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground truncate">{recipient.name}</p>
                      {lastMsg && (
                        <span className="text-[8px] text-muted-foreground font-semibold">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 ${unreadCount > 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {lastMsg ? lastMsg.message : 'No messages yet'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="shrink-0 h-4.5 w-4.5 bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center rounded-full self-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat History Pane */}
      <div className={`flex-1 flex flex-col h-full bg-muted/5 ${!activeChatThreadId || !mobileShowHistory ? 'hidden md:flex' : 'flex'}`}>
        {activeChatThreadId ? (
          <>
            {/* Chat Pane Header */}
            {(() => {
              const activeThread = chatThreads.find(t => t.participants.some((p: any) => p._id === activeChatThreadId));
              const recipient = activeThread 
                ? activeThread.participants.find((p: any) => p._id === activeChatThreadId)
                : null;
              
              return (
                <div className="p-3.5 border-b border-border/40 bg-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Back Button (Mobile only) */}
                    <button
                      onClick={() => setMobileShowHistory(false)}
                      className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg md:hidden transition cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="relative">
                      <img
                        src={recipient?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover border border-border/35"
                      />
                      {recipient?.verificationStatus === 'approved' && (
                        <span className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border border-white dark:border-card">
                          <Check className="h-1.5 w-1.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground">{recipient?.name || 'Chat'}</h4>
                      <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        {recipient?.role === 'admin' ? 'Platform Admin' : 'Lentive Member'}
                        {recipient?.verificationStatus === 'approved' && (
                          <span className="text-[8px] bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 px-1 py-0.2 rounded-md font-bold uppercase tracking-wide">Verified</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <MessageSquare className="h-6 w-6 text-primary/30 mb-1.5" />
                  <p className="text-[11px] font-bold">Say hello!</p>
                  <p className="text-[9px] text-muted-foreground max-w-[180px] leading-relaxed mt-0.5">
                    Start the conversation about listing logistics, pick-up times, or rental details.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg: any, index: number) => {
                  if (!user) return null;
                  const msgSenderId = msg.sender?._id || msg.sender;
                  const isMe = msgSenderId === user.id || msgSenderId === user._id;
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-primary text-white border border-primary/20 rounded-tr-none'
                            : 'bg-card text-foreground border border-border/40 rounded-tl-none shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-[8px] text-muted-foreground font-semibold mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3.5 bg-card border-t border-border/40 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder-muted-foreground/60 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="px-4 py-2 bg-primary hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                {sendingMessage ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <MessageSquare className="h-10 w-10 text-primary/20 mb-3 animate-pulse" />
            <h4 className="font-extrabold text-sm text-foreground">Select a Conversation</h4>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mt-1">
              Select a conversation from the sidebar inbox to coordinate hyper-local pickup handovers or item inquiries.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
