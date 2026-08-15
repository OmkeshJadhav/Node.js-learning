-- PRIMARY KEY: Uniquely identifies each row in a table
-- Without PRIMARY KEY it becomes harder to update, delete, do any kind of reference to the row

DROP TABLE IF EXISTS basics.accounts;

CREATE TABLE basics.accounts(
    -- id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO basics.accounts(title, price)
VALUES
    ('Item 1', 100.00),
    ('Item 2', 299.99);

INSERT INTO basics.accounts(id, title, price)
VALUES
    (1, 'Item 1', 100.00);  -- duplicate key value violates unique constraint "accounts_pkey"

SELECT * FROM basics.accounts;