-- Migration: Create ad_campaigns table with RLS
-- Timestamp: 2026-10-01T04:30:00Z
-- Purpose: Store Meta advertising campaigns for products

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_payment', 'pending_review', 'active', 'paused', 'completed', 'rejected')),
  
  -- AI suggestion data (JSON)
  ai_suggestion JSONB,
  
  -- Final campaign parameters (JSON) sent to Meta
  final_params JSONB DEFAULT '{}',
  
  -- Budget tracking (in cents)
  budget_cents BIGINT NOT NULL CHECK (budget_cents >= 550), -- Min 5.50
  service_fee_cents BIGINT NOT NULL CHECK (service_fee_cents >= 0),
  total_charged_cents BIGINT NOT NULL CHECK (total_charged_cents > 0),
  currency TEXT NOT NULL,
  
  -- Actual spend from Meta API
  spend_actual_cents BIGINT DEFAULT 0,
  
  -- Performance metrics from Meta
  impressions BIGINT,
  clicks BIGINT,
  
  -- External IDs
  kkiapay_transaction_id TEXT,
  meta_campaign_id TEXT,
  meta_adset_id TEXT,
  meta_ad_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ad_campaigns_creator_id ON public.ad_campaigns(creator_id);
CREATE INDEX idx_ad_campaigns_product_id ON public.ad_campaigns(product_id);
CREATE INDEX idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX idx_ad_campaigns_created_at ON public.ad_campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy 1: Creators can view/edit their own campaigns (via product ownership)
CREATE POLICY "Creator can view own campaigns" ON public.ad_campaigns
  FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creator can insert own campaigns" ON public.ad_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can update own campaigns" ON public.ad_campaigns
  FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can delete own campaigns" ON public.ad_campaigns
  FOR DELETE
  USING (auth.uid() = creator_id);

-- Policy 2: Admins can view all campaigns for moderation/approval
CREATE POLICY "Admin can view all campaigns" ON public.ad_campaigns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admin can update campaigns for approval" ON public.ad_campaigns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

COMMENT ON TABLE public.ad_campaigns IS 'Meta advertising campaigns for products. Creators own their campaigns, admins approve before Meta launch.';
