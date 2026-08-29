
CREATE TABLE support_tasks(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(150) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        check (status IN('OPEN', 'IN PROGRESS', 'RESOLVED')),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        -- ON DELETE CASCADE: If a row in the parent table (users) is deleted, all related rows in the child table that reference that user are automatically deleted.

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);