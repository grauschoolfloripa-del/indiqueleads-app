
-- =========================================================
-- IndicaAqui — Complete Production Schema
-- =========================================================

-- ---------- ENUMS ----------
CREATE TYPE public.app_role AS ENUM ('admin', 'advertiser', 'indicator', 'visitor');
CREATE TYPE public.product_category AS ENUM ('imovel', 'carro', 'moto', 'barco', 'jetski');
CREATE TYPE public.product_status AS ENUM ('rascunho', 'ativo', 'reservado', 'vendido', 'pausado');
CREATE TYPE public.lead_status AS ENUM ('lead_recebido','contato_feito','visita_agendada','visita_confirmada','proposta','venda_concluida');
CREATE TYPE public.commission_type AS ENUM ('digital', 'presencial');
CREATE TYPE public.indicator_league AS ENUM ('bronze', 'prata', 'ouro');
CREATE TYPE public.advertiser_type AS ENUM ('PF', 'PJ');
CREATE TYPE public.advertiser_plan AS ENUM ('gratuito', 'starter', 'premium', 'pro');
CREATE TYPE public.financing_status AS ENUM ('pendente','analise_bancos','aprovado','rejeitado','concluido');
CREATE TYPE public.pix_type AS ENUM ('cpf', 'email', 'phone', 'random');
CREATE TYPE public.payout_status AS ENUM ('pending','processing','paid','failed');
CREATE TYPE public.chat_sender_role AS ENUM ('client','advertiser','system');

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- profiles
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- user_roles
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Security-definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'visitor'))
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- advertisers
-- =========================================================
CREATE TABLE public.advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj_or_cpf TEXT NOT NULL,
  type public.advertiser_type NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  plan public.advertiser_plan NOT NULL DEFAULT 'gratuito',
  categories public.product_category[] NOT NULL DEFAULT '{}',
  city TEXT,
  state TEXT,
  has_accepted_terms BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advertisers TO authenticated;
GRANT SELECT ON public.advertisers TO anon;
GRANT ALL ON public.advertisers TO service_role;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advertisers_public_read" ON public.advertisers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "advertisers_insert_own" ON public.advertisers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "advertisers_update_own" ON public.advertisers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "advertisers_admin_all" ON public.advertisers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_advertisers_updated BEFORE UPDATE ON public.advertisers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- indicators
-- =========================================================
CREATE TABLE public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  pix_key TEXT NOT NULL,
  pix_type public.pix_type NOT NULL,
  league public.indicator_league NOT NULL DEFAULT 'bronze',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  clicks INTEGER NOT NULL DEFAULT 0,
  balance_available NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_pending NUMERIC(12,2) NOT NULL DEFAULT 0,
  city TEXT,
  state TEXT,
  has_accepted_terms BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.indicators TO authenticated;
GRANT ALL ON public.indicators TO service_role;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "indicators_select_own" ON public.indicators FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "indicators_insert_own" ON public.indicators FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "indicators_update_own" ON public.indicators FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "indicators_admin_all" ON public.indicators FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_indicators_updated BEFORE UPDATE ON public.indicators FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- products
-- =========================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES public.advertisers(id) ON DELETE CASCADE,
  category public.product_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status public.product_status NOT NULL DEFAULT 'rascunho',
  city TEXT,
  state TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  cover_image TEXT,
  commission_digital_pct NUMERIC(6,3),
  commission_digital_value NUMERIC(12,2),
  commission_presencial_pct NUMERIC(6,3),
  commission_presencial_value NUMERIC(12,2),
  allow_presencial_tier BOOLEAN NOT NULL DEFAULT false,
  allow_negotiate_tier BOOLEAN NOT NULL DEFAULT false,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_advertiser ON public.products(advertiser_id);
CREATE INDEX idx_products_status_cat ON public.products(status, category);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_active" ON public.products FOR SELECT TO anon, authenticated USING (status = 'ativo');
CREATE POLICY "products_owner_all" ON public.products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid()));
CREATE POLICY "products_admin_all" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- product_images
-- =========================================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product ON public.product_images(product_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT ON public.product_images TO anon;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_images_owner_write" ON public.product_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p JOIN public.advertisers a ON a.id = p.advertiser_id WHERE p.id = product_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p JOIN public.advertisers a ON a.id = p.advertiser_id WHERE p.id = product_id AND a.user_id = auth.uid()));

-- =========================================================
-- leads
-- =========================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES public.indicators(id) ON DELETE SET NULL,
  advertiser_id UUID NOT NULL REFERENCES public.advertisers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'lead_recebido',
  commission_paid BOOLEAN NOT NULL DEFAULT false,
  commission_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_type public.commission_type NOT NULL DEFAULT 'digital',
  notes TEXT,
  contract_url TEXT,
  visit_date TIMESTAMPTZ,
  referral_channel TEXT,
  check_in_requested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_advertiser ON public.leads(advertiser_id);
CREATE INDEX idx_leads_indicator ON public.leads(indicator_id);
CREATE INDEX idx_leads_product ON public.leads(product_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_advertiser_read" ON public.leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid()));
CREATE POLICY "leads_indicator_read" ON public.leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.indicators i WHERE i.id = indicator_id AND i.user_id = auth.uid()));
CREATE POLICY "leads_public_insert" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "leads_advertiser_update" ON public.leads FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid()));
CREATE POLICY "leads_admin_all" ON public.leads FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT INSERT ON public.leads TO anon;
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- lead_status_history
-- =========================================================
CREATE TABLE public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_status public.lead_status,
  to_status public.lead_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_status_history_lead ON public.lead_status_history(lead_id);
GRANT SELECT, INSERT ON public.lead_status_history TO authenticated;
GRANT ALL ON public.lead_status_history TO service_role;
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lsh_read_related" ON public.lead_status_history FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.leads l
    LEFT JOIN public.advertisers a ON a.id = l.advertiser_id
    LEFT JOIN public.indicators i ON i.id = l.indicator_id
    WHERE l.id = lead_id AND (a.user_id = auth.uid() OR i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "lsh_insert_related" ON public.lead_status_history FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.leads l
    LEFT JOIN public.advertisers a ON a.id = l.advertiser_id
    WHERE l.id = lead_id AND (a.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

-- =========================================================
-- chat_messages
-- =========================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_role public.chat_sender_role NOT NULL,
  text TEXT NOT NULL,
  original_text TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_blocked_by_security BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_lead ON public.chat_messages(lead_id, created_at);
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_read_related" ON public.chat_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.leads l
    LEFT JOIN public.advertisers a ON a.id = l.advertiser_id
    LEFT JOIN public.indicators i ON i.id = l.indicator_id
    WHERE l.id = lead_id AND (a.user_id = auth.uid() OR i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "chat_insert_related" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.leads l
    LEFT JOIN public.advertisers a ON a.id = l.advertiser_id
    LEFT JOIN public.indicators i ON i.id = l.indicator_id
    WHERE l.id = lead_id AND (a.user_id = auth.uid() OR i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

-- =========================================================
-- financing_simulations
-- =========================================================
CREATE TABLE public.financing_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES public.indicators(id) ON DELETE SET NULL,
  advertiser_id UUID NOT NULL REFERENCES public.advertisers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_cpf TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_birth_date DATE NOT NULL,
  client_income NUMERIC(12,2) NOT NULL,
  down_payment NUMERIC(14,2) NOT NULL,
  desired_installments INTEGER NOT NULL,
  status public.financing_status NOT NULL DEFAULT 'pendente',
  approved_bank TEXT,
  approved_amount NUMERIC(14,2),
  approved_installments INTEGER,
  approved_installment_value NUMERIC(12,2),
  approved_down_payment NUMERIC(14,2),
  approved_interest_rate NUMERIC(6,3),
  approved_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.financing_simulations TO authenticated;
GRANT ALL ON public.financing_simulations TO service_role;
ALTER TABLE public.financing_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_read_related" ON public.financing_simulations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.indicators i WHERE i.id = indicator_id AND i.user_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "fin_insert_public" ON public.financing_simulations FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON public.financing_simulations TO anon;
CREATE POLICY "fin_update_admin" ON public.financing_simulations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.advertisers a WHERE a.id = advertiser_id AND a.user_id = auth.uid()));
CREATE TRIGGER trg_fin_updated BEFORE UPDATE ON public.financing_simulations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- financing_bank_responses
-- =========================================================
CREATE TABLE public.financing_bank_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES public.financing_simulations(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  approved_amount NUMERIC(14,2) NOT NULL,
  interest_rate NUMERIC(6,3) NOT NULL,
  installment_value NUMERIC(12,2) NOT NULL,
  installments_count INTEGER NOT NULL,
  approved_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.financing_bank_responses TO authenticated;
GRANT ALL ON public.financing_bank_responses TO service_role;
ALTER TABLE public.financing_bank_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fbr_read_related" ON public.financing_bank_responses FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.financing_simulations s
    LEFT JOIN public.advertisers a ON a.id = s.advertiser_id
    LEFT JOIN public.indicators i ON i.id = s.indicator_id
    WHERE s.id = simulation_id AND (a.user_id = auth.uid() OR i.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "fbr_admin_write" ON public.financing_bank_responses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- platform_config (singleton)
-- =========================================================
CREATE TABLE public.platform_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  fee_percent NUMERIC(6,3) NOT NULL DEFAULT 10,
  fee_per_lead NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_commission_imovel NUMERIC(12,2) NOT NULL DEFAULT 500,
  min_commission_carro NUMERIC(12,2) NOT NULL DEFAULT 200,
  min_commission_moto NUMERIC(12,2) NOT NULL DEFAULT 100,
  min_commission_barco NUMERIC(12,2) NOT NULL DEFAULT 300,
  min_commission_jetski NUMERIC(12,2) NOT NULL DEFAULT 150,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.platform_config (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT ON public.platform_config TO anon, authenticated;
GRANT ALL ON public.platform_config TO service_role;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc_public_read" ON public.platform_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pc_admin_write" ON public.platform_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pc_updated BEFORE UPDATE ON public.platform_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- payouts
-- =========================================================
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'pending',
  pix_key TEXT NOT NULL,
  pix_type public.pix_type NOT NULL,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payouts TO authenticated;
GRANT ALL ON public.payouts TO service_role;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payouts_read_own" ON public.payouts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.indicators i WHERE i.id = indicator_id AND i.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "payouts_insert_own" ON public.payouts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.indicators i WHERE i.id = indicator_id AND i.user_id = auth.uid()));
CREATE POLICY "payouts_admin_write" ON public.payouts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_payouts_updated BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- terms_acceptance
-- =========================================================
CREATE TABLE public.terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document TEXT NOT NULL,
  version TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_terms_user ON public.terms_acceptance(user_id);
GRANT SELECT, INSERT ON public.terms_acceptance TO authenticated;
GRANT ALL ON public.terms_acceptance TO service_role;
ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "terms_read_own" ON public.terms_acceptance FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "terms_insert_own" ON public.terms_acceptance FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
