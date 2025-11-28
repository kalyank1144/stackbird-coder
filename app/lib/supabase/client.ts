import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://toteqpxzrwdlmklxpecv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Client for frontend (uses anon key)
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client for backend operations (uses service role key)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper function to get the appropriate client
export function getSupabaseClient(isAdmin = false) {
  return isAdmin ? supabaseAdmin : supabaseClient;
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          is_active: boolean;
          metadata: any;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          template_type: string;
          framework: string | null;
          language: string;
          status: string;
          is_public: boolean;
          thumbnail_url: string | null;
          last_opened_at: string;
          created_at: string;
          updated_at: string;
          metadata: any;
          tags: string[];
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          file_path: string;
          file_name: string;
          content: string | null;
          content_hash: string | null;
          file_type: string | null;
          mime_type: string | null;
          size_bytes: number;
          is_locked: boolean;
          locked_by: string | null;
          locked_at: string | null;
          created_at: string;
          updated_at: string;
          metadata: any;
        };
        Insert: Omit<Database['public']['Tables']['project_files']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['project_files']['Insert']>;
      };
      project_snapshots: {
        Row: {
          id: string;
          project_id: string;
          snapshot_name: string;
          description: string | null;
          snapshot_data: any;
          file_count: number;
          total_size_bytes: number;
          created_by: string | null;
          created_at: string;
          metadata: any;
        };
        Insert: Omit<Database['public']['Tables']['project_snapshots']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['project_snapshots']['Insert']>;
      };
    };
  };
}
