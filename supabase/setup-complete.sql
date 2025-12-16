-- =====================================================
-- CREATORS-OS COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  account_type TEXT DEFAULT 'creator' CHECK (account_type IN ('creator', 'agency')),
  agency_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_type TEXT CHECK (brand_type IN ('brand', 'company', 'client')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  contract JSONB DEFAULT '{}'::jsonb,
  payment_terms JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time TEXT,
  end_time TEXT,
  is_all_day BOOLEAN DEFAULT FALSE,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company_name_snapshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_reminders table
CREATE TABLE IF NOT EXISTS public.calendar_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  minutes_before INTEGER NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_linked_tasks table
CREATE TABLE IF NOT EXISTS public.calendar_linked_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'DOING', 'DONE')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  due_date TIMESTAMPTZ,
  scheduled_at TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company_name_snapshot TEXT,
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  event_title_snapshot TEXT,
  category TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  reflection JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_uid, date)
);

-- Create migration_status table
CREATE TABLE IF NOT EXISTS public.migration_status (
  owner_uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  migration_data JSONB DEFAULT '{}'::jsonb
);

-- Create ai_generations table
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_events table
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weekly_reviews table
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  stats JSONB DEFAULT '{}'::jsonb,
  what_worked TEXT,
  improve_next TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- =====================================================
-- AGENCY TABLES
-- =====================================================

-- Create agency_memberships table
CREATE TABLE IF NOT EXISTS public.agency_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    creator_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invite_email TEXT,
    role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'manager', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_agency_creator UNIQUE (agency_id, creator_user_id),
    CONSTRAINT unique_agency_invite_email UNIQUE (agency_id, invite_email),
    CONSTRAINT require_creator_or_email CHECK (creator_user_id IS NOT NULL OR invite_email IS NOT NULL)
);

-- Create earnings_entries table
CREATE TABLE IF NOT EXISTS public.earnings_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'ILS' CHECK (currency IN ('ILS', 'USD', 'EUR')),
    earned_on DATE NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_linked_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_entries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if user is agency member
CREATE OR REPLACE FUNCTION public.is_agency_member(p_agency_id UUID, p_creator_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.agency_memberships
        WHERE agency_id = p_agency_id
        AND creator_user_id = p_creator_id
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user agency ID
CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS UUID AS $$
DECLARE
    v_agency_id UUID;
    v_account_type TEXT;
BEGIN
    SELECT id, account_type INTO v_agency_id, v_account_type
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF v_account_type = 'agency' THEN
        RETURN v_agency_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if agency manages creator
CREATE OR REPLACE FUNCTION public.agency_manages_creator(p_creator_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.agency_memberships am
        JOIN public.user_profiles up ON up.id = am.agency_id
        WHERE am.agency_id = auth.uid()
        AND am.creator_user_id = p_creator_id
        AND am.status = 'active'
        AND up.account_type = 'agency'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile or agency managed" ON public.user_profiles;
CREATE POLICY "Users can view own profile or agency managed"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR public.agency_manages_creator(id));

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- companies policies
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view own companies or agency managed" ON public.companies;
CREATE POLICY "Users can view own companies or agency managed"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_uid OR public.agency_manages_creator(owner_uid));

DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;
CREATE POLICY "Users can insert own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
CREATE POLICY "Users can update own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;
CREATE POLICY "Users can delete own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_uid);

-- calendar_events policies
DROP POLICY IF EXISTS "Users can view own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view own events or agency managed" ON public.calendar_events;
CREATE POLICY "Users can view own events or agency managed"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = owner_uid OR public.agency_manages_creator(owner_uid));

DROP POLICY IF EXISTS "Users can insert own events" ON public.calendar_events;
CREATE POLICY "Users can insert own events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can update own events" ON public.calendar_events;
CREATE POLICY "Users can update own events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can delete own events" ON public.calendar_events;
CREATE POLICY "Users can delete own events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid() = owner_uid);

-- calendar_reminders policies
DROP POLICY IF EXISTS "Users can view reminders of own events" ON public.calendar_reminders;
CREATE POLICY "Users can view reminders of own events"
  ON public.calendar_reminders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_reminders.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert reminders for own events" ON public.calendar_reminders;
CREATE POLICY "Users can insert reminders for own events"
  ON public.calendar_reminders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_reminders.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update reminders of own events" ON public.calendar_reminders;
CREATE POLICY "Users can update reminders of own events"
  ON public.calendar_reminders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_reminders.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete reminders of own events" ON public.calendar_reminders;
CREATE POLICY "Users can delete reminders of own events"
  ON public.calendar_reminders FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_reminders.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

-- calendar_linked_tasks policies
DROP POLICY IF EXISTS "Users can view linked tasks of own events" ON public.calendar_linked_tasks;
CREATE POLICY "Users can view linked tasks of own events"
  ON public.calendar_linked_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_linked_tasks.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert linked tasks for own events" ON public.calendar_linked_tasks;
CREATE POLICY "Users can insert linked tasks for own events"
  ON public.calendar_linked_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_linked_tasks.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update linked tasks of own events" ON public.calendar_linked_tasks;
CREATE POLICY "Users can update linked tasks of own events"
  ON public.calendar_linked_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_linked_tasks.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete linked tasks of own events" ON public.calendar_linked_tasks;
CREATE POLICY "Users can delete linked tasks of own events"
  ON public.calendar_linked_tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.calendar_events
    WHERE calendar_events.id = calendar_linked_tasks.event_id
    AND calendar_events.owner_uid = auth.uid()
  ));

-- tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view own tasks or agency managed" ON public.tasks;
CREATE POLICY "Users can view own tasks or agency managed"
  ON public.tasks FOR SELECT
  USING (auth.uid() = owner_uid OR public.agency_manages_creator(owner_uid));

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = owner_uid);

-- goals policies
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can view own goals or agency managed" ON public.goals;
CREATE POLICY "Users can view own goals or agency managed"
  ON public.goals FOR SELECT
  USING (auth.uid() = owner_uid OR public.agency_manages_creator(owner_uid));

DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = owner_uid);

-- migration_status policies
DROP POLICY IF EXISTS "Users can view own migration status" ON public.migration_status;
CREATE POLICY "Users can view own migration status"
  ON public.migration_status FOR SELECT
  USING (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can insert own migration status" ON public.migration_status;
CREATE POLICY "Users can insert own migration status"
  ON public.migration_status FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can update own migration status" ON public.migration_status;
CREATE POLICY "Users can update own migration status"
  ON public.migration_status FOR UPDATE
  USING (auth.uid() = owner_uid);

-- ai_generations policies
DROP POLICY IF EXISTS "Users can view own ai generations" ON public.ai_generations;
CREATE POLICY "Users can view own ai generations"
  ON public.ai_generations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ai generations" ON public.ai_generations;
CREATE POLICY "Users can insert own ai generations"
  ON public.ai_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ai generations" ON public.ai_generations;
CREATE POLICY "Users can update own ai generations"
  ON public.ai_generations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ai generations" ON public.ai_generations;
CREATE POLICY "Users can delete own ai generations"
  ON public.ai_generations FOR DELETE
  USING (auth.uid() = user_id);

-- activity_events policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_events;
CREATE POLICY "Users can view own activity"
  ON public.activity_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_events;
CREATE POLICY "Users can insert own activity"
  ON public.activity_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- weekly_reviews policies
DROP POLICY IF EXISTS "Users can view own weekly reviews" ON public.weekly_reviews;
CREATE POLICY "Users can view own weekly reviews"
  ON public.weekly_reviews FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own weekly reviews" ON public.weekly_reviews;
CREATE POLICY "Users can insert own weekly reviews"
  ON public.weekly_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own weekly reviews" ON public.weekly_reviews;
CREATE POLICY "Users can update own weekly reviews"
  ON public.weekly_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- agency_memberships policies
DROP POLICY IF EXISTS "Agencies can view own memberships" ON public.agency_memberships;
CREATE POLICY "Agencies can view own memberships"
    ON public.agency_memberships FOR SELECT
    USING (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Creators can view own membership" ON public.agency_memberships;
CREATE POLICY "Creators can view own membership"
    ON public.agency_memberships FOR SELECT
    USING (auth.uid() = creator_user_id);

DROP POLICY IF EXISTS "Agencies can insert memberships" ON public.agency_memberships;
CREATE POLICY "Agencies can insert memberships"
    ON public.agency_memberships FOR INSERT
    WITH CHECK (
        auth.uid() = agency_id
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND account_type = 'agency'
        )
    );

DROP POLICY IF EXISTS "Agencies can update own memberships" ON public.agency_memberships;
CREATE POLICY "Agencies can update own memberships"
    ON public.agency_memberships FOR UPDATE
    USING (
        auth.uid() = agency_id
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND account_type = 'agency'
        )
    );

DROP POLICY IF EXISTS "Agencies can delete own memberships" ON public.agency_memberships;
CREATE POLICY "Agencies can delete own memberships"
    ON public.agency_memberships FOR DELETE
    USING (
        auth.uid() = agency_id
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND account_type = 'agency'
        )
    );

-- earnings_entries policies
DROP POLICY IF EXISTS "Creators can view own earnings" ON public.earnings_entries;
CREATE POLICY "Creators can view own earnings"
    ON public.earnings_entries FOR SELECT
    USING (auth.uid() = creator_user_id);

DROP POLICY IF EXISTS "Agencies can view managed creator earnings" ON public.earnings_entries;
CREATE POLICY "Agencies can view managed creator earnings"
    ON public.earnings_entries FOR SELECT
    USING (public.agency_manages_creator(creator_user_id));

DROP POLICY IF EXISTS "Creators can insert own earnings" ON public.earnings_entries;
CREATE POLICY "Creators can insert own earnings"
    ON public.earnings_entries FOR INSERT
    WITH CHECK (auth.uid() = creator_user_id);

DROP POLICY IF EXISTS "Agencies can insert managed creator earnings" ON public.earnings_entries;
CREATE POLICY "Agencies can insert managed creator earnings"
    ON public.earnings_entries FOR INSERT
    WITH CHECK (public.agency_manages_creator(creator_user_id));

DROP POLICY IF EXISTS "Creators can update own earnings" ON public.earnings_entries;
CREATE POLICY "Creators can update own earnings"
    ON public.earnings_entries FOR UPDATE
    USING (auth.uid() = creator_user_id);

DROP POLICY IF EXISTS "Agencies can update managed creator earnings" ON public.earnings_entries;
CREATE POLICY "Agencies can update managed creator earnings"
    ON public.earnings_entries FOR UPDATE
    USING (public.agency_manages_creator(creator_user_id));

DROP POLICY IF EXISTS "Creators can delete own earnings" ON public.earnings_entries;
CREATE POLICY "Creators can delete own earnings"
    ON public.earnings_entries FOR DELETE
    USING (auth.uid() = creator_user_id);

DROP POLICY IF EXISTS "Agencies can delete managed creator earnings" ON public.earnings_entries;
CREATE POLICY "Agencies can delete managed creator earnings"
    ON public.earnings_entries FOR DELETE
    USING (public.agency_manages_creator(creator_user_id));

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_agency_id ON public.user_profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_uid);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_owner ON public.calendar_events(owner_uid);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_company ON public.calendar_events(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON public.tasks(owner_uid);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_goals_owner_date ON public.goals(owner_uid, date);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_user ON public.activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_created ON public.activity_events(created_at);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON public.weekly_reviews(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_agency_id ON public.agency_memberships(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_creator_id ON public.agency_memberships(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_status ON public.agency_memberships(status);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_invite_email ON public.agency_memberships(invite_email);
CREATE INDEX IF NOT EXISTS idx_earnings_creator_date ON public.earnings_entries(creator_user_id, earned_on);
CREATE INDEX IF NOT EXISTS idx_earnings_company_date ON public.earnings_entries(company_id, earned_on);
CREATE INDEX IF NOT EXISTS idx_earnings_earned_on ON public.earnings_entries(earned_on);

-- =====================================================
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_generations_updated_at ON public.ai_generations;
CREATE TRIGGER update_ai_generations_updated_at BEFORE UPDATE ON public.ai_generations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_reviews_updated_at ON public.weekly_reviews;
CREATE TRIGGER update_weekly_reviews_updated_at BEFORE UPDATE ON public.weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_memberships_updated_at ON public.agency_memberships;
CREATE TRIGGER update_agency_memberships_updated_at BEFORE UPDATE ON public.agency_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_earnings_entries_updated_at ON public.earnings_entries;
CREATE TRIGGER update_earnings_entries_updated_at BEFORE UPDATE ON public.earnings_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

DROP VIEW IF EXISTS public.agency_creator_stats;
CREATE VIEW public.agency_creator_stats AS
SELECT
    am.agency_id,
    am.creator_user_id,
    up.name as creator_name,
    up.email as creator_email,
    COUNT(DISTINCT c.id) as company_count,
    COALESCE(SUM(CASE
        WHEN e.earned_on >= date_trunc('month', CURRENT_DATE)
        THEN e.amount
        ELSE 0
    END), 0) as monthly_earnings,
    COALESCE(SUM(CASE
        WHEN e.earned_on >= date_trunc('year', CURRENT_DATE)
        THEN e.amount
        ELSE 0
    END), 0) as yearly_earnings,
    COUNT(DISTINCT CASE WHEN c.status = 'ACTIVE' THEN c.id END) as active_company_count
FROM public.agency_memberships am
JOIN public.user_profiles up ON up.id = am.creator_user_id
LEFT JOIN public.companies c ON c.owner_uid = am.creator_user_id
LEFT JOIN public.earnings_entries e ON e.creator_user_id = am.creator_user_id
WHERE am.status = 'active'
GROUP BY am.agency_id, am.creator_user_id, up.name, up.email;

GRANT SELECT ON public.agency_creator_stats TO authenticated;

-- =====================================================
-- DONE - All tables and policies created!
-- =====================================================
