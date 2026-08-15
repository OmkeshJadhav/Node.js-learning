INSERT INTO basics.products( name, category, price, stock, is_active, sku, description )
VALUES
    ('Laptop Stand', 'furniture', 599.00, 10, TRUE, 'FURN-STAND-001', 'Height adjustable Laptop stand with multiple angles for comfortable laptop view.');

SELECT * 
FROM basics.products
WHERE sku = 'FURN-STAND-001';