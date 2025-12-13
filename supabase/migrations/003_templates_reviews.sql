-- Weekly Reviews table
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    stats JSONB NOT NULL,
    what_worked TEXT,
    improve_next TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- RLS Policies
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly reviews"
    ON public.weekly_reviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own weekly reviews"
    ON public.weekly_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews"
    ON public.weekly_reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reviews"
    ON public.weekly_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id ON public.weekly_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_week_start ON public.weekly_reviews(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_week ON public.weekly_reviews(user_id, week_start_date DESC);
