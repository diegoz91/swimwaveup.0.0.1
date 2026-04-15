import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { databaseService } from '@/services/database';
import { useToast } from '@/context/ToastContext';
import { NetworkView } from '@/features/network/components/NetworkView';
import type { UserProfile, StructureProfile, Facility } from '@/types/types';
import type { EnrichedConnectionRequest } from '@/features/network/components/ConnectionRequestCard';

type Profile = UserProfile | StructureProfile;

const Network: React.FC = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [pendingRequests, setPendingRequests] = useState<EnrichedConnectionRequest[]>([]);
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    
    // 💡 NUOVI STATI PER LA RICERCA E I COLLEGAMENTI
    const [activeConnections, setActiveConnections] = useState<Profile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{profiles: Profile[], facilities: Facility[]}>({profiles: [], facilities: []});
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    const loadNetworkData = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            // 1. Carica Richieste
            const requests = await databaseService.getPendingConnectionRequests(currentUser.$id);
            const enrichedReqs = await Promise.all(requests.map(async (req) => {
                try {
                    const senderProfile = await databaseService.getProfile(req.senderId);
                    return { ...req, senderProfile } as EnrichedConnectionRequest;
                } catch { return null; }
            }));
            setPendingRequests(enrichedReqs.filter(Boolean) as EnrichedConnectionRequest[]);

            // 2. Carica Suggerimenti
            const suggs = await databaseService.getNetworkSuggestions(currentUser.$id, currentUser.connections || []);
            setSuggestions(suggs);

            // 3. Carica i Profili reali della tua Rubrica
            const conns = await databaseService.getConnectionsProfiles(currentUser.connections || []);
            setActiveConnections(conns);

        } catch (error) {
            showToast('Errore nel caricamento del network.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, showToast]);

    useEffect(() => {
        loadNetworkData();
    }, [loadNetworkData]);

    // 💡 EFFETTO RICERCA LIVE (DEBOUNCED)
    useEffect(() => {
        if (!currentUser) return;
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                const results = await databaseService.searchNetwork(searchQuery, currentUser.$id);
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults({profiles: [], facilities: []});
            }
        }, 500); // 500ms delay anti-spam
        return () => clearTimeout(timer);
    }, [searchQuery, currentUser]);

    const handleAcceptRequest = async (connectionId: string) => {
        if (!currentUser) return;
        const req = pendingRequests.find(r => r.$id === connectionId);
        if (!req) return;
        try {
            await databaseService.acceptConnectionRequest(connectionId, req.senderId, req.receiverId);
            showToast('Collegamento accettato!', 'success');
            setPendingRequests(prev => prev.filter(r => r.$id !== connectionId));
            if (req.senderProfile) {
                setActiveConnections(prev => [req.senderProfile!, ...prev]);
            }
        } catch (error) { showToast('Errore durante l\'accettazione.', 'error'); }
    };

    const handleRejectRequest = async (connectionId: string) => {
        try {
            await databaseService.rejectConnectionRequest(connectionId);
            showToast('Richiesta rifiutata.', 'info');
            setPendingRequests(prev => prev.filter(req => req.$id !== connectionId));
        } catch (error) { showToast('Errore durante il rifiuto.', 'error'); }
    };

    const handleSendRequest = async (targetUserId: string) => {
        if (!currentUser) return;
        try {
            await databaseService.sendConnectionRequest(currentUser.$id, targetUserId);
            showToast('Richiesta inviata!', 'success');
            setSuggestions(prev => prev.filter(s => (s.userId || s.$id) !== targetUserId));
            setSearchResults(prev => ({...prev, profiles: prev.profiles.filter(p => (p.userId || p.$id) !== targetUserId)}));
        } catch (error) { showToast('Hai già inviato una richiesta a questo utente.', 'error'); }
    };

    const handleRemoveConnection = async (targetUserId: string) => {
        if (!currentUser) return;
        if (window.confirm('Sei sicuro di voler rimuovere questo collegamento?')) {
            const success = await databaseService.removeConnection(currentUser.$id, targetUserId);
            if (success) {
                showToast('Collegamento rimosso.', 'info');
                setActiveConnections(prev => prev.filter(c => (c.userId || c.$id) !== targetUserId));
            } else {
                showToast('Errore durante la rimozione.', 'error');
            }
        }
    };

    const handleSelectProfile = (userId: string) => navigate(`/profile/${userId}`);
    const handleMessage = (userId: string) => navigate(`/messages`, { state: { startChatWithUserId: userId } });

    if (!currentUser) return null;

    return (
        <div className="pt-20 md:pt-24 px-4 pb-20">
            <NetworkView 
                currentUser={currentUser}
                pendingRequests={pendingRequests}
                suggestions={suggestions}
                activeConnections={activeConnections}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                isLoading={isLoading}
                isSearching={isSearching}
                onSelectProfile={handleSelectProfile}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onSendRequest={handleSendRequest}
                onRemoveConnection={handleRemoveConnection}
                onMessage={handleMessage}
            />
        </div>
    );
};

export default Network;