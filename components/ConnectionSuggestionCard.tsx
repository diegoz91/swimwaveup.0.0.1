
import React, { useState } from 'react';
import type { ProfessionalUser } from '../types';
import { Icon } from './Icon';

interface ConnectionSuggestionCardProps {
    user: ProfessionalUser;
    onSelectProfile: (profile: ProfessionalUser) => void;
    onContact: (userId: number) => void;
}

export const ConnectionSuggestionCard: React.FC<ConnectionSuggestionCardProps> = ({ user, onSelectProfile, onContact }) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    if (isDismissed) return null;
    
    return (
        <div className="flex flex-col items-center text-center p-4 border border-slate-200 rounded-lg relative">
            <button onClick={() => setIsDismissed(true)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
                <Icon type="x" className="w-5 h-5"/>
            </button>
            <img 
                src={user.avatarUrl} 
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover cursor-pointer"
                onClick={() => onSelectProfile(user)}
            />
            <p 
                className="font-bold mt-2 text-slate-800 cursor-pointer hover:text-blue-600"
                onClick={() => onSelectProfile(user)}
            >
                {user.name}
            </p>
            <p className="text-sm text-slate-500 mb-3">{user.title}</p>
            {isConnected ? (
                 <button 
                    onClick={() => onContact(user.id)} 
                    className="w-full bg-slate-200 text-slate-800 font-semibold py-1.5 rounded-full flex items-center justify-center gap-2"
                >
                    <Icon type="mail" className="w-4 h-4"/>
                    <span>Messaggio</span>
                </button>
            ) : (
                <button 
                    onClick={() => setIsConnected(true)} 
                    className="w-full bg-blue-600 text-white font-semibold py-1.5 rounded-full hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <Icon type="plus" className="w-4 h-4"/>
                    <span>Connetti</span>
                </button>
            )}
        </div>
    );
};
