import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Homepage from '../pages/Homepage';

const SmartRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  // If user is not authenticated, show homepage
  if (!isAuthenticated) {
    return <Homepage />;
  }

  // If user is admin, redirect to admin dashboard
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Otherwise redirect to regular dashboard
  return <Navigate to="/dashboard" replace />;
};

export default SmartRedirect;
