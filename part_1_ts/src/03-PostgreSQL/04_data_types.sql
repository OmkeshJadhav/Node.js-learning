
CREATE TABLE IF NOT EXISTS basics.producat_basics(
    id SERIAL PRIMARY KEY, 

    -- VARCHAR: String of max length of 100 characters
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 0,

    -- BIGINT: To store large whole number
    total_views BIGINT DEFAULT 0,

    -- NUMERIC: 1st Number indicates total Digits and 2nd number iundicates digits after decimal point
    price NUMERIC(10, 2),

    -- BOOLEAN: true or false
    is_active BOOLEAN DEFAULT true
);

INSERT INTO basics.producat_basics(name, description, stock, total_views, price, is_active)
VALUES
    (
        'PRODUCT 3',
        'Description for Product 1',
        100,
        1200,
        555.55,
        true
    ),
    (
        'PRODUCT 4',
        'Description for product 2',
        500,
        50000,
        11111111.11,
        false
    );

SELECT * FROM basics.producat_basics;

SELECT id, name, stock, price
FROM basics.producat_basics
WHERE price>=1000 AND total_views>1500;