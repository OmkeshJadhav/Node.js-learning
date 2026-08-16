-- LIMIT: How many rows you want to return
-- OFFSET: How many rows you want to skip

SELECT name, category, price
FROM basics.products
ORDER BY price ASC
LIMIT 5;

SELECT name, category, price
FROM basics.products
ORDER BY price ASC
LIMIT 5 OFFSET 5;

SELECT name, category, price
FROM basics.products
ORDER BY price ASC
LIMIT 5 OFFSET 10;

-- In actual project query: 
-- OFFSET (page - 1) * LIMIT