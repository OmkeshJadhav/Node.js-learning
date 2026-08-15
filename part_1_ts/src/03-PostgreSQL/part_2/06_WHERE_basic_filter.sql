SELECT name, category, price, stock, is_active, sku, is_necessary
FROM basics.products
WHERE category = 'electronics';

SELECT name, category, price, stock, is_active, sku, is_necessary
FROM basics.products
WHERE price >= 1300 AND category = 'electronics';

SELECT name, category, price, stock, is_active, sku, is_necessary
FROM basics.products
WHERE is_active = FALSE;