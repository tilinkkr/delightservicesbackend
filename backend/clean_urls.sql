
-- 1. Check for bad URLs first (Log output will show in Supabase dashboard)
SELECT id, name, image_url, primary_image_url 
FROM products 
WHERE image_url LIKE '"%' OR primary_image_url LIKE '"%';

-- 2. Fix Issue #2: Trim quotes from image URLs
UPDATE products 
SET 
  image_url = TRIM(BOTH '"' FROM image_url),
  primary_image_url = TRIM(BOTH '"' FROM primary_image_url)
WHERE 
  image_url LIKE '"%' OR primary_image_url LIKE '"%';

-- 3. Verify fix
SELECT id, name, image_url, primary_image_url 
FROM products 
LIMIT 5;
