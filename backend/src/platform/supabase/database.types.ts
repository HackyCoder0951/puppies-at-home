export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: number
          ip_hash: string | null
          request_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: never
          ip_hash?: string | null
          request_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: never
          ip_hash?: string | null
          request_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          channel: string
          customer_id: string
          given_at: string
          id: string
          ip_hash: string | null
          purpose: Database["public"]["Enums"]["consent_purpose"]
          release_ref: string | null
          source: string | null
          text_version: string
          withdrawal_channel: string | null
          withdrawn_at: string | null
        }
        Insert: {
          channel: string
          customer_id: string
          given_at?: string
          id?: string
          ip_hash?: string | null
          purpose: Database["public"]["Enums"]["consent_purpose"]
          release_ref?: string | null
          source?: string | null
          text_version: string
          withdrawal_channel?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          channel?: string
          customer_id?: string
          given_at?: string
          id?: string
          ip_hash?: string | null
          purpose?: Database["public"]["Enums"]["consent_purpose"]
          release_ref?: string | null
          source?: string | null
          text_version?: string
          withdrawal_channel?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          anonymised_at: string | null
          area: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          language: string
          notes: string | null
          notification_prefs: Json
          phone_display: string | null
          phone_e164: string | null
          restricted_at: string | null
          source: string
          tags: string[]
          updated_at: string
          whatsapp_opt_in_at: string | null
          whatsapp_opt_in_source: string | null
          whatsapp_opted_out_at: string | null
        }
        Insert: {
          anonymised_at?: string | null
          area?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          language?: string
          notes?: string | null
          notification_prefs?: Json
          phone_display?: string | null
          phone_e164?: string | null
          restricted_at?: string | null
          source?: string
          tags?: string[]
          updated_at?: string
          whatsapp_opt_in_at?: string | null
          whatsapp_opt_in_source?: string | null
          whatsapp_opted_out_at?: string | null
        }
        Update: {
          anonymised_at?: string | null
          area?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          language?: string
          notes?: string | null
          notification_prefs?: Json
          phone_display?: string | null
          phone_e164?: string | null
          restricted_at?: string | null
          source?: string
          tags?: string[]
          updated_at?: string
          whatsapp_opt_in_at?: string | null
          whatsapp_opt_in_source?: string | null
          whatsapp_opted_out_at?: string | null
        }
        Relationships: []
      }
      dsr_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          due_at: string
          exceptions: string | null
          export_path: string | null
          handler_id: string | null
          id: string
          identity_verified_at: string | null
          received_at: string
          status: Database["public"]["Enums"]["dsr_status"]
          subject_ref: string
          type: Database["public"]["Enums"]["dsr_type"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_at?: string
          exceptions?: string | null
          export_path?: string | null
          handler_id?: string | null
          id?: string
          identity_verified_at?: string | null
          received_at?: string
          status?: Database["public"]["Enums"]["dsr_status"]
          subject_ref: string
          type: Database["public"]["Enums"]["dsr_type"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_at?: string
          exceptions?: string | null
          export_path?: string | null
          handler_id?: string | null
          id?: string
          identity_verified_at?: string | null
          received_at?: string
          status?: Database["public"]["Enums"]["dsr_status"]
          subject_ref?: string
          type?: Database["public"]["Enums"]["dsr_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsr_requests_handler_id_fkey"
            columns: ["handler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      enquiries: {
        Row: {
          area: string | null
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          ip_hash: string | null
          message: string | null
          name: string
          phone: string | null
          puppy_id: string | null
          source: Database["public"]["Enums"]["enquiry_source"]
          source_page: string | null
          status: Database["public"]["Enums"]["enquiry_status"]
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          area?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          ip_hash?: string | null
          message?: string | null
          name: string
          phone?: string | null
          puppy_id?: string | null
          source: Database["public"]["Enums"]["enquiry_source"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          area?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          ip_hash?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          puppy_id?: string | null
          source?: Database["public"]["Enums"]["enquiry_source"]
          source_page?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "v_public_puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          enquiry_id: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          enquiry_id: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          enquiry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiry_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "enquiry_notes_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          alt: string
          caption: string | null
          color: string
          created_at: string
          deleted_at: string | null
          height: number | null
          id: string
          published_at: string | null
          release_ref: string | null
          sort_order: number
          storage_path: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt?: string
          caption?: string | null
          color?: string
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          published_at?: string | null
          release_ref?: string | null
          sort_order?: number
          storage_path: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt?: string
          caption?: string | null
          color?: string
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          published_at?: string | null
          release_ref?: string | null
          sort_order?: number
          storage_path?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          deleted_at: string | null
          id: string
          published_at: string | null
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          published_at?: string | null
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          published_at?: string | null
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          created_at: string
          key: string
          response_hash: string | null
          scope: string
        }
        Insert: {
          created_at?: string
          key: string
          response_hash?: string | null
          scope: string
        }
        Update: {
          created_at?: string
          key?: string
          response_hash?: string | null
          scope?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email_hash: string
          id: number
          ip_hash: string
          success: boolean
        }
        Insert: {
          created_at?: string
          email_hash: string
          id?: never
          ip_hash: string
          success: boolean
        }
        Update: {
          created_at?: string
          email_hash?: string
          id?: never
          ip_hash?: string
          success?: boolean
        }
        Relationships: []
      }
      privacy_incidents: {
        Row: {
          authority_notified_at: string | null
          aware_at: string
          created_at: string
          data_categories: string[]
          decision_reason: string | null
          detected_at: string
          id: string
          individuals_notified_at: string | null
          owner_id: string | null
          people_affected: number | null
          risk_level: string
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          authority_notified_at?: string | null
          aware_at: string
          created_at?: string
          data_categories?: string[]
          decision_reason?: string | null
          detected_at: string
          id?: string
          individuals_notified_at?: string | null
          owner_id?: string | null
          people_affected?: number | null
          risk_level?: string
          status?: string
          summary: string
          updated_at?: string
        }
        Update: {
          authority_notified_at?: string | null
          aware_at?: string
          created_at?: string
          data_categories?: string[]
          decision_reason?: string | null
          detected_at?: string
          id?: string
          individuals_notified_at?: string | null
          owner_id?: string | null
          people_affected?: number | null
          risk_level?: string
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_incidents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          can_edit_templates: boolean
          created_at: string
          disabled_at: string | null
          full_name: string
          last_seen_at: string | null
          mfa_required: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          can_edit_templates?: boolean
          created_at?: string
          disabled_at?: string | null
          full_name: string
          last_seen_at?: string | null
          mfa_required?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          can_edit_templates?: boolean
          created_at?: string
          disabled_at?: string | null
          full_name?: string
          last_seen_at?: string | null
          mfa_required?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      puppies: {
        Row: {
          age_text: string
          breed: string
          breeds: string[]
          collections: string[]
          colour: string | null
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          gone_home_at: string | null
          gone_home_source: string | null
          id: string
          name: string | null
          origin: Database["public"]["Enums"]["puppy_origin"]
          price_minor: number | null
          published_at: string | null
          sex: Database["public"]["Enums"]["puppy_sex"]
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["puppy_status"]
          story: string | null
          updated_at: string
        }
        Insert: {
          age_text: string
          breed: string
          breeds?: string[]
          collections?: string[]
          colour?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          gone_home_at?: string | null
          gone_home_source?: string | null
          id?: string
          name?: string | null
          origin: Database["public"]["Enums"]["puppy_origin"]
          price_minor?: number | null
          published_at?: string | null
          sex: Database["public"]["Enums"]["puppy_sex"]
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["puppy_status"]
          story?: string | null
          updated_at?: string
        }
        Update: {
          age_text?: string
          breed?: string
          breeds?: string[]
          collections?: string[]
          colour?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          gone_home_at?: string | null
          gone_home_source?: string | null
          id?: string
          name?: string | null
          origin?: Database["public"]["Enums"]["puppy_origin"]
          price_minor?: number | null
          published_at?: string | null
          sex?: Database["public"]["Enums"]["puppy_sex"]
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["puppy_status"]
          story?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      puppy_media: {
        Row: {
          alt: string
          caption: string | null
          color: string
          created_at: string
          duration_s: number | null
          focal_x: number
          focal_y: number
          height: number | null
          id: string
          is_cover: boolean
          kind: Database["public"]["Enums"]["media_kind"]
          poster_path: string | null
          puppy_id: string
          sort_order: number
          storage_path: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt?: string
          caption?: string | null
          color?: string
          created_at?: string
          duration_s?: number | null
          focal_x?: number
          focal_y?: number
          height?: number | null
          id?: string
          is_cover?: boolean
          kind: Database["public"]["Enums"]["media_kind"]
          poster_path?: string | null
          puppy_id: string
          sort_order?: number
          storage_path: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt?: string
          caption?: string | null
          color?: string
          created_at?: string
          duration_s?: number | null
          focal_x?: number
          focal_y?: number
          height?: number | null
          id?: string
          is_cover?: boolean
          kind?: Database["public"]["Enums"]["media_kind"]
          poster_path?: string | null
          puppy_id?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "puppy_media_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puppy_media_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "v_public_puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          created_at: string
          id: string
          is_featured: boolean
          location: string | null
          published_at: string | null
          quote: string
          updated_at: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          is_featured?: boolean
          location?: string | null
          published_at?: string | null
          quote: string
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          location?: string | null
          published_at?: string | null
          quote?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          gateway: string
          processed_at: string | null
          received_at: string
        }
        Insert: {
          event_id: string
          gateway: string
          processed_at?: string | null
          received_at?: string
        }
        Update: {
          event_id?: string
          gateway?: string
          processed_at?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_public_families: {
        Row: {
          alt: string | null
          caption: string | null
          color: string | null
          height: number | null
          id: string | null
          sort_order: number | null
          storage_path: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          caption?: string | null
          color?: string | null
          height?: number | null
          id?: string | null
          sort_order?: number | null
          storage_path?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          caption?: string | null
          color?: string | null
          height?: number | null
          id?: string | null
          sort_order?: number | null
          storage_path?: string | null
          width?: number | null
        }
        Relationships: []
      }
      v_public_faqs: {
        Row: {
          answer: string | null
          id: string | null
          question: string | null
          sort_order: number | null
        }
        Insert: {
          answer?: string | null
          id?: string | null
          question?: string | null
          sort_order?: number | null
        }
        Update: {
          answer?: string | null
          id?: string | null
          question?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      v_public_puppies: {
        Row: {
          age_text: string | null
          breed: string | null
          breeds: string[] | null
          collections: string[] | null
          colour: string | null
          gone_home_at: string | null
          gone_home_source: string | null
          has_video: boolean | null
          id: string | null
          name: string | null
          origin: Database["public"]["Enums"]["puppy_origin"] | null
          published_at: string | null
          sex: Database["public"]["Enums"]["puppy_sex"] | null
          slug: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["puppy_status"] | null
        }
        Insert: {
          age_text?: string | null
          breed?: string | null
          breeds?: string[] | null
          collections?: string[] | null
          colour?: string | null
          gone_home_at?: string | null
          gone_home_source?: string | null
          has_video?: never
          id?: string | null
          name?: string | null
          origin?: Database["public"]["Enums"]["puppy_origin"] | null
          published_at?: string | null
          sex?: Database["public"]["Enums"]["puppy_sex"] | null
          slug?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["puppy_status"] | null
        }
        Update: {
          age_text?: string | null
          breed?: string | null
          breeds?: string[] | null
          collections?: string[] | null
          colour?: string | null
          gone_home_at?: string | null
          gone_home_source?: string | null
          has_video?: never
          id?: string | null
          name?: string | null
          origin?: Database["public"]["Enums"]["puppy_origin"] | null
          published_at?: string | null
          sex?: Database["public"]["Enums"]["puppy_sex"] | null
          slug?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["puppy_status"] | null
        }
        Relationships: []
      }
      v_public_puppy_media: {
        Row: {
          alt: string | null
          caption: string | null
          color: string | null
          duration_s: number | null
          focal_x: number | null
          focal_y: number | null
          height: number | null
          id: string | null
          is_cover: boolean | null
          kind: Database["public"]["Enums"]["media_kind"] | null
          poster_path: string | null
          puppy_id: string | null
          puppy_slug: string | null
          sort_order: number | null
          storage_path: string | null
          width: number | null
        }
        Relationships: [
          {
            foreignKeyName: "puppy_media_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puppy_media_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "v_public_puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      v_public_settings: {
        Row: {
          key: string | null
          value: Json | null
        }
        Insert: {
          key?: string | null
          value?: Json | null
        }
        Update: {
          key?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      v_public_testimonial: {
        Row: {
          author: string | null
          id: string | null
          location: string | null
          quote: string | null
        }
        Insert: {
          author?: string | null
          id?: string | null
          location?: string | null
          quote?: string | null
        }
        Update: {
          author?: string | null
          id?: string | null
          location?: string | null
          quote?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_enquiry: { Args: { payload: Json }; Returns: Json }
      record_login_attempt: {
        Args: {
          p_email_hash: string
          p_ip_hash: string
          p_lock_minutes?: number
          p_success: boolean
          p_threshold?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "operator"
      consent_purpose:
        | "enquiry_reply"
        | "marketing_email"
        | "whatsapp_updates"
        | "photo_publication"
      dsr_status:
        | "received"
        | "verifying"
        | "in_progress"
        | "completed"
        | "rejected"
        | "extended"
      dsr_type:
        | "access"
        | "rectification"
        | "erasure"
        | "restriction"
        | "portability"
        | "objection"
        | "withdrawal"
        | "grievance"
      enquiry_source: "contact_letter" | "puppy_enquiry" | "whatsapp" | "manual"
      enquiry_status:
        | "new"
        | "contacted"
        | "qualified"
        | "converted"
        | "closed"
        | "spam"
      media_kind: "photo" | "video"
      puppy_origin: "local" | "imported"
      puppy_sex: "male" | "female" | "male-female"
      puppy_status: "available" | "reserved" | "gone_home"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["super_admin", "operator"],
      consent_purpose: [
        "enquiry_reply",
        "marketing_email",
        "whatsapp_updates",
        "photo_publication",
      ],
      dsr_status: [
        "received",
        "verifying",
        "in_progress",
        "completed",
        "rejected",
        "extended",
      ],
      dsr_type: [
        "access",
        "rectification",
        "erasure",
        "restriction",
        "portability",
        "objection",
        "withdrawal",
        "grievance",
      ],
      enquiry_source: ["contact_letter", "puppy_enquiry", "whatsapp", "manual"],
      enquiry_status: [
        "new",
        "contacted",
        "qualified",
        "converted",
        "closed",
        "spam",
      ],
      media_kind: ["photo", "video"],
      puppy_origin: ["local", "imported"],
      puppy_sex: ["male", "female", "male-female"],
      puppy_status: ["available", "reserved", "gone_home"],
    },
  },
} as const

