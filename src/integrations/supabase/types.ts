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
      documents: {
        Row: {
          download_date: string | null
          id: string
          last_checked: string
          name: string
          size: string
          source: string
          status: string
          user_id: string
        }
        Insert: {
          download_date?: string | null
          id?: string
          last_checked?: string
          name: string
          size: string
          source: string
          status: string
          user_id: string
        }
        Update: {
          download_date?: string | null
          id?: string
          last_checked?: string
          name?: string
          size?: string
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      macros: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          steps: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          steps: Json
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          steps?: Json
          user_id?: string
        }
        Relationships: []
      }
      reguladores: {
        Row: {
          assinatura: string | null
          created_at: string | null
          empresa: string | null
          id: string
          nome: string | null
          user_id: string | null
        }
        Insert: {
          assinatura?: string | null
          created_at?: string | null
          empresa?: string | null
          id?: string
          nome?: string | null
          user_id?: string | null
        }
        Update: {
          assinatura?: string | null
          created_at?: string | null
          empresa?: string | null
          id?: string
          nome?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          frequency: string
          id: string
          last_run: string | null
          macro_id: string
          next_run: string
          user_id: string
        }
        Insert: {
          frequency: string
          id?: string
          last_run?: string | null
          macro_id: string
          next_run: string
          user_id: string
        }
        Update: {
          frequency?: string
          id?: string
          last_run?: string | null
          macro_id?: string
          next_run?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_macro_id_fkey"
            columns: ["macro_id"]
            isOneToOne: false
            referencedRelation: "macros"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          google_drive_folder_id: string | null
          user_id: string
        }
        Insert: {
          google_drive_folder_id?: string | null
          user_id: string
        }
        Update: {
          google_drive_folder_id?: string | null
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
      app_role: "superadmin" | "admin" | "regulador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
