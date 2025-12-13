-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
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

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_linked_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "Users can view own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can insert own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

CREATE POLICY "Users can update own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can delete own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_uid);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view own events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can insert own events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

CREATE POLICY "Users can update own events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can delete own events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid() = owner_uid);

-- RLS Policies for calendar_reminders
CREATE POLICY "Users can view reminders of own events"
  ON public.calendar_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_reminders.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Users can insert reminders for own events"
  ON public.calendar_reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_reminders.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders of own events"
  ON public.calendar_reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_reminders.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Users can delete reminders of own events"
  ON public.calendar_reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_reminders.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

-- RLS Policies for calendar_linked_tasks
CREATE POLICY "Users can view linked tasks of own events"
  ON public.calendar_linked_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_linked_tasks.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Users can insert linked tasks for own events"
  ON public.calendar_linked_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_linked_tasks.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Users can update linked tasks of own events"
  ON public.calendar_linked_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_linked_tasks.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

CREATE POLICY "Users can delete linked tasks of own events"
  ON public.calendar_linked_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events
      WHERE calendar_events.id = calendar_linked_tasks.event_id
      AND calendar_events.owner_uid = auth.uid()
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = owner_uid);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = owner_uid);

-- RLS Policies for migration_status
CREATE POLICY "Users can view own migration status"
  ON public.migration_status FOR SELECT
  USING (auth.uid() = owner_uid);

CREATE POLICY "Users can insert own migration status"
  ON public.migration_status FOR INSERT
  WITH CHECK (auth.uid() = owner_uid);

CREATE POLICY "Users can update own migration status"
  ON public.migration_status FOR UPDATE
  USING (auth.uid() = owner_uid);

-- Create indexes for better performance
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

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
