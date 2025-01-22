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
import { Copy, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

interface PreviewInviteDialogProps {
  code: string
  role: string
  message: string
}

export function PreviewInviteDialog({ code, role, message }: PreviewInviteDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message)
    toast({
      title: 'Copied!',
      description: 'Invite message copied to clipboard',
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Preview and copy the invite message for {role.toLowerCase()} role
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm">{message}</pre>
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