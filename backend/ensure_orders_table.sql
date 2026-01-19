-- Create ORDERS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id),
    product_name TEXT,
    product_price NUMERIC,
    status TEXT DEFAULT 'paid',
    payment_method TEXT DEFAULT 'Credit Card'
);

-- Ensure column exists if table was already created
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Credit Card';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own orders (for checkout)
CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
