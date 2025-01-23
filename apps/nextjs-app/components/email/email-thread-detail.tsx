'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { EmailThread, EmailMessage } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Archive, AlertTriangle, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

interface EmailThreadDetailProps {
  thread: EmailThread
  messages: EmailMessage[]
  onSendMessage: (message: string) => Promise<void>
  onUpdateStatus: (status: EmailThread['status']) => Promise<void>
  isLoading?: boolean
}

function getStatusIcon(status: EmailThread['status']) {
  switch (status) {
    case 'active':
      return <Mail className="h-4 w-4" />
    case 'archived':
      return <Archive className="h-4 w-4" />
    case 'spam':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return null
  }
}

export function EmailThreadDetail({
  thread,
  messages,
  onSendMessage,
  onUpdateStatus,
  isLoading
}: EmailThreadDetailProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(newMessage)
      setNewMessage('')
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.'
      })
    } catch (err) {
      console.error('Error sending message:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send message. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusChange = async (status: EmailThread['status']) => {
    try {
      await onUpdateStatus(status)
      toast({
        title: 'Status updated',
        description: `Thread marked as ${status}.`
      })
    } catch (err) {
      console.error('Error updating status:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update status. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
        </Card>
        <Card className="flex-1 mt-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(thread.status)}
            <span className="line-clamp-1">{thread.subject}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {thread.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange('archived')}
              disabled={thread.status === 'archived'}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange('spam')}
              disabled={thread.status === 'spam'}
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="flex-1 mt-4">
        <ScrollArea className="h-full">
          <CardContent className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-2 ${
                  message.direction === 'outbound' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.direction === 'outbound'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.direction === 'outbound' ? 'You' : message.from}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(message.created_at, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              className="self-end"
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 