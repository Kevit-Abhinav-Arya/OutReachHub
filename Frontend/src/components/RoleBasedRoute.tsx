import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectIsAdmin, selectIsEditor, selectIsViewer } from '../features/auth/slices/authSlice';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'editor' | 'viewer';
  fallbackPath?: string;
  adminAllowed?: boolean; 
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/',
  adminAllowed = true 
}) => {
  const isAdmin = useAppSelector(selectIsAdmin);
  const isEditor = useAppSelector(selectIsEditor);
  const isViewer = useAppSelector(selectIsViewer);

  if (isAdmin && !adminAllowed) {
    return <Navigate to="/admin" replace />;
  }

  const hasPermission = () => {
    switch (requiredRole) {
      case 'admin':
        return isAdmin;
      case 'editor':
        return isAdmin || isEditor;
      case 'viewer':
        return isAdmin || isEditor || isViewer; 
      default:
        return false;
    }
  };

  if (!hasPermission()) {
    const redirectPath = isAdmin ? '/admin' : fallbackPath;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};