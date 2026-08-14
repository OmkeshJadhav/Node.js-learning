
CREATE TABLE IF NOT EXISTS basics.students(

    --id: Create an auto incrementing integer + Primary key means this column uniquely identifies each row
    id SERIAL PRIMARY KEY,
    
    --name: TEXT means string data + NOT NULL means this column is required and postgre going to reject it if the value is not present
    name TEXT NOT NULL,
    
    --email: UNIQUE means no 2 entries can have same value
    email TEXT NOT NULL UNIQUE,

    -- age: INTEGER means number + CHECK checks if value satisifies the criteria
    age INTEGER CHECK(age >=18),

    -- created_at: TIMESTAMP stores data in date and time format + DEFAULT means if no value is provided then the default value will be assigned
    created_at TIMESTAMP DEFAULT NOW()
)