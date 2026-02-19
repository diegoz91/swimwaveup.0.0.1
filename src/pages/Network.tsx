import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../services/database';
import { useNavigate } from 'react-router-dom';

type Tab = 'suggestions' | 'requests' | 'connections';
type EntityType = 'professional' | 'structure';

interface Entity {
  $id: string;
  type: EntityType;
  firstName?: string;
  lastName?: string;
  structureName?: string;
  city?: string;
  province?: string;
  avatar?: string;
  logo?: string;
  [key: string]: any;
}

const Network: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('suggestions');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingEntities, setConnectingEntities] = useState<Set<string>>(new Set());
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, any>>({});

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Carica sia utenti che strutture
      const [allUsers, allStructures] = await Promise.all([
        databaseService.getAllUsers(),
        databaseService.getAllStructures()
      ]);
      
      // Combina e aggiungi campo type
      const combined: Entity[] = [
        ...allUsers
          .filter(u => u.$id !== user.$id)
          .map((u: any) => ({ 
            ...u, 
            type: 'professional' as EntityType,
            city: u.city || '',
            province: u.province || ''
          })),
        ...allStructures.documents
          .filter((s: any) => s.$id !== user.$id)
          .map((s: any) => ({ 
            ...s, 
            type: 'structure' as EntityType,
            city: s.city || '',
            province: s.province || ''
          }))
      ];
      
      // Carica richieste pendenti
      const pendingRequests = await databaseService.getPendingConnectionRequests(user.$id);
      
      // Carica connessioni accettate
      const myConnections = await databaseService.getMyConnections(user.$id);
      
      // Carica stato connessioni per ogni entità
      const statuses: Record<string, any> = {};
      for (const entity of combined) {
        const connection = await databaseService.checkConnection(user.$id, entity.$id);
        if (connection) {
          statuses[entity.$id] = connection;
        }
      }
      
      setEntities(combined);
      setRequests(pendingRequests);
      setConnections(myConnections);
      setConnectionStatuses(statuses);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleConnect = async (targetId: string) => {
    if (!user) return;
    
    setConnectingEntities(prev => new Set(prev).add(targetId));
    
    try {
      const connection = await databaseService.createConnection(user.$id, targetId);
      setConnectionStatuses(prev => ({
        ...prev,
        [targetId]: connection
      }));
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Errore nella richiesta di connessione');
    } finally {
      setConnectingEntities(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetId);
        return newSet;
      });
    }
  };

  const handleMessage = (userId: string) => {
    console.log('🔍 Opening chat with userId:', userId);
    navigate(`/chat?userId=${userId}`);
  };

  const handleViewProfile = (userId: string) => {
    console.log('🔍 Opening profile:', userId);
    navigate(`/profile/${userId}`);
  };

  const handleAccept = async (connectionId: string) => {
    try {
      await databaseService.acceptConnection(connectionId);
      await loadData();
    } catch (error) {
      console.error('Error accepting:', error);
      alert('Errore nell\'accettare la richiesta');
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await databaseService.rejectConnection(connectionId);
      await loadData();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Errore nel rifiutare la richiesta');
    }
  };

  const getButtonContent = (entityId: string) => {
    const connection = connectionStatuses[entityId];
    
    if (connectingEntities.has(entityId)) return 'Invio...';
    if (!connection) return 'Connetti';
    
    if (connection.requesterId === user?.$id && connection.status === 'pending') {
      return 'Richiesta inviata';
    }
    
    if (connection.status === 'accepted') return 'Connesso';
    
    return 'Connetti';
  };

  const isButtonDisabled = (entityId: string) => {
    const connection = connectionStatuses[entityId];
    return connectingEntities.has(entityId) || 
           (connection && (connection.status === 'accepted' || 
            (connection.requesterId === user?.$id && connection.status === 'pending')));
  };

  const getEntityName = (entity: Entity) => {
    return entity.type === 'professional' 
      ? `${entity.firstName} ${entity.lastName}`
      : entity.structureName || 'Struttura';
  };

  const getEntityAvatar = (entity: Entity) => {
    if (entity.type === 'professional') {
      return entity.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entity.firstName + ' ' + entity.lastName)}&background=3b82f6&color=fff`;
    } else {
      return entity.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(entity.structureName || 'S')}&background=14b8a6&color=fff`;
    }
  };

  const filteredEntities = entities.filter(e => {
    const connection = connectionStatuses[e.$id];
    return !connection || connection.status !== 'accepted';
  });

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card card-comfortable text-center">
          <p>Caricamento network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <h1 className="text-2xl font-bold" style={{ marginBottom: 'var(--space-6)' }}>My Network</h1>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', borderBottom: '2px solid var(--color-neutral-200)' }}>
        <button
          onClick={() => setActiveTab('suggestions')}
          className="btn btn-ghost"
          style={{
            borderBottom: activeTab === 'suggestions' ? '2px solid var(--color-primary-600)' : 'none',
            borderRadius: 0,
            color: activeTab === 'suggestions' ? 'var(--color-primary-600)' : 'var(--color-neutral-600)'
          }}
        >
          Suggerimenti ({filteredEntities.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className="btn btn-ghost"
          style={{
            borderBottom: activeTab === 'requests' ? '2px solid var(--color-primary-600)' : 'none',
            borderRadius: 0,
            color: activeTab === 'requests' ? 'var(--color-primary-600)' : 'var(--color-neutral-600)',
            position: 'relative'
          }}
        >
          Richieste ({requests.length})
          {requests.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'var(--color-error-500)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'var(--font-bold)',
              borderRadius: 'var(--radius-full)',
              height: '18px',
              width: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {requests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className="btn btn-ghost"
          style={{
            borderBottom: activeTab === 'connections' ? '2px solid var(--color-primary-600)' : 'none',
            borderRadius: 0,
            color: activeTab === 'connections' ? 'var(--color-primary-600)' : 'var(--color-neutral-600)'
          }}
        >
          Connessioni ({connections.length})
        </button>
      </div>

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="card card-comfortable">
          <h2 className="card-title">Professionisti e Strutture</h2>
          {filteredEntities.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {filteredEntities.map(entity => (
                <div key={entity.$id} className="card card-outlined card-compact">
                  <div 
                    onClick={() => handleViewProfile(entity.$id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={getEntityAvatar(entity)}
                      alt={getEntityName(entity)}
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: entity.type === 'professional' ? 'var(--radius-full)' : 'var(--radius-md)',
                        margin: '0 auto var(--space-3)',
                        objectFit: 'cover'
                      }}
                    />
                    <h3 className="card-title card-title-sm text-center">{getEntityName(entity)}</h3>
                    <p className="card-subtitle text-center">{entity.city}, {entity.province}</p>
                    {entity.type === 'structure' && (
                      <span style={{
                        display: 'inline-block',
                        margin: '0 auto var(--space-2)',
                        padding: 'var(--space-1) var(--space-2)',
                        backgroundColor: 'var(--color-secondary-100)',
                        color: 'var(--color-secondary-700)',
                        fontSize: 'var(--text-xs)',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        🏊 Piscina
                      </span>
                    )}
                  </div>
                  
                  {/* BOTTONI: Messaggio + Connetti */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                    <button 
                      onClick={() => handleMessage(entity.$id)}
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1 }}
                      title="Invia messaggio"
                    >
                      💬 Messaggio
                    </button>
                    <button 
                      onClick={() => handleConnect(entity.$id)}
                      disabled={isButtonDisabled(entity.$id)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      {getButtonContent(entity.$id)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="card-description">Nessuna entità da connettere</p>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="card card-comfortable">
          <h2 className="card-title">Richieste di connessione</h2>
          {requests.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              {requests.map(req => (
                <div key={req.$id} className="card card-outlined" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}
                      onClick={() => handleViewProfile(req.requester.userId || req.requester.$id)}
                    >
                      <img 
                        src={req.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester.firstName + ' ' + req.requester.lastName)}`}
                        alt={`${req.requester.firstName} ${req.requester.lastName}`}
                        style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)' }}
                      />
                      <div>
                        <h4 style={{ fontWeight: 'var(--font-semibold)', margin: 0 }}>
                          {req.requester.firstName} {req.requester.lastName}
                        </h4>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', margin: 0 }}>
                          {req.requester.city}, {req.requester.province}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button onClick={() => handleReject(req.$id)} className="btn btn-ghost btn-sm">
                        Rifiuta
                      </button>
                      <button onClick={() => handleAccept(req.$id)} className="btn btn-primary btn-sm">
                        Accetta
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="card-description">Nessuna richiesta pendente</p>
          )}
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="card card-comfortable">
          <h2 className="card-title">Le tue connessioni</h2>
          {connections.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {connections.map(conn => {
                const isStructure = 'structureName' in conn.user;
                const userId = conn.user.userId || conn.user.$id;
                return (
                  <div key={conn.$id} className="card card-outlined card-compact">
                    <div 
                      onClick={() => handleViewProfile(userId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={
                          isStructure
                            ? (conn.user.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.user.structureName)}&background=14b8a6&color=fff`)
                            : (conn.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conn.user.firstName + ' ' + conn.user.lastName)}`)
                        }
                        alt={isStructure ? conn.user.structureName : `${conn.user.firstName} ${conn.user.lastName}`}
                        style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: isStructure ? 'var(--radius-md)' : 'var(--radius-full)', 
                          margin: '0 auto var(--space-3)',
                          objectFit: 'cover'
                        }}
                      />
                      <h3 className="card-title card-title-sm text-center">
                        {isStructure ? conn.user.structureName : `${conn.user.firstName} ${conn.user.lastName}`}
                      </h3>
                      <p className="card-subtitle text-center">{conn.user.city}, {conn.user.province}</p>
                      {isStructure && (
                        <span style={{
                          display: 'inline-block',
                          margin: '0 auto var(--space-2)',
                          padding: 'var(--space-1) var(--space-2)',
                          backgroundColor: 'var(--color-secondary-100)',
                          color: 'var(--color-secondary-700)',
                          fontSize: 'var(--text-xs)',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 'var(--font-medium)'
                        }}>
                          🏊 Piscina
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleMessage(userId)}
                      className="btn btn-primary btn-sm btn-full" 
                      style={{ marginTop: 'var(--space-3)' }}
                    >
                      💬 Messaggio
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="card-description">Nessuna connessione ancora</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Network;