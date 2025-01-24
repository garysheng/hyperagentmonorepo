'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mail, Twitter, User, Calendar, Tag, Star } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[100vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Message Thread</DialogTitle>
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
                      <div className="text-xs mb-1 text-white">
                        {opportunity.sender_handle}
                      </div>
                    ) : (
                      <div className="text-xs mb-1 text-white">
                        Team {celebrity?.celebrity_name}
                      </div>
                    )}
                    <div className="bg-muted rounded-lg p-3">
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
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <ResponseGenerator
                    content={opportunity.initial_content}
                    type={opportunity.source === 'TWITTER_DM' ? 'tweet' : 'email'}
                    celebrityId={opportunity.celebrity_id}
                    onResponseGenerated={setNewMessage}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Opportunity Details */}
          <Card className="overflow-y-auto">
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold">Opportunity Details</h3>
              
              {/* Sender Info */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
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

              <Separator />

              {/* Source */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  {opportunity.source === 'TWITTER_DM' ? (
                    <Twitter className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  <span>Source</span>
                </div>
                <div>{opportunity.source === 'TWITTER_DM' ? 'Twitter DM' : 'Email'}</div>
              </div>

              <Separator />

              {/* Date */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Received</span>
                </div>
                <div>{format(new Date(opportunity.created_at), 'MMM d, yyyy h:mm a')}</div>
              </div>

              <Separator />

              {/* Tags */}
              {opportunity.tags.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
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
                  <Separator />
                </>
              )}

              {/* Relevance Score */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
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
              <Separator />
              <div>
                <div className="text-muted-foreground mb-2">Initial Message</div>
                <div className="text-sm whitespace-pre-wrap">{opportunity.initial_content}</div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 