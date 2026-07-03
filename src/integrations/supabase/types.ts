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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ambulances: {
        Row: {
          created_at: string
          hospital_id: string | null
          id: string
          lat: number | null
          lng: number | null
          plate: string
          status: Database["public"]["Enums"]["ambulance_status"]
        }
        Insert: {
          created_at?: string
          hospital_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          plate: string
          status?: Database["public"]["Enums"]["ambulance_status"]
        }
        Update: {
          created_at?: string
          hospital_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          plate?: string
          status?: Database["public"]["Enums"]["ambulance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ambulances_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          doctor_name: string | null
          hospital_id: string | null
          id: string
          reason: string | null
          scheduled_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          hospital_id?: string | null
          id?: string
          reason?: string | null
          scheduled_at: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          hospital_id?: string | null
          id?: string
          reason?: string | null
          scheduled_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          relation: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
          relation?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          relation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          request_id: string
          status: Database["public"]["Enums"]["emergency_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          request_id: string
          status: Database["public"]["Enums"]["emergency_status"]
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["emergency_status"]
        }
        Relationships: [
          {
            foreignKeyName: "emergency_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "emergency_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_requests: {
        Row: {
          age: number | null
          ai_report: string | null
          ai_summary: Json | null
          ambulance_id: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          eta_minutes: number | null
          hospital_id: string | null
          id: string
          lat: number | null
          lng: number | null
          location_label: string | null
          medical_history: string | null
          pain_level: number | null
          patient_id: string
          photo_url: string | null
          severity: Database["public"]["Enums"]["emergency_severity"] | null
          status: Database["public"]["Enums"]["emergency_status"]
          symptoms: string[]
          symptoms_text: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          ai_report?: string | null
          ai_summary?: Json | null
          ambulance_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          eta_minutes?: number | null
          hospital_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_label?: string | null
          medical_history?: string | null
          pain_level?: number | null
          patient_id: string
          photo_url?: string | null
          severity?: Database["public"]["Enums"]["emergency_severity"] | null
          status?: Database["public"]["Enums"]["emergency_status"]
          symptoms?: string[]
          symptoms_text?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          ai_report?: string | null
          ai_summary?: Json | null
          ambulance_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          eta_minutes?: number | null
          hospital_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_label?: string | null
          medical_history?: string | null
          pain_level?: number | null
          patient_id?: string
          photo_url?: string | null
          severity?: Database["public"]["Enums"]["emergency_severity"] | null
          status?: Database["public"]["Enums"]["emergency_status"]
          symptoms?: string[]
          symptoms_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_requests_ambulance_id_fkey"
            columns: ["ambulance_id"]
            isOneToOne: false
            referencedRelation: "ambulances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string
          available_beds: number
          city: string
          created_at: string
          has_emergency: boolean
          id: string
          lat: number
          lng: number
          name: string
          phone: string | null
          rating: number | null
          specialties: string[]
          total_beds: number
        }
        Insert: {
          address: string
          available_beds?: number
          city: string
          created_at?: string
          has_emergency?: boolean
          id?: string
          lat: number
          lng: number
          name: string
          phone?: string | null
          rating?: number | null
          specialties?: string[]
          total_beds?: number
        }
        Update: {
          address?: string
          available_beds?: number
          city?: string
          created_at?: string
          has_emergency?: boolean
          id?: string
          lat?: number
          lng?: number
          name?: string
          phone?: string | null
          rating?: number | null
          specialties?: string[]
          total_beds?: number
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          created_at: string
          details: Json | null
          file_url: string | null
          id: string
          record_date: string | null
          record_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          file_url?: string | null
          id?: string
          record_date?: string | null
          record_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          file_url?: string | null
          id?: string
          record_date?: string | null
          record_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          blood_type: string | null
          created_at: string
          dob: string | null
          full_name: string | null
          id: string
          language: Database["public"]["Enums"]["preferred_language"]
          medications: string[] | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          dob?: string | null
          full_name?: string | null
          id: string
          language?: Database["public"]["Enums"]["preferred_language"]
          medications?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          blood_type?: string | null
          created_at?: string
          dob?: string | null
          full_name?: string | null
          id?: string
          language?: Database["public"]["Enums"]["preferred_language"]
          medications?: string[] | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          hospital_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          hospital_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          hospital_id?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ambulance_status:
        | "available"
        | "dispatched"
        | "en_route"
        | "on_scene"
        | "transporting"
        | "offline"
      app_role: "patient" | "hospital_staff" | "ambulance" | "admin"
      emergency_severity: "low" | "medium" | "high" | "critical"
      emergency_status:
        | "requested"
        | "assessed"
        | "hospital_notified"
        | "dispatched"
        | "en_route"
        | "arrived"
        | "transporting"
        | "completed"
        | "cancelled"
      preferred_language: "en" | "sn" | "nd"
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
      ambulance_status: [
        "available",
        "dispatched",
        "en_route",
        "on_scene",
        "transporting",
        "offline",
      ],
      app_role: ["patient", "hospital_staff", "ambulance", "admin"],
      emergency_severity: ["low", "medium", "high", "critical"],
      emergency_status: [
        "requested",
        "assessed",
        "hospital_notified",
        "dispatched",
        "en_route",
        "arrived",
        "transporting",
        "completed",
        "cancelled",
      ],
      preferred_language: ["en", "sn", "nd"],
    },
  },
} as const
