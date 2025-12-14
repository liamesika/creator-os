-- ============================================
-- TEMPLATES SYSTEM MIGRATION
-- Premium time-saver features
-- ============================================

-- ============================================
-- TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL CHECK (owner_type IN ('creator', 'agency')),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('weekly_shoot', 'product_launch', 'monthly_campaign', 'custom')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for owner lookup
CREATE INDEX IF NOT EXISTS idx_templates_owner ON public.templates(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON public.templates(is_public) WHERE is_public = true;

-- ============================================
-- TEMPLATE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('event', 'task', 'goal')),
    title TEXT NOT NULL,
    notes TEXT,
    day_offset INT NOT NULL DEFAULT 0,
    time_of_day TIME NULL,
    duration_minutes INT NULL,
    event_category TEXT NULL,
    priority TEXT NULL CHECK (priority IS NULL OR priority IN ('LOW', 'MEDIUM', 'HIGH')),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for template items lookup
CREATE INDEX IF NOT EXISTS idx_template_items_template ON public.template_items(template_id);

-- ============================================
-- TEMPLATE APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.template_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    applied_by_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    target_creator_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    created_event_ids UUID[] NOT NULL DEFAULT '{}',
    created_task_ids UUID[] NOT NULL DEFAULT '{}',
    created_goal_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Prevent duplicate applications within same minute
    CONSTRAINT unique_template_application UNIQUE (template_id, target_creator_user_id, start_date)
);

-- Index for application lookups
CREATE INDEX IF NOT EXISTS idx_template_applications_template ON public.template_applications(template_id);
CREATE INDEX IF NOT EXISTS idx_template_applications_applied_by ON public.template_applications(applied_by_user_id);
CREATE INDEX IF NOT EXISTS idx_template_applications_target ON public.template_applications(target_creator_user_id);

-- ============================================
-- RLS POLICIES FOR TEMPLATES
-- ============================================
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Creators can view their own templates + public templates
CREATE POLICY "Users can view own templates" ON public.templates
    FOR SELECT
    USING (
        owner_user_id = auth.uid()
        OR is_public = true
    );

-- Agencies can view templates of creators they manage
CREATE POLICY "Agencies can view creator templates" ON public.templates
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agency_memberships am
            WHERE am.agency_id = auth.uid()
            AND am.creator_user_id = templates.owner_user_id
            AND am.status = 'active'
        )
    );

-- Users can create their own templates
CREATE POLICY "Users can create own templates" ON public.templates
    FOR INSERT
    WITH CHECK (owner_user_id = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON public.templates
    FOR UPDATE
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON public.templates
    FOR DELETE
    USING (owner_user_id = auth.uid());

-- ============================================
-- RLS POLICIES FOR TEMPLATE ITEMS
-- ============================================
ALTER TABLE public.template_items ENABLE ROW LEVEL SECURITY;

-- Users can view items of templates they can access
CREATE POLICY "Users can view template items" ON public.template_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.templates t
            WHERE t.id = template_items.template_id
            AND (
                t.owner_user_id = auth.uid()
                OR t.is_public = true
                OR EXISTS (
                    SELECT 1 FROM public.agency_memberships am
                    WHERE am.agency_id = auth.uid()
                    AND am.creator_user_id = t.owner_user_id
                    AND am.status = 'active'
                )
            )
        )
    );

-- Users can manage items of their own templates
CREATE POLICY "Users can create template items" ON public.template_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.templates t
            WHERE t.id = template_items.template_id
            AND t.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update template items" ON public.template_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.templates t
            WHERE t.id = template_items.template_id
            AND t.owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete template items" ON public.template_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.templates t
            WHERE t.id = template_items.template_id
            AND t.owner_user_id = auth.uid()
        )
    );

-- ============================================
-- RLS POLICIES FOR TEMPLATE APPLICATIONS
-- ============================================
ALTER TABLE public.template_applications ENABLE ROW LEVEL SECURITY;

-- Users can view applications they made or were applied to them
CREATE POLICY "Users can view own applications" ON public.template_applications
    FOR SELECT
    USING (
        applied_by_user_id = auth.uid()
        OR target_creator_user_id = auth.uid()
    );

-- Agencies can view applications for their creators
CREATE POLICY "Agencies can view creator applications" ON public.template_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agency_memberships am
            WHERE am.agency_id = auth.uid()
            AND am.creator_user_id = template_applications.target_creator_user_id
            AND am.status = 'active'
        )
    );

-- Users can create applications (access validated at API level)
CREATE POLICY "Users can create applications" ON public.template_applications
    FOR INSERT
    WITH CHECK (applied_by_user_id = auth.uid());

-- ============================================
-- UPDATED_AT TRIGGER FOR TEMPLATES
-- ============================================
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS templates_updated_at ON public.templates;
CREATE TRIGGER templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION update_templates_updated_at();
