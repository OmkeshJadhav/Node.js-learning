-- ============================================================
-- MANY-TO-MANY JOIN
    -- One Post can have multiple tags
    -- One tag can belong to many posts
-- ============================================================

SELECT 
    posts.title AS post_title,
    tags.name AS tag_name
FROM posts
INNER JOIN post_tags
    ON posts.id = post_tags.post_id
INNER JOIN tags
    ON tags.id = post_tags.tag_id
ORDER BY posts.title, tags.name;