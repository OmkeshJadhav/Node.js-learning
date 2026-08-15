ALTER TABLE basics.products
ADD COLUMN is_necessary BOOLEAN;

INSERT INTO basics.products( name, category, price, stock, is_active, sku, description, is_necessary )
VALUES
    ('Coffee Mug', 'furniture', 199.00, 50, TRUE, 'FURN-MUG-001', 'Coffee Mug for employees.', FALSE);

SELECT * 
FROM basics.products
WHERE is_necessary = FALSE


-- ============================================================
-- ADDING A MANDATORY COLUMN TO A TABLE WITH EXISTING DATA
-- ============================================================

-- CASE 1: New column has a sensible default value
-- ============================================================
    -- Just add Default value to the column to be added
        ALTER TABLE basics.products
        ADD COLUMN is_necessary BOOLEAN NOT NULL DEFAULT TRUE;
        -- Existing rows will get TRUE.
        -- Future INSERTs will also use TRUE when is_necessary isn't provided.

-- ============================================================
-- CASE 2: New column DOES NOT have a sensible default value
-- ============================================================
    -- We cannot directly add a NOT NULL column because existing
    -- rows don't have a value for the new column.

    -- 4 Step approach: 
    -- Step 1: Add the column allowing NULL temporarily
        ALTER TABLE basics.users
        ADD COLUMN phone_number TEXT;


    -- Step 2: Populate existing rows with actual data
    -- Data should come from existing data or through a data migration.
        UPDATE basics.users
        SET phone_number = '9876543210'
        WHERE id = 'sdcfdsjhb';


    -- Step 3: Verify that no NULL values remain
        SELECT COUNT(*)
        FROM basics.users
        WHERE phone_number IS NULL;


    -- Step 4: Add NOT NULL constraint
    -- Only do this when the above query returns 0.
        ALTER TABLE basics.users
        ALTER COLUMN phone_number
        SET NOT NULL;

-- ============================================================
-- REMOVE NOT NULL CONSTRAINT
-- ============================================================
        ALTER TABLE basics.users
        ALTER COLUMN phone_number
        DROP NOT NULL;

-- ============================================================
-- REMOVE DEFAULT
-- ============================================================
        ALTER TABLE basics.products
        ALTER COLUMN is_necessary
        DROP DEFAULT;

    -- New mandatory column
    --    │
    --    ├── Has sensible default?
    --    │        │
    --    │       YES
    --    │        ↓
    --    │   ADD COLUMN ... NOT NULL DEFAULT ...
    --    │
    --    └── NO
    --         ↓
    --    ADD COLUMN (nullable)
    --         ↓
    --    Populate existing rows
    --         ↓
    --    Verify no NULLs
    --         ↓
    --    SET NOT NULL


-- ============================
-- When to use "" and ''
-- ============================
    -- 'text': string literal
    -- "text": identifier (column/table name)