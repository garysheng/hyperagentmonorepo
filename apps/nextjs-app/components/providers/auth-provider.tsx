'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

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

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect starting...')
    let mounted = true

    // Initialize with current session
    const initializeAuth = async () => {
      console.log('🔐 Initializing auth with session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session?.user) {
          console.log('✅ Session found:', session.user.email)
          if (mounted) {
            setUser(session.user)
          }
        } else {
          console.log('ℹ️ No active session found')
          if (mounted) {
            setUser(null)
          }
        }
      } catch (error) {
        console.error('❌ Error getting session:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          console.log('🔓 Setting loading to false after session check')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      if (!mounted) return

      if (session?.user) {
        console.log('👤 Setting user from session')
        setUser(session.user)
      } else {
        console.log('👤 Clearing user - no session')
        setUser(null)
      }
      
      setLoading(false)
    })

    return () => {
      console.log('🧹 Cleaning up AuthProvider effect')
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async () => {
    console.log('🚪 Starting sign out process')
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('❌ Error signing out:', error)
    } finally {
      console.log('🔓 Setting loading to false after sign out')
      setLoading(false)
    }
  }

  console.log('🔄 AuthProvider rendering with:', { 
    user: user ? `Authenticated (${user.email})` : 'Not authenticated', 
    loading 
  })

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
  console.log('🎣 useAuth hook called:', { 
    user: context.user ? `Authenticated (${context.user.email})` : 'Not authenticated', 
    loading: context.loading 
  })
  return context
} 