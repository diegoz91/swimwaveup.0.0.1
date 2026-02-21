import React, { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { ConversationListItem } from './ConversationListItem';
import { databaseService } from '../src/services/database'; 
import type { UserProfile, StructureProfile } from '../types';
import { Icon } from './Icon';

interface Conversation {
  conversationId: string;
  participant: UserProfile | StructureProfile;
  lastMessage: {
    content: string;
    sentAt: string;
    senderId: string;
  };
  unreadCount: number;
}

interface MessagesViewProps {
  currentUserId: string;
  startChatWithUserId?: string | null;
  onProfileClick?: (userId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ 
  currentUserId,
  startChatWithUserId,
  onProfileClick 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newChatParticipant, setNewChatParticipant] = useState<UserProfile | StructureProfile | null>(null);

  useEffect(() => {
    loadConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (startChatWithUserId && startChatWithUserId !== currentUserId) {
      startNewChat(startChatWithUserId);
    }
  }, [startChatWithUserId]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const convs = await databaseService.getMyConversations(currentUserId);
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Impossibile caricare le conversazioni. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async (userId: string) => {
    try {
      const conversationId = [currentUserId, userId].sort().join('_');
      
      const existingConv = conversations.find(c => c.conversationId === conversationId);
      
      if (existingConv) {
        setSelectedConversationId(conversationId);
      } else {
        let participant: UserProfile | StructureProfile;
        try {
          participant = await databaseService.getUserProfile(userId);
        } catch {
          participant = await databaseService.getStructureProfile(userId);
        }
        
        setNewChatParticipant(participant);
        setSelectedConversationId(conversationId);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      alert('Impossibile avviare la conversazione. Riprova.');
    }
  };

  const selectedConversation = conversations.find(
    c => c.conversationId === selectedConversationId
  );

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setNewChatParticipant(null);
    loadConversations();
  };

  const showList = !selectedConversationId;
  const chatParticipant = selectedConversation?.participant || newChatParticipant;

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8 md:mb-0">
      
      {/* Sidebar Lista Conversazioni */}
      <div className={`w-full md:w-[380px] flex-col bg-slate-50 border-r border-slate-200 ${showList ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-5 border-b border-slate-200 bg-white">
          <h2 className="text-2xl font-extrabold text-slate-800">Messaggi</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Icon type="info" className="w-8 h-8" />
              </div>
              <p className="text-slate-800 font-bold mb-1">Errore di caricamento</p>
              <p className="text-sm text-slate-500 mb-6">{error}</p>
              <button 
                onClick={loadConversations}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Riprova
              </button>
            </div>
          ) : conversations.length === 0 && !newChatParticipant ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
              <div className="bg-white p-6 rounded-full shadow-sm border border-slate-100 mb-4">
                <Icon type="chat-bubble" className="w-12 h-12 text-slate-300" />
              </div>
              <p className="font-bold text-slate-600 text-lg">La tua casella è vuota</p>
              <p className="text-sm mt-2 leading-relaxed">
                Le tue conversazioni appariranno qui. Visita il profilo di un collega o di una struttura per inviare il primo messaggio!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map(conv => (
                <ConversationListItem
                  key={conv.conversationId}
                  conversation={conv}
                  currentUserId={currentUserId}
                  isSelected={conv.conversationId === selectedConversationId}
                  onSelect={() => setSelectedConversationId(conv.conversationId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Area Chat Principale */}
      <div className={`flex-1 flex-col bg-white ${!showList ? 'flex' : 'hidden md:flex'}`}>
        {chatParticipant && selectedConversationId ? (
          <ChatWindow
            key={selectedConversationId}
            currentUserId={currentUserId}
            participant={chatParticipant}
            conversationId={selectedConversationId}
            onBack={handleBackToList}
            onProfileClick={onProfileClick}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
            <Icon type="mail" className="w-24 h-24 text-slate-200 mb-6" />
            <h3 className="text-2xl font-bold text-slate-600">I tuoi messaggi</h3>
            <p className="mt-2 font-medium">
              Seleziona una conversazione dalla lista per iniziare a chattare
            </p>
          </div>
        )}
      </div>

    </div>
  );
};