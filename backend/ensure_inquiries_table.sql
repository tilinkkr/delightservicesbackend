-- Create 'inquiries' table if not exists
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow inserts (public or anon, depending on if you want unauth users to contact)
-- For public contact form, allow anon INSERT
CREATE POLICY "Allow public insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

-- Allow admins (service_role or specific users) to select
-- For now, just basic insert.
-- Note: 'service_role' key always bypasses RLS, so admin panel can read.

-- Force Schema Refresh
NOTIFY pgrst, 'reload config';
