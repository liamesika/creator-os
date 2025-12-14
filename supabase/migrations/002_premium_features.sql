-- Premium Features Migration
-- notification_settings, daily_digest_log, creator_health_snapshots

-- ============================================
-- 1. NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    daily_email_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_email_time TIME NOT NULL DEFAULT '08:30:00',
    timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
    include_motivation BOOLEAN NOT NULL DEFAULT true,
    weekly_summary_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- ============================================
-- 2. DAILY DIGEST LOG TABLE (Idempotency)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_digest_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    digest_date DATE NOT NULL,
    digest_type TEXT NOT NULL DEFAULT 'daily' CHECK (digest_type IN ('daily', 'weekly', 'agency')),
    sent_at TIMESTAMPTZ,
    email_id TEXT, -- External email provider ID for tracking
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, digest_date, digest_type)
);

-- ============================================
-- 3. CREATOR HEALTH SNAPSHOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.creator_health_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    status TEXT NOT NULL CHECK (status IN ('calm', 'busy', 'overloaded')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Details structure: {
    --   openTasks: number,
    --   overdueTasks: number,
    --   eventsToday: number,
    --   eventsWeek: number,
    --   backlogPressure: number,
    --   streakPressure: number,
    --   insights: string[]
    -- }
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, snapshot_date)
);

-- ============================================
-- 4. FOCUS MODE SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    completed_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    moved_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    reflection TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, session_date)
);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_digest_log_user_date ON public.daily_digest_log(user_id, digest_date);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_user_date ON public.creator_health_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON public.focus_sessions(user_id, session_date DESC);

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_digest_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- notification_settings policies
CREATE POLICY "Users can view own notification settings"
ON public.notification_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
ON public.notification_settings FOR UPDATE
USING (auth.uid() = user_id);

-- daily_digest_log policies
CREATE POLICY "Users can view own digest logs"
ON public.daily_digest_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert digest logs"
ON public.daily_digest_log FOR INSERT
WITH CHECK (true); -- Controlled by API route with secret

-- creator_health_snapshots policies
CREATE POLICY "Users can view own health snapshots"
ON public.creator_health_snapshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health snapshots"
ON public.creator_health_snapshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agency can view managed creators health snapshots"
ON public.creator_health_snapshots FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.agency_memberships am
        JOIN public.user_profiles up ON up.id = am.agency_id
        WHERE am.creator_user_id = creator_health_snapshots.user_id
        AND am.agency_id = auth.uid()
        AND am.status = 'active'
        AND up.account_type = 'agency'
    )
);

-- focus_sessions policies
CREATE POLICY "Users can view own focus sessions"
ON public.focus_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions"
ON public.focus_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
ON public.focus_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Agency can view managed creators focus sessions
CREATE POLICY "Agency can view managed creators focus sessions"
ON public.focus_sessions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.agency_memberships am
        JOIN public.user_profiles up ON up.id = am.agency_id
        WHERE am.creator_user_id = focus_sessions.user_id
        AND am.agency_id = auth.uid()
        AND am.status = 'active'
        AND up.account_type = 'agency'
    )
);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to get or create notification settings for a user
CREATE OR REPLACE FUNCTION public.get_or_create_notification_settings(p_user_id UUID)
RETURNS public.notification_settings AS $$
DECLARE
    v_settings public.notification_settings;
BEGIN
    SELECT * INTO v_settings
    FROM public.notification_settings
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        INSERT INTO public.notification_settings (user_id)
        VALUES (p_user_id)
        RETURNING * INTO v_settings;
    END IF;

    RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if digest was already sent today
CREATE OR REPLACE FUNCTION public.is_digest_sent_today(p_user_id UUID, p_digest_type TEXT DEFAULT 'daily')
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.daily_digest_log
        WHERE user_id = p_user_id
        AND digest_date = CURRENT_DATE
        AND digest_type = p_digest_type
        AND sent_at IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's health snapshot or compute if needed
CREATE OR REPLACE FUNCTION public.get_today_health_snapshot(p_user_id UUID)
RETURNS public.creator_health_snapshots AS $$
DECLARE
    v_snapshot public.creator_health_snapshots;
BEGIN
    SELECT * INTO v_snapshot
    FROM public.creator_health_snapshots
    WHERE user_id = p_user_id
    AND snapshot_date = CURRENT_DATE;

    RETURN v_snapshot; -- May be NULL if not computed yet
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
