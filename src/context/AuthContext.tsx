import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  signOutUser as fbSignOutUser,
  onAuthStateChanged,
  User,
} from '../services/firebase';
import { UserProfile } from '../types/procurement';
import { CURRENT_USER } from '../data/mockProcurementData';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  // Fallback demo sign-in for testing without popup restrictions
  signInWithDemo: (persona?: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatUserProfile = (firebaseUser: User): UserProfile => {
  const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Enterprise User';
  return {
    id: firebaseUser.uid,
    name: name,
    email: firebaseUser.email || '',
    role: 'Procurement Director',
    department: 'Procurement & Supply Chain',
    avatarUrl:
      firebaseUser.photoURL ||
      CURRENT_USER.avatarUrl,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Firebase auth state changes with persistent session
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setUserProfile(formatUserProfile(firebaseUser));
          setAuthError(null);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setIsAuthLoading(false);
      },
      (error) => {
        console.error('onAuthStateChanged error:', error);
        setAuthError('Authentication service encountered an error.');
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsAuthLoading(true);
      setAuthError(null);
      const fbUser = await fbSignInWithGoogle();
      setUser(fbUser);
      setUserProfile(formatUserProfile(fbUser));
    } catch (err: any) {
      const message = err.message || 'Unable to sign in. Please try again.';
      setAuthError(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<void> => {
    try {
      setIsAuthLoading(true);
      setAuthError(null);
      const fbUser = await fbSignInWithEmail(email, pass);
      setUser(fbUser);
      setUserProfile(formatUserProfile(fbUser));
    } catch (err: any) {
      const message = err.message || 'Unable to sign in. Please try again.';
      setAuthError(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string
  ): Promise<void> => {
    try {
      setIsAuthLoading(true);
      setAuthError(null);
      const fbUser = await fbSignUpWithEmail(email, pass, displayName);
      setUser(fbUser);
      setUserProfile(formatUserProfile(fbUser));
    } catch (err: any) {
      const message = err.message || 'Unable to create account. Please try again.';
      setAuthError(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsAuthLoading(true);
      await fbSignOutUser();
      setUser(null);
      setUserProfile(null);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || 'Unable to sign out. Please try again.');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signInWithDemo = (persona: UserProfile = CURRENT_USER) => {
    // Allows demo preview testing if environment blocks popups
    setUserProfile(persona);
    setAuthError(null);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isAuthenticated: !!user || !!userProfile,
    isAuthLoading,
    authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearAuthError,
    signInWithDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
