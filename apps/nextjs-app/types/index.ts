export type OpportunityStatus = "pending" | "approved" | "rejected" | "on_hold" | "conversation_started";

export type OpportunitySource = "TWITTER_DM" | "WIDGET";

export interface Goal {
  id: string;
  celebrity_id: string;
  name: string;
  description: string | null;
  priority: number;
  created_at: string;
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

export enum TableName {
  OPPORTUNITIES = 'opportunities',
  OPPORTUNITY_ACTIONS = 'opportunity_actions',
  OPPORTUNITY_MESSAGES = 'opportunity_messages',
  OPPORTUNITY_COMMENTS = 'opportunity_comments',
  GOALS = 'goals',
  USERS = 'users',
  CELEBRITIES = 'celebrities',
  TEAM_MEMBERS = 'team_members',
  TWITTER_AUTH = 'twitter_auth'
} 