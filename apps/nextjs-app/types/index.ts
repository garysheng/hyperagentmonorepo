export type DMStatus = "pending" | "approved" | "rejected" | "on_hold";

export interface DM {
  id: string;
  sender: {
    username: string;
    avatar_url: string;
  };
  message: string;
  timestamp: Date;
  relevance_score: number;
  status: DMStatus;
  needs_discussion: boolean;
  goal_id: string | null;
} 