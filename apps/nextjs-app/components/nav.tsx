'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Inbox', href: '/dashboard/inbox' },
  { name: 'Settings', href: '/dashboard/settings' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-4">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-md hover:bg-accent',
            pathname === item.href
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
} 