-- Migration: Agency Premium Features
-- Company Timeline, Insights, Shared Reports

-- ============================================
-- 1. COMPANY TIMELINE ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS public.company_timeline_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('contract', 'milestone', 'deliverable', 'note', 'payment', 'content')),
    title TEXT NOT NULL,
    details TEXT,
    event_id UUID NULL REFERENCES public.events(id) ON DELETE SET NULL,
    task_id UUID NULL REFERENCES public.tasks(id) ON DELETE SET NULL,
    amount NUMERIC NULL,
    occurred_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_company_timeline_company_date
    ON public.company_timeline_items(company_id, occurred_on DESC);
CREATE INDEX IF NOT EXISTS idx_company_timeline_creator_date
    ON public.company_timeline_items(creator_user_id, occurred_on DESC);

-- RLS for company_timeline_items
ALTER TABLE public.company_timeline_items ENABLE ROW LEVEL SECURITY;

-- Creator can CRUD their own timeline items
CREATE POLICY "Creators can manage their timeline items"
    ON public.company_timeline_items
    FOR ALL
    USING (creator_user_id = auth.uid())
    WITH CHECK (creator_user_id = auth.uid());

-- Agency can read/write timeline for creators they manage
CREATE POLICY "Agency can manage creator timeline items"
    ON public.company_timeline_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.agency_creator_relationships acr
            WHERE acr.creator_user_id = company_timeline_items.creator_user_id
            AND acr.agency_user_id = auth.uid()
            AND acr.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agency_creator_relationships acr
            WHERE acr.creator_user_id = company_timeline_items.creator_user_id
            AND acr.agency_user_id = auth.uid()
            AND acr.status = 'active'
        )
    );

-- ============================================
-- 2. INSIGHT EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.insight_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('creator', 'agency')),
    related_creator_user_id UUID NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'risk')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    insight_key TEXT NOT NULL,
    created_for_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint to prevent duplicate insights
CREATE UNIQUE INDEX IF NOT EXISTS idx_insight_events_unique
    ON public.insight_events(
        user_id,
        insight_key,
        created_for_date,
        COALESCE(related_creator_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
    );

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_insight_events_user_date
    ON public.insight_events(user_id, created_for_date DESC);

-- RLS for insight_events
ALTER TABLE public.insight_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own insights
CREATE POLICY "Users can read their insights"
    ON public.insight_events
    FOR SELECT
    USING (user_id = auth.uid());

-- Agency can read insights for their managed creators
CREATE POLICY "Agency can read creator insights"
    ON public.insight_events
    FOR SELECT
    USING (
        scope = 'agency' AND
        EXISTS (
            SELECT 1 FROM public.agency_creator_relationships acr
            WHERE acr.creator_user_id = insight_events.related_creator_user_id
            AND acr.agency_user_id = auth.uid()
            AND acr.status = 'active'
        )
    );

-- Server can insert insights (service role)
CREATE POLICY "Service can manage insights"
    ON public.insight_events
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 3. SHARED REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.shared_reports (
    token TEXT PRIMARY KEY,
    owner_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('monthly_review', 'creator_report', 'agency_report')),
    payload JSONB NOT NULL,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for cleanup of expired reports
CREATE INDEX IF NOT EXISTS idx_shared_reports_expires
    ON public.shared_reports(expires_at)
    WHERE expires_at IS NOT NULL;

-- RLS for shared_reports
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

-- Only service role can write
CREATE POLICY "Service can manage shared reports"
    ON public.shared_reports
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Public can read by token (handled via API, not direct DB access)
-- No public read policy - all access goes through API route

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to clean up expired shared reports
CREATE OR REPLACE FUNCTION cleanup_expired_shared_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.shared_reports
    WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;
