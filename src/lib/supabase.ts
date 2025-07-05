import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const WATER_BOTTLE_PRICE = 20; // Price in rupees

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'manager' | 'servant';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'manager' | 'servant';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'manager' | 'servant';
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          prep_time: number;
          category: string;
          image_url: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          prep_time?: number;
          category: string;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          prep_time?: number;
          category?: string;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tables: {
        Row: {
          id: number;
          table_number: number;
          status: 'free' | 'occupied';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          table_number: number;
          status?: 'free' | 'occupied';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          table_number?: number;
          status?: 'free' | 'occupied';
          created_at?: string;
          updated_at?: string;
        };
      };
      device_sessions: {
        Row: {
          id: string;
          table_id: number;
          device_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_id: number;
          device_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_id?: number;
          device_id?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          table_id: number;
          device_id: string;
          items: any;
          total_amount: number;
          max_prep_time: number;
          status: 'pending' | 'preparing' | 'order is ready' | 'served' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          table_id: number;
          device_id: string;
          items: any;
          total_amount: number;
          max_prep_time?: number;
          status?: 'pending' | 'preparing' | 'order is ready' | 'served' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          table_id?: number;
          device_id?: string;
          items?: any;
          total_amount?: number;
          max_prep_time?: number;
          status?: 'pending' | 'preparing' | 'order is ready' | 'served' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_requests: {
        Row: {
          id: string;
          table_id: number;
          request_type: 'water' | 'bill' | 'order_more';
          is_served: boolean;
          created_at: string;
          served_at: string | null;
          amount?: number;
        };
        Insert: {
          id?: string;
          table_id: number;
          request_type: 'water' | 'bill' | 'order_more';
          is_served?: boolean;
          created_at?: string;
          served_at?: string | null;
          amount?: number;
        };
        Update: {
          id?: string;
          table_id?: number;
          request_type?: 'water' | 'bill' | 'order_more';
          is_served?: boolean;
          created_at?: string;
          served_at?: string | null;
          amount?: number;
        };
      };
    };
  };
};