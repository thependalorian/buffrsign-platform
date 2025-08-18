'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string
  account_type: 'individual' | 'business' | 'enterprise' | 'government'
  is_verified: boolean
  created_at: string
  avatar?: string
  company_name?: string
  phone?: string
  namibian_id?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  verifyIdentity: (namibianId: string) => Promise<void>
  isAuthenticated: boolean
}

interface SignUpData {
  email: string
  password: string
  full_name: string
  account_type: 'individual' | 'business' | 'enterprise' | 'government'
  phone?: string
  company_name?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('buffrsign_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('buffrsign_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('buffrsign_token')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Store token
      localStorage.setItem('buffrsign_token', data.access_token)
      
      // Set user data
      setUser(data.user)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const signUp = async (userData: SignUpData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Registration failed')
      }

      const newUser = await response.json()
      
      // Auto-login after registration
      await signIn(userData.email, userData.password)
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Remove token
      localStorage.removeItem('buffrsign_token')
      
      // Clear user state
      setUser(null)
      
      // Redirect to login
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('buffrsign_token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Profile update failed')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const verifyIdentity = async (namibianId: string) => {
    try {
      const token = localStorage.getItem('buffrsign_token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-identity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ namibian_id: namibianId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Identity verification failed')
      }

      // Refresh user data
      await checkAuthStatus()
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    verifyIdentity,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/login')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}

// Hook for checking specific permissions
export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    const permissions: Record<string, string[]> = {
      individual: ['view_documents', 'create_documents', 'sign_documents'],
      business: ['view_documents', 'create_documents', 'sign_documents', 'manage_team', 'view_analytics'],
      enterprise: ['view_documents', 'create_documents', 'sign_documents', 'manage_team', 'view_analytics', 'manage_templates', 'compliance_reports', 'api_access'],
      government: ['view_documents', 'create_documents', 'sign_documents', 'manage_team', 'view_analytics', 'manage_templates', 'compliance_reports', 'api_access', 'government_integration', 'audit_access']
    }

    return permissions[user.account_type]?.includes(permission) || false
  }

  const canAccessFeature = (feature: string): boolean => {
    const featurePermissions: Record<string, string> = {
      'ai_analysis': 'ai_features',
      'advanced_signatures': 'advanced_signatures',
      'bulk_operations': 'bulk_operations',
      'custom_branding': 'custom_branding',
      'sso': 'sso_integration',
      'api': 'api_access'
    }

    return hasPermission(featurePermissions[feature] || feature)
  }

  return {
    hasPermission,
    canAccessFeature,
    isIndividual: user?.account_type === 'individual',
    isBusiness: user?.account_type === 'business',
    isEnterprise: user?.account_type === 'enterprise',
    isGovernment: user?.account_type === 'government'
  }
}
