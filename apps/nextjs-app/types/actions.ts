export type OpportunityAction =
  | {
      type: 'upgrade_relevance'
      payload: {
        relevance_score: number
        explanation: string
      }
    }
  | {
      type: 'downgrade_relevance'
      payload: {
        explanation: string
      }
    }
  | {
      type: 'assign_goal'
      payload: {
        goal_id: string
      }
    }
  | {
      type: 'assign_user'
      payload: {
        user_id: string
      }
    }
  | {
      type: 'flag_discussion'
      payload: {
        needs_discussion: boolean
      }
    }
  | {
      type: 'update_status'
      payload: {
        status: 'approved' | 'rejected' | 'on_hold'
      }
    }
  | {
      type: 'add_comment'
      payload: {
        content: string
      }
    }
  | {
      type: 'update_tags'
      payload: {
        tags: string[]
      }
    } 