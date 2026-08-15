-- *: To select all columns
SELECT * 
FROM basics.products;

-- Specify column name: To select only specific columns
SELECT name, category, price, stock, sku
FROM basics.products;

-- Aliases: AS creates an alias for output of the specified column to make the column name easier to read/understand
SELECT
    name AS product_name,
    category AS product_category,
    price AS product_price
FROM basics.products;