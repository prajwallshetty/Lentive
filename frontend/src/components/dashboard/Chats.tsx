'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { MessageSquare, RefreshCw, Check, ChevronLeft } from 'lucide-react';

interface ChatsProps {
  chatRecipientId?: string | null;
  listingId?: string | null;
  onClearChatRecipient?: () => void;
}

export default function Chats({ chatRecipientId, listingId, onClearChatRecipient }: ChatsProps) {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [activeListing, setActiveListing] = useState<any | null>(null);
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
      let targetListingId = listingId;
      
      // If we don't have recipientId from query parameter, but we have activeChatThreadId
      if (!targetRecipientId && activeChatThreadId) {
        const activeThread = threadsList.find((t: any) => t._id === activeChatThreadId);
        if (activeThread) {
          const rec = activeThread.participants.find((p: any) => p._id !== user.id && p._id !== user._id);
          if (rec) {
            targetRecipientId = rec._id;
            targetListingId = activeThread.listing?._id || activeThread.listing;
          }
        }
      }

      // If we still don't have targetRecipientId, default to the first thread
      if (!targetRecipientId && threadsList.length > 0) {
        const firstThread = threadsList[0];
        const firstRecipient = firstThread.participants.find((p: any) => p._id !== user.id && p._id !== user._id);
        if (firstRecipient) {
          targetRecipientId = firstRecipient._id;
          targetListingId = firstThread.listing?._id || firstThread.listing;
          setActiveChatThreadId(firstThread._id);
        }
      }

      // Load active chat details
      if (targetRecipientId) {
        const existingThread = threadsList.find((t: any) => {
          const rec = t.participants.find((p: any) => p._id !== user.id && p._id !== user._id);
          const tListingId = t.listing?._id || t.listing;
          return rec?._id === targetRecipientId && (!targetListingId || tListingId === targetListingId);
        });

        if (existingThread) {
          setActiveChatThreadId(existingThread._id);
        } else {
          setActiveChatThreadId(targetRecipientId); // Fallback to recipient ID as placeholder for new thread
        }

        try {
          const historyRes = await api.chats.getHistory(targetRecipientId, targetListingId || undefined);
          const chatObj = historyRes.chat || historyRes.data || historyRes;
          setActiveChat(chatObj);
          setChatMessages(chatObj.messages || []);
          setActiveListing(chatObj.listing || null);
        } catch {
          setActiveChat(null);
          setChatMessages([]);
          setActiveListing(null);
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
  }, [chatRecipientId, listingId, user]);

  const handleSelectThread = async (threadId: string, recipientId: string, threadListingId?: string) => {
    setActiveChatThreadId(threadId);
    setChatMessages([]);
    setActiveListing(null);
    setActiveChat(null);
    try {
      const historyRes = await api.chats.getHistory(recipientId, threadListingId);
      const chatObj = historyRes.chat || historyRes.data || historyRes;
      setActiveChat(chatObj);
      setChatMessages(chatObj.messages || []);
      setActiveListing(chatObj.listing || null);
      if (onClearChatRecipient) onClearChatRecipient();
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatThreadId) return;
    
    const recipient = activeChat?.participants?.find((p: any) => p._id !== user?.id && p._id !== user?._id);
    const recipientId = recipient?._id || (activeChatThreadId.length === 24 ? activeChatThreadId : '');
    
    if (!recipientId) return;

    setSendingMessage(true);
    try {
      const res = await api.chats.sendMessage(
        recipientId,
        newMessage.trim(),
        activeListing?._id || undefined
      );
      setNewMessage('');
      if (res.success) {
        const threadsRes = await api.chats.getAll();
        const updatedThreads = threadsRes.chats || threadsRes.data || [];
        setChatThreads(updatedThreads);

        const newActiveThread = updatedThreads.find((t: any) => {
          const rec = t.participants.find((p: any) => p._id !== user?.id && p._id !== user?._id);
          const tListingId = t.listing?._id || t.listing;
          return rec?._id === recipientId && (!activeListing?._id || tListingId === activeListing?._id);
        });

        if (newActiveThread) {
          setActiveChatThreadId(newActiveThread._id);
        }

        const historyRes = await api.chats.getHistory(recipientId, activeListing?._id || undefined);
        const chatObj = historyRes.chat || historyRes.data || historyRes;
        setActiveChat(chatObj);
        setChatMessages(chatObj.messages || []);
        setActiveListing(chatObj.listing || null);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Find active recipient details
  const activeRecipient = activeChat?.participants?.find((p: any) => p._id !== user?.id && p._id !== user?._id);

  return (
    <div className="rounded-[28px] border border-border/30 bg-card overflow-hidden h-[calc(100vh-280px)] min-h-[650px] max-h-[800px] shadow-xl flex flex-col md:flex-row animate-in fade-in duration-300">
      
      {/* Thread List Sidebar (Instagram style inbox) */}
      <div className={`w-full md:w-80 border-r border-border/20 flex flex-col h-full bg-card/60 backdrop-blur-md ${activeChatThreadId && mobileShowHistory ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Inbox header */}
        <div className="p-4 border-b border-border/10 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-primary" />
            Inbox
          </h3>
          <button 
            type="button" 
            onClick={loadChatThreads} 
            title="Refresh Inbox"
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition active:scale-90"
          >
            <RefreshCw className={`h-4 w-4 ${chatsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Thread items */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/5 hide-scrollbar">
          {chatsLoading && chatThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <RefreshCw className="h-5 w-5 animate-spin text-primary mb-2" />
              <span className="text-[10px] font-bold">Loading chats...</span>
            </div>
          ) : chatThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
              <MessageSquare className="h-10 w-10 text-primary/20 mb-3" />
              <p className="text-xs font-bold text-foreground">No conversations yet</p>
              <p className="text-[10px] text-muted-foreground max-w-[160px] leading-relaxed mt-1">
                Start a chat by clicking "Message Owner" on any item detail page.
              </p>
            </div>
          ) : (
            chatThreads.map((thread) => {
              if (!user) return null;
              const recipient = thread.participants.find((p: any) => p._id !== user.id && p._id !== user._id);
              if (!recipient) return null;
              const lastMsg = thread.messages && thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
              
              // Unique match checks
              const isSelected = activeChatThreadId === thread._id;
              
              // Count unread messages in this thread
              const unreadCount = thread.messages.filter((msg: any) => {
                const msgSenderId = msg.sender?._id || msg.sender;
                return msgSenderId !== user.id && msgSenderId !== user._id && !msg.isRead;
              }).length;

              const threadListing = thread.listing;

              return (
                <button
                  key={thread._id}
                  type="button"
                  onClick={() => {
                    handleSelectThread(thread._id, recipient._id, threadListing?._id || threadListing);
                    setMobileShowHistory(true);
                  }}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/[0.04] dark:bg-white/[0.02]' 
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={recipient.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                      alt=""
                      className={`h-11 w-11 rounded-full object-cover border-2 ${isSelected ? 'border-primary' : 'border-border/30'}`}
                    />
                    {recipient.verificationStatus === 'approved' && (
                      <span className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border border-white dark:border-card">
                        <Check className="h-2 w-2" />
                      </span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${unreadCount > 0 ? 'font-black text-foreground' : 'font-bold text-muted-foreground'}`}>{recipient.name}</p>
                      {lastMsg && (
                        <span className="text-[9px] text-muted-foreground/60 font-medium shrink-0 ml-1">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {/* Specific Item Reference Context */}
                    {threadListing && (
                      <p className="text-[10px] text-primary dark:text-[#34d399] font-black truncate leading-none mt-0.5 uppercase tracking-wide">
                        Re: {threadListing.title}
                      </p>
                    )}
                    <p className={`text-[11px] truncate mt-1 ${unreadCount > 0 ? 'font-black text-foreground' : 'text-muted-foreground/80'}`}>
                      {lastMsg ? lastMsg.message : 'No messages yet'}
                    </p>
                  </div>
                  
                  {/* Instagram-style blue unread dot indicator */}
                  {unreadCount > 0 && (
                    <span className="shrink-0 h-2.5 w-2.5 bg-primary dark:bg-[#34d399] rounded-full self-center ml-2 shadow-[0_0_8px_var(--primary)]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat History Pane (Instagram style chat window) */}
      <div className={`flex-1 flex flex-col h-full bg-muted/5 ${!activeChatThreadId || !mobileShowHistory ? 'hidden md:flex' : 'flex'}`}>
        {activeChatThreadId ? (
          <>
            {/* Chat Pane Header */}
            <div className="p-3 border-b border-border/10 bg-card/65 backdrop-blur-md flex items-center justify-between relative z-10 shadow-xs">
              <div className="flex items-center gap-3">
                
                {/* Back Button (Mobile only) */}
                <button
                  onClick={() => setMobileShowHistory(false)}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full md:hidden transition cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>

                <div className="relative">
                  <img
                    src={activeRecipient?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-border/30"
                  />
                  {activeRecipient?.verificationStatus === 'approved' && (
                    <span className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border border-white dark:border-card">
                      <Check className="h-1.5 w-1.5" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground leading-tight">{activeRecipient?.name || 'Chat'}</h4>
                  <p className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                    {activeRecipient?.role === 'admin' ? 'Platform Admin' : 'Lentive Member'}
                    {activeRecipient?.verificationStatus === 'approved' && (
                      <span className="text-[8px] bg-emerald-600/10 text-emerald-600 px-1 py-0.2 rounded-md font-bold uppercase">Verified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Listing context card */}
            {activeListing && (
              <div className="bg-[#f0fcf6] dark:bg-[#08130e] border-b border-border/10 px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeListing.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'}
                    alt={activeListing.title}
                    className="h-11 w-11 rounded-xl object-cover border border-border/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#006c49] dark:text-[#34d399] uppercase font-black tracking-wider leading-none">Rental item query</p>
                    <h5 className="font-extrabold text-xs text-foreground truncate mt-1 leading-tight">{activeListing.title}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                      {activeListing.pricePerDay ? `₹${activeListing.pricePerDay} / day` : 'Price not set'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/listing/${activeListing._id}`}
                  className="px-3.5 py-2 bg-white dark:bg-card border border-border/30 hover:bg-muted text-[10px] font-black rounded-xl text-foreground transition active:scale-95 shrink-0 shadow-xs cursor-pointer"
                >
                  View Details
                </Link>
              </div>
            )}

            {/* Chat Messages Viewport (Instagram style alignment) */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 hide-scrollbar bg-white/30 dark:bg-black/10">
              {chatMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                  <MessageSquare className="h-12 w-12 text-primary/10 mb-3 animate-pulse" />
                  <p className="text-xs font-bold text-foreground">Message this user</p>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed mt-1">
                    Ask about item condition, coordinates verification, or schedule pick-up times.
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
                      className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div
                        className={`px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-br from-[#006c49] via-[#008f60] to-[#10b981] text-white rounded-[20px] rounded-br-[4px]'
                            : 'bg-[#eef1ee] dark:bg-[#1a231f] text-foreground rounded-[20px] rounded-bl-[4px]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-[8px] text-muted-foreground/60 font-semibold mt-1 px-1.5">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input Box (Instagram capsule pill design) */}
            <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-border/10 flex items-center justify-between gap-3 relative z-10">
              <div className="flex-1 flex items-center bg-muted/40 dark:bg-black/10 border border-border/30 focus-within:border-primary/45 rounded-full px-4.5 py-3 transition duration-200">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="flex-grow bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-none pr-3"
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="text-primary dark:text-[#34d399] hover:brightness-110 disabled:opacity-30 font-black text-xs cursor-pointer active:scale-95 transition select-none pl-3 border-l border-border/20 uppercase tracking-wider"
                >
                  {sendingMessage ? 'Sending' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <MessageSquare className="h-12 w-12 text-primary/10 mb-3 animate-pulse" />
            <h4 className="font-extrabold text-sm text-foreground">Select a Chat</h4>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mt-1">
              Select an inbox contact from the sidebar to start coordinating hyper-local pickups or listings availability.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
