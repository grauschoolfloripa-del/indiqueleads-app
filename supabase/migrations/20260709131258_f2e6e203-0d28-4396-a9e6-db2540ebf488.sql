-- Expand product_category enum with 8 new verticals
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'saude';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'energia_solar';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'educacao';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'turismo';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'seguros';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'franquias';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'veiculos_pesados';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'imoveis_comerciais_locacao';

-- Expand lead_status enum with vertical-specific stages
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'triagem';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'avaliacao_agendada';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'avaliacao_confirmada';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'orcamento_emitido';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'tratamento_iniciado';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'visita_tecnica_agendada';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'visita_tecnica_realizada';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'projeto_aprovado';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'contrato_assinado';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'matricula_efetivada';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'pacote_fechado';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'apolice_emitida';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'contrato_franquia';
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'locacao_assinada';

-- Add commission_model to products (nullable, defaults handled in app)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS commission_model text
    CHECK (commission_model IN ('digital','presencial_digital','recorrente'));