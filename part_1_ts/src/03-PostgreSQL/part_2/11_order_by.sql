
SELECT name, category, price
FROM basics.products
ORDER BY price DESC;

SELECT name, category, price
FROM basics.products
ORDER BY price ASC;

SELECT name, category, price
FROM basics.products
ORDER BY category DESC, price ASC;

-- =======================================
-- ORDER BY category DESC, price ASC
--              ↑               ↑
--          primary sort   secondary sort

-- Sort all products by category in descending order. If a category has multiple products, sort those products by price in ascending order.
-- =======================================