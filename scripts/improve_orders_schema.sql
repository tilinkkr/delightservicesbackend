-- 1. Add new columns for payment tracking
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- 2. Update the status check constraint to allow 'confirmed'
-- We first drop the old constraint (assuming default naming 'orders_status_check')
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 3. Add the improved constraint
ALTER TABLE orders
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('new', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'));

-- 4. Backfill existing data (optional but good for consistency)
UPDATE orders 
SET payment_status = 'paid' 
WHERE status = 'paid'; 
-- (Note: 'paid' was the invalid status we tried to insert earlier, if any somehow got in, this cleans them. 
-- Realistically, existing rows have 'pending' or 'delivered' etc.)
