import React, { useState, useEffect, useRef } from 'react';
import { databaseService } from '../src/services/database';
import type { UserProfile, StructureProfile, Message } from '../types';
import { Icon } from './Icon';

interface ChatWindowProps {
  currentUserId: string;
  participant: UserProfile | StructureProfile;
  conversationId: string;
  onBack: () => void;
  onProfileClick?: (userId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  currentUserId, 
  participant,
  conversationId,
  onBack,
  onProfileClick 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, quickReplies]);

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const msgs = await databaseService.getConversationMessages(conversationId, 50);
        
        if (isMounted) {
          setMessages(msgs);
          databaseService.markMessagesAsRead(conversationId, currentUserId).catch(console.error);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [conversationId, currentUserId]);

  const handleSendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    try {
      setIsSending(true);
      const message = await databaseService.sendMessage(
        currentUserId,
        participant.userId,
        trimmedText
      );

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setQuickReplies([]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert("Errore nell'invio del messaggio. Riprova.");
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateReplies = async () => {
    const lastReceivedMessage = messages
      .filter(m => m.senderId !== currentUserId)
      .pop();
    
    if (!lastReceivedMessage || isGenerating) return;

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const fallbackReplies = ["Ottimo, grazie!", "Certamente.", "Ti faccio sapere presto."];
      setQuickReplies(fallbackReplies);
    } catch (error) {
      console.error('Error generating replies:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getParticipantName = (): string => {
    if (participant.userType === 'professional') {
      return `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Utente';
    }
    return participant.structureName || 'Struttura';
  };

  const getParticipantSubtitle = (): string => {
    if (participant.userType === 'professional') {
      return participant.bio ? `${participant.bio.substring(0, 45)}...` : 'Professionista';
    }
    return participant.structureType || 'Piscina';
  };

  const getParticipantAvatar = (): string => {
    const name = getParticipantName();
    if (participant.userType === 'professional' && participant.avatar) return participant.avatar;
    if (participant.userType === 'structure' && participant.logo) return participant.logo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=1d4ed8`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      {/* Header della Chat */}
      <div className="flex items-center p-3 sm:p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <button 
          onClick={onBack} 
          className="md:hidden mr-3 p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Torna indietro"
        >
          <Icon type="x" className="w-6 h-6" />
        </button>
        
        <div 
          className="flex items-center cursor-pointer hover:bg-slate-50 rounded-xl p-2 -ml-2 transition-colors flex-1"
          onClick={() => onProfileClick?.(participant.userId)}
        >
          <img 
            src={getParticipantAvatar()} 
            alt={getParticipantName()} 
            className="w-12 h-12 rounded-full object-cover mr-3 border border-slate-100 shadow-sm" 
          />
          <div>
            <p className="font-bold text-slate-800 leading-tight">{getParticipantName()}</p>
            <p className="text-xs sm:text-sm text-slate-500 truncate max-w-[200px] sm:max-w-md">
              {getParticipantSubtitle()}
            </p>
          </div>
        </div>
      </div>

      {/* Area Messaggi */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-80">
            <Icon type="chat-bubble" className="w-16 h-16 mb-4 text-slate-300" />
            <p className="font-medium text-slate-600">Nessun messaggio</p>
            <p className="text-sm mt-1">Scrivi il primo messaggio per iniziare!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUserId;
              const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1].senderId === currentUserId);
              
              return (
                <div key={msg.$id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <img 
                          src={getParticipantAvatar()} 
                          className="w-8 h-8 rounded-full object-cover shadow-sm" 
                          alt="Avatar"
                        />
                      )}
                    </div>
                  )}
                  
                  <div 
                    className={`relative group rounded-2xl px-4 py-2.5 max-w-[75%] sm:max-w-md shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-[15px] break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <div className={`flex justify-end items-center gap-1 mt-1 text-[11px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      <span>{formatTimestamp(msg.sentAt)}</span>
                      {isMe && (
                        <Icon 
                          type="check-double" 
                          className={`w-3.5 h-3.5 ${msg.isRead ? 'text-white' : 'text-blue-300'}`} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Ancora invisibile per lo scroll */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        {quickReplies.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar hide-scrollbar-mobile">
            {quickReplies.map((reply, i) => (
              <button 
                key={i} 
                onClick={() => handleSendMessage(reply)} 
                disabled={isSending}
                className="whitespace-nowrap bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-blue-100 hover:border-blue-200 transition-all disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-1.5 sm:p-2 rounded-full border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <button 
            onClick={handleGenerateReplies} 
            disabled={isGenerating || messages.filter(m => m.senderId !== currentUserId).length === 0}
            className="p-2 sm:p-2.5 text-blue-600 hover:bg-blue-100 rounded-full disabled:text-slate-400 disabled:hover:bg-transparent transition-colors group"
            title="Suggerisci risposte con AI"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Icon type="sparkles" className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(newMessage);
              }
            }}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-slate-800 placeholder-slate-400"
            disabled={isSending}
          />
          
          <button 
            onClick={() => handleSendMessage(newMessage)}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-600 text-white rounded-full p-2.5 sm:p-3 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            {isSending ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Icon type="send" className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};