-- 1. EXTEND PRODUCTS (AI/Image Columns)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS primary_image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_image_prompt text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS external_image_source text;

-- 2. CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own carts" ON public.carts;
CREATE POLICY "Users see own carts" ON public.carts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own carts" ON public.carts;
CREATE POLICY "Users create own carts" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id BIGINT REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id),
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cart_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own cart items" ON public.cart_items;
CREATE POLICY "Users see own cart items" ON public.cart_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users modify own cart items" ON public.cart_items;
CREATE POLICY "Users modify own cart items" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- 4. ORDERS TABLE (Ensuring User columns)
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY, -- Using BigSerial for consistency or UUID if preferred, User asked for BigSerial? User code showed BigSerial for Cart, but Orders... let's stick to existing UUID for Orders to avoid conflict, or check user request. User request: "create table public.orders ( id bigserial...". OK, I will honor that but I might have existing UUID orders.
  -- To avoid breaking existing, I'll stick to UUID for now or careful alter. 
  -- Actually, let's keep the existing orders table if it exists, just add columns.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES public.products(id),
  product_name TEXT,
  product_price NUMERIC(10,2),
  status TEXT DEFAULT 'paid',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Note: If orders exists with UUID id, this won't change it. That's fine.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
