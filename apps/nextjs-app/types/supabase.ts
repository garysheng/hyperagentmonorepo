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
          message: string
          created_at: string
          relevance_score: number
          status: 'pending' | 'approved' | 'rejected'
          goal_id: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          message: string
          created_at?: string
          relevance_score?: number
          status?: 'pending' | 'approved' | 'rejected'
          goal_id?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          message?: string
          created_at?: string
          relevance_score?: number
          status?: 'pending' | 'approved' | 'rejected'
          goal_id?: string | null
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