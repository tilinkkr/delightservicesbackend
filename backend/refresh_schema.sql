-- 1. Ensure columns exist (Idempotent)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Credit Card';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_price NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- 2. Force PostgREST Schema Cache Reload
-- This is critical for the API to "see" the new columns immediately
NOTIFY pgrst, 'reload config';

-- 3. Verify (Optional Select, will show in output)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'orders';
