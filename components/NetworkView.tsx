import React from 'react';
import type { UserProfile, StructureProfile } from '../types';
import { ConnectionRequestCard, EnrichedConnectionRequest } from './ConnectionRequestCard';
import { ConnectionSuggestionCard } from './ConnectionSuggestionCard';
import { Icon } from './Icon';

interface NetworkViewProps {
    currentUser: UserProfile | StructureProfile;
    pendingRequests: EnrichedConnectionRequest[];
    suggestions: UserProfile[];
    isLoading?: boolean;
    onSelectProfile: (userId: string) => void;
    onAcceptRequest: (connectionId: string) => Promise<void>;
    onRejectRequest: (connectionId: string) => Promise<void>;
    onSendRequest: (userId: string) => Promise<void>;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ 
    currentUser, 
    pendingRequests,
    suggestions,
    isLoading = false,
    onSelectProfile,
    onAcceptRequest,
    onRejectRequest,
    onSendRequest
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-slate-500 font-medium mt-4">Sincronizzazione network...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-20 md:pb-8">
            
            {/* Colonna Principale: Richieste Pendenti */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                            <Icon type="users" className="w-6 h-6 text-blue-600" />
                            Richieste di Connessione
                        </h2>
                        {pendingRequests.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {pendingRequests.length}
                            </span>
                        )}
                    </div>
                    
                    {pendingRequests.length > 0 ? (
                        <div className="space-y-4">
                            {pendingRequests.map(req => (
                                <ConnectionRequestCard 
                                    key={req.$id}
                                    request={req}
                                    onSelectProfile={onSelectProfile}
                                    onAccept={onAcceptRequest}
                                    onReject={onRejectRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Icon type="check-double" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium">Sei in pari!</p>
                            <p className="text-sm text-slate-400 mt-1">Non hai nessuna nuova richiesta in sospeso.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Colonna Laterale: Suggerimenti */}
            <div className="lg:col-span-1 row-start-1 lg:row-start-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                    <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <Icon type="sparkles" className="w-5 h-5 text-amber-500" />
                        Persone che potresti conoscere
                    </h2>
                    
                    {suggestions.length > 0 ? (
                        <div className="space-y-4">
                            {suggestions.map(prof => (
                                <ConnectionSuggestionCard 
                                    key={prof.$id}
                                    user={prof}
                                    onSelectProfile={onSelectProfile}
                                    onConnect={onSendRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-6">
                            Nessun nuovo suggerimento al momento. Continua a esplorare la piattaforma!
                        </p>
                    )}
                </div>
            </div>
            
        </div>
    );
};