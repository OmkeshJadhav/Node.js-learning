-- ===============================
-- LEFT JOIN
    -- Left join keeps all rows from the left table
    -- If the right table has matching row, then postgres includes that
    -- If right table does not have any matching row then the right-side columns contain NULL.

-- "Which table do I want to preserve?" - The table to be preserved should always be left table
-- ===============================

SELECT 
    posts.title AS post_title,
    posts.status AS post_status,
    posts.views,
    comments.body
FROM posts   -- left table
LEFT JOIN comments  -- right table
    ON comments.post_id = posts.id;


-- ============================================================
-- LEFT JOIN: Find records with NO match
-- ============================================================

-- Find posts that don't have any comments.

SELECT
    posts.title
FROM posts
LEFT JOIN comments
    ON comments.post_id = posts.id
WHERE comments.id IS NULL;


-- ============================================================
-- MANY-TO-MANY JOIN
-- ============================================================

SELECT
    posts.title,
    tags.name AS tag
FROM posts
JOIN post_tags
    ON post_tags.post_id = posts.id
JOIN tags
    ON tags.id = post_tags.tag_id;