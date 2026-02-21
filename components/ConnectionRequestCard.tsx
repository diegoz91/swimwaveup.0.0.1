import React, { useState } from 'react';
import type { Connection, UserProfile, StructureProfile } from '../types';
import { Icon } from './Icon';

export interface EnrichedConnectionRequest extends Connection {
    requester: UserProfile | StructureProfile;
}

interface ConnectionRequestCardProps {
    request: EnrichedConnectionRequest;
    onSelectProfile: (userId: string) => void;
    onAccept: (connectionId: string) => Promise<void>;
    onReject: (connectionId: string) => Promise<void>;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({ 
    request, 
    onSelectProfile,
    onAccept,
    onReject
}) => {
    const [isProcessing, setIsProcessing] = useState<'accept' | 'reject' | null>(null);

    const requester = request.requester;
    
    if (!requester) return null;

    const isProfessional = requester.userType === 'professional';
    
    const name = isProfessional 
        ? `${(requester as UserProfile).firstName || ''} ${(requester as UserProfile).lastName || ''}`.trim() || 'Utente'
        : (requester as StructureProfile).structureName || 'Struttura';

    const subtitle = isProfessional
        ? (requester as UserProfile).title || (requester as UserProfile).city || 'Professionista'
        : (requester as StructureProfile).structureType || (requester as StructureProfile).city || 'Piscina';

    const avatarUrl = isProfessional
        ? (requester as UserProfile).avatar
        : (requester as StructureProfile).logo;

    const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff6ff&color=1d4ed8`;

    const handleAccept = async () => {
        setIsProcessing('accept');
        try {
            await onAccept(request.$id);
        } catch (error) {
            setIsProcessing(null);
        }
    };

    const handleReject = async () => {
        setIsProcessing('reject');
        try {
            await onReject(request.$id);
        } catch (error) {
            setIsProcessing(null);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow gap-4">
            
            {/* Area Info Profilo */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                    src={displayAvatar}
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover cursor-pointer border border-slate-100 shadow-sm transition-transform hover:scale-105 flex-shrink-0"
                    onClick={() => onSelectProfile(requester.userId || requester.$id)}
                />
                <div className="flex-1 min-w-0">
                    <p
                        className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1"
                        onClick={() => onSelectProfile(requester.userId || requester.$id)}
                        title={name}
                    >
                        {name}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-1" title={subtitle}>
                        {subtitle}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Ha inviato una richiesta
                    </p>
                </div>
            </div>

            {/* Area Azioni */}
            <div className="flex items-center gap-2 sm:self-auto self-end">
                <button 
                    onClick={handleReject} 
                    disabled={isProcessing !== null}
                    className="flex items-center justify-center min-w-[90px] font-semibold text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isProcessing === 'reject' ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Rifiuta'
                    )}
                </button>
                
                <button 
                    onClick={handleAccept} 
                    disabled={isProcessing !== null}
                    className="flex items-center justify-center min-w-[90px] bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {isProcessing === 'accept' ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Accetta'
                    )}
                </button>
            </div>
        </div>
    );
};