-- =============================
-- COUNT DISTINCT
        -- Count unique value
        -- Useful when joins create repeated rows
-- =============================

-- Write query: How many unique posts are connected to each tag

SELECT
    t.name AS tag_name,
    COUNT(DISTINCT p.id) AS total_unique_posts
FROM tags AS t
LEFT JOIN post_tags AS pt
    ON t.id = pt.tag_id
LEFT JOIN posts as p
    ON p.id = pt.post_id
GROUP BY t.id, t.name
ORDER BY total_unique_posts DESC;