import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'individual' | 'business' | 'enterprise' | 'admin';
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  settings: {
    language: 'en' | 'af';
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    security: {
      twoFactorEnabled: boolean;
      biometricEnabled: boolean;
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Auto-login if token exists
  const { data: profileData } = useQuery(
    'user-profile',
    () => authAPI.getProfile(),
    {
      enabled: !!state.token && !state.user,
      retry: false,
      onSuccess: (data) => {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.user,
            token: state.token!,
          },
        });
      },
      onError: () => {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_LOGOUT' });
      },
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    ({ email, password }: { email: string; password: string }) =>
      authAPI.login(email, password),
    {
      onMutate: () => {
        dispatch({ type: 'AUTH_START' });
      },
      onSuccess: (data) => {
        localStorage.setItem('token', data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
          },
        });
        toast.success('Welcome back!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Login failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    ({ email, name, password, role }: { email: string; name: string; password: string; role?: string }) =>
      authAPI.register(email, name, password, role),
    {
      onMutate: () => {
        dispatch({ type: 'AUTH_START' });
      },
      onSuccess: (data) => {
        localStorage.setItem('token', data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
          },
        });
        toast.success('Account created successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Registration failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        toast.error(message);
      },
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (updates: Partial<User>) => authAPI.updateProfile(updates),
    {
      onSuccess: (data) => {
        dispatch({ type: 'UPDATE_USER', payload: data.user });
        queryClient.invalidateQueries('user-profile');
        toast.success('Profile updated successfully');
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'Profile update failed';
        toast.error(message);
      },
    }
  );

  // Auth functions
  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (email: string, name: string, password: string, role = 'individual') => {
    await registerMutation.mutateAsync({ email, name, password, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    dispatch({ type: 'AUTH_LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<User>) => {
    await updateProfileMutation.mutateAsync(updates);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Set axios defaults when token changes
  useEffect(() => {
    if (state.token) {
      authAPI.setAuthToken(state.token);
    } else {
      authAPI.removeAuthToken();
    }
  }, [state.token]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;