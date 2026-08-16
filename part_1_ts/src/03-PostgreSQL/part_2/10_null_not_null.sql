-- NULL: Missing or unknown value
    -- To check NULL value use IS NULL instead of = NULL
-- NOT NULL: Where value is available

SELECT name, description
FROM basics.products
WHERE description IS NULL;

SELECT name, description
FROM basics.products
WHERE description IS NOT NULL;

SELECT name, description, is_active, description
FROM basics.products
WHERE (is_active = FALSE) AND (description IS NOT NULL);