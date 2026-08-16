

SELECT name category, price, stock, is_active, sku
FROM basics.products
WHERE sku = 'STAT-TEMP-001';

DELETE FROM basics.products
WHERE sku = 'STAT-TEMP-001';

SELECT name category, price, stock, is_active, sku
FROM basics.products
WHERE sku = 'STAT-TEMP-001';