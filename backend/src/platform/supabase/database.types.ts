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
      deliveries: {
        Row: {
          address: Json | null
          carrier: string | null
          created_at: string
          delivered_at: string | null
          eta: string | null
          id: string
          method: Database["public"]["Enums"]["delivery_method"]
          order_id: string
          status: Database["public"]["Enums"]["delivery_status"]
          tracking_no: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          eta?: string | null
          id?: string
          method: Database["public"]["Enums"]["delivery_method"]
          order_id: string
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_no?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          eta?: string | null
          id?: string
          method?: Database["public"]["Enums"]["delivery_method"]
          order_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_events: {
        Row: {
          actor_id: string | null
          delivery_id: string
          id: number
          location: string | null
          note: string | null
          occurred_at: string
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Insert: {
          actor_id?: string | null
          delivery_id: string
          id?: never
          location?: string | null
          note?: string | null
          occurred_at?: string
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Update: {
          actor_id?: string | null
          delivery_id?: string
          id?: never
          location?: string | null
          note?: string | null
          occurred_at?: string
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Relationships: [
          {
            foreignKeyName: "delivery_events_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
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
      invoice_lines: {
        Row: {
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number
          tax_minor: number
          tax_rate_bps: number
          unit_minor: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          quantity: number
          sort_order?: number
          tax_minor?: number
          tax_rate_bps?: number
          unit_minor: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number
          tax_minor?: number
          tax_rate_bps?: number
          unit_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          due_at: string | null
          id: string
          issued_at: string | null
          notes: string | null
          number: string | null
          order_id: string
          paid_minor: number
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal_minor: number
          tax_minor: number
          total_minor: number
          updated_at: string
          void_reason: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          due_at?: string | null
          id?: string
          issued_at?: string | null
          notes?: string | null
          number?: string | null
          order_id: string
          paid_minor?: number
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_minor?: number
          tax_minor?: number
          total_minor?: number
          updated_at?: string
          void_reason?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          due_at?: string | null
          id?: string
          issued_at?: string | null
          notes?: string | null
          number?: string | null
          order_id?: string
          paid_minor?: number
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_minor?: number
          tax_minor?: number
          total_minor?: number
          updated_at?: string
          void_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      order_events: {
        Row: {
          actor_id: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: number
          order_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          order_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: never
          order_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          description: string
          id: string
          order_id: string
          quantity: number
          sort_order: number
          unit_minor: number
        }
        Insert: {
          description: string
          id?: string
          order_id: string
          quantity: number
          sort_order?: number
          unit_minor: number
        }
        Update: {
          description?: string
          id?: string
          order_id?: string
          quantity?: number
          sort_order?: number
          unit_minor?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_to: string | null
          balance_minor: number | null
          cancel_reason: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          deposit_minor: number
          enquiry_id: string | null
          id: string
          notes: string | null
          number: string
          paid_minor: number
          puppy_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          tax_minor: number
          tax_rate_bps: number
          total_minor: number
          type: Database["public"]["Enums"]["order_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          balance_minor?: number | null
          cancel_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          deposit_minor?: number
          enquiry_id?: string | null
          id?: string
          notes?: string | null
          number: string
          paid_minor?: number
          puppy_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tax_minor?: number
          tax_rate_bps?: number
          total_minor?: number
          type: Database["public"]["Enums"]["order_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          balance_minor?: number | null
          cancel_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          deposit_minor?: number
          enquiry_id?: string | null
          id?: string
          notes?: string | null
          number?: string
          paid_minor?: number
          puppy_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tax_minor?: number
          tax_rate_bps?: number
          total_minor?: number
          type?: Database["public"]["Enums"]["order_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "puppies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_puppy_id_fkey"
            columns: ["puppy_id"]
            isOneToOne: false
            referencedRelation: "v_public_puppies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          gateway: string
          gateway_ref: string
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          order_id: string
          paid_at: string
          raw: Json | null
          recorded_by: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency?: string
          gateway?: string
          gateway_ref: string
          id?: string
          invoice_id?: string | null
          method: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          order_id: string
          paid_at?: string
          raw?: Json | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          gateway?: string
          gateway_ref?: string
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          order_id?: string
          paid_at?: string
          raw?: Json | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      refunds: {
        Row: {
          amount_minor: number
          created_at: string
          decided_by: string | null
          decision_note: string | null
          gateway_ref: string | null
          id: string
          payment_id: string
          processed_at: string | null
          reason: string
          requested_by: string | null
          status: Database["public"]["Enums"]["refund_status"]
        }
        Insert: {
          amount_minor: number
          created_at?: string
          decided_by?: string | null
          decision_note?: string | null
          gateway_ref?: string | null
          id?: string
          payment_id: string
          processed_at?: string | null
          reason: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Update: {
          amount_minor?: number
          created_at?: string
          decided_by?: string | null
          decision_note?: string | null
          gateway_ref?: string | null
          id?: string
          payment_id?: string
          processed_at?: string | null
          reason?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Relationships: [
          {
            foreignKeyName: "refunds_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      tax_rates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          rate_bps: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          rate_bps: number
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          rate_bps?: number
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
      create_delivery: {
        Args: {
          p_address?: Json
          p_carrier?: string
          p_eta?: string
          p_method: string
          p_order: string
          p_tracking?: string
        }
        Returns: string
      }
      create_enquiry: { Args: { payload: Json }; Returns: Json }
      create_invoice: {
        Args: { p_due?: string; p_notes?: string; p_order: string }
        Returns: string
      }
      create_order: {
        Args: {
          p_customer: string
          p_deposit_minor?: number
          p_enquiry?: string
          p_items: Json
          p_notes?: string
          p_puppy: string
          p_type: string
        }
        Returns: Json
      }
      decide_refund: {
        Args: { p_approve: boolean; p_note?: string; p_refund: string }
        Returns: undefined
      }
      issue_invoice: {
        Args: { p_due?: string; p_invoice: string }
        Returns: string
      }
      list_staff: {
        Args: never
        Returns: {
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      mark_overdue_invoices: { Args: never; Returns: number }
      record_audit_event: {
        Args: {
          p_action: string
          p_actor: string
          p_entity: string
          p_entity_id?: string
          p_ip_hash?: string
          p_meta?: Json
          p_user_agent?: string
        }
        Returns: undefined
      }
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
      record_manual_payment: {
        Args: {
          p_amount_minor: number
          p_invoice: string
          p_method: string
          p_note?: string
          p_order: string
          p_paid_at?: string
          p_reference: string
        }
        Returns: Json
      }
      request_refund: {
        Args: { p_amount_minor: number; p_payment: string; p_reason: string }
        Returns: string
      }
      set_default_tax_rate: {
        Args: { p_name: string; p_rate_bps: number }
        Returns: undefined
      }
      set_order_items: {
        Args: { p_deposit_minor?: number; p_items: Json; p_order: string }
        Returns: undefined
      }
      transition_delivery: {
        Args: {
          p_delivery: string
          p_location?: string
          p_note?: string
          p_to: string
        }
        Returns: undefined
      }
      transition_order: {
        Args: { p_order: string; p_reason?: string; p_to: string }
        Returns: undefined
      }
      update_delivery: {
        Args: {
          p_address: Json
          p_carrier: string
          p_delivery: string
          p_eta: string
          p_tracking: string
        }
        Returns: undefined
      }
      update_invoice_draft: {
        Args: { p_due: string; p_invoice: string; p_notes: string }
        Returns: undefined
      }
      update_order: {
        Args: { p_assigned_to: string; p_notes: string; p_order: string }
        Returns: undefined
      }
      void_invoice: {
        Args: { p_invoice: string; p_reason: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "operator"
      consent_purpose:
        | "enquiry_reply"
        | "marketing_email"
        | "whatsapp_updates"
        | "photo_publication"
      delivery_method:
        | "showroom_pickup"
        | "dubai_delivery"
        | "international_cargo"
      delivery_status:
        | "scheduled"
        | "packed"
        | "dispatched"
        | "in_transit"
        | "arrived"
        | "delivered"
        | "delayed"
        | "failed"
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
      invoice_status:
        | "draft"
        | "issued"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "void"
      media_kind: "photo" | "video"
      order_status:
        | "new"
        | "confirmed"
        | "deposit_paid"
        | "preparing"
        | "in_transit"
        | "delivered"
        | "completed"
        | "cancelled"
      order_type: "local" | "imported"
      payment_method:
        | "card"
        | "bank_transfer"
        | "cash"
        | "card_machine"
        | "link"
        | "other"
      payment_status:
        | "pending"
        | "succeeded"
        | "failed"
        | "partially_refunded"
        | "refunded"
      puppy_origin: "local" | "imported"
      puppy_sex: "male" | "female" | "male-female"
      puppy_status: "available" | "reserved" | "gone_home"
      refund_status:
        | "requested"
        | "approved"
        | "processed"
        | "failed"
        | "rejected"
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
      delivery_method: [
        "showroom_pickup",
        "dubai_delivery",
        "international_cargo",
      ],
      delivery_status: [
        "scheduled",
        "packed",
        "dispatched",
        "in_transit",
        "arrived",
        "delivered",
        "delayed",
        "failed",
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
      invoice_status: [
        "draft",
        "issued",
        "partially_paid",
        "paid",
        "overdue",
        "void",
      ],
      media_kind: ["photo", "video"],
      order_status: [
        "new",
        "confirmed",
        "deposit_paid",
        "preparing",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
      ],
      order_type: ["local", "imported"],
      payment_method: [
        "card",
        "bank_transfer",
        "cash",
        "card_machine",
        "link",
        "other",
      ],
      payment_status: [
        "pending",
        "succeeded",
        "failed",
        "partially_refunded",
        "refunded",
      ],
      puppy_origin: ["local", "imported"],
      puppy_sex: ["male", "female", "male-female"],
      puppy_status: ["available", "reserved", "gone_home"],
      refund_status: [
        "requested",
        "approved",
        "processed",
        "failed",
        "rejected",
      ],
    },
  },
} as const

