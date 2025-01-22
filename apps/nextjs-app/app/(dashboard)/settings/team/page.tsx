import { GenerateInviteDialog } from '@/components/invite-codes/generate-invite-dialog'
import { InviteCodeTable } from '@/components/invite-codes/invite-code-table'
import { Separator } from '@/components/ui/separator'

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage your team members and invite codes.
        </p>
      </div>
      
      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium">Invite Codes</h4>
            <p className="text-sm text-muted-foreground">
              Generate and manage invite codes for new team members.
            </p>
          </div>
          <GenerateInviteDialog />
        </div>

        <InviteCodeTable />
      </div>
    </div>
  )
} 