import type { Opportunity } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Twitter, Mail, Send, MessageSquare, User } from 'lucide-react'
import { ResponseGenerator } from '@/components/ui/response-generator'
import { useCelebrity } from '@/hooks/use-celebrity'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTeamMembers } from '@/hooks/use-team-members'
import { Badge } from '@/components/ui/badge'

interface ReadyForOutreachListProps {
  opportunities: Opportunity[]
  isLoading: boolean
  onSendMessage: (opportunityId: string, message: string) => Promise<void>
}

export function ReadyForOutreachList({ opportunities, isLoading, onSendMessage }: ReadyForOutreachListProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { data: celebrity } = useCelebrity()
  const { data: teamMembers = [] } = useTeamMembers()

  const handleCardClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setMessage('')
  }

  const handleSend = async () => {
    if (!selectedOpportunity || !message.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(selectedOpportunity.id, message)
      setSelectedOpportunity(null)
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const getMessageIcon = (source: Opportunity['source']) => {
    switch (source) {
      case 'TWITTER_DM':
        return <Twitter className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'WIDGET':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getMessageMethod = (source: Opportunity['source']) => {
    switch (source) {
      case 'TWITTER_DM':
        return 'Twitter DM'
      case 'EMAIL':
        return 'Email'
      case 'WIDGET':
        return 'Contact Form'
      default:
        return 'Message'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
      </div>
    )
  }

  if (!opportunities.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No opportunities ready for outreach
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          const assignedMember = teamMembers.find(m => m.id === opportunity.assigned_to)
          
          return (
            <div
              key={opportunity.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleCardClick(opportunity)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getMessageIcon(opportunity.source)}
                    <span className="text-sm text-muted-foreground">
                      via {getMessageMethod(opportunity.source)}
                    </span>
                    {assignedMember && (
                      <Badge variant="outline" className="gap-1">
                        <User className="h-3 w-3" />
                        {assignedMember.full_name}
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium mb-1">{opportunity.sender_handle}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {opportunity.initial_content}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!selectedOpportunity} onOpenChange={(open) => !open && setSelectedOpportunity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send First Response</DialogTitle>
          </DialogHeader>
          
          {selectedOpportunity && (
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getMessageIcon(selectedOpportunity.source)}
                  <span>To: {selectedOpportunity.sender_handle}</span>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{selectedOpportunity.initial_content}</p>
                </div>
              </div>

              {celebrity && (
                <ResponseGenerator
                  type={selectedOpportunity.source === 'TWITTER_DM' ? 'tweet' : 'email'}
                  content={selectedOpportunity.initial_content}
                  celebrityId={celebrity.id}
                  onResponseGenerated={setMessage}
                />
              )}

              <div className="space-y-4">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px]"
                />

                <div className="flex justify-end">
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 
