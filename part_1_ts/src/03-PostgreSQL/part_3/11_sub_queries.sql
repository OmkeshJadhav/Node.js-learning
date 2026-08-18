-- =================================
-- Sub Queries
        -- QUeries nested inside another SQL statement
        -- SQL run inner query first and then runs outer query
        -- Value returned by inner query can be used in outer query
-- =================================

SELECT title, status, views
FROM posts
WHERE views > (
    SELECT AVG(views) 
    FROM posts
)
ORDER BY views DESC; 