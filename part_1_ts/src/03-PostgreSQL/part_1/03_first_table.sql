-- CREATE TABLE
CREATE TABLE IF NOT EXISTS basics.students(

    -- id: Create an auto incrementing integer + Primary key means this column uniquely identifies each row
    id SERIAL PRIMARY KEY,

    -- name: TEXT means string data + NOT NULL means this column is required and PostgreSQL will reject it if the value is not present
    name TEXT NOT NULL,

    -- email: UNIQUE means no 2 entries can have the same value
    email TEXT NOT NULL UNIQUE,

    -- age: INTEGER means number + CHECK checks if value satisfies the criteria
    age INTEGER CHECK(age >= 18),

    -- created_at: TIMESTAMP stores data in date and time format + DEFAULT means if no value is provided then the default value will be assigned
    created_at TIMESTAMP DEFAULT NOW()
);


-- INSERT DATA IN THE TABLE
INSERT INTO basics.students (name, email, age)
VALUES
    ('Omkesh', 'omkesh@gmail.com', 32),
    ('Dipti', 'dipti@gmail.com', 31);

-- VIEW DATA FROM TABLE
SELECT * FROM basics.students;