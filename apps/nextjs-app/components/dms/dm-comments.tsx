'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useOpportunityComments } from '@/hooks/use-opportunity-comments'
import { useOpportunityActions } from '@/hooks/use-opportunity-actions'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface DMCommentsProps {
  dmId: string
}

export function DMComments({ dmId }: DMCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const { data: comments = [], isLoading } = useOpportunityComments(dmId)
  const actions = useOpportunityActions(dmId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await actions.addComment(newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] pr-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Image
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${comment.user.id}`}
                  alt={comment.user.full_name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.user.full_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[80px]"
        />
        <Button
          type="submit"
          disabled={!newComment.trim() || actions.isLoading}
          className="w-full"
        >
          {actions.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding comment...
            </>
          ) : (
            'Add Comment'
          )}
        </Button>
      </form>
    </div>
  )
} 