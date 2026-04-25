-- =============================================
--         SHOP SYSTEM - DEMO DATA
-- =============================================
-- Run this after: npx prisma migrate dev
-- =============================================


-- =============================================
--              1. PRODUCTS
-- =============================================

INSERT INTO products (model_number, name, category, description, created_at, updated_at) VALUES
('SH-001', 'قميص بولو',          'قمصان',     'قميص بولو كلاسيك',          NOW(), NOW()),
('SH-002', 'قميص كاجوال',        'قمصان',     'قميص كاجوال يومي',           NOW(), NOW()),
('SH-003', 'قميص فورمال',        'قمصان',     'قميص فورمال للمناسبات',       NOW(), NOW()),
('SH-004', 'قميص فلانيل',        'قمصان',     'قميص فلانيل شتوي',           NOW(), NOW()),
('TS-001', 'تيشرت بيسيك',        'تيشرتات',   'تيشرت قطن بيسيك',            NOW(), NOW()),
('TS-002', 'تيشرت هينلي',        'تيشرتات',   'تيشرت هينلي بأزرار',         NOW(), NOW()),
('TS-003', 'تيشرت بولو',         'تيشرتات',   'تيشرت بولو رياضي',           NOW(), NOW()),
('TS-004', 'تيشرت أوفر سايز',    'تيشرتات',   'تيشرت أوفر سايز ترندي',      NOW(), NOW()),
('PT-001', 'بنطلون جينز كلاسيك', 'بناطيل',    'جينز كلاسيك يومي',           NOW(), NOW()),
('PT-002', 'بنطلون جينز ممزق',   'بناطيل',    'جينز ممزق ترندي',            NOW(), NOW()),
('PT-003', 'بنطلون تشينو',       'بناطيل',    'تشينو كاجوال',               NOW(), NOW()),
('PT-004', 'بنطلون جوجر',        'بناطيل',    'جوجر مريح',                  NOW(), NOW()),
('PT-005', 'بنطلون كارجو',       'بناطيل',    'كارجو بجيوب جانبية',          NOW(), NOW()),
('JK-001', 'جاكيت بامب',         'جاكيتات',   'جاكيت بامب شتوي',            NOW(), NOW()),
('JK-002', 'جاكيت جينز',         'جاكيتات',   'جاكيت جينز كلاسيك',          NOW(), NOW()),
('JK-003', 'جاكيت جلد',          'جاكيتات',   'جاكيت جلد طبيعي',            NOW(), NOW()),
('JK-004', 'جاكيت ونيد',         'جاكيتات',   'جاكيت ونيد خفيف',            NOW(), NOW()),
('HO-001', 'هودي بيسيك',         'هوديز',     'هودي قطن بيسيك',             NOW(), NOW()),
('HO-002', 'هودي زيبر',          'هوديز',     'هودي بزيبر كامل',            NOW(), NOW()),
('HO-003', 'سويت شيرت',          'هوديز',     'سويت شيرت كرو نيك',          NOW(), NOW()),
('SU-001', 'بدلة كاملة',         'بدل',       'بدلة رجالي كاملة',           NOW(), NOW()),
('SU-002', 'جاكيت بليزر',        'بدل',       'بليزر فورمال',               NOW(), NOW()),
('SP-001', 'طقم رياضي',          'رياضي',     'طقم رياضي كامل',             NOW(), NOW()),
('SP-002', 'شورت رياضي',         'رياضي',     'شورت رياضي خفيف',            NOW(), NOW());


-- =============================================
--           2. PRODUCT VARIANTS
-- =============================================

-- ─── قميص بولو (SH-001) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أبيض',  150, 320,  20),
  ('L',  'أبيض',  150, 320,  18),
  ('XL', 'أبيض',  150, 320,  12),
  ('M',  'أسود',  150, 320,  20),
  ('L',  'أسود',  150, 320,  15),
  ('XL', 'أسود',  150, 320,  10),
  ('M',  'نيلي',  150, 320,  15),
  ('L',  'نيلي',  150, 320,  12),
  ('M',  'رمادي', 150, 320,  10),
  ('L',  'رمادي', 150, 320,   8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SH-001';

-- ─── قميص كاجوال (SH-002) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أبيض',  180, 380,  15),
  ('L',  'أبيض',  180, 380,  12),
  ('XL', 'أبيض',  180, 380,   8),
  ('M',  'بيج',   180, 380,  15),
  ('L',  'بيج',   180, 380,  12),
  ('M',  'زيتي',  180, 380,  10),
  ('L',  'زيتي',  180, 380,   8),
  ('M',  'بوردو', 180, 380,  10),
  ('L',  'بوردو', 180, 380,   8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SH-002';

-- ─── قميص فورمال (SH-003) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أبيض',        200, 420,  12),
  ('L',  'أبيض',        200, 420,  10),
  ('XL', 'أبيض',        200, 420,   8),
  ('M',  'سماوي',       200, 420,  10),
  ('L',  'سماوي',       200, 420,   8),
  ('M',  'رمادي فاتح',  200, 420,   8),
  ('L',  'رمادي فاتح',  200, 420,   6)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SH-003';

-- ─── قميص فلانيل (SH-004) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'كاروهات أحمر', 220, 460,  10),
  ('L',  'كاروهات أحمر', 220, 460,   8),
  ('XL', 'كاروهات أحمر', 220, 460,   5),
  ('M',  'كاروهات أزرق', 220, 460,  10),
  ('L',  'كاروهات أزرق', 220, 460,   8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SH-004';

-- ─── تيشرت بيسيك (TS-001) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 10, NOW(), NOW()
FROM products p, (VALUES
  ('S',   'أبيض',  80, 180, 25),
  ('M',   'أبيض',  80, 180, 30),
  ('L',   'أبيض',  80, 180, 28),
  ('XL',  'أبيض',  80, 180, 20),
  ('XXL', 'أبيض',  80, 180, 10),
  ('S',   'أسود',  80, 180, 25),
  ('M',   'أسود',  80, 180, 30),
  ('L',   'أسود',  80, 180, 28),
  ('XL',  'أسود',  80, 180, 20),
  ('M',   'رمادي', 80, 180, 25),
  ('L',   'رمادي', 80, 180, 22),
  ('M',   'نيلي',  80, 180, 20),
  ('L',   'نيلي',  80, 180, 18),
  ('M',   'بيج',   80, 180, 15),
  ('L',   'بيج',   80, 180, 12)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'TS-001';

-- ─── تيشرت هينلي (TS-002) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أبيض',  100, 220, 15),
  ('L',  'أبيض',  100, 220, 12),
  ('XL', 'أبيض',  100, 220,  8),
  ('M',  'أسود',  100, 220, 15),
  ('L',  'أسود',  100, 220, 12),
  ('M',  'رمادي', 100, 220, 12),
  ('L',  'رمادي', 100, 220, 10)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'TS-002';

-- ─── تيشرت أوفر سايز (TS-004) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',   'أسود',  120, 260, 20),
  ('L',   'أسود',  120, 260, 18),
  ('XL',  'أسود',  120, 260, 15),
  ('M',   'أبيض',  120, 260, 18),
  ('L',   'أبيض',  120, 260, 15),
  ('M',   'رمادي', 120, 260, 15),
  ('L',   'رمادي', 120, 260, 12)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'TS-004';

-- ─── بنطلون جينز كلاسيك (PT-001) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('30', 'أزرق غامق', 250, 550, 15),
  ('32', 'أزرق غامق', 250, 550, 20),
  ('34', 'أزرق غامق', 250, 550, 18),
  ('36', 'أزرق غامق', 250, 550, 12),
  ('38', 'أزرق غامق', 250, 550,  8),
  ('30', 'أسود',      250, 550, 15),
  ('32', 'أسود',      250, 550, 18),
  ('34', 'أسود',      250, 550, 15),
  ('36', 'أسود',      250, 550, 10),
  ('32', 'رمادي',     250, 550, 12),
  ('34', 'رمادي',     250, 550, 10)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'PT-001';

-- ─── بنطلون جينز ممزق (PT-002) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('30', 'أزرق فاتح', 270, 580, 12),
  ('32', 'أزرق فاتح', 270, 580, 15),
  ('34', 'أزرق فاتح', 270, 580, 12),
  ('36', 'أزرق فاتح', 270, 580,  8),
  ('32', 'أزرق غامق', 270, 580, 12),
  ('34', 'أزرق غامق', 270, 580, 10)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'PT-002';

-- ─── بنطلون تشينو (PT-003) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('30', 'بيج',  200, 440, 12),
  ('32', 'بيج',  200, 440, 15),
  ('34', 'بيج',  200, 440, 12),
  ('32', 'زيتي', 200, 440, 12),
  ('34', 'زيتي', 200, 440, 10),
  ('32', 'نيفي', 200, 440, 10),
  ('34', 'نيفي', 200, 440,  8),
  ('32', 'بني',  200, 440, 10),
  ('34', 'بني',  200, 440,  8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'PT-003';

-- ─── بنطلون جوجر (PT-004) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  150, 320, 20),
  ('L',  'أسود',  150, 320, 18),
  ('XL', 'أسود',  150, 320, 12),
  ('M',  'رمادي', 150, 320, 18),
  ('L',  'رمادي', 150, 320, 15),
  ('M',  'نيفي',  150, 320, 15),
  ('L',  'نيفي',  150, 320, 12)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'PT-004';

-- ─── بنطلون كارجو (PT-005) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('30', 'أسود', 220, 480, 12),
  ('32', 'أسود', 220, 480, 15),
  ('34', 'أسود', 220, 480, 12),
  ('32', 'زيتي', 220, 480, 10),
  ('34', 'زيتي', 220, 480,  8),
  ('32', 'بيج',  220, 480, 10),
  ('34', 'بيج',  220, 480,  8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'PT-005';

-- ─── جاكيت بامب (JK-001) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 3, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  400, 880,  10),
  ('L',  'أسود',  400, 880,   8),
  ('XL', 'أسود',  400, 880,   5),
  ('M',  'نيفي',  400, 880,   8),
  ('L',  'نيفي',  400, 880,   6),
  ('M',  'رمادي', 400, 880,   6),
  ('L',  'رمادي', 400, 880,   5),
  ('M',  'خاكي',  400, 880,   5),
  ('L',  'خاكي',  400, 880,   4)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'JK-001';

-- ─── جاكيت جينز (JK-002) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 3, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أزرق فاتح',  320, 700,  8),
  ('L',  'أزرق فاتح',  320, 700,  6),
  ('XL', 'أزرق فاتح',  320, 700,  4),
  ('M',  'أزرق غامق',  320, 700,  8),
  ('L',  'أزرق غامق',  320, 700,  6),
  ('M',  'أسود',        320, 700,  8),
  ('L',  'أسود',        320, 700,  6)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'JK-002';

-- ─── جاكيت جلد (JK-003) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 2, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  800, 1800,  5),
  ('L',  'أسود',  800, 1800,  4),
  ('XL', 'أسود',  800, 1800,  3),
  ('M',  'بني',   800, 1800,  4),
  ('L',  'بني',   800, 1800,  3),
  ('M',  'كاميل', 800, 1800,  3),
  ('L',  'كاميل', 800, 1800,  2)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'JK-003';

-- ─── جاكيت ونيد (JK-004) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 3, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  280, 600,  8),
  ('L',  'أسود',  280, 600,  6),
  ('XL', 'أسود',  280, 600,  4),
  ('M',  'نيفي',  280, 600,  8),
  ('L',  'نيفي',  280, 600,  6),
  ('M',  'خاكي',  280, 600,  6),
  ('L',  'خاكي',  280, 600,  4)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'JK-004';

-- ─── هودي بيسيك (HO-001) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('S',   'أسود',  220, 480, 15),
  ('M',   'أسود',  220, 480, 20),
  ('L',   'أسود',  220, 480, 18),
  ('XL',  'أسود',  220, 480, 12),
  ('XXL', 'أسود',  220, 480,  6),
  ('M',   'رمادي', 220, 480, 18),
  ('L',   'رمادي', 220, 480, 15),
  ('XL',  'رمادي', 220, 480, 10),
  ('M',   'نيفي',  220, 480, 15),
  ('L',   'نيفي',  220, 480, 12),
  ('M',   'بيج',   220, 480, 12),
  ('L',   'بيج',   220, 480, 10)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'HO-001';

-- ─── هودي زيبر (HO-002) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  250, 550, 12),
  ('L',  'أسود',  250, 550, 10),
  ('XL', 'أسود',  250, 550,  8),
  ('M',  'رمادي', 250, 550, 12),
  ('L',  'رمادي', 250, 550, 10),
  ('M',  'نيفي',  250, 550, 10),
  ('L',  'نيفي',  250, 550,  8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'HO-002';

-- ─── سويت شيرت (HO-003) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  200, 440, 15),
  ('L',  'أسود',  200, 440, 12),
  ('XL', 'أسود',  200, 440,  8),
  ('M',  'رمادي', 200, 440, 15),
  ('L',  'رمادي', 200, 440, 12),
  ('M',  'أبيض',  200, 440, 12),
  ('L',  'أبيض',  200, 440, 10),
  ('M',  'بيج',   200, 440, 10),
  ('L',  'بيج',   200, 440,  8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'HO-003';

-- ─── بدلة كاملة (SU-001) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 2, NOW(), NOW()
FROM products p, (VALUES
  ('48', 'أسود',       1200, 2800, 4),
  ('50', 'أسود',       1200, 2800, 5),
  ('52', 'أسود',       1200, 2800, 4),
  ('54', 'أسود',       1200, 2800, 3),
  ('48', 'نيفي',       1200, 2800, 4),
  ('50', 'نيفي',       1200, 2800, 4),
  ('52', 'نيفي',       1200, 2800, 3),
  ('50', 'رمادي غامق', 1200, 2800, 4),
  ('52', 'رمادي غامق', 1200, 2800, 3)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SU-001';

-- ─── جاكيت بليزر (SU-002) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 2, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  600, 1400, 5),
  ('L',  'أسود',  600, 1400, 4),
  ('XL', 'أسود',  600, 1400, 3),
  ('M',  'نيفي',  600, 1400, 5),
  ('L',  'نيفي',  600, 1400, 4),
  ('M',  'رمادي', 600, 1400, 4),
  ('L',  'رمادي', 600, 1400, 3),
  ('M',  'بيج',   600, 1400, 4),
  ('L',  'بيج',   600, 1400, 3)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SU-002';

-- ─── طقم رياضي (SP-001) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  280, 600, 12),
  ('L',  'أسود',  280, 600, 10),
  ('XL', 'أسود',  280, 600,  8),
  ('M',  'رمادي', 280, 600, 10),
  ('L',  'رمادي', 280, 600,  8),
  ('M',  'نيفي',  280, 600, 10),
  ('L',  'نيفي',  280, 600,  8)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SP-001';

-- ─── شورت رياضي (SP-002) ───
INSERT INTO product_variants (product_id, size, color, type, purchase_price, selling_price, stock_quantity, min_stock_alert, created_at, updated_at)
SELECT p.id, v.size, v.color, U&'\0639\0627\062F\064A', v.pp, v.sp, v.qty, 5, NOW(), NOW()
FROM products p, (VALUES
  ('M',  'أسود',  100, 220, 20),
  ('L',  'أسود',  100, 220, 18),
  ('XL', 'أسود',  100, 220, 12),
  ('M',  'نيفي',  100, 220, 15),
  ('L',  'نيفي',  100, 220, 12),
  ('M',  'رمادي', 100, 220, 12),
  ('L',  'رمادي', 100, 220, 10)
) AS v(size, color, pp, sp, qty)
WHERE p.model_number = 'SP-002';


-- =============================================
--              3. SUPPLIERS
-- =============================================

INSERT INTO suppliers (name, phone, address, total_debt, created_at, updated_at) VALUES
('شركة النيل للملابس',       '01001234567', 'القاهرة - المرج',          0,    NOW(), NOW()),
('مصنع الدلتا',              '01112345678', 'المنصورة - المنطقة الصناعية', 0, NOW(), NOW()),
('مورد الإسكندرية',          '01223456789', 'الإسكندرية - العامرية',     0,    NOW(), NOW()),
('شركة ستايل مصر',           '01334567890', 'القاهرة - شبرا',            0,    NOW(), NOW()),
('مورد الجملة الأول',        '01445678901', 'القاهرة - الموسكي',         0,    NOW(), NOW());


-- =============================================
--              4. CUSTOMERS
-- =============================================

INSERT INTO customers (name, phone, address, total_debt, created_at, updated_at) VALUES
('أحمد محمد علي',     '01001111111', 'القاهرة - مدينة نصر',    0, NOW(), NOW()),
('محمود حسن',         '01002222222', 'الجيزة - الهرم',          0, NOW(), NOW()),
('عمر عبدالله',       '01003333333', 'القاهرة - المعادي',       0, NOW(), NOW()),
('خالد إبراهيم',      '01004444444', 'الإسكندرية - سيدي بشر',  0, NOW(), NOW()),
('يوسف سامي',         '01005555555', 'القاهرة - التجمع الخامس', 0, NOW(), NOW()),
('كريم أحمد',         '01006666666', 'الجيزة - الدقي',          0, NOW(), NOW()),
('مصطفى عمر',         '01007777777', 'القاهرة - شبرا',          0, NOW(), NOW()),
('علي حسن',           '01008888888', 'الإسكندرية - المنتزه',    0, NOW(), NOW()),
('تامر محمود',        '01009999999', 'القاهرة - عين شمس',       0, NOW(), NOW()),
('سامي عبدالرحمن',    '01010101010', 'الجيزة - فيصل',           0, NOW(), NOW());


-- =============================================
--         5. PURCHASE INVOICES
-- =============================================

-- ─── فاتورة شراء 1 - نقدي ───
INSERT INTO purchase_invoices
  (invoice_no, supplier_id, invoice_date, total_amount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'PUR-00001',
  (SELECT id FROM suppliers WHERE name = 'شركة النيل للملابس'),
  NOW() - INTERVAL '30 days',
  18500, 18500, 0, 'CASH',
  'مشتريات أول الموسم',
  NOW(), NOW()
);

INSERT INTO purchase_invoice_items
  (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM purchase_invoices WHERE invoice_no = 'PUR-00001'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('SH-001', 'M',  'أبيض',  150, 10),
  ('SH-001', 'L',  'أبيض',  150, 8),
  ('SH-001', 'M',  'أسود',  150, 10),
  ('TS-001', 'M',  'أبيض',  80,  15),
  ('TS-001', 'L',  'أسود',  80,  12),
  ('PT-001', '32', 'أزرق غامق', 250, 10)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة شراء 2 - آجل ───
INSERT INTO purchase_invoices
  (invoice_no, supplier_id, invoice_date, total_amount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'PUR-00002',
  (SELECT id FROM suppliers WHERE name = 'مصنع الدلتا'),
  NOW() - INTERVAL '20 days',
  24000, 10000, 14000, 'CREDIT',
  'جاكيتات وهوديز شتوية',
  NOW(), NOW()
);

UPDATE suppliers
SET total_debt = total_debt + 14000
WHERE name = 'مصنع الدلتا';

INSERT INTO purchase_invoice_items
  (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM purchase_invoices WHERE invoice_no = 'PUR-00002'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('JK-001', 'M',  'أسود',  400, 5),
  ('JK-001', 'L',  'أسود',  400, 4),
  ('JK-001', 'M',  'نيفي',  400, 4),
  ('HO-001', 'M',  'أسود',  220, 8),
  ('HO-001', 'L',  'رمادي', 220, 6),
  ('HO-002', 'M',  'أسود',  250, 5),
  ('HO-002', 'L',  'نيفي',  250, 4)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- الدفعة الأولى عند إنشاء الفاتورة
INSERT INTO supplier_payments
  (supplier_id, invoice_id, amount, payment_date, notes)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'مصنع الدلتا'),
  (SELECT id FROM purchase_invoices WHERE invoice_no = 'PUR-00002'),
  10000,
  NOW() - INTERVAL '20 days',
  'دفعة مقدمة'
);

-- ─── فاتورة شراء 3 - نقدي ───
INSERT INTO purchase_invoices
  (invoice_no, supplier_id, invoice_date, total_amount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'PUR-00003',
  (SELECT id FROM suppliers WHERE name = 'شركة ستايل مصر'),
  NOW() - INTERVAL '15 days',
  32000, 32000, 0, 'CASH',
  'بدل وبليزرات',
  NOW(), NOW()
);

INSERT INTO purchase_invoice_items
  (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM purchase_invoices WHERE invoice_no = 'PUR-00003'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('SU-001', '50', 'أسود',  1200, 3),
  ('SU-001', '52', 'نيفي',  1200, 3),
  ('SU-002', 'M',  'أسود',  600,  4),
  ('SU-002', 'L',  'نيفي',  600,  4),
  ('SU-002', 'M',  'بيج',   600,  3),
  ('JK-003', 'M',  'أسود',  800,  3),
  ('JK-003', 'L',  'بني',   800,  2)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة شراء 4 - آجل ───
INSERT INTO purchase_invoices
  (invoice_no, supplier_id, invoice_date, total_amount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'PUR-00004',
  (SELECT id FROM suppliers WHERE name = 'مورد الجملة الأول'),
  NOW() - INTERVAL '7 days',
  15600, 5000, 10600, 'CREDIT',
  'تيشرتات وبناطيل',
  NOW(), NOW()
);

UPDATE suppliers
SET total_debt = total_debt + 10600
WHERE name = 'مورد الجملة الأول';

INSERT INTO purchase_invoice_items
  (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM purchase_invoices WHERE invoice_no = 'PUR-00004'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('TS-001', 'M',  'أبيض',  80,  20),
  ('TS-001', 'L',  'أسود',  80,  20),
  ('TS-004', 'M',  'أسود',  120, 15),
  ('PT-003', '32', 'بيج',   200, 10),
  ('PT-003', '34', 'زيتي',  200,  8),
  ('PT-004', 'M',  'أسود',  150, 12),
  ('PT-004', 'L',  'رمادي', 150, 10)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

INSERT INTO supplier_payments
  (supplier_id, invoice_id, amount, payment_date, notes)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'مورد الجملة الأول'),
  (SELECT id FROM purchase_invoices WHERE invoice_no = 'PUR-00004'),
  5000,
  NOW() - INTERVAL '7 days',
  'دفعة مقدمة'
);


-- =============================================
--          6. SALES INVOICES
-- =============================================

-- ─── فاتورة بيع 1 - نقدي ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00001',
  (SELECT id FROM customers WHERE name = 'أحمد محمد علي'),
  NOW() - INTERVAL '25 days',
  1660, 0, 1660, 0, 'CASH', NULL,
  NOW(), NOW()
);

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00001'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('SH-001', 'L',  'أبيض',  320, 2),
  ('PT-001', '32', 'أسود',   550, 1),
  ('TS-001', 'M',  'أسود',   180, 2)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة بيع 2 - آجل ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00002',
  (SELECT id FROM customers WHERE name = 'محمود حسن'),
  NOW() - INTERVAL '22 days',
  3980, 200, 2000, 1780, 'CREDIT', 'عميل منتظم',
  NOW(), NOW()
);

UPDATE customers
SET total_debt = total_debt + 1780
WHERE name = 'محمود حسن';

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00002'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('JK-001', 'L',  'أسود',  880, 2),
  ('PT-001', '34', 'أزرق غامق', 550, 2),
  ('HO-001', 'M',  'رمادي', 480, 2)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

INSERT INTO customer_payments
  (customer_id, invoice_id, amount, payment_date, notes)
VALUES (
  (SELECT id FROM customers WHERE name = 'محمود حسن'),
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00002'),
  2000,
  NOW() - INTERVAL '22 days',
  'دفعة عند الاستلام'
);

-- ─── فاتورة بيع 3 - نقدي بدون عميل ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00003',
  NULL,
  NOW() - INTERVAL '18 days',
  1260, 0, 1260, 0, 'CASH', 'بيع نقدي',
  NOW(), NOW()
);

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00003'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('TS-001', 'XL', 'أبيض',  180, 3),
  ('PT-004', 'L',  'أسود',  320, 2),
  ('SH-002', 'M',  'بيج',   380, 1)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة بيع 4 - آجل ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00004',
  (SELECT id FROM customers WHERE name = 'خالد إبراهيم'),
  NOW() - INTERVAL '15 days',
  5600, 0, 0, 5600, 'CREDIT', NULL,
  NOW(), NOW()
);

UPDATE customers
SET total_debt = total_debt + 5600
WHERE name = 'خالد إبراهيم';

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00004'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('SU-001', '50', 'أسود',  2800, 1),
  ('SU-002', 'L',  'نيفي',  1400, 1),
  ('SH-003', 'M',  'أبيض',   420, 2),
  ('PT-001', '32', 'أسود',   550, 1)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة بيع 5 - نقدي مع خصم ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00005',
  (SELECT id FROM customers WHERE name = 'يوسف سامي'),
  NOW() - INTERVAL '10 days',
  2440, 240, 2440, 0, 'CASH', 'خصم 10%',
  NOW(), NOW()
);

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00005'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('JK-002', 'M',  'أزرق غامق', 700, 1),
  ('PT-001', '32', 'أزرق غامق', 550, 2),
  ('TS-004', 'L',  'أسود',      260, 2)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة بيع 6 - آجل دفعة جزئية ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00006',
  (SELECT id FROM customers WHERE name = 'كريم أحمد'),
  NOW() - INTERVAL '8 days',
  3840, 0, 1000, 2840, 'CREDIT', NULL,
  NOW(), NOW()
);

UPDATE customers
SET total_debt = total_debt + 2840
WHERE name = 'كريم أحمد';

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00006'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('JK-001', 'XL', 'رمادي', 880, 2),
  ('HO-001', 'XL', 'أسود',  480, 2),
  ('PT-002', '34', 'أزرق فاتح', 580, 2)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

INSERT INTO customer_payments
  (customer_id, invoice_id, amount, payment_date, notes)
VALUES (
  (SELECT id FROM customers WHERE name = 'كريم أحمد'),
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00006'),
  1000,
  NOW() - INTERVAL '8 days',
  'دفعة جزئية'
);

-- ─── فاتورة بيع 7 - نقدي ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00007',
  (SELECT id FROM customers WHERE name = 'مصطفى عمر'),
  NOW() - INTERVAL '5 days',
  2060, 0, 2060, 0, 'CASH', NULL,
  NOW(), NOW()
);

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00007'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('SP-001', 'L',  'أسود',  600, 2),
  ('TS-001', 'L',  'أبيض',  180, 3),
  ('HO-003', 'M',  'رمادي', 440, 1)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة بيع 8 - آجل ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00008',
  (SELECT id FROM customers WHERE name = 'تامر محمود'),
  NOW() - INTERVAL '3 days',
  4200, 200, 2000, 2000, 'CREDIT', NULL,
  NOW(), NOW()
);

UPDATE customers
SET total_debt = total_debt + 2000
WHERE name = 'تامر محمود';

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00008'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('SU-002', 'M',  'أسود',  1400, 1),
  ('SH-003', 'L',  'سماوي', 420,  2),
  ('PT-001', '34', 'أسود',  550,  2),
  ('TS-001', 'M',  'أبيض',  180,  2)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

INSERT INTO customer_payments
  (customer_id, invoice_id, amount, payment_date, notes)
VALUES (
  (SELECT id FROM customers WHERE name = 'تامر محمود'),
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00008'),
  2000,
  NOW() - INTERVAL '3 days',
  'دفعة عند الاستلام'
);

-- ─── فاتورة بيع 9 - نقدي ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00009',
  NULL,
  NOW() - INTERVAL '2 days',
  1580, 0, 1580, 0, 'CASH', 'بيع نقدي',
  NOW(), NOW()
);

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00009'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('JK-004', 'M',  'أسود',  600, 1),
  ('PT-003', '32', 'بيج',   440, 1),
  ('HO-002', 'L',  'نيفي',  550, 1)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;

-- ─── فاتورة بيع 10 - نقدي اليوم ───
INSERT INTO sales_invoices
  (invoice_no, customer_id, invoice_date, total_amount, discount, paid_amount, remaining, payment_type, notes, created_at, updated_at)
VALUES (
  'SAL-00010',
  (SELECT id FROM customers WHERE name = 'سامي عبدالرحمن'),
  NOW(),
  2280, 0, 2280, 0, 'CASH', NULL,
  NOW(), NOW()
);

INSERT INTO sales_invoice_items (invoice_id, variant_id, quantity, unit_price, total)
SELECT
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00010'),
  pv.id, v.qty, v.price, v.qty * v.price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id,
(VALUES
  ('JK-001', 'M',  'خاكي',  880, 1),
  ('PT-001', '30', 'أزرق غامق', 550, 2),
  ('TS-004', 'M',  'رمادي', 260, 1)
) AS v(model, size, color, price, qty)
WHERE p.model_number = v.model
  AND pv.size  = v.size
  AND pv.color = v.color;


-- =============================================
--         7. ADDITIONAL PAYMENTS
-- =============================================

-- دفعة إضافية على فاتورة مصنع الدلتا
INSERT INTO supplier_payments
  (supplier_id, invoice_id, amount, payment_date, notes)
VALUES (
  (SELECT id FROM suppliers WHERE name = 'مصنع الدلتا'),
  (SELECT id FROM purchase_invoices WHERE invoice_no = 'PUR-00002'),
  4000,
  NOW() - INTERVAL '10 days',
  'دفعة جزئية'
);

UPDATE purchase_invoices
SET paid_amount = paid_amount + 4000,
    remaining   = remaining   - 4000
WHERE invoice_no = 'PUR-00002';

UPDATE suppliers
SET total_debt = total_debt - 4000
WHERE name = 'مصنع الدلتا';

-- دفعة من محمود حسن
INSERT INTO customer_payments
  (customer_id, invoice_id, amount, payment_date, notes)
VALUES (
  (SELECT id FROM customers WHERE name = 'محمود حسن'),
  (SELECT id FROM sales_invoices WHERE invoice_no = 'SAL-00002'),
  780,
  NOW() - INTERVAL '10 days',
  'دفعة جزئية'
);

UPDATE sales_invoices
SET paid_amount = paid_amount + 780,
    remaining   = remaining   - 780
WHERE invoice_no = 'SAL-00002';

UPDATE customers
SET total_debt = total_debt - 780
WHERE name = 'محمود حسن';


-- =============================================
--              FINAL SUMMARY
-- =============================================
-- Products:          24 موديل
-- Variants:          200+ صنف
-- Suppliers:         5 موردين
-- Customers:         10 عملاء
-- Purchase Invoices: 4 فواتير شراء
-- Sales Invoices:    10 فواتير بيع
-- =============================================
