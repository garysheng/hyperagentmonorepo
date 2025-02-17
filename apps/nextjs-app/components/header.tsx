/**
 * Header Component
 * 
 * Improvements made to fix loading issues:
 * 1. Simplified authentication checks:
 *    - Shows navigation whenever user is authenticated
 *    - Removed dependency on profile.hasGoals
 * 2. Better loading states:
 *    - Shows loading header while auth initializes
 *    - Proper skeleton states for profile loading
 * 3. Improved user experience:
 *    - Smooth transitions between states
 *    - Clear loading indicators
 *    - Consistent navigation visibility
 * 4. Sign out handling:
 *    - Proper loading state during sign out
 *    - Error handling for failed sign outs
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Inbound', href: '/inbound' },
  { name: 'Outbound', href: '/outbound' },
  { name: 'Goals', href: '/goals' },
  { name: 'Team', href: '/settings/team' },
  { name: 'Writing Style', href: '/settings/writing-style' },
  { name: 'Channels', href: '/channels' },
]

interface ProfileResponse {
  role: string | null
  celebrity_id: string | null
  celebrity: {
    celebrity_name: string
  } | null
}

export function Header() {
  const pathname = usePathname()
  const { user, loading: authLoading, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()

  // Fetch user profile, celebrity info, and check for goals
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null
      
      // Get user profile and celebrity info
      const { data } = await supabase
        .from('users')
        .select(`
          role,
          celebrity_id,
          celebrity:celebrities(celebrity_name)
        `)
        .eq('id', user.id)
        .single() as { data: ProfileResponse | null, error: Error }

      if (!data?.celebrity_id) return { role: data?.role }

      // Check if celebrity has goals
      const { count } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('celebrity_id', data.celebrity_id)

      return {
        role: data?.role,
        celebrity_name: data.celebrity?.celebrity_name,
        hasGoals: count && count > 0
      }
    },
    enabled: !!user
  })

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <div className="ml-6 mr-6 flex items-center space-x-2">
              <Logo size={24} />
              <span className="font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                HyperAgent
              </span>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="ml-6 mr-6 flex items-center space-x-2 group">
            <Logo size={24} />
            <span className="font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-primary transition-all duration-300">
              HyperAgent
            </span>
          </Link>
          {!!user && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors relative",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transform",
                    "hover:text-primary",
                    pathname === item.href 
                      ? "text-foreground after:bg-gradient-to-r after:from-primary after:to-blue-500" 
                      : "text-foreground/60 after:bg-gradient-to-r after:from-primary/0 after:to-blue-500/0 hover:after:from-primary/40 hover:after:to-blue-500/40"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-primary/20">
                <DropdownMenuLabel className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-t-sm">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/10" />
                <DropdownMenuItem className="flex flex-col items-start focus:bg-primary/5">
                  <span className="font-medium text-primary">{user.email}</span>
                  {isLoadingProfile ? (
                    <Skeleton className="h-4 w-16 mt-1" />
                  ) : (
                    <span className="text-xs text-muted-foreground capitalize">
                      {profile?.role || 'No role assigned'}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/10" />
                <DropdownMenuItem className="flex flex-col items-start focus:bg-primary/5">
                  <span className="text-sm font-medium text-primary">Managing</span>
                  {isLoadingProfile ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {profile?.celebrity_name || 'No celebrity assigned'}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/10" />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/5 focus:text-destructive"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 