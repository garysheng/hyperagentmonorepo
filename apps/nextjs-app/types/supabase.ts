export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      opportunities: {
        Row: {
          id: string
          sender_id: string
          initial_content: string
          created_at: string
          relevance_score: number
          status: 'pending' | 'approved' | 'rejected' | 'on_hold'
          goal_id: string | null
          assigned_to: string | null
          needs_discussion: boolean
          relevance_override_explanation: string | null
          relevance_override_by: string | null
          relevance_override_at: string | null
          status_updated_by: string | null
          status_updated_at: string | null
          tags: Record<string, unknown>
          sender_handle: string
        }
        Insert: {
          id?: string
          sender_id: string
          initial_content: string
          created_at?: string
          relevance_score?: number
          status?: 'pending' | 'approved' | 'rejected' | 'on_hold'
          goal_id?: string | null
          assigned_to?: string | null
          needs_discussion?: boolean
          relevance_override_explanation?: string | null
          relevance_override_by?: string | null
          relevance_override_at?: string | null
          status_updated_by?: string | null
          status_updated_at?: string | null
          tags?: Record<string, unknown>
          sender_handle: string
        }
        Update: {
          id?: string
          sender_id?: string
          initial_content?: string
          created_at?: string
          relevance_score?: number
          status?: 'pending' | 'approved' | 'rejected' | 'on_hold'
          goal_id?: string | null
          assigned_to?: string | null
          needs_discussion?: boolean
          relevance_override_explanation?: string | null
          relevance_override_by?: string | null
          relevance_override_at?: string | null
          status_updated_by?: string | null
          status_updated_at?: string | null
          tags?: Record<string, unknown>
          sender_handle?: string
        }
      }
      opportunity_comments: {
        Row: {
          id: string
          opportunity_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          celebrity_id: string
          name: string
          description: string
          priority: number
          created_at: string
        }
        Insert: {
          id?: string
          celebrity_id: string
          name: string
          description: string
          priority?: number
          created_at?: string
        }
        Update: {
          id?: string
          celebrity_id?: string
          name?: string
          description?: string
          priority?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type OpportunityRow = Database['public']['Tables']['opportunities']['Row']
export type OpportunityComment = Database['public']['Tables']['opportunity_comments']['Row'] 