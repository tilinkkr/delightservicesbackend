-- RUN THIS IN SUPABASE SQL EDITOR TO FIX EVERYTHING

-- 1. FIX PRODUCTS (Missing Columns for AI)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS primary_image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_image_prompt text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ai_image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS external_image_source text;

-- 2. FIX CARTS (Relational Table)
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

-- 3. FIX CART ITEMS (Relational Table)
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
