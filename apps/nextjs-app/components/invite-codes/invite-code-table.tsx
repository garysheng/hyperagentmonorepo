import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useInviteCodeList } from '@/hooks/use-invite-code-list'
import { useCelebrity } from '@/hooks/use-celebrity'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function InviteCodeTable() {
  const { data: inviteCodes, isLoading, error } = useInviteCodeList()
  const { data: celebrity } = useCelebrity()
  const { toast } = useToast()

  const generateInviteMessage = (code: string, role: string) => {
    return `Hi! You've been invited to join the Hyperagent team for ${celebrity?.celebrity_name || 'our celebrity'}.

Hyperagent is a platform that helps manage and prioritize social media opportunities for celebrities and public figures. As a ${role === 'admin' ? 'team administrator' : 'support team member'}, you'll help manage incoming opportunities and ensure we're focusing on the most impactful collaborations.

To get started:
1. Visit: ${window.location.origin}/login
2. Click "Join Existing Team"
3. Enter your invite code: ${code}

This invite code will expire in 7 days. Looking forward to working with you!`
  }

  const handleCopy = async (code: string, role: string) => {
    const message = generateInviteMessage(code, role)
    await navigator.clipboard.writeText(message)
    toast({
      title: 'Copied!',
      description: 'Invite message copied to clipboard',
    })
  }

  if (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Failed to load invite codes
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (!inviteCodes?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No invite codes generated yet
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Used By</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inviteCodes.map((code) => (
          <TableRow key={code.id}>
            <TableCell className="font-mono">{code.code}</TableCell>
            <TableCell>
              <Badge variant={code.role === 'admin' ? 'default' : 'secondary'}>
                {code.role === 'admin' ? 'Admin' : 'Support Agent'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={code.used_at ? 'outline' : 'default'}>
                {code.used_at ? 'Used' : 'Available'}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(code.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(code.expires_at), { addSuffix: true })}
            </TableCell>
            <TableCell>
              {code.users ? (
                <div className="flex flex-col">
                  <span className="font-medium">{code.users.full_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {code.users.email}
                  </span>
                </div>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              {!code.used_at && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(code.code, code.role)}
                  title="Copy invite message"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 