import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProcure } from '../../context/ProcurementContext';
import { AuthLoadingScreen } from './AuthLoadingScreen';
import { LoginView } from '../../views/LoginView';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { currentRoute, navigateTo } = useProcure();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated && currentRoute !== '/login') {
        // Redirect unauthenticated users immediately to /login
        navigateTo('/login');
      } else if (isAuthenticated && currentRoute === '/login') {
        // Redirect authenticated users from /login to /dashboard
        navigateTo('/dashboard');
      }
    }
  }, [isAuthenticated, isAuthLoading, currentRoute, navigateTo]);

  // While Firebase is initializing auth state, show professional loading screen without flicker
  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  // If unauthenticated and on a protected route, show LoginView immediately while route syncs
  if (!isAuthenticated && currentRoute !== '/login') {
    return <LoginView />;
  }

  return <>{children}</>;
};
