import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectIsAuthenticated, selectIsLoading } from '../features/auth/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const location = useLocation();
  


  if (isLoading) {
    console.log('ProtectedRoute: Loading state, showing loading screen');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: '#fff'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" state={{ from: location }}  replace />;
  }

  return <>{children}</>;
};