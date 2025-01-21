'use client'

import { useState } from 'react'
import { MoreHorizontal, Star, Flag, Users, MessageSquare, Target, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useOpportunityActions } from '@/hooks/use-opportunity-actions'
import { useGoals } from '@/hooks/use-goals'
import { useTeamMembers } from '@/hooks/use-team-members'
import type { DM } from '@/types'

interface DMActionsProps {
  dm: DM
}

export function DMActions({ dm }: DMActionsProps) {
  const { toast } = useToast()
  const [showRelevanceDialog, setShowRelevanceDialog] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [relevanceScore, setRelevanceScore] = useState(dm.relevance_score)
  const [explanation, setExplanation] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  const actions = useOpportunityActions(dm.id)
  const { data: goals = [], isLoading: isLoadingGoals } = useGoals()
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useTeamMembers()

  const handleUpgradeRelevance = () => {
    actions.upgradeRelevance(relevanceScore, explanation)
    setShowRelevanceDialog(false)
    setExplanation('')
  }

  const handleDowngradeRelevance = () => {
    actions.downgradeRelevance(explanation)
    setShowDowngradeDialog(false)
    setExplanation('')
  }

  const handleAssignGoal = () => {
    if (selectedGoalId) {
      actions.assignGoal(selectedGoalId)
      setShowGoalDialog(false)
      setSelectedGoalId('')
    }
  }

  const handleAssignUser = async () => {
    if (selectedUserId) {
      try {
        const selectedMember = teamMembers.find(m => m.id === selectedUserId)
        await actions.assignUser(selectedUserId)
        toast({
          title: "Team member assigned",
          description: `DM has been assigned to ${selectedMember?.full_name}`,
        })
        setShowAssignDialog(false)
        setSelectedUserId('')
      } catch (error) {
        toast({
          title: "Assignment failed",
          description: "Failed to assign team member. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setShowRelevanceDialog(true)}
            disabled={actions.isLoading}
          >
            <Star className="mr-2 h-4 w-4" />
            Upgrade Relevance
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDowngradeDialog(true)}
            disabled={actions.isLoading}
          >
            <Star className="mr-2 h-4 w-4" />
            Downgrade to Irrelevant
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowGoalDialog(true)}
            disabled={actions.isLoading}
          >
            <Target className="mr-2 h-4 w-4" />
            Assign to Goal
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowAssignDialog(true)}
            disabled={actions.isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign to Team Member
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.flagDiscussion(!dm.needs_discussion)}
            disabled={actions.isLoading}
          >
            <Users className="mr-2 h-4 w-4" />
            {dm.needs_discussion ? 'Remove Discussion Flag' : 'Flag for Discussion'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => actions.updateStatus('on_hold')}
            disabled={actions.isLoading}
          >
            <Flag className="mr-2 h-4 w-4" />
            Put on Hold
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showRelevanceDialog} onOpenChange={setShowRelevanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Relevance Score</DialogTitle>
            <DialogDescription>
              Please explain why you're overriding the AI's relevance score.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="score">New Score (1-5)</Label>
              <Input
                id="score"
                type="number"
                min={1}
                max={5}
                value={relevanceScore}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRelevanceScore(Number(e.target.value))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                value={explanation}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setExplanation(e.target.value)
                }
                placeholder="Why are you changing the relevance score?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRelevanceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgradeRelevance}
              disabled={!explanation || actions.isLoading}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Downgrade to Irrelevant</DialogTitle>
            <DialogDescription>
              Please explain why this DM should be marked as irrelevant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                value={explanation}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setExplanation(e.target.value)
                }
                placeholder="Why is this DM irrelevant?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDowngradeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDowngradeRelevance}
              disabled={!explanation || actions.isLoading}
            >
              Mark as Irrelevant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Goal</DialogTitle>
            <DialogDescription>
              Select a goal to assign this DM to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal</Label>
              <Select
                value={selectedGoalId}
                onValueChange={setSelectedGoalId}
                disabled={isLoadingGoals}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGoalId && (
                <p className="text-sm text-muted-foreground">
                  {goals.find((g) => g.id === selectedGoalId)?.description}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignGoal}
              disabled={!selectedGoalId || actions.isLoading}
            >
              Assign Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Team Member</DialogTitle>
            <DialogDescription>
              Select a team member to assign this DM to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user">Team Member</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isLoadingTeamMembers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUserId && (
                <p className="text-sm text-muted-foreground">
                  {teamMembers.find((m) => m.id === selectedUserId)?.email}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignUser}
              disabled={!selectedUserId || actions.isLoading}
            >
              Assign Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 