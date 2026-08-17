-- ============================================================
-- RESET TABLES
-- ============================================================

-- Drop dependent tables first because they have foreign keys - when resetting the database, you generally go from the most dependent table to the least dependent table
-- referencing other tables.

DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);


-- ============================================================
-- POSTS
-- ============================================================

CREATE TABLE posts(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published')),
    views INTEGER NOT NULL DEFAULT 0
        CHECK (views >= 0)
);


-- ============================================================
-- COMMENTS
-- ============================================================

CREATE TABLE comments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id),
    user_id UUID REFERENCES users(id),
    body VARCHAR(100) NOT NULL
);


-- ============================================================
-- TAGS
-- ============================================================

CREATE TABLE tags(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);


-- ============================================================
-- POST_TAGS
-- ============================================================

CREATE TABLE post_tags(
    post_id UUID NOT NULL REFERENCES posts(id),
    tag_id UUID NOT NULL REFERENCES tags(id),

    PRIMARY KEY (post_id, tag_id)
);


-- ============================================================
-- INSERT USERS
-- ============================================================

INSERT INTO users (name)
VALUES
    ('Ananya'),
    ('Rahul');


-- ============================================================
-- INSERT POSTS
-- ============================================================

INSERT INTO posts (user_id, title, status, views)
SELECT id, 'PostgreSQL Joins Explained', 'published', 100
FROM users
WHERE name = 'Ananya';


INSERT INTO posts (user_id, title, status, views)
SELECT id, 'Indexes for Beginners', 'draft', 40
FROM users
WHERE name = 'Ananya';


INSERT INTO posts (user_id, title, status, views)
SELECT id, 'Backend APIs with PostgreSQL', 'published', 180
FROM users
WHERE name = 'Rahul';


-- ============================================================
-- INSERT COMMENTS
-- ============================================================

INSERT INTO comments (post_id, body)
SELECT id, 'Very clear explanation.'
FROM posts
WHERE title = 'PostgreSQL Joins Explained';


INSERT INTO comments (post_id, body)
SELECT id, 'Please add more examples.'
FROM posts
WHERE title = 'Backend APIs with PostgreSQL';


-- ============================================================
-- INSERT TAGS
-- ============================================================

INSERT INTO tags (name)
VALUES
    ('sql'),
    ('backend');


-- ============================================================
-- INSERT POST-TAGS
-- ============================================================

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.title = 'PostgreSQL Joins Explained'
  AND t.name = 'sql';


INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.title = 'Indexes for Beginners'
  AND t.name = 'sql';


INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t
WHERE p.title = 'Backend APIs with PostgreSQL'
  AND t.name = 'backend';


-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

SELECT 'Part 3 reduced database reset and sample data inserted successfully.' AS message;