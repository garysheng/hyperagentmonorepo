import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import type { Opportunity } from '@/types'

interface ApproveButtonProps {
  opportunity: Opportunity
}

export function ApproveButton({ opportunity }: ApproveButtonProps) {
  const [isApproving, setIsApproving] = useState(false)
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ 
          status: 'approved',
          relevance_score: 4,
          status_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunity.id)

      if (error) throw error

      toast({
        title: 'Opportunity approved',
        description: 'The opportunity has been moved to outbound messages.'
      })

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['opportunity', opportunity.id] })
    } catch (error) {
      console.error('Error approving opportunity:', error)
      toast({
        title: 'Error approving opportunity',
        description: 'There was a problem approving this opportunity. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsApproving(false)
    }
  }

  if (opportunity.status === 'approved') {
    return (
      <Button variant="outline" size="sm" className="w-full" disabled>
        <Check className="mr-2 h-4 w-4" />
        Approved
      </Button>
    )
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      className="w-full"
      onClick={handleApprove}
      disabled={isApproving || opportunity.status === 'rejected'}
    >
      {isApproving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Approving...
        </>
      ) : (
        'Approve'
      )}
    </Button>
  )
} 