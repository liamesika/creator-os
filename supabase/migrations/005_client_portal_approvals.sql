-- Migration: Client Portal, Approvals, and Deliverables
-- Sprint: Client Portal + Approvals + Deliverables

-- ============================================
-- CLIENT PORTALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.client_portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    brand_name TEXT NULL,
    brand_color TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(company_id) -- One portal per company
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_portals_token ON public.client_portals(token);
CREATE INDEX IF NOT EXISTS idx_client_portals_creator ON public.client_portals(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_client_portals_company ON public.client_portals(company_id);

-- RLS
ALTER TABLE public.client_portals ENABLE ROW LEVEL SECURITY;

-- Creator can manage their own portals
CREATE POLICY "creator_manage_own_portals" ON public.client_portals
    FOR ALL USING (creator_user_id = auth.uid());

-- Agency can manage portals for managed creators
CREATE POLICY "agency_manage_creator_portals" ON public.client_portals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agency_creator_relationships acr
            WHERE acr.creator_user_id = client_portals.creator_user_id
            AND acr.agency_user_id = auth.uid()
            AND acr.status = 'active'
        )
    );

-- ============================================
-- APPROVAL ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.approval_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    related_event_id UUID NULL REFERENCES public.events(id) ON DELETE SET NULL,
    related_task_id UUID NULL REFERENCES public.tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('post', 'reel', 'story', 'tiktok', 'other')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'changes_requested')),
    due_on DATE NULL,
    asset_url TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_approval_items_company_status ON public.approval_items(company_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_items_creator_created ON public.approval_items(creator_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_items_status ON public.approval_items(status);

-- RLS
ALTER TABLE public.approval_items ENABLE ROW LEVEL SECURITY;

-- Creator can manage their own approval items
CREATE POLICY "creator_manage_own_approvals" ON public.approval_items
    FOR ALL USING (creator_user_id = auth.uid());

-- Agency can manage approvals for managed creators
CREATE POLICY "agency_manage_creator_approvals" ON public.approval_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agency_creator_relationships acr
            WHERE acr.creator_user_id = approval_items.creator_user_id
            AND acr.agency_user_id = auth.uid()
            AND acr.status = 'active'
        )
    );

-- ============================================
-- APPROVAL COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.approval_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_item_id UUID NOT NULL REFERENCES public.approval_items(id) ON DELETE CASCADE,
    author_type TEXT NOT NULL CHECK (author_type IN ('creator', 'client', 'agency')),
    author_name TEXT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_approval_comments_item ON public.approval_comments(approval_item_id, created_at);

-- RLS
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;

-- Creator can manage comments on their approval items
CREATE POLICY "creator_manage_approval_comments" ON public.approval_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.approval_items ai
            WHERE ai.id = approval_comments.approval_item_id
            AND ai.creator_user_id = auth.uid()
        )
    );

-- Agency can manage comments for managed creators
CREATE POLICY "agency_manage_approval_comments" ON public.approval_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.approval_items ai
            JOIN public.agency_creator_relationships acr ON acr.creator_user_id = ai.creator_user_id
            WHERE ai.id = approval_comments.approval_item_id
            AND acr.agency_user_id = auth.uid()
            AND acr.status = 'active'
        )
    );

-- ============================================
-- DELIVERABLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- 'YYYY-MM'
    title TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    completed_quantity INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'delivered')),
    linked_approval_item_id UUID NULL REFERENCES public.approval_items(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(company_id, month, title)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_company_month ON public.deliverables(company_id, month);
CREATE INDEX IF NOT EXISTS idx_deliverables_creator ON public.deliverables(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON public.deliverables(status);

-- RLS
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- Creator can manage their own deliverables
CREATE POLICY "creator_manage_own_deliverables" ON public.deliverables
    FOR ALL USING (creator_user_id = auth.uid());

-- Agency can manage deliverables for managed creators
CREATE POLICY "agency_manage_creator_deliverables" ON public.deliverables
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agency_creator_relationships acr
            WHERE acr.creator_user_id = deliverables.creator_user_id
            AND acr.agency_user_id = auth.uid()
            AND acr.status = 'active'
        )
    );

-- ============================================
-- TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to approval_items
DROP TRIGGER IF EXISTS update_approval_items_updated_at ON public.approval_items;
CREATE TRIGGER update_approval_items_updated_at
    BEFORE UPDATE ON public.approval_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to deliverables
DROP TRIGGER IF EXISTS update_deliverables_updated_at ON public.deliverables;
CREATE TRIGGER update_deliverables_updated_at
    BEFORE UPDATE ON public.deliverables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
