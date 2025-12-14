-- Agency Feature Migration
-- Adds account_type enum, agency_memberships, and earnings_entries tables

-- Create account_type enum type
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('creator', 'agency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update user_profiles with agency-related columns
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'creator' CHECK (account_type IN ('creator', 'agency')),
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- Create indexes for agency lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_agency_id ON public.user_profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);

-- Create agency_memberships table
CREATE TABLE IF NOT EXISTS public.agency_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    creator_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invite_email TEXT, -- For pending invites where user doesn't exist yet
    role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'manager', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_agency_creator UNIQUE (agency_id, creator_user_id),
    CONSTRAINT unique_agency_invite_email UNIQUE (agency_id, invite_email),
    CONSTRAINT require_creator_or_email CHECK (creator_user_id IS NOT NULL OR invite_email IS NOT NULL)
);

-- Create indexes for agency_memberships
CREATE INDEX IF NOT EXISTS idx_agency_memberships_agency_id ON public.agency_memberships(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_creator_id ON public.agency_memberships(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_status ON public.agency_memberships(status);
CREATE INDEX IF NOT EXISTS idx_agency_memberships_invite_email ON public.agency_memberships(invite_email);

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

-- Create indexes for earnings_entries
CREATE INDEX IF NOT EXISTS idx_earnings_creator_date ON public.earnings_entries(creator_user_id, earned_on);
CREATE INDEX IF NOT EXISTS idx_earnings_company_date ON public.earnings_entries(company_id, earned_on);
CREATE INDEX IF NOT EXISTS idx_earnings_earned_on ON public.earnings_entries(earned_on);

-- Enable RLS on new tables
ALTER TABLE public.agency_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_entries ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is a member of an agency
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

-- Helper function: Get the agency ID for the current user (if they're an agency)
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

-- Helper function: Check if current user is an agency that manages given creator
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

-- RLS Policies for agency_memberships

-- Agencies can view their own memberships
CREATE POLICY "Agencies can view own memberships"
    ON public.agency_memberships FOR SELECT
    USING (auth.uid() = agency_id);

-- Creators can view their own membership records
CREATE POLICY "Creators can view own membership"
    ON public.agency_memberships FOR SELECT
    USING (auth.uid() = creator_user_id);

-- Only agencies can insert memberships (invite creators)
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

-- Agencies can update their own memberships
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

-- Agencies can delete their own memberships
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

-- RLS Policies for earnings_entries

-- Creators can view their own earnings
CREATE POLICY "Creators can view own earnings"
    ON public.earnings_entries FOR SELECT
    USING (auth.uid() = creator_user_id);

-- Agencies can view earnings of their managed creators
CREATE POLICY "Agencies can view managed creator earnings"
    ON public.earnings_entries FOR SELECT
    USING (public.agency_manages_creator(creator_user_id));

-- Creators can insert their own earnings
CREATE POLICY "Creators can insert own earnings"
    ON public.earnings_entries FOR INSERT
    WITH CHECK (auth.uid() = creator_user_id);

-- Agencies can insert earnings for managed creators
CREATE POLICY "Agencies can insert managed creator earnings"
    ON public.earnings_entries FOR INSERT
    WITH CHECK (public.agency_manages_creator(creator_user_id));

-- Creators can update their own earnings
CREATE POLICY "Creators can update own earnings"
    ON public.earnings_entries FOR UPDATE
    USING (auth.uid() = creator_user_id);

-- Agencies can update earnings for managed creators
CREATE POLICY "Agencies can update managed creator earnings"
    ON public.earnings_entries FOR UPDATE
    USING (public.agency_manages_creator(creator_user_id));

-- Creators can delete their own earnings
CREATE POLICY "Creators can delete own earnings"
    ON public.earnings_entries FOR DELETE
    USING (auth.uid() = creator_user_id);

-- Agencies can delete earnings for managed creators
CREATE POLICY "Agencies can delete managed creator earnings"
    ON public.earnings_entries FOR DELETE
    USING (public.agency_manages_creator(creator_user_id));

-- Update existing RLS policies to allow agencies to read creator data

-- Drop and recreate companies SELECT policy to include agencies
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
CREATE POLICY "Users can view own companies or agency managed"
    ON public.companies FOR SELECT
    USING (
        auth.uid() = owner_uid
        OR public.agency_manages_creator(owner_uid)
    );

-- Drop and recreate calendar_events SELECT policy to include agencies
DROP POLICY IF EXISTS "Users can view own events" ON public.calendar_events;
CREATE POLICY "Users can view own events or agency managed"
    ON public.calendar_events FOR SELECT
    USING (
        auth.uid() = owner_uid
        OR public.agency_manages_creator(owner_uid)
    );

-- Drop and recreate tasks SELECT policy to include agencies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks or agency managed"
    ON public.tasks FOR SELECT
    USING (
        auth.uid() = owner_uid
        OR public.agency_manages_creator(owner_uid)
    );

-- Drop and recreate goals SELECT policy to include agencies
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
CREATE POLICY "Users can view own goals or agency managed"
    ON public.goals FOR SELECT
    USING (
        auth.uid() = owner_uid
        OR public.agency_manages_creator(owner_uid)
    );

-- Allow agencies to view user_profiles of their managed creators
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile or agency managed"
    ON public.user_profiles FOR SELECT
    USING (
        auth.uid() = id
        OR public.agency_manages_creator(id)
    );

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_agency_memberships_updated_at
    BEFORE UPDATE ON public.agency_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_earnings_entries_updated_at
    BEFORE UPDATE ON public.earnings_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for agency dashboard stats
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
JOIN public.user_profiles up ON up.id = am.creator_user_id
LEFT JOIN public.companies c ON c.owner_uid = am.creator_user_id
LEFT JOIN public.earnings_entries e ON e.creator_user_id = am.creator_user_id
WHERE am.status = 'active'
GROUP BY am.agency_id, am.creator_user_id, up.name, up.email;

-- Grant access to the view
GRANT SELECT ON public.agency_creator_stats TO authenticated;
