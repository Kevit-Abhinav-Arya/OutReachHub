import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectIsAdmin } from '../features/auth/slices/authSlice';


export const AdminRedirectRoute: React.FC = () => {
  const isAdmin = useAppSelector(selectIsAdmin);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/" replace />;
};