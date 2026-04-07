import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { databaseService } from '@/services/database';
import { useToast } from '@/context/ToastContext';
import { NetworkView } from '@/features/network/components/NetworkView';
import type { UserProfile, StructureProfile } from '@/types/types';
import type { EnrichedConnectionRequest } from '@/features/network/components/ConnectionRequestCard';

type Profile = UserProfile | StructureProfile;

const Network: React.FC = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [pendingRequests, setPendingRequests] = useState<EnrichedConnectionRequest[]>([]);
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNetworkData = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            // 1. Carica Richieste Ricevute
            const requests = await databaseService.getPendingConnectionRequests(currentUser.$id);

            const enrichedReqs = await Promise.all(requests.map(async (req) => {
                try {
                    const senderProfile = await databaseService.getProfile(req.senderId);
                    return { ...req, senderProfile } as EnrichedConnectionRequest;
                } catch {
                    return null;
                }
            }));

            setPendingRequests(enrichedReqs.filter(Boolean) as EnrichedConnectionRequest[]);

            // 2. Carica Suggerimenti
            const myConnections = currentUser.connections || [];
            const allSuggestions = await databaseService.getNetworkSuggestions(currentUser.$id, myConnections);
            
            const pendingSenderIds = enrichedReqs.map(r => r?.senderId);
            const validSuggestions = allSuggestions.filter(p => !pendingSenderIds.includes(p.userId || p.$id));
            
            setSuggestions(validSuggestions);

        } catch (error) {
            console.error('Errore caricamento network:', error);
            showToast('Errore nel caricamento della rete.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, showToast]);

    useEffect(() => {
        loadNetworkData();
    }, [loadNetworkData]);

    const handleAcceptRequest = async (connectionId: string) => {
        if (!currentUser) return;
        const req = pendingRequests.find(r => r.$id === connectionId);
        if (!req) return;

        try {
            await databaseService.acceptConnectionRequest(connectionId, req.senderId, currentUser.$id);
            showToast('Richiesta accettata con successo!', 'success');
            setPendingRequests(prev => prev.filter(r => r.$id !== connectionId));
            
            if (currentUser && !currentUser.connections?.includes(req.senderId)) {
                currentUser.connections = [...(currentUser.connections || []), req.senderId];
            }
        } catch (error) {
            showToast('Errore durante l\'accettazione.', 'error');
        }
    };

    const handleRejectRequest = async (connectionId: string) => {
        try {
            await databaseService.rejectConnectionRequest(connectionId);
            showToast('Richiesta rifiutata.', 'info');
            setPendingRequests(prev => prev.filter(req => req.$id !== connectionId));
        } catch (error) {
            showToast('Errore durante il rifiuto.', 'error');
        }
    };

    const handleSendRequest = async (targetUserId: string) => {
        if (!currentUser) return;
        try {
            await databaseService.sendConnectionRequest(currentUser.$id, targetUserId);
            showToast('Richiesta inviata!', 'success');
            setSuggestions(prev => prev.filter(s => (s.userId || s.$id) !== targetUserId));
        } catch (error) {
            showToast('Hai già inviato una richiesta a questo utente.', 'error');
        }
    };

    const handleSelectProfile = (userId: string) => {
        navigate(`/profile/${userId}`);
    };

    if (!currentUser) return null;

    return (
        <div className="pt-20 md:pt-24 px-4">
            <NetworkView 
                currentUser={currentUser}
                pendingRequests={pendingRequests}
                suggestions={suggestions}
                isLoading={isLoading}
                onSelectProfile={handleSelectProfile}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onSendRequest={handleSendRequest}
            />
        </div>
    );
};

export default Network;