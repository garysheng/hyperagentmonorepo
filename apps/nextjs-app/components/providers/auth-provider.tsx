/**
 * Authentication Provider Component
 * 
 * Improvements made to fix header loading issues:
 * 1. Improved loading state management:
 *    - Initial loading state while checking session
 *    - Loading state properly cleared after initial auth check
 *    - Loading state handled during sign out
 * 2. Better session initialization:
 *    - Properly handles initial session check
 *    - Maintains mounted state to prevent memory leaks
 * 3. Auth state changes:
 *    - Doesn\'t reset loading on auth state change (prevents flicker)
 *    - Properly updates user state
 * 4. Error handling:
 *    - Proper error states for session check
 *    - Error handling during sign out
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  
  useEffect(() => {
    let mounted = true

    // Initialize with current session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return

      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      
      // Don't set loading to false here - it's handled by initializeAuth
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 