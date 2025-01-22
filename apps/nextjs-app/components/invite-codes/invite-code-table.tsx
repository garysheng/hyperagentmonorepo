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
import { Skeleton } from '@/components/ui/skeleton'

export function InviteCodeTable() {
  const { data: inviteCodes, isLoading, error } = useInviteCodeList()

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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 