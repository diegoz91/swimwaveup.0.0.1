
import React, { useState } from 'react';
import type { ConnectionRequest, ProfessionalUser } from '../types';
import { PROFESSIONALS } from '../src/utils/mockData';
import { Icon } from './Icon';

interface ConnectionRequestCardProps {
    request: ConnectionRequest;
    onSelectProfile: (profile: ProfessionalUser) => void;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({ request, onSelectProfile }) => {
    const [isHandled, setIsHandled] = useState(false);
    const user = PROFESSIONALS.find(p => p.id === request.fromUserId);

    if (!user || isHandled) return null;

    const handleAction = () => {
        setIsHandled(true);
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
                <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                    onClick={() => onSelectProfile(user)}
                />
                <div>
                    <p
                        className="font-bold text-slate-800 cursor-pointer hover:text-blue-600"
                        onClick={() => onSelectProfile(user)}
                    >
                        {user.name}
                    </p>
                    <p className="text-sm text-slate-500">{user.title}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleAction} className="text-slate-500 font-semibold px-3 py-1 rounded-full hover:bg-slate-200">Rifiuta</button>
                <button onClick={handleAction} className="text-blue-600 font-semibold border border-blue-600 px-3 py-1 rounded-full hover:bg-blue-50">Accetta</button>
            </div>
        </div>
    );
};