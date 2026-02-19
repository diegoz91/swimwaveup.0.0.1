import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

import { ProfileView } from '@/components/ProfileView';
import { AuthenticatedUser, ProfessionalUser, UserProfile } from '@/types';

// Adapter per convertire UserProfile in ProfessionalUser
const adaptUserProfileToProfessionalUser = (user: AuthenticatedUser): ProfessionalUser | null => {
  // Verifica che sia un utente professional
  if (user.userType !== 'professional') {
    return null;
  }

  const userProfile = user as UserProfile;
  
  return {
    id: parseInt(userProfile.userId) || 0,
    name: `${userProfile.firstName} ${userProfile.lastName}`.trim() || 'Nome non disponibile',
    title: 'Professionista del Nuoto', // Default, potresti aggiungere questo campo al DB
    location: `${userProfile.city}${userProfile.province ? ', ' + userProfile.province : ''}`,
    avatarUrl: userProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.firstName + ' ' + userProfile.lastName)}&background=3b82f6&color=fff`,
    specializations: userProfile.qualifications || [],
    experience: [], // Per ora vuoto, da implementare
    certifications: [], // Per ora vuoto, da implementare
    connections: userProfile.connectionCount || 0,
    bio: userProfile.bio || '',
    email: userProfile.email,
    phone: userProfile.phone || '',
  };
};

const Profile: React.FC = () => {
  const { user, isLoading, authenticated } = useAuth();
  const [profileData, setProfileData] = useState<ProfessionalUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && authenticated && user) {
      try {
        // Verifica che sia un utente professional
        if (user.userType !== 'professional') {
          setError('Questa pagina è disponibile solo per utenti professionali');
          return;
        }

        // Converte i dati
        const adaptedProfile = adaptUserProfileToProfessionalUser(user);
        if (adaptedProfile) {
          setProfileData(adaptedProfile);
        } else {
          setError('Errore nella conversione del profilo');
        }
      } catch (err) {
        console.error('Errore nel caricamento del profilo:', err);
        setError('Errore nel caricamento del profilo');
      }
    }
  }, [user, isLoading, authenticated]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Caricamento profilo...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Accesso richiesto</h2>
            <p className="text-slate-600 mb-4">Devi effettuare il login per vedere il profilo</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Vai al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Profilo non disponibile</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            
            {/* Debug info per sviluppo */}
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-blue-600 hover:underline">Debug Info</summary>
              <pre className="text-xs bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-40">
                {JSON.stringify({ 
                  authenticated, 
                  userType: user?.userType,
                  userId: user?.userId,
                  userData: user 
                }, null, 2)}
              </pre>
            </details>
            
            <button 
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mt-4"
            >
              Torna indietro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show ProfileView
  if (profileData) {
    return (
      <ProfileView
        user={profileData}
        onBack={() => window.history.back()}
        onContact={(userId) => {
          console.log('Contattare utente:', userId);
          // TODO: Implementa la logica di contatto
        }}
        isOwnProfile={true}
      />
    );
  }

  // Fallback
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-slate-600">Caricamento dati profilo...</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;