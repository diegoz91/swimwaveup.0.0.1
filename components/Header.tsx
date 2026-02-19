import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import type { AuthenticatedUser, View } from '../types';
import { Models } from 'appwrite';
import { databaseService } from '../src/services/database';

interface HeaderProps {
    currentUser: AuthenticatedUser | Models.User<Models.Preferences>;
    onNavigate: (view: View, id?: number | string) => void;
    onLogout?: () => void;
    unreadMessages: number;
    connectionRequests: number;
}

export const Header: React.FC<HeaderProps> = ({ 
    currentUser, 
    onNavigate, 
    onLogout,
    unreadMessages, 
    connectionRequests 
}) => {
  
  // State per i dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // ✅ FIX: Nuova logica per determinare i dati utente
  // Controlla PRIMA se ha userType (significa che ha il profilo dal database)
  const hasProfile = 'userType' in currentUser && currentUser.userType;
  const isAppwriteUser = '$id' in currentUser;
  
  let name: string;
  let avatarUrl: string;
  let userId: string;
  
  if (hasProfile) {
    // ✅ Utente con profilo caricato dal database
    const user = currentUser as AuthenticatedUser;
    const isProfessional = user.userType === 'professional';
    
    name = isProfessional 
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email
      : user.structureName || user.name || user.email;
    
    // ✅ USA L'AVATAR DAL DATABASE!
    avatarUrl = isProfessional 
      ? user.avatar || ''
      : user.logo || '';
    
    userId = user.$id;
    
    console.log('🔍 Header - Using profile avatar:', avatarUrl);
  } else if (isAppwriteUser) {
    // Fallback: utente Appwrite senza profilo caricato
    const user = currentUser as Models.User<Models.Preferences>;
    name = user.name || user.email;
    avatarUrl = user.prefs?.avatar || '';
    userId = user.$id;
  } else {
    name = 'User';
    avatarUrl = '';
    userId = '';
  }
  
  // Genera avatar di fallback se non c'è
  const finalAvatarUrl = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;
  
  // Carica le richieste pendenti
  useEffect(() => {
    const loadRequests = async () => {
      if (isAppwriteUser) {
        try {
          const requests = await databaseService.getPendingConnectionRequests(currentUser.$id);
          setPendingRequests(requests);
        } catch (error) {
          console.error('Error loading pending requests:', error);
        }
      }
    };
    
    loadRequests();
    // Ricarica ogni 30 secondi
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [currentUser, isAppwriteUser]);
  
  // Chiudi dropdown profilo quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  // Chiudi dropdown notifiche quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <header style={{ 
      backgroundColor: 'white',
      boxShadow: 'var(--shadow-md)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)',
      borderBottom: '1px solid var(--color-neutral-200)'
    }}>
      <div className="container" style={{ maxWidth: 'var(--content-max-width-wide)', padding: '0 var(--space-4)' }}>
        {/* Desktop Header */}
        <div className="hidden-mobile" style={{ alignItems: 'center', justifyContent: 'space-between', height: 'var(--header-height)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-primary-600)', padding: 'var(--space-2)' }}
            >
               <svg style={{ width: '32px', height: '32px' }} viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9c-1.3-.54-2.2-1.79-2.2-3.21 0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.42-.9 2.67-2.2 3.21C16.53 12.44 18 14.54 18 17h-2c0-2.21-1.79-4-4-4s-4 1.79-4 4H6c0-2.46 1.47-4.56 3.8-5.21z" />
               </svg>
              <span className="text-2xl font-bold">SwimWaveUp</span>
            </button>
             <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Cerca professionisti, lavori..."
                className="input input-md"
                style={{ 
                  width: '320px',
                  paddingLeft: 'var(--space-10)',
                  backgroundColor: 'var(--color-neutral-100)'
                }}
              />
              <div style={{ 
                position: 'absolute',
                top: '50%',
                left: 'var(--space-3)',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}>
                <Icon type="search" className="w-5 h-5" style={{ color: 'var(--color-neutral-400)' }} />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                <button onClick={() => onNavigate('dashboard')} className="btn btn-ghost btn-sm">Home</button>
                <button onClick={() => onNavigate('network')} className="btn btn-ghost btn-sm">Network</button>
                <button onClick={() => onNavigate('lavoro')} className="btn btn-ghost btn-sm">Lavoro</button>
            </nav>
            
             <button 
               onClick={() => onNavigate('messages')} 
               className="btn btn-icon btn-icon-md btn-ghost"
               style={{ position: 'relative' }}
             >
                <Icon type="mail" className="w-6 h-6" />
                {unreadMessages > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: 'var(--color-error-500)',
                    color: 'white',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-bold)',
                    borderRadius: 'var(--radius-full)',
                    height: '20px',
                    width: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadMessages}
                  </span>
                )}
            </button>
            
            {/* Dropdown Notifiche */}
            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="btn btn-icon btn-icon-md btn-ghost"
                style={{ position: 'relative' }}
              >
                <Icon type="bell" className="w-6 h-6" />
                {pendingRequests.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: 'var(--color-error-500)',
                    color: 'white',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-bold)',
                    borderRadius: 'var(--radius-full)',
                    height: '20px',
                    width: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              
              {/* Dropdown Notifiche */}
              {isNotificationOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 'var(--space-2)',
                  width: '360px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-neutral-200)',
                  zIndex: 'var(--z-dropdown)',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-neutral-200)', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                    <h3 style={{ margin: 0, fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-lg)' }}>
                      Notifiche
                    </h3>
                  </div>
                  
                  {pendingRequests.length > 0 ? (
                    <div>
                      {pendingRequests.map(req => (
                        <div 
                          key={req.$id}
                          style={{
                            padding: 'var(--space-4)',
                            borderBottom: '1px solid var(--color-neutral-100)',
                            cursor: 'pointer',
                            transition: 'background-color var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={() => {
                            setIsNotificationOpen(false);
                            onNavigate('network');
                          }}
                        >
                          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                            <img 
                              src={req.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester.firstName + ' ' + req.requester.lastName)}&background=3b82f6&color=fff`}
                              alt={`${req.requester.firstName} ${req.requester.lastName}`}
                              style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', flexShrink: 0, objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>
                                <strong>{req.requester.firstName} {req.requester.lastName}</strong> vuole connettersi con te
                              </p>
                              <p style={{ margin: 'var(--space-1) 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                                {req.requester.city}, {req.requester.province}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                      <Icon type="bell" className="w-12 h-12" style={{ color: 'var(--color-neutral-300)', margin: '0 auto var(--space-3)' }} />
                      <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>
                        Nessuna notifica
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Dropdown menu profilo/logout */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                className="btn btn-icon btn-icon-lg btn-ghost"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {/* ✅ USA finalAvatarUrl che include il fallback */}
                <img 
                  src={finalAvatarUrl} 
                  alt={name} 
                  style={{
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover',
                    width: '40px',
                    height: '40px'
                  }}
                />
              </button>
              
              {/* Dropdown menu profilo */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 'var(--space-2)',
                  width: '250px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-neutral-200)',
                  zIndex: 'var(--z-dropdown)'
                }}>
                  <div style={{ padding: 'var(--space-2)' }}>
                    <div style={{ 
                      padding: 'var(--space-4) var(--space-4) var(--space-2) var(--space-4)',
                      borderBottom: '1px solid var(--color-neutral-200)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)'
                    }}>
                      {/* ✅ Mostra anche l'avatar nel dropdown */}
                      <img 
                        src={finalAvatarUrl} 
                        alt={name}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-full)',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', margin: 0 }}>{name}</p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', margin: 0 }}>
                          {isAppwriteUser ? (currentUser as Models.User<Models.Preferences>).email : 'User'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate('profile', userId);
                      }}
                      className="btn btn-ghost btn-sm btn-full"
                      style={{ justifyContent: 'flex-start', gap: 'var(--space-2)' }}
                    >
                      <Icon type="user" className="w-4 h-4" />
                      Il mio profilo
                    </button>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate('settings');
                      }}
                      className="btn btn-ghost btn-sm btn-full"
                      style={{ justifyContent: 'flex-start', gap: 'var(--space-2)' }}
                    >
                      <Icon type="settings" className="w-4 h-4" />
                      Impostazioni
                    </button>
                    {onLogout && (
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="btn btn-ghost btn-sm btn-full"
                        style={{ 
                          justifyContent: 'flex-start', 
                          gap: 'var(--space-2)',
                          color: 'var(--color-error-600)',
                          borderTop: '1px solid var(--color-neutral-200)',
                          marginTop: 'var(--space-1)'
                        }}
                      >
                        <Icon type="logout" className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Header */}
        <div className="visible-mobile" style={{ alignItems: 'center', justifyContent: 'space-between', height: 'var(--header-height-mobile)' }}>
            {/* Mantieni il tuo codice mobile esistente */}
        </div>
      </div>
    </header>
  );
};