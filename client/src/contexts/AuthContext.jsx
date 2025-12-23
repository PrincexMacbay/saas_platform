import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

// Try to restore user from localStorage on initial load
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: !!localStorage.getItem('token') && !!getStoredUser(),
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      // Persist user data to localStorage
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      const updatedUser = { ...state.user, ...action.payload };
      // Persist updated user to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = getStoredUser();
      
      // If we have both token and stored user, we can set authenticated state immediately
      // This prevents the logout/login flash on page reload
      if (token && storedUser) {
        // Set authenticated state immediately with stored user
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: storedUser, token },
        });
        
        // Then verify the token is still valid by fetching fresh user data
        // This happens in the background without affecting the UI
        try {
          const user = await authService.getProfile();
          // Update with fresh user data if different
          if (JSON.stringify(user) !== JSON.stringify(storedUser)) {
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          }
        } catch (error) {
          console.error('Failed to verify user profile:', error);
          // Token might be expired, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else if (token) {
        // We have a token but no stored user, fetch user data
        try {
          const user = await authService.getProfile();
          localStorage.setItem('user', JSON.stringify(user));
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No token, clear any stale user data
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;
      
      // Persist both token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user, token, emailVerificationRequired } = response.data;
      
      // Don't log in automatically if email verification is required
      if (emailVerificationRequired || !token) {
        // Registration successful but email verification needed
        return { 
          success: true, 
          user,
          message: response.data.message || 'Please check your email to verify your account',
          emailVerificationRequired: true
        };
      }
      
      // If token is provided (shouldn't happen with email verification, but handle it)
      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      }
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || [],
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // Helper function to manually set user (for auto-login after email verification)
  const setUser = (userData) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    if (userData.user) {
      localStorage.setItem('user', JSON.stringify(userData.user));
    }
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: userData,
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};