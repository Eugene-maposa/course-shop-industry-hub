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
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["industry_status"] | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["industry_status"] | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["industry_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          industry_id: string | null
          name: string
          status: Database["public"]["Enums"]["product_status"] | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          industry_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          industry_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_types_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          gallery_images: Json | null
          id: string
          main_image_url: string | null
          name: string
          price: number | null
          product_type_id: string | null
          registration_date: string | null
          shop_id: string | null
          sku: string | null
          status: Database["public"]["Enums"]["product_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gallery_images?: Json | null
          id?: string
          main_image_url?: string | null
          name: string
          price?: number | null
          product_type_id?: string | null
          registration_date?: string | null
          shop_id?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gallery_images?: Json | null
          id?: string
          main_image_url?: string | null
          name?: string
          price?: number | null
          product_type_id?: string | null
          registration_date?: string | null
          shop_id?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      prohibited_products: {
        Row: {
          category: string
          country_code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          keyword: string
          updated_at: string | null
        }
        Insert: {
          category: string
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keyword: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keyword?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_document_requirements: {
        Row: {
          country_code: string | null
          created_at: string | null
          description: string | null
          document_name: string
          document_type: string
          id: string
          is_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          document_name: string
          document_type: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          document_name?: string
          document_type?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shops: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          document_verification_status: string | null
          documents: Json | null
          email: string | null
          icon_url: string | null
          id: string
          industry_id: string | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          registration_date: string | null
          status: Database["public"]["Enums"]["shop_status"] | null
          updated_at: string
          user_id: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          document_verification_status?: string | null
          documents?: Json | null
          email?: string | null
          icon_url?: string | null
          id?: string
          industry_id?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["shop_status"] | null
          updated_at?: string
          user_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          document_verification_status?: string | null
          documents?: Json | null
          email?: string | null
          icon_url?: string | null
          id?: string
          industry_id?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["shop_status"] | null
          updated_at?: string
          user_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          created_at: string
          id: string
          page_path: string
          user_agent: string | null
          user_id: string | null
          visited_at: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_path?: string
          user_agent?: string | null
          user_id?: string | null
          visited_at?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          user_agent?: string | null
          user_id?: string | null
          visited_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      check_admin_status: { Args: { user_id: string }; Returns: boolean }
      check_product_legality: {
        Args: { product_description?: string; product_name: string }
        Returns: {
          is_legal: boolean
          violations: string[]
        }[]
      }
      create_admin_user: {
        Args: {
          admin_role: Database["public"]["Enums"]["admin_role"]
          created_by_id: string
          target_user_id: string
        }
        Returns: Json
      }
      create_admin_user_safe: {
        Args: {
          admin_role?: Database["public"]["Enums"]["admin_role"]
          user_email: string
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_message: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      deactivate_admin_user: { Args: { target_user_id: string }; Returns: Json }
      get_admin_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_all_users: {
        Args: never
        Returns: {
          avatar_url: string
          company: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          last_sign_in_at: string
          phone: string
        }[]
      }
      get_current_admin_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_user_count: { Args: never; Returns: number }
      get_visit_stats: {
        Args: { period?: string }
        Returns: {
          period_label: string
          unique_visitors: number
          visit_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          action_type: string
          admin_id: string
          new_values?: Json
          old_values?: Json
          target_id?: string
          target_table?: string
        }
        Returns: Json
      }
      update_admin_role: {
        Args: {
          new_role: Database["public"]["Enums"]["admin_role"]
          target_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator"
      app_role: "admin" | "user"
      industry_status: "active" | "inactive" | "pending"
      product_status: "active" | "inactive" | "pending"
      shop_status: "active" | "inactive" | "pending"
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
    Enums: {
      admin_role: ["super_admin", "admin", "moderator"],
      app_role: ["admin", "user"],
      industry_status: ["active", "inactive", "pending"],
      product_status: ["active", "inactive", "pending"],
      shop_status: ["active", "inactive", "pending"],
    },
  },
} as const
