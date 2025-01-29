export type OpportunityStatus = "pending" | "approved" | "rejected" | "on_hold" | "conversation_started";

export type OpportunitySource = "TWITTER_DM" | "WIDGET" | "EMAIL";

export interface Goal {
  id: string;
  celebrity_id: string;
  name: string;
  description: string | null;
  priority: number;
  created_at: string;
  default_user_id: string | null;
}

export interface Celebrity {
  id: string;
  celebrity_name: string;
  twitter_username: string | null;
  twitter_password: string | null;
  created_at: string;
}

export interface Opportunity {
  id: string;
  celebrity_id: string;
  sender_id: string;
  sender_handle: string;
  initial_content: string;
  created_at: string;
  status: OpportunityStatus;
  source: OpportunitySource;
  relevance_score: number;
  tags: string[];
  goal_id?: string;
  goal?: Goal;
  assigned_to?: string;
  needs_discussion: boolean;
  sender_bio?: string;
  classification_explanation?: string;
  relevance_override_explanation?: string;
  relevance_override_by?: string;
  relevance_override_at?: string;
  status_updated_by?: string;
  status_updated_at?: string;
  updated_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'support_agent' | 'celebrity';
  celebrity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface EmailThread {
  id: string;
  opportunity_id: string;
  subject: string;
  last_message_at: Date;
  status: 'active' | 'archived' | 'spam';
  created_at: Date;
  updated_at: Date;
}

export interface EmailMessage {
  id: string;
  thread_id: string;
  from: string;
  to: string[];
  subject: string;
  content: string;
  mailgun_message_id: string;
  direction: 'inbound' | 'outbound';
  created_at: Date;
}

export interface SendEmailParams {
  to: string;
  celebrityId: string;
  celebrityName: string;
  subject: string;
  text: string;
  threadId?: string;
  messageId?: string;
}

export interface MailgunWebhookPayload {
  sender: string;
  recipient: string;
  subject: string;
  'body-plain': string;
  'Message-Id': string;
  'In-Reply-To'?: string;
  References?: string[];
  timestamp: number;
  signature: {
    timestamp: string;
    token: string;
    signature: string;
  };
}

export enum TableName {
  OPPORTUNITIES = 'opportunities',
  OPPORTUNITY_ACTIONS = 'opportunity_actions',
  OPPORTUNITY_MESSAGES = 'opportunity_messages',
  OPPORTUNITY_COMMENTS = 'opportunity_comments',
  GOALS = 'goals',
  USERS = 'users',
  CELEBRITIES = 'celebrities',
  TEAM_MEMBERS = 'team_members',
  TWITTER_AUTH = 'twitter_auth',
  EMAIL_THREADS = 'email_threads',
  EMAIL_MESSAGES = 'email_messages',
  WRITING_STYLES = 'writing_styles'
}

export type VoiceExampleContext = 'professional' | 'fan' | 'business' | 'casual';

export interface VoiceExample {
  context: VoiceExampleContext;
  content: string;
}

export interface WritingStyle {
  id: string;
  celebrity_id: string;
  
  // Tone Settings (0-100 scale)
  formality_level: number;
  enthusiasm_level: number;
  directness_level: number;
  humor_level: number;
  
  // Writing Style Settings (0-100 scale)
  sentence_length_preference: number;
  vocabulary_complexity: number;
  technical_language_level: number;
  emoji_usage_level: number;
  
  // Custom Rules
  preferred_phrases: string[];
  avoided_phrases: string[];
  preferred_greetings: string[];
  preferred_signoffs: string[];
  
  // Voice Examples
  voice_examples: VoiceExample[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_updated_by: string;
} 