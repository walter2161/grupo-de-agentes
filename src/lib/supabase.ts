import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          avatar: string | null;
          bio: string | null;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          avatar?: string | null;
          bio?: string | null;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          avatar?: string | null;
          bio?: string | null;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          name: string;
          title: string;
          specialty: string;
          description: string;
          icon: string;
          color: string;
          experience: string;
          approach: string;
          guidelines: string;
          persona_style: string;
          documentation: string;
          is_active: boolean;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          name: string;
          title: string;
          specialty: string;
          description: string;
          icon?: string;
          color?: string;
          experience: string;
          approach: string;
          guidelines: string;
          persona_style: string;
          documentation: string;
          is_active?: boolean;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string;
          name?: string;
          title?: string;
          specialty?: string;
          description?: string;
          icon?: string;
          color?: string;
          experience?: string;
          approach?: string;
          guidelines?: string;
          persona_style?: string;
          documentation?: string;
          is_active?: boolean;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          user_id: string;
          group_id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          members: string[];
          is_default: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id: string;
          name: string;
          description: string;
          icon?: string;
          color?: string;
          members?: string[];
          is_default?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_id?: string;
          name?: string;
          description?: string;
          icon?: string;
          color?: string;
          members?: string[];
          is_default?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string | null;
          group_id: string | null;
          message_id: string;
          content: string;
          sender: string;
          sender_name: string | null;
          sender_avatar: string | null;
          mentions: string[] | null;
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id?: string | null;
          group_id?: string | null;
          message_id: string;
          content: string;
          sender: string;
          sender_name?: string | null;
          sender_avatar?: string | null;
          mentions?: string[] | null;
          audio_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string | null;
          group_id?: string | null;
          message_id?: string;
          content?: string;
          sender?: string;
          sender_name?: string | null;
          sender_avatar?: string | null;
          mentions?: string[] | null;
          audio_url?: string | null;
          created_at?: string;
        };
      };
      agent_interactions: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          self_messages_today: number;
          random_questions_sent: number;
          last_interaction: string;
          last_random_question: string;
          last_self_message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          self_messages_today?: number;
          random_questions_sent?: number;
          last_interaction?: string;
          last_random_question?: string;
          last_self_message?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string;
          self_messages_today?: number;
          random_questions_sent?: number;
          last_interaction?: string;
          last_random_question?: string;
          last_self_message?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}