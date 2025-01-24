import type { Opportunity } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Twitter, Mail } from 'lucide-react'
import { ResponseGenerator } from '@/components/ui/response-generator'
import { useCelebrity } from '@/hooks/use-celebrity'
import { EmailThreadDialog } from '@/components/email/email-thread-dialog'
import { createClient } from '@/lib/supabase/client'
import { TableName } from '@/types'

interface OpportunityListProps {
  opportunities: Opportunity[]
  isLoading: boolean
  onSendMessage: (opportunityId: string, message: string) => Promise<void>
}

export function OpportunityList({ opportunities, isLoading, onSendMessage }: OpportunityListProps) {
  const [messageStates, setMessageStates] = useState<Record<string, { isOpen: boolean; message: string; isSending: boolean }>>({})
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [messages, setMessages] = useState<Array<{
    id: string;
    thread_id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
  }>>([])
  const { data: celebrity } = useCelebrity()
  const [isThreadDialogOpen, setIsThreadDialogOpen] = useState(false)

  const handleCardClick = async (opportunity: Opportunity) => {
    console.log('Card clicked:', opportunity.status);
    if (opportunity.status === 'conversation_started') {
      try {
        const response = await fetch(`/api/messages/thread?opportunityId=${opportunity.id}`)
        if (!response.ok) {
          const error = await response.json()
          console.error('Error fetching thread:', error)
          return
        }

        const { thread, messages } = await response.json()
        console.log('Thread data:', { thread, messages })

        if (messages) {
          setMessages(messages)
          setSelectedOpportunity(opportunity)
          setIsThreadDialogOpen(true)
        }
      } catch (error) {
        console.error('Error fetching thread data:', error)
      }
    } else {
      handleOpenDialog(opportunity)
    }
  }

  const handleOpenDialog = (opportunity: Opportunity) => {
    setMessageStates(prev => ({
      ...prev,
      [opportunity.id]: {
        isOpen: true,
        message: '',
        isSending: false
      }
    }))
  }

  const handleCloseDialog = (opportunityId: string) => {
    setMessageStates(prev => ({
      ...prev,
      [opportunityId]: {
        ...prev[opportunityId],
        isOpen: false
      }
    }))
  }

  const handleMessageChange = (opportunityId: string, message: string) => {
    setMessageStates(prev => ({
      ...prev,
      [opportunityId]: {
        ...prev[opportunityId],
        message
      }
    }))
  }

  const handleSend = async (opportunity: Opportunity) => {
    const state = messageStates[opportunity.id]
    if (!state?.message.trim()) return

    setMessageStates(prev => ({
      ...prev,
      [opportunity.id]: {
        ...prev[opportunity.id],
        isSending: true
      }
    }))

    try {
      await onSendMessage(opportunity.id, state.message)
      setMessageStates(prev => ({
        ...prev,
        [opportunity.id]: {
          isOpen: false,
          message: '',
          isSending: false
        }
      }))
    } catch {
      setMessageStates(prev => ({
        ...prev,
        [opportunity.id]: {
          ...prev[opportunity.id],
          isSending: false
        }
      }))
    }
  }

  const handleThreadMessage = async (message: string) => {
    if (!selectedOpportunity) return
    await onSendMessage(selectedOpportunity.id, message)
    // Don't close the dialog after sending in a thread
    // Instead, wait for the messages to refresh
    const supabase = createClient()
    const { data: threads } = await supabase
      .from(TableName.EMAIL_THREADS)
      .select('id')
      .eq('opportunity_id', selectedOpportunity.id)
      .single()

    if (threads) {
      const { data: emailMessages } = await supabase
        .from(TableName.EMAIL_MESSAGES)
        .select('id, thread_id, content, direction, created_at')
        .eq('thread_id', threads.id)
        .order('created_at', { ascending: true })

      if (emailMessages) {
        setMessages(emailMessages)
      }
    }
  }

  const getMessageIcon = (source: Opportunity['source']) => {
    return source === 'TWITTER_DM' ? <Twitter className="h-4 w-4" /> : <Mail className="h-4 w-4" />
  }

  const getMessageMethod = (source: Opportunity['source']) => {
    return source === 'TWITTER_DM' ? 'Twitter DM' : 'Email'
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
        No opportunities found
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          const state = messageStates[opportunity.id] || { isOpen: false, message: '', isSending: false }
          
          return (
            <div
              key={opportunity.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleCardClick(opportunity)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">From: {opportunity.sender_handle}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {opportunity.initial_content}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-muted-foreground">
                    {new Date(opportunity.created_at).toLocaleDateString()}
                  </div>
                  {opportunity.status !== 'conversation_started' && (
                    <Dialog open={state.isOpen} onOpenChange={(open) => {
                      if (open) {
                        handleOpenDialog(opportunity)
                      } else {
                        handleCloseDialog(opportunity.id)
                      }
                    }}>
                      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="sm">
                          Send First Response
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getMessageIcon(opportunity.source)}
                            Send First Response via {getMessageMethod(opportunity.source)}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">To: {opportunity.sender_handle}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {opportunity.initial_content}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Textarea
                                placeholder="Type your message here..."
                                value={state.message}
                                onChange={(e) => handleMessageChange(opportunity.id, e.target.value)}
                                rows={4}
                                className="min-h-[200px]"
                              />
                              <div className="flex justify-end gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCloseDialog(opportunity.id)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSend(opportunity)
                                  }}
                                  disabled={state.isSending || !state.message.trim()}
                                  className="flex items-center gap-2"
                                >
                                  {getMessageIcon(opportunity.source)}
                                  {state.isSending ? 'Sending...' : 'Send'}
                                </Button>
                              </div>
                            </div>
                            <div>
                              {celebrity && (
                                <ResponseGenerator
                                  type={opportunity.source === 'TWITTER_DM' ? 'tweet' : 'email'}
                                  content={opportunity.initial_content}
                                  celebrityId={celebrity.id}
                                  onResponseGenerated={(response) => handleMessageChange(opportunity.id, response)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedOpportunity && (
        <EmailThreadDialog
          isOpen={isThreadDialogOpen}
          onClose={() => {
            setIsThreadDialogOpen(false)
            setSelectedOpportunity(null)
          }}
          opportunity={selectedOpportunity}
          messages={messages}
          onSendMessage={handleThreadMessage}
        />
      )}
    </>
  )
} 