-- =====================================================
-- CREATORS-OS IDEMPOTENT MIGRATION TO CANONICAL SCHEMA
-- Version: 2.0
-- Safe to run multiple times - uses IF NOT EXISTS and DO blocks
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HELPER FUNCTION FOR ADDING COLUMNS
-- =====================================================
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  _table TEXT,
  _column TEXT,
  _type TEXT,
  _default TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = _table
    AND column_name = _column
  ) THEN
    IF _default IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s DEFAULT %s', _table, _column, _type, _default);
    ELSE
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', _table, _column, _type);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. USER_PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  plan TEXT DEFAULT 'free',
  account_type TEXT DEFAULT 'creator',
  agency_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

SELECT add_column_if_not_exists('user_profiles', 'account_type', 'TEXT', '''creator''');
SELECT add_column_if_not_exists('user_profiles', 'agency_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('user_profiles', 'metadata', 'JSONB', '''{}''::jsonb');

-- =====================================================
-- 2. COMPANIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all required columns
SELECT add_column_if_not_exists('companies', 'owner_uid', 'UUID', 'NULL');
SELECT add_column_if_not_exists('companies', 'user_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('companies', 'creator_user_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('companies', 'brand_type', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('companies', 'contact_name', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('companies', 'contact_email', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('companies', 'contact_phone', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('companies', 'notes', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('companies', 'contract', 'JSONB', '''{}''::jsonb');
SELECT add_column_if_not_exists('companies', 'payment_terms', 'JSONB', '''{}''::jsonb');
SELECT add_column_if_not_exists('companies', 'status', 'TEXT', '''ACTIVE''');

-- Sync owner_uid and user_id for backwards compatibility
UPDATE public.companies SET user_id = owner_uid WHERE user_id IS NULL AND owner_uid IS NOT NULL;
UPDATE public.companies SET owner_uid = user_id WHERE owner_uid IS NULL AND user_id IS NOT NULL;
UPDATE public.companies SET creator_user_id = owner_uid WHERE creator_user_id IS NULL AND owner_uid IS NOT NULL;

-- =====================================================
-- 3. CALENDAR_EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT add_column_if_not_exists('calendar_events', 'owner_uid', 'UUID', 'NULL');
SELECT add_column_if_not_exists('calendar_events', 'user_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('calendar_events', 'start_time', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('calendar_events', 'end_time', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('calendar_events', 'is_all_day', 'BOOLEAN', 'FALSE');
SELECT add_column_if_not_exists('calendar_events', 'notes', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('calendar_events', 'company_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('calendar_events', 'company_name_snapshot', 'TEXT', 'NULL');

-- Sync owner_uid and user_id
UPDATE public.calendar_events SET user_id = owner_uid WHERE user_id IS NULL AND owner_uid IS NOT NULL;
UPDATE public.calendar_events SET owner_uid = user_id WHERE owner_uid IS NULL AND user_id IS NOT NULL;

-- =====================================================
-- 4. EVENTS TABLE (alias)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  category TEXT,
  title TEXT NOT NULL DEFAULT '',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  start_time TEXT,
  end_time TEXT,
  is_all_day BOOLEAN DEFAULT FALSE,
  notes TEXT,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. CALENDAR_REMINDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calendar_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL,
  minutes_before INTEGER NOT NULL DEFAULT 30,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. CALENDAR_LINKED_TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calendar_linked_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT add_column_if_not_exists('tasks', 'owner_uid', 'UUID', 'NULL');
SELECT add_column_if_not_exists('tasks', 'user_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('tasks', 'description', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('tasks', 'status', 'TEXT', '''TODO''');
SELECT add_column_if_not_exists('tasks', 'priority', 'TEXT', '''MEDIUM''');
SELECT add_column_if_not_exists('tasks', 'due_date', 'TIMESTAMPTZ', 'NULL');
SELECT add_column_if_not_exists('tasks', 'scheduled_at', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('tasks', 'company_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('tasks', 'company_name_snapshot', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('tasks', 'event_id', 'UUID', 'NULL');
SELECT add_column_if_not_exists('tasks', 'event_title_snapshot', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('tasks', 'category', 'TEXT', 'NULL');
SELECT add_column_if_not_exists('tasks', 'archived', 'BOOLEAN', 'FALSE');

-- Sync owner_uid and user_id
UPDATE public.tasks SET user_id = owner_uid WHERE user_id IS NULL AND owner_uid IS NOT NULL;
UPDATE public.tasks SET owner_uid = user_id WHERE owner_uid IS NULL AND user_id IS NOT NULL;

-- =====================================================
-- 8. GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB DEFAULT '[]'::jsonb,
  reflection JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT add_column_if_not_exists('goals', 'owner_uid', 'UUID', 'NULL');
SELECT add_column_if_not_exists('goals', 'user_id', 'UUID', 'NULL');

-- Sync owner_uid and user_id
UPDATE public.goals SET user_id = owner_uid WHERE user_id IS NULL AND owner_uid IS NOT NULL;
UPDATE public.goals SET owner_uid = user_id WHERE owner_uid IS NULL AND user_id IS NOT NULL;

-- =====================================================
-- 9. DAILY_GOALS TABLE (alias)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB DEFAULT '[]'::jsonb,
  reflection JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. MIGRATION_STATUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.migration_status (
  owner_uid UUID PRIMARY KEY,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  migration_data JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 11. AI_GENERATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  template_id TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. ACTIVITY_EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. WEEKLY_REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  stats JSONB DEFAULT '{}'::jsonb,
  what_worked TEXT,
  improve_next TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. AGENCY_MEMBERSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agency_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL,
  creator_user_id UUID,
  invite_email TEXT,
  role TEXT NOT NULL DEFAULT 'creator',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. AGENCY_CREATORS TABLE (alias)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agency_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_user_id UUID NOT NULL,
  creator_user_id UUID NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. AGENCY_CREATOR_RELATIONSHIPS TABLE (alias)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agency_creator_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_user_id UUID NOT NULL,
  creator_user_id UUID NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. EARNINGS_ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.earnings_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL,
  company_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ILS',
  earned_on DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 18. CLIENT_PORTALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.client_portals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  token TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  brand_name TEXT,
  brand_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 19. APPROVAL_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.approval_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  related_event_id UUID,
  related_task_id UUID,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'draft',
  due_on DATE,
  asset_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 20. APPROVAL_COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.approval_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_item_id UUID NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'creator',
  author_name TEXT,
  author_user_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 21. DELIVERABLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  month TEXT NOT NULL,
  title TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  completed_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned',
  linked_approval_item_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 22. TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL,
  owner_type TEXT DEFAULT 'creator',
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 23. TEMPLATE_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'task',
  title TEXT NOT NULL,
  notes TEXT,
  day_offset INTEGER DEFAULT 0,
  time_of_day TEXT,
  duration_minutes INTEGER,
  event_category TEXT,
  priority TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 24. TEMPLATE_APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.template_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  base_date DATE NOT NULL DEFAULT CURRENT_DATE,
  items_created INTEGER DEFAULT 0
);

-- =====================================================
-- 25. COMPANY_TIMELINE_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  event_id UUID,
  task_id UUID,
  amount NUMERIC,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 26. NOTIFICATION_SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  daily_email_enabled BOOLEAN DEFAULT TRUE,
  daily_email_time TIME DEFAULT '08:30:00',
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  include_motivation BOOLEAN DEFAULT TRUE,
  weekly_summary_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 27. DAILY_DIGEST_LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_digest_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  digest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'sent',
  error_message TEXT
);

-- =====================================================
-- 28. SHARED_REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shared_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'monthly',
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 29. PROFILES TABLE (alias)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'user_profiles', 'companies', 'calendar_events', 'calendar_reminders',
    'calendar_linked_tasks', 'tasks', 'goals', 'migration_status',
    'ai_generations', 'activity_events', 'weekly_reviews', 'agency_memberships',
    'earnings_entries', 'client_portals', 'approval_items', 'approval_comments',
    'deliverables', 'templates', 'template_items', 'template_applications',
    'company_timeline_items', 'notification_settings', 'daily_digest_log',
    'shared_reports', 'agency_creators', 'agency_creator_relationships',
    'events', 'daily_goals', 'profiles'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- user_profiles
DROP POLICY IF EXISTS "users_own_profile" ON public.user_profiles;
CREATE POLICY "users_own_profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

-- companies
DROP POLICY IF EXISTS "companies_owner_access" ON public.companies;
CREATE POLICY "companies_owner_access" ON public.companies
  FOR ALL USING (auth.uid() = owner_uid OR auth.uid() = user_id OR auth.uid() = creator_user_id);

-- calendar_events
DROP POLICY IF EXISTS "calendar_events_owner_access" ON public.calendar_events;
CREATE POLICY "calendar_events_owner_access" ON public.calendar_events
  FOR ALL USING (auth.uid() = owner_uid OR auth.uid() = user_id);

-- events
DROP POLICY IF EXISTS "events_owner_access" ON public.events;
CREATE POLICY "events_owner_access" ON public.events
  FOR ALL USING (auth.uid() = user_id);

-- calendar_reminders
DROP POLICY IF EXISTS "calendar_reminders_via_event" ON public.calendar_reminders;
CREATE POLICY "calendar_reminders_via_event" ON public.calendar_reminders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.calendar_events WHERE id = event_id AND (owner_uid = auth.uid() OR user_id = auth.uid()))
  );

-- calendar_linked_tasks
DROP POLICY IF EXISTS "calendar_linked_tasks_via_event" ON public.calendar_linked_tasks;
CREATE POLICY "calendar_linked_tasks_via_event" ON public.calendar_linked_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.calendar_events WHERE id = event_id AND (owner_uid = auth.uid() OR user_id = auth.uid()))
  );

-- tasks
DROP POLICY IF EXISTS "tasks_owner_access" ON public.tasks;
CREATE POLICY "tasks_owner_access" ON public.tasks
  FOR ALL USING (auth.uid() = owner_uid OR auth.uid() = user_id);

-- goals
DROP POLICY IF EXISTS "goals_owner_access" ON public.goals;
CREATE POLICY "goals_owner_access" ON public.goals
  FOR ALL USING (auth.uid() = owner_uid OR auth.uid() = user_id);

-- daily_goals
DROP POLICY IF EXISTS "daily_goals_owner_access" ON public.daily_goals;
CREATE POLICY "daily_goals_owner_access" ON public.daily_goals
  FOR ALL USING (auth.uid() = user_id);

-- migration_status
DROP POLICY IF EXISTS "migration_status_owner_access" ON public.migration_status;
CREATE POLICY "migration_status_owner_access" ON public.migration_status
  FOR ALL USING (auth.uid() = owner_uid);

-- ai_generations
DROP POLICY IF EXISTS "ai_generations_owner_access" ON public.ai_generations;
CREATE POLICY "ai_generations_owner_access" ON public.ai_generations
  FOR ALL USING (auth.uid() = user_id);

-- activity_events
DROP POLICY IF EXISTS "activity_events_owner_access" ON public.activity_events;
CREATE POLICY "activity_events_owner_access" ON public.activity_events
  FOR ALL USING (auth.uid() = user_id);

-- weekly_reviews
DROP POLICY IF EXISTS "weekly_reviews_owner_access" ON public.weekly_reviews;
CREATE POLICY "weekly_reviews_owner_access" ON public.weekly_reviews
  FOR ALL USING (auth.uid() = user_id);

-- agency_memberships
DROP POLICY IF EXISTS "agency_memberships_access" ON public.agency_memberships;
CREATE POLICY "agency_memberships_access" ON public.agency_memberships
  FOR ALL USING (auth.uid() = agency_id OR auth.uid() = creator_user_id);

-- agency_creators
DROP POLICY IF EXISTS "agency_creators_access" ON public.agency_creators;
CREATE POLICY "agency_creators_access" ON public.agency_creators
  FOR ALL USING (auth.uid() = agency_user_id OR auth.uid() = creator_user_id);

-- agency_creator_relationships
DROP POLICY IF EXISTS "agency_creator_relationships_access" ON public.agency_creator_relationships;
CREATE POLICY "agency_creator_relationships_access" ON public.agency_creator_relationships
  FOR ALL USING (auth.uid() = agency_user_id OR auth.uid() = creator_user_id);

-- earnings_entries
DROP POLICY IF EXISTS "earnings_entries_access" ON public.earnings_entries;
CREATE POLICY "earnings_entries_access" ON public.earnings_entries
  FOR ALL USING (auth.uid() = creator_user_id OR auth.uid() = created_by);

-- client_portals
DROP POLICY IF EXISTS "client_portals_creator_access" ON public.client_portals;
CREATE POLICY "client_portals_creator_access" ON public.client_portals
  FOR ALL USING (auth.uid() = creator_user_id);

-- approval_items
DROP POLICY IF EXISTS "approval_items_creator_access" ON public.approval_items;
CREATE POLICY "approval_items_creator_access" ON public.approval_items
  FOR ALL USING (auth.uid() = creator_user_id);

-- approval_comments
DROP POLICY IF EXISTS "approval_comments_access" ON public.approval_comments;
CREATE POLICY "approval_comments_access" ON public.approval_comments
  FOR ALL USING (
    auth.uid() = author_user_id OR
    EXISTS (SELECT 1 FROM public.approval_items WHERE id = approval_item_id AND creator_user_id = auth.uid())
  );

-- deliverables
DROP POLICY IF EXISTS "deliverables_creator_access" ON public.deliverables;
CREATE POLICY "deliverables_creator_access" ON public.deliverables
  FOR ALL USING (auth.uid() = creator_user_id);

-- templates
DROP POLICY IF EXISTS "templates_access" ON public.templates;
CREATE POLICY "templates_access" ON public.templates
  FOR ALL USING (auth.uid() = owner_user_id OR is_public = TRUE);

-- template_items
DROP POLICY IF EXISTS "template_items_via_template" ON public.template_items;
CREATE POLICY "template_items_via_template" ON public.template_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.templates WHERE id = template_id AND (owner_user_id = auth.uid() OR is_public = TRUE))
  );

-- template_applications
DROP POLICY IF EXISTS "template_applications_owner_access" ON public.template_applications;
CREATE POLICY "template_applications_owner_access" ON public.template_applications
  FOR ALL USING (auth.uid() = user_id);

-- company_timeline_items
DROP POLICY IF EXISTS "company_timeline_items_creator_access" ON public.company_timeline_items;
CREATE POLICY "company_timeline_items_creator_access" ON public.company_timeline_items
  FOR ALL USING (auth.uid() = creator_user_id);

-- notification_settings
DROP POLICY IF EXISTS "notification_settings_owner_access" ON public.notification_settings;
CREATE POLICY "notification_settings_owner_access" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- daily_digest_log
DROP POLICY IF EXISTS "daily_digest_log_owner_access" ON public.daily_digest_log;
CREATE POLICY "daily_digest_log_owner_access" ON public.daily_digest_log
  FOR ALL USING (auth.uid() = user_id);

-- shared_reports
DROP POLICY IF EXISTS "shared_reports_owner_access" ON public.shared_reports;
CREATE POLICY "shared_reports_owner_access" ON public.shared_reports
  FOR ALL USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "profiles_owner_access" ON public.profiles;
CREATE POLICY "profiles_owner_access" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_companies_owner_uid ON public.companies(owner_uid);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_creator_user_id ON public.companies(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);

CREATE INDEX IF NOT EXISTS idx_calendar_events_owner_uid ON public.calendar_events(owner_uid);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_company_id ON public.calendar_events(company_id);

CREATE INDEX IF NOT EXISTS idx_calendar_reminders_event_id ON public.calendar_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_linked_tasks_event_id ON public.calendar_linked_tasks(event_id);

CREATE INDEX IF NOT EXISTS idx_tasks_owner_uid ON public.tasks(owner_uid);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON public.tasks(archived);

CREATE INDEX IF NOT EXISTS idx_goals_owner_uid ON public.goals(owner_uid);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_date ON public.goals(date);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON public.activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON public.activity_events(created_at);

CREATE INDEX IF NOT EXISTS idx_agency_memberships_agency_id ON public.agency_memberships(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_creator_user_id ON public.agency_memberships(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_status ON public.agency_memberships(status);

CREATE INDEX IF NOT EXISTS idx_agency_creators_agency_user_id ON public.agency_creators(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_agency_creators_creator_user_id ON public.agency_creators(creator_user_id);

CREATE INDEX IF NOT EXISTS idx_earnings_entries_creator_user_id ON public.earnings_entries(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_entries_company_id ON public.earnings_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_earnings_entries_earned_on ON public.earnings_entries(earned_on);

CREATE INDEX IF NOT EXISTS idx_approval_items_creator_user_id ON public.approval_items(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_approval_items_company_id ON public.approval_items(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_items_status ON public.approval_items(status);

CREATE INDEX IF NOT EXISTS idx_approval_comments_approval_item_id ON public.approval_comments(approval_item_id);

CREATE INDEX IF NOT EXISTS idx_deliverables_creator_user_id ON public.deliverables(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_company_id ON public.deliverables(company_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_month ON public.deliverables(month);

CREATE INDEX IF NOT EXISTS idx_templates_owner_user_id ON public.templates(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates(is_public);

CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON public.template_items(template_id);

CREATE INDEX IF NOT EXISTS idx_company_timeline_items_company_id ON public.company_timeline_items(company_id);
CREATE INDEX IF NOT EXISTS idx_company_timeline_items_occurred_on ON public.company_timeline_items(occurred_on);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_client_portals_company_id ON public.client_portals(company_id);
CREATE INDEX IF NOT EXISTS idx_client_portals_token ON public.client_portals(token);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'user_profiles', 'companies', 'calendar_events', 'tasks', 'goals',
    'ai_generations', 'weekly_reviews', 'agency_memberships', 'earnings_entries',
    'client_portals', 'approval_items', 'deliverables', 'templates', 'notification_settings',
    'events', 'daily_goals', 'profiles'
  ]
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', tbl, tbl);
      EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;

-- =====================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- AGENCY STATS VIEW
-- =====================================================
DROP VIEW IF EXISTS public.agency_creator_stats;
CREATE OR REPLACE VIEW public.agency_creator_stats AS
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
LEFT JOIN public.user_profiles up ON up.id = am.creator_user_id
LEFT JOIN public.companies c ON c.owner_uid = am.creator_user_id OR c.user_id = am.creator_user_id
LEFT JOIN public.earnings_entries e ON e.creator_user_id = am.creator_user_id
WHERE am.status = 'active'
GROUP BY am.agency_id, am.creator_user_id, up.name, up.email;

GRANT SELECT ON public.agency_creator_stats TO authenticated;

-- =====================================================
-- CLEANUP HELPER FUNCTION
-- =====================================================
DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT, TEXT);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
SELECT 'Migration to canonical schema completed successfully!' as status;
