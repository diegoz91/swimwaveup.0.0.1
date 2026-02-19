
import React from 'react';
import type { ProfessionalUser } from '../types';
import { ConnectionRequestCard } from './ConnectionRequestCard';
import { ConnectionSuggestionCard } from './ConnectionSuggestionCard';
import { PROFESSIONALS, CONNECTION_REQUESTS } from '../src/utils/mockData';

interface NetworkViewProps {
    currentUser: ProfessionalUser;
    onSelectProfile: (profile: ProfessionalUser) => void;
    onContact: (userId: number) => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ currentUser, onSelectProfile, onContact }) => {
    // Exclude current user and existing connections from suggestions
    const existingConnectionIds = [currentUser.id, 2, 3]; // Mocked connections
    const suggestions = PROFESSIONALS.filter(p => !existingConnectionIds.includes(p.id));

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Richieste di Connessione</h2>
                    {CONNECTION_REQUESTS.length > 0 ? (
                        <div className="space-y-4">
                            {CONNECTION_REQUESTS.map(req => (
                                <ConnectionRequestCard 
                                    key={req.id}
                                    request={req}
                                    onSelectProfile={onSelectProfile}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">Nessuna nuova richiesta di connessione.</p>
                    )}
                </div>
            </div>
            <div className="md:col-span-1 row-start-1 md:row-start-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Suggerimenti per te</h2>
                     <div className="space-y-4">
                        {suggestions.map(prof => (
                            <ConnectionSuggestionCard 
                                key={prof.id}
                                user={prof}
                                onSelectProfile={onSelectProfile}
                                onContact={onContact}
                            />
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};