import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { Icon } from './Icon';

interface ConnectionSuggestionCardProps {
    user: UserProfile;
    onSelectProfile: (userId: string) => void;
    onConnect: (userId: string) => Promise<void>; 
}

export const ConnectionSuggestionCard: React.FC<ConnectionSuggestionCardProps> = ({ 
    user, 
    onSelectProfile, 
    onConnect 
}) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    if (isDismissed) return null;

    const userId = user.userId || user.$id;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utente';
    const title = user.title || user.city || 'Professionista del Nuoto';
    const displayAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=eff6ff&color=1d4ed8`;

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await onConnect(userId);
            setRequestSent(true);
        } catch (error) {
            console.error("Errore durante l'invio della richiesta di connessione:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="flex flex-col items-center text-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
            
            {/* Tasto Rimuovi (Dismiss) */}
            <button 
                onClick={() => setIsDismissed(true)} 
                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Nascondi suggerimento"
                title="Rimuovi"
            >
                <Icon type="x" className="w-4 h-4"/>
            </button>
            
            {/* Avatar */}
            <img 
                src={displayAvatar} 
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover cursor-pointer border border-slate-100 shadow-sm transition-transform hover:scale-105"
                onClick={() => onSelectProfile(userId)}
                loading="lazy"
            />
            
            {/* Info Utente */}
            <p 
                className="font-bold mt-3 text-slate-800 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1 w-full px-2"
                onClick={() => onSelectProfile(userId)}
                title={fullName}
            >
                {fullName}
            </p>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px] w-full px-2" title={title}>
                {title}
            </p>
            
            {/* Azioni (Connetti o Inviata) */}
            {requestSent ? (
                <button 
                    disabled
                    className="w-full bg-slate-100 text-slate-500 font-semibold py-2 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                >
                    <Icon type="check-double" className="w-4 h-4"/>
                    <span>Inviata</span>
                </button>
            ) : (
                <button 
                    onClick={handleConnect} 
                    disabled={isConnecting}
                    className="w-full bg-blue-50 text-blue-700 border border-blue-100 font-bold py-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isConnecting ? (
                         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Icon type="plus" className="w-4 h-4"/>
                            <span>Connetti</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};