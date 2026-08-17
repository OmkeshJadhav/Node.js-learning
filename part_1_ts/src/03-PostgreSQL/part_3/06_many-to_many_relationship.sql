-- ============================================================
-- MANY-TO-MANY JOIN
    -- One Post can have multiple tags
    -- One tag can belong to many posts
-- ============================================================

-- SELECT 
--     posts.title AS post_title,
--     tags.name AS tag_name
-- FROM posts
-- INNER JOIN post_tags
--     ON posts.id = post_tags.post_id
-- INNER JOIN tags
--     ON tags.id = post_tags.tag_id
-- ORDER BY posts.title, tags.name;



SELECT
    posts.title AS post_title,
    post_author.name AS post_author,
    tags.name AS tag_name,
    comments.body AS comment,
    comment_author.name AS comment_author

FROM posts

INNER JOIN users AS post_author
    ON posts.user_id = post_author.id

INNER JOIN post_tags
    ON posts.id = post_tags.post_id

INNER JOIN tags
    ON tags.id = post_tags.tag_id

INNER JOIN comments
    ON comments.post_id = posts.id

INNER JOIN users AS comment_author
    ON comments.user_id = comment_author.id

ORDER BY posts.title, tags.name;