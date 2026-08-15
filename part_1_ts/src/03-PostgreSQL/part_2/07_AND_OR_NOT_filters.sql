-- AND: Every condition should be true
-- SELECT name, category, price
-- FROM basics.products
-- WHERE (category = 'electronics' AND price > 1000);

-- OR: At least one condition should be true
-- SELECT name, category, price
-- FROM basics.products
-- WHERE (category = 'electronics' OR category = 'furniture');

-- NOT: Exclude a condition
-- SELECT name, category, price
-- FROM basics.products
-- WHERE (NOT category = 'electronics');

-- Mix of NOT & AND
-- SELECT name, category, price
-- FROM basics.products
-- WHERE (NOT category = 'electronics') AND (NOT category = 'furniture');

-- Mix of AND & OR
-- SELECT name, category, price, stock
-- FROM basics.products
-- WHERE (category = 'electronics' OR category = 'furniture')
--         AND stock > 0;

-- Mix of AND & OR
SELECT name, category, price, stock, is_active
FROM basics.products
WHERE is_active = TRUE
        AND (category = 'electronics' OR category = 'furniture' )
        AND price > 1000;