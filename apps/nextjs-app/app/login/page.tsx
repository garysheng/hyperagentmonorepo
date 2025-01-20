'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { signIn } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await signIn(email, password)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <AuthForm mode="login" onSubmit={onSubmit} />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/register" className="hover:text-brand underline underline-offset-4">
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
} 