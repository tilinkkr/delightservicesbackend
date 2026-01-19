-- =============================================
-- UPDATE PRODUCT IMAGES TO REAL LUXURY PHOTOS
-- =============================================

-- 1. LUXURY OUD & PERFUME IMAGES (Dark, Gold, Premium)
-- We will update products with 'Attar', 'Perfume', 'Oud', 'Scent' in name/category
-- Using CASE/RANDOM to distribute different images

UPDATE products
SET image_url = CASE floor(random() * 5)
    WHEN 0 THEN 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop' -- Classic Bottle
    WHEN 1 THEN 'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop' -- Dark Oud
    WHEN 2 THEN 'https://images.unsplash.com/photo-1523293188086-b431e93f9afb?q=80&w=800&auto=format&fit=crop' -- Minimal Bottle
    WHEN 3 THEN 'https://images.unsplash.com/photo-1616999697523-28f000302b52?q=80&w=800&auto=format&fit=crop' -- Luxury Box
    ELSE 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop' -- Amber Bottle
END,
primary_image_url = CASE floor(random() * 5)
    WHEN 0 THEN 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop'
    WHEN 1 THEN 'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=800&auto=format&fit=crop'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1523293188086-b431e93f9afb?q=80&w=800&auto=format&fit=crop'
    WHEN 3 THEN 'https://images.unsplash.com/photo-1616999697523-28f000302b52?q=80&w=800&auto=format&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'
END
WHERE category ILIKE '%Perfume%' 
   OR category ILIKE '%Attar%' 
   OR category ILIKE '%Oud%'
   OR name ILIKE '%Oud%' 
   OR name ILIKE '%Musk%' 
   OR name ILIKE '%Perfume%';


-- 2. INCENSE & AGARBATTI IMAGES (Smoke, Zen, Sticks)
UPDATE products
SET image_url = CASE floor(random() * 4)
    WHEN 0 THEN 'https://images.unsplash.com/photo-1602166946638-c8c775a25e62?q=80&w=800&auto=format&fit=crop' -- Smoke Upwards
    WHEN 1 THEN 'https://images.unsplash.com/photo-1615525540307-e83617192928?q=80&w=800&auto=format&fit=crop' -- Sticks on Holder
    WHEN 2 THEN 'https://images.unsplash.com/photo-1507646227500-4d389b001c22?q=80&w=800&auto=format&fit=crop' -- Oriental Zen
    ELSE 'https://images.unsplash.com/photo-1564594326505-592b23dd132f?q=80&w=800&auto=format&fit=crop' -- Burning Coal/Smoke
END,
primary_image_url = CASE floor(random() * 4)
    WHEN 0 THEN 'https://images.unsplash.com/photo-1602166946638-c8c775a25e62?q=80&w=800&auto=format&fit=crop'
    WHEN 1 THEN 'https://images.unsplash.com/photo-1615525540307-e83617192928?q=80&w=800&auto=format&fit=crop'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1507646227500-4d389b001c22?q=80&w=800&auto=format&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1564594326505-592b23dd132f?q=80&w=800&auto=format&fit=crop'
END
WHERE category ILIKE '%Incense%' 
   OR category ILIKE '%Agarbatti%'
   OR name ILIKE '%Incense%'
   OR name ILIKE '%Loban%';

-- 3. SERVICES (Abstract, Financial, Planning)
-- Usually in 'services' table, but checking 'products' table just in case any were mixed or for 'Wealth' category
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop'
WHERE category ILIKE '%Finance%' OR category ILIKE '%Service%';
