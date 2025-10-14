import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle admin redirects
 * Returns a function that redirects users to the appropriate dashboard based on their role
 */
export const useAdminRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const redirectToDashboard = () => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return { redirectToDashboard };
};

/**
 * Utility function to get the appropriate dashboard path for a user
 */
export const getDashboardPath = (user) => {
  if (user && user.role === 'admin') {
    return '/admin';
  }
  return '/dashboard';
};

/**
 * Utility function to check if a user is an admin
 */
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};
