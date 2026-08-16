/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      advertisers: {
        Row: {
          categories: Database["public"]["Enums"]["product_category"][];
          city: string | null;
          cnpj_or_cpf: string;
          created_at: string;
          email: string;
          has_accepted_terms: boolean;
          id: string;
          name: string;
          phone: string;
          plan: Database["public"]["Enums"]["advertiser_plan"];
          state: string | null;
          terms_accepted_at: string | null;
          type: Database["public"]["Enums"]["advertiser_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          categories?: Database["public"]["Enums"]["product_category"][];
          city?: string | null;
          cnpj_or_cpf: string;
          created_at?: string;
          email: string;
          has_accepted_terms?: boolean;
          id?: string;
          name: string;
          phone: string;
          plan?: Database["public"]["Enums"]["advertiser_plan"];
          state?: string | null;
          terms_accepted_at?: string | null;
          type: Database["public"]["Enums"]["advertiser_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          categories?: Database["public"]["Enums"]["product_category"][];
          city?: string | null;
          cnpj_or_cpf?: string;
          created_at?: string;
          email?: string;
          has_accepted_terms?: boolean;
          id?: string;
          name?: string;
          phone?: string;
          plan?: Database["public"]["Enums"]["advertiser_plan"];
          state?: string | null;
          terms_accepted_at?: string | null;
          type?: Database["public"]["Enums"]["advertiser_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          created_at: string;
          id: string;
          is_blocked_by_security: boolean;
          is_system: boolean;
          lead_id: string;
          original_text: string | null;
          sender_id: string | null;
          sender_name: string;
          sender_role: Database["public"]["Enums"]["chat_sender_role"];
          text: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_blocked_by_security?: boolean;
          is_system?: boolean;
          lead_id: string;
          original_text?: string | null;
          sender_id?: string | null;
          sender_name: string;
          sender_role: Database["public"]["Enums"]["chat_sender_role"];
          text: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_blocked_by_security?: boolean;
          is_system?: boolean;
          lead_id?: string;
          original_text?: string | null;
          sender_id?: string | null;
          sender_name?: string;
          sender_role?: Database["public"]["Enums"]["chat_sender_role"];
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      commissions: {
        Row: {
          paid_at: string | null;
          payment_reference: string | null;
          simulation_id: string | null;
          amount: number;
          created_at: string;
          id: string;
          indicator_id: string;
          kind: Database["public"]["Enums"]["commission_kind"];
          lead_id: string;
          status: Database["public"]["Enums"]["commission_status"];
          updated_at: string;
        };
        Insert: {
          paid_at?: string | null;
          payment_reference?: string | null;
          simulation_id?: string | null;
          amount: number;
          created_at?: string;
          id?: string;
          indicator_id: string;
          kind: Database["public"]["Enums"]["commission_kind"];
          lead_id: string;
          status?: Database["public"]["Enums"]["commission_status"];
          updated_at?: string;
        };
        Update: {
          paid_at?: string | null;
          payment_reference?: string | null;
          simulation_id?: string | null;
          amount?: number;
          created_at?: string;
          id?: string;
          indicator_id?: string;
          kind?: Database["public"]["Enums"]["commission_kind"];
          lead_id?: string;
          status?: Database["public"]["Enums"]["commission_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commissions_indicator_id_fkey";
            columns: ["indicator_id"];
            isOneToOne: false;
            referencedRelation: "indicators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      financing_bank_responses: {
        Row: {
          approved_amount: number;
          approved_status: string;
          bank_name: string;
          created_at: string;
          id: string;
          installment_value: number;
          installments_count: number;
          interest_rate: number;
          notes: string | null;
          simulation_id: string;
        };
        Insert: {
          approved_amount: number;
          approved_status: string;
          bank_name: string;
          created_at?: string;
          id?: string;
          installment_value: number;
          installments_count: number;
          interest_rate: number;
          notes?: string | null;
          simulation_id: string;
        };
        Update: {
          approved_amount?: number;
          approved_status?: string;
          bank_name?: string;
          created_at?: string;
          id?: string;
          installment_value?: number;
          installments_count?: number;
          interest_rate?: number;
          notes?: string | null;
          simulation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financing_bank_responses_simulation_id_fkey";
            columns: ["simulation_id"];
            isOneToOne: false;
            referencedRelation: "financing_simulations";
            referencedColumns: ["id"];
          },
        ];
      };
      financing_simulations: {
        Row: {
          advertiser_id: string;
          approved_amount: number | null;
          approved_bank: string | null;
          approved_down_payment: number | null;
          approved_installment_value: number | null;
          approved_installments: number | null;
          approved_interest_rate: number | null;
          approved_notes: string | null;
          client_birth_date: string;
          client_cpf: string;
          client_income: number;
          client_name: string;
          client_phone: string;
          created_at: string;
          desired_installments: number;
          down_payment: number;
          id: string;
          indicator_id: string | null;
          product_id: string;
          status: Database["public"]["Enums"]["financing_status"];
          updated_at: string;
        };
        Insert: {
          advertiser_id: string;
          approved_amount?: number | null;
          approved_bank?: string | null;
          approved_down_payment?: number | null;
          approved_installment_value?: number | null;
          approved_installments?: number | null;
          approved_interest_rate?: number | null;
          approved_notes?: string | null;
          client_birth_date: string;
          client_cpf: string;
          client_income: number;
          client_name: string;
          client_phone: string;
          created_at?: string;
          desired_installments: number;
          down_payment: number;
          id?: string;
          indicator_id?: string | null;
          product_id: string;
          status?: Database["public"]["Enums"]["financing_status"];
          updated_at?: string;
        };
        Update: {
          advertiser_id?: string;
          approved_amount?: number | null;
          approved_bank?: string | null;
          approved_down_payment?: number | null;
          approved_installment_value?: number | null;
          approved_installments?: number | null;
          approved_interest_rate?: number | null;
          approved_notes?: string | null;
          client_birth_date?: string;
          client_cpf?: string;
          client_income?: number;
          client_name?: string;
          client_phone?: string;
          created_at?: string;
          desired_installments?: number;
          down_payment?: number;
          id?: string;
          indicator_id?: string | null;
          product_id?: string;
          status?: Database["public"]["Enums"]["financing_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financing_simulations_advertiser_id_fkey";
            columns: ["advertiser_id"];
            isOneToOne: false;
            referencedRelation: "advertisers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financing_simulations_indicator_id_fkey";
            columns: ["indicator_id"];
            isOneToOne: false;
            referencedRelation: "indicators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financing_simulations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      indicators: {
        Row: {
          balance_available: number;
          balance_pending: number;
          city: string | null;
          clicks: number;
          cpf: string;
          created_at: string;
          email: string;
          has_accepted_terms: boolean;
          id: string;
          league: Database["public"]["Enums"]["indicator_league"];
          name: string;
          phone: string;
          pix_key: string;
          pix_type: Database["public"]["Enums"]["pix_type"];
          score: number;
          state: string | null;
          terms_accepted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance_available?: number;
          balance_pending?: number;
          city?: string | null;
          clicks?: number;
          cpf: string;
          created_at?: string;
          email: string;
          has_accepted_terms?: boolean;
          id?: string;
          league?: Database["public"]["Enums"]["indicator_league"];
          name: string;
          phone: string;
          pix_key: string;
          pix_type: Database["public"]["Enums"]["pix_type"];
          score?: number;
          state?: string | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance_available?: number;
          balance_pending?: number;
          city?: string | null;
          clicks?: number;
          cpf?: string;
          created_at?: string;
          email?: string;
          has_accepted_terms?: boolean;
          id?: string;
          league?: Database["public"]["Enums"]["indicator_league"];
          name?: string;
          phone?: string;
          pix_key?: string;
          pix_type?: Database["public"]["Enums"]["pix_type"];
          score?: number;
          state?: string | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      lead_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: Database["public"]["Enums"]["lead_status"] | null;
          id: string;
          lead_id: string;
          notes: string | null;
          to_status: Database["public"]["Enums"]["lead_status"];
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["lead_status"] | null;
          id?: string;
          lead_id: string;
          notes?: string | null;
          to_status: Database["public"]["Enums"]["lead_status"];
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["lead_status"] | null;
          id?: string;
          lead_id?: string;
          notes?: string | null;
          to_status?: Database["public"]["Enums"]["lead_status"];
        };
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          advertiser_id: string;
          check_in_requested: boolean;
          client_email: string;
          client_name: string;
          client_phone: string;
          commission_paid: boolean;
          commission_type: Database["public"]["Enums"]["commission_type"];
          commission_value: number;
          contract_url: string | null;
          created_at: string;
          id: string;
          indicator_id: string | null;
          notes: string | null;
          product_id: string;
          referral_channel: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          updated_at: string;
          visit_date: string | null;
        };
        Insert: {
          advertiser_id: string;
          check_in_requested?: boolean;
          client_email: string;
          client_name: string;
          client_phone: string;
          commission_paid?: boolean;
          commission_type?: Database["public"]["Enums"]["commission_type"];
          commission_value?: number;
          contract_url?: string | null;
          created_at?: string;
          id?: string;
          indicator_id?: string | null;
          notes?: string | null;
          product_id: string;
          referral_channel?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          updated_at?: string;
          visit_date?: string | null;
        };
        Update: {
          advertiser_id?: string;
          check_in_requested?: boolean;
          client_email?: string;
          client_name?: string;
          client_phone?: string;
          commission_paid?: boolean;
          commission_type?: Database["public"]["Enums"]["commission_type"];
          commission_value?: number;
          contract_url?: string | null;
          created_at?: string;
          id?: string;
          indicator_id?: string | null;
          notes?: string | null;
          product_id?: string;
          referral_channel?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          updated_at?: string;
          visit_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_advertiser_id_fkey";
            columns: ["advertiser_id"];
            isOneToOne: false;
            referencedRelation: "advertisers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_indicator_id_fkey";
            columns: ["indicator_id"];
            isOneToOne: false;
            referencedRelation: "indicators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      indicator_applications: {
        Row: { [k: string]: any };
        Insert: { [k: string]: any };
        Update: { [k: string]: any };
        Relationships: [];
      };
      courses: {
        Row: { [k: string]: any };
        Insert: { [k: string]: any };
        Update: { [k: string]: any };
        Relationships: [];
      };
      course_lessons: {
        Row: { [k: string]: any };
        Insert: { [k: string]: any };
        Update: { [k: string]: any };
        Relationships: [];
      };
      course_questions_public: {
        Row: { [k: string]: any };
        Insert: { [k: string]: any };
        Update: { [k: string]: any };
        Relationships: [];
      };
      lesson_progress: {
        Row: { [k: string]: any };
        Insert: { [k: string]: any };
        Update: { [k: string]: any };
        Relationships: [];
      };
      indicator_certifications: {
        Row: { [k: string]: any };
        Insert: { [k: string]: any };
        Update: { [k: string]: any };
        Relationships: [];
      };
      notifications: {
        Row: {
          amount: number | null;
          body: string;
          created_at: string;
          id: string;
          kind: string;
          metadata: Json;
          read_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          amount?: number | null;
          body: string;
          created_at?: string;
          id?: string;
          kind: string;
          metadata?: Json;
          read_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          amount?: number | null;
          body?: string;
          created_at?: string;
          id?: string;
          kind?: string;
          metadata?: Json;
          read_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      push_campaigns: {
        Row: {
          action_label: string | null;
          audience: "todos" | "indicadores" | "anunciantes" | "especificos";
          audience_categories: string[];
          audience_user_ids: string[];
          body: string;
          created_at: string;
          created_by: string;
          devices_failed: number | null;
          devices_sent: number | null;
          dispatched_at: string | null;
          id: string;
          image_url: string | null;
          recipients: number;
          target_url: string;
          title: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          endpoint: string;
          id: string;
          last_seen_at: string;
          p256dh: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          auth: string;
          created_at?: string;
          endpoint: string;
          id?: string;
          last_seen_at?: string;
          p256dh: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          auth?: string;
          created_at?: string;
          endpoint?: string;
          id?: string;
          last_seen_at?: string;
          p256dh?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      payouts: {
        Row: {
          amount: number;
          created_at: string;
          failure_reason: string | null;
          fee: number;
          id: string;
          indicator_id: string;
          net_amount: number;
          pix_key: string;
          pix_type: Database["public"]["Enums"]["pix_type"];
          processed_at: string | null;
          status: Database["public"]["Enums"]["payout_status"];
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          failure_reason?: string | null;
          fee?: number;
          id?: string;
          indicator_id: string;
          net_amount: number;
          pix_key: string;
          pix_type: Database["public"]["Enums"]["pix_type"];
          processed_at?: string | null;
          status?: Database["public"]["Enums"]["payout_status"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          failure_reason?: string | null;
          fee?: number;
          id?: string;
          indicator_id?: string;
          net_amount?: number;
          pix_key?: string;
          pix_type?: Database["public"]["Enums"]["pix_type"];
          processed_at?: string | null;
          status?: Database["public"]["Enums"]["payout_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payouts_indicator_id_fkey";
            columns: ["indicator_id"];
            isOneToOne: false;
            referencedRelation: "indicators";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_config: {
        Row: {
          fee_per_lead: number;
          fee_percent: number;
          id: number;
          max_lead_commission_per_indicator_month: number | null;
          min_commission_barco: number;
          min_commission_carro: number;
          min_commission_imovel: number;
          min_commission_jetski: number;
          min_commission_moto: number;
          updated_at: string;
        };
        Insert: {
          fee_per_lead?: number;
          fee_percent?: number;
          id?: number;
          max_lead_commission_per_indicator_month?: number | null;
          min_commission_barco?: number;
          min_commission_carro?: number;
          min_commission_imovel?: number;
          min_commission_jetski?: number;
          min_commission_moto?: number;
          updated_at?: string;
        };
        Update: {
          fee_per_lead?: number;
          fee_percent?: number;
          id?: number;
          max_lead_commission_per_indicator_month?: number | null;
          min_commission_barco?: number;
          min_commission_carro?: number;
          min_commission_imovel?: number;
          min_commission_jetski?: number;
          min_commission_moto?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          created_at: string;
          id: string;
          position: number;
          product_id: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          position?: number;
          product_id: string;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          position?: number;
          product_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          advertiser_id: string;
          allow_negotiate_tier: boolean;
          allow_presencial_tier: boolean;
          attributes: Json;
          category: Database["public"]["Enums"]["product_category"];
          city: string | null;
          commission_digital_pct: number | null;
          commission_digital_value: number | null;
          commission_lead_value: number;
          commission_model: string | null;
          commission_presencial_pct: number | null;
          commission_presencial_value: number | null;
          cover_image: string | null;
          created_at: string;
          currency: string;
          description: string;
          id: string;
          lat: number | null;
          lng: number | null;
          price: number;
          state: string | null;
          status: Database["public"]["Enums"]["product_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          advertiser_id: string;
          allow_negotiate_tier?: boolean;
          allow_presencial_tier?: boolean;
          attributes?: Json;
          category: Database["public"]["Enums"]["product_category"];
          city?: string | null;
          commission_digital_pct?: number | null;
          commission_digital_value?: number | null;
          commission_lead_value?: number;
          commission_model?: string | null;
          commission_presencial_pct?: number | null;
          commission_presencial_value?: number | null;
          cover_image?: string | null;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          price?: number;
          state?: string | null;
          status?: Database["public"]["Enums"]["product_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          advertiser_id?: string;
          allow_negotiate_tier?: boolean;
          allow_presencial_tier?: boolean;
          attributes?: Json;
          category?: Database["public"]["Enums"]["product_category"];
          city?: string | null;
          commission_digital_pct?: number | null;
          commission_digital_value?: number | null;
          commission_lead_value?: number;
          commission_model?: string | null;
          commission_presencial_pct?: number | null;
          commission_presencial_value?: number | null;
          cover_image?: string | null;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          price?: number;
          state?: string | null;
          status?: Database["public"]["Enums"]["product_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_advertiser_id_fkey";
            columns: ["advertiser_id"];
            isOneToOne: false;
            referencedRelation: "advertisers";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          city: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          state: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          city?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          city?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      terms_acceptance: {
        Row: {
          accepted_at: string;
          document: string;
          id: string;
          ip_address: string | null;
          user_agent: string | null;
          user_id: string;
          version: string;
        };
        Insert: {
          accepted_at?: string;
          document: string;
          id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          user_id: string;
          version: string;
        };
        Update: {
          accepted_at?: string;
          document?: string;
          id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          user_id?: string;
          version?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_review_application: {
        Args: { _application_id: string; _approve: boolean; _notes?: string | null };
        Returns: undefined;
      };
      push_audience_reach: {
        Args: {
          _audience: "todos" | "indicadores" | "anunciantes" | "especificos";
          _user_ids?: string[];
          _categories?: string[];
        };
        Returns: { pessoas: number; aparelhos: number }[];
      };
      admin_send_push_campaign: {
        Args: {
          _title: string;
          _body: string;
          _audience: "todos" | "indicadores" | "anunciantes" | "especificos";
          _user_ids?: string[];
          _categories?: string[];
          _image_url?: string | null;
          _target_url?: string;
          _action_label?: string | null;
        };
        Returns: {
          id: string;
          title: string;
          body: string;
          image_url: string | null;
          target_url: string;
          action_label: string | null;
          audience: "todos" | "indicadores" | "anunciantes" | "especificos";
          recipients: number;
          devices_sent: number | null;
          devices_failed: number | null;
          dispatched_at: string | null;
          created_at: string;
        };
      };
      quiz_attempts_left: {
        Args: { _course_id: string };
        Returns: number;
      };
      complete_lesson: {
        Args: { _lesson_id: string };
        Returns: undefined;
      };
      submit_quiz: {
        Args: { _course_id: string; _answers: Json };
        Returns: { score: number; passed: boolean; correct: number; total: number }[];
      };
      my_certified_categories: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["product_category"][];
      };
      indicator_can_earn_on_product: {
        Args: { _indicator_id: string; _product_id: string };
        Returns: boolean;
      };
      advertiser_pay_commission: {
        Args: {
          _commission_id: string;
          _reference?: string | null;
        };
        Returns: undefined;
      };
      admin_set_user_role: {
        Args: {
          _grant: boolean;
          _role: Database["public"]["Enums"]["app_role"];
          _target_user: string;
        };
        Returns: undefined;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      indicator_request_check_in: {
        Args: {
          _lead_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      advertiser_plan: "gratuito" | "starter" | "premium" | "pro";
      advertiser_type: "PF" | "PJ";
      app_role: "admin" | "advertiser" | "indicator" | "visitor";
      chat_sender_role: "client" | "advertiser" | "system";
      commission_kind: "lead" | "venda";
      commission_status: "pending" | "available" | "paid";
      commission_type: "digital" | "presencial";
      financing_status: "pendente" | "analise_bancos" | "aprovado" | "rejeitado" | "concluido";
      indicator_league: "bronze" | "prata" | "ouro";
      lead_status:
        | "lead_recebido"
        | "contato_feito"
        | "visita_agendada"
        | "visita_confirmada"
        | "proposta"
        | "venda_concluida"
        | "triagem"
        | "avaliacao_agendada"
        | "avaliacao_confirmada"
        | "orcamento_emitido"
        | "tratamento_iniciado"
        | "visita_tecnica_agendada"
        | "visita_tecnica_realizada"
        | "projeto_aprovado"
        | "contrato_assinado"
        | "matricula_efetivada"
        | "pacote_fechado"
        | "apolice_emitida"
        | "contrato_franquia"
        | "locacao_assinada";
      payout_status: "pending" | "processing" | "paid" | "failed";
      pix_type: "cpf" | "email" | "phone" | "random";
      product_category:
        | "imovel"
        | "carro"
        | "moto"
        | "barco"
        | "jetski"
        | "saude"
        | "energia_solar"
        | "educacao"
        | "turismo"
        | "seguros"
        | "franquias"
        | "veiculos_pesados"
        | "imoveis_comerciais_locacao";
      product_status: "rascunho" | "ativo" | "reservado" | "vendido" | "pausado";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      advertiser_plan: ["gratuito", "starter", "premium", "pro"],
      advertiser_type: ["PF", "PJ"],
      app_role: ["admin", "advertiser", "indicator", "visitor"],
      chat_sender_role: ["client", "advertiser", "system"],
      commission_type: ["digital", "presencial"],
      financing_status: ["pendente", "analise_bancos", "aprovado", "rejeitado", "concluido"],
      indicator_league: ["bronze", "prata", "ouro"],
      lead_status: [
        "lead_recebido",
        "contato_feito",
        "visita_agendada",
        "visita_confirmada",
        "proposta",
        "venda_concluida",
        "triagem",
        "avaliacao_agendada",
        "avaliacao_confirmada",
        "orcamento_emitido",
        "tratamento_iniciado",
        "visita_tecnica_agendada",
        "visita_tecnica_realizada",
        "projeto_aprovado",
        "contrato_assinado",
        "matricula_efetivada",
        "pacote_fechado",
        "apolice_emitida",
        "contrato_franquia",
        "locacao_assinada",
      ],
      payout_status: ["pending", "processing", "paid", "failed"],
      pix_type: ["cpf", "email", "phone", "random"],
      product_category: [
        "imovel",
        "carro",
        "moto",
        "barco",
        "jetski",
        "saude",
        "energia_solar",
        "educacao",
        "turismo",
        "seguros",
        "franquias",
        "veiculos_pesados",
        "imoveis_comerciais_locacao",
      ],
      product_status: ["rascunho", "ativo", "reservado", "vendido", "pausado"],
    },
  },
} as const;
