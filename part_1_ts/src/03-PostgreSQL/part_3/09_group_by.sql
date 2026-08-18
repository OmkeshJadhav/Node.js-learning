-- =============================
-- GROUP BY
    -- WHERE: Filters normal rows before grouping
    -- HVAING: Filters groups after grouping
-- =============================


SELECT 
    u.name AS author_name,
    COUNT(p.id) AS total_posts,
    SUM(p.views) AS total_views
FROM users AS u
LEFT JOIN posts AS p
    ON u.id = p.user_id
GROUP BY u.id, u.name;

SELECT 
    u.name AS author_name,
    COUNT(p.id) AS total_posts,
    SUM(p.views) AS total_views
FROM users AS u
LEFT JOIN posts AS p
    ON u.id = p.user_id
GROUP BY u.id, u.name
HAVING COUNT(p.id) >= 2;