import type { Opportunity } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import { Twitter, Mail, AlertCircle, Send, X } from 'lucide-react'
import { ResponseGenerator } from '@/components/ui/response-generator'
import { useCelebrity } from '@/hooks/use-celebrity'
import { EmailThreadDialog } from '@/components/email/email-thread-dialog'
import { createClient } from '@/lib/supabase/client'
import { TableName } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const [lastMessageDirections, setLastMessageDirections] = useState<Record<string, 'inbound' | 'outbound'>>({})
  const [lastMessages, setLastMessages] = useState<Record<string, { content: string; created_at: string }>>({})

  useEffect(() => {
    // Only fetch for conversation_started opportunities
    const conversationOpportunities = opportunities.filter(opp => opp.status === 'conversation_started')
    
    async function fetchLastMessageDirections() {
      const directions: Record<string, 'inbound' | 'outbound'> = {}
      const messages: Record<string, { content: string; created_at: string }> = {}
      
      for (const opportunity of conversationOpportunities) {
        try {
          const response = await fetch(`/api/messages/thread?opportunityId=${opportunity.id}`)
          if (!response.ok) continue
          
          const { messages: threadMessages } = await response.json()
          if (threadMessages && threadMessages.length > 0) {
            const lastMessage = threadMessages[threadMessages.length - 1]
            directions[opportunity.id] = lastMessage.direction
            messages[opportunity.id] = {
              content: lastMessage.content,
              created_at: lastMessage.created_at
            }
          }
        } catch (error) {
          console.error('Error fetching thread for opportunity:', opportunity.id, error)
        }
      }
      
      setLastMessageDirections(directions)
      setLastMessages(messages)
    }

    if (conversationOpportunities.length > 0) {
      fetchLastMessageDirections()
    }
  }, [opportunities])

  const handleCardClick = async (opportunity: Opportunity) => {
    console.log('Card clicked:', opportunity.status);
    try {
      // For non-started conversations, just show the dialog with empty messages
      if (opportunity.status !== 'conversation_started') {
        setMessages([])
        setSelectedOpportunity(opportunity)
        setIsThreadDialogOpen(true)
        return
      }

      const response = await fetch(`/api/messages/thread?opportunityId=${opportunity.id}`)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Error fetching thread:', data.error || 'Unknown error')
        return
      }

      const { thread, messages } = data
      console.log('Thread data:', { thread, messages })

      setMessages(messages || [])
      setSelectedOpportunity(opportunity)
      setIsThreadDialogOpen(true)
      
      // Update last message direction if there are messages
      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        setLastMessageDirections(prev => ({
          ...prev,
          [opportunity.id]: lastMessage.direction
        }))
      }
    } catch (error) {
      console.error('Error fetching thread data:', error)
      // Still show the dialog with empty messages in case of error
      setMessages([])
      setSelectedOpportunity(opportunity)
      setIsThreadDialogOpen(true)
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
          const lastMessageDirection = lastMessageDirections[opportunity.id]
          const lastMessage = lastMessages[opportunity.id]
          const needsResponse = lastMessageDirection === 'inbound'
          
          return (
            <div
              key={opportunity.id}
              className={cn(
                "p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                needsResponse && "border-yellow-500 dark:border-yellow-400"
              )}
              onClick={() => handleCardClick(opportunity)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">From: {opportunity.sender_handle}</p>
                    {needsResponse && (
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Response Needed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {opportunity.status === 'conversation_started' && lastMessage ? (
                      <>
                        <span className="block text-xs text-muted-foreground mb-1">
                          Last message {lastMessageDirection === 'inbound' ? 'from them' : 'from us'} • {new Date(lastMessage.created_at).toLocaleString()}
                        </span>
                        {lastMessage.content}
                      </>
                    ) : (
                      opportunity.initial_content
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-muted-foreground">
                    Started {new Date(opportunity.created_at).toLocaleDateString()}
                  </div>
                  {opportunity.status !== 'conversation_started' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                        }}>
                          Send First Response
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader className="border-b pb-4">
                          <DialogTitle className="flex items-center gap-2 text-xl">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                              Send First Response via {opportunity.source === 'TWITTER_DM' ? 'Twitter DM' : 'Email'}
                            </span>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="py-4">
                          <div className="mb-6">
                            <div className="text-sm font-medium text-blue-400 mb-1">To: {opportunity.sender_handle}</div>
                            <div className="p-4 rounded-lg bg-muted/50 border border-blue-500/20">
                              <p className="whitespace-pre-wrap text-sm">{opportunity.initial_content}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Textarea
                              value={state.message}
                              onChange={(e) => handleMessageChange(opportunity.id, e.target.value)}
                              placeholder="Type your response..."
                              className="min-h-[150px] border-blue-500/20 focus:border-blue-500 transition-colors"
                            />
                            <div className="flex justify-end gap-2">
                              <ResponseGenerator
                                content={opportunity.initial_content}
                                type={opportunity.source === 'TWITTER_DM' ? 'tweet' : 'email'}
                                celebrityId={opportunity.celebrity_id}
                                onResponseGenerated={(response) => handleMessageChange(opportunity.id, response)}
                              />
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSend(opportunity);
                                }}
                                disabled={state.isSending}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              >
                                {state.isSending ? (
                                  <>
                                    <span className="animate-pulse">Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Response
                                  </>
                                )}
                              </Button>
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