import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'issuer' | 'candidate' | 'organization';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;