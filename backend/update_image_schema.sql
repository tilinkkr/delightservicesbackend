-- Extend products table for AI/Google Images
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS primary_image_url text,      -- main image used in UI
ADD COLUMN IF NOT EXISTS ai_image_prompt text,        -- prompt for AI generator
ADD COLUMN IF NOT EXISTS ai_image_url text,           -- last generated AI image
ADD COLUMN IF NOT EXISTS external_image_source text;  -- e.g. 'google', 'manual'
