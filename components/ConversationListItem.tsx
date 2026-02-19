// ============================================================
// FILE 2: src/components/ConversationListItem.tsx - SOSTITUISCI QUESTO
// ============================================================

import { UserProfile, StructureProfile } from '@/types';
import React from 'react';

interface ConversationItemProps {
  conversation: {
    conversationId: string;
    participant: UserProfile | StructureProfile;
    lastMessage: {
      content: string;
      sentAt: string;
      senderId: string;
    };
    unreadCount: number;
  };
  currentUserId: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConversationListItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  currentUserId,
  isSelected, 
  onSelect 
}) => {
  const { participant, lastMessage, unreadCount } = conversation;

  const getParticipantName = () => {
    if (participant.userType === 'professional') {
      return `${participant.firstName} ${participant.lastName}`;
    }
    return participant.structureName;
  };

  const getParticipantAvatar = () => {
    if (participant.userType === 'professional') {
      return participant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getParticipantName())}`;
    }
    return participant.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.structureName)}`;
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}g`;
    
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  };

  const getMessagePreview = () => {
    const preview = lastMessage.content;
    const isSentByMe = lastMessage.senderId === currentUserId;
    const prefix = isSentByMe ? 'Tu: ' : '';
    
    return prefix + (preview.length > 50 ? preview.substring(0, 50) + '...' : preview);
  };

  return (
    <div 
      className={`flex items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="relative">
        <img 
          src={getParticipantAvatar()} 
          alt={getParticipantName()} 
          className="w-12 h-12 rounded-full object-cover mr-3" 
        />
        {participant.userType === 'professional' && participant.isActive && (
          <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
            {getParticipantName()}
          </p>
          <p className="text-xs text-slate-400 flex-shrink-0 ml-2">
            {formatTimestamp(lastMessage.sentAt)}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
            {getMessagePreview()}
          </p>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 flex-shrink-0 ml-2">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};