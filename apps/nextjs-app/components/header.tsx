'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Inbound', href: '/inbound' },
  { name: 'Outbound', href: '/outbound' },
  { name: 'Goals', href: '/goals' },
  { name: 'Channels', href: '/channels' },
]

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()

  // Fetch user profile, celebrity info, and check for goals
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null
      
      // Get user profile and celebrity info
      const { data } = await supabase
        .from('users')
        .select('role, celebrity_id, celebrities!inner(celebrity_name)')
        .eq('id', user.id)
        .single()

      if (!data?.celebrity_id) return { role: data?.role }

      // Check if celebrity has goals
      const { count } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('celebrity_id', data.celebrity_id)

      return {
        role: data?.role,
        celebrity_name: data?.celebrities?.[0]?.celebrity_name,
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" key={`${profile?.celebrity_name}-${pathname}`}>
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="ml-6 mr-6 flex items-center space-x-2">
            <span className="font-bold">HyperAgent</span>
          </Link>
          {!!user && !!profile?.hasGoals && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href ? "text-foreground" : "text-foreground/60"
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
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="font-medium">{user.email}</span>
                  <span className="text-xs text-muted-foreground capitalize">{profile?.role || 'Loading...'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="text-sm font-medium">Managing</span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.celebrity_name || 'Loading...'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 