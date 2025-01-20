'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { signUp } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await signUp(email, password)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    toast({
      title: 'Success',
      description: 'Please check your email to confirm your account.',
    })
    router.push('/login')
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <AuthForm mode="register" onSubmit={onSubmit} />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  )
} 