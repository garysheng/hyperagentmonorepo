'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mail, Twitter, User, Calendar, Tag, Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Opportunity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCelebrity } from '@/hooks/use-celebrity';
import { ResponseGenerator } from '@/components/ui/response-generator';

interface EmailThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  messages: Array<{
    id: string;
    thread_id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
  }>;
  onSendMessage: (message: string) => Promise<void>;
}

export function EmailThreadDialog({
  isOpen,
  onClose,
  opportunity,
  messages,
  onSendMessage
}: EmailThreadDialogProps) {
  const [newMessage, setNewMessage] = useState('');
  const { data: celebrity } = useCelebrity();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const getSourceIcon = (source: Opportunity['source']) => {
    switch (source) {
      case 'TWITTER_DM':
        return <Twitter className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'WIDGET':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getSourceLabel = (source: Opportunity['source']) => {
    switch (source) {
      case 'TWITTER_DM':
        return 'Twitter DM'
      case 'EMAIL':
        return 'Email'
      case 'WIDGET':
        return 'Widget'
      default:
        return 'Message'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[100vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Message Thread</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[2fr,1fr] gap-4 flex-1 min-h-0">
          {/* Left side: Messages and Input */}
          <div className="flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.direction === 'inbound' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className="max-w-[80%]">
                    {message.direction === 'inbound' ? (
                      <div className="text-xs mb-1 text-blue-400">
                        {opportunity.sender_handle}
                      </div>
                    ) : (
                      <div className="text-xs mb-1 text-purple-400">
                        Team {celebrity?.celebrity_name}
                      </div>
                    )}
                    <div className={`rounded-lg p-3 ${
                      message.direction === 'inbound' 
                        ? 'bg-blue-500/10 border border-blue-500/20' 
                        : 'bg-purple-500/10 border border-purple-500/20'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t mt-4">
              <div className="space-y-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[150px] border-blue-500/20 focus:border-blue-500 transition-colors"
                />
                <div className="flex justify-end gap-2">
                  <ResponseGenerator
                    content={opportunity.initial_content}
                    type={opportunity.source === 'TWITTER_DM' ? 'tweet' : 'email'}
                    celebrityId={opportunity.celebrity_id}
                    threadId={messages[0]?.thread_id}
                    onResponseGenerated={setNewMessage}
                  />
                  <Button onClick={handleSendMessage} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Opportunity Details */}
          <Card className="overflow-y-auto border-blue-500/20">
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Opportunity Details</h3>
              
              {/* Sender Info */}
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <User className="h-4 w-4" />
                  <span>Sender</span>
                </div>
                <div>{opportunity.sender_handle}</div>
                {opportunity.sender_bio && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {opportunity.sender_bio}
                  </div>
                )}
              </div>

              <Separator className="bg-blue-500/20" />

              {/* Source */}
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  {getSourceIcon(opportunity.source)}
                  <span>Source</span>
                </div>
                <div>{getSourceLabel(opportunity.source)}</div>
              </div>

              <Separator className="bg-blue-500/20" />

              {/* Date */}
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Received</span>
                </div>
                <div>{format(new Date(opportunity.created_at), 'MMM d, yyyy h:mm a')}</div>
              </div>

              <Separator className="bg-blue-500/20" />

              {/* Tags */}
              {opportunity.tags.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator className="bg-blue-500/20" />
                </>
              )}

              {/* Relevance Score */}
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Star className="h-4 w-4" />
                  <span>Relevance Score</span>
                </div>
                <div className="flex items-center gap-1">
                  {opportunity.relevance_score === -1 ? (
                    'Unclassified'
                  ) : (
                    <>
                      {opportunity.relevance_score}/5
                      {opportunity.classification_explanation && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {opportunity.classification_explanation}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Initial Message */}
              <Separator className="bg-blue-500/20" />
              <div>
                <div className="text-blue-400 mb-2">Initial Message</div>
                <div className="text-sm whitespace-pre-wrap">{opportunity.initial_content}</div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 