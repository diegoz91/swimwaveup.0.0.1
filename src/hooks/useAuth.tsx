// src/hooks/useAuth.tsx - CON RATE LIMITING
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { account, databases } from '../services/appwrite';
import { APPWRITE_CONFIG } from '../utils/constants';
import { databaseService } from '../services/database';
import type { Models } from 'appwrite';
import { AuthenticatedUser } from '@/types';

interface AuthContextType {
  user: AuthenticatedUser | null;
  authenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loginAttemptRef = useRef<number>(0);
  const lastLoginAttempt = useRef<number>(0);

  // Load user profile data
  const loadUserProfile = async (session: Models.Session): Promise<AuthenticatedUser> => {
    try {
      // Try to get user profile first
      const userProfile = await databaseService.getUserProfile(session.userId);
      return { ...session, ...userProfile } as AuthenticatedUser;
    } catch (userError) {
      try {
        // If user profile fails, try structure profile
        const structureProfile = await databaseService.getStructureProfile(session.userId);
        return { ...session, ...structureProfile } as AuthenticatedUser;
      } catch (structureError) {
        console.error('No profile found for user:', session.userId);
        throw new Error('Profile not found');
      }
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    try {
      const session = await account.getSession('current');
      const userWithProfile = await loadUserProfile(session);
      setUser(userWithProfile);
    } catch (error) {
      console.log('No active session');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ FIXED: Rate limiting e gestione sessioni esistenti
  const login = async (email: string, password: string) => {
    const now = Date.now();
    
    // Rate limiting: massimo 3 tentativi ogni 60 secondi
    if (now - lastLoginAttempt.current < 60000 && loginAttemptRef.current >= 3) {
      throw new Error('Troppi tentativi di login. Riprova tra un minuto.');
    }
    
    if (now - lastLoginAttempt.current >= 60000) {
      loginAttemptRef.current = 0;
    }
    
    loginAttemptRef.current++;
    lastLoginAttempt.current = now;

    try {
      setIsLoading(true);
      
      try {
        // Try to create session normally
        const session = await account.createEmailSession(email, password);
        const userWithProfile = await loadUserProfile(session);
        setUser(userWithProfile);
        // Reset counter on successful login
        loginAttemptRef.current = 0;
      } catch (error: any) {
        // If session already exists, delete it and try again
        if (error.type === 'user_session_already_exists') {
          console.log('Session already exists, deleting and retrying...');
          try {
            await account.deleteSession('current');
            // Wait a bit before retry to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (deleteError) {
            console.warn('Error deleting existing session:', deleteError);
          }
          
          // Retry login after delay
          const session = await account.createEmailSession(email, password);
          const userWithProfile = await loadUserProfile(session);
          setUser(userWithProfile);
          // Reset counter on successful login
          loginAttemptRef.current = 0;
        } else if (error.code === 429) {
          throw new Error('Troppi tentativi di accesso. Attendi qualche minuto prima di riprovare.');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Registration without automatic login
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Create account
      const account_response = await account.create('unique()', email, password, name);
      
      // Initialize user profile using the account ID
      await databaseService.initializeUserProfile({
        $id: account_response.$id,
        name,
        email
      });
      
      // Don't create session automatically - user will need to login
      // This prevents session conflicts
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      // Reset login attempts on logout
      loginAttemptRef.current = 0;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // updateProfile function
  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Handle different types of updates
      const dbUpdates: any = { ...updates };
      
      // SPECIAL HANDLING: Experience List
      if (updates.experienceList) {
        await databaseService.updateUserProfile(user.$id, {
          experienceList: updates.experienceList
        });
        await refreshProfile();
        return;
      }
      
      // SPECIAL HANDLING: Certifications List  
      if (updates.certificationsList) {
        await databaseService.updateUserProfile(user.$id, {
          certificationsList: updates.certificationsList
        });
        await refreshProfile();
        return;
      }
      
      // REGULAR UPDATES: Use database service for all other updates
      await databaseService.updateUserProfile(user.$id, dbUpdates);
      await refreshProfile();
      
    } catch (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
  };

  // refreshProfile function  
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const session = await account.getSession('current');
      const updatedProfile = await loadUserProfile(session);
      setUser(updatedProfile);
    } catch (error) {
      console.error('refreshProfile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    authenticated: !!user, // true se user esiste
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