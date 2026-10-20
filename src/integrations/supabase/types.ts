export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          action_type: string
          comment: string | null
          created_at: string
          display_name: string
          id: string
          media_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          comment?: string | null
          created_at?: string
          display_name?: string
          id?: string
          media_id: string
          rating?: number | null
          user_id?: string
        }
        Update: {
          action_type?: string
          comment?: string | null
          created_at?: string
          display_name?: string
          id?: string
          media_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          based_on: string | null
          director: string | null
          duration: number | null
          genre: string
          id: string
          owner_id: string
          poster_url: string
          synopsis: string | null
          title: string
          type: string
          year: number
        }
        Insert: {
          based_on?: string | null
          director?: string | null
          duration?: number | null
          genre: string
          id?: string
          owner_id?: string
          poster_url: string
          synopsis?: string | null
          title: string
          type?: string
          year: number
        }
        Update: {
          based_on?: string | null
          director?: string | null
          duration?: number | null
          genre?: string
          id?: string
          owner_id?: string
          poster_url?: string
          synopsis?: string | null
          title?: string
          type?: string
          year?: number
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          activity_id: string
          body: string
          created_at: string
          display_name: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          body: string
          created_at?: string
          display_name?: string
          id?: string
          user_id?: string
        }
        Update: {
          activity_id?: string
          body?: string
          created_at?: string
          display_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          activity_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          user_id?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_name: string
          id: string
          pseudonym: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string
          id: string
          pseudonym?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          id?: string
          pseudonym?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          display_name: string
          id: string
          media_id: string
          quote_text: string
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          media_id: string
          quote_text: string
          timestamp?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          media_id?: string
          quote_text?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      user_media_status: {
        Row: {
          media_id: string
          rating: number | null
          status: string
          updated_at: string
          user_id: string
          watched_at: string | null
        }
        Insert: {
          media_id: string
          rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          watched_at?: string | null
        }
        Update: {
          media_id?: string
          rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          watched_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cinetrack_assurance_ok: { Args: never; Returns: boolean }
      post_like_counts: {
        Args: never
        Returns: {
          activity_id: string
          likes: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
