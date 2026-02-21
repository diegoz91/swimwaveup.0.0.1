import React, { memo } from 'react';
import type { UserProfile, StructureProfile } from '../types';

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

export const ConversationListItem: React.FC<ConversationItemProps> = memo(({ 
  conversation, 
  currentUserId,
  isSelected, 
  onSelect 
}) => {
  const { participant, lastMessage, unreadCount } = conversation;

  const getParticipantName = (): string => {
    if (participant.userType === 'professional') {
      return `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Utente';
    }
    return participant.structureName || 'Struttura';
  };

  const name = getParticipantName();

  const getParticipantAvatar = (): string => {
    if (participant.userType === 'professional' && participant.avatar) return participant.avatar;
    if (participant.userType === 'structure' && participant.logo) return participant.logo;
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=1d4ed8`;
  };

  const formatTimestamp = (isoString: string): string => {
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

  const getMessagePreview = (): string => {
    const isSentByMe = lastMessage.senderId === currentUserId;
    const prefix = isSentByMe ? 'Tu: ' : '';
    return prefix + lastMessage.content;
  };

  return (
    <div 
      className={`flex items-center p-3 sm:p-4 cursor-pointer transition-colors border-l-4 ${
        isSelected 
          ? 'bg-blue-50 border-blue-600' 
          : 'bg-white border-transparent hover:bg-slate-50'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Area Avatar */}
      <div className="relative flex-shrink-0">
        <img 
          src={getParticipantAvatar()} 
          alt={name} 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mr-3 sm:mr-4 border border-slate-100 shadow-sm" 
          loading="lazy"
        />
        {/* Pallino Stato Online */}
        {participant.userType === 'professional' && participant.isActive && (
          <div 
            className="absolute bottom-0 right-3 sm:right-4 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"
            title="Utente attivo"
            aria-hidden="true"
          />
        )}
      </div>
      
      {/* Area Testi */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <p className={`font-bold text-sm sm:text-base truncate pr-2 ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
            {name}
          </p>
          <p className={`text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0 ${unreadCount > 0 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
            {formatTimestamp(lastMessage.sentAt)}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={`text-xs sm:text-sm truncate pr-2 ${unreadCount > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
            {getMessagePreview()}
          </p>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 flex-shrink-0 shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ConversationListItem.displayName = 'ConversationListItem';