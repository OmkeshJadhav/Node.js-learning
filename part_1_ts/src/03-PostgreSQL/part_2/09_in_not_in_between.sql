-- IN: Value must match one item from the list
-- NOT IN: Value must not match any items from the list
-- BETWEEN: Value must be between/inside a range

SELECT name, category, price
FROM basics.products
WHERE category IN ('electronics', 'furniture');

SELECT name, category, price
FROM basics.products
WHERE category NOT IN ('electronics', 'furniture');

SELECT name, category, price
FROM basics.products
WHERE price BETWEEN 399 AND 2000;
    -- includes intial and final value i.e. includes 399 & 2000


SELECT name, category, price
FROM basics.products
WHERE (category NOT IN ('electronics'))
    AND (price BETWEEN 100 AND 500);