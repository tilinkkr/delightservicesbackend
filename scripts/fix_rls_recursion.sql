
-- Fix Infinite Recursion in Profiles RLS
-- Problem: The policy "Admins can see all profiles" queries the 'profiles' table to check the role.
--          This query triggers the policy again, causing an infinite loop.
-- Solution: Use a SECURITY DEFINER function to bypass RLS for the role check.

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This runs with the privileges of the function creator (postgres/admin), bypassing RLS
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;

-- 3. Re-create the policy using the secure function
CREATE POLICY "Admins can see all profiles"
ON public.profiles
FOR SELECT
USING (
  is_admin()
);

-- 4. Apply same fix to other Admin policies (just to be safe and consistent)

-- Products
DROP POLICY IF EXISTS "Admins full access products" ON public.products;
CREATE POLICY "Admins full access products" ON public.products FOR ALL USING ( is_admin() );

-- Orders
DROP POLICY IF EXISTS "Admins can see all orders" ON public.orders;
CREATE POLICY "Admins can see all orders" ON public.orders FOR SELECT USING ( is_admin() );

-- Order Items
DROP POLICY IF EXISTS "Admins can see all order items" ON public.order_items;
CREATE POLICY "Admins can see all order items" ON public.order_items FOR SELECT USING ( is_admin() );

-- Mutual Fund Leads (Ensure this exists too)
-- Note: Check if table exists first to avoid error if script ran out of order, 
-- but for now we assume mutual_fund_leads exists as per previous tasks.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mutual_fund_leads') THEN
        DROP POLICY IF EXISTS "Allow admin select mutual_fund_leads" ON public.mutual_fund_leads;
        CREATE POLICY "Allow admin select mutual_fund_leads" ON public.mutual_fund_leads FOR SELECT TO authenticated USING ( is_admin() );

        DROP POLICY IF EXISTS "Allow admin update mutual_fund_leads" ON public.mutual_fund_leads;
        CREATE POLICY "Allow admin update mutual_fund_leads" ON public.mutual_fund_leads FOR UPDATE TO authenticated USING ( is_admin() );
    END IF;
END $$;
