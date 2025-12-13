-- AI Generations table
CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    input_data JSONB NOT NULL,
    output TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI generations"
    ON public.ai_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI generations"
    ON public.ai_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI generations"
    ON public.ai_generations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI generations"
    ON public.ai_generations FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_template_id ON public.ai_generations(template_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON public.ai_generations(created_at DESC);
