-- NOT NULL, UNIQUE, CHECK, DEFAULT
-- These constraints are for validations at database level

DROP TABLE IF EXISTS basics.accounts;

CREATE TABLE basics.accounts(
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER CHECK(age>=18),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO basics.accounts(full_name, email, age)
VALUES
    ('Omkesh Jadhav', 'omkesh@gmail.com', 32),
    ('Dipti Jadhav', 'dipti@gmail.com', 31),
    ('', 'emptyString@gmail.com', 18),

    -- NOT NULL constraints violation
    (null, 'null@gmail.com', 20),

    -- UNIQUE constraints violation
    ('Duplicate Email', 'omkesh@gmail.com', 40),

    -- Age constraints violation
    ('Advait Jadhav', 'advait@gmail.com', 8);

SELECT * from basics.accounts;
