-- Single row: Identify the row and then update the value

SELECT name, category, price, sku
FROM basics.products
WHERE sku = 'ELEC-MOU-001';

UPDATE basics.products
SET price = 999
WHERE sku = 'ELEC-MOU-001';

SELECT name, category, price, sku
FROM basics.products
WHERE sku = 'ELEC-MOU-001';


-- Multiple rows: Identify the column where update is to be done and then apply the update to the whole column
-- Example: Increase prices of products in stationary category by 10%
SELECT name, category, price, sku
FROM basics.products
WHERE category = 'stationery';

UPDATE basics.products
SET price = ROUND(price*1.10, 2)
WHERE category = 'stationery';

SELECT name, category, price, sku
FROM basics.products
WHERE category = 'stationery';


-- Example: Mark all the products as active where stock is 0
SELECT name, category, price, stock, is_active, sku
FROM basics.products
WHERE stock = 0;

UPDATE basics.products
SET is_active = TRUE
WHERE stock = 0;

SELECT name, category, price, stock, is_active, sku
FROM basics.products
WHERE stock = 0;