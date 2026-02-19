// ============================================================
// FILE 1: src/components/ChatWindow.tsx - SOSTITUISCI QUESTO
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { generateQuickReplies } from '../services/geminiService';
import { databaseService } from '@/src/services/database';
import { UserProfile, StructureProfile, Message } from '@/types';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const msgs = await databaseService.getConversationMessages(conversationId, 50);
      setMessages(msgs);
      await databaseService.markMessagesAsRead(conversationId, currentUserId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      const message = await databaseService.sendMessage(
        currentUserId,
        participant.userId,
        text.trim()
      );

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setQuickReplies([]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Errore nell\'invio del messaggio. Riprova.');
    }
  };

  const handleGenerateReplies = async () => {
    const lastReceivedMessage = messages
      .filter(m => m.senderId !== currentUserId)
      .pop();
    
    if (!lastReceivedMessage) return;

    setIsGenerating(true);
    try {
      const replies = await generateQuickReplies(lastReceivedMessage.content);
      setQuickReplies(replies);
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

  const getParticipantName = () => {
    if (participant.userType === 'professional') {
      return `${participant.firstName} ${participant.lastName}`;
    }
    return participant.structureName;
  };

  const getParticipantSubtitle = () => {
    if (participant.userType === 'professional') {
      return participant.bio?.substring(0, 50) || 'Professionista';
    }
    return participant.structureType;
  };

  const getParticipantAvatar = () => {
    if (participant.userType === 'professional') {
      return participant.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(getParticipantName());
    }
    return participant.logo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(participant.structureName);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center p-3 border-b border-slate-200 bg-white">
        <button 
          onClick={onBack} 
          className="md:hidden mr-2 p-1 text-slate-500 hover:bg-slate-100 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div 
          className="flex items-center cursor-pointer hover:bg-slate-50 rounded-lg p-2 -ml-2 transition-colors"
          onClick={() => onProfileClick?.(participant.userId)}
        >
          <img 
            src={getParticipantAvatar()} 
            alt={getParticipantName()} 
            className="w-10 h-10 rounded-full object-cover mr-3" 
          />
          <div>
            <p className="font-bold text-slate-800">{getParticipantName()}</p>
            <p className="text-sm text-slate-500">{getParticipantSubtitle()}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Icon type="mail" className="w-16 h-16 mb-4" />
            <p>Nessun messaggio ancora</p>
            <p className="text-sm">Inizia la conversazione!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.$id} 
              className={`flex items-end gap-2 mb-4 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              {msg.senderId !== currentUserId && (
                <img 
                  src={getParticipantAvatar()} 
                  className="w-8 h-8 rounded-full object-cover" 
                  alt={getParticipantName()}
                />
              )}
              
              <div 
                className={`rounded-2xl px-4 py-2 max-w-sm ${
                  msg.senderId === currentUserId 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <div className="flex justify-end items-center gap-1 mt-1">
                  <span className={`text-xs ${msg.senderId === currentUserId ? 'text-blue-100' : 'text-slate-400'}`}>
                    {formatTimestamp(msg.sentAt)}
                  </span>
                  {msg.senderId === currentUserId && (
                    <Icon 
                      type="check-double" 
                      className={`w-4 h-4 ${msg.isRead ? 'text-blue-200' : 'text-blue-300'}`} 
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        {quickReplies.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {quickReplies.map((reply, i) => (
              <button 
                key={i} 
                onClick={() => handleSendMessage(reply)} 
                className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGenerateReplies} 
            disabled={isGenerating || messages.filter(m => m.senderId !== currentUserId).length === 0}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Genera risposte rapide con AI"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : (
              <Icon type="sparkles" className="w-6 h-6" />
            )}
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(newMessage);
              }
            }}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-slate-100 border-slate-200 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          
          <button 
            onClick={() => handleSendMessage(newMessage)}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon type="send" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
