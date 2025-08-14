// Minimal Database types placeholder. Replace with generated types if available.
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      subscription_plans: {
        Row: { id: number; name: string; monthly_price: number; yearly_price: number; document_limit: number | null; user_limit: number | null };
        Insert: Partial<Database['public']['Tables']['subscription_plans']['Row']>;
        Update: Partial<Database['public']['Tables']['subscription_plans']['Row']>;
      };
      documents: {
        Row: { id: string; title: string; status: string | null; created_at: string | null };
        Insert: Partial<Database['public']['Tables']['documents']['Row']>;
        Update: Partial<Database['public']['Tables']['documents']['Row']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
