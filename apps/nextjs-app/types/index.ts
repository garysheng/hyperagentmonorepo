export type DMStatus = "pending" | "approved" | "rejected" | "on_hold";

interface Goal {
  id: string;
  name: string;
  description: string;
}

export interface DM {
  id: string;
  sender_id: string;
  sender_handle: string;
  initial_content: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'on_hold';
  relevance_score: number;
  goal_id?: string;
  goal?: Goal;
  assigned_to?: string;
  needs_discussion?: boolean;
  updated_at?: string;
} 