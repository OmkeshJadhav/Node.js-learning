INSERT INTO basics.products(name, category, price, stock, is_active, sku, description)
VALUES
    ('Diary', 'stationery', 299.00, 500, TRUE, 'STAT-NOT-002', 'Diary for jotting down meeting notes.'),
    ('Old Mobile', 'electronics', 14999.99, 10, TRUE, 'ELEC-MOB-001', 'Mobiles for testing app development.'),
    ('Back Support Cushions', 'furniture', 499.00, 50, TRUE, 'FURN-CUS-001', 'Cushions to add to chairs for back support.');

SELECT * 
FROM basics.products
WHERE sku IN('STAT-NOT-002', 'ELEC-MOB-001', 'FURN-CUS-001');