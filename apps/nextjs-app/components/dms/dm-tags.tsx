'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, Plus, X } from 'lucide-react'
import { useState } from 'react'

const defaultTags = [
  'High Priority',
  'Follow Up',
  'Needs Review',
  'Interesting',
  'Not Relevant',
  'Spam',
  'Technical',
  'Business',
  'Personal',
]

interface DMTagsProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
}

export function DMTags({ tags, onTagsChange, className }: DMTagsProps) {
  const [open, setOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(tags)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSelect = async (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    setIsUpdating(true)
    try {
      await onTagsChange(newTags)
    } finally {
      setIsUpdating(false)
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
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {defaultTags.map(tag => (
                  <CommandItem
                    key={tag}
                    onSelect={() => handleSelect(tag)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedTags.includes(tag)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 