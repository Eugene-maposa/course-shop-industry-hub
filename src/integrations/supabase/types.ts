export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          email: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
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
          id: string
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
          id?: string
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
          id?: string
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
          name: string
          phone: string | null
          registration_date: string | null
          status: Database["public"]["Enums"]["shop_status"] | null
          updated_at: string
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
          name: string
          phone?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["shop_status"] | null
          updated_at?: string
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
          name?: string
          phone?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["shop_status"] | null
          updated_at?: string
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
      check_product_legality: {
        Args: { product_name: string; product_description?: string }
        Returns: {
          is_legal: boolean
          violations: string[]
        }[]
      }
      create_admin_user: {
        Args: {
          target_user_id: string
          admin_role: Database["public"]["Enums"]["admin_role"]
          created_by_id: string
        }
        Returns: Json
      }
      deactivate_admin_user: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_admin_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_user_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          admin_id: string
          action_type: string
          target_table?: string
          target_id?: string
          old_values?: Json
          new_values?: Json
        }
        Returns: Json
      }
      update_admin_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["admin_role"]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
