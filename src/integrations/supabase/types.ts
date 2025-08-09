export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      design_ideas: {
        Row: {
          collection_targeting: string | null
          created_at: string
          description: string | null
          id: string
          is_starred: boolean
          name: string
          product_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_targeting?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_starred?: boolean
          name: string
          product_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_targeting?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_starred?: boolean
          name?: string
          product_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_tabs: {
        Row: {
          content: string | null
          created_at: string
          document_id: string
          id: string
          is_active: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          document_id: string
          id?: string
          is_active?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          document_id?: string
          id?: string
          is_active?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      etsy_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          refresh_token: string | null
          shop_id: string
          shop_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          refresh_token?: string | null
          shop_id: string
          shop_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          refresh_token?: string | null
          shop_id?: string
          shop_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fragrances: {
        Row: {
          cost: number | null
          created_at: string
          current_stock: number
          description: string | null
          dimensions: string | null
          id: string
          low_stock_threshold: number
          name: string
          notes: string | null
          price: number | null
          sku: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          dimensions?: string | null
          id?: string
          low_stock_threshold?: number
          name: string
          notes?: string | null
          price?: number | null
          sku: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          current_stock?: number
          description?: string | null
          dimensions?: string | null
          id?: string
          low_stock_threshold?: number
          name?: string
          notes?: string | null
          price?: number | null
          sku?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      listing_optimizations: {
        Row: {
          analysis_results: Json | null
          created_at: string
          id: string
          listing_id: string | null
          original_data: Json
          recommendations: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string
          id?: string
          listing_id?: string | null
          original_data: Json
          recommendations?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string
          id?: string
          listing_id?: string | null
          original_data?: Json
          recommendations?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_optimizations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          created_at: string
          description: string | null
          etsy_listing_id: string | null
          external_id: string | null
          fragrance_id: string
          id: string
          last_synced_at: string | null
          platform_id: string
          price: number
          quantity: number
          shop_section_id: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          etsy_listing_id?: string | null
          external_id?: string | null
          fragrance_id: string
          id?: string
          last_synced_at?: string | null
          platform_id: string
          price: number
          quantity?: number
          shop_section_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          etsy_listing_id?: string | null
          external_id?: string | null
          fragrance_id?: string
          id?: string
          last_synced_at?: string | null
          platform_id?: string
          price?: number
          quantity?: number
          shop_section_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_fragrance_id_fkey"
            columns: ["fragrance_id"]
            isOneToOne: false
            referencedRelation: "fragrances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      new_product_ideas: {
        Row: {
          collection_targeting: string | null
          created_at: string
          description: string | null
          id: string
          is_starred: boolean
          name: string
          product_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_targeting?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_starred?: boolean
          name: string
          product_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_targeting?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_starred?: boolean
          name?: string
          product_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_tasks: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          id: string
          order_index: number
          plan_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          plan_id: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          plan_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          ai_generated_plan: Json | null
          created_at: string
          description: string | null
          fields_data: Json | null
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated_plan?: Json | null
          created_at?: string
          description?: string | null
          fields_data?: Json | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated_plan?: Json | null
          created_at?: string
          description?: string | null
          fields_data?: Json | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          api_endpoint: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          type: Database["public"]["Enums"]["platform_type"]
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          type: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_supplies: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          supply_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          supply_id: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          supply_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_supplies_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_supplies_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          batch_size: number
          calculated_supplies: Json | null
          created_at: string
          id: string
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_size: number
          calculated_supplies?: Json | null
          created_at?: string
          id?: string
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_size?: number
          calculated_supplies?: Json | null
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      supplies: {
        Row: {
          category_id: string
          created_at: string
          current_quantity: number | null
          id: string
          link: string | null
          low_threshold: number | null
          name: string
          price: number | null
          unit: string
          unit_type: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          current_quantity?: number | null
          id?: string
          link?: string | null
          low_threshold?: number | null
          name: string
          price?: number | null
          unit: string
          unit_type?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          current_quantity?: number | null
          id?: string
          link?: string | null
          low_threshold?: number | null
          name?: string
          price?: number | null
          unit?: string
          unit_type?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "supply_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          details: Json | null
          id: string
          message: string | null
          operation: string
          platform_id: string
          started_at: string
          status: Database["public"]["Enums"]["sync_status"]
        }
        Insert: {
          completed_at?: string | null
          details?: Json | null
          id?: string
          message?: string | null
          operation: string
          platform_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["sync_status"]
        }
        Update: {
          completed_at?: string | null
          details?: Json | null
          id?: string
          message?: string | null
          operation?: string
          platform_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["sync_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      todo_tasks: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          title?: string
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
      calculate_product_cogs: {
        Args: { product_uuid: string }
        Returns: number
      }
      get_fragrance_status: {
        Args: { stock: number; threshold: number }
        Returns: string
      }
      get_listing_counts: {
        Args: { fragrance_uuid: string }
        Returns: Json
      }
    }
    Enums: {
      listing_status: "active" | "inactive" | "draft" | "sold"
      platform_type: "etsy" | "woocommerce"
      sync_status: "pending" | "syncing" | "success" | "error"
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
      listing_status: ["active", "inactive", "draft", "sold"],
      platform_type: ["etsy", "woocommerce"],
      sync_status: ["pending", "syncing", "success", "error"],
    },
  },
} as const
