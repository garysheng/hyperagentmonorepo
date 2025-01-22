import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Twitter, Mail } from 'lucide-react'
import type { Opportunity } from '@/types'

interface MessageDraftDialogProps {
  opportunity: Opportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (message: string) => Promise<void>
}

export function MessageDraftDialog({ opportunity, open, onOpenChange, onSend }: MessageDraftDialogProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  if (!opportunity) return null

  const getPlatformInfo = () => {
    switch (opportunity.source) {
      case 'TWITTER_DM':
        return {
          icon: <Twitter className="h-4 w-4" />,
          name: 'Twitter DM',
          description: 'This message will be sent as a Twitter Direct Message.'
        }
      case 'WIDGET':
        return {
          icon: <Mail className="h-4 w-4" />,
          name: 'Email',
          description: 'This message will be sent as an email to their provided address.'
        }
      default:
        return {
          icon: null,
          name: 'Unknown Platform',
          description: 'Unable to determine message platform.'
        }
    }
  }

  const platform = getPlatformInfo()

  const handleSend = async () => {
    if (!message.trim()) return
    
    setIsSending(true)
    try {
      await onSend(message)
      setMessage('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {platform.icon}
            <DialogTitle>Draft {platform.name} Message</DialogTitle>
          </div>
          <DialogDescription>
            {platform.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Original Message */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">@{opportunity.sender_handle}</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{opportunity.initial_content}</p>
            {opportunity.goal && (
              <Badge variant="outline" className="text-xs">
                {opportunity.goal.name}
              </Badge>
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Your Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Type your ${platform.name} message here...`}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!message.trim() || isSending}>
            {isSending ? 'Sending...' : `Send ${platform.name}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 