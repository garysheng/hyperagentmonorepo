'use client'

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
import { PreviewInviteDialog } from './preview-invite-dialog'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export function InviteCodeTable() {
  const { data: inviteCodes, isLoading, error } = useInviteCodeList()
  const { data: celebrity } = useCelebrity()
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch invite codes',
        variant: 'destructive',
      })
    }
  }, [error, toast])

  const generateInviteMessage = (code: string, role: string) => {
    return `Hi! You've been invited to join the Hyperagent team for ${celebrity?.celebrity_name || 'our celebrity'}.

Hyperagent is a platform that helps manage and prioritize social media opportunities for celebrities and public figures. As a ${role === 'admin' ? 'team administrator' : 'support team member'}, you'll help manage incoming opportunities and ensure we're focusing on the most impactful collaborations.

To get started:
1. Visit: ${window.location.origin}/login
2. Click "Join Existing Team"
3. Enter your invite code: ${code}

This invite code will expire in 7 days. Looking forward to working with you!`
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
              {code.user_info ? (
                <div className="flex flex-col">
                  <span className="font-medium">{code.user_info.raw_user_meta_data.full_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {code.user_info.email}
                  </span>
                </div>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              {!code.used_at && (
                <PreviewInviteDialog
                  code={code.code}
                  role={code.role === 'admin' ? 'Admin' : 'Support Agent'}
                  message={generateInviteMessage(code.code, code.role)}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 