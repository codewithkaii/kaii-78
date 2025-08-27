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
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_name: string
          key_value: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_name: string
          key_value: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_name?: string
          key_value?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      approval_cards: {
        Row: {
          approved_by: string | null
          category: string
          context: Json | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          priority: string
          recommended_action: string | null
          risk_flags: string[] | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          category: string
          context?: Json | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          recommended_action?: string | null
          risk_flags?: string[] | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          category?: string
          context?: Json | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          recommended_action?: string | null
          risk_flags?: string[] | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          payload_hash: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payload_hash?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          payload_hash?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_open: boolean
          open_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_open?: boolean
          open_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          buyer_id: string
          completed_at: string | null
          contract_type: string
          created_at: string
          document_hash: string | null
          document_url: string | null
          final_price: number
          id: string
          offer_id: string
          property_id: string
          seller_id: string
          signed_at: string | null
          status: string
          terms: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          completed_at?: string | null
          contract_type: string
          created_at?: string
          document_hash?: string | null
          document_url?: string | null
          final_price: number
          id?: string
          offer_id: string
          property_id: string
          seller_id: string
          signed_at?: string | null
          status?: string
          terms?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          completed_at?: string | null
          contract_type?: string
          created_at?: string
          document_hash?: string | null
          document_url?: string | null
          final_price?: number
          id?: string
          offer_id?: string
          property_id?: string
          seller_id?: string
          signed_at?: string | null
          status?: string
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          channel: string
          completed_at: string | null
          content: string | null
          created_at: string
          direction: string
          id: string
          lead_id: string
          next_action: string | null
          outcome: string | null
          scheduled_at: string | null
          transcript: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          direction: string
          id?: string
          lead_id: string
          next_action?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          transcript?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          direction?: string
          id?: string
          lead_id?: string
          next_action?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          transcript?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string | null
          id: string
          lead_type: string
          location_preferences: string[] | null
          name: string
          phone: string | null
          property_preferences: Json | null
          score: number | null
          source: string
          status: string
          transcript_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          lead_type: string
          location_preferences?: string[] | null
          name: string
          phone?: string | null
          property_preferences?: Json | null
          score?: number | null
          source: string
          status?: string
          transcript_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          lead_type?: string
          location_preferences?: string[] | null
          name?: string
          phone?: string | null
          property_preferences?: Json | null
          score?: number | null
          source?: string
          status?: string
          transcript_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          channel: string
          created_at: string
          fraud_score: number | null
          id: string
          is_featured: boolean | null
          listing_type: string
          price: number
          property_id: string
          status: string
          updated_at: string
          valuation_score: number | null
          views_count: number | null
        }
        Insert: {
          channel?: string
          created_at?: string
          fraud_score?: number | null
          id?: string
          is_featured?: boolean | null
          listing_type: string
          price: number
          property_id: string
          status?: string
          updated_at?: string
          valuation_score?: number | null
          views_count?: number | null
        }
        Update: {
          channel?: string
          created_at?: string
          fraud_score?: number | null
          id?: string
          is_featured?: boolean | null
          listing_type?: string
          price?: number
          property_id?: string
          status?: string
          updated_at?: string
          valuation_score?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          negotiation_thread: Json | null
          offer_price: number
          status: string
          terms: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          negotiation_thread?: Json | null
          offer_price: number
          status?: string
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          negotiation_thread?: Json | null
          offer_price?: number
          status?: string
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          id: string
          payer_id: string
          payment_method: string
          payment_type: string
          status: string
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          id?: string
          payer_id: string
          payment_method: string
          payment_type: string
          status?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          id?: string
          payer_id?: string
          payment_method?: string
          payment_type?: string
          status?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          area_sqft: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          owner_id: string
          postal_code: string | null
          price: number
          property_type: string
          state: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          owner_id: string
          postal_code?: string | null
          price: number
          property_type: string
          state: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          owner_id?: string
          postal_code?: string | null
          price?: number
          property_type?: string
          state?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_phone_numbers: {
        Row: {
          capabilities: Json | null
          country_code: string | null
          created_at: string
          friendly_name: string | null
          id: string
          is_active: boolean
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capabilities?: Json | null
          country_code?: string | null
          created_at?: string
          friendly_name?: string | null
          id?: string
          is_active?: boolean
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capabilities?: Json | null
          country_code?: string | null
          created_at?: string
          friendly_name?: string | null
          id?: string
          is_active?: boolean
          phone_number?: string
          updated_at?: string
          user_id?: string
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
