import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <Image
      src="/android-chrome-512x512.png"
      alt="HyperAgent Logo"
      width={size}
      height={size}
      className={cn('rounded-lg', className)}
      priority
    />
  )
} 