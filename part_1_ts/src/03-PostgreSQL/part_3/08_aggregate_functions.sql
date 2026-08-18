-- =========================
-- AGGREGATE FUNCTIONS: Calculate one result from many rows

        -- COUNT() - Number of rows
        -- SUM() - Total value
        -- AVG() - Average value
        -- MIN() - Smallest value
        -- MAX() - Largest values      
-- =========================

SELECT
    COUNT(*) AS total_posts,
    COUNT(*) FILTER(WHERE status = 'published') AS total_published_posts,
    SUM(views) AS total_views,
    AVG(views) AS average_views,
    MIN(views) AS min_views,
    MAX(views) AS max_views
FROM posts;