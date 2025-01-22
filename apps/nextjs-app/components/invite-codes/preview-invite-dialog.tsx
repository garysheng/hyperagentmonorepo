'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Eye, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface PreviewInviteDialogProps {
  code: string
  role: string
  message: string
}

export function PreviewInviteDialog({ code, role, message: defaultMessage }: PreviewInviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(defaultMessage)
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    toast({
      title: 'Copied!',
      description: 'Invite message copied to clipboard',
    })
    setOpen(false)
  }

  const handleReset = () => {
    setMessage(defaultMessage)
    toast({
      title: 'Reset',
      description: 'Message restored to default',
    })
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (newOpen) {
          setMessage(defaultMessage)
        }
        setOpen(newOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Preview and copy invite message"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Message Preview</DialogTitle>
          <DialogDescription>
            Preview, edit, and copy the invite message for {role.toLowerCase()} role
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="rounded-md bg-muted p-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px] font-mono text-sm bg-transparent border-none resize-none focus-visible:ring-0"
              placeholder="Edit invite message..."
            />
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{message.length} characters</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleReset}
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Reset to Default
            </Button>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 