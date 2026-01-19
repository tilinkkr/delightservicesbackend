
-- 1. Drop existing constraint if it matches the default name or known name
-- We often don't know the exact name, so we might need to look it up or just try to drop strictly.
-- PostgreSQL auto-names constraints like 'orders_status_check'.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Add new constraint with expanded values
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
