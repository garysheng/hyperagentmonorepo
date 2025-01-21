'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const defaultTags = [
  // Opportunity Type
  'Sponsorship',
  'Partnership',
  'Media Request',
  'Fan Message',
  'Business Inquiry',
  'Technical Issue',
  
  // Sender Type
  'Influencer',
  'Business',
  'Media',
  'Developer',
  'Fan',
  
  // Content Type
  'Question',
  'Feedback',
  'Proposal',
  'Introduction',
  
  // Priority Flags
  'High Value',
  'Quick Win',
  'Complex Deal',
  'Needs Research'
]

interface DMTagsProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
}

export function DMTags({ tags, onTagsChange, className }: DMTagsProps) {
  const [open, setOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    return Array.isArray(tags) ? tags : []
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [search, setSearch] = useState('')

  // Update selected tags when props change
  useEffect(() => {
    setSelectedTags(Array.isArray(tags) ? tags : [])
  }, [tags])

  const filteredTags = defaultTags.filter(tag => 
    tag.toLowerCase().includes(search.toLowerCase()) &&
    !selectedTags.includes(tag)
  )

  const handleSelect = async (tag: string) => {
    if (selectedTags.includes(tag)) return
    
    const newTags = [...selectedTags, tag]
    setSelectedTags(newTags)
    setIsUpdating(true)
    try {
      await onTagsChange(newTags)
      setSearch('')
    } finally {
      setIsUpdating(false)
      setOpen(false)
    }
  }

  const handleRemove = async (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag)
    setSelectedTags(newTags)
    setIsUpdating(true)
    try {
      await onTagsChange(newTags)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1">
        {selectedTags.map(tag => (
          <Badge
            key={tag}
            variant="secondary"
            className={cn(
              'flex items-center gap-1',
              isUpdating && 'opacity-50'
            )}
          >
            {tag}
            <button
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRemove(tag)
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={() => handleRemove(tag)}
              disabled={isUpdating}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-dashed"
              disabled={isUpdating}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-2">
              <Input
                placeholder="Search tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
              <div className="max-h-[200px] overflow-auto space-y-1">
                {filteredTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    No tags found
                  </p>
                ) : (
                  filteredTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleSelect(tag)}
                      className={cn(
                        'w-full text-left px-2 py-1 text-sm rounded-md',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:outline-none focus:bg-accent focus:text-accent-foreground'
                      )}
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 