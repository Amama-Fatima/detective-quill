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
      blue_prints: {
        Row: {
          created_at: string
          id: string
          project_id: string
          title: string
          type: Database["public"]["Enums"]["blueprint_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          type: Database["public"]["Enums"]["blueprint_type"]
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          type?: Database["public"]["Enums"]["blueprint_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blue_prints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprint_cards: {
        Row: {
          blueprint_id: string
          card_type_id: string
          card_type_title: string | null
          content: string | null
          created_at: string
          id: string
          position_x: number
          position_y: number
          user_id: string
        }
        Insert: {
          blueprint_id?: string
          card_type_id: string
          card_type_title?: string | null
          content?: string | null
          created_at?: string
          id?: string
          position_x: number
          position_y: number
          user_id: string
        }
        Update: {
          blueprint_id?: string
          card_type_id?: string
          card_type_title?: string | null
          content?: string | null
          created_at?: string
          id?: string
          position_x?: number
          position_y?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_cards_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blue_prints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blueprint_cards_card_type_id_fkey"
            columns: ["card_type_id"]
            isOneToOne: false
            referencedRelation: "card_types"
            referencedColumns: ["id"]
          },
        ]
      }
      card_types: {
        Row: {
          blueprint_type: Database["public"]["Enums"]["blueprint_type"]
          created_at: string
          description: string | null
          id: string
          is_custom: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          blueprint_type: Database["public"]["Enums"]["blueprint_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean
          title?: string
          user_id?: string | null
        }
        Update: {
          blueprint_type?: Database["public"]["Enums"]["blueprint_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fs_nodes: {
        Row: {
          content: string | null
          created_at: string
          depth: number | null
          description: string | null
          file_extension: string
          global_sequence: number | null
          id: string
          name: string
          node_type: Database["public"]["Enums"]["node_type"]
          parent_id: string | null
          path: string
          project_id: string
          sort_order: number | null
          updated_at: string
          word_count: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          depth?: number | null
          description?: string | null
          file_extension?: string
          global_sequence?: number | null
          id?: string
          name: string
          node_type?: Database["public"]["Enums"]["node_type"]
          parent_id?: string | null
          path: string
          project_id: string
          sort_order?: number | null
          updated_at?: string
          word_count?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          depth?: number | null
          description?: string | null
          file_extension?: string
          global_sequence?: number | null
          id?: string
          name?: string
          node_type?: Database["public"]["Enums"]["node_type"]
          parent_id?: string | null
          path?: string
          project_id?: string
          sort_order?: number | null
          updated_at?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "fs_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fs_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fs_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          full_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          email: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          email?: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          author_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_node_children: {
        Args: { node_uuid: string }
        Returns: {
          depth: number
          id: string
          name: string
          node_type: string
          path: string
          sort_order: number
        }[]
      }
    }
    Enums: {
      blueprint_type: "character" | "timeline"
      blueprint_types: "character" | "timeline" | "other"
      node_type: "folder" | "file"
      user_role: "writer" | "reader"
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
      blueprint_type: ["character", "timeline"],
      blueprint_types: ["character", "timeline", "other"],
      node_type: ["folder", "file"],
      user_role: ["writer", "reader"],
    },
  },
} as const
