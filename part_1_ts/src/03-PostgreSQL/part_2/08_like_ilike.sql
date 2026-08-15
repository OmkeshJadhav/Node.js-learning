-- LIKE: Case sensitive pattern match
-- ILIKE: Case insensitive pattern match
-- %: Matches zero or more characters
-- _: Matches exactly one character

SELECT name, category, price, description, stock, is_active FROM basics.products;

-- Match Chair 
-- NOT MATCH 'chair', 'CHAIR'
SELECT name, category, price
FROM basics.products
WHERE name LIKE '%Chair%';

-- Can match Support, SUPPORT, support, SuPpOrT
SELECT name, category, price
FROM basics.products
WHERE name ILIKE '%support%';

-- Find products where either the name OR description contains "note", regardless of case.
SELECT name, category, price, description
FROM basics.products
WHERE name ILIKE '%note%' OR description ILIKE '%note%';

-- Match: Phones, Phone1, PhoneX
-- NOT MATCH: Phone, Phone12
SELECT name
FROM basics.products
WHERE name LIKE 'Phone_';

-- Match: Chair
-- Not Match: Cair, Cchair
SELECT name
FROM basics.products
WHERE name LIKE 'C_air';

-- % vs _
-- 'Chair%': Chair, Chair1, Chairs, Chair123
-- 'Chair_': Chairs, Chair1, ChairX 
        -- Will not match: Chair, Chair123