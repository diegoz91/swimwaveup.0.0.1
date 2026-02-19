// ============================================================
// FILE 3: src/components/MessagesView.tsx - VERIFICA IMPORT PATH
// ============================================================

import React, { useState, useEffect } from 'react';
import { ChatWindow } from './ChatWindow';
import { ConversationListItem } from './ConversationListItem';
import { databaseService } from '@/src/services/database';
import { UserProfile, StructureProfile } from '@/types';
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
      console.log('🔍 Starting new chat with userId:', startChatWithUserId);
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
      console.log('🔍 Creating conversation ID...');
      const conversationId = [currentUserId, userId].sort().join('_');
      console.log('🔍 Conversation ID:', conversationId);
      
      const existingConv = conversations.find(c => c.conversationId === conversationId);
      
      if (existingConv) {
        console.log('✅ Conversation exists, opening...');
        setSelectedConversationId(conversationId);
      } else {
        console.log('🔍 Loading participant profile...');
        let participant: UserProfile | StructureProfile;
        try {
          participant = await databaseService.getUserProfile(userId);
          console.log('✅ User profile loaded:', participant);
        } catch {
          participant = await databaseService.getStructureProfile(userId);
          console.log('✅ Structure profile loaded:', participant);
        }
        
        setNewChatParticipant(participant);
        setSelectedConversationId(conversationId);
        console.log('✅ New chat opened!');
      }
    } catch (error) {
      console.error('❌ Error starting new chat:', error);
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
    <div className="flex h-[calc(100vh-128px)] md:h-[calc(100vh-128px)] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
      <div className={`w-full md:w-1/3 border-r border-slate-200 flex-col ${showList ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-800">Messaggi</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium mb-2">Errore di caricamento</p>
              <p className="text-sm text-slate-500 mb-4">{error}</p>
              <button 
                onClick={loadConversations}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Riprova
              </button>
            </div>
          ) : conversations.length === 0 && !newChatParticipant ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
              <Icon type="mail" className="w-16 h-16 mb-4" />
              <p className="font-medium">Nessuna conversazione</p>
              <p className="text-sm mt-2">
                Inizia a chattare con altri professionisti dal loro profilo
              </p>
            </div>
          ) : (
            <>
              {conversations.map(conv => (
                <ConversationListItem
                  key={conv.conversationId}
                  conversation={conv}
                  currentUserId={currentUserId}
                  isSelected={conv.conversationId === selectedConversationId}
                  onSelect={() => setSelectedConversationId(conv.conversationId)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <div className={`w-full md:w-2/3 flex-col ${!showList ? 'flex' : 'hidden md:flex'}`}>
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
          <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-500 p-8">
            <Icon type="mail" className="w-24 h-24 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold">Seleziona una conversazione</h3>
            <p className="mt-2 text-center">
              Scegli una chat dalla lista per visualizzare i messaggi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};