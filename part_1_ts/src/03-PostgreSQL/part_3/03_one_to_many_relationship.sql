-- ==========================
-- ONE TO MANY RELATIONSHIP
    -- One parent row can have multiple child rows but a child row can have only single parent.
    -- e.g. One user can write many posts but one post belongs to only one author

    -- Posts - Child table
    -- users - Parent table
-- ==========================

SELECT 
    users.name AS post_author,
    posts.title AS post_title,
    posts.status AS post_status
FROM users
INNER JOIN posts
    ON users.id = posts.user_id   -- matching condition
ORDER BY users.name, posts.title DESC;
