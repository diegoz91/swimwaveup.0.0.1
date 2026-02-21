import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { account } from '../services/appwrite';
import { databaseService } from '../services/database';
import type { Models } from 'appwrite';
import { AuthenticatedUser, UserProfile, StructureProfile } from '@/types';

interface AuthContextType {
  user: AuthenticatedUser | null;
  authenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile | StructureProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref per Rate Limiting
  const loginAttemptRef = useRef<number>(0);
  const lastLoginAttempt = useRef<number>(0);
  const isActionPending = useRef<boolean>(false);

  const loadUserProfile = async (accountData: Models.User<Models.Preferences>): Promise<AuthenticatedUser> => {
    try {
      const userProfile = await databaseService.getUserProfile(accountData.$id);
      return { ...accountData, ...userProfile } as unknown as AuthenticatedUser;
    } catch (userError) {
      try {
        const structureProfile = await databaseService.getStructureProfile(accountData.$id);
        return { ...accountData, ...structureProfile } as unknown as AuthenticatedUser;
      } catch (structureError) {
        console.error('Nessun profilo trovato nel database per l\'utente:', accountData.$id);
        return accountData as unknown as AuthenticatedUser; 
      }
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const accountData = await account.get();
      const userWithProfile = await loadUserProfile(accountData);
      setUser(userWithProfile);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (isActionPending.current) return;
    
    const now = Date.now();
    
    if (now - lastLoginAttempt.current < 60000 && loginAttemptRef.current >= 3) {
      throw new Error('Troppi tentativi falliti. Riprova tra un minuto per sicurezza.');
    }
    
    if (now - lastLoginAttempt.current >= 60000) {
      loginAttemptRef.current = 0;
    }
    
    loginAttemptRef.current++;
    lastLoginAttempt.current = now;
    isActionPending.current = true;
    setIsLoading(true);

    try {
      try {
        await account.createEmailSession(email, password);
        
        const accountData = await account.get();
        const userWithProfile = await loadUserProfile(accountData);
        setUser(userWithProfile);
        
        loginAttemptRef.current = 0;
      } catch (error: any) {
        if (error.type === 'user_session_already_exists') {
          console.log('Una sessione esiste già, tento la rigenerazione silenziosa...');
          try {
            await account.deleteSession('current');
            await new Promise(resolve => setTimeout(resolve, 500));
            await account.createEmailSession(email, password);
            const accountData = await account.get();
            const userWithProfile = await loadUserProfile(accountData);
            setUser(userWithProfile);
            loginAttemptRef.current = 0;
          } catch (retryError) {
            throw new Error('Errore durante la pulizia della sessione. Ricarica la pagina e riprova.');
          }
        } else if (error.code === 429) {
          throw new Error('Il server sta bloccando le richieste (Too Many Requests). Attendi qualche minuto.');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      isActionPending.current = false;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    if (isActionPending.current) return;
    
    isActionPending.current = true;
    setIsLoading(true);
    
    try {
      const account_response = await account.create('unique()', email, password, name);
      await account.createEmailSession(email, password);
      
      await databaseService.initializeUserProfile(account_response);
      await checkAuth();
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
      isActionPending.current = false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error (session might already be dead):', error);
    } finally {
      setUser(null);
      loginAttemptRef.current = 0;
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile | StructureProfile>) => {
    if (!user) throw new Error('Nessun utente loggato');
    
    try {
      await databaseService.updateUserProfile(user.$id, updates as Partial<UserProfile>);
      await refreshProfile();
    } catch (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const accountData = await account.get();
      const updatedProfile = await loadUserProfile(accountData);
      setUser(updatedProfile);
    } catch (error) {
      console.error('refreshProfile error:', error);
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    authenticated: !!user, 
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};