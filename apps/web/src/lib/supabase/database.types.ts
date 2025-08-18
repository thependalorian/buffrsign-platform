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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      // Redis Integration Tables
      redis_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          session_data: Json
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          session_data: Json
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          session_data?: Json
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redis_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      jwt_blacklist: {
        Row: {
          blacklisted_at: string | null
          expires_at: string
          id: string
          reason: string | null
          token_hash: string
          user_id: string | null
        }
        Insert: {
          blacklisted_at?: string | null
          expires_at: string
          id?: string
          reason?: string | null
          token_hash: string
          user_id?: string | null
        }
        Update: {
          blacklisted_at?: string | null
          expires_at?: string
          id?: string
          reason?: string | null
          token_hash?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jwt_blacklist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      background_tasks: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          max_attempts: number | null
          priority: number | null
          queue_name: string
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          task_data: Json
          task_type: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          queue_name: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          task_data: Json
          task_type: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          queue_name?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          task_data?: Json
          task_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      realtime_events: {
        Row: {
          channel: string | null
          created_at: string | null
          document_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          document_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          document_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "realtime_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "realtime_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rate_limit_logs: {
        Row: {
          created_at: string | null
          id: string
          identifier: string
          ip_address: unknown | null
          is_blocked: boolean | null
          limit_type: string
          request_count: number | null
          user_id: string | null
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          identifier: string
          ip_address?: unknown | null
          is_blocked?: boolean | null
          limit_type: string
          request_count?: number | null
          user_id?: string | null
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          identifier?: string
          ip_address?: unknown | null
          is_blocked?: boolean | null
          limit_type?: string
          request_count?: number | null
          user_id?: string | null
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      document_processing_status: {
        Row: {
          completed_at: string | null
          document_id: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          processing_type: string
          progress: number | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processing_type: string
          progress?: number | null
          started_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processing_type?: string
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_status_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      redis_cache_metadata: {
        Row: {
          access_count: number | null
          cache_key: string
          cache_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          id: string
          last_accessed: string | null
          ttl_seconds: number | null
        }
        Insert: {
          access_count?: number | null
          cache_key: string
          cache_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          last_accessed?: string | null
          ttl_seconds?: number | null
        }
        Update: {
          access_count?: number | null
          cache_key?: string
          cache_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          last_accessed?: string | null
          ttl_seconds?: number | null
        }
        Relationships: []
      }
      // Existing Tables (abbreviated for brevity)
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          password_hash: string
          account_type: string | null
          company_name: string | null
          created_at: string | null
          is_active: boolean | null
          is_verified: boolean | null
          namibian_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          password_hash: string
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          namibian_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          password_hash?: string
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          namibian_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          title: string
          file_path: string
          file_hash: string
          file_size: number
          mime_type: string
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          status: string | null
          document_type: string | null
          industry: string | null
          jurisdiction: string | null
          expires_at: string | null
          ai_analysis_enabled: boolean | null
          ai_analysis_status: string | null
          ai_analysis_id: string | null
          compliance_analysis_id: string | null
        }
        Insert: {
          id?: string
          title: string
          file_path: string
          file_hash: string
          file_size: number
          mime_type: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
          document_type?: string | null
          industry?: string | null
          jurisdiction?: string | null
          expires_at?: string | null
          ai_analysis_enabled?: boolean | null
          ai_analysis_status?: string | null
          ai_analysis_id?: string | null
          compliance_analysis_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          file_path?: string
          file_hash?: string
          file_size?: number
          mime_type?: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
          document_type?: string | null
          industry?: string | null
          jurisdiction?: string | null
          expires_at?: string | null
          ai_analysis_enabled?: boolean | null
          ai_analysis_status?: string | null
          ai_analysis_id?: string | null
          compliance_analysis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // Redis Integration Functions
      add_background_task: {
        Args: {
          p_queue_name: string
          p_task_type: string
          p_task_data: Json
          p_priority?: number
          p_scheduled_at?: string
          p_max_attempts?: number
        }
        Returns: string
      }
      get_next_background_task: {
        Args: {
          p_queue_name: string
        }
        Returns: {
          id: string
          task_type: string
          task_data: Json
          priority: number
          max_attempts: number
          attempts: number
        }[]
      }
      complete_background_task: {
        Args: {
          p_task_id: string
          p_status?: string
          p_error_message?: string
        }
        Returns: boolean
      }
      retry_background_task: {
        Args: {
          p_task_id: string
        }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_jwt_blacklist: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      log_rate_limit_event: {
        Args: {
          p_identifier: string
          p_limit_type: string
          p_request_count: number
          p_window_start: string
          p_window_end: string
          p_is_blocked: boolean
          p_ip_address?: unknown
          p_user_id?: string
        }
        Returns: string
      }
      log_realtime_event: {
        Args: {
          p_event_type: string
          p_channel?: string
          p_user_id?: string
          p_document_id?: string
          p_event_data?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_activity_data?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_session_id?: string
        }
        Returns: string
      }
      update_document_processing_status: {
        Args: {
          p_document_id: string
          p_processing_type: string
          p_status: string
          p_progress?: number
          p_metadata?: Json
          p_error_message?: string
        }
        Returns: string
      }
      get_document_processing_summary: {
        Args: {
          doc_uuid: string
        }
        Returns: {
          processing_type: string
          status: string
          progress: number
          started_at: string
          completed_at: string
        }[]
      }
      get_redis_integration_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_name: string
          metric_description: string
          metric_value: number
        }[]
      }
      get_user_activity_analytics: {
        Args: {
          p_user_id: string
          p_days_back?: number
        }
        Returns: {
          total_activities: number
          unique_activity_types: number
          most_common_activity: string
          most_active_day: string
          last_activity: string
        }[]
      }
      get_user_activity_summary: {
        Args: {
          user_uuid: string
          days_back?: number
        }
        Returns: {
          activity_type: string
          count: number
          last_activity: string
        }[]
      }
      get_document_audit_trail: {
        Args: {
          doc_uuid: string
        }
        Returns: {
          action: string
          user_name: string
          created_at: string
          details: Json
        }[]
      }
      get_user_document_stats: {
        Args: {
          user_uuid: string
        }
        Returns: {
          total_documents: number
          draft_documents: number
          pending_documents: number
          completed_documents: number
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
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
