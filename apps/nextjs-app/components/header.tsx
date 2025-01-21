'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Inbound', href: '/inbound' },
  { name: 'Outbound', href: '/outbound' },
  { name: 'Goals', href: '/goals' },
]

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="ml-6 mr-6 flex items-center space-x-2">
            <span className="font-bold">HyperAgent</span>
          </Link>
          {user && (
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
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
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