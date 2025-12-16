-- =====================================================
-- CREATORS-OS CANONICAL DATABASE SCHEMA
-- Version: 2.0 - Complete schema for all modules
-- This creates all tables from scratch with correct structure
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES
-- =====================================================
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

-- =====================================================
-- 2. COMPANIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Also support user_id for backwards compatibility in some API routes
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_type TEXT,
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

-- =====================================================
-- 3. CALENDAR EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Also allow "events" as alias (some API routes use this)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  start_time TEXT,
  end_time TEXT,
  is_all_day BOOLEAN DEFAULT FALSE,
  notes TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CALENDAR REMINDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calendar_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  minutes_before INTEGER NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. CALENDAR LINKED TASKS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.calendar_linked_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TASKS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- =====================================================
-- 7. GOALS (Daily Goals)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  reflection JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_uid, date)
);

-- Also allow daily_goals as alias (some API routes use this)
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  reflection JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- 8. MIGRATION STATUS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.migration_status (
  owner_uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  migrated_at TIMESTAMPTZ DEFAULT NOW(),
  migration_data JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 9. AI GENERATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. ACTIVITY EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. WEEKLY REVIEWS
-- =====================================================
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
-- 12. AGENCY MEMBERSHIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agency_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Also support agency_creators as alias
CREATE TABLE IF NOT EXISTS public.agency_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_user_id, creator_user_id)
);

-- Also support agency_creator_relationships as alias
CREATE TABLE IF NOT EXISTS public.agency_creator_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_user_id, creator_user_id)
);

-- =====================================================
-- 13. EARNINGS ENTRIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.earnings_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'ILS' CHECK (currency IN ('ILS', 'USD', 'EUR')),
  earned_on DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. CLIENT PORTALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.client_portals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT TRUE,
  brand_name TEXT,
  brand_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- =====================================================
-- 15. APPROVAL ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.approval_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  related_event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  related_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('post', 'story', 'reel', 'video', 'image', 'document', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'revision')),
  due_on DATE,
  asset_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. APPROVAL COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.approval_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_item_id UUID NOT NULL REFERENCES public.approval_items(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('creator', 'client', 'agency')),
  author_name TEXT,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. DELIVERABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- YYYY-MM format
  title TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  completed_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  linked_approval_item_id UUID REFERENCES public.approval_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, month, title)
);

-- =====================================================
-- 18. TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type TEXT DEFAULT 'creator' CHECK (owner_type IN ('creator', 'agency')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 19. TEMPLATE ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'task', 'goal')),
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
-- 20. TEMPLATE APPLICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.template_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  base_date DATE NOT NULL,
  items_created INTEGER DEFAULT 0
);

-- =====================================================
-- 21. COMPANY TIMELINE ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.company_timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  amount NUMERIC,
  occurred_on DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 22. NOTIFICATION SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_email_enabled BOOLEAN DEFAULT TRUE,
  daily_email_time TIME DEFAULT '08:30:00',
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  include_motivation BOOLEAN DEFAULT TRUE,
  weekly_summary_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 23. DAILY DIGEST LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_digest_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  digest_date DATE NOT NULL,
  status TEXT DEFAULT 'sent',
  error_message TEXT
);

-- =====================================================
-- 24. SHARED REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shared_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  report_type TEXT NOT NULL DEFAULT 'monthly',
  report_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 25. PROFILES (alias for some API routes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- END OF SCHEMA DEFINITION
-- =====================================================
