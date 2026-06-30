/**
 * Generated from Supabase project TCG Vault (ayndfsrnbcdjrkilxugg)
 * Regenerate with Supabase MCP: generate_typescript_types
 * Or CLI: supabase gen types typescript --project-id ayndfsrnbcdjrkilxugg
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      binder_slots: {
        Row: {
          binder_id: string;
          collection_item_id: string | null;
          id: string;
          page_number: number;
          slot_number: number;
          user_id: string;
        };
        Insert: {
          binder_id: string;
          collection_item_id?: string | null;
          id: string;
          page_number: number;
          slot_number: number;
          user_id: string;
        };
        Update: {
          binder_id?: string;
          collection_item_id?: string | null;
          id?: string;
          page_number?: number;
          slot_number?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'binder_slots_binder_id_fkey';
            columns: ['binder_id'];
            isOneToOne: false;
            referencedRelation: 'binders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'binder_slots_collection_item_id_fkey';
            columns: ['collection_item_id'];
            isOneToOne: true;
            referencedRelation: 'collection_items';
            referencedColumns: ['id'];
          },
        ];
      };
      binders: {
        Row: {
          cover_card_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          is_default: boolean;
          name: string;
          user_id: string;
        };
        Insert: {
          cover_card_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id: string;
          is_default?: boolean;
          name: string;
          user_id?: string;
        };
        Update: {
          cover_card_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_default?: boolean;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          image_url: string;
          language: string;
          name: string;
          number: string;
          rarity: string;
          set: string;
          subtypes: string[] | null;
          supertype: string | null;
        };
        Insert: {
          id: string;
          image_url: string;
          language: string;
          name: string;
          number: string;
          rarity: string;
          set: string;
          subtypes?: string[] | null;
          supertype?: string | null;
        };
        Update: {
          id?: string;
          image_url?: string;
          language?: string;
          name?: string;
          number?: string;
          rarity?: string;
          set?: string;
          subtypes?: string[] | null;
          supertype?: string | null;
        };
        Relationships: [];
      };
      collection_items: {
        Row: {
          back_photo_url: string | null;
          binder_id: string | null;
          card_id: string;
          cert_number: string | null;
          created_at: string | null;
          currency: string;
          front_photo_url: string | null;
          grade_type: string;
          grade_value: string | null;
          id: string;
          notes: string | null;
          purchase_date: string;
          purchase_price: number;
          quality: string | null;
          quantity: number;
          user_id: string;
        };
        Insert: {
          back_photo_url?: string | null;
          binder_id?: string | null;
          card_id: string;
          cert_number?: string | null;
          created_at?: string | null;
          currency: string;
          front_photo_url?: string | null;
          grade_type: string;
          grade_value?: string | null;
          id: string;
          notes?: string | null;
          purchase_date: string;
          purchase_price: number;
          quality?: string | null;
          quantity?: number;
          user_id?: string;
        };
        Update: {
          back_photo_url?: string | null;
          binder_id?: string | null;
          card_id?: string;
          cert_number?: string | null;
          created_at?: string | null;
          currency?: string;
          front_photo_url?: string | null;
          grade_type?: string;
          grade_value?: string | null;
          id?: string;
          notes?: string | null;
          purchase_date?: string;
          purchase_price?: number;
          quality?: string | null;
          quantity?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'collection_items_binder_id_fkey';
            columns: ['binder_id'];
            isOneToOne: false;
            referencedRelation: 'binders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collection_items_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
        ];
      };
      goals: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          target_value: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          name: string;
          target_value: string;
          type: string;
          user_id?: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          target_value?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      market_prices: {
        Row: {
          card_id: string;
          price: number;
          updated_at: string | null;
        };
        Insert: {
          card_id: string;
          price: number;
          updated_at?: string | null;
        };
        Update: {
          card_id?: string;
          price?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'market_prices_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: true;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
        ];
      };
      price_alerts: {
        Row: {
          card_id: string;
          enabled: boolean;
          target_price: number;
          user_id: string;
        };
        Insert: {
          card_id: string;
          enabled?: boolean;
          target_price: number;
          user_id?: string;
        };
        Update: {
          card_id?: string;
          enabled?: boolean;
          target_price?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'price_alerts_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
        ];
      };
      price_history: {
        Row: {
          captured_at: string;
          card_id: string;
          id: string;
          market_price: number;
          user_id: string;
        };
        Insert: {
          captured_at: string;
          card_id: string;
          id?: string;
          market_price: number;
          user_id: string;
        };
        Update: {
          captured_at?: string;
          card_id?: string;
          id?: string;
          market_price?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'price_history_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'price_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      price_notifications: {
        Row: {
          card_id: string;
          card_name: string;
          change_percent: number;
          id: string;
          is_read: boolean;
          language: string;
          new_price: number;
          old_price: number;
          timestamp: string;
          user_id: string;
        };
        Insert: {
          card_id: string;
          card_name: string;
          change_percent: number;
          id: string;
          is_read?: boolean;
          language: string;
          new_price: number;
          old_price: number;
          timestamp: string;
          user_id?: string;
        };
        Update: {
          card_id?: string;
          card_name?: string;
          change_percent?: number;
          id?: string;
          is_read?: boolean;
          language?: string;
          new_price?: number;
          old_price?: number;
          timestamp?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'price_notifications_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          about_me: string | null;
          collector_profile: string | null;
          collector_since: string | null;
          country: string | null;
          created_at: string | null;
          display_name: string | null;
          id: string;
          languages: string[] | null;
          nickname: string | null;
          onboarded: boolean | null;
          prefer_specimen_photo: boolean | null;
          profile_pic: string | null;
          show_collection_value: boolean | null;
          show_purchase_prices: boolean | null;
          show_roi: boolean | null;
        };
        Insert: {
          about_me?: string | null;
          collector_profile?: string | null;
          collector_since?: string | null;
          country?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id: string;
          languages?: string[] | null;
          nickname?: string | null;
          onboarded?: boolean | null;
          prefer_specimen_photo?: boolean | null;
          profile_pic?: string | null;
          show_collection_value?: boolean | null;
          show_purchase_prices?: boolean | null;
          show_roi?: boolean | null;
        };
        Update: {
          about_me?: string | null;
          collector_profile?: string | null;
          collector_since?: string | null;
          country?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          id?: string;
          languages?: string[] | null;
          nickname?: string | null;
          onboarded?: boolean | null;
          prefer_specimen_photo?: boolean | null;
          profile_pic?: string | null;
          show_collection_value?: boolean | null;
          show_purchase_prices?: boolean | null;
          show_roi?: boolean | null;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          card_id: string;
          created_at: string | null;
          current_market_price: number;
          desired_price: number;
          id: string;
          language: string;
          notes: string | null;
          priority: string;
          user_id: string;
        };
        Insert: {
          card_id: string;
          created_at?: string | null;
          current_market_price: number;
          desired_price: number;
          id: string;
          language: string;
          notes?: string | null;
          priority: string;
          user_id?: string;
        };
        Update: {
          card_id?: string;
          created_at?: string | null;
          current_market_price?: number;
          desired_price?: number;
          id?: string;
          language?: string;
          notes?: string | null;
          priority?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wishlist_items_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type ProfileRow = Tables<'profiles'>;
export type CardRow = Tables<'cards'>;
export type BinderRow = Tables<'binders'>;
export type BinderSlotRow = Tables<'binder_slots'>;
export type CollectionItemRow = Tables<'collection_items'>;
export type WishlistItemRow = Tables<'wishlist_items'>;
export type GoalRow = Tables<'goals'>;
export type MarketPriceRow = Tables<'market_prices'>;
export type PriceHistoryRow = Tables<'price_history'>;
export type PriceNotificationRow = Tables<'price_notifications'>;
export type PriceAlertRow = Tables<'price_alerts'>;
