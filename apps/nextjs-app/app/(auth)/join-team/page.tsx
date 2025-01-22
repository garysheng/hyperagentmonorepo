'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { joinTeam } from './actions'

export default function JoinTeamPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    const result = await joinTeam(formData)
    
    if (result?.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      })
    } else if (result?.success) {
      toast({
        title: 'Success',
        description: 'Successfully joined team'
      })
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 bg-muted items-center justify-center p-8">
        <div className="max-w-lg space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Join Your Team</h1>
            <p className="text-muted-foreground text-lg">
              Use your invite code to join your celebrity\'s team and start managing opportunities
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Get Started Quickly</h2>
              <p className="text-muted-foreground">
                Enter your invite code to join the team. You\'ll get access based on your assigned role.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Collaborate Seamlessly</h2>
              <p className="text-muted-foreground">
                Work together with your team to manage opportunities and achieve your celebrity\'s goals.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4">
        <Card className="p-6 space-y-6 w-full max-w-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Join Team</h1>
            <p className="text-muted-foreground">
              Enter your invite code to join your team
            </p>
          </div>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input 
                id="inviteCode" 
                name="inviteCode" 
                placeholder="Enter your invite code" 
                required 
              />
            </div>
            <Button type="submit" className="w-full">
              Join Team
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 