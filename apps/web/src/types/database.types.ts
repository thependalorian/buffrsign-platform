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
      ai_analysis: {
        Row: {
          analysis_metadata: Json | null
          analysis_type: string
          compliance_score: number | null
          confidence_scores: Json | null
          created_at: string | null
          document_id: string
          document_summary: string | null
          eta_compliance: Json | null
          id: string
          key_clauses: Json | null
          recommendations: Json | null
          risk_assessment: Json | null
          signature_fields: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis_metadata?: Json | null
          analysis_type?: string
          compliance_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id: string
          document_summary?: string | null
          eta_compliance?: Json | null
          id?: string
          key_clauses?: Json | null
          recommendations?: Json | null
          risk_assessment?: Json | null
          signature_fields?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis_metadata?: Json | null
          analysis_type?: string
          compliance_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id?: string
          document_summary?: string | null
          eta_compliance?: Json | null
          id?: string
          key_clauses?: Json | null
          recommendations?: Json | null
          risk_assessment?: Json | null
          signature_fields?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          compliance_gaps: Json | null
          confidence_scores: Json | null
          created_at: string | null
          document_id: string
          id: string
          insight_type: string
          key_points: Json | null
          optimization_suggestions: Json | null
          risk_factors: Json | null
          signature_recommendations: Json | null
          updated_at: string | null
        }
        Insert: {
          compliance_gaps?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id: string
          id?: string
          insight_type: string
          key_points?: Json | null
          optimization_suggestions?: Json | null
          risk_factors?: Json | null
          signature_recommendations?: Json | null
          updated_at?: string | null
        }
        Update: {
          compliance_gaps?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id?: string
          id?: string
          insight_type?: string
          key_points?: Json | null
          optimization_suggestions?: Json | null
          risk_factors?: Json | null
          signature_recommendations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_templates: {
        Row: {
          compliance_status: Json | null
          created_at: string | null
          created_by: string | null
          customization_options: Json | null
          description: string | null
          id: string
          industry: string | null
          is_ai_generated: boolean | null
          jurisdiction: string | null
          legal_notes: Json | null
          name: string
          signature_fields: Json | null
          template_content: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          compliance_status?: Json | null
          created_at?: string | null
          created_by?: string | null
          customization_options?: Json | null
          description?: string | null
          id?: string
          industry?: string | null
          is_ai_generated?: boolean | null
          jurisdiction?: string | null
          legal_notes?: Json | null
          name: string
          signature_fields?: Json | null
          template_content: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          compliance_status?: Json | null
          created_at?: string | null
          created_by?: string | null
          customization_options?: Json | null
          description?: string | null
          id?: string
          industry?: string | null
          is_ai_generated?: boolean | null
          jurisdiction?: string | null
          legal_notes?: Json | null
          name?: string
          signature_fields?: Json | null
          template_content?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workflows: {
        Row: {
          ai_recommendations: Json | null
          completed_at: string | null
          compliance_checklist: Json | null
          created_at: string | null
          document_id: string
          execution_log: Json | null
          id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_guidance: Json | null
          workflow_config: Json | null
          workflow_type: string
        }
        Insert: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          compliance_checklist?: Json | null
          created_at?: string | null
          document_id: string
          execution_log?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_guidance?: Json | null
          workflow_config?: Json | null
          workflow_type: string
        }
        Update: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          compliance_checklist?: Json | null
          created_at?: string | null
          document_id?: string
          execution_log?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_guidance?: Json | null
          workflow_config?: Json | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workflows_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used_at: string | null
          name: string
          permissions: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          last_used_at?: string | null
          name: string
          permissions: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: string
          ai_insight_id: string | null
          ai_related: boolean | null
          ai_workflow_id: string | null
          created_at: string | null
          details: Json | null
          document_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          ai_insight_id?: string | null
          ai_related?: boolean | null
          ai_workflow_id?: string | null
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          ai_insight_id?: string | null
          ai_related?: boolean | null
          ai_workflow_id?: string | null
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_ai_insight_id_fkey"
            columns: ["ai_insight_id"]
            isOneToOne: false
            referencedRelation: "ai_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_ai_workflow_id_fkey"
            columns: ["ai_workflow_id"]
            isOneToOne: false
            referencedRelation: "ai_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_analysis: {
        Row: {
          analysis_metadata: Json | null
          compliance_analysis: string | null
          compliance_score: number | null
          cran_compliance: Json | null
          created_at: string | null
          document_id: string
          eta_sections: Json | null
          frameworks: Json
          id: string
          jurisdiction: string | null
          recommendations: Json | null
          remediation_plan: Json | null
          risk_assessment: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis_metadata?: Json | null
          compliance_analysis?: string | null
          compliance_score?: number | null
          cran_compliance?: Json | null
          created_at?: string | null
          document_id: string
          eta_sections?: Json | null
          frameworks?: Json
          id?: string
          jurisdiction?: string | null
          recommendations?: Json | null
          remediation_plan?: Json | null
          risk_assessment?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis_metadata?: Json | null
          compliance_analysis?: string | null
          compliance_score?: number | null
          cran_compliance?: Json | null
          created_at?: string | null
          document_id?: string
          eta_sections?: Json | null
          frameworks?: Json
          id?: string
          jurisdiction?: string | null
          recommendations?: Json | null
          remediation_plan?: Json | null
          risk_assessment?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cran_accreditation: {
        Row: {
          accreditation_type: string
          application_date: string | null
          approval_date: string | null
          audit_results: Json | null
          certificate_number: string | null
          compliance_score: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accreditation_type: string
          application_date?: string | null
          approval_date?: string | null
          audit_results?: Json | null
          certificate_number?: string | null
          compliance_score?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accreditation_type?: string
          application_date?: string | null
          approval_date?: string | null
          audit_results?: Json | null
          certificate_number?: string | null
          compliance_score?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cran_accreditation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_certificates: {
        Row: {
          certificate_data: Json
          certificate_type: string
          created_at: string | null
          expires_at: string
          id: string
          is_revoked: boolean | null
          issued_at: string | null
          private_key_encrypted: string
          public_key: string
          revocation_reason: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          certificate_data: Json
          certificate_type: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_revoked?: boolean | null
          issued_at?: string | null
          private_key_encrypted: string
          public_key: string
          revocation_reason?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          certificate_data?: Json
          certificate_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_revoked?: boolean | null
          issued_at?: string | null
          private_key_encrypted?: string
          public_key?: string
          revocation_reason?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_fields: {
        Row: {
          created_at: string | null
          document_id: string | null
          field_data: Json | null
          field_name: string
          field_type: string
          height: number
          id: string
          is_required: boolean | null
          page_number: number
          width: number
          x_position: number
          y_position: number
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          field_data?: Json | null
          field_name: string
          field_type: string
          height: number
          id?: string
          is_required?: boolean | null
          page_number: number
          width: number
          x_position: number
          y_position: number
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          field_data?: Json | null
          field_name?: string
          field_type?: string
          height?: number
          id?: string
          is_required?: boolean | null
          page_number?: number
          width?: number
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          changes_description: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          file_hash: string
          file_path: string
          id: string
          version_number: number
        }
        Insert: {
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_hash: string
          file_path: string
          id?: string
          version_number: number
        }
        Update: {
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_hash?: string
          file_path?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_analysis_enabled: boolean | null
          ai_analysis_id: string | null
          ai_analysis_status: string | null
          compliance_analysis_id: string | null
          created_at: string | null
          created_by: string | null
          document_type: string | null
          expires_at: string | null
          file_hash: string
          file_path: string
          file_size: number
          id: string
          industry: string | null
          jurisdiction: string | null
          mime_type: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis_enabled?: boolean | null
          ai_analysis_id?: string | null
          ai_analysis_status?: string | null
          compliance_analysis_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          expires_at?: string | null
          file_hash: string
          file_path: string
          file_size: number
          id?: string
          industry?: string | null
          jurisdiction?: string | null
          mime_type: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis_enabled?: boolean | null
          ai_analysis_id?: string | null
          ai_analysis_status?: string | null
          compliance_analysis_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          expires_at?: string | null
          file_hash?: string
          file_path?: string
          file_size?: number
          id?: string
          industry?: string | null
          jurisdiction?: string | null
          mime_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_ai_analysis_id_fkey"
            columns: ["ai_analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_compliance_analysis_id_fkey"
            columns: ["compliance_analysis_id"]
            isOneToOne: false
            referencedRelation: "compliance_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      eta_compliance: {
        Row: {
          ai_analysis_id: string | null
          compliance_score: number | null
          compliance_status: string | null
          compliance_type: string
          created_at: string | null
          document_id: string | null
          id: string
          recommendations: Json | null
          remediation_required: boolean | null
          risk_level: string | null
          signature_id: string | null
          verification_data: Json | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_analysis_id?: string | null
          compliance_score?: number | null
          compliance_status?: string | null
          compliance_type: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          recommendations?: Json | null
          remediation_required?: boolean | null
          risk_level?: string | null
          signature_id?: string | null
          verification_data?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_analysis_id?: string | null
          compliance_score?: number | null
          compliance_status?: string | null
          compliance_type?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          recommendations?: Json | null
          remediation_required?: boolean | null
          risk_level?: string | null
          signature_id?: string | null
          verification_data?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eta_compliance_ai_analysis_id_fkey"
            columns: ["ai_analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eta_compliance_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eta_compliance_signature_id_fkey"
            columns: ["signature_id"]
            isOneToOne: false
            referencedRelation: "signatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eta_compliance_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      government_integration: {
        Row: {
          configuration: Json | null
          created_at: string | null
          government_system: string
          id: string
          integration_type: string
          last_sync_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          government_system: string
          id?: string
          integration_type: string
          last_sync_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          government_system?: string
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_integration_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          namibian_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          namibian_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          namibian_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recipients: {
        Row: {
          created_at: string | null
          document_id: string | null
          email: string
          full_name: string
          id: string
          role: string | null
          signed_at: string | null
          signing_order: number | null
          status: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          email: string
          full_name: string
          id?: string
          role?: string | null
          signed_at?: string | null
          signing_order?: number | null
          status?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string | null
          signed_at?: string | null
          signing_order?: number | null
          status?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipients_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          ip_address: unknown | null
          is_suspicious: boolean | null
          risk_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          ai_detected: boolean | null
          certificate_id: string | null
          compliance_verified: boolean | null
          created_at: string | null
          document_id: string | null
          eta_compliance_status: string | null
          id: string
          ip_address: unknown | null
          recipient_id: string | null
          signature_data: string
          signature_field_id: string | null
          signature_type: string
          timestamp_token: string | null
          user_agent: string | null
        }
        Insert: {
          ai_detected?: boolean | null
          certificate_id?: string | null
          compliance_verified?: boolean | null
          created_at?: string | null
          document_id?: string | null
          eta_compliance_status?: string | null
          id?: string
          ip_address?: unknown | null
          recipient_id?: string | null
          signature_data: string
          signature_field_id?: string | null
          signature_type: string
          timestamp_token?: string | null
          user_agent?: string | null
        }
        Update: {
          ai_detected?: boolean | null
          certificate_id?: string | null
          compliance_verified?: boolean | null
          created_at?: string | null
          document_id?: string | null
          eta_compliance_status?: string | null
          id?: string
          ip_address?: unknown | null
          recipient_id?: string | null
          signature_data?: string
          signature_field_id?: string | null
          signature_type?: string
          timestamp_token?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          document_limit: number
          features: Json
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          updated_at: string | null
          user_limit: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_limit: number
          features: Json
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          updated_at?: string | null
          user_limit: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_limit?: number
          features?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          updated_at?: string | null
          user_limit?: number
        }
        Relationships: []
      }
      templates: {
        Row: {
          ai_template_id: string | null
          category: string | null
          compliance_metadata: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          fields: Json
          file_path: string
          id: string
          industry: string | null
          is_ai_generated: boolean | null
          is_public: boolean | null
          jurisdiction: string | null
          name: string
          signature_field_specs: Json | null
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          ai_template_id?: string | null
          category?: string | null
          compliance_metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields: Json
          file_path: string
          id?: string
          industry?: string | null
          is_ai_generated?: boolean | null
          is_public?: boolean | null
          jurisdiction?: string | null
          name: string
          signature_field_specs?: Json | null
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_template_id?: string | null
          category?: string | null
          compliance_metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          file_path?: string
          id?: string
          industry?: string | null
          is_ai_generated?: boolean | null
          is_public?: boolean | null
          jurisdiction?: string | null
          name?: string
          signature_field_specs?: Json | null
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_ai_template_id_fkey"
            columns: ["ai_template_id"]
            isOneToOne: false
            referencedRelation: "ai_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string | null
          id: string
          payment_method: string | null
          plan_id: string | null
          start_date: string | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_type: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          namibian_id: string | null
          password_hash: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          namibian_id?: string | null
          password_hash: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          namibian_id?: string | null
          password_hash?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_document_audit_trail: {
        Args: { doc_uuid: string }
        Returns: {
          action: string
          created_at: string
          details: Json
          user_name: string
        }[]
      }
      get_user_document_stats: {
        Args: { user_uuid: string }
        Returns: {
          completed_documents: number
          draft_documents: number
          pending_documents: number
          total_documents: number
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
