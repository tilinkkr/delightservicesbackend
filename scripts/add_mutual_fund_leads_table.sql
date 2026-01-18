
-- Create mutual_fund_leads table
CREATE TABLE IF NOT EXISTS public.mutual_fund_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    sip_capacity TEXT,
    primary_goal TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mutual_fund_leads ENABLE ROW LEVEL SECURITY;

-- Policy for Public Insert (Submissions)
CREATE POLICY "Allow public insert to mutual_fund_leads"
ON public.mutual_fund_leads
FOR INSERT
TO public
WITH CHECK (true);

-- Policy for Admin Select
CREATE POLICY "Allow admin select mutual_fund_leads"
ON public.mutual_fund_leads
FOR SELECT
TO authenticated
USING (true);

-- Policy for Admin Update
CREATE POLICY "Allow admin update mutual_fund_leads"
ON public.mutual_fund_leads
FOR UPDATE
TO authenticated
USING (true);
