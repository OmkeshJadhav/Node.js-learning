-- ============================
-- FOREIGN KEYS
    -- Foreign Key is a column that points to the primary key of anopther table.
    -- e.g. user_id of posts table is pointing to id of users table. Here, user_id of posts table is Foreign Key and id of user table is primary key.
    -- Also, posts table is a child table here.
-- ============================

SELECT id, name
FROM users;

SELECT id, user_id, title
FROM posts;
