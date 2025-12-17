-- =====================================================
-- CREATORS-OS MIGRATION FIX
-- Run this script to fix existing tables that may have
-- different column names or missing columns
-- This is IDEMPOTENT - safe to run multiple times
-- =====================================================

-- =====================================================
-- FIX COMPANIES TABLE
-- =====================================================

-- Add owner_uid if using user_id column
DO $$
BEGIN
    -- Check if owner_uid exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'owner_uid'
    ) THEN
        -- Check if user_id exists and rename it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'companies'
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.companies RENAME COLUMN user_id TO owner_uid;
            RAISE NOTICE 'Renamed companies.user_id to owner_uid';
        ELSE
            -- Add owner_uid column if neither exists
            ALTER TABLE public.companies ADD COLUMN owner_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added owner_uid column to companies';
        END IF;
    ELSE
        RAISE NOTICE 'companies.owner_uid already exists';
    END IF;
END $$;

-- Add brand_type column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'brand_type'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN brand_type TEXT CHECK (brand_type IN ('brand', 'company', 'client', 'BRAND', 'AGENCY', 'STARTUP', 'ECOMMERCE', 'RESTAURANT', 'FASHION', 'TECH', 'HEALTH', 'EDUCATION', 'REAL_ESTATE', 'OTHER'));
        RAISE NOTICE 'Added brand_type column to companies';
    ELSE
        RAISE NOTICE 'companies.brand_type already exists';
    END IF;
END $$;

-- Add contract column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'contract'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN contract JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added contract column to companies';
    ELSE
        RAISE NOTICE 'companies.contract already exists';
    END IF;
END $$;

-- Add payment_terms column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'companies'
        AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN payment_terms JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added payment_terms column to companies';
    ELSE
        RAISE NOTICE 'companies.payment_terms already exists';
    END IF;
END $$;

-- =====================================================
-- FIX TASKS TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tasks'
        AND column_name = 'owner_uid'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'tasks'
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.tasks RENAME COLUMN user_id TO owner_uid;
            RAISE NOTICE 'Renamed tasks.user_id to owner_uid';
        ELSE
            ALTER TABLE public.tasks ADD COLUMN owner_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added owner_uid column to tasks';
        END IF;
    ELSE
        RAISE NOTICE 'tasks.owner_uid already exists';
    END IF;
END $$;

-- Add archived column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tasks'
        AND column_name = 'archived'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN archived BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added archived column to tasks';
    ELSE
        RAISE NOTICE 'tasks.archived already exists';
    END IF;
END $$;

-- Add company_name_snapshot if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tasks'
        AND column_name = 'company_name_snapshot'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN company_name_snapshot TEXT;
        RAISE NOTICE 'Added company_name_snapshot column to tasks';
    END IF;
END $$;

-- Add event_title_snapshot if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tasks'
        AND column_name = 'event_title_snapshot'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN event_title_snapshot TEXT;
        RAISE NOTICE 'Added event_title_snapshot column to tasks';
    END IF;
END $$;

-- Add category if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tasks'
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column to tasks';
    END IF;
END $$;

-- =====================================================
-- FIX GOALS TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'goals'
        AND column_name = 'owner_uid'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'goals'
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.goals RENAME COLUMN user_id TO owner_uid;
            RAISE NOTICE 'Renamed goals.user_id to owner_uid';
        ELSE
            ALTER TABLE public.goals ADD COLUMN owner_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added owner_uid column to goals';
        END IF;
    ELSE
        RAISE NOTICE 'goals.owner_uid already exists';
    END IF;
END $$;

-- =====================================================
-- FIX CALENDAR_EVENTS TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'calendar_events'
        AND column_name = 'owner_uid'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'calendar_events'
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE public.calendar_events RENAME COLUMN user_id TO owner_uid;
            RAISE NOTICE 'Renamed calendar_events.user_id to owner_uid';
        ELSE
            ALTER TABLE public.calendar_events ADD COLUMN owner_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added owner_uid column to calendar_events';
        END IF;
    ELSE
        RAISE NOTICE 'calendar_events.owner_uid already exists';
    END IF;
END $$;

-- Add company_name_snapshot if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'calendar_events'
        AND column_name = 'company_name_snapshot'
    ) THEN
        ALTER TABLE public.calendar_events ADD COLUMN company_name_snapshot TEXT;
        RAISE NOTICE 'Added company_name_snapshot column to calendar_events';
    END IF;
END $$;

-- =====================================================
-- CREATE CALENDAR_REMINDERS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.calendar_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  minutes_before INTEGER NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATE CALENDAR_LINKED_TASKS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.calendar_linked_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATE MIGRATION_STATUS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.migration_status (
  owner_uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  migration_data JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_linked_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_status ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

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

-- migration_status policies
DROP POLICY IF EXISTS "Users can view own migration status" ON public.migration_status;
CREATE POLICY "Users can view own migration status"
  ON public.migration_status FOR SELECT
  USING (auth.uid() = owner_uid);

DROP POLICY IF EXISTS "Users can insert own migration status" ON public.migration_status;
CREATE POLICY "Users can insert own migration status"
  ON public.migration_status FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

-- =====================================================
-- CREATE INDEXES ON NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_uid);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON public.tasks(owner_uid);
CREATE INDEX IF NOT EXISTS idx_goals_owner_date ON public.goals(owner_uid, date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_owner ON public.calendar_events(owner_uid);
CREATE INDEX IF NOT EXISTS idx_calendar_reminders_event ON public.calendar_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_linked_tasks_event ON public.calendar_linked_tasks(event_id);

-- =====================================================
-- UPDATE RLS POLICIES FOR MAIN TABLES
-- These use owner_uid consistently
-- =====================================================

-- companies policies
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view own companies or agency managed" ON public.companies;
CREATE POLICY "Users can view own companies or agency managed"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_uid);

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

-- tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view own tasks or agency managed" ON public.tasks;
CREATE POLICY "Users can view own tasks or agency managed"
  ON public.tasks FOR SELECT
  USING (auth.uid() = owner_uid);

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
  USING (auth.uid() = owner_uid);

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

-- calendar_events policies
DROP POLICY IF EXISTS "Users can view own events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can view own events or agency managed" ON public.calendar_events;
CREATE POLICY "Users can view own events or agency managed"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = owner_uid);

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

-- =====================================================
-- RELOAD POSTGREST SCHEMA CACHE
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- DONE - Migration fix complete!
-- =====================================================

SELECT 'Migration fix completed successfully! Schema cache reloaded.' as status;
