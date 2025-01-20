// Backend types (using Supabase string timestamp)
type Timestamp = string

export interface CelebrityBase {
  id: string
  name: string
  twitter_username: string
  created_at: Timestamp
  updated_at: Timestamp
}

export interface GoalBase {
  id: string
  celebrity_id: string
  name: string
  description: string
  priority: number
  created_at: Timestamp
  updated_at: Timestamp
}

export interface OpportunityBase {
  id: string
  celebrity_id: string
  goal_id: string
  dm_text: string
  sender_username: string
  sender_profile_url: string
  relevance_score: number
  created_at: Timestamp
  updated_at: Timestamp
}

// Frontend types (using JavaScript Date)
export interface Celebrity extends Omit<CelebrityBase, 'created_at' | 'updated_at'> {
  created_at: Date
  updated_at: Date
}

export interface Goal extends Omit<GoalBase, 'created_at' | 'updated_at'> {
  created_at: Date
  updated_at: Date
}

export interface Opportunity extends Omit<OpportunityBase, 'created_at' | 'updated_at'> {
  created_at: Date
  updated_at: Date
} 