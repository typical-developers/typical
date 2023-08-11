export interface Database {
  public: {
    Tables: {
      "guild-settings": {
        Row: {
          id?: number
          activity_roles: [[number, string]] | never[] | []
          grantable_roles: string[] | never[] | []
          points_system: boolean
          server_id: string
          welcome_card: boolean
          welcome_channel: string | null
          welcome_notifs: boolean
          welcome_string: string | null
        }
        Insert: {
          id?: number
          activity_roles?: [[number, string]] | never[] | []
          grantable_roles?: string[] | [] | []
          points_system?: boolean
          server_id?: string
          welcome_card?: boolean
          welcome_channel?: string | null
          welcome_notifs?: boolean
          welcome_string?: string | null
        }
        Update: {
          id?: number
          activity_roles?: [[number, string]] | never[] | []
          grantable_roles?: string[] | never[] | []
          points_system?: boolean
          server_id?: string
          welcome_card?: boolean
          welcome_channel?: string | null
          welcome_notifs?: boolean
          welcome_string?: string | null
        }
        Relationships: []
      }
      points: {
        Row: {
          id?: number
          amount: number
          last_ran: number
          server_id: string
          user_id: string
        }
        Insert: {
          id?: number
          amount: number
          last_ran: number
          server_id: string
          user_id: string
        }
        Update: {
          id?: number
          amount: number
          last_ran: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
