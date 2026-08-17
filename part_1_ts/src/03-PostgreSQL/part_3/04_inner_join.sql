-- ===============================================
-- INNER JOIN
    -- INNER JOIN returns only rows where a matching record exists in BOTH tables.
-- ===============================================


SELECT 
    posts.title AS posts_title,
    users.name AS author_name
FROM posts
INNER JOIN users  -- INNER is optional. You can just write JOIN users
    ON posts.user_id = users.id;  -- matching condition