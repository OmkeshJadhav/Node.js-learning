-- ========================================
-- INDEX
    -- Helps postgres to find rows faster without checking every row
    -- It speed up query reading process
-- ========================================

SELECT
    id,
    title,
    status,
    views,
    user_id
FROM posts;


SELECT
    id,
    title,
    status
FROM posts
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_status  -- idx: Index, posts: table, status: column
ON posts(status);



-- Composite Index
SELECT
    title,
    status,
    views
FROM posts
WHERE status = 'published'
ORDER BY views DESC;

CREATE INDEX IF NOT EXISTS idx_posts_status_views
ON posts (status, views DESC);

-- Indexes on Foreign Key
SELECT 
    title,
    status,
    views
FROM posts
WHERE user_id = (
    SELECT id
    FROM users
    WHERE name = 'Ananyaa'
);

Create INDEX IF NOT EXISTS idx_posts_user_id
ON posts(user_id)
