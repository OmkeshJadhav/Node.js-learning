-- RETURNING: Return back the rows imnmediately after insert, update or delete

-- RETURNING after INSERT
INSERT INTO basics.products(name, price, category, stock, is_active, sku, description)
VALUES
    ('Webcam', 2999, 'electronics', 10, TRUE, 'ELEC-WEBC-001', '')
RETURNING id, name, price, category, stock, created_at;

-- RETURNING after UPDATE
UPDATE basics.products
SET price = 999
WHERE sku = 'ELEC-WEBC-001'
RETURNING id, name, price, category, stock, created_at;

-- RETURNING after DELETE
DELETE FROM basics.products
WHERE sku = 'ELEC-WEBC-001'
RETURNING id, name, price, category, stock, created_at;

SELECT * FROM basics.products
WHERE sku = 'ELEC-WEBC-001'