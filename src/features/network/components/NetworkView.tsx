import React from 'react';
import type { UserProfile, StructureProfile } from '@/types/types';
import { ConnectionRequestCard, type EnrichedConnectionRequest } from './ConnectionRequestCard';
import { ConnectionSuggestionCard } from './ConnectionSuggestionCard';
import { Icon } from '@/components/ui/Icon';

interface NetworkViewProps {
    currentUser: UserProfile | StructureProfile;
    pendingRequests: EnrichedConnectionRequest[];
    suggestions: (UserProfile | StructureProfile)[];
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
            <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 shadow-sm"></div>
                <p className="text-slate-500 font-bold mt-4 animate-pulse">Sincronizzazione network...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-20 md:pb-8 animate-in fade-in duration-500">
            
            {/* Richieste di Connessione */}
            <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                                <Icon type="users" className="w-6 h-6" />
                            </div>
                            Richieste in Sospeso
                        </h1>
                        {pendingRequests.length > 0 && (
                            <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                                {pendingRequests.length}
                            </span>
                        )}
                    </div>
                    
                    <div className="p-6">
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
                            <div className="text-center py-10">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                                    <Icon type="check-double" className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Sei in pari!</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                    Non hai nuove richieste di connessione. Esplora i suggerimenti per espandere la tua rete.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800">I tuoi collegamenti</h3>
                        <p className="text-sm text-slate-500 mt-1">Gestisci la tua rete professionale</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-extrabold text-blue-600">{currentUser.connections?.length || 0}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connessioni</p>
                    </div>
                </div>
            </div>
            
            {/* Suggerimenti */}
            <div className="lg:col-span-1 row-start-1 lg:row-start-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:sticky lg:top-24">
                    <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                        <Icon type="sparkles" className="w-5 h-5 text-amber-500" />
                        Aggiungi al Network
                    </h2>
                    
                    {suggestions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {suggestions.map(prof => (
                                <ConnectionSuggestionCard 
                                    key={prof.userId || prof.$id}
                                    user={prof}
                                    onSelectProfile={onSelectProfile}
                                    onConnect={onSendRequest}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                            <Icon type="globe" className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm font-medium px-4">
                                Nessun nuovo suggerimento al momento.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};